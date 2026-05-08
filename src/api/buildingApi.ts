import { useBuildingStore } from '../store/useBuildingStore';

export async function fetchApartment(id: number) {
  await new Promise<void>(r => setTimeout(r, 700));
  return useBuildingStore.getState().building.getApartment(id) ?? null;
}
