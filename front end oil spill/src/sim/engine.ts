import type {
  Anomaly,
  FusionResult,
  PhaseId,
  SarEvidence,
  SimState,
  Telemetry,
  Vessel,
} from "../types";
import {
  boundingBoxesOverlap,
  buildForecast,
  lerp,
  lerpLatLng,
  pointInPolygon,
} from "./geo";
import {
  MONITORING_ZONE,
  OCEAN_STAR_PATH,
  OTHER_VESSELS,
  PHASE_AT,
  PHASE_ORDER,
  RESPONSE_STEPS,
  SPILL_LOCATION,
  VULNERABLE_AREAS,
  WEATHER,
} from "./scenario";

function phaseAt(t: number): PhaseId {
  let current: PhaseId = "tracking";
  for (const id of PHASE_ORDER) {
    if (t >= PHASE_AT[id]) current = id;
  }
  return current;
}

function unlockedAt(t: number): Record<PhaseId, boolean> {
  return Object.fromEntries(PHASE_ORDER.map((id) => [id, t >= PHASE_AT[id]])) as Record<
    PhaseId,
    boolean
  >;
}

function alongPath(path: typeof OCEAN_STAR_PATH, u: number) {
  const clamped = Math.min(1, Math.max(0, u));
  const scaled = clamped * (path.length - 1);
  const i = Math.min(path.length - 2, Math.floor(scaled));
  const local = scaled - i;
  const a = path[i];
  const b = path[i + 1];
  const position = lerpLatLng(a, b, local);
  const heading =
    (Math.atan2(b.lng - a.lng, b.lat - a.lat) * 180) / Math.PI;
  return { position, heading: (heading + 360) % 360 };
}

function telemetryAt(t: number): Telemetry {
  const leak = Math.max(0, (t - 0.3) / 0.25);
  const k = Math.min(1, leak);
  return {
    fuelPct: lerp(78.4, 61.2, Math.min(1, Math.max(0, (t - 0.18) * 1.4))),
    fuelFlowTph: lerp(11.8, 29.6, k),
    pressureBar: lerp(2.05, 3.92, k),
    tempC: lerp(41.2, 47.8, k),
    fuelDropRate: lerp(0.04, 0.86, k),
  };
}

function anomalyFrom(tel: Telemetry, t: number): Anomaly {
  const reasons: string[] = [];
  if (tel.fuelDropRate > 0.35) reasons.push("Fuel dropping unusually");
  if (tel.fuelFlowTph > 18) reasons.push("Fuel flow too high");
  if (tel.pressureBar > 3.1) reasons.push("Pressure too high");
  return {
    possibleLeak: t >= PHASE_AT.leak && reasons.length >= 2,
    reasons,
  };
}

function sarAt(t: number): SarEvidence {
  const visible = t >= PHASE_AT.satellite;
  const polygon = [
    { lat: 9.752, lng: 75.808 },
    { lat: 9.768, lng: 75.806 },
    { lat: 9.774, lng: 75.828 },
    { lat: 9.758, lng: 75.836 },
    { lat: 9.746, lng: 75.822 },
  ];
  return {
    visible,
    center: SPILL_LOCATION,
    polygon,
    label: "Sentinel-1 SAR — possible oil-like anomaly",
  };
}

function fusionAt(t: number, leak: boolean, sar: boolean, associated: boolean): FusionResult {
  const telemetryScore = leak ? 86 : t > 0.25 ? 34 : 12;
  const satelliteScore = sar ? 78 : 8;
  const associationScore = associated ? 81 : 20;
  const riskScore = Math.round(
    telemetryScore * 0.4 + satelliteScore * 0.35 + associationScore * 0.25,
  );
  const riskLevel = riskScore >= 70 ? "HIGH" : riskScore >= 40 ? "MODERATE" : "LOW";
  return { telemetryScore, satelliteScore, associationScore, riskScore, riskLevel };
}

export function computeState(t: number): SimState {
  const phase = phaseAt(t);
  const focusProgress = Math.min(0.86, t * 1.05);
  const focusMove = alongPath(OCEAN_STAR_PATH, focusProgress);
  const inZone = pointInPolygon(focusMove.position, MONITORING_ZONE);

  let status: Vessel["status"] = "Tracking";
  if (t >= PHASE_AT.leak) status = "Incident Vessel";
  else if (inZone && t >= PHASE_AT.enhanced) status = "Enhanced Monitoring";

  const focus: Vessel = {
    id: "ocean-star",
    name: "MV Ocean Star",
    type: "Product Tanker",
    imo: "9418826",
    position: focusMove.position,
    heading: focusMove.heading,
    speedKn: t >= PHASE_AT.leak ? 6.1 : 11.8,
    inZone,
    status,
    isFocus: true,
  };

  const others: Vessel[] = OTHER_VESSELS.map((v) => {
    const move = alongPath(v.path, 0.15 + t * 0.7);
    return {
      id: v.id,
      name: v.name,
      type: v.type,
      imo: v.imo,
      position: move.position,
      heading: move.heading,
      speedKn: v.speedKn,
      inZone: pointInPolygon(move.position, MONITORING_ZONE),
      status: "Tracking",
      isFocus: false,
    };
  });

  const telemetry = telemetryAt(t);
  const anomaly = anomalyFrom(telemetry, t);
  const sar = sarAt(t);
  const associated = sar.visible && anomaly.possibleLeak;
  const fusion = fusionAt(t, anomaly.possibleLeak, sar.visible, associated);
  const spillLocation = t >= PHASE_AT.spill ? SPILL_LOCATION : null;
  const forecast = t >= PHASE_AT.forecast ? buildForecast(SPILL_LOCATION, WEATHER) : [];
  const impactPoly = forecast.find((s) => s.hours === 6)?.polygon;
  const areas = VULNERABLE_AREAS.map((area) => ({
    ...area,
    potentiallyAffected:
      t >= PHASE_AT.impact && impactPoly
        ? boundingBoxesOverlap(area.polygon, impactPoly)
        : false,
  }));
  const affected = areas.filter((a) => a.potentiallyAffected).map((a) => a.name);
  const why = [
    anomaly.possibleLeak ? "Abnormal telemetry detected" : "",
    sar.visible ? "Possible oil-like satellite anomaly" : "",
    associated ? "Vessel associated with incident area" : "",
    affected.length ? "Spill may move toward vulnerable areas" : "",
  ].filter(Boolean);

  return {
    t,
    phase,
    unlocked: unlockedAt(t),
    vessels: [focus, ...others],
    focusVessel: focus,
    zone: MONITORING_ZONE,
    telemetry,
    anomaly,
    sar,
    fusion,
    weather: WEATHER,
    spillLocation,
    forecast,
    areas,
    alert:
      t >= PHASE_AT.alert
        ? {
            title: "CRITICAL MARINE INCIDENT",
            vessel: focus.name,
            incident: "Possible Oil Leak",
            risk: "HIGH",
            location: SPILL_LOCATION,
            affected: affected.length ? affected : ["Fishing zone", "Coastal area"],
            responsePriority: "HIGH",
          }
        : null,
    why,
    responseSteps: t >= PHASE_AT.response ? RESPONSE_STEPS : [],
  };
}
