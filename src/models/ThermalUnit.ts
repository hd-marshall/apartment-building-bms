/** Abstract base for any space that tracks temperature and HVAC state. */
export abstract class ThermalUnit {
  protected _currTemp: number;
  protected _coolingStatus: boolean;
  protected _heatingStatus: boolean;

  constructor(initialTemp: number) {
    this._currTemp = parseFloat(initialTemp.toFixed(1));
    this._coolingStatus = false;
    this._heatingStatus = false;
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get currTemp(): number { return this._currTemp; }
  get coolingStatus(): boolean { return this._coolingStatus; }
  get heatingStatus(): boolean { return this._heatingStatus; }

  // ── Setters ──────────────────────────────────────────────────────────────

  setCurrTemp(temp: number): void { this._currTemp = parseFloat(temp.toFixed(1)); }
  setCoolingStatus(status: boolean): void { this._coolingStatus = status; }
  setHeatingStatus(status: boolean): void { this._heatingStatus = status; }

  // ── Methods ──────────────────────────────────────────────────────────────

  /** Sets heating/cooling flags based on whether the room is above or below target. */
  updateHVAC(buildingTemp: number): void {
    this._heatingStatus = this._currTemp < buildingTemp;
    this._coolingStatus = this._currTemp > buildingTemp;
  }

  /** Nudges the temperature toward the target each tick; idle rooms get small random noise. */
  driftTemp(): void {
    let change = 0;

    if (this._heatingStatus) {
      change = 0.1;
    } else if (this._coolingStatus) {
      change = -0.1;
    } else {
      change = (Math.random() - 0.5) * 0.04;
    }

    this.setCurrTemp(this._currTemp + change);
  }

  // ── Clone helper ─────────────────────────────────────────────────────────

  /** Copies thermal fields onto a pre-allocated target without triggering constructor side effects. */
  protected copyThermalState(target: ThermalUnit): void {
    target._currTemp = this._currTemp;
    target._coolingStatus = this._coolingStatus;
    target._heatingStatus = this._heatingStatus;
  }
}
