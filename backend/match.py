from __future__ import annotations

from typing import Any, Dict, List, Tuple

from schemas import VedicChart, CompatibilityResult

SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

# Classical sign rulers (keep it simple + consistent)
SIGN_RULER = {
    "Aries": "Mars",
    "Taurus": "Venus",
    "Gemini": "Mercury",
    "Cancer": "Moon",
    "Leo": "Sun",
    "Virgo": "Mercury",
    "Libra": "Venus",
    "Scorpio": "Mars",
    "Sagittarius": "Jupiter",
    "Capricorn": "Saturn",
    "Aquarius": "Saturn",
    "Pisces": "Jupiter",
}


def _planet_map(chart: VedicChart) -> Dict[str, Dict[str, Any]]:
    # chart.planets already has standard structure
    return {p.name: p.to_dict() for p in chart.planets}


def _sign_distance(a: str, b: str) -> int:
    ia, ib = SIGNS.index(a), SIGNS.index(b)
    d = (ib - ia) % 12
    return min(d, 12 - d)


def _manglik_from_lagna(mars_house: int) -> bool:
    # Common simplified Manglik positions from Lagna
    return mars_house in (1, 2, 4, 7, 8, 12)


def _seventh_house_sign(asc_sign_idx: int) -> str:
    # Whole Sign Houses: 7th sign from asc
    return SIGNS[(asc_sign_idx + 6) % 12]


def _score_bucket(distance: int, same: int, near: int, mid: int, far: int) -> int:
    """
    distance: 0..6
    """
    if distance == 0:
        return same
    if distance in (1, 2):
        return near
    if distance in (3, 4):
        return mid
    return far


