import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBuildingStore } from '../store/useBuildingStore';
import { BuildingFacade } from '../components/BuildingFacade';
import { CommonRoomSection } from '../components/CommonRoomSection';
import { LoadingScreen } from '../components/LoadingScreen';
import { EnergyChart } from '../components/EnergyChart';
import { TempChart } from '../components/TempChart';
import { ApartmentModal } from '../components/modals/ApartmentModal';
import { fetchApartment } from '../api/buildingApi';

const MAX_LEVELS = 20;

function applyBounds(val: number) {
  return Math.min(40, Math.max(10, val));
}

export function BuildingView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [addingApartment, setAddingApartment] = useState(false);

  const building = useBuildingStore(s => s.building);
  const setBuildingTemp = useBuildingStore(s => s.setBuildingTemp);
  const aptIds = new Set(building.apartments.map(a => a.apartmentId));

  const handleLevelClick = async (id: number) => {
    setLoading(true);
    await fetchApartment(id);   // simulated API delay
    setLoading(false);
    navigate(`/level/${id}`);   // updates the URL → /level/1, /level/2, etc.
  };

  return (
    <>
      {loading && <LoadingScreen />}

      <div className="flex-1 flex overflow-hidden">

        {/* Left: level links column */}
        <div className="w-20 shrink-0 flex flex-col overflow-hidden border-r border-ci-border bg-white/90 backdrop-blur-sm z-10">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold px-3 pt-3 pb-1 shrink-0">
            Levels
          </p>
          <div className="px-2 pb-1 shrink-0">
            <button
              onClick={() => setAddingApartment(true)}
              style={{ cursor: 'pointer' }}
              className="w-full flex items-center justify-center gap-1 py-1 bg-ci-green hover:bg-ci-green-dark text-white text-xs font-semibold rounded-md transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>
          <div className="flex-1 flex flex-col gap-0.5 px-2 pb-2">
            {Array.from({ length: MAX_LEVELS }, (_, i) => i + 1).map(level => {
              const occupied = aptIds.has(level);
              return (
                <button
                  key={level}
                  onClick={occupied ? () => handleLevelClick(level) : undefined}
                  disabled={!occupied}
                  style={{ cursor: occupied ? 'pointer' : 'default' }}
                  className={`flex-1 text-xs font-semibold rounded-md transition-colors text-center
                    ${occupied
                      ? 'bg-gray-50 border border-ci-border text-ci-text hover:bg-ci-blue hover:text-white hover:border-ci-blue'
                      : 'text-gray-200'
                    }`}
                >
                  L {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: building backdrop + overlays */}
        <div className="flex-1 relative overflow-hidden bg-gray-50">

          {/* Building SVG — centred, non-interactive */}
          <div className="absolute inset-0 flex items-center justify-center">
            <BuildingFacade apartments={building.apartments} />
          </div>

          {/* Energy chart — left of centre */}
          <div className="absolute top-4 right-[calc(50%+160px)] z-10 w-80 h-44">
            <EnergyChart />
          </div>

          {/* Temp chart — right of centre, mirroring energy chart */}
          <div className="absolute top-4 left-[calc(50%+160px)] z-10 w-80 h-44">
            <TempChart />
          </div>

          {/* Building temp card — centred, same fixed height */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-72 h-44 bg-white/90 backdrop-blur-sm border border-ci-border rounded-xl shadow-md px-5 py-4 flex flex-col justify-between">
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-medium">
                Building Temperature
              </p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-3xl font-bold text-ci-blue">{building.buildingTemp}</span>
                <span className="text-xl text-gray-400 font-light">°C</span>
              </div>
            </div>
            <div>
              <input
                type="range"
                min={10}
                max={40}
                step={0.5}
                value={building.buildingTemp}
                onChange={e => setBuildingTemp(applyBounds(parseFloat(e.target.value)))}
                style={{ cursor: 'pointer' }}
                className="w-full h-2 rounded-full appearance-none
                  bg-linear-to-r from-blue-400 via-ci-green to-orange-400
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-ci-blue
                  [&::-webkit-slider-thumb]:shadow-md
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-white
                  [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                <span>10°C</span>
                <span>40°C</span>
              </div>
            </div>
          </div>

          {/* Bottom centre: common rooms */}
          {building.commonRooms.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-max max-w-[calc(100%-2rem)]">
              <div className="bg-white/90 backdrop-blur-sm border border-ci-border rounded-xl shadow-md px-5 py-4">
                <CommonRoomSection
                  commonRooms={building.commonRooms}
                  buildingTemp={building.buildingTemp}
                />
              </div>
            </div>
          )}

          {building.apartments.length === 0 && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 bg-white/85 backdrop-blur-sm border border-ci-border rounded-xl p-6 text-center shadow-sm">
              <p className="text-gray-500 text-sm">No business suites yet.</p>
              <button
                onClick={() => setAddingApartment(true)}
                className="mt-2 text-ci-blue hover:text-ci-blue-dark text-sm cursor-pointer transition-colors"
              >
                Add the first suite
              </button>
            </div>
          )}

        </div>
      </div>

      {addingApartment && (
        <ApartmentModal mode="add" onClose={() => setAddingApartment(false)} />
      )}
    </>
  );
}
