import { HourlyForecast as HourlyData, getWeatherDescription } from '../../api/openMeteo';
import { Sun, Cloud, CloudSun, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, Droplets } from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip,
  CartesianGrid, type TooltipProps,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '@/i18n/LanguageContext';
import { forecastDate, getHourlyForecast } from '@/lib/forecast';

const iconMap: Record<string, React.ElementType> = {
  Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning,
};

interface HourlyForecastProps {
  hourly: HourlyData;
  selectedDayIndex: number;
  dailyDates: string[];
  currentTime: string;
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  const { t } = useLang();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as { time: Date; temp: number; precip: number; code: number };
  const { icon } = getWeatherDescription(d.code);
  const Icon = iconMap[icon] || Cloud;
  return (
    <div className="glass-card px-3 py-2 flex flex-col items-center gap-1 min-w-[70px] border border-white/10">
      <span className="text-white/60 text-xs">
        {d.time.toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' })}
      </span>
      <Icon className="w-4 h-4 text-primary/80" />
      <span className="text-white font-semibold text-sm">{Math.round(d.temp)}°</span>
      {d.precip > 0 && (
        <div className="flex items-center text-accent/80 text-xs">
          <Droplets className="w-2.5 h-2.5 mr-0.5" />
          {d.precip}%
        </div>
      )}
    </div>
  );
}

export function HourlyForecast({ hourly, selectedDayIndex, dailyDates, currentTime }: HourlyForecastProps) {
  const { t } = useLang();

  const selectedDateStr = dailyDates[selectedDayIndex];
  const isToday = selectedDayIndex === 0;

  const data = getHourlyForecast(hourly, currentTime, selectedDateStr, isToday);

  // Icons shown every 3 hours → 8 icons for 24h (indices 0,3,6,9,12,15,18,21)
  const iconStrip = [0, 3, 6, 9, 12, 15, 18, 21].filter(i => i < data.length).map((i) => ({
    time: data[i].time,
    code: data[i].code,
  }));

  const selectedDate = forecastDate(selectedDateStr);
  const titleLabel = isToday
    ? t.hourlyTitle
    : `${t.hourlyFor} ${selectedDate.toLocaleDateString(t.locale, { weekday: 'long', day: 'numeric', month: 'short' })}`;

  return (
    <div className="glass-card p-6 overflow-hidden flex flex-col h-full">
      <AnimatePresence mode="wait">
        <motion.h3
          key={titleLabel}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2 }}
          className="text-lg font-medium text-white mb-3 truncate"
        >
          {titleLabel}
        </motion.h3>
      </AnimatePresence>

      {/* Weather icon strip — aligned with chart XAxis (every 3h) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDayIndex + '-icons'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex justify-between items-center mb-1 px-[4px]"
        >
          {iconStrip.map(({ time, code }, i) => {
            const { icon } = getWeatherDescription(code);
            const Icon = iconMap[icon] || Cloud;
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <Icon className="w-4 h-4 text-white/50" />
                <span className="text-[9px] text-white/30 tabular-nums">
                  {time.toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Interactive temperature chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDayIndex + '-chart'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full mb-3"
          style={{ height: 100 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTempDay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="time"
                tickFormatter={(v: Date) =>
                  v.toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' })
                }
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={12}
              />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{
                  stroke: 'rgba(255,255,255,0.2)',
                  strokeWidth: 1,
                  strokeDasharray: '4 2',
                }}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTempDay)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: 'hsl(var(--primary))',
                  stroke: 'rgba(255,255,255,0.6)',
                  strokeWidth: 1.5,
                }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>

      {/* Hour tiles */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDayIndex + '-hours'}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="flex overflow-x-auto pb-2 space-x-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {data.map((hour, i) => {
            const { icon } = getWeatherDescription(hour.code);
            const Icon = iconMap[icon] || Cloud;
            const isCurrentHour = isToday && i === 0;

            return (
              <div
                key={i}
                className={`flex-shrink-0 flex flex-col items-center justify-between p-4 rounded-2xl min-w-[76px] transition-all ${
                  isCurrentHour
                    ? 'bg-primary/20 border border-primary/30'
                    : 'bg-white/5 border border-white/5'
                }`}
              >
                <span className="text-xs font-medium text-white/70">
                  {isCurrentHour
                    ? t.now
                    : hour.time.toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' })}
                </span>
                <Icon className={`w-5 h-5 my-2 ${isCurrentHour ? 'text-primary' : 'text-white/60'}`} />
                <span className="text-base font-semibold text-white">{Math.round(hour.temp)}°</span>
                {hour.precip > 0 && (
                  <div className="flex items-center mt-1.5 text-accent/80 text-xs">
                    <Droplets className="w-2.5 h-2.5 mr-0.5" />
                    {hour.precip}%
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
