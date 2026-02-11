"""
Ashtakoota (8-fold) Guna Matching
Traditional Vedic compatibility scoring out of 36 points
"""
from __future__ import annotations
from typing import Dict, List, Tuple, Any
from dataclasses import dataclass, asdict

from .schemas import VedicChart


@dataclass(frozen=True)
class GunaResult:
    """Result of Ashtakoota Guna matching"""
    total_points: float
    max_points: int  # 36
    percentage: float
    kootas: Dict[str, Dict[str, Any]]
    verdict: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# Nakshatra data (27 nakshatras)
NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]

# Nakshatra to Rashi (Moon Sign) mapping
NAKSHATRA_RASHI = {
    0: 0, 1: 0, 2: 0,   # Ashwini, Bharani, Krittika -> Aries (partial)
    2: 1, 3: 1, 4: 1,   # Krittika, Rohini, Mrigashirsha -> Taurus (partial)
    4: 2, 5: 2, 6: 2,   # Mrigashirsha, Ardra, Punarvasu -> Gemini (partial)
    6: 3, 7: 3, 8: 3,   # Punarvasu, Pushya, Ashlesha -> Cancer (partial)
    9: 4, 10: 4, 11: 4,  # Magha, Purva Phalguni, Uttara Phalguni -> Leo
    11: 5, 12: 5, 13: 5, # Uttara Phalguni, Hasta, Chitra -> Virgo
    13: 6, 14: 6, 15: 6, # Chitra, Swati, Vishakha -> Libra
    15: 7, 16: 7, 17: 7, # Vishakha, Anuradha, Jyeshtha -> Scorpio
    18: 8, 19: 8, 20: 8, # Mula, Purva Ashadha, Uttara Ashadha -> Sagittarius
    20: 9, 21: 9, 22: 9, # Uttara Ashadha, Shravana, Dhanishta -> Capricorn
    22: 10, 23: 10, 24: 10, # Dhanishta, Shatabhisha, Purva Bhadrapada -> Aquarius
    24: 11, 25: 11, 26: 11, # Purva Bhadrapada, Uttara Bhadrapada, Revati -> Pisces
}

# Varna (caste) for each sign: 0=Brahmin, 1=Kshatriya, 2=Vaishya, 3=Shudra
VARNA = [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0]  # Aries to Pisces

# Vashya categories
VASHYA_CATEGORY = {
    0: "chatushpada", 1: "chatushpada", 2: "nara", 3: "jalachara",
    4: "vanachara", 5: "nara", 6: "nara", 7: "keeta",
    8: "chatushpada", 9: "jalachara", 10: "nara", 11: "jalachara"
}

# Vashya compatibility matrix
VASHYA_POINTS = {
    ("nara", "nara"): 2, ("nara", "chatushpada"): 1, ("nara", "jalachara"): 0.5,
    ("chatushpada", "chatushpada"): 2, ("chatushpada", "nara"): 0.5,
    ("jalachara", "jalachara"): 2, ("vanachara", "vanachara"): 2,
    ("keeta", "keeta"): 2,
}

# Yoni (animal) for each nakshatra
YONI = [
    "horse", "elephant", "goat", "snake", "snake", "dog",
    "cat", "goat", "cat", "rat", "rat", "cow",
    "buffalo", "tiger", "buffalo", "tiger", "deer", "deer",
    "dog", "monkey", "mongoose", "monkey", "lion", "horse",
    "lion", "cow", "elephant"
]

# Yoni compatibility
YONI_ENEMY = {
    "horse": "buffalo", "elephant": "lion", "goat": "monkey", "snake": "mongoose",
    "dog": "deer", "cat": "rat", "cow": "tiger", "buffalo": "horse",
    "rat": "cat", "tiger": "cow", "monkey": "goat", "mongoose": "snake",
    "lion": "elephant", "deer": "dog"
}

# Gana (temperament): 0=Deva, 1=Manushya, 2=Rakshasa
GANA = [
    0, 1, 2, 0, 0, 1, 0, 0, 2, 2, 1, 0,
    0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2,
    1, 1, 0
]

# Nadi: 0=Adi, 1=Madhya, 2=Antya
NADI = [
    0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2,
    0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2,
    0, 1, 2
]

# Planet lords for each sign
SIGN_LORD = [3, 5, 2, 0, 1, 2, 5, 3, 4, 6, 6, 4]  # Mars, Venus, Mercury, Moon, Sun, Mercury, Venus, Mars, Jupiter, Saturn, Saturn, Jupiter

