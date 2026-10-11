import { beforeEach, describe, expect, it } from 'vitest';
import { weatherFixture } from '../test/weatherFixture';
import { CACHE_TTL_MS, getCachedWeather } from './cache';

beforeEach(() => localStorage.clear());

describe('persisted forecast cache', () => {
  it('rejects incomplete stored weather instead of crashing the dashboard', () => {
    const key = 'invalid-shape';
    localStorage.setItem(`weather_cache_${key}`, JSON.stringify({ timestamp: Date.now(), data: { current: {} } }));
    expect(getCachedWeather(key)).toBeNull();
    expect(localStorage.getItem(`weather_cache_${key}`)).toBeNull();
  });

  it('rejects an expired or future-dated entry', () => {
    for (const [key, timestamp] of [['expired', Date.now() - CACHE_TTL_MS], ['future', Date.now() + 60000]] as const) {
      localStorage.setItem(`weather_cache_${key}`, JSON.stringify({ timestamp, data: weatherFixture() }));
      expect(getCachedWeather(key)).toBeNull();
    }
  });

  it('loads a valid recent forecast from browser storage', () => {
    const data = weatherFixture();
    localStorage.setItem('weather_cache_valid', JSON.stringify({ timestamp: Date.now(), data }));
    expect(getCachedWeather('valid')).toEqual(data);
  });
});
