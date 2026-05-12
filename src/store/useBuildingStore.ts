import { create } from 'zustand';
import { Building } from '../models/Building';
import type { RoomType } from '../models/CommonRoom';
import { serialiseBuilding, deserialiseBuilding, STORAGE_KEY } from './buildingStorage';
import type { SerialisedBuilding } from './buildingStorage';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BuildingStore {
  building: Building;
  lastUpdated: Date;

  setBuildingTemp: (temp: number) => void;
  addApartment: (id: number, owner: string) => void;
  removeApartment: (id: number) => void;
  editApartmentOwner: (id: number, owner: string) => void;
  addRoom: (apartmentId: number) => void;
  removeRoom: (apartmentId: number, roomId: string) => void;
  editRoomTemp: (apartmentId: number, roomId: string, temp: number) => void;
  addCommonRoom: (type: RoomType) => void;
  removeCommonRoom: (id: string) => void;
  tick: () => void;
}

// ── localStorage helpers ──────────────────────────────────────────────────────

/** Writes the current building state to localStorage after every mutation. */
function saveToStorage(b: Building): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ building: serialiseBuilding(b) }));
  } catch {
    // Storage quota exceeded or unavailable — continue without persisting.
  }
}

/** Reads from localStorage on first load. Falls back to the initial building if missing or corrupted. */
function getInitialBuilding(): Building {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { building?: SerialisedBuilding };
      if (parsed?.building) return deserialiseBuilding(parsed.building);
    }
  } catch {
    // Corrupted storage — fall through to default.
  }
  return createInitialBuilding();
}

/** Creates the default building as specified in the brief. */
function createInitialBuilding(): Building {
  const b = new Building(20.0);

  b.setApartment(101, 'Alex Johnson');
  b.setApartment(102, 'Sam Rivera');

  for (let i = 0; i < 5; i++) {
    b.getApartment(101)!.addRoom();
    b.getApartment(102)!.addRoom();
  }

  b.addCommonRoom('Gym');
  b.addCommonRoom('Library');
  b.addCommonRoom('Laundry');

  b.updateAll();
  return b;
}

// ── Store ─────────────────────────────────────────────────────────────────────
// Uses plain create() — no persist middleware.
// localStorage is managed manually via saveToStorage() so there is no async
// race condition between Zustand's state updates and the serialisation.

export const useBuildingStore = create<BuildingStore>()((set, get) => ({
  building: getInitialBuilding(),
  lastUpdated: new Date(),

  setBuildingTemp: (temp) => {
    const b = get().building.clone();
    b.setBuildingTemp(temp);
    saveToStorage(b);
    set({ building: b, lastUpdated: new Date() });
  },

  addApartment: (id, owner) => {
    const b = get().building.clone();
    b.setApartment(id, owner);
    b.updateAll();
    saveToStorage(b);
    set({ building: b, lastUpdated: new Date() });
  },

  removeApartment: (id) => {
    const b = get().building.clone();
    b.removeApartment(id);
    saveToStorage(b);
    set({ building: b, lastUpdated: new Date() });
  },

  editApartmentOwner: (id, owner) => {
    const b = get().building.clone();
    b.getApartment(id)?.setOwner(owner);
    saveToStorage(b);
    set({ building: b, lastUpdated: new Date() });
  },

  addRoom: (apartmentId) => {
    const b = get().building.clone();
    b.getApartment(apartmentId)?.addRoom();
    b.updateAll();
    saveToStorage(b);
    set({ building: b, lastUpdated: new Date() });
  },

  removeRoom: (apartmentId, roomId) => {
    const b = get().building.clone();
    b.getApartment(apartmentId)?.removeRoom(roomId);
    saveToStorage(b);
    set({ building: b, lastUpdated: new Date() });
  },

  editRoomTemp: (apartmentId, roomId, temp) => {
    const b = get().building.clone();
    const room = b.getApartment(apartmentId)?.getRoom(roomId);
    if (room) {
      room.setCurrTemp(temp);
      room.updateHVAC(b.buildingTemp);
    }
    saveToStorage(b);
    set({ building: b, lastUpdated: new Date() });
  },

  addCommonRoom: (type) => {
    const b = get().building.clone();
    b.addCommonRoom(type);
    b.updateAll();
    saveToStorage(b);
    set({ building: b, lastUpdated: new Date() });
  },

  removeCommonRoom: (id) => {
    const b = get().building.clone();
    b.removeCommonRoom(id);
    saveToStorage(b);
    set({ building: b, lastUpdated: new Date() });
  },

  tick: () => {
    const b = get().building.clone();
    b.tick();
    saveToStorage(b);
    set({ building: b, lastUpdated: new Date() });
  },
}));
