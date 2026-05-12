import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { useTempData } from '../hooks/useTempData';
import type { TempPoint } from '../hooks/useTempData';

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as TempPoint;
  return (
    <div className="bg-white border border-ci-border rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-ci-text mb-1.5">{d.time}</p>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ci-blue inline-block" />
            <span className="text-gray-500">Avg</span>
          </span>
          <span className="font-semibold text-ci-text">{d.avg}°C</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
            <span className="text-gray-500">Max</span>
          </span>
          <span className="font-semibold text-orange-500">{d.max}°C</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
            <span className="text-gray-500">Min</span>
          </span>
          <span className="font-semibold text-gray-500">{d.min}°C</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ci-green inline-block" />
            <span className="text-gray-500">Setpoint</span>
          </span>
          <span className="font-semibold text-ci-green">{d.setpoint}°C</span>
        </div>
      </div>
    </div>
  );
}

export function TempChart() {
  const { history, delta } = useTempData();

  let badge: { label: string; cls: string } | null = null;
  if (delta !== null) {
    if (delta === 0) {
      badge = { label: '✓ On target', cls: 'bg-green-50 text-ci-green border-green-200' };
    } else if (Math.abs(delta) <= 1) {
      badge = { label: delta > 0 ? `+${delta}°C off` : `${delta}°C off`, cls: 'bg-green-50 text-ci-green border-green-200' };
    } else if (delta > 0) {
      badge = { label: `+${delta}°C above`, cls: 'bg-orange-50 text-orange-500 border-orange-200' };
    } else {
      badge = { label: `${delta}°C below`, cls: 'bg-blue-50 text-ci-blue border-blue-200' };
    }
  }

  return (
    <div className="h-full bg-white/90 backdrop-blur-sm border border-ci-border rounded-xl shadow-md px-5 py-4 flex flex-col justify-between">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium leading-none">
            Avg Room Temp
          </p>
          <p className="text-xs text-gray-400 mt-0.5">vs building setpoint</p>
        </div>
        {badge && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${badge.cls}`}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 my-2">
        {history.length < 2 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            Collecting data…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 2, right: 4, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="avg"      stroke="#2E80B6" strokeWidth={2}   dot={false} activeDot={{ r: 3 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="max"      stroke="#fb923c" strokeWidth={1}   dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="min"      stroke="#d1d5db" strokeWidth={1}   dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="setpoint" stroke="#A6CE39" strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-ci-blue rounded" />
          <span className="text-xs text-gray-400">Avg</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-orange-400 rounded" />
          <span className="text-xs text-gray-400">Max</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-gray-300 rounded" />
          <span className="text-xs text-gray-400">Min</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="16" height="4">
            <line x1="0" y1="2" x2="16" y2="2" stroke="#A6CE39" strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
          <span className="text-xs text-gray-400">Setpoint</span>
        </div>
      </div>

    </div>
  );
}
