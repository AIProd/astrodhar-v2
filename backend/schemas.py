from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Any, Dict, List, Optional


@dataclass(frozen=True)
class BirthInput:
    """
    User-provided birth details.
    date: YYYY-MM-DD
    time: HH:MM (24h)
    tz: IANA timezone like "Asia/Kolkata"
    lat/lon: decimal degrees
    """
    date: str
    time: str
    tz: str
    lat: float
    lon: float
    name: str = ""


@dataclass(frozen=True)
class PlanetPosition:
    name: str
    lon: float                # 0..360 sidereal longitude
    sign: str                 # sign name
    sign_index: int           # 0..11
    degree_in_sign: float     # 0..30
    house_whole_sign: int     # 1..12 (WHS from asc sign)
    retrograde: bool

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        return d


@dataclass(frozen=True)
class Ascendant:
    lon_sidereal: float
    sign: str
    sign_index: int
    degree_in_sign: float
    lon_tropical: float  # for debugging / transparency

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class VedicChart:
    name: str
    utc_time: str
    ayanamsa_type: str
    ayanamsa_value_deg: float
    house_system: str         # "whole_sign"
    ascendant: Ascendant
    moon_nakshatra: str
    moon_pada: int
    planets: List[PlanetPosition]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "utc_time": self.utc_time,
            "ayanamsa": {
                "type": self.ayanamsa_type,
                "value_deg": self.ayanamsa_value_deg,
            },
            "house_system": self.house_system,
            "ascendant": self.ascendant.to_dict(),
            "moon": {
                "nakshatra": self.moon_nakshatra,
                "pada": self.moon_pada,
            },
            "planets": [p.to_dict() for p in self.planets],
        }


@dataclass(frozen=True)
class CompatibilityResult:
    """
    Deterministic indicator-based matching.
    IMPORTANT: Not Ashtakoota/Guna Milan.
    """
    overall_score_100: int
    label: str
    dimensions: Dict[str, Dict[str, Any]]
    signals: List[str]
    explainers: List[str]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
