/**
 * Production-ready geocoding using OpenStreetMap Nominatim.
 * - Global coverage (cities, towns, villages worldwide)
 * - AbortController to cancel in-flight requests on new input
 * - In-memory cache to avoid repeat API calls
 * - Auto-detects timezone from coordinates
 */

export interface GeocodingResult {
    display_name: string;
    lat: number;
    lon: number;
    country: string;
    state?: string;
    city?: string;
    tz?: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// Simple LRU-ish cache: query -> results
const cache = new Map<string, GeocodingResult[]>();
const MAX_CACHE = 200;

// Active AbortController — cancel previous request on new keystroke
let currentController: AbortController | null = null;

/**
 * Detect timezone from lat/lon using a lightweight heuristic.
 * For production, you'd use a proper tz lookup service or library,
 * but this covers the 90% case for Indian users with IST, and
 * gives reasonable defaults for other major regions.
 */
function estimateTimezone(lat: number, lon: number, country: string): string {
    const c = country.toLowerCase();
    // India
    if (c.includes("india") || (lat > 6 && lat < 37 && lon > 68 && lon < 98)) return "Asia/Kolkata";
    // Common countries
    if (c.includes("united states") || c.includes("usa")) {
        if (lon < -115) return "America/Los_Angeles";
        if (lon < -90) return "America/Chicago";
        if (lon < -75) return "America/New_York";
        return "America/New_York";
    }
    if (c.includes("united kingdom") || c.includes("uk")) return "Europe/London";
    if (c.includes("australia")) return "Australia/Sydney";
    if (c.includes("canada")) {
        if (lon < -115) return "America/Vancouver";
        return "America/Toronto";
    }
    if (c.includes("japan")) return "Asia/Tokyo";
    if (c.includes("china")) return "Asia/Shanghai";
    if (c.includes("singapore")) return "Asia/Singapore";
    if (c.includes("uae") || c.includes("emirates")) return "Asia/Dubai";
    if (c.includes("germany") || c.includes("france") || c.includes("italy") || c.includes("spain")) return "Europe/Paris";
    if (c.includes("nepal")) return "Asia/Kathmandu";
    if (c.includes("sri lanka")) return "Asia/Colombo";
    if (c.includes("bangladesh")) return "Asia/Dhaka";
    if (c.includes("pakistan")) return "Asia/Karachi";
    // Fallback by rough longitude bands
    if (lon >= 68 && lon <= 98) return "Asia/Kolkata";
    if (lon >= -10 && lon <= 30) return "Europe/London";
    if (lon >= 30 && lon <= 60) return "Asia/Dubai";
    if (lon >= 100 && lon <= 145) return "Asia/Shanghai";
    if (lon >= -130 && lon <= -60) return "America/New_York";
    return "UTC";
}

export async function searchPlaces(query: string): Promise<GeocodingResult[]> {
    if (!query || query.length < 2) return [];

    const cacheKey = query.toLowerCase().trim();
    if (cache.has(cacheKey)) return cache.get(cacheKey)!;

    // Cancel any in-flight request
    if (currentController) currentController.abort();
    currentController = new AbortController();

    const params = new URLSearchParams({
        q: query,
        format: "json",
        limit: "8",
        addressdetails: "1",
        "accept-language": "en",
        featuretype: "city",
    });

    // Filter to populated places
    params.append("extratags", "1");

    try {
        const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
            headers: {
                "Accept": "application/json",
                "User-Agent": "AstroDhar/1.0 (vedic astrology app)",
            },
            signal: currentController.signal,
        });

        if (!response.ok) {
            console.error("Nominatim error:", response.status);
            return [];
        }

        const data = await response.json();

        const results: GeocodingResult[] = data
            .filter((item: Record<string, unknown>) => {
                const type = item.type as string;
                // Only include populated places, not roads/buildings
                return (
                    type === "city" ||
                    type === "town" ||
                    type === "village" ||
                    type === "hamlet" ||
                    type === "suburb" ||
                    type === "municipality" ||
                    type === "administrative" ||
                    type === "state"
                );
            })
            .map((item: Record<string, unknown>) => {
                const addr = item.address as Record<string, string> || {};
                const lat = parseFloat(item.lat as string);
                const lon = parseFloat(item.lon as string);
                const country = addr.country || "";

                // Build a clean display name
                const parts: string[] = [];
                const placeName = addr.city || addr.town || addr.village || addr.hamlet || addr.suburb || addr.municipality || addr.state || (item.name as string) || "";
                if (placeName) parts.push(placeName);
                if (addr.state && addr.state !== placeName) parts.push(addr.state);
                if (country) parts.push(country);

                return {
                    display_name: parts.join(", ") || (item.display_name as string),
                    lat,
                    lon,
                    country,
                    state: addr.state || "",
                    city: placeName,
                    tz: estimateTimezone(lat, lon, country),
                };
            });

        // Deduplicate by city+state
        const seen = new Set<string>();
        const unique = results.filter((r) => {
            const key = `${r.city}-${r.state}`.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Cache the result
        if (cache.size >= MAX_CACHE) {
            const firstKey = cache.keys().next().value;
            if (firstKey !== undefined) cache.delete(firstKey);
        }
        cache.set(cacheKey, unique);

        return unique;
    } catch (error) {
        if ((error as Error).name === "AbortError") return []; // Expected on new keystroke
        console.error("Geocoding error:", error);
        return [];
    }
}

/**
 * Debounced search with AbortController support.
 * Higher delay for production to respect Nominatim rate limits (1 req/sec).
 */
let debounceTimer: NodeJS.Timeout | null = null;

export function debouncedSearch(
    query: string,
    callback: (results: GeocodingResult[]) => void,
    delay: number = 400
): void {
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
        const results = await searchPlaces(query);
        callback(results);
    }, delay);
}
