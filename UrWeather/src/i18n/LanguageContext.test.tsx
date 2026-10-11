import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider, useLang } from './LanguageContext';

function LanguageControl() {
  const { t, setLang } = useLang();
  return <button onClick={() => setLang('ru')}>{t.searchPlaceholder}</button>;
}

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('saved language', () => {
  it('falls back to English for an unsupported stored language', () => {
    localStorage.setItem('sw-lang', 'de');
    render(<LanguageProvider><LanguageControl /></LanguageProvider>);
    expect(screen.getByRole('button', { name: 'Search for a city...' })).toBeTruthy();
  });

  it('renders and changes language when browser storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Blocked'); });
    render(<LanguageProvider><LanguageControl /></LanguageProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Search for a city...' }));
    expect(screen.getByRole('button', { name: 'Поиск города...' })).toBeTruthy();
  });
});
