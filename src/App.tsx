import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useBuildingStore } from './store/useBuildingStore';
import { BuildingHeader } from './components/BuildingHeader';
import { BuildingView } from './views/BuildingView';
import { ApartmentView } from './views/ApartmentView';

const TICK_INTERVAL_MS = 5_000;

export default function App() {
  const tick = useBuildingStore(s => s.tick);

  useEffect(() => {
    const id = setInterval(tick, TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <BuildingHeader />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<BuildingView />} />
          <Route
            path="/level/:id"
            element={
              <div className="flex-1 overflow-y-auto bg-ci-off-white">
                <ApartmentView />
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
