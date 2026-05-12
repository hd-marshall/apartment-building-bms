# Apartment Building BMS — Technical Overview

Built with TypeScript and React as specified.

---

## Requirements coverage

### Core requirements

| Requirement | Implementation |
|---|---|
| `Room` with ID, `currTemp`, `coolingStatus`, `heatingStatus` | `Room` class extends `ThermalUnit`, which owns all three temperature/HVAC fields |
| Room ID derived from apartment ID + incrementing index | ID format is `"<apartmentId>-<roomIndex>"` e.g. `"3-2"` |
| Initial room temperature is a random value between 10 and 40 degrees | `ThermalUnit` constructor sets `_currTemp = Math.random() * 30 + 10` |
| Heating on when room temp is below building setpoint | `updateHVAC()` sets `heatingStatus = currTemp < buildingTemp` |
| Cooling on when room temp is above building setpoint | `updateHVAC()` sets `coolingStatus = currTemp > buildingTemp` |
| `Apartment` with `apartmentId`, `owner`, and a list of `Room` instances | `Apartment` class owns a `Map<roomId, Room>` |
| `Building` with a list of apartments and a `buildingTemp` setpoint | `Building` class owns a `Map<id, Apartment>` and exposes `setBuildingTemp()` |
| Building setpoint defaults to 25.0 degrees | `createInitialBuilding()` calls `new Building(25.0)` |
| Building starts with apartments 101 and 102, each with 5 rooms | Seed data creates 20 named apartments (see Assumptions) |
| CRUD for all classes | Full add / remove / edit for buildings, apartments, and rooms via UI and store actions |

### Optional requirements — all implemented

| Optional requirement | Implementation |
|---|---|
| `CommonRoom` with a type of `Gym`, `Library`, or `Laundry` | `CommonRoom` extends `Room`; type is a union `'Gym' \| 'Library' \| 'Laundry'` |
| Add a Gym, Library, and Laundry to the building | Seed data adds all three via `b.addCommonRoom()` |
| Real weather data from an external API | `useWeather` fetches live Melbourne weather from Open-Meteo (no API key required) |
| Recalculate on a schedule or timer | `App.tsx` runs `tick()` every 5 seconds via `setInterval` |
| Temperatures slowly drift each update based on HVAC state | `driftTemp()` in `ThermalUnit` nudges `currTemp` a small random amount each tick |

### UI requirements — all implemented

| UI requirement | Implementation |
|---|---|
| Detailed status of a building and its rooms | `BuildingView` (dashboard) + `ApartmentView` (per-suite detail) |
| Card or header showing building properties | Building temperature card with live setpoint slider, centred on the dashboard |
| Each room shown as a card with temperature and heating/cooling status | `RoomCard` component on `ApartmentView` — shows temp, status badge, visual temp bar |
| Ability to set the building's requested temperature | Range slider in the building card (10–40 °C, 0.5 °C steps); updates all room statuses instantly |
| Updated heating/cooling statuses reflect the new temperature | Every `setBuildingTemp()` call triggers `updateAll()`, which recalculates every room's HVAC state |
| Add, remove, and edit rooms in a building | Done via modals on `ApartmentView`; also add/remove apartments from `BuildingView` |
| Display real weather data | `BuildingHeader` shows live Melbourne temperature and description from Open-Meteo |
| Anything else you feel should be included | Energy usage chart, average room temperature chart, building facade SVG, localStorage persistence |

---

## Assumptions

- **20 apartments instead of 2.** The spec seeds apartments 101 and 102 as a starting point. I treated this as a minimum baseline and seeded 20 named tenants (levels 1–20) to make the UI more interesting to explore and demonstrate that the system scales correctly. All CRUD operations still work on any count.
- **Named tenants.** The spec leaves owner names unspecified; I added realistic names so apartment cards are readable at a glance.
- **Room count per apartment varies (3–5).** The spec seeds 5 rooms per apartment; I varied this between 3 and 5 to show the layout adapts to different room counts.
- **Building setpoint of 25 °C.** The spec defines a default of 20.0 °C at the class level but explicitly sets 25.0 °C in the main application section. I followed the main application figure.
- **"Recalculate on a schedule" means all room temperatures drift and HVAC states update.** Each tick drifts every room's temperature slightly then recalculates heating/cooling, so the dashboard stays live without manual interaction.
- **localStorage persistence.** The spec does not mention persistence; I added it so a page refresh does not reset the building state, which makes the app feel more like a real control system.

---

## 1. Data Models

The domain is modelled as a class hierarchy. Every object that holds a temperature and heating/cooling state inherits from a single abstract base class, so the HVAC logic lives in one place.

### Class hierarchy