# Friendly/Enemy planets
PLANET_FRIENDS = {
    0: [1, 3],  # Moon friends: Sun, Mars
    1: [0, 3, 4],  # Sun friends: Moon, Mars, Jupiter
    2: [1, 5],  # Mercury friends: Sun, Venus
    3: [1, 0, 4],  # Mars friends: Sun, Moon, Jupiter
    4: [1, 0, 3],  # Jupiter friends: Sun, Moon, Mars
    5: [2, 6],  # Venus friends: Mercury, Saturn
    6: [2, 5],  # Saturn friends: Mercury, Venus
}


def _get_nakshatra_index(nakshatra: str) -> int:
    """Get index of nakshatra (0-26)"""
    try:
        return NAKSHATRAS.index(nakshatra)
    except ValueError:
        return 0


def _calc_varna(sign_a: int, sign_b: int) -> Tuple[float, str]:
    """Varna Koota (1 point max)"""
    varna_a = VARNA[sign_a]
    varna_b = VARNA[sign_b]
    
    # Boy's varna should be >= Girl's varna
    if varna_a <= varna_b:
        return 1.0, "Compatible"
    return 0.0, "Incompatible"


def _calc_vashya(sign_a: int, sign_b: int) -> Tuple[float, str]:
    """Vashya Koota (2 points max)"""
    cat_a = VASHYA_CATEGORY.get(sign_a, "nara")
    cat_b = VASHYA_CATEGORY.get(sign_b, "nara")
    
    points = VASHYA_POINTS.get((cat_a, cat_b), 0.5)
    points = max(points, VASHYA_POINTS.get((cat_b, cat_a), 0.5))
    
    if points >= 2:
        return 2.0, "Full compatibility"
    elif points >= 1:
        return points, "Partial compatibility"
    return points, "Low compatibility"


def _calc_tara(nak_a: int, nak_b: int) -> Tuple[float, str]:
    """Tara/Dina Koota (3 points max)"""
    # Count from boy's nakshatra to girl's
    diff = (nak_b - nak_a) % 27
    tara = (diff % 9) + 1
    
    # Inauspicious taras: 1, 2, 4, 6, 8 -> less points
    if tara in [3, 5, 7]:
        return 3.0, f"Tara {tara} - Auspicious"
    elif tara in [1, 2, 4, 6, 8]:
        return 1.5, f"Tara {tara} - Moderate"
    return 0.0, f"Tara {tara} - Inauspicious"


def _calc_yoni(nak_a: int, nak_b: int) -> Tuple[float, str]:
    """Yoni Koota (4 points max)"""
    yoni_a = YONI[nak_a]
    yoni_b = YONI[nak_b]
    
    if yoni_a == yoni_b:
        return 4.0, f"Same yoni ({yoni_a})"
    
    # Check if enemies
    if YONI_ENEMY.get(yoni_a) == yoni_b or YONI_ENEMY.get(yoni_b) == yoni_a:
        return 0.0, f"Enemy yonis ({yoni_a} vs {yoni_b})"
    
    return 2.0, f"Neutral yonis ({yoni_a}, {yoni_b})"


def _calc_graha_maitri(sign_a: int, sign_b: int) -> Tuple[float, str]:
    """Graha Maitri/Rasyadhipati Koota (5 points max)"""
    lord_a = SIGN_LORD[sign_a]
    lord_b = SIGN_LORD[sign_b]
    
    if lord_a == lord_b:
        return 5.0, "Same lord"
    
    a_friend_b = lord_b in PLANET_FRIENDS.get(lord_a, [])
    b_friend_a = lord_a in PLANET_FRIENDS.get(lord_b, [])
    
    if a_friend_b and b_friend_a:
        return 5.0, "Mutual friends"
    elif a_friend_b or b_friend_a:
        return 2.5, "One-sided friendship"
    return 0.0, "Not friends"


def _calc_gana(nak_a: int, nak_b: int) -> Tuple[float, str]:
    """Gana Koota (6 points max)"""
    gana_a = GANA[nak_a]
    gana_b = GANA[nak_b]
    
    gana_names = ["Deva", "Manushya", "Rakshasa"]
    
    if gana_a == gana_b:
        return 6.0, f"Same gana ({gana_names[gana_a]})"
    
    # Deva-Manushya or Manushya-Rakshasa okay
    if abs(gana_a - gana_b) == 1:
        return 3.0, f"Adjacent ganas ({gana_names[gana_a]} - {gana_names[gana_b]})"
    
    # Deva-Rakshasa = incompatible
    return 0.0, f"Incompatible ganas ({gana_names[gana_a]} - {gana_names[gana_b]})"


