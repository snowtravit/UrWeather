import { afterEach, describe, expect, it, vi } from 'vitest';
import { weatherFixture } from '../test/weatherFixture';
import { fetchWeather } from './openMeteo';

afterEach(() => vi.unstubAllGlobals());

describe('weather response validation', () => {
  it('loads a complete forecast', async () => {
    const forecast = weatherFixture();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => forecast }));
    expect(await fetchWeather(52.52, 13.41)).toEqual(forecast);
  });

  it('allows unavailable derived metrics for polar locations', async () => {
    const forecast = weatherFixture();
    forecast.current.uv_index = null;
    forecast.current.visibility = null;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => forecast }));
    expect(await fetchWeather(90, 0)).toEqual(forecast);
  });

  it.each([{}, { current: { temperature_2m: 20 } }, { ...weatherFixture(), current: { ...weatherFixture().current, uv_index: 'invalid' } }])(
    'reports incomplete forecast data as an error', async forecast => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => forecast }));
      await expect(fetchWeather(52.52, 13.41)).rejects.toThrow('invalid forecast');
    }
  );
});
