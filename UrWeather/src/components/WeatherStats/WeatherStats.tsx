import { CurrentWeather, DailyForecast } from '../../api/openMeteo';
import { Sunrise, Wind, Droplets, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '@/i18n/LanguageContext';

interface WeatherStatsProps {
  current: CurrentWeather;
  daily: DailyForecast;
}

export function WeatherStats({ current, daily }: WeatherStatsProps) {
  const { t } = useLang();
  const sunrise = new Date(daily.sunrise[0]);
  const sunset = new Date(daily.sunset[0]);

  const uvRisk =
    current.uv_index < 3
      ? t.uvRisk.low
      : current.uv_index < 6
      ? t.uvRisk.moderate
      : current.uv_index < 8
      ? t.uvRisk.high
      : t.uvRisk.veryHigh;

  const uvColor =
    current.uv_index < 3
      ? 'bg-green-500'
      : current.uv_index < 6
      ? 'bg-yellow-500'
      : current.uv_index < 8
      ? 'bg-orange-500'
      : 'bg-red-500';

  return (
    <div className="grid grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5"
      >
        <div className="flex items-center text-white/60 mb-3">
          <Sunrise className="w-4 h-4 mr-2" />
          <span className="text-xs font-medium uppercase tracking-wider">{t.sunCycle}</span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-xl font-medium text-white">
              {sunrise.toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-white/40 mt-1">{t.sunrise}</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-medium text-white">
              {sunset.toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-white/40 mt-1">{t.sunset}</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5"
      >
        <div className="flex items-center text-white/60 mb-3">
          <Wind className="w-4 h-4 mr-2" />
          <span className="text-xs font-medium uppercase tracking-wider">{t.wind}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-white">{current.windspeed_10m}</div>
            <div className="text-sm text-white/50">{t.kmh}</div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center relative">
            <div className="absolute top-1 text-[8px] text-white/30">N</div>
            <div className="absolute bottom-1 text-[8px] text-white/30">S</div>
            <div className="absolute right-1 text-[8px] text-white/30">E</div>
            <div className="absolute left-1 text-[8px] text-white/30">W</div>
            <div
              className="w-0.5 h-6 bg-primary rounded-full absolute origin-bottom transform transition-transform duration-1000 ease-out"
              style={{ transform: `rotate(${current.winddirection_10m}deg) translateY(-50%)` }}
            >
              <div className="w-2 h-2 bg-primary rounded-full absolute -top-1 -left-[3px] shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-5"
      >
        <div className="flex items-center text-white/60 mb-3">
          <Droplets className="w-4 h-4 mr-2" />
          <span className="text-xs font-medium uppercase tracking-wider">{t.humidity}</span>
        </div>
        <div className="text-2xl font-bold text-white mb-2">{current.relative_humidity_2m}%</div>
        <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-accent" style={{ width: `${current.relative_humidity_2m}%` }} />
        </div>
        <div className="text-xs text-white/50 mt-2">
          {t.dewPoint} {Math.round(current.temperature_2m - (100 - current.relative_humidity_2m) / 5)}°
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-5"
      >
        <div className="flex items-center text-white/60 mb-3">
          <Sun className="w-4 h-4 mr-2" />
          <span className="text-xs font-medium uppercase tracking-wider">{t.uvIndex}</span>
        </div>
        <div className="text-2xl font-bold text-white mb-2">{current.uv_index.toFixed(1)}</div>
        <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full ${uvColor}`}
            style={{ width: `${Math.min((current.uv_index / 11) * 100, 100)}%` }}
          />
        </div>
        <div className="text-xs text-white/50 mt-2">{uvRisk}</div>
      </motion.div>
    </div>
  );
}
