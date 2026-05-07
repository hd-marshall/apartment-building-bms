import { useState, useEffect } from 'react';
import { useBuildingStore } from './store/useBuildingStore';
import { BuildingHeader } from './components/BuildingHeader';
import { ApartmentSection } from './components/ApartmentSection';
import { CommonRoomSection } from './components/CommonRoomSection';
import { RoomModal } from './components/modals/RoomModal';
import { ApartmentModal } from './components/modals/ApartmentModal';
import type { Apartment } from './models/Apartment';

const TICK_INTERVAL_MS = 5_000;

type AddRoomModal = { mode: 'add'; apartmentId: number };
type EditRoomModal = { mode: 'edit'; apartmentId: number; roomId: string; currentTemp: number };
type RoomModalState = AddRoomModal | EditRoomModal | null;

export default function App() {
  const building = useBuildingStore(s => s.building);
  const tick = useBuildingStore(s => s.tick);

  useEffect(() => {
    const id = setInterval(tick, TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [tick]);

  const [addingApartment, setAddingApartment] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [roomModal, setRoomModal] = useState<RoomModalState>(null);

  return (
    <div className="min-h-screen bg-ci-off-white">
      <BuildingHeader onAddApartment={() => setAddingApartment(true)} />

      <main className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">
        <CommonRoomSection
          commonRooms={building.commonRooms}
          buildingTemp={building.buildingTemp}
        />

        <div className="flex flex-col gap-4">
          {building.apartments.length === 0 ? (
            <div className="text-center py-20 text-slate-600">
              <p className="text-lg">No apartments yet.</p>
              <button
                onClick={() => setAddingApartment(true)}
                className="mt-3 text-blue-500 hover:text-blue-400 text-sm cursor-pointer"
              >
                Add the first apartment
              </button>
            </div>
          ) : (
            building.apartments.map(apt => (
              <ApartmentSection
                key={apt.apartmentId}
                apartment={apt}
                buildingTemp={building.buildingTemp}
                onAddRoom={id => setRoomModal({ mode: 'add', apartmentId: id })}
                onEditRoom={(apartmentId, roomId) => {
                  const room = building.getApartment(apartmentId)?.getRoom(roomId);
                  if (room) setRoomModal({ mode: 'edit', apartmentId, roomId, currentTemp: room.currTemp });
                }}
                onEditOwner={apt => setEditingApartment(apt)}
              />
            ))
          )}
        </div>
      </main>

      {addingApartment && (
        <ApartmentModal mode="add" onClose={() => setAddingApartment(false)} />
      )}
      {editingApartment && (
        <ApartmentModal
          mode="edit"
          apartment={editingApartment}
          onClose={() => setEditingApartment(null)}
        />
      )}
      {roomModal?.mode === 'add' && (
        <RoomModal
          mode="add"
          apartmentId={roomModal.apartmentId}
          onClose={() => setRoomModal(null)}
        />
      )}
      {roomModal?.mode === 'edit' && (
        <RoomModal
          mode="edit"
          apartmentId={roomModal.apartmentId}
          roomId={roomModal.roomId}
          currentTemp={roomModal.currentTemp}
          onClose={() => setRoomModal(null)}
        />
      )}
    </div>
  );
}
