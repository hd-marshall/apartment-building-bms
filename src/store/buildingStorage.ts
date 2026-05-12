import { Building } from '../models/Building';
import { Apartment } from '../models/Apartment';
import { CommonRoom } from '../models/CommonRoom';
import type { RoomType } from '../models/CommonRoom';

export const STORAGE_KEY = 'conserveit-building-v5';

// ── Serialised shapes (plain objects safe for JSON.stringify) ─────────────────

interface SerialisedRoom {
  id: string;
  currTemp: number;
  coolingStatus: boolean;
  heatingStatus: boolean;
}

interface SerialisedCommonRoom extends SerialisedRoom {
  roomType: RoomType;
}

interface SerialisedApartment {
  apartmentId: number;
  owner: string;
  nextRoomIndex: number;
  rooms: SerialisedRoom[];
}

export interface SerialisedBuilding {
  buildingTemp: number;
  apartments: SerialisedApartment[];
  commonRooms: SerialisedCommonRoom[];
}

// ── Serialise ─────────────────────────────────────────────────────────────────

/** Converts class instances to a plain JSON-safe object. Must be called before JSON.stringify — Map fields are expanded to arrays here. */
export function serialiseBuilding(b: Building): SerialisedBuilding {
  return {
    buildingTemp: b.buildingTemp,
    apartments: b.apartments.map(a => ({
      apartmentId: a.apartmentId,
      owner: a.owner,
      nextRoomIndex: a.nextRoomIndex,
      rooms: a.rooms.map(r => ({
        id: r.id,
        currTemp: r.currTemp,
        coolingStatus: r.coolingStatus,
        heatingStatus: r.heatingStatus,
      })),
    })),
    commonRooms: b.commonRooms.map(r => ({
      id: r.id,
      currTemp: r.currTemp,
      coolingStatus: r.coolingStatus,
      heatingStatus: r.heatingStatus,
      roomType: (r as CommonRoom).roomType,
    })),
  };
}

// ── Deserialise ───────────────────────────────────────────────────────────────

/** Reconstructs full class instances from a plain serialised object. */
export function deserialiseBuilding(data: SerialisedBuilding): Building {
  const b = new Building(data.buildingTemp);

  for (const aptData of data.apartments) {
    b.setApartment(aptData.apartmentId, aptData.owner);
    const apt = b.getApartment(aptData.apartmentId) as Apartment;

    for (const roomData of aptData.rooms) {
      const room = apt.addRoom();
      room.setId(roomData.id);
      room.setCurrTemp(roomData.currTemp);
      room.setCoolingStatus(roomData.coolingStatus);
      room.setHeatingStatus(roomData.heatingStatus);
    }

    // Restores the counter so future addRoom() calls continue from the right index.
    apt.restoreRoomIndex(aptData.nextRoomIndex);
  }

  for (const crData of data.commonRooms) {
    const cr = b.addCommonRoom(crData.roomType);
    cr.setId(crData.id);
    cr.setCurrTemp(crData.currTemp);
    cr.setCoolingStatus(crData.coolingStatus);
    cr.setHeatingStatus(crData.heatingStatus);
  }

  b.updateAll();
  return b;
}
