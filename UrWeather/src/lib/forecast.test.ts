import { describe, expect, it } from 'vitest';
import { weatherFixture } from '../test/weatherFixture';
import { forecastDate, getHourlyForecast } from './forecast';

describe('forecast calendar and hours', () => {
  const hourly = {
    ...weatherFixture().hourly,
    time: ['2026-10-11T08:00', '2026-10-11T09:00', '2026-10-11T10:00', '2026-10-12T00:00'],
    temperature_2m: [8, 9, 10, 12],
    weathercode: [0, 0, 0, 0],
    precipitation_probability: [0, 0, 0, 0],
  };

  it('uses the current hour in the forecast city instead of the device clock', () => {
    const result = getHourlyForecast(hourly, '2026-10-11T09:15', '2026-10-11', true);
    expect(result.map(hour => hour.temp)).toEqual([9, 10, 12]);
  });

  it('selects a future day without repeating the last available hour', () => {
    const result = getHourlyForecast(hourly, '2026-10-11T09:15', '2026-10-12', false);
    expect(result.map(hour => hour.temp)).toEqual([12]);
    expect(getHourlyForecast(hourly, '2026-10-11T09:15', '2026-10-13', false)).toEqual([]);
  });

  it('does not label an expired forecast hour as Now', () => {
    const result = getHourlyForecast(hourly, '2026-10-12T01:00', '2026-10-12', true);
    expect(result).toEqual([]);
  });

  it('keeps a forecast calendar date in the local time zone', () => {
    const date = forecastDate('2026-10-11');
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getDay()]).toEqual([2026, 9, 11, 0]);
  });
});
