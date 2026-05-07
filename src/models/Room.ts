import { ThermalUnit } from './ThermalUnit';

/** A single room with a unique ID and a caller-supplied initial temperature. */
export class Room extends ThermalUnit {
  private _id: string;

  // ID format: "<apartmentId>-<roomIndex>", e.g. "101-1"
  constructor(apartmentId: number | string, roomIndex: number, initialTemp: number) {
    super(initialTemp);
    this._id = `${apartmentId}-${roomIndex}`;
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get id(): string { return this._id; }

  // ── Setters ──────────────────────────────────────────────────────────────

  setId(id: string): void { this._id = id; }

  // ── Clone ────────────────────────────────────────────────────────────────

  /** Object.create skips the constructor so Math.random() is never called on a clone. */
  clone(): Room {
    const r = Object.create(Room.prototype) as Room;
    r._id = this._id;
    this.copyThermalState(r);
    return r;
  }
}
