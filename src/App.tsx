import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useBuildingStore } from './store/useBuildingStore';
import { BuildingHeader } from './components/BuildingHeader';
import { BuildingView } from './views/BuildingView';
import { ApartmentView } from './views/ApartmentView';
import { RoomModal } from './components/modals/RoomModal';
import { ApartmentModal } from './components/modals/ApartmentModal';
import type { Apartment } from './models/Apartment';

const TICK_INTERVAL_MS = 5_000;

type AddRoomModal  = { mode: 'add';  apartmentId: number };
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
    <div className="h-screen flex flex-col overflow-hidden">
      <BuildingHeader onAddApartment={() => setAddingApartment(true)} />

      {/* flex-1 so routes fill remaining height; each route controls its own overflow */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route
            path="/"
            element={<BuildingView onAddApartment={() => setAddingApartment(true)} />}
          />
          <Route
            path="/level/:id"
            element={
              <div className="flex-1 overflow-y-auto bg-ci-off-white">
                <ApartmentView
                  onAddRoom={id => setRoomModal({ mode: 'add', apartmentId: id })}
                  onEditRoom={(apartmentId, roomId) => {
                    const room = building.getApartment(apartmentId)?.getRoom(roomId);
                    if (room) setRoomModal({ mode: 'edit', apartmentId, roomId, currentTemp: room.currTemp });
                  }}
                  onEditOwner={apt => setEditingApartment(apt)}
                />
              </div>
            }
          />
        </Routes>
      </div>

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
