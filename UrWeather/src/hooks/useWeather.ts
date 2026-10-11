import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWeather, WeatherData, SceneType, getWeatherScene } from '../api/openMeteo';
import { getCachedWeather, setCachedWeather } from '../store/cache';
import { reverseCity } from '../api/geolocation';

export function useRealTimeClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

export interface LocationData {
  lat: number;
  lon: number;
  city: string;
}

const BERLIN: LocationData = { lat: 52.52, lon: 13.41, city: 'Berlin' };

export function useWeather(lang = 'en') {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [scene, setScene] = useState<SceneType>('clear');
  const requestIdRef = useRef(0);
  const requestedLocationRef = useRef<LocationData>(BERLIN);
  const langRef = useRef(lang);
  langRef.current = lang;

  const loadWeatherForLocation = useCallback(async (lat: number, lon: number, cityName: string) => {
    const requestId = ++requestIdRef.current;
    requestedLocationRef.current = { lat, lon, city: cityName };
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
      let data = getCachedWeather(cacheKey);

      if (!data) {
        data = await fetchWeather(lat, lon);
        setCachedWeather(cacheKey, data);
      }

      // An older request must not replace a more recent city selection.
      if (requestId !== requestIdRef.current) return;
      setWeather(data);
      setLocation({ lat, lon, city: cityName });
      setScene(getWeatherScene(data.current.weathercode));
    } catch (e) {
      if (requestId === requestIdRef.current) {
        setError(e instanceof Error ? e.message : 'Failed to fetch weather');
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    const { lat, lon, city } = requestedLocationRef.current;
    return loadWeatherForLocation(lat, lon, city);
  }, [loadWeatherForLocation]);

  useEffect(() => {
    let cancelled = false;
    let geoTimer: ReturnType<typeof setTimeout> | undefined;

    // Load Berlin immediately
    loadWeatherForLocation(BERLIN.lat, BERLIN.lon, BERLIN.city);
    const initialRequestId = requestIdRef.current;

    // In parallel, try to get actual location (up to 5s)
    if (navigator.geolocation) {
      Promise.race<{ lat: number; lon: number }>([
        new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            (err) => reject(err),
            { timeout: 4500, maximumAge: 60000 }
          );
        }),
        new Promise<never>((_, reject) => {
          geoTimer = setTimeout(() => reject(new Error('geo timeout')), 5000);
        }),
      ])
        .then(async (loc) => {
          clearTimeout(geoTimer);
          // Automatic detection yields to a manual city selection or retry.
          if (cancelled || requestIdRef.current !== initialRequestId) return;
          let city = 'My Location';
          try {
            city = await reverseCity(loc.lat, loc.lon, langRef.current);
          } catch { /* ignore */ }
          if (!cancelled && requestIdRef.current === initialRequestId) {
            loadWeatherForLocation(loc.lat, loc.lon, city);
          }
        })
        .catch(() => {
          clearTimeout(geoTimer);
        });
    }

    return () => {
      cancelled = true;
      clearTimeout(geoTimer);
      ++requestIdRef.current;
    };
  }, [loadWeatherForLocation]);

  return { weather, loading, error, location, scene, loadWeatherForLocation, retry };
}
