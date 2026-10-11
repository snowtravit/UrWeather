import { requestJson } from './request';

export interface CurrentWeather {
  temperature_2m: number;
  weathercode: number;
  windspeed_10m: number;
  winddirection_10m: number;
  apparent_temperature: number;
  precipitation: number;
  relative_humidity_2m: number;
  visibility: number | null;
  uv_index: number | null;
  is_day: number;
  time: string;
}

export interface HourlyForecast {
  time: string[];
  temperature_2m: number[];
  weathercode: number[];
  precipitation_probability: number[];
  precipitation: number[];
  windspeed_10m: number[];
}

export interface DailyForecast {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
  windspeed_10m_max: number[];
  sunrise: string[];
  sunset: string[];
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast;
  daily: DailyForecast;
  latitude: number;
  longitude: number;
}

export function isWeatherData(value: unknown): value is WeatherData {
  if (!value || typeof value !== 'object') return false;
  const data = value as WeatherData;
  if (!data.current || typeof data.current.time !== 'string') return false;
  const currentFields = ['temperature_2m', 'weathercode', 'windspeed_10m', 'winddirection_10m',
    'apparent_temperature', 'precipitation', 'relative_humidity_2m', 'is_day'] as const;
  if (!currentFields.every(field => Number.isFinite(data.current[field]))) return false;
  if (!(['visibility', 'uv_index'] as const).every(field => data.current[field] === null || Number.isFinite(data.current[field]))) return false;
  if (!data.hourly || !data.daily) return false;
  const numericSeries = (series: unknown, length: number) =>
    Array.isArray(series) && series.length === length && series.every(Number.isFinite);
  const stringSeries = (series: unknown) =>
    Array.isArray(series) && series.length > 0 && series.every(value => typeof value === 'string');
  if (!stringSeries(data.hourly.time) || !stringSeries(data.daily.time)) return false;
  const hourlyFields = ['temperature_2m', 'weathercode', 'precipitation_probability', 'precipitation', 'windspeed_10m'] as const;
  const dailyFields = ['weathercode', 'temperature_2m_max', 'temperature_2m_min',
    'precipitation_probability_max', 'windspeed_10m_max'] as const;
  return Number.isFinite(data.latitude) && Number.isFinite(data.longitude)
    && hourlyFields.every(field => numericSeries(data.hourly[field], data.hourly.time.length))
    && dailyFields.every(field => numericSeries(data.daily[field], data.daily.time.length))
    && stringSeries(data.daily.sunrise) && data.daily.sunrise.length === data.daily.time.length
    && stringSeries(data.daily.sunset) && data.daily.sunset.length === data.daily.time.length;
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,winddirection_10m,apparent_temperature,precipitation,relative_humidity_2m,visibility,uv_index,is_day&hourly=temperature_2m,weathercode,precipitation_probability,precipitation,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,sunrise,sunset&timezone=auto&forecast_days=7`;
  const data = await requestJson(url);
  if (!isWeatherData(data)) throw new Error('Weather service returned an invalid forecast');
  return data;
}

export function getWeatherDescription(code: number): { label: string, icon: string } {
  if (code === 0) return { label: 'Clear Sky', icon: 'Sun' };
  if (code === 1) return { label: 'Mainly Clear', icon: 'Sun' };
  if (code === 2) return { label: 'Partly Cloudy', icon: 'CloudSun' };
  if (code === 3) return { label: 'Overcast', icon: 'Cloud' };
  if (code === 45 || code === 48) return { label: 'Fog', icon: 'CloudFog' };
  if (code >= 51 && code <= 55) return { label: 'Drizzle', icon: 'CloudDrizzle' };
  if (code === 56 || code === 57) return { label: 'Freezing Drizzle', icon: 'CloudDrizzle' };
  if (code >= 61 && code <= 65) return { label: 'Rain', icon: 'CloudRain' };
  if (code === 66 || code === 67) return { label: 'Freezing Rain', icon: 'CloudRain' };
  if (code >= 71 && code <= 75) return { label: 'Snow', icon: 'CloudSnow' };
  if (code === 77) return { label: 'Snow Grains', icon: 'CloudSnow' };
  if (code >= 80 && code <= 82) return { label: 'Rain Showers', icon: 'CloudRain' };
  if (code === 85 || code === 86) return { label: 'Snow Showers', icon: 'CloudSnow' };
  if (code >= 95) return { label: 'Thunderstorm', icon: 'CloudLightning' };
  return { label: 'Unknown', icon: 'Cloud' };
}

export type SceneType = 'clear' | 'cloudy' | 'rain' | 'snow' | 'fog' | 'storm' | 'drizzle';

export function getWeatherScene(code: number): SceneType {
  if (code === 0) return 'clear';
  if (code >= 1 && code <= 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 51 && code <= 55) || code === 56 || code === 57) return 'drizzle';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'storm';
  return 'clear';
}
