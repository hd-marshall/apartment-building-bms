import { Room } from './Room';

export type RoomType = 'Gym' | 'Library' | 'Laundry';

/** A shared building facility — extends Room with a fixed type label. */
export class CommonRoom extends Room {
  private _roomType: RoomType;

  // Prefix "CR" in the ID distinguishes common rooms from apartment rooms.
  constructor(index: number, type: RoomType, initialTemp: number) {
    super('CR', index, initialTemp);
    this._roomType = type;
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get roomType(): RoomType { return this._roomType; }

  // ── Setters ──────────────────────────────────────────────────────────────

  setRoomType(type: RoomType): void { this._roomType = type; }

  // ── Clone ────────────────────────────────────────────────────────────────

  /** _id is private to Room, so the inherited setId() setter is used instead of direct assignment. */
  clone(): CommonRoom {
    const r = Object.create(CommonRoom.prototype) as CommonRoom;
    r['_roomType'] = this._roomType;
    this.copyThermalState(r);
    r.setId(this.id);
    return r;
  }
}