```
ThermalUnit  (abstract base — owns currTemp, coolingStatus, heatingStatus)
├── Room          (adds ID and cloning)
│   └── CommonRoom  (adds type: 'Gym' | 'Library' | 'Laundry')
│
Apartment    (owns a Map of Rooms, not a ThermalUnit)
Building     (owns a Map of Apartments + a CommonRoom array)
```

### What each class does

**`ThermalUnit`** — the shared thermal core

Holds `currTemp`, `coolingStatus`, and `heatingStatus`. Two key methods:

- `updateHVAC(buildingTemp)` — sets heating on if `currTemp < buildingTemp`, cooling on if `currTemp > buildingTemp`, both off if equal.
- `driftTemp()` — moves `currTemp` by a small random amount each simulation tick, clamped to the 10–40 degree range.

**`Room`** — a single room inside an apartment

Extends `ThermalUnit`. The constructor sets `currTemp` to a random value between 10 and 40 degrees as required. Its ID is composed from the parent apartment's ID and a monotonic index: `"<apartmentId>-<roomIndex>"`.

**`CommonRoom`** — a shared building facility

Extends `Room`. Adds a `type` property restricted to `'Gym'`, `'Library'`, or `'Laundry'`. Uses a `"CR-"` ID prefix so it is never confused with an apartment room. Stored directly on the `Building`.

**`Apartment`** — a tenant's suite

Owns a `Map<roomId, Room>`. The `_nextRoomIndex` counter is monotonically increasing, so room IDs remain unique even after rooms are deleted — deleting room 2 and adding a new one gives ID `3`, not a reused `2`. Exposes `addRoom()`, `removeRoom()`, `updateAllRooms()`, and `driftAllRooms()`.

**`Building`** — the top-level aggregate

Owns a `Map<apartmentId, Apartment>` and a `CommonRoom[]`. The single `buildingTemp` setpoint is what every room in the building measures itself against. Key methods:

- `updateAll()` — walks every apartment room and common room and calls `updateHVAC(buildingTemp)`.
- `setBuildingTemp(temp)` — updates the setpoint then immediately calls `updateAll()` so the UI reflects the change instantly.
- `tick()` — drifts all room temperatures then calls `updateAll()`. This is the one method called by the 5-second timer.

### Relationship diagram

```
Building
│  buildingTemp: number  (the shared setpoint for all rooms)
│
├── apartments: Map<apartmentId, Apartment>
│     │  apartmentId: number
│     │  owner: string
│     │
│     └── rooms: Map<roomId, Room>   ← extends ThermalUnit
│               id: string           (e.g. "3-2")
│               currTemp: number
│               coolingStatus: boolean
│               heatingStatus: boolean
│
└── commonRooms: CommonRoom[]   ← extends Room → extends ThermalUnit
          id: string            (e.g. "CR-1")
          type: 'Gym' | 'Library' | 'Laundry'
          currTemp: number
          coolingStatus: boolean
          heatingStatus: boolean
```

---

## 2. State Management — Zustand + localStorage

### The Zustand store

Zustand is a lightweight React state library. The entire `Building` instance lives in a single store, with one action per operation:

```
useBuildingStore
│
├── building: Building     ← single source of truth for all data
├── lastUpdated: Date      ← bumped on every change; hooks watch this to know when to recalculate
│
├── Apartment actions      addApartment / removeApartment / editApartmentOwner
├── Room actions           addRoom / removeRoom / editRoomTemp
├── Common room actions    addCommonRoom / removeCommonRoom
├── Setpoint action        setBuildingTemp
└── Simulation             tick
```

Every action follows the same three-step pattern:

```
1. Clone the Building   →  so React sees a new object reference and re-renders
2. Mutate the clone     →  call the relevant Building/Apartment/Room method
3. Persist + commit     →  saveToStorage(clone), then set({ building: clone })
```

Mutating the original object in place would not trigger a re-render because React and Zustand check object identity. The clone ensures the reference always changes.

### Why localStorage is managed manually

Zustand ships a `persist` middleware that can write state to localStorage automatically. It works well for plain data but does not know how to reconstruct class instances — it would deserialise them as plain objects with no methods. Because `Building`, `Apartment`, and `Room` are real classes, serialisation and deserialisation are handled manually in `buildingStorage.ts`:

```
Class instances  ──serialiseBuilding()──►  Plain JSON object  ──►  localStorage
localStorage     ──JSON.parse()──►  Plain JSON object  ──deserialiseBuilding()──►  Class instances
```

The storage key is versioned (`"conserveit-building-v5"`). If the stored data is from an older schema version, `JSON.parse` will produce an unexpected shape, `deserialiseBuilding` will fail, and the app falls back to the default seed data rather than crashing.

---

## 3. Frontend Structure

