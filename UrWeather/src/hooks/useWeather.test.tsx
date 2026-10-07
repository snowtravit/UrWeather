import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWeather, type WeatherData } from '../api/openMeteo';
import { getCachedWeather } from '../store/cache';
import { deferred, weatherFixture } from '../test/weatherFixture';
import { useWeather } from './useWeather';

vi.mock('../api/openMeteo', async (importOriginal) => ({
  ...await importOriginal<typeof import('../api/openMeteo')>(),
  fetchWeather: vi.fn(),
}));
vi.mock('../store/cache', () => ({
  getCachedWeather: vi.fn(() => null),
  setCachedWeather: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(fetchWeather).mockReset();
  vi.mocked(getCachedWeather).mockReturnValue(null);
  Object.defineProperty(navigator, 'geolocation', { configurable: true, value: undefined });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('weather request recovery', () => {
  it('ends loading on initial failure and retries the failed location', async () => {
    const data = weatherFixture();
    vi.mocked(fetchWeather)
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValueOnce(data);
    const { result } = renderHook(() => useWeather());

    await waitFor(() => expect(result.current.error).toBe('Offline'));
    expect(result.current.loading).toBe(false);
    expect(result.current.weather).toBeNull();

    await act(async () => { await result.current.retry(); });

    expect(fetchWeather).toHaveBeenNthCalledWith(2, 52.52, 13.41);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.weather).toEqual(data);
  });

  it('keeps the last forecast after a failed city change and retries the new city', async () => {
    vi.mocked(fetchWeather)
      .mockResolvedValueOnce(weatherFixture())
      .mockRejectedValueOnce(new Error('Service unavailable'))
      .mockResolvedValueOnce(weatherFixture(25));
    const { result } = renderHook(() => useWeather());
    await waitFor(() => expect(result.current.location?.city).toBe('Berlin'));

    await act(async () => {
      await result.current.loadWeatherForLocation(48.85, 2.35, 'Paris');
    });
    expect(result.current.error).toBe('Service unavailable');
    expect(result.current.location?.city).toBe('Berlin');
    expect(result.current.weather?.current.temperature_2m).toBe(20);

    await act(async () => { await result.current.retry(); });
    expect(fetchWeather).toHaveBeenNthCalledWith(3, 48.85, 2.35);
    expect(result.current.location?.city).toBe('Paris');
    expect(result.current.weather?.current.temperature_2m).toBe(25);
    expect(result.current.error).toBeNull();
  });
});

describe('overlapping weather requests', () => {
  it('does not end loading when an older request finishes first', async () => {
    const berlin = deferred<WeatherData>();
    const paris = deferred<WeatherData>();
    vi.mocked(fetchWeather)
      .mockReturnValueOnce(berlin.promise)
      .mockReturnValueOnce(paris.promise);
    const { result } = renderHook(() => useWeather());
    act(() => { void result.current.loadWeatherForLocation(48.85, 2.35, 'Paris'); });

    await act(async () => { berlin.resolve(weatherFixture()); });
    expect(result.current.loading).toBe(true);
    expect(result.current.weather).toBeNull();

    await act(async () => { paris.resolve(weatherFixture(25, 61)); });
    expect(result.current.loading).toBe(false);
    expect(result.current.location?.city).toBe('Paris');
    expect(result.current.scene).toBe('rain');
  });

  it('does not replace a newer forecast with a late Berlin response', async () => {
    const berlin = deferred<WeatherData>();
    vi.mocked(fetchWeather)
      .mockReturnValueOnce(berlin.promise)
      .mockResolvedValueOnce(weatherFixture(25, 61));
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.loadWeatherForLocation(48.85, 2.35, 'Paris');
    });
    await act(async () => { berlin.resolve(weatherFixture()); });

    expect(result.current.location?.city).toBe('Paris');
    expect(result.current.weather?.current.temperature_2m).toBe(25);
    expect(result.current.scene).toBe('rain');
  });

  it('ignores a stale failure after a newer request succeeds', async () => {
    const berlin = deferred<WeatherData>();
    vi.mocked(fetchWeather)
      .mockReturnValueOnce(berlin.promise)
      .mockResolvedValueOnce(weatherFixture(25));
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.loadWeatherForLocation(48.85, 2.35, 'Paris');
    });
    await act(async () => { berlin.reject(new Error('Offline')); });

    expect(result.current.location?.city).toBe('Paris');
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('does not let delayed reverse geocoding replace a manual city selection', async () => {
    let detectLocation!: PositionCallback;
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success: PositionCallback) => { detectLocation = success; }),
      },
    });
    const reverse = deferred<Response>();
    const reverseFetch = vi.fn(() => reverse.promise);
    vi.stubGlobal('fetch', reverseFetch);
    vi.mocked(fetchWeather).mockResolvedValue(weatherFixture());
    const { result } = renderHook(() => useWeather());
    await waitFor(() => expect(result.current.location?.city).toBe('Berlin'));

    await act(async () => {
      detectLocation({ coords: { latitude: 55.75, longitude: 37.62 } } as GeolocationPosition);
    });
    expect(reverseFetch).toHaveBeenCalledOnce();

    await act(async () => {
      await result.current.loadWeatherForLocation(48.85, 2.35, 'Paris');
      reverse.resolve({ ok: true, json: async () => ({ address: { city: 'Moscow' } }) } as Response);
    });

    expect(fetchWeather).toHaveBeenCalledTimes(2);
    expect(result.current.location?.city).toBe('Paris');
  });
});
