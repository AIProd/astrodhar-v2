from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from zoneinfo import ZoneInfo
from typing import Any, Dict, List, Optional, Tuple

import swisseph as swe

from .schemas import BirthInput, PlanetPosition, Ascendant, VedicChart


SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]

# Planet list (Ketu computed from Rahu)
PLANETS = [
    ("Sun", swe.SUN),
    ("Moon", swe.MOON),
    ("Mercury", swe.MERCURY),
    ("Venus", swe.VENUS),
    ("Mars", swe.MARS),
    ("Jupiter", swe.JUPITER),
    ("Saturn", swe.SATURN),
    # Nodes:
    ("Rahu", swe.MEAN_NODE),  # change to swe.TRUE_NODE if desired
]


def _parse_local_dt(b: BirthInput) -> datetime:
    """
    Strict parse for date/time.
    Raises ValueError with clear message.
    """
    try:
        # enforce seconds = 00
        local_naive = datetime.fromisoformat(f"{b.date}T{b.time}:00")
    except ValueError as e:
        raise ValueError(
            f"Invalid date/time format. Expected date=YYYY-MM-DD and time=HH:MM. Got date={b.date}, time={b.time}"
        ) from e

    try:
        tz = ZoneInfo(b.tz)
    except Exception as e:
        raise ValueError(f"Invalid timezone '{b.tz}'. Expected IANA tz like 'Asia/Kolkata'.") from e

    return local_naive.replace(tzinfo=tz)


def _to_utc_dt(b: BirthInput) -> datetime:
    return _parse_local_dt(b).astimezone(ZoneInfo("UTC"))


def _julian_day_ut(dt_utc: datetime) -> float:
    hour = dt_utc.hour + dt_utc.minute / 60.0 + dt_utc.second / 3600.0
    return float(swe.julday(dt_utc.year, dt_utc.month, dt_utc.day, hour))


