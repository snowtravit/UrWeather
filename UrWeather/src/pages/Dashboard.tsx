import { useState } from 'react';
import { useWeather } from '../hooks/useWeather';
import { WeatherScene } from '../components/WeatherScene/WeatherScene';
import { Header } from '../components/Header/Header';
import { WeatherCard } from '../components/WeatherCard/WeatherCard';
import { HourlyForecast } from '../components/HourlyForecast/HourlyForecast';
import { DailyForecast } from '../components/DailyForecast/DailyForecast';
import { WeatherStats } from '../components/WeatherStats/WeatherStats';
import { AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '@/i18n/LanguageContext';

export default function Dashboard() {
  const { t, lang } = useLang();
  const { weather, loading, error, location, scene, loadWeatherForLocation, retry } = useWeather(lang);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  return (
    <div className={`min-h-[100dvh] w-full transition-colors duration-1000 ease-in-out gradient-bg-${scene} relative overflow-hidden`}>
      <WeatherScene scene={scene} windSpeed={weather?.current.windspeed_10m || 0} />

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 h-full flex flex-col">
        <Header
          cityName={location?.city || ''}
          onLocationSelect={(lat, lon, city) => {
            setSelectedDayIndex(0);
            loadWeatherForLocation(lat, lon, city);
          }}
        />

        <AnimatePresence>
          {(loading || error || !weather || !location) && (
            <motion.div
              key={loading ? 'loading' : error ? 'error' : 'empty'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-8 mb-6 flex flex-col items-center text-center text-white"
              role={error ? 'alert' : 'status'}
            >
              {loading ? (
                <>
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <div className="font-medium text-lg">{t.detectingAtmosphere}</div>
                </>
              ) : error ? (
                <>
                  <AlertCircle className="w-10 h-10 text-primary mb-4" />
                  <h2 className="font-medium text-lg">{t.weatherLoadFailed}</h2>
                  <p className="text-white/70 mt-2">{t.weatherLoadFailedHint}</p>
                  <button
                    type="button"
                    onClick={() => retry()}
                    className="mt-5 rounded-full border border-primary/40 bg-primary/20 px-5 py-2 font-medium hover:bg-primary/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    {t.retry}
                  </button>
                </>
              ) : <p>{t.chooseCity}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {weather && location && (
          <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12" aria-busy={loading}>
            <div className="lg:col-span-4 xl:col-span-3">
              <WeatherCard current={weather.current} cityName={location.city} />
            </div>

            <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <HourlyForecast
                  hourly={weather.hourly}
                  selectedDayIndex={selectedDayIndex}
                  dailyDates={weather.daily.time}
                />
                <WeatherStats current={weather.current} daily={weather.daily} />
              </div>
              <div className="flex-1">
                <DailyForecast
                  daily={weather.daily}
                  selectedDayIndex={selectedDayIndex}
                  onSelectDay={setSelectedDayIndex}
                />
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
