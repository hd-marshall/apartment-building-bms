import { useState } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBuildingStore } from '../store/useBuildingStore';
import { RoomCard } from '../components/RoomCard';
import { ApartmentModal } from '../components/modals/ApartmentModal';
import { RoomModal } from '../components/modals/RoomModal';
import type { Apartment } from '../models/Apartment';

type AddRoomModal  = { mode: 'add';  apartmentId: number };
type EditRoomModal = { mode: 'edit'; apartmentId: number; roomId: string; currentTemp: number };
type RoomModalState = AddRoomModal | EditRoomModal | null;

export function ApartmentView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const apartmentId = parseInt(id!, 10);

  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [roomModal, setRoomModal] = useState<RoomModalState>(null);

  const building = useBuildingStore(s => s.building);
  const removeApartment = useBuildingStore(s => s.removeApartment);
  const removeRoom = useBuildingStore(s => s.removeRoom);

  const apartment = building.getApartment(apartmentId);

  if (!apartment) {
    navigate('/');
    return null;
  }

  const allRooms = apartment.rooms;
  const avgTemp = allRooms.length
    ? parseFloat((allRooms.reduce((s, r) => s + r.currTemp, 0) / allRooms.length).toFixed(1))
    : 0;
  const heatingCount = allRooms.filter(r => r.heatingStatus).length;
  const coolingCount = allRooms.filter(r => r.coolingStatus).length;

  return (
    <>
    <main className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <button
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
          className="flex items-center gap-2 px-3 py-2 border border-ci-border rounded-lg text-sm text-gray-500 hover:text-ci-blue hover:border-ci-blue transition-colors bg-white shadow-sm"
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
            onClick={() => setRoomModal({ mode: 'add', apartmentId })}
            style={{ cursor: 'pointer' }}
            className="flex items-center gap-2 px-4 py-2 bg-ci-blue hover:bg-ci-blue-dark text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
          <button
            onClick={() => setEditingApartment(apartment)}
            style={{ cursor: 'pointer' }}
            className="flex items-center gap-2 px-3 py-2 border border-ci-border rounded-lg text-sm text-gray-500 hover:text-ci-blue hover:border-ci-blue transition-colors bg-white"
          >
            <Pencil className="w-4 h-4" />
            Edit Tenant
          </button>
          <button
            onClick={() => { removeApartment(apartmentId); navigate('/'); }}
            style={{ cursor: 'pointer' }}
            className="flex items-center gap-2 px-3 py-2 border border-red-200 rounded-lg text-sm text-red-400 hover:text-red-500 hover:border-red-400 transition-colors bg-white"
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
            onClick={() => setRoomModal({ mode: 'add', apartmentId })}
            style={{ cursor: 'pointer' }}
            className="mt-3 text-ci-blue hover:text-ci-blue-dark text-sm transition-colors"
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
              onEdit={() => {
                if (room) setRoomModal({ mode: 'edit', apartmentId, roomId: room.id, currentTemp: room.currTemp });
              }}
              onDelete={() => removeRoom(apartmentId, room.id)}
            />
          ))}
        </div>
      )}

    </main>

    {editingApartment && (
      <ApartmentModal
        mode="edit"
        apartment={editingApartment}
        onClose={() => setEditingApartment(null)}
      />
    )}
    {roomModal && roomModal.mode === 'add' && (
      <RoomModal
        mode="add"
        apartmentId={roomModal.apartmentId}
        onClose={() => setRoomModal(null)}
      />
    )}
    {roomModal && roomModal.mode === 'edit' && (
      <RoomModal
        mode="edit"
        apartmentId={roomModal.apartmentId}
        roomId={roomModal.roomId}
        currentTemp={roomModal.currentTemp}
        onClose={() => setRoomModal(null)}
      />
    )}
    </>
  );
}
