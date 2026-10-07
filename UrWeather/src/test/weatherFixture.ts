import type { WeatherData } from '../api/openMeteo';

export function weatherFixture(temperature = 20, weathercode = 0): WeatherData {
  return {
    latitude: 52.52,
    longitude: 13.41,
    current: {
      temperature_2m: temperature,
      weathercode,
      windspeed_10m: 5,
      winddirection_10m: 180,
      apparent_temperature: temperature,
      precipitation: 0,
      relative_humidity_2m: 50,
      visibility: 10000,
      uv_index: 1,
      is_day: 1,
      time: '2026-10-07T12:00',
    },
    hourly: {
      time: ['2026-10-07T12:00'],
      temperature_2m: [temperature],
      weathercode: [weathercode],
      precipitation_probability: [0],
      precipitation: [0],
      windspeed_10m: [5],
    },
    daily: {
      time: ['2026-10-07'],
      weathercode: [weathercode],
      temperature_2m_max: [temperature],
      temperature_2m_min: [10],
      precipitation_probability_max: [0],
      windspeed_10m_max: [5],
      sunrise: ['2026-10-07T07:00'],
      sunset: ['2026-10-07T18:00'],
    },
  };
}

export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
