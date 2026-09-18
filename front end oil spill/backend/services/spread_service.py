"""
OilGuard AI — Prototype Spill Trajectory Simulation Service
Computes simplified drift advection and radial spreading for decision-support visualization.

Formula:
V_drift = 0.03 * V_wind + V_current

DISCLAIMER:
Prototype spill trajectory simulation — not an operational oceanographic forecast.
"""
import math

DEG_TO_RAD = math.pi / 180.0
KM_PER_DEG_LAT = 110.574

def km_per_deg_lng(lat):
    return 111.32 * math.cos(lat * DEG_TO_RAD)

def offset_lat_lng(origin, east_km, north_km):
    lat = origin["lat"] + north_km / KM_PER_DEG_LAT
    lng = origin["lng"] + east_km / km_per_deg_lng(origin["lat"])
    return { "lat": round(lat, 5), "lng": round(lng, 5) }

def generate_ellipse_polygon(center, semi_major_km, semi_minor_km, angle_deg, num_points=36):
    """
    Generates polygon coordinates around an advected center.
    """
    rad = angle_deg * DEG_TO_RAD
    cos_rot = math.cos(rad)
    sin_rot = math.sin(rad)
    coords = []

    for i in range(num_points):
        theta = (i / num_points) * 2 * math.pi
        x = semi_minor_km * math.cos(theta)
        y = semi_major_km * math.sin(theta)
        # Rotate by drift heading
        east = x * cos_rot - y * sin_rot
        north = x * sin_rot + y * cos_rot
        pt = offset_lat_lng(center, east, north)
        coords.append([pt["lng"], pt["lat"]])

    # Close loop
    coords.append(coords[0])
    return coords

def simulate_spill_trajectory(origin, wind, current, hours_list=[0, 1, 3, 6]):
    """
    Calculates NOW, +1H, +3H, +6H spill footprints.
    """
    # Wind vector (meteorological wind blows FROM a direction, slick drifts toward direction)
    wind_from_deg = wind.get("directionFromDeg", 225)
    wind_speed_kmh = wind.get("speedKmh", 18.0)
    wind_toward_deg = (wind_from_deg + 180) % 360
    wind_rad = wind_toward_deg * DEG_TO_RAD
    wind_drift_kmh = wind_speed_kmh * 0.03  # Standard 3% windage rule

    wind_east_kmh = wind_drift_kmh * math.sin(wind_rad)
    wind_north_kmh = wind_drift_kmh * math.cos(wind_rad)

    # Current vector
    cur_toward_deg = current.get("directionTowardDeg", 55)
    cur_speed_knots = current.get("speedKnots", 1.2)
    cur_speed_kmh = cur_speed_knots * 1.852
    cur_rad = cur_toward_deg * DEG_TO_RAD

    cur_east_kmh = cur_speed_kmh * math.sin(cur_rad)
    cur_north_kmh = cur_speed_kmh * math.cos(cur_rad)

    # Combined net advection
    net_east_kmh = wind_east_kmh + cur_east_kmh
    net_north_kmh = wind_north_kmh + cur_north_kmh
    net_speed_kmh = math.hypot(net_east_kmh, net_north_kmh)
    drift_heading_deg = (math.atan2(net_east_kmh, net_north_kmh) / DEG_TO_RAD + 360) % 360

    scenarios = []
    for h in hours_list:
        drift_east = net_east_kmh * h
        drift_north = net_north_kmh * h
        center = offset_lat_lng(origin, drift_east, drift_north)

        # Spreading radii (semi-major along drift axis, semi-minor across)
        if h == 0:
            major_km = 0.6
            minor_km = 0.35
            area_sqkm = 0.65
            label = "NOW (T+0H)"
        elif h == 1:
            major_km = 1.6
            minor_km = 0.95
            area_sqkm = 4.8
            label = "+1 HOUR"
        elif h == 3:
            major_km = 3.2
            minor_km = 1.8
            area_sqkm = 18.1
            label = "+3 HOURS"
        else: # +6H
            major_km = 5.4
            minor_km = 3.1
            area_sqkm = 52.6
            label = "+6 HOURS"

        polygon_coords = generate_ellipse_polygon(center, major_km, minor_km, drift_heading_deg)

        scenarios.append({
            "step": f"+{h}H" if h > 0 else "NOW",
            "hours": h,
            "label": label,
            "center": center,
            "driftDistanceKm": round(net_speed_kmh * h, 2),
            "semiMajorKm": round(major_km, 2),
            "semiMinorKm": round(minor_km, 2),
            "estimatedAreaSqKm": area_sqkm,
            "driftHeadingDeg": round(drift_heading_deg, 1),
            "polygon": polygon_coords
        })

    return {
        "disclaimer": "Prototype spill trajectory simulation — not an operational oceanographic forecast.",
        "origin": origin,
        "netDriftSpeedKmh": round(net_speed_kmh, 2),
        "netDriftSpeedKnots": round(net_speed_kmh / 1.852, 2),
        "netHeadingDeg": round(drift_heading_deg, 1),
        "cardinal": "NE (Toward Inshore Fishing Grounds & Coast)",
        "scenarios": scenarios
    }
