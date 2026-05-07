import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, User } from 'lucide-react';
import type { Apartment } from '../models/Apartment';
import { RoomCard } from './RoomCard';
import { useBuildingStore } from '../store/useBuildingStore';

interface Props {
  apartment: Apartment;
  buildingTemp: number;
  onAddRoom: (apartmentId: number) => void;
  onEditRoom: (apartmentId: number, roomId: string) => void;
  onEditOwner: (apartment: Apartment) => void;
}

/** Collapsible section showing all rooms for a single apartment. */
export function ApartmentSection({ apartment, buildingTemp, onAddRoom, onEditRoom, onEditOwner }: Props) {
  const [expanded, setExpanded] = useState(true);
  const removeApartment = useBuildingStore(s => s.removeApartment);
  const removeRoom = useBuildingStore(s => s.removeRoom);

  const heatingCount = apartment.rooms.filter(r => r.heatingStatus).length;
  const coolingCount = apartment.rooms.filter(r => r.coolingStatus).length;

  function handleDeleteApartment() {
    if (confirm(`Remove apartment ${apartment.apartmentId}? This will delete all ${apartment.rooms.length} rooms.`)) {
      removeApartment(apartment.apartmentId);
    }
  }

  return (
    <div className="bg-white border border-ci-border rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-3.5 bg-ci-off-white border-b border-ci-border">
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-ci-blue hover:text-ci-blue-dark transition-colors cursor-pointer"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="p-1.5 bg-ci-blue/10 rounded-md">
            <User className="w-3.5 h-3.5 text-ci-blue" />
          </div>
          <span className="text-sm font-bold text-ci-text">Apt {apartment.apartmentId}</span>
          <span className="text-ci-border mx-1">·</span>
          <span className="text-sm text-gray-500 truncate">{apartment.owner}</span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs">
          <span className="text-gray-400">{apartment.rooms.length} rooms</span>
          {heatingCount > 0 && <span className="text-orange-500 font-medium">{heatingCount} heating</span>}
          {coolingCount > 0 && <span className="text-ci-blue font-medium">{coolingCount} cooling</span>}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddRoom(apartment.apartmentId)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-ci-blue hover:bg-ci-blue-dark rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Room
          </button>
          <button
            onClick={() => onEditOwner(apartment)}
            className="p-1.5 text-gray-400 hover:text-ci-blue transition-colors cursor-pointer"
            title="Edit owner"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDeleteApartment}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            title="Remove apartment"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4">
          {apartment.rooms.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No rooms yet.{' '}
              <button
                onClick={() => onAddRoom(apartment.apartmentId)}
                className="text-ci-blue hover:text-ci-blue-dark cursor-pointer font-medium"
              >
                Add one
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {apartment.rooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  buildingTemp={buildingTemp}
                  onEdit={() => onEditRoom(apartment.apartmentId, room.id)}
                  onDelete={() => removeRoom(apartment.apartmentId, room.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