### Routing and simulation loop

```
App
├── BuildingHeader  (always visible — logo + live weather)
│
└── Routes
    ├── /           → BuildingView   (building dashboard)
    └── /level/:id  → ApartmentView  (single suite detail)
```

`App` owns the simulation timer. On mount it calls `setInterval(() => tick(), 5000)`, which fires every 5 seconds and advances the thermal simulation for every room in the building.

### BuildingView — the dashboard

```
BuildingView
│
├── Left sidebar       — L1–L20 level buttons (greyed out if unoccupied)
│                        click → simulated 700 ms API delay → navigate to /level/:id
│
├── BuildingFacade     — SVG of the building; lit windows = occupied floors
│
├── EnergyChart        — live line chart of system energy usage (left of SVG)
├── Building temp card — setpoint slider in the centre of the view
├── TempChart          — live line chart of average room temperature (right of SVG)
│
└── CommonRoomSection  — Gym, Library, Laundry cards along the bottom
```

### ApartmentView — suite detail

```
ApartmentView
│
├── Header        — level number, owner name, room count, heating/cooling summary
│
├── RoomCard grid — one card per room (responsive: 2, 3, or 4 columns)
│     ID, current temperature, HVAC status badge (Heating / Cooling / Idle)
│     visual temperature bar, Edit and Remove buttons
│
└── Action bar    — Add Room | Edit Tenant | Remove Suite
    Modals: ApartmentModal (add or edit) | RoomModal (add or edit)
```

### Component responsibilities

| Component | What it does |
|---|---|
| `BuildingHeader` | Logo and live Melbourne weather via `useWeather` |
| `BuildingFacade` | SVG building; windows light up for occupied levels |
| `RoomCard` | Renders one room — temperature, status badge, visual bar, edit/remove buttons |
| `CommonRoomSection` | Grid of Gym, Library, and Laundry cards with icons |
| `EnergyChart` | Recharts line chart fed by `useEnergyData` |
| `TempChart` | Recharts line chart fed by `useTempData` |
| `LoadingScreen` | Full-screen overlay shown during the simulated API navigation delay |
| `ApartmentModal` | Add or edit an apartment (same component, two modes) |
| `RoomModal` | Add or edit a room (same component, two modes) |

### Data flow

```
useBuildingStore (Zustand)
        │
        │  building,  lastUpdated
        ▼
  BuildingView / ApartmentView
        │
        ├──► BuildingFacade      receives apartments[]
        ├──► CommonRoomSection   receives commonRooms[]
        ├──► RoomCard            receives a single Room + buildingTemp
        │
        ├──► EnergyChart ──► useEnergyData() ──► reads building from store
        └──► TempChart   ──► useTempData()   ──► reads building from store
```

Components read from the store via selectors. Mutations (slider, add room, remove apartment) call a store action, which clones the building, mutates it, persists it, and commits — triggering a re-render everywhere that subscribed to the changed slice.

---

## 4. Hooks

All three custom hooks subscribe to `lastUpdated` from the store. Because `lastUpdated` is bumped on every mutation and on every `tick()`, the hooks recalculate automatically whenever the simulation advances or the user makes a change — no polling needed.

### `useWeather`

Fetches current Melbourne weather from the Open-Meteo API on mount (no API key required). The API returns a WMO weather code; the hook maps it to a human-readable label (e.g. code 61 becomes "Light rain"). Returns `{ weather, error }`. This is the only hook that calls an external service.

### `useTempData`

Runs every time `lastUpdated` changes:

1. Collects `currTemp` from every apartment room and every common room.
2. Calculates `avg`, `min`, and `max` across all rooms.
3. Reads `buildingTemp` as the `setpoint`.
4. Appends a timestamped point to a rolling 24-point history (older points drop off the left of the chart).

Returns `{ history, latest, delta }`. The `delta` value is `avg - setpoint`, which drives the badge on `TempChart` — for example `+0.4°C off` in green when close to target, `+3.1°C above` in orange when significantly over.

### `useEnergyData`

Runs every time `lastUpdated` changes:

1. Counts heating rooms, cooling rooms, and idle rooms across the whole building.
2. Calculates **actual** energy using fixed per-room rates:
   - Baseline: 5 kW
   - Each heating room: +0.30 kW
   - Each cooling room: +0.20 kW
   - Each idle room: +0.02 kW
3. Calculates a **target** energy assuming every room were idle (all HVAC off).
4. Appends an `EnergyPoint` to a rolling 24-point history.
5. Sets `isOptimal = true` when actual energy is within 2% of target.

Returns `{ history, latest, isOptimal }`. The `EnergyChart` uses `isOptimal` to colour the System Load badge green (optimal) or amber (above target).
