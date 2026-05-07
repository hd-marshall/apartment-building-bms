import { Room } from './Room';

/** Owns and manages a collection of rooms on behalf of a named resident. */
export class Apartment {
  private _apartmentId: number;
  private _owner: string;
  private _rooms: Map<string, Room>;
  private _nextRoomIndex: number; // monotonic counter — avoids scanning IDs for the next slot

  constructor(id: number, owner = 'Unassigned') {
    this._apartmentId = id;
    this._owner = owner;
    this._rooms = new Map();
    this._nextRoomIndex = 1;
  }

  // ── Room CRUD ────────────────────────────────────────────────────────────

  addRoom(): Room {
    const room = new Room(this._apartmentId, this._nextRoomIndex++, Math.random() * 30 + 10);
    this._rooms.set(room.id, room);
    return room;
  }

  removeRoom(id: string): void { this._rooms.delete(id); }

  getRoom(id: string): Room | undefined { return this._rooms.get(id); }

  /** Restores the counter during deserialization without an unsafe cast. */
  restoreRoomIndex(index: number): void { this._nextRoomIndex = index; }

  // ── Methods ──────────────────────────────────────────────────────────────

  updateAllRooms(buildingTemp: number): void {
    this._rooms.forEach(r => r.updateHVAC(buildingTemp));
  }

  driftAllRooms(): void {
    this._rooms.forEach(r => r.driftTemp());
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get apartmentId(): number { return this._apartmentId; }
  get owner(): string { return this._owner; }
  get nextRoomIndex(): number { return this._nextRoomIndex; }
  get rooms(): Room[] { return [...this._rooms.values()]; } // spread to array only at read time

  // ── Setters ──────────────────────────────────────────────────────────────

  setOwner(name: string): void { this._owner = name; }
  setApartmentId(id: number): void { this._apartmentId = id; }
  setRooms(rooms: Room[]): void {
    this._rooms = new Map(rooms.map(r => [r.id, r]));
  }

  // ── Clone ────────────────────────────────────────────────────────────────

  clone(): Apartment {
    const a = new Apartment(this._apartmentId, this._owner);
    a._nextRoomIndex = this._nextRoomIndex;
    a._rooms = new Map([...this._rooms.entries()].map(([k, v]) => [k, v.clone()]));
    return a;
  }
}
