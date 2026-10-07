import type { ComponentProps } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWeather, type CurrentWeather, type WeatherData } from '../api/openMeteo';
import { searchCity } from '../api/geolocation';
import { LanguageProvider } from '../i18n/LanguageContext';
import { deferred, weatherFixture } from '../test/weatherFixture';
import Dashboard from './Dashboard';

vi.mock('../api/openMeteo', async (importOriginal) => ({
  ...await importOriginal<typeof import('../api/openMeteo')>(),
  fetchWeather: vi.fn(),
}));
vi.mock('../api/geolocation', () => ({ searchCity: vi.fn() }));
vi.mock('../store/cache', () => ({
  getCachedWeather: vi.fn(() => null),
  setCachedWeather: vi.fn(),
}));
// Rendering animation and charts is separate from request-state behavior.
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: ComponentProps<'div'>) => children,
  motion: {
    div: ({ initial, animate, exit, ...props }: ComponentProps<'div'> & {
      initial?: unknown; animate?: unknown; exit?: unknown;
    }) => <div {...props} />,
  },
}));
vi.mock('../components/WeatherScene/WeatherScene', () => ({ WeatherScene: () => null }));
vi.mock('../components/WeatherCard/WeatherCard', () => ({
  WeatherCard: ({ cityName, current }: { cityName: string; current: CurrentWeather }) =>
    <div>{cityName}: {current.temperature_2m}°</div>,
}));
vi.mock('../components/HourlyForecast/HourlyForecast', () => ({ HourlyForecast: () => null }));
vi.mock('../components/DailyForecast/DailyForecast', () => ({ DailyForecast: () => null }));
vi.mock('../components/WeatherStats/WeatherStats', () => ({ WeatherStats: () => null }));

beforeEach(() => {
  localStorage.clear();
  vi.mocked(fetchWeather).mockReset();
  vi.mocked(searchCity).mockReset();
  Object.defineProperty(navigator, 'geolocation', { configurable: true, value: undefined });
});

afterEach(cleanup);

describe('Dashboard recovery controls', () => {
  it('keeps search and language controls available during the first request', () => {
    vi.mocked(fetchWeather).mockReturnValue(deferred<WeatherData>().promise);
    render(<LanguageProvider><Dashboard /></LanguageProvider>);

    expect(screen.getByRole('status').textContent).toContain('Detecting atmosphere');
    expect(screen.getByRole('textbox', { name: 'Search for a city...' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'RU' })).toBeTruthy();
  });

  it('replaces the initial spinner with an error and recovers through retry', async () => {
    vi.mocked(fetchWeather)
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValueOnce(weatherFixture());
    render(<LanguageProvider><Dashboard /></LanguageProvider>);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Unable to load weather');
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('textbox', { name: 'Search for a city...' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Berlin: 20°')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    expect(fetchWeather).toHaveBeenCalledTimes(2);
  });

  it('translates error and retry controls after an initial failure', async () => {
    vi.mocked(fetchWeather).mockRejectedValue(new Error('Offline'));
    render(<LanguageProvider><Dashboard /></LanguageProvider>);
    await screen.findByRole('alert');

    fireEvent.click(screen.getByRole('button', { name: 'RU' }));

    expect(screen.getByRole('alert').textContent).toContain('Не удалось загрузить погоду');
    expect(screen.getByRole('button', { name: 'Повторить' })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: 'Поиск города...' })).toBeTruthy();
  });

  it('allows selecting another city after the initial weather request fails', async () => {
    vi.mocked(fetchWeather)
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValueOnce(weatherFixture(25));
    vi.mocked(searchCity).mockResolvedValue([
      { name: 'Paris', lat: 48.85, lon: 2.35, country: 'France' },
    ]);
    render(<LanguageProvider><Dashboard /></LanguageProvider>);
    await screen.findByRole('alert');

    fireEvent.change(screen.getByRole('textbox', { name: 'Search for a city...' }), {
      target: { value: 'Paris' },
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Paris France' }));

    expect(await screen.findByText('Paris: 25°')).toBeTruthy();
    expect(fetchWeather).toHaveBeenLastCalledWith(48.85, 2.35);
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });
});
