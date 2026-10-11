import { afterEach, describe, expect, it, vi } from 'vitest';
import { getUserLocation, reverseCity, searchCity } from './geolocation';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('geocoding responses', () => {
  it('does not request a blank or one-letter query', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect(await searchCity('  P  ')).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps valid cities and drops results with invalid coordinates or names', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [
      { name: 'Paris', lat: '48.85', lon: '2.35', address: { country: 'France' } },
      { name: 'Wrong', lat: 'oops', lon: '2' },
      { name: 'Out of bounds', lat: '200', lon: '2' },
      { name: { malformed: true }, lat: '52', lon: '13' },
    ] }));
    expect(await searchCity('Paris')).toEqual([{ name: 'Paris', lat: 48.85, lon: 2.35, country: 'France' }]);
  });

  it('rejects a non-list search response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ error: 'Unavailable' }) }));
    await expect(searchCity('Paris')).rejects.toThrow('invalid response');
  });

  it('uses a safe fallback when reverse geocoding has no valid name', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ address: { city: { malformed: true } } }) }));
    expect(await reverseCity(52, 13)).toBe('My Location');
  });

  it('clears its fallback timer when browser geolocation is unavailable', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('navigator', { geolocation: undefined });
    await expect(getUserLocation()).rejects.toThrow('Geolocation not supported');
    expect(vi.getTimerCount()).toBe(0);
  });
});
