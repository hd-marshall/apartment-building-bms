# Niagara Building Management System

A building controls prototype built for the Niagara Apps UX Developer take-home task.

## What it does

- Models a building with apartments, rooms, and common areas (Gym, Library, Laundry)
- Calculates heating/cooling status per room against a target building temperature
- Simulates temperature drift every 30 seconds — rooms slowly move toward the target
- Fetches real outside weather from Open-Meteo (no API key required)
- Persists state to localStorage so a page refresh doesn't reset everything
- Full CRUD for apartments and rooms via modal dialogs

## Quickstart

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Stack

|           |                       |
| --------- | --------------------- |
| Framework | React 19 + TypeScript |
| Build     | Vite 8                |
| Styling   | Tailwind CSS v4       |
| State     | Zustand 5             |
| Icons     | lucide-react          |
| Weather   | Open-Meteo            |

## Architecture

# Design Decisions & GitHub Roadmap

## 1. Design Decisions

### Stack

| Choice                    | Why                                                                                                                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React 19 + TypeScript** | Industry standard. Strict types catch bugs at compile time; JSX gives a declarative UI layer over the class domain model.                                                                                  |
| **Vite 8**                | Near-instant HMR and ESM-native dev server. `@vitejs/plugin-react` uses Babel's SWC transform — no Webpack config to maintain.                                                                             |
| **Tailwind CSS v4**       | Utility-first means styles live next to the markup they affect, no context-switching to a stylesheet. v4 removes the `tailwind.config.js` in favour of a `@theme` block in CSS, which is less boilerplate. |
| **Zustand 5**             | Minimal. No providers, no reducers, no boilerplate. The store is just a plain object with methods — easy to read and test in isolation.                                                                    |
| **Lucide-react**          | Consistent SVG icon set, tree-shakeable, typed.                                                                                                                                                            |

---

### Domain Model (OOP inside React)

The domain is modelled as a class hierarchy rather than plain objects:

```
ThermalUnit (abstract)
  ├── Room
  └── CommonRoom
Apartment  (owns a Map<string, Room>)
Building   (owns a Map<number, Apartment> + CommonRoom[])
```

**Why classes instead of plain objects / records?**

- The thermal simulation logic (`updateHVAC`, `driftTemp`) belongs _with_ the data, not scattered across utility functions.
- `ThermalUnit` is an abstract base — `Room` and `CommonRoom` share heating/cooling logic without copy-pasting it.
- `clone()` is defined on every class so Zustand's immutable update pattern (clone → mutate → set) is clean and explicit.

**Why `Map` for rooms and apartments?**

- `Apartment.getRoom(id)` and `Building.getApartment(id)` are O(1) instead of O(n) `Array.find`.
- A monotonic counter (`_nextRoomIndex`) generates unique IDs without scanning existing entries.

---

### State Management — Clone-on-Write

Every Zustand action follows the same pattern:

```ts
const b = get().building.clone(); // deep copy
b.doSomething(); // mutate the copy
set({ building: b }); // replace reference → React re-renders
```

This keeps React's referential-equality checks working correctly (no accidental stale renders from mutating in place) and avoids needing `immer` middleware.

---

### Persistence — Manual localStorage, No Middleware

Zustand has a `persist` middleware, but it wasn't used here. Why:

- The domain uses `Map` fields, which `JSON.stringify` silently serializes as `{}`. The `persist` middleware would have produced corrupted data on every reload.
- Manual `serializeBuilding` / `deserializeBuilding` functions in `buildingStorage.ts` handle the Map → Array → Map round-trip explicitly.
- `saveToStorage()` runs synchronously inside every mutation — no async race conditions between state updates and writes.

The storage key is versioned (`niagara-building-v1`) so future schema changes can be handled with a migration rather than corrupting existing saved state.

---

### Temperature Simulation

A `tick()` fires every 30 seconds (configurable via `TICK_INTERVAL_MS` in `App.tsx`):

- Rooms whose `currTemp < buildingTemp` are marked as **heating** and drift +0.5°C per tick.
- Rooms above target are **cooling** and drift −0.5°C.
- At-target rooms add small Gaussian noise (`±0.1°C`) so the UI doesn't feel frozen.

This is intentionally simple — it demonstrates the HVAC concept without needing a physics engine.

---

### Weather

`useWeather` fetches from **Open-Meteo** — a free, no-API-key weather API. Coordinates are hardcoded to Melbourne, Australia (`-37.81, 144.96`). WMO weather codes are mapped to human-readable descriptions locally. The fetch runs once on mount with no polling.

---

### UI — Header Redesign

The header was changed from a blue (`bg-ci-blue`) banner to a **white** background with the Niagara Framework logo (`niagara.png`) because:

