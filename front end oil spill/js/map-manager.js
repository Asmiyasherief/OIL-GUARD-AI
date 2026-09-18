/**
 * OilGuard AI — Leaflet Map Engine
 * Manages Kerala coastal monitoring polygon, AIS vessel icons, SAR overlays,
 * spill trajectory contours (NOW, +1H, +3H, +6H) and coastal impact zones.
 */
class OilGuardMapManager {
  constructor(mapContainerId) {
    this.containerId = mapContainerId;
    this.map = null;
    this.vesselMarkers = {};
    this.layers = {
      monitoringZone: null,
      vessels: null,
      sarLayer: null,
      spillLayer: null,
      impactZones: null,
      vectorsLayer: null
    };
    this.activeSpillTime = "NOW";
    this.sarVisible = true;
    this.impactVisible = true;

    this.initMap();
  }

  initMap() {
    const el = document.getElementById(this.containerId);
    if (!el || !window.L) return;

    // Centered on Kerala Central Coast (Kochi approaches)
    this.map = L.map(this.containerId, {
      center: [9.68, 76.05],
      zoom: 9,
      zoomControl: false,
      attributionControl: true
    });

    L.control.zoom({ position: "topleft" }).addTo(this.map);

    // High performance dark theme basemap tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap &copy; CARTO | OilGuard Decision Support",
      maxZoom: 18,
      subdomains: "abcd"
    }).addTo(this.map);

    // Initialize layer groups
    this.layers.monitoringZone = L.layerGroup().addTo(this.map);
    this.layers.impactZones = L.layerGroup().addTo(this.map);
    this.layers.sarLayer = L.layerGroup().addTo(this.map);
    this.layers.spillLayer = L.layerGroup().addTo(this.map);
    this.layers.vectorsLayer = L.layerGroup().addTo(this.map);
    this.layers.vessels = L.layerGroup().addTo(this.map);

    this.renderMonitoringZone();
    this.renderImpactZones();
    this.renderSatelliteSAR();
    this.renderDriftVectors();
  }

  renderMonitoringZone() {
    const zoneCoords = OilGuardDataStore.monitoringZone;
    L.polygon(zoneCoords, {
      color: "#00e5ff",
      weight: 2,
      dashArray: "8 6",
      fillColor: "#00e5ff",
      fillOpacity: 0.04
    })
      .bindTooltip("<div class='hud-tooltip'><strong>Kerala Coastal Monitoring Zone</strong><br>Authority Maritime Surveillance Sector</div>", { sticky: true, className: "custom-map-tooltip" })
      .addTo(this.layers.monitoringZone);
  }

  renderImpactZones() {
    this.layers.impactZones.clearLayers();
    if (!this.impactVisible) return;

    OilGuardDataStore.impactZones.forEach((zone) => {
      const poly = L.polygon(zone.polygon, {
        color: zone.color,
        weight: 1.8,
        dashArray: "4 4",
        fillColor: zone.color,
        fillOpacity: zone.impactLevel === "HIGH" ? 0.25 : 0.14
      });

      poly.bindPopup(`
        <div class="map-popup-card">
          <div class="popup-tag ${zone.category}">${zone.category.toUpperCase()} ZONE</div>
          <h4>${zone.name}</h4>
          <p>${zone.desc}</p>
          <div class="popup-meta">
            <span>POTENTIAL IMPACT:</span>
            <strong class="${zone.impactLevel === 'HIGH' ? 'text-danger' : 'text-warn'}">${zone.impactLevel} POTENTIAL IMPACT</strong>
          </div>
        </div>
      `);

      poly.bindTooltip(`<strong>${zone.name}</strong><br>Potential Impact: ${zone.impactLevel}`, {
        sticky: true,
        className: "custom-map-tooltip"
      });

      poly.addTo(this.layers.impactZones);
    });
  }

  renderSatelliteSAR() {
    this.layers.sarLayer.clearLayers();
    if (!this.sarVisible) return;

    const sar = OilGuardDataStore.satelliteObservation;
    // Sentinel-1 SAR dark backscatter anomaly polygon
    const poly = L.polygon(sar.polygon, {
      color: "#00f0ff",
      weight: 2,
      dashArray: "4 4",
      fillColor: "#001a33",
      fillOpacity: 0.45
    });

    poly.bindTooltip(`
      <div class='hud-tooltip'>
        <strong>${sar.satellite} SAR Observation</strong><br>
        Attenuated dark-patch anomaly detected<br>
        <span style="color:#ffb703;font-size:10px;">Supporting observation (not live video)</span>
      </div>
    `, { sticky: true, className: "custom-map-tooltip" });

    poly.addTo(this.layers.sarLayer);
  }

  renderDriftVectors() {
    this.layers.vectorsLayer.clearLayers();
    // Environmental forcing compass marker near coast
    const origin = [9.45, 75.65];
    const wind = OilGuardDataStore.wind;
    const cur = OilGuardDataStore.current;

    const iconHtml = `
      <div class="vector-compass-widget">
        <div class="compass-label">ENV FORCING</div>
        <div class="compass-item">WIND: ${wind.cardinal} (${wind.speedKmh} km/h)</div>
        <div class="compass-item">CUR: ${cur.cardinal} (${cur.speedKnots} kn)</div>
      </div>
    `;

    L.marker(origin, {
      icon: L.divIcon({
        className: "env-compass-icon",
        html: iconHtml,
        iconSize: [160, 50],
        iconAnchor: [80, 25]
      })
    }).addTo(this.layers.vectorsLayer);
  }

  renderVessels(vessels) {
    this.layers.vessels.clearLayers();

    vessels.forEach((v) => {
      const isOceanStar = v.name.includes("Ocean Star");
      const isHighRisk = v.riskLevel === "HIGH";

      const iconHtml = `
        <div class="vessel-map-icon ${isHighRisk ? 'vessel-high-risk' : ''}" style="transform: rotate(${v.heading}deg);">
          <div class="ship-arrow ${isHighRisk ? 'arrow-danger' : 'arrow-normal'}"></div>
          ${isHighRisk ? '<div class="radar-ping-ring"></div>' : ''}
        </div>
      `;

      const marker = L.marker([v.position.lat, v.position.lng], {
        icon: L.divIcon({
          className: "vessel-div-icon",
          html: iconHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })
      });

      marker.bindPopup(`
        <div class="map-popup-card">
          <div class="popup-tag ${isHighRisk ? 'danger' : 'normal'}">${v.type}</div>
          <h4>${v.name}</h4>
          <div class="popup-meta">
            <div><span>MMSI:</span> <strong>${v.mmsi}</strong></div>
            <div><span>SPEED:</span> <strong>${v.speedKn} kn</strong></div>
            <div><span>HEADING:</span> <strong>${v.heading}°</strong></div>
            <div><span>STATUS:</span> <strong class="${isHighRisk ? 'text-danger' : 'text-ok'}">${v.status}</strong></div>
            <div><span>DATA:</span> <span style="font-size:10px;color:var(--text-muted);">${v.dataSource}</span></div>
          </div>
          ${isHighRisk ? '<div class="alert-banner-mini">INVESTIGATION TRIGGER ACTIVE</div>' : ''}
        </div>
      `);

      marker.bindTooltip(`<strong>${v.name}</strong> (${v.speedKn} kn)<br>Status: ${v.status}`, {
        className: "custom-map-tooltip"
      });

      marker.addTo(this.layers.vessels);
      this.vesselMarkers[v.id] = marker;
    });
  }

  updateSpillSpread(timeStep = "NOW", customSpillData = null) {
    this.activeSpillTime = timeStep;
    this.layers.spillLayer.clearLayers();

    const origin = { lat: 9.65, lng: 76.25 };
    // Simplified drift advection along 50 deg NE
    const steps = [
      { step: "NOW", hours: 0, dLat: 0.0, dLng: 0.0, rMajor: 0.012, rMinor: 0.007, color: "#ff3366", opacity: 0.65, label: "NOW (T+0H)" },
      { step: "+1H", hours: 1, dLat: 0.024, dLng: 0.028, rMajor: 0.025, rMinor: 0.015, color: "#ff5d6c", opacity: 0.45, label: "+1 HOUR" },
      { step: "+3H", hours: 3, dLat: 0.065, dLng: 0.075, rMajor: 0.048, rMinor: 0.028, color: "#ff8a4c", opacity: 0.32, label: "+3 HOURS" },
      { step: "+6H", hours: 6, dLat: 0.125, dLng: 0.145, rMajor: 0.078, rMinor: 0.045, color: "#ffb347", opacity: 0.22, label: "+6 HOURS" }
    ];

    const targetSteps = (timeStep === "ALL")
      ? steps
      : steps.filter((s) => s.hours <= (timeStep === "+6H" ? 6 : timeStep === "+3H" ? 3 : timeStep === "+1H" ? 1 : 0));

    targetSteps.forEach((s) => {
      const center = [origin.lat + s.dLat, origin.lng + s.dLng];
      const bounds = [
        [center[0] - s.rMajor, center[1] - s.rMinor],
        [center[0] + s.rMajor, center[1] + s.rMinor]
      ];

      // Draw ellipse slick
      const ellipse = L.polygon(this.generateEllipseCoords(center[0], center[1], s.rMajor, s.rMinor, 50), {
        color: s.color,
        weight: 2,
        fillColor: s.color,
        fillOpacity: s.opacity
      });

      ellipse.bindTooltip(`<strong>Predicted Spread ${s.label}</strong><br>Drift: NE toward inshore fisheries`, {
        className: "custom-map-tooltip"
      });
      ellipse.addTo(this.layers.spillLayer);

      // Spill centroid marker
      L.marker(center, {
        icon: L.divIcon({
          className: "spill-centroid-marker",
          html: `<div class="slick-center-dot" style="background:${s.color};"></div><div class="slick-tag">${s.step}</div>`,
          iconSize: [40, 20],
          iconAnchor: [20, 10]
        })
      }).addTo(this.layers.spillLayer);
    });
  }

  generateEllipseCoords(lat, lng, rMajor, rMinor, angleDeg) {
    const points = [];
    const rad = (angleDeg * Math.PI) / 180;
    const cosR = Math.cos(rad);
    const sinR = Math.sin(rad);

    for (let i = 0; i < 32; i++) {
      const theta = (i / 32) * Math.PI * 2;
      const x = rMinor * Math.cos(theta);
      const y = rMajor * Math.sin(theta);
      const dLng = (x * cosR - y * sinR);
      const dLat = (x * sinR + y * cosR);
      points.push([lat + dLat, lng + dLng]);
    }
    return points;
  }

  focusVessel(lat, lng, zoom = 11) {
    if (this.map) {
      this.map.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  }

  toggleSAR(visible) {
    this.sarVisible = visible;
    this.renderSatelliteSAR();
  }

  toggleImpact(visible) {
    this.impactVisible = visible;
    this.renderImpactZones();
  }
}

window.OilGuardMapManager = OilGuardMapManager;
