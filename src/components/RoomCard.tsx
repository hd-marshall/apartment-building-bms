import { Flame, Wind, Minus, Pencil, Trash2 } from 'lucide-react';
import type { Room } from '../models/Room';

interface Props {
  room: Room;
  buildingTemp: number;
  onEdit: () => void;
  onDelete: () => void;
}

/** Displays a single room's temperature, HVAC status, and action controls. */
export function RoomCard({ room, buildingTemp, onEdit, onDelete }: Props) {
  const { heatingStatus, coolingStatus, currTemp, id } = room;
  const isIdle = !heatingStatus && !coolingStatus;
  const pct = Math.min(100, Math.max(0, ((currTemp - 10) / 30) * 100));
  const deviation = parseFloat((currTemp - buildingTemp).toFixed(1));

  const status = heatingStatus
    ? {
        label: 'Heating',
        icon: <Flame className="w-3 h-3" />,
        badge: 'bg-orange-50 text-orange-600 border-orange-200',
        bar: 'bg-orange-400',
        border: 'border-l-orange-400',
        devClass: 'text-orange-500',
      }
    : coolingStatus
    ? {
        label: 'Cooling',
        icon: <Wind className="w-3 h-3" />,
        badge: 'bg-blue-50 text-ci-blue border-blue-200',
        bar: 'bg-ci-blue',
        border: 'border-l-ci-blue',
        devClass: 'text-ci-blue',
      }
    : {
        label: 'Idle',
        icon: <Minus className="w-3 h-3" />,
        badge: 'bg-green-50 text-ci-green border-green-200',
        bar: 'bg-ci-green',
        border: 'border-l-ci-border',
        devClass: 'text-gray-300',
      };

  return (
    <div className={`bg-white border border-ci-border border-l-4 ${status.border} rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider leading-none mb-0.5">Room</p>
          <p className="text-sm font-bold text-ci-blue">{id}</p>
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${status.badge}`}>
          {status.icon}
          {status.label}
        </span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-ci-text">{currTemp.toFixed(1)}</span>
        <span className="text-lg text-gray-300 font-light">°C</span>
        {!isIdle && (
          <span className={`ml-auto text-xs font-semibold ${status.devClass}`}>
            {deviation > 0 ? `+${deviation}` : deviation}°
          </span>
        )}
      </div>

      <div>
        <div className="h-1.5 bg-ci-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-in-out ${status.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-300 mt-1">
          <span>10°</span>
          <span className="text-ci-green font-medium">↑ {buildingTemp}°</span>
          <span>40°</span>
        </div>
      </div>

      <div className="flex gap-2 pt-1 border-t border-ci-border">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-ci-blue transition-colors cursor-pointer font-medium"
        >
          <Pencil className="w-3 h-3" /> Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors ml-auto cursor-pointer font-medium"
        >
          <Trash2 className="w-3 h-3" /> Remove
        </button>
      </div>
    </div>
  );
}
