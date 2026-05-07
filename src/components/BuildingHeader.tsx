import { Thermometer, Wind, Users, Cloud } from 'lucide-react';
import { useBuildingStore } from '../store/useBuildingStore';
import { useWeather } from '../hooks/useWeather';
import logo from '../assets/ConserveIt-Logo.avif';

interface Props {
  onAddApartment: () => void;
}

/** Page header showing building stats and the requested temperature control. */
export function BuildingHeader({ onAddApartment }: Props) {
  const building = useBuildingStore(s => s.building);
  const setBuildingTemp = useBuildingStore(s => s.setBuildingTemp);
  const { weather, error: weatherError } = useWeather();

  const allRooms = building.apartments.flatMap(a => a.rooms);
  const allSpaces = [...allRooms, ...building.commonRooms];
  const avgTemp = allSpaces.length
    ? parseFloat((allSpaces.reduce((s, r) => s + r.currTemp, 0) / allSpaces.length).toFixed(1))
    : 0;
  const heatingCount = allSpaces.filter(r => r.heatingStatus).length;
  const coolingCount = allSpaces.filter(r => r.coolingStatus).length;

  function applyTemp(val: number) {
    setBuildingTemp(Math.min(40, Math.max(10, val)));
  }

  return (
    <header>
      {/* Brand banner */}
      <div className="bg-white border-b border-ci-border">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <img src={logo} alt="ConserveIt" className="h-8 w-auto object-contain" />
            <div className="border-l border-gray-200 pl-4">
              <h1 className="text-base font-bold text-ci-blue leading-none tracking-widest">BMS</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Cloud className="w-4 h-4 text-ci-blue shrink-0" />
              {!weather && !weatherError && <span className="text-gray-400">—</span>}
              {weather && (
                <span>{weather.temp}°C &middot; {weather.description}</span>
              )}
              {weatherError && <span className="text-gray-400">Unavailable</span>}
            </div>

            <button
              onClick={onAddApartment}
              className="flex items-center gap-2 px-4 py-2 bg-ci-green hover:bg-ci-green-dark text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Users className="w-4 h-4" />
              Add Apartment
            </button>
          </div>
        </div>
        <div className="h-1 bg-ci-green" />
      </div>

      {/* Stats + temperature control */}
      <div className="bg-ci-white border-b border-ci-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-3 gap-3 mb-1">
          <StatCard
            icon={<Users className="w-4 h-4 text-ci-blue" />}
            label="Apartments"
            value={String(building.apartments.length)}
          />
          <StatCard
            icon={<Thermometer className="w-4 h-4 text-ci-blue" />}
            label="Avg Room Temp"
            value={`${avgTemp}°C`}
          />
          <StatCard
            icon={<Wind className="w-4 h-4 text-orange-500" />}
            label="Heating / Cooling"
            value={`${heatingCount} / ${coolingCount}`}
            valueClass="text-orange-500"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-5">
          <div className="bg-ci-off-white border border-ci-border rounded-xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-medium">
              Requested Building Temperature
            </p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-ci-blue">{building.buildingTemp}</span>
              <span className="text-2xl text-gray-400 font-light">°C</span>
            </div>
            <input
              type="range"
              min={10}
              max={40}
              step={0.5}
              value={building.buildingTemp}
              onChange={e => applyTemp(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer
                bg-gradient-to-r from-blue-400 via-ci-green to-orange-400
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-ci-blue
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1.5">
              <span>10°C — Cold</span>
              <span className="text-ci-green font-medium">{building.buildingTemp}°C</span>
              <span>40°C — Hot</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatCard({ icon, label, value, valueClass = 'text-ci-text' }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-white border border-ci-border rounded-lg px-4 py-3 flex items-center gap-3 shadow-sm">
      {icon}
      <div>
        <p className="text-xs text-gray-400 leading-none mb-1">{label}</p>
        <p className={`text-sm font-semibold ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}