def _calc_bhakoot(sign_a: int, sign_b: int) -> Tuple[float, str]:
    """Bhakoot/Rashi Koota (7 points max)"""
    diff = abs(sign_a - sign_b)
    
    # 2/12, 5/9, 6/8 are inauspicious
    if diff in [1, 11]:  # 2/12
        return 0.0, "2/12 position - Financial issues indicated"
    elif diff in [4, 8]:  # 5/9
        return 0.0, "5/9 position - Progeny issues indicated"
    elif diff in [5, 7]:  # 6/8
        return 0.0, "6/8 position - Health issues indicated"
    
    return 7.0, "Favorable position"


def _calc_nadi(nak_a: int, nak_b: int) -> Tuple[float, str]:
    """Nadi Koota (8 points max) - Most important"""
    nadi_a = NADI[nak_a]
    nadi_b = NADI[nak_b]
    
    nadi_names = ["Adi (Vata)", "Madhya (Pitta)", "Antya (Kapha)"]
    
    if nadi_a == nadi_b:
        return 0.0, f"Same nadi ({nadi_names[nadi_a]}) - NADI DOSHA"
    
    return 8.0, f"Different nadis ({nadi_names[nadi_a]} - {nadi_names[nadi_b]})"


def calculate_guna_milan(chart_a: VedicChart, chart_b: VedicChart) -> GunaResult:
    """
    Calculate Ashtakoota Guna matching between two charts.
    
    Args:
        chart_a: Boy's chart
        chart_b: Girl's chart
    
    Returns:
        GunaResult with 36-point breakdown
    """
    # Get Moon sign indices
    moon_a = next((p for p in chart_a.planets if p.name == "Moon"), None)
    moon_b = next((p for p in chart_b.planets if p.name == "Moon"), None)
    
    if not moon_a or not moon_b:
        raise ValueError("Moon position not found in charts")
    
    sign_a = moon_a.sign_index
    sign_b = moon_b.sign_index
    
    # Get nakshatra indices
    nak_a = _get_nakshatra_index(chart_a.moon_nakshatra)
    nak_b = _get_nakshatra_index(chart_b.moon_nakshatra)
    
    # Calculate all 8 kootas
    varna_pts, varna_desc = _calc_varna(sign_a, sign_b)
    vashya_pts, vashya_desc = _calc_vashya(sign_a, sign_b)
    tara_pts, tara_desc = _calc_tara(nak_a, nak_b)
    yoni_pts, yoni_desc = _calc_yoni(nak_a, nak_b)
    maitri_pts, maitri_desc = _calc_graha_maitri(sign_a, sign_b)
    gana_pts, gana_desc = _calc_gana(nak_a, nak_b)
    bhakoot_pts, bhakoot_desc = _calc_bhakoot(sign_a, sign_b)
    nadi_pts, nadi_desc = _calc_nadi(nak_a, nak_b)
    
    total = varna_pts + vashya_pts + tara_pts + yoni_pts + maitri_pts + gana_pts + bhakoot_pts + nadi_pts
    percentage = round((total / 36) * 100, 1)
    
    # Verdict based on score
    if total >= 28:
        verdict = "Excellent Match"
    elif total >= 21:
        verdict = "Good Match"
    elif total >= 18:
        verdict = "Average Match"
    elif total >= 14:
        verdict = "Below Average"
    else:
        verdict = "Not Recommended"
    
    kootas = {
        "varna": {"points": varna_pts, "max": 1, "description": varna_desc},
        "vashya": {"points": vashya_pts, "max": 2, "description": vashya_desc},
        "tara": {"points": tara_pts, "max": 3, "description": tara_desc},
        "yoni": {"points": yoni_pts, "max": 4, "description": yoni_desc},
        "graha_maitri": {"points": maitri_pts, "max": 5, "description": maitri_desc},
        "gana": {"points": gana_pts, "max": 6, "description": gana_desc},
        "bhakoot": {"points": bhakoot_pts, "max": 7, "description": bhakoot_desc},
        "nadi": {"points": nadi_pts, "max": 8, "description": nadi_desc},
    }
    
    return GunaResult(
        total_points=total,
        max_points=36,
        percentage=percentage,
        kootas=kootas,
        verdict=verdict,
    )
