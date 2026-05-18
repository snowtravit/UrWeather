import { useState, useEffect, useRef } from 'react';
import { useRealTimeClock } from '../../hooks/useWeather';
import { searchCity } from '../../api/geolocation';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLang } from '@/i18n/LanguageContext';
import { Lang } from '@/i18n/translations';

interface HeaderProps {
  cityName: string;
  onLocationSelect: (lat: number, lon: number, city: string) => void;
}

function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div
      className="relative flex items-center rounded-full p-0.5 border border-white/15"
      style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
      data-testid="language-switcher"
    >
      {/* sliding pill */}
      <div
        className="absolute top-0.5 bottom-0.5 rounded-full transition-all duration-300 ease-in-out"
        style={{
          background: 'linear-gradient(135deg, rgba(100,180,255,0.35), rgba(130,100,255,0.35))',
          border: '1px solid rgba(255,255,255,0.2)',
          width: 'calc(50% - 2px)',
          left: lang === 'en' ? '2px' : 'calc(50%)',
        }}
      />
      {(['en', 'ru'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          data-testid={`button-lang-${l}`}
          className="relative z-10 px-3 py-1 text-xs font-semibold tracking-widest uppercase transition-colors duration-200 rounded-full"
          style={{ color: lang === l ? '#fff' : 'rgba(255,255,255,0.45)', minWidth: 36 }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function Header({ cityName, onLocationSelect }: HeaderProps) {
  const { t, lang } = useLang();
  const time = useRealTimeClock();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ name: string; lat: number; lon: number; country: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        try {
          const res = await searchCity(query, lang);
          setResults(res);
          setShowDropdown(true);
        } catch { /* ignore */ } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <header className="glass-card flex flex-col md:flex-row justify-between items-center px-6 py-4 mb-6 z-20 relative gap-4">
      {/* Logo */}
      <div className="flex items-center space-x-2 shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
          <MapPin className="w-4 h-4 text-primary" />
        </div>
        <h1 className="text-xl font-bold tracking-tight glow-text">{t.appName}</h1>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md w-full relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
            placeholder={t.searchPlaceholder}
            className="w-full bg-background/20 border-white/10 pl-10 focus-visible:ring-primary/50 text-white placeholder:text-white/40"
            data-testid="input-city-search"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
          )}
        </div>

        {showDropdown && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-card overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
            {results.map((r, i) => (
              <button
                key={i}
                className="w-full text-left px-4 py-3 hover:bg-white/10 border-b border-white/5 last:border-0 transition-colors flex items-center space-x-2"
                onClick={() => {
                  onLocationSelect(r.lat, r.lon, r.name);
                  setShowDropdown(false);
                  setQuery('');
                }}
                data-testid={`button-select-city-${i}`}
              >
                <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
                <span>
                  <span className="font-medium text-white">{r.name}</span>
                  <span className="text-white/50 text-sm ml-2">{r.country}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right side: clock + lang switcher */}
      <div className="flex items-center gap-4 shrink-0">
        <LanguageSwitcher />
        <div className="hidden md:flex flex-col items-end">
          <div className="text-sm text-white/70 font-medium tracking-wider">
            {time.toLocaleDateString(t.locale, { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
          <div className="text-2xl font-light tabular-nums glow-text">
            {time.toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </div>
    </header>
  );
}
