import { DailyForecast as DailyData, getWeatherDescription } from '../../api/openMeteo';
import { Sun, Cloud, CloudSun, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, Droplets, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '@/i18n/LanguageContext';

const iconMap: Record<string, React.ElementType> = {
  Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning,
};

interface DailyForecastProps {
  daily: DailyData;
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
}

export function DailyForecast({ daily, selectedDayIndex, onSelectDay }: DailyForecastProps) {
  const { t } = useLang();

  const days = Array.from({ length: 7 }).map((_, i) => ({
    date: new Date(daily.time[i]),
    min: daily.temperature_2m_min[i],
    max: daily.temperature_2m_max[i],
    code: daily.weathercode[i],
    precip: daily.precipitation_probability_max[i],
  }));

  const globalMin = Math.min(...days.map(d => d.min));
  const globalMax = Math.max(...days.map(d => d.max));

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-medium text-white mb-6">{t.dailyTitle}</h3>
      <div className="space-y-1">
        {days.map((day, i) => {
          const { icon } = getWeatherDescription(day.code);
          const Icon = iconMap[icon] || Cloud;
          const isToday = i === 0;
          const isSelected = i === selectedDayIndex;

          const range = globalMax - globalMin || 1;
          const leftPerc = ((day.min - globalMin) / range) * 100;
          const widthPerc = ((day.max - day.min) / range) * 100;

          return (
            <motion.button
              key={day.date.getTime()}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onSelectDay(i)}
              data-testid={`button-day-${i}`}
              className={`
                w-full flex items-center justify-between py-3 px-3 rounded-xl
                transition-all duration-200 cursor-pointer group
                ${isSelected
                  ? 'bg-primary/15 border border-primary/30'
                  : 'border border-transparent hover:bg-white/5 hover:border-white/10'}
              `}
            >
              {/* Day label */}
              <div className={`w-24 text-left font-medium transition-colors ${isSelected ? 'text-primary' : 'text-white/80'}`}>
                {isToday
                  ? t.today
                  : day.date.toLocaleDateString(t.locale, { weekday: 'short' })}
              </div>

              {/* Weather icon */}
              <div className="w-10 flex justify-center">
                <Icon className={`w-5 h-5 transition-colors ${isSelected ? 'text-primary' : 'text-white/70'}`} />
              </div>

              {/* Precip */}
              <div className="w-14 flex items-center justify-end text-accent/80 text-sm">
                {day.precip > 0 && (
                  <>
                    <Droplets className="w-3 h-3 mr-1 shrink-0" />
                    {day.precip}%
                  </>
                )}
              </div>

              {/* Temp bar */}
              <div className="flex-1 flex items-center mx-4">
                <span className={`w-8 text-right font-medium mr-3 tabular-nums text-sm ${isSelected ? 'text-white/80' : 'text-white/50'}`}>
                  {Math.round(day.min)}°
                </span>
                <div className="flex-1 h-1.5 bg-black/25 rounded-full overflow-hidden relative">
                  <div
                    className={`absolute top-0 bottom-0 rounded-full transition-all ${isSelected ? 'bg-gradient-to-r from-secondary to-primary' : 'bg-gradient-to-r from-secondary/70 to-primary/70'}`}
                    style={{ left: `${leftPerc}%`, width: `${widthPerc}%` }}
                  />
                </div>
                <span className={`w-8 text-left font-medium ml-3 tabular-nums text-sm ${isSelected ? 'text-white' : 'text-white/80'}`}>
                  {Math.round(day.max)}°
                </span>
              </div>

              {/* Arrow indicator */}
              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-all duration-200 ${isSelected ? 'text-primary opacity-100' : 'text-white/20 group-hover:text-white/40'}`}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
