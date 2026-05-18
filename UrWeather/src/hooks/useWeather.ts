import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWeather, WeatherData, SceneType, getWeatherScene } from '../api/openMeteo';
import { getCachedWeather, setCachedWeather } from '../store/cache';

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
  const langRef = useRef(lang);
  langRef.current = lang;

  const loadWeatherForLocation = useCallback(async (lat: number, lon: number, cityName: string) => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
      let data = getCachedWeather(cacheKey);

      if (!data) {
        data = await fetchWeather(lat, lon);
        setCachedWeather(cacheKey, data);
      }

      setWeather(data);
      setLocation({ lat, lon, city: cityName });
      setScene(getWeatherScene(data.current.weathercode));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const currentLang = langRef.current;
    const acceptLang = currentLang === 'ru' ? 'ru,en' : 'en';

    // Load Berlin immediately
    loadWeatherForLocation(BERLIN.lat, BERLIN.lon, BERLIN.city);

    // In parallel, try to get actual location (up to 5s)
    if (navigator.geolocation) {
      const timer = setTimeout(() => {/* timeout guard */}, 5000);

      Promise.race<{ lat: number; lon: number }>([
        new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            (err) => reject(err),
            { timeout: 4500, maximumAge: 60000 }
          );
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('geo timeout')), 5000)),
      ])
        .then(async (loc) => {
          clearTimeout(timer);
          if (cancelled) return;
          let city = 'My Location';
          try {
            const r = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lon}&format=json&accept-language=${acceptLang}`
            );
            if (r.ok) {
              const d = await r.json();
              city = d.address?.city || d.address?.town || d.address?.village || 'My Location';
            }
          } catch { /* ignore */ }
          if (!cancelled) {
            loadWeatherForLocation(loc.lat, loc.lon, city);
          }
        })
        .catch(() => {
          clearTimeout(timer);
        });
    }

    return () => { cancelled = true; };
  }, [loadWeatherForLocation]);

  return { weather, loading, error, location, scene, loadWeatherForLocation };
}
