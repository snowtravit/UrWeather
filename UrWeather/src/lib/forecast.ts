import type { HourlyForecast } from '../api/openMeteo';

export function getHourlyForecast(hourly: HourlyForecast, currentTime: string, selectedDate: string, isToday: boolean) {
  let startIndex: number;
  if (isToday) {
    const nextHour = hourly.time.findIndex(time => time > currentTime);
    if (nextHour < 0 && hourly.time.length > 0
        && Date.parse(`${currentTime}Z`) - Date.parse(`${hourly.time.at(-1)}Z`) >= 60 * 60 * 1000) return [];
    startIndex = nextHour < 0 ? hourly.time.length - 1 : Math.max(0, nextHour - 1);
  } else {
    startIndex = hourly.time.findIndex(time => time.startsWith(selectedDate));
  }
  if (startIndex < 0) return [];

  return hourly.time.slice(startIndex, startIndex + 24).map((time, i) => ({
    time: new Date(time),
    temp: hourly.temperature_2m[startIndex + i],
    code: hourly.weathercode[startIndex + i],
    precip: hourly.precipitation_probability[startIndex + i],
  }));
}

export function forecastDate(date: string) {
  return new Date(`${date}T12:00:00`);
}
