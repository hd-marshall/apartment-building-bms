import { Apartment } from './Apartment';
import { CommonRoom } from './CommonRoom';
import type { RoomType } from './CommonRoom';

/** Top-level container — holds apartments and common rooms under a single target temperature. */
export class Building {
  private _buildingTemp: number;
  private _apartments: Map<number, Apartment>;
  private _commonRooms: CommonRoom[];

  constructor(temp = 20.0) {
    this._buildingTemp = temp;
    this._apartments = new Map();
    this._commonRooms = [];
  }

  // ── Apartment CRUD ───────────────────────────────────────────────────────

  /** No-op if the apartment ID already exists, preventing accidental overwrites. */
  setApartment(id: number, owner?: string): void {
    if (!this._apartments.has(id)) {
      this._apartments.set(id, new Apartment(id, owner));
    }
  }

  getApartment(id: number): Apartment | undefined { return this._apartments.get(id); }

  removeApartment(id: number): void { this._apartments.delete(id); }

  // ── Common room CRUD ─────────────────────────────────────────────────────

  addCommonRoom(type: RoomType): CommonRoom {
    const room = new CommonRoom(this._commonRooms.length + 1, type);
    this._commonRooms.push(room);
    return room;
  }

  removeCommonRoom(id: string): void {
    this._commonRooms = this._commonRooms.filter(r => r.id !== id);
  }

  // ── Methods ──────────────────────────────────────────────────────────────

  /** Recalculates all HVAC states immediately after the target temperature changes. */
  setBuildingTemp(temp: number): void {
    this._buildingTemp = parseFloat(temp.toFixed(1));
    this.updateAll();
  }

  /** Recalculates heating/cooling for every space in the building. */
  updateAll(): void {
    this._apartments.forEach(a => a.updateAllRooms(this._buildingTemp));
    this._commonRooms.forEach(r => r.updateHVAC(this._buildingTemp));
  }

  /** Drifts all room temperatures then recalculates HVAC — called on each simulation tick. */
  tick(): void {
    this._apartments.forEach(a => a.driftAllRooms());
    this._commonRooms.forEach(r => r.driftTemp());
    this.updateAll();
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get buildingTemp(): number { return this._buildingTemp; }
  get apartments(): Apartment[] { return [...this._apartments.values()]; }
  get commonRooms(): CommonRoom[] { return [...this._commonRooms]; }

  // ── Clone ────────────────────────────────────────────────────────────────

  clone(): Building {
    const b = new Building(this._buildingTemp);
    b._apartments = new Map([...this._apartments.entries()].map(([k, v]) => [k, v.clone()]));
    b._commonRooms = this._commonRooms.map(r => r.clone());
    return b;
  }
}
