export interface CurrentWeather {
  temperature_2m: number;
  weathercode: number;
  windspeed_10m: number;
  winddirection_10m: number;
  apparent_temperature: number;
  precipitation: number;
  relative_humidity_2m: number;
  visibility: number;
  uv_index: number;
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

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,winddirection_10m,apparent_temperature,precipitation,relative_humidity_2m,visibility,uv_index,is_day&hourly=temperature_2m,weathercode,precipitation_probability,precipitation,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,sunrise,sunset&timezone=auto&forecast_days=7`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch weather data');
  }
  const data = await res.json();

  return {
    current: {
      temperature_2m: data.current.temperature_2m,
      weathercode: data.current.weathercode,
      windspeed_10m: data.current.windspeed_10m,
      winddirection_10m: data.current.winddirection_10m,
      apparent_temperature: data.current.apparent_temperature,
      precipitation: data.current.precipitation,
      relative_humidity_2m: data.current.relative_humidity_2m,
      visibility: data.current.visibility,
      uv_index: data.current.uv_index,
      is_day: data.current.is_day,
      time: data.current.time,
    },
    hourly: {
      time: data.hourly.time,
      temperature_2m: data.hourly.temperature_2m,
      weathercode: data.hourly.weathercode,
      precipitation_probability: data.hourly.precipitation_probability,
      precipitation: data.hourly.precipitation,
      windspeed_10m: data.hourly.windspeed_10m,
    },
    daily: {
      time: data.daily.time,
      weathercode: data.daily.weathercode,
      temperature_2m_max: data.daily.temperature_2m_max,
      temperature_2m_min: data.daily.temperature_2m_min,
      precipitation_probability_max: data.daily.precipitation_probability_max,
      windspeed_10m_max: data.daily.windspeed_10m_max,
      sunrise: data.daily.sunrise,
      sunset: data.daily.sunset,
    },
    latitude: data.latitude,
    longitude: data.longitude,
  };
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
