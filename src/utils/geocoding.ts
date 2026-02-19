const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18`,
      {
        headers: { 'User-Agent': 'SapJuice/1.0' },
      }
    );
    const data = await res.json();
    return data?.display_name ?? `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}
