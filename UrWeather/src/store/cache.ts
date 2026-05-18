import { WeatherData } from "../api/openMeteo";

export const CACHE_TTL_MS = 10 * 60 * 1000;

interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();

export function getCachedWeather(key: string): WeatherData | null {
  const mem = memoryCache.get(key);
  const now = Date.now();
  if (mem && now - mem.timestamp < CACHE_TTL_MS) {
    return mem.data;
  }

  try {
    const localStr = localStorage.getItem(`weather_cache_${key}`);
    if (localStr) {
      const entry: CacheEntry = JSON.parse(localStr);
      if (now - entry.timestamp < CACHE_TTL_MS) {
        memoryCache.set(key, entry);
        return entry.data;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

export function setCachedWeather(key: string, data: WeatherData) {
  const entry: CacheEntry = { data, timestamp: Date.now() };
  memoryCache.set(key, entry);
  try {
    localStorage.setItem(`weather_cache_${key}`, JSON.stringify(entry));
  } catch {
    // ignore
  }
}