def _sign_idx(lon: float) -> int:
    return int((lon % 360.0) // 30.0)


def _deg_in_sign(lon: float) -> float:
    return float(lon % 30.0)


def _whole_sign_house(asc_sign_idx: int, planet_sign_idx: int) -> int:
    return ((planet_sign_idx - asc_sign_idx) % 12) + 1


def _moon_nakshatra_and_pada(moon_lon_sidereal: float) -> Tuple[str, int]:
    """
    Returns (nakshatra_name, pada_1_to_4).
    Clamps pada to 1..4 to avoid floating boundary issues.
    """
    span = 13.0 + 20.0 / 60.0  # 13.333333333333...
    pos = moon_lon_sidereal % 360.0

    idx = int(pos / span)
    idx = max(0, min(idx, len(NAKSHATRAS) - 1))

    within = pos - (idx * span)  # 0..span
    pada_size = span / 4.0
    pada = int(within / pada_size) + 1
    if pada < 1:
        pada = 1
    if pada > 4:
        pada = 4

    return NAKSHATRAS[idx], pada


def _calc_lon_speed_ut(jd_ut: float, pid: int, flags: int) -> Tuple[float, float]:
    """
    Normalize pyswisseph calc_ut output across versions.
    Typical: (xx, retflag) where xx=[lon, lat, dist, speed_lon, speed_lat, speed_dist]
    """
    out = swe.calc_ut(jd_ut, pid, flags)

    if isinstance(out, tuple) and len(out) == 2 and hasattr(out[0], "__len__"):
        xx = out[0]
    else:
        xx = out

    lon = float(xx[0])
    speed_lon = float(xx[3]) if len(xx) > 3 else 0.0
    return lon, speed_lon


def _compute_ascendant(jd_ut: float, lat: float, lon: float, ayan: float) -> Ascendant:
    """
    Swiss Ephemeris returns tropical Ascendant from houses/houses_ex.
    Convert to sidereal by subtracting ayanamsa (common approach).
    """
    # houses_ex exists in most builds; fall back to houses otherwise
    ascmc = None
    try:
        cusps, ascmc = swe.houses_ex(jd_ut, 0, lat, lon, b'P')
    except Exception:
        cusps, ascmc = swe.houses(jd_ut, lat, lon, b'P')

    asc_trop = float(ascmc[0]) % 360.0
    asc_sid = (asc_trop - ayan) % 360.0
    idx = _sign_idx(asc_sid)

    return Ascendant(
        lon_sidereal=round(asc_sid, 6),
        sign=SIGNS[idx],
        sign_index=idx,
        degree_in_sign=round(_deg_in_sign(asc_sid), 2),
        lon_tropical=round(asc_trop, 6),
    )


def calculate_vedic_chart(
    b: BirthInput,
    high_precision: bool = False,
    ephe_path: Optional[str] = None,
    use_true_node: bool = False,
) -> VedicChart:
    """
    Deterministic Vedic chart calc:
    - Lahiri sidereal mode
    - Planet longitudes are sidereal (FLG_SIDEREAL)
    - Houses are Whole Sign Houses based on sidereal Ascendant sign
    """
    if not (-90.0 <= b.lat <= 90.0):
        raise ValueError(f"Latitude out of range: {b.lat}")
    if not (-180.0 <= b.lon <= 180.0):
        raise ValueError(f"Longitude out of range: {b.lon}")

    if ephe_path:
        swe.set_ephe_path(ephe_path)

    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)

    dt_utc = _to_utc_dt(b)
    jd = _julian_day_ut(dt_utc)

    # flags
    base = swe.FLG_SWIEPH if high_precision else swe.FLG_MOSEPH
    flags = int(base | swe.FLG_SIDEREAL | swe.FLG_SPEED)

    ayan = float(swe.get_ayanamsa_ut(jd))

    asc = _compute_ascendant(jd, b.lat, b.lon, ayan)
    asc_sign_idx = asc.sign_index

    # optionally swap node type
    planets_spec = list(PLANETS)
    if use_true_node:
        planets_spec = [(n, swe.TRUE_NODE if n == "Rahu" else pid) for (n, pid) in planets_spec]

    planets_out: List[PlanetPosition] = []
    rahu_lon = None
    rahu_speed = None

    for name, pid in planets_spec:
        try:
            lon_sid, speed_lon = _calc_lon_speed_ut(jd, pid, flags)
        except Exception:
            # If SWIEPH fails due to missing ephemeris files, fall back to MOSEPH
            fallback_flags = int(swe.FLG_MOSEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED)
            lon_sid, speed_lon = _calc_lon_speed_ut(jd, pid, fallback_flags)

        lon_sid = lon_sid % 360.0
        sidx = _sign_idx(lon_sid)

        if name == "Rahu":
            rahu_lon = lon_sid
            rahu_speed = speed_lon

        planets_out.append(
            PlanetPosition(
                name=name,
                lon=round(lon_sid, 6),
                sign=SIGNS[sidx],
                sign_index=sidx,
                degree_in_sign=round(_deg_in_sign(lon_sid), 2),
                house_whole_sign=_whole_sign_house(asc_sign_idx, sidx),
                retrograde=bool(speed_lon < 0),
            )
        )

    # Ketu computed from Rahu
    if rahu_lon is not None:
        ketu_lon = (rahu_lon + 180.0) % 360.0
        ketu_sidx = _sign_idx(ketu_lon)
        ketu_retro = bool((rahu_speed or 0.0) < 0)  # consistent with Rahu

        planets_out.append(
            PlanetPosition(
                name="Ketu",
                lon=round(ketu_lon, 6),
                sign=SIGNS[ketu_sidx],
                sign_index=ketu_sidx,
                degree_in_sign=round(_deg_in_sign(ketu_lon), 2),
                house_whole_sign=_whole_sign_house(asc_sign_idx, ketu_sidx),
                retrograde=ketu_retro,
            )
        )

    # Moon nakshatra/pada
    moon = next((p for p in planets_out if p.name == "Moon"), None)
    if moon is None:
        raise RuntimeError("Moon not computed. Unexpected.")

    moon_nak, moon_pada = _moon_nakshatra_and_pada(moon.lon)

    return VedicChart(
        name=b.name,
        utc_time=dt_utc.isoformat(),
        ayanamsa_type="lahiri",
        ayanamsa_value_deg=round(ayan, 6),
        house_system="whole_sign",
        ascendant=asc,
        moon_nakshatra=moon_nak,
        moon_pada=moon_pada,
        planets=planets_out,
    )
