import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { weatherFixture } from '../../test/weatherFixture';
import { WeatherCard } from '../WeatherCard/WeatherCard';
import { WeatherStats } from './WeatherStats';

afterEach(cleanup);

describe('unavailable polar metrics', () => {
  it('shows missing UV, visibility and sun events without reporting zero or a low UV risk', () => {
    localStorage.clear();
    const data = weatherFixture();
    data.current.uv_index = null;
    data.current.visibility = null;
    data.daily.sunrise[0] = '2026-10-07T00:00';
    data.daily.sunset[0] = '2026-10-07T00:00';
    render(<LanguageProvider>
      <WeatherCard cityName="North Pole" current={data.current} />
      <WeatherStats current={data.current} daily={data.daily} />
    </LanguageProvider>);
    expect(screen.getAllByText('—')).toHaveLength(5);
    expect(screen.getByText('Unavailable')).toBeTruthy();
    expect(screen.queryByText('Low risk')).toBeNull();
  });
});
