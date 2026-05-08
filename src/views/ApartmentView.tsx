import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { useBuildingStore } from '../store/useBuildingStore';
import { RoomCard } from '../components/RoomCard';
import type { Apartment } from '../models/Apartment';

interface Props {
  apartmentId: number;
  onBack: () => void;
  onAddRoom: (apartmentId: number) => void;
  onEditRoom: (apartmentId: number, roomId: string) => void;
  onEditOwner: (apt: Apartment) => void;
}

export function ApartmentView({ apartmentId, onBack, onAddRoom, onEditRoom, onEditOwner }: Props) {
  const building = useBuildingStore(s => s.building);
  const removeApartment = useBuildingStore(s => s.removeApartment);
  const removeRoom = useBuildingStore(s => s.removeRoom);

  const apartment = building.getApartment(apartmentId);

  if (!apartment) {
    onBack();
    return null;
  }

  const allRooms = apartment.rooms;
  const avgTemp = allRooms.length
    ? parseFloat((allRooms.reduce((s, r) => s + r.currTemp, 0) / allRooms.length).toFixed(1))
    : 0;
  const heatingCount = allRooms.filter(r => r.heatingStatus).length;
  const coolingCount = allRooms.filter(r => r.coolingStatus).length;

  return (
    <main className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 border border-ci-border rounded-lg text-sm text-gray-500 hover:text-ci-blue hover:border-ci-blue transition-colors cursor-pointer bg-white shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Building
        </button>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-ci-blue">Level {apartment.apartmentId}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {apartment.owner}
            <span className="mx-2 text-gray-300">·</span>
            {allRooms.length} room{allRooms.length !== 1 ? 's' : ''}
            <span className="mx-2 text-gray-300">·</span>
            avg {avgTemp}°C
            {heatingCount > 0 && (
              <span className="text-orange-500 ml-2">{heatingCount} heating</span>
            )}
            {coolingCount > 0 && (
              <span className="text-ci-blue ml-2">{coolingCount} cooling</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onAddRoom(apartmentId)}
            className="flex items-center gap-2 px-4 py-2 bg-ci-blue hover:bg-ci-blue-dark text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
          <button
            onClick={() => onEditOwner(apartment)}
            className="flex items-center gap-2 px-3 py-2 border border-ci-border rounded-lg text-sm text-gray-500 hover:text-ci-blue hover:border-ci-blue transition-colors cursor-pointer bg-white"
          >
            <Pencil className="w-4 h-4" />
            Edit Tenant
          </button>
          <button
            onClick={() => { removeApartment(apartmentId); onBack(); }}
            className="flex items-center gap-2 px-3 py-2 border border-red-200 rounded-lg text-sm text-red-400 hover:text-red-500 hover:border-red-400 transition-colors cursor-pointer bg-white"
          >
            <Trash2 className="w-4 h-4" />
            Remove Suite
          </button>
        </div>
      </div>

      {/* Room grid */}
      {allRooms.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white border border-ci-border rounded-xl">
          <p className="text-base">No rooms in this suite yet.</p>
          <button
            onClick={() => onAddRoom(apartmentId)}
            className="mt-3 text-ci-blue hover:text-ci-blue-dark text-sm cursor-pointer transition-colors"
          >
            Add the first room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {allRooms.map(room => (
            <RoomCard
              key={room.id}
              room={room}
              buildingTemp={building.buildingTemp}
              onEdit={() => onEditRoom(apartmentId, room.id)}
              onDelete={() => removeRoom(apartmentId, room.id)}
            />
          ))}
        </div>
      )}

    </main>
  );
}
