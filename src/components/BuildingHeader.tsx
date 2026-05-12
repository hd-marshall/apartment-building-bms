import { Cloud } from 'lucide-react';
import { useWeather } from '../hooks/useWeather';
import logo from '../assets/ConserveIt-Logo.avif';

export function BuildingHeader() {
  const { weather, error: weatherError } = useWeather();

  return (
    <header className="shrink-0">
      <div className="bg-white border-b border-ci-border">
        <div className="px-6 py-3 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="ConserveIt" className="h-7 w-auto object-contain" />
            <div className="border-l border-gray-200 pl-3">
              <h1 className="text-sm font-bold text-ci-blue leading-none tracking-widest">BMS</h1>
            </div>
          </div>

          {/* Right: weather */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Cloud className="w-4 h-4 text-ci-blue shrink-0" />
            {!weather && !weatherError && <span className="text-gray-400">—</span>}
            {weather && <span>{weather.temp}°C · {weather.description}</span>}
            {weatherError && <span className="text-gray-400">Unavailable</span>}
          </div>

        </div>
        <div className="h-1 bg-ci-green" />
      </div>
    </header>
  );
}