- The Niagara logo is light-background — it reads poorly on dark blue.
- White gives a cleaner, more enterprise dashboard feel appropriate for a BMS.
- A green accent line at the bottom of the header connects to the rest of the color system.

---

## 2. GitHub Roadmap

Work through these in order. Each phase has a clear scope and produces a commit or PR that makes sense on its own.

---

### Phase 0 — Repo hygiene (do first, before any feature work)

1. **Initialise git** (if not done):

   ```bash
   git init
   git remote add origin <your-github-url>
   ```

2. **Check `.gitignore`** — ensure `node_modules/`, `dist/`, `.env*` are excluded. The Vite scaffold already does this.

3. **Write a real `README.md`** — the current one is the Vite boilerplate. Replace it with:
   - What the project is and what it demonstrates
   - Screenshot / GIF
   - `npm install && npm run dev` quickstart
   - Brief architecture note pointing to this file

4. **First commit** — one commit with the full initial state:

   ```
   feat: initial Niagara BMS prototype

   React 19 + TypeScript + Zustand + Tailwind v4.
   OOP domain model, localStorage persistence,
   Open-Meteo weather, 30 s thermal simulation.
   ```

---

### Phase 1 — Code quality gates

These should be set up before any feature PRs are merged so every future commit already passes them.

- **Fix the Tailwind v4 deprecation warning**: rename `bg-gradient-to-r` → `bg-linear-to-r` in `BuildingHeader.tsx:154`.
- **Add Prettier**:
  ```bash
  npm install -D prettier prettier-plugin-tailwindcss
  ```
  Add `.prettierrc` and a `format` npm script. Tailwind plugin auto-sorts class names.
- **Add `lint` to CI** — run `npm run lint` in GitHub Actions so bad merges are blocked.
- **GitHub Actions CI file** (`.github/workflows/ci.yml`):
  ```yaml
  on: [push, pull_request]
  jobs:
    ci:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with: { node-version: 20, cache: npm }
        - run: npm ci
        - run: npm run lint
        - run: npm run build
  ```

---

### Phase 2 — Testing

The codebase has no tests yet. Vitest + React Testing Library is the natural fit (same config file as Vite).

Priority order:

1. **Unit test the domain models** — pure class logic, no React needed:
   - `ThermalUnit.updateHVAC` sets heating/cooling flags correctly
   - `ThermalUnit.driftTemp` moves temperature in the right direction
   - `Building.clone()` is a deep copy (mutating clone doesn't affect original)
   - `buildingStorage` round-trips correctly (serialize → deserialize → same state)

2. **Unit test the Zustand store** — mock `localStorage`, call actions, assert state.

3. **Component smoke tests** — render `<BuildingHeader>` with props, assert key text is in the DOM.

Setup:

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

Add to `vite.config.ts`:

```ts
test: { environment: 'jsdom', globals: true, setupFiles: './src/test/setup.ts' }
```

---

### Phase 3 — Branching strategy

Use a simple two-branch model:

| Branch           | Purpose                                            |
| ---------------- | -------------------------------------------------- |
| `main`           | Stable, deployable. Direct pushes blocked.         |
| `feature/<name>` | All work happens here, opened as a PR into `main`. |

Commit messages should follow **Conventional Commits**:

- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — tooling / dependency updates
- `refactor:` — no behaviour change
- `test:` — adding or updating tests
- `docs:` — documentation only

Example: `fix: resolve missing niagara logo import in BuildingHeader`

---

### Phase 4 — Deployment (optional, good for portfolio)

Deploy the built static site to **Vercel** or **GitHub Pages**:

- Vercel: connect the repo, set build command `npm run build`, output dir `dist`. Done.
- GitHub Pages: add a `deploy` job to CI that runs `npm run build` and publishes `dist/` using `peaceiris/actions-gh-pages`.

Add the live URL to the README.

---

### Phase 5 — Future features (stretch goals)

These are not required but demonstrate ambition if this is a portfolio piece:

- **Floor plan view** — visualise apartments spatially rather than as a list.
- **Alert system** — flag rooms that are >5°C from target for more than N ticks.
- **Historical chart** — log temperature history per room and render a sparkline (use `recharts` or `victory`).
- **Multi-building support** — the `Building` class is already self-contained, `useBuildingStore` could hold `Map<string, Building>`.
- **WebSocket simulation** — replace the 30 s `setInterval` with a fake WS stream to demonstrate real-time data handling.

## Assumptions & interpretation notes

- Room IDs are formatted as `<apartmentId><roomIndex>` (e.g. apartment 101 → rooms `1011`, `1012`, …)
- "Requested temperature" and "building temperature" are treated as the same concept
- Open-Meteo coordinates are hardcoded to Melbourne, Australia
- Temperature drift rate (0.5 °C/tick) and tick interval (30 s) are intentionally simple — the goal is demonstrating the concept, not physics accuracy