def compatibility_indicators(chart_a: VedicChart, chart_b: VedicChart) -> CompatibilityResult:
    """
    Deterministic, explainable matching indicators.
    IMPORTANT: This is NOT Ashtakoota/Guna Milan.
    """
    pa = _planet_map(chart_a)
    pb = _planet_map(chart_b)

    # Core placements
    moon_a, moon_b = pa["Moon"]["sign"], pb["Moon"]["sign"]
    merc_a, merc_b = pa["Mercury"]["sign"], pb["Mercury"]["sign"]
    ven_a, ven_b = pa["Venus"]["sign"], pb["Venus"]["sign"]
    mar_a, mar_b = pa["Mars"]["sign"], pb["Mars"]["sign"]

    sat_a_h, sat_b_h = pa["Saturn"]["house_whole_sign"], pb["Saturn"]["house_whole_sign"]
    mars_a_h, mars_b_h = pa["Mars"]["house_whole_sign"], pb["Mars"]["house_whole_sign"]

    # Distances
    moon_d = _sign_distance(moon_a, moon_b)
    merc_d = _sign_distance(merc_a, merc_b)
    vm_d1 = _sign_distance(ven_a, mar_b)
    vm_d2 = _sign_distance(ven_b, mar_a)

    # Scores (heuristic buckets)
    emotional = _score_bucket(moon_d, same=88, near=78, mid=65, far=55)
    communication = _score_bucket(merc_d, same=85, near=80, mid=70, far=58)
    attraction = int((_score_bucket(vm_d1, 85, 80, 70, 62) + _score_bucket(vm_d2, 85, 80, 70, 62)) / 2)

    # Stability: Saturn "pressure zones" (heuristic)
    sat_pressure = (sat_a_h in (6, 8, 12)) or (sat_b_h in (6, 8, 12))
    stability = 62 if sat_pressure else 78

    # Two more deterministic, useful flags
    manglik_a = _manglik_from_lagna(mars_a_h)
    manglik_b = _manglik_from_lagna(mars_b_h)

    # 7th house / lord indicators (Whole Sign)
    asc_a_idx = chart_a.ascendant.sign_index
    asc_b_idx = chart_b.ascendant.sign_index
    seventh_a = _seventh_house_sign(asc_a_idx)
    seventh_b = _seventh_house_sign(asc_b_idx)
    lord_a = SIGN_RULER[seventh_a]
    lord_b = SIGN_RULER[seventh_b]

    lord_a_house = pa[lord_a]["house_whole_sign"] if lord_a in pa else None
    lord_b_house = pb[lord_b]["house_whole_sign"] if lord_b in pb else None

    lord_pressure = False
    if lord_a_house in (6, 8, 12) or lord_b_house in (6, 8, 12):
        lord_pressure = True

    # Overall weighted indicator score
    overall_100 = round(
        emotional * 0.35 +
        communication * 0.25 +
        attraction * 0.20 +
        stability * 0.20
    )

    # Label (explicitly "indicator label")
    label = "Strong indicators" if overall_100 >= 78 else "Mixed indicators" if overall_100 >= 62 else "Challenging indicators"

    signals: List[str] = []
    explainers: List[str] = []

    if moon_d <= 2:
        signals.append("moon_harmony")
        explainers.append(f"Moon signs are close ({moon_a} ↔ {moon_b}), which tends to support emotional attunement.")
    else:
        signals.append("moon_distance")
        explainers.append(f"Moon signs are farther apart ({moon_a} ↔ {moon_b}); emotional needs may be expressed differently.")

    if merc_d <= 2:
        signals.append("mercury_support")
        explainers.append(f"Mercury signs are close ({merc_a} ↔ {merc_b}), which usually helps communication style.")
    else:
        signals.append("mercury_distance")
        explainers.append(f"Mercury signs are farther apart ({merc_a} ↔ {merc_b}); communication may need more structure.")

    if attraction >= 78:
        signals.append("venus_mars_pull")
        explainers.append("Venus↔Mars sign interplay is relatively supportive, indicating stronger attraction/chemistry indicators.")
    else:
        signals.append("venus_mars_mixed")
        explainers.append("Venus↔Mars sign interplay is mixed; attraction may vary by circumstances and timing.")

    if sat_pressure:
        signals.append("saturn_pressure")
        explainers.append("Saturn falls in a pressure house (6/8/12) for at least one chart (Whole Sign), suggesting higher responsibility/friction themes.")
    else:
        signals.append("saturn_support")
        explainers.append("Saturn is not in 6/8/12 for either chart (Whole Sign), supporting steadier long-term patterns.")

    if manglik_a or manglik_b:
        signals.append("manglik_flag_simple")
        explainers.append("Simplified Manglik flag detected (Mars in 1/2/4/7/8/12 from Lagna for at least one chart). Treat as a signal to manage conflict/impulsivity, not a verdict.")

    if lord_pressure:
        signals.append("7th_lord_pressure")
        explainers.append("7th house lord falls in a pressure house (6/8/12) for at least one chart (Whole Sign). This can correlate with relationship effort themes.")
    else:
        signals.append("7th_lord_ok")
        explainers.append("7th house lord is not in 6/8/12 (Whole Sign) for both charts, which is a cleaner partnership-effort indicator.")

    dimensions = {
        "emotional": {
            "score_100": emotional,
            "basis": {"moon_sign_distance": moon_d, "moon_signs": [moon_a, moon_b]},
        },
        "communication": {
            "score_100": communication,
            "basis": {"mercury_sign_distance": merc_d, "mercury_signs": [merc_a, merc_b]},
        },
        "attraction": {
            "score_100": attraction,
            "basis": {"venus_mars_distances": [vm_d1, vm_d2], "pairs": [(ven_a, mar_b), (ven_b, mar_a)]},
        },
        "stability": {
            "score_100": stability,
            "basis": {"saturn_house_whole_sign": [sat_a_h, sat_b_h], "saturn_pressure": sat_pressure},
        },
        "additional": {
            "manglik_simple": {"a": manglik_a, "b": manglik_b, "mars_houses": [mars_a_h, mars_b_h]},
            "seventh_house": {
                "a": {"sign": seventh_a, "lord": lord_a, "lord_house": lord_a_house},
                "b": {"sign": seventh_b, "lord": lord_b, "lord_house": lord_b_house},
            },
        },
    }

    return CompatibilityResult(
        overall_score_100=int(overall_100),
        label=label,
        dimensions=dimensions,
        signals=signals,
        explainers=explainers,
    )
