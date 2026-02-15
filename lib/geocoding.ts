/**
 * Geocoding via Photon (OpenStreetMap-powered) – production-quality.
 *
 * Why Photon over Nominatim?
 *  - Much better fuzzy / partial matching ("chandg" → Chandigarh)
 *  - No strict rate-limit (Nominatim enforces 1 req/s)
 *  - Same underlying OSM data
 */

// ─── Types ──────────────────────────────────────────────────────────
export interface GeocodingResult {
    display_name: string;
    lat: number;
    lon: number;
    tz?: string;
}

// ─── In-memory LRU cache ────────────────────────────────────────────
const cache = new Map<string, GeocodingResult[]>();
const MAX_CACHE = 200;
function cacheSet(key: string, value: GeocodingResult[]) {
    if (cache.size >= MAX_CACHE) {
        const first = cache.keys().next().value;
        if (first) cache.delete(first);
    }
    cache.set(key, value);
}

// ─── AbortController for in-flight cancellation ─────────────────────
let currentController: AbortController | null = null;

// ─── Timezone detection from coordinates ────────────────────────────
function detectTimezone(lat: number, lon: number, country?: string): string {
    // India shortcut
    if (country === "India" || (lat >= 8 && lat <= 37 && lon >= 68 && lon <= 97)) {
        return "Asia/Kolkata";
    }
    // Nepal
    if (country === "Nepal" || (lat >= 26 && lat <= 30.5 && lon >= 80 && lon <= 88.5)) {
        return "Asia/Kathmandu";
    }
    // Sri Lanka
    if (country === "Sri Lanka") return "Asia/Colombo";
    // Pakistan
    if (country === "Pakistan") return "Asia/Karachi";
    // Bangladesh
    if (country === "Bangladesh") return "Asia/Dhaka";

    // Rough longitude-based for rest of world
    if (lon >= -10 && lon <= 2) return "Europe/London";
    if (lon >= 2 && lon <= 16) return "Europe/Paris";
    if (lon >= 16 && lon <= 30) return "Europe/Athens";
    if (lon >= 50 && lon <= 60) return "Asia/Dubai";
    if (lon >= 90 && lon <= 105) return "Asia/Bangkok";
    if (lon >= 105 && lon <= 120) return "Asia/Shanghai";
    if (lon >= 120 && lon <= 145) return "Asia/Tokyo";
    if (lon >= 145 && lon <= 180) return "Australia/Sydney";
    if (lon >= -130 && lon <= -115) return "America/Los_Angeles";
    if (lon >= -115 && lon <= -100) return "America/Denver";
    if (lon >= -100 && lon <= -85) return "America/Chicago";
    if (lon >= -85 && lon <= -60) return "America/New_York";

    return "UTC";
}

// ─── Core search (Photon) ───────────────────────────────────────────
async function searchPhoton(query: string, signal: AbortSignal): Promise<GeocodingResult[]> {
    const cacheKey = query.toLowerCase().trim();
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lang=en`;

    const res = await fetch(url, { signal });
    if (!res.ok) return [];

    const json = await res.json();
    const features: any[] = json.features || [];

    const results: GeocodingResult[] = features
        .filter((f: any) => {
            const t = f.properties?.type;
            return ["city", "town", "village", "hamlet", "suburb", "district", "county", "state", "locality", "region"].includes(t);
        })
        .map((f: any) => {
            const p = f.properties || {};
            const [lon, lat] = f.geometry?.coordinates || [0, 0];
            const parts = [p.name, p.state, p.country].filter(Boolean);
            return {
                display_name: parts.join(", "),
                lat,
                lon,
                tz: detectTimezone(lat, lon, p.country),
            };
        });

    cacheSet(cacheKey, results);
    return results;
}

// ─── Debounced search with cancellation ─────────────────────────────
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function debouncedSearch(
    query: string,
    callback: (results: GeocodingResult[]) => void
) {
    // Cancel previous debounce
    if (debounceTimer) clearTimeout(debounceTimer);

    // Cancel any in-flight request
    if (currentController) currentController.abort();

    debounceTimer = setTimeout(async () => {
        const controller = new AbortController();
        currentController = controller;
        try {
            const results = await searchPhoton(query, controller.signal);
            if (!controller.signal.aborted) {
                callback(results);
            }
        } catch {
            if (!controller.signal.aborted) callback([]);
        }
    }, 300); // 300ms debounce — Photon is more lenient than Nominatim
}
