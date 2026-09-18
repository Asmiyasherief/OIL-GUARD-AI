import { useEffect, useRef } from "react";
import L from "leaflet";
import type { SimState } from "../types";

const AREA_STYLE: Record<string, { color: string; fill: string }> = {
  fishing: { color: "#5ee2a0", fill: "#5ee2a0" },
  coastal: { color: "#f5c542", fill: "#f5c542" },
  port: { color: "#4cc3ff", fill: "#4cc3ff" },
  ecology: { color: "#b794f6", fill: "#b794f6" },
};

const FORECAST_STYLE = [
  { color: "#ffb347", weight: 2, fillOpacity: 0.28 },
  { color: "#ff8a4c", weight: 2, fillOpacity: 0.2 },
  { color: "#ff5d6c", weight: 2, fillOpacity: 0.14 },
  { color: "#ff2d55", weight: 2, fillOpacity: 0.1 },
];

function shipIcon(kind: "normal" | "focus" | "incident", heading: number) {
  const cls = kind === "incident" ? "incident" : kind === "focus" ? "focus" : "";
  return L.divIcon({
    className: "",
    html: `<div class="ship-icon ${cls}" style="transform: rotate(${heading}deg)"></div>`,
    iconSize: [14, 18],
    iconAnchor: [7, 9],
  });
}

interface Props {
  state: SimState;
}

export default function MapView({ state }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([9.78, 75.92], 10);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap &copy; CARTO",
      maxZoom: 19,
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    window.setTimeout(() => map.invalidateSize(), 80);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const group = layerRef.current;
    if (!group) return;
    group.clearLayers();

    L.polygon(
      state.zone.map((p) => [p.lat, p.lng] as [number, number]),
      {
        color: "#2ee6c7",
        weight: 2,
        dashArray: "6 6",
        fillColor: "#2ee6c7",
        fillOpacity: 0.06,
      },
    )
      .bindTooltip("Coastal monitoring zone", { className: "og-tip" })
      .addTo(group);

    if (state.unlocked.impact || state.unlocked.forecast) {
      for (const area of state.areas) {
        const style = AREA_STYLE[area.kind];
        L.polygon(
          area.polygon.map((p) => [p.lat, p.lng] as [number, number]),
          {
            color: style.color,
            weight: area.potentiallyAffected ? 3 : 1.5,
            fillColor: style.fill,
            fillOpacity: area.potentiallyAffected ? 0.28 : 0.1,
          },
        )
          .bindTooltip(
            area.potentiallyAffected
              ? `Potentially affected: ${area.name}`
              : area.name,
            { className: "og-tip" },
          )
          .addTo(group);
      }
    }

    if (state.sar.visible) {
      L.polygon(
        state.sar.polygon.map((p) => [p.lat, p.lng] as [number, number]),
        {
          color: "#9be7ff",
          weight: 2,
          fillColor: "#163",
          fillOpacity: 0.35,
        },
      )
        .bindTooltip(state.sar.label, { className: "og-tip" })
        .addTo(group);
    }

    state.forecast.forEach((slice, i) => {
      L.polygon(
        slice.polygon.map((p) => [p.lat, p.lng] as [number, number]),
        {
          color: FORECAST_STYLE[i].color,
          weight: FORECAST_STYLE[i].weight,
          fillColor: FORECAST_STYLE[i].color,
          fillOpacity: FORECAST_STYLE[i].fillOpacity,
        },
      )
        .bindTooltip(`Predicted slick ${slice.label}`, { className: "og-tip" })
        .addTo(group);
      L.marker([slice.center.lat, slice.center.lng], {
        icon: L.divIcon({
          className: "og-tip",
          html: `<div style="color:#ffd7a8;font:600 11px IBM Plex Mono,monospace;white-space:nowrap">${slice.label}</div>`,
          iconSize: [70, 16],
        }),
      }).addTo(group);
    });

    if (state.spillLocation) {
      L.marker([state.spillLocation.lat, state.spillLocation.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div class="spill-pulse"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
      })
        .bindTooltip(
          `Possible spill location: ${state.spillLocation.lat.toFixed(2)}, ${state.spillLocation.lng.toFixed(2)}`,
          { className: "og-tip", permanent: true, direction: "right", offset: [12, 0] },
        )
        .addTo(group);
    }

    for (const vessel of state.vessels) {
      const kind = vessel.isFocus
        ? vessel.status === "Incident Vessel"
          ? "incident"
          : "focus"
        : "normal";
      L.marker([vessel.position.lat, vessel.position.lng], {
        icon: shipIcon(kind, vessel.heading),
      })
        .bindTooltip(
          `${vessel.name} · ${vessel.speedKn.toFixed(1)} kn · ${vessel.status}`,
          { className: "og-tip" },
        )
        .addTo(group);
    }
  }, [state]);

  return <div ref={ref} className="map" />;
}
