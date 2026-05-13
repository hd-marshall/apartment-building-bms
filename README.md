# Apartment Building Task

Niagara Applications

**20/05/2026**

Harry Marshall

---

## Install & Run

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

---

## 1. How I broke down the problem

Reading through the requirements I believed there were three main stages to this application.

- **The data is needed:** The objects and their properties being the temperatures, rooms, apartments and building.
- **What behaviours will perform:** The heating and cooling of rooms and the temperature drift of each room towards to the set building temp.
- **What the user should see and interact with:** The UI, controls and having real-time feedback on building state.

---

## 2. Assumptions

A list of assumptions I made about the brief before going into the creation of the application.

- All apartments will have rooms and buildings will have apartments.
- localStorage persistence added so a page refresh doesn't reset state.
- Temperature drifts by 0.1°C per tick.
- Ticks fire every 5 seconds.
- Energy rates are fixed estimates (5 kW baseline, 0.30/0.20/0.02 kW per room).
- Weather API calls for Melbourne longitude and latitude.
- Simulated API delay is 700 ms.

---

## 3. Branches

The main branch follows the specification of the take home assignment to the best of my ability without any creative changes to the designed brief.

The branch `feat/building-frontend` takes inspiration from my visit to ARBS. From the first frontend I made I thought it was too basic and might not have the ability to scale to a real sized building and would need to be more separated in scale. I added more metrics around the tracking on the performance of the system for the whole building and wanted to use simulation API routing to make a quicker change to how a real system would handle data.

---

## 4. Data Models

A building has apartments and apartment has rooms. Primary function of monitoring rooms is temperature. I decided to create the class hierarchy off an abstract class called ThermalUnits. All objects use CRUD functions to manage data.

### `ThermalUnit` (abstract base)

**Variables:**
- `currTemp`
- `coolingStatus`
- `heatingStatus`

**Main Functions:**
- CRUD
- `updateStatus(var: BuildingTemp)` — sets heating or cooling based on set building temp.
- `driftTemp()` — moves currTemp towards the building temp called on clock cycle.

### `Room`

**Variables:**
- `id` — set by using apartment parent id and then the next sequential id for room.

**Main Functions:**
- CRUD

### `CommonRoom`

**Variables:**
- `id` — prefixes with CR and stored directly in building class.
- `type` — enum for the restrict type of room.

**Main Functions:**
- CRUD

### `Apartment`

**Variables:**
- `id`
- `owner`
- `rooms` — dict storing all associated room objects.
- `nextRoomIndex` — avoids the need for scanning the list for next available apartment number.

**Main Functions:**
- CRUD

### `Building`

**Variables:**
- `buildingTemp` — the set temperature for the whole building.
- `apartments` — dict for storing all associated apartment objects.
- `commonRooms` — list for storing all associated common room objects.

**Main Functions:**
- `updateAll()` — calls updateStatus() on all rooms including common rooms.
- `setBuildingTemp(float)` — updates the set point for the building and calls updateAll().
- `tick()` — drifts all rooms temperatures.
- CRUD

---

## 5. State Management

As I am not taking in data from any cloud services or hardware devices, instantiating and storing this at run time was an important part of the program.

I used to store the whole propagated Building object in the browser in local storage using Zustand. It is a lightweight React state library. Every action to the data happens in three steps.

1. Clone the building object.
2. Mutate the clone.
3. Commit the changes.

Mutating the original in place would not trigger a re-render because React and Zustand check object identity. The clone step ensures the reference always changes.

Zustand uses a persist middleware that saves state to the local storage in the browser automatically. The conversion and back from JSON helps keep all the possible methods of the object classes that are being held by Building.

---

## 6. Frontend Management

The primary file of a React project is the App.tsx, using a function on a timer to simulate the clock cycles. `setInterval(() => tick(), 5000)` will fire every 5 seconds and will push forward the thermal simulation.

Using a simulated API route as the GET function only will retrieve from local storage. I will get the apartment id and then render the new page based on that data. There is a built in 700ms delay showing off a loading screen that could possibly be needed in a real-life cloud-based solution.

**Building View — route `/`**

**Apartment View — route `/level/{id}`**

### Data Flow

```
useBuildingStore (Zustand)
        │
        │  building,  lastUpdated
        ▼
  BuildingView / ApartmentView
        │
        ├──► BuildingFacade      receives apartments list
        ├──► CommonRoomSection   receives common rooms list
        ├──► RoomCard            receives a single Room and the building setpoint
        │
        ├──► EnergyChart ──► useEnergyData() ──► reads building from store
        └──► TempChart   ──► useTempData()   ──► reads building from store
```

---

## 7. Hooks

All three hooks begin at runtime and are recalled during each tick().

### `useWeather`

Fetches the current weather data of Melbourne based on latitude and longitude coordinates. It calls a public weather API without the need for an API key called Open-Meteo API.

It uses `useEffect()` and is called once at the beginning of the application and is stored in local storage and is displayed in the navigation bar.

### `useTempData`

Firstly, both `useTempData` and `useEnergyData` use Recharts — a React charting library which uses JSX components called `<LineChart>`, `<XAxis>`, and `<Tooltip>`.

It runs every time `lastUpdated()` is called which happens when `tick()` is called.

`useTempData` calls all the currTemps of every room temperature. It calculates the average, minimum and maximum temperature. It appends to the history array and removes anything out of the 24-hour cycle.

### `useEnergyData`

It runs every time `lastUpdated()` is called which happens when `tick()` is called.

Runs through all the rooms and adds all the rooms that are heating, cooling and idle. Using this it calculates the energy consumption of the building by comparing to what the baseline energy consumption.

Baseline / optimal energy calculation is based off my assumptions:

```
Optimal = 5kw + (0.02 × idle_room)
```

Actual energy calculation is:

```
Actual = 5kw + (0.30 × heating_room) + (0.20 × cooling_room) + (0.02 × idle_room)
```

The difference between is what is used to create the visual aid for the graph. Being 2% off the optimal is deemed as optimal in the graph notation.
