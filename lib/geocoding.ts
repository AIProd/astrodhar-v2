// Geocoding utility using Photon (OpenStreetMap) - with fuzzy matching
// Free API, no key needed, global coverage including villages
// Uses Photon (komoot.io) for better partial/fuzzy city matching

export interface GeocodingResult {
    display_name: string;
    lat: number;
    lon: number;
    country: string;
    state?: string;
    city?: string;
}

const PHOTON_URL = "https://photon.komoot.io/api/";

// Debounce helper
let debounceTimer: NodeJS.Timeout | null = null;

export async function searchPlaces(
    query: string,
    countryCode?: string
): Promise<GeocodingResult[]> {
    if (!query || query.length < 2) {
        return [];
    }

    // Build URL with Photon parameters
    const params = new URLSearchParams({
        q: query,
        limit: "10",
    });

    // Only filter by location type for places
    params.set("osm_tag", "place");

    try {
        const response = await fetch(`${PHOTON_URL}?${params.toString()}`, {
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Photon API error:", response.status);
            return [];
        }

        const data = await response.json();

        // Map Photon GeoJSON format to our format
        const results = data.features
            .filter((feature: Record<string, unknown>) => {
                const props = feature.properties as Record<string, string>;
                // Include cities, towns, villages, states
                const type = props?.type;
                return (
                    type === "city" ||
                    type === "town" ||
                    type === "village" ||
                    type === "hamlet" ||
                    type === "suburb" ||
                    type === "locality" ||
                    type === "state" ||
                    type === "district" ||
                    type === "county"
                );
            })
            .map((feature: Record<string, unknown>) => {
                const props = feature.properties as Record<string, string>;
                const geo = feature.geometry as { coordinates: number[] };

                // Format display name nicely
                const parts: string[] = [];
                if (props.name) parts.push(props.name);
                if (props.state && props.state !== props.name) parts.push(props.state);
                if (props.country) parts.push(props.country);

                return {
                    display_name: parts.join(", ") || props.name,
                    lat: geo.coordinates[1], // GeoJSON is [lon, lat]
                    lon: geo.coordinates[0],
                    country: props.country || "",
                    state: props.state || "",
                    city: props.name || "",
                };
            });

        // If country filter specified, prioritize matching countries
        if (countryCode && results.length > 0) {
            const countryName = countryCode === "IN" ? "India" : countryCode;
            results.sort((a: GeocodingResult, b: GeocodingResult) => {
                const aMatch = a.country.toLowerCase().includes(countryName.toLowerCase()) ? 0 : 1;
                const bMatch = b.country.toLowerCase().includes(countryName.toLowerCase()) ? 0 : 1;
                return aMatch - bMatch;
            });
        }

        return results;
    } catch (error) {
        console.error("Geocoding error:", error);
        return [];
    }
}

// Debounced search for use in components
export function debouncedSearch(
    query: string,
    callback: (results: GeocodingResult[]) => void,
    delay: number = 250
): void {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(async () => {
        const results = await searchPlaces(query);
        callback(results);
    }, delay);
}
