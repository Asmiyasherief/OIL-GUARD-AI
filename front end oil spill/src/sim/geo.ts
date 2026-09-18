import type { ForecastSlice, LatLng, WeatherForcing } from "../types";

const DEG = Math.PI / 180;
const KM_PER_DEG_LAT = 110.574;

function kmPerDegLng(lat: number) {
  return 111.32 * Math.cos(lat * DEG);
}

export function offset(origin: LatLng, eastKm: number, northKm: number): LatLng {
  return {
    lat: origin.lat + northKm / KM_PER_DEG_LAT,
    lng: origin.lng + eastKm / kmPerDegLng(origin.lat),
  };
}

export function headingVector(fromDeg: number): { east: number; north: number } {
  const rad = fromDeg * DEG;
  return { east: Math.sin(rad), north: Math.cos(rad) };
}

/** Meteorological wind is FROM a direction; slick is blown the opposite way. */
export function windToDirection(windFromDeg: number) {
  return (windFromDeg + 180) % 360;
}

export function knotsToKmh(kn: number) {
  return kn * 1.852;
}

export function ellipse(
  center: LatLng,
  radiusEastKm: number,
  radiusNorthKm: number,
  rotationDeg: number,
  points = 48,
): LatLng[] {
  const rot = rotationDeg * DEG;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const ring: LatLng[] = [];
  for (let i = 0; i < points; i += 1) {
    const a = (i / points) * Math.PI * 2;
    const x = radiusEastKm * Math.cos(a);
    const y = radiusNorthKm * Math.sin(a);
    const east = x * cos - y * sin;
    const north = x * sin + y * cos;
    ring.push(offset(center, east, north));
  }
  return ring;
}

export function pointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function bbox(poly: LatLng[]) {
  const lats = poly.map((p) => p.lat);
  const lngs = poly.map((p) => p.lng);
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
}

export function boundingBoxesOverlap(a: LatLng[], b: LatLng[]): boolean {
  const A = bbox(a);
  const B = bbox(b);
  return A.minLat <= B.maxLat && A.maxLat >= B.minLat && A.minLng <= B.maxLng && A.maxLng >= B.minLng;
}

export function polygonsOverlap(a: LatLng[], b: LatLng[]): boolean {
  if (!boundingBoxesOverlap(a, b)) return false;
  return (
    a.some((p) => pointInPolygon(p, b)) ||
    b.some((p) => pointInPolygon(p, a)) ||
    boundingBoxesOverlap(a, b)
  );
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function lerpLatLng(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: lerp(a.lat, b.lat, t), lng: lerp(a.lng, b.lng, t) };
}

export function bearing(a: LatLng, b: LatLng) {
  const y = Math.sin((b.lng - a.lng) * DEG) * Math.cos(b.lat * DEG);
  const x =
    Math.cos(a.lat * DEG) * Math.sin(b.lat * DEG) -
    Math.sin(a.lat * DEG) * Math.cos(b.lat * DEG) * Math.cos((b.lng - a.lng) * DEG);
  return (Math.atan2(y, x) / DEG + 360) % 360;
}

export function buildForecast(origin: LatLng, weather: WeatherForcing): ForecastSlice[] {
  const windToward = windToDirection(weather.windFromDeg);
  const windVec = headingVector(windToward);
  const curVec = headingVector(weather.currentTowardDeg);
  const windKmh = knotsToKmh(weather.windKn) * 0.03;
  const currentKmh = knotsToKmh(weather.currentKn);
  const driftEastKmh = windVec.east * windKmh + curVec.east * currentKmh;
  const driftNorthKmh = windVec.north * windKmh + curVec.north * currentKmh;
  const driftHeading = (Math.atan2(driftEastKmh, driftNorthKmh) / DEG + 360) % 360;

  const hours = [0, 1, 3, 6];
  const labels = ["NOW", "+1 hour", "+3 hours", "+6 hours"];

  return hours.map((h, i) => {
    const center = offset(origin, driftEastKmh * h, driftNorthKmh * h);
    const alongKm = 0.7 + 1.15 * Math.pow(h + 0.15, 0.72);
    const acrossKm = 0.45 + 0.62 * Math.pow(h + 0.15, 0.65);
    return {
      label: labels[i],
      hours: h,
      center,
      radiusKm: alongKm,
      polygon: ellipse(center, acrossKm, alongKm, driftHeading),
    };
  });
}
