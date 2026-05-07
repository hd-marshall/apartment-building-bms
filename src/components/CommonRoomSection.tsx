import { Dumbbell, BookOpen, WashingMachine, Flame, Wind, Minus } from 'lucide-react';
import type { CommonRoom } from '../models/CommonRoom';

interface Props {
  commonRooms: CommonRoom[];
  buildingTemp: number;
}

const TYPE_CONFIG = {
  Gym: {
    icon: <Dumbbell className="w-5 h-5" />,
    label: 'Gym',
    accent: 'border-t-purple-400',
    iconBg: 'bg-purple-50 text-purple-500',
  },
  Library: {
    icon: <BookOpen className="w-5 h-5" />,
    label: 'Library',
    accent: 'border-t-ci-green',
    iconBg: 'bg-green-50 text-ci-green',
  },
  Laundry: {
    icon: <WashingMachine className="w-5 h-5" />,
    label: 'Laundry',
    accent: 'border-t-ci-blue',
    iconBg: 'bg-blue-50 text-ci-blue',
  },
};

/** Displays the building's common areas (Gym, Library, Laundry) in a row. */
export function CommonRoomSection({ commonRooms, buildingTemp }: Props) {
  if (!commonRooms.length) return null;

  return (
    <section>
      <h2 className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">
        Common Areas
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {commonRooms.map(room => {
          const typeConf = TYPE_CONFIG[room.roomType];
          const pct = Math.min(100, Math.max(0, ((room.currTemp - 10) / 30) * 100));

          const status = room.heatingStatus
            ? { label: 'Heating', icon: <Flame className="w-3 h-3" />, cls: 'bg-orange-50 text-orange-600 border-orange-200', bar: 'bg-orange-400' }
            : room.coolingStatus
            ? { label: 'Cooling', icon: <Wind className="w-3 h-3" />, cls: 'bg-blue-50 text-ci-blue border-blue-200', bar: 'bg-ci-blue' }
            : { label: 'Idle', icon: <Minus className="w-3 h-3" />, cls: 'bg-gray-50 text-gray-400 border-gray-200', bar: 'bg-gray-200' };

          return (
            <div
              key={room.id}
              className={`bg-white border border-ci-border border-t-4 ${typeConf.accent} rounded-xl p-4 flex flex-col gap-3 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${typeConf.iconBg}`}>
                  {typeConf.icon}
                  <span className="text-sm font-bold">{typeConf.label}</span>
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${status.cls}`}>
                  {status.icon} {status.label}
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-ci-text">{room.currTemp.toFixed(1)}</span>
                <span className="text-gray-300 font-light">°C</span>
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
