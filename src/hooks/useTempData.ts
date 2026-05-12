import { useState, useEffect } from 'react';
import { useBuildingStore } from '../store/useBuildingStore';

const MAX_POINTS = 24;

export interface TempPoint {
  time: string;
  avg: number;
  min: number;
  max: number;
  setpoint: number;
}

export function useTempData() {
  const building    = useBuildingStore(s => s.building);
  const lastUpdated = useBuildingStore(s => s.lastUpdated);
  const [history, setHistory] = useState<TempPoint[]>([]);

  useEffect(() => {
    const allRooms = [
      ...building.apartments.flatMap(a => a.rooms),
      ...building.commonRooms,
    ];

    if (allRooms.length === 0) return;

    const temps = allRooms.map(r => r.currTemp);
    const avg = parseFloat((temps.reduce((s, t) => s + t, 0) / temps.length).toFixed(1));
    const min = parseFloat(Math.min(...temps).toFixed(1));
    const max = parseFloat(Math.max(...temps).toFixed(1));
    const setpoint = building.buildingTemp;

    const time = lastUpdated.toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

    setHistory(prev => [...prev, { time, avg, min, max, setpoint }].slice(-MAX_POINTS));
  }, [lastUpdated]);

  const latest = history[history.length - 1];
  const delta = latest ? parseFloat((latest.avg - latest.setpoint).toFixed(1)) : null;

  return { history, latest, delta };
}
