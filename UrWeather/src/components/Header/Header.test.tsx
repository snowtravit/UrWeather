import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { searchCity } from '../../api/geolocation';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { deferred } from '../../test/weatherFixture';
import { Header } from './Header';

vi.mock('../../api/geolocation', () => ({ searchCity: vi.fn() }));

beforeEach(() => {
  localStorage.clear();
  vi.mocked(searchCity).mockReset();
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('city search requests', () => {
  it('ignores an older search response after the query changes', async () => {
    const paris = deferred<Awaited<ReturnType<typeof searchCity>>>();
    vi.mocked(searchCity)
      .mockReturnValueOnce(paris.promise)
      .mockResolvedValueOnce([{ name: 'Berlin', lat: 52.52, lon: 13.41, country: 'Germany' }]);
    render(<LanguageProvider><Header cityName="" onLocationSelect={vi.fn()} /></LanguageProvider>);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Paris' } });
    await act(async () => { vi.advanceTimersByTime(500); });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Berlin' } });
    await act(async () => { vi.advanceTimersByTime(500); });
    expect(screen.getByRole('button', { name: 'Berlin Germany' })).toBeTruthy();

    await act(async () => {
      paris.resolve([{ name: 'Paris', lat: 48.85, lon: 2.35, country: 'France' }]);
    });

    expect(screen.queryByRole('button', { name: 'Paris France' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Berlin Germany' })).toBeTruthy();
  });

  it('searches again in the selected language and ignores the previous language response', async () => {
    const english = deferred<Awaited<ReturnType<typeof searchCity>>>();
    vi.mocked(searchCity)
      .mockReturnValueOnce(english.promise)
      .mockResolvedValueOnce([{ name: 'Париж', lat: 48.85, lon: 2.35, country: 'Франция' }]);
    render(<LanguageProvider><Header cityName="" onLocationSelect={vi.fn()} /></LanguageProvider>);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Paris' } });
    await act(async () => { vi.advanceTimersByTime(500); });
    fireEvent.click(screen.getByRole('button', { name: 'RU' }));
    await act(async () => { vi.advanceTimersByTime(500); });

    expect(searchCity).toHaveBeenNthCalledWith(1, 'Paris', 'en');
    expect(searchCity).toHaveBeenNthCalledWith(2, 'Paris', 'ru');
    expect(screen.getByRole('button', { name: 'Париж Франция' })).toBeTruthy();

    await act(async () => {
      english.resolve([{ name: 'Paris', lat: 48.85, lon: 2.35, country: 'France' }]);
    });

    expect(screen.queryByRole('button', { name: 'Paris France' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Париж Франция' })).toBeTruthy();
  });
});
