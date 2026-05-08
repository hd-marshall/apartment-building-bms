import { useState, useEffect } from 'react';
import { useBuildingStore } from '../store/useBuildingStore';

// Energy model (kW)
// Baseline covers lighting, lifts, server room — always on.
// Each HVAC unit in heating/cooling draws meaningfully more than idle standby.
const BASELINE_KW   = 5;
const HEATING_KW    = 0.30;  // per room actively heating
const COOLING_KW    = 0.20;  // per room actively cooling
const IDLE_KW       = 0.02;  // per room at setpoint (standby only)

const MAX_POINTS = 24;  // ~2 minutes of history at 5s tick

export interface EnergyPoint {
  time: string;
  actual: number;
  target: number;
  heating: number;
  cooling: number;
  idle: number;
  total: number;
}

function calcEnergy(building: ReturnType<typeof useBuildingStore.getState>['building']) {
  const allSpaces = [
    ...building.apartments.flatMap(a => a.rooms),
    ...building.commonRooms,
  ];

  const heating = allSpaces.filter(r => r.heatingStatus).length;
  const cooling = allSpaces.filter(r => r.coolingStatus).length;
  const idle    = allSpaces.length - heating - cooling;

  const actual = parseFloat(
    (BASELINE_KW + heating * HEATING_KW + cooling * COOLING_KW + idle * IDLE_KW).toFixed(2)
  );
  const target = parseFloat(
    (BASELINE_KW + allSpaces.length * IDLE_KW).toFixed(2)
  );

  return { actual, target, heating, cooling, idle, total: allSpaces.length, isOptimal: heating === 0 && cooling === 0 };
}

export function useEnergyData() {
  const building     = useBuildingStore(s => s.building);
  const lastUpdated  = useBuildingStore(s => s.lastUpdated);
  const [history, setHistory] = useState<EnergyPoint[]>([]);

  useEffect(() => {
    const { actual, target, heating, cooling, idle, total } = calcEnergy(building);
    const time = lastUpdated.toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

    setHistory(prev => [...prev, { time, actual, target, heating, cooling, idle, total }].slice(-MAX_POINTS));
  }, [lastUpdated]); // fires on every tick

  const latest = history[history.length - 1];
  const isOptimal = latest ? latest.actual <= latest.target * 1.02 : false;

  return { history, isOptimal, latest };
}
