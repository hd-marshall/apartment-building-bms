import { useState, useEffect } from 'react';
import { useBuildingStore } from './store/useBuildingStore';
import { BuildingHeader } from './components/BuildingHeader';
import { LoadingScreen } from './components/LoadingScreen';
import { BuildingView } from './views/BuildingView';
import { ApartmentView } from './views/ApartmentView';
import { RoomModal } from './components/modals/RoomModal';
import { ApartmentModal } from './components/modals/ApartmentModal';
import { fetchApartment } from './api/buildingApi';
import type { Apartment } from './models/Apartment';

const TICK_INTERVAL_MS = 5_000;

type View =
  | { name: 'building' }
  | { name: 'loading' }
  | { name: 'apartment'; id: number };

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

  const [view, setView] = useState<View>({ name: 'building' });
  const [addingApartment, setAddingApartment] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [roomModal, setRoomModal] = useState<RoomModalState>(null);

  const handleFloorClick = async (apartmentId: number) => {
    setView({ name: 'loading' });
    const apt = await fetchApartment(apartmentId);
    setView(apt ? { name: 'apartment', id: apartmentId } : { name: 'building' });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <BuildingHeader onAddApartment={() => setAddingApartment(true)} />

      {view.name === 'loading' && <LoadingScreen />}

      {view.name === 'building' && (
        <BuildingView
          onFloorClick={handleFloorClick}
          onAddApartment={() => setAddingApartment(true)}
        />
      )}

      {view.name === 'apartment' && (
        <div className="flex-1 overflow-y-auto bg-ci-off-white">
          <ApartmentView
            apartmentId={view.id}
            onBack={() => setView({ name: 'building' })}
            onAddRoom={id => setRoomModal({ mode: 'add', apartmentId: id })}
            onEditRoom={(apartmentId, roomId) => {
              const room = building.getApartment(apartmentId)?.getRoom(roomId);
              if (room) setRoomModal({ mode: 'edit', apartmentId, roomId, currentTemp: room.currTemp });
            }}
            onEditOwner={apt => setEditingApartment(apt)}
          />
        </div>
      )}

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
