# Niagara Building Management System

A building controls prototype built for the Niagara Apps UX Developer take-home task.

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## What's in this build

- Building with two default apartments (101, 102) have five rooms each plus Gym, Library, and Laundry common areas
- Per-room heating/cooling status calculated against a single building-wide target temperature (adjustable via slider)
- Temperature simulation: rooms drift ±0.1°C toward the target every 5 seconds
- Live outside weather (Melbourne) fetched from Open-Meteo on mount, displayed in the header — no API key required
- Full CRUD for apartments and rooms via modal dialogs
- State persisted to localStorage and page refresh keeps all changes

## Stack

|           |                       |
| --------- | --------------------- |
| Framework | React 19 + TypeScript |
| Build     | Vite 8                |
| Styling   | Tailwind CSS v4       |
| State     | Zustand 5             |
| Icons     | lucide-react          |
| Weather   | Open-Meteo            |

## Assumptions

- "Requested temperature" and "building temperature" are treated as the same concept — one slider controls the whole building
- Weather coordinates are hardcoded to Melbourne, Australia (`-37.81, 144.96`)
- Room IDs are derived from the apartment ID and a room index (e.g. apartment 101 → rooms `1011`, `1012`, …)
- The thermal simulation (0.1°C/tick, 5 s interval) is intentionally simple — it demonstrates the HVAC concept, not a physics model
