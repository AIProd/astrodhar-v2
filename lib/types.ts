// Updated TypeScript types for Phase 2 - Real Vedic Astrology

// Birth input with lat/lon coordinates
export interface BirthInput {
    name: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    tz: string; // IANA timezone e.g., "Asia/Kolkata"
    lat: number; // Latitude
    lon: number; // Longitude
    city?: string; // Optional display name
}

// Planet position in chart
export interface PlanetPosition {
    name: string;
    lon: number; // 0-360 sidereal longitude
    sign: string;
    sign_index: number; // 0-11
    degree_in_sign: number; // 0-30
    house_whole_sign: number; // 1-12
    retrograde: boolean;
}

// Ascendant details
export interface Ascendant {
    lon_sidereal: number;
    sign: string;
    sign_index: number;
    degree_in_sign: number;
    lon_tropical: number;
}

// Full Vedic chart
export interface VedicChart {
    name: string;
    utc_time: string;
    ayanamsa: {
        type: string;
        value_deg: number;
    };
    house_system: string;
    ascendant: Ascendant;
    moon: {
        nakshatra: string;
        pada: number;
    };
    planets: PlanetPosition[];
    insights?: string; // AI-generated summary
}

// Dimension score with basis explanation
export interface DimensionScore {
    score_100: number;
    basis: Record<string, unknown>;
}

// Compatibility result from real backend
export interface CompatibilityResult {
    overall_score_100: number;
    label: string;
    dimensions: {
        emotional: DimensionScore;
        communication: DimensionScore;
        attraction: DimensionScore;
        stability: DimensionScore;
        additional?: Record<string, unknown>;
    };
    signals: string[];
    explainers: string[];
}

// Guna Koota (individual)
export interface GunaKoota {
    points: number;
    max: number;
    description: string;
}

// Guna Milan result (36-point Ashtakoota)
export interface GunaResult {
    total_points: number;
    max_points: number;
    percentage: number;
    kootas: {
        varna: GunaKoota;
        vashya: GunaKoota;
        tara: GunaKoota;
        yoni: GunaKoota;
        graha_maitri: GunaKoota;
        gana: GunaKoota;
        bhakoot: GunaKoota;
        nadi: GunaKoota;
    };
    verdict: string;
}

// Full API response
export interface CompatibilityResponse {
    charts: {
        partnerA: VedicChart;
        partnerB: VedicChart;
    };
    compatibility: CompatibilityResult;
    guna: GunaResult;
    insights?: string; // AI-generated summary
}

// Request types
export interface CompatibilityRequest {
    partnerA: BirthInput;
    partnerB: BirthInput;
}

export interface ChartRequest {
    birth: BirthInput;
    high_precision?: boolean;
    use_true_node?: boolean;
}

// Health check response
export interface HealthResponse {
    ok: boolean;
    version: string;
    timestamp: string;
    engine?: string;
}

// Safety check (kept from Phase 1)
export interface SafetyResult {
    isSafe: boolean;
    response?: {
        message: string;
        resources: string[];
    };
}

// Geocoding result
export interface GeocodingResult {
    lat: number;
    lon: number;
    display_name: string;
}

// Advice types (legacy)
export interface AdviceRequest {
    partnerA: BirthInput;
    partnerB: BirthInput;
    question: string;
}

export interface AdviceResponse {
    advice: string;
    disclaimers: string[];
}

// Breakdown item (legacy)
export interface BreakdownItem {
    label: string;
    score: number;
    maxScore: number;
    insight: string;
}
