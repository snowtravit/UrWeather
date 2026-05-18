import { CurrentWeather, getWeatherDescription } from '../../api/openMeteo';
import { Droplets, Wind, Eye, Sun, MapPin, Cloud, CloudSun, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

interface WeatherCardProps {
  current: CurrentWeather;
  cityName: string;
}

const iconMap: Record<string, React.ElementType> = {
  Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning,
};

export function WeatherCard({ current, cityName }: WeatherCardProps) {
  const { t } = useLang();
  const { label, icon } = getWeatherDescription(current.weathercode);
  const IconComponent = iconMap[icon] || Cloud;
  const translatedLabel = t.weather[label] ?? label;

  return (
    <div className="liquid-glass-hero p-8 flex flex-col justify-between h-full min-h-[400px]">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 text-white/80 mb-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-lg font-medium">{cityName}</span>
          </div>
          <h2 className="text-3xl font-light text-white">{translatedLabel}</h2>
        </div>
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
          <IconComponent className="w-12 h-12 text-primary" />
        </div>
      </div>

      <div className="mt-8 mb-8">
        <div className="flex items-start">
          <span className="text-8xl font-bold tracking-tighter text-white glow-text leading-none">
            {Math.round(current.temperature_2m)}
          </span>
          <span className="text-4xl font-light text-primary mt-2 ml-1">°</span>
        </div>
        <div className="text-white/60 mt-2 text-lg">
          {t.feelsLike} {Math.round(current.apparent_temperature)}°
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-white/5">
            <Droplets className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="text-white/50 text-xs uppercase tracking-wider">{t.humidity}</div>
            <div className="text-white font-medium">{current.relative_humidity_2m}%</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-white/5">
            <Wind className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="text-white/50 text-xs uppercase tracking-wider">{t.wind}</div>
            <div className="text-white font-medium">{current.windspeed_10m} {t.kmh}</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-white/5">
            <Eye className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="text-white/50 text-xs uppercase tracking-wider">{t.visibility}</div>
            <div className="text-white font-medium">{(current.visibility / 1000).toFixed(1)} {t.km}</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-white/5">
            <Sun className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="text-white/50 text-xs uppercase tracking-wider">{t.uvIndex}</div>
            <div className="text-white font-medium">{current.uv_index.toFixed(1)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
