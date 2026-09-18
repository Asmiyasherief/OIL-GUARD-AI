/**
 * OilGuard AI — Main Application Orchestrator
 * Connects Leaflet Map, 3D Hero, Ocean Vision, Spill Simulation,
 * AI Fusion Engine, and the 12-Step Automated Demo.
 */
class OilGuardApp {
  constructor() {
    this.apiBase = "http://127.0.0.1:5000/api";
    this.isBackendOnline = false;
    this.currentTab = "overview";
    this.vesselCount = 23;
    this.riskScore = 14;

    this.mapManager = null;
    this.fusionEngine = null;
    this.oceanVision = null;
    this.spillSim = null;
    this.demoRunner = null;
    this.heroVisual = null;

    this.init();
  }

  async init() {
    // 1. Initialize 3D Landing Hero
    this.heroVisual = new MarineHeroVisual("hero-3d-canvas");

    // 2. Initialize Subsystems
    this.mapManager = new OilGuardMapManager("map-canvas");
    this.fusionEngine = new OilGuardFusionEngine();
    this.oceanVision = new OceanVisionController();
    this.spillSim = new SpillSimulationController(this.mapManager);
    this.demoRunner = new HackathonDemoRunner(this);

    // 3. Bind UI Events
    this.bindEvents();

    // 4. Render Initial Data
    this.renderInitialViews();

    // 5. Check if Flask backend is available
    await this.checkBackendStatus();

    // 6. Start live clock
    this.startClock();
  }

  bindEvents() {
    // Landing screen CTA buttons
    const startCmdBtn = document.getElementById("btn-start-command");
    const watchDemoBtn = document.getElementById("btn-watch-demo");
    const backToLandingBtn = document.getElementById("btn-back-landing");

    if (startCmdBtn) {
      startCmdBtn.addEventListener("click", () => this.openCommandCenter(false));
    }
    if (watchDemoBtn) {
      watchDemoBtn.addEventListener("click", () => this.openCommandCenter(true));
    }
    if (backToLandingBtn) {
      backToLandingBtn.addEventListener("click", () => this.showLandingScreen());
    }

    // Sidebar navigation items
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const targetTab = item.getAttribute("data-tab");
        this.switchTab(targetTab);
      });
    });

    // Start Demo top button
    const topStartDemo = document.getElementById("top-start-demo-btn");
    if (topStartDemo) {
      topStartDemo.addEventListener("click", () => {
        this.demoRunner.jumpToStep(1, true);
      });
    }

    // "WHY?" button on Priority Incident card
    const whyBtn = document.getElementById("btn-why-alert");
    if (whyBtn) {
      whyBtn.addEventListener("click", () => this.showWhyModal());
    }

    // Close modal buttons
    const closeModals = document.querySelectorAll(".modal-close-btn, .modal-backdrop");
    closeModals.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (e.target === btn) {
          this.closeAllModals();
        }
      });
    });

    // Incident Reporting trigger & submit
    const reportIncidentBtn = document.getElementById("btn-report-incident");
    if (reportIncidentBtn) {
      reportIncidentBtn.addEventListener("click", () => this.showReportModal());
    }
    const reportForm = document.getElementById("incident-report-form");
    if (reportForm) {
      reportForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleManualIncidentReport();
      });
    }

    // Layer toggles on map
    const toggleSarBtn = document.getElementById("toggle-layer-sar");
    if (toggleSarBtn) {
      toggleSarBtn.addEventListener("change", (e) => {
        this.mapManager.toggleSAR(e.target.checked);
      });
    }
    const toggleImpactBtn = document.getElementById("toggle-layer-impact");
    if (toggleImpactBtn) {
      toggleImpactBtn.addEventListener("change", (e) => {
        this.mapManager.toggleImpact(e.target.checked);
      });
    }

    // Ocean vision sample selector buttons
    const presetBtns = document.querySelectorAll(".vision-preset-btn");
    presetBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        presetBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const presetId = btn.getAttribute("data-preset");
        this.oceanVision.analyzePreset(presetId);
      });
    });

    // Ocean vision image file input
    const fileInput = document.getElementById("vision-file-input");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          this.oceanVision.analyzeCustomImage(e.target.files[0]);
        }
      });
    }

    // Drag & drop upload box
    const dropZone = document.getElementById("vision-drop-zone");
    if (dropZone) {
      dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("drag-hover");
      });
      dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("drag-hover");
      });
      dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("drag-hover");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.oceanVision.analyzeCustomImage(e.dataTransfer.files[0]);
        }
      });
    }

    // Search and filter in vessel monitoring table
    const vesselSearch = document.getElementById("vessel-search-input");
    if (vesselSearch) {
      vesselSearch.addEventListener("input", (e) => {
        this.filterVessels(e.target.value);
      });
    }

    // History filter
    const historyFilter = document.getElementById("history-status-filter");
    if (historyFilter) {
      historyFilter.addEventListener("change", (e) => {
        this.filterHistory(e.target.value);
      });
    }
  }

  async checkBackendStatus() {
    const statusEl = document.getElementById("backend-status-pill");
    try {
      const res = await fetch(`${this.apiBase}/health`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        this.isBackendOnline = true;
        if (statusEl) {
          statusEl.innerHTML = "<span class='pulse-dot online'></span> FLASK API ONLINE";
          statusEl.className = "status-pill online";
        }
        return;
      }
    } catch (e) {
      // Backend not running; fallback to client data store
    }
    this.isBackendOnline = false;
    if (statusEl) {
      statusEl.innerHTML = "<span class='pulse-dot offline'></span> CLIENT SIMULATION MODE";
      statusEl.className = "status-pill offline";
      statusEl.title = "Frontend demo running with self-contained client data store (100% reliable offline mode).";
    }
  }

  openCommandCenter(startDemo = false) {
    const landing = document.getElementById("landing-screen");
    const cmdCenter = document.getElementById("command-center");

    if (landing) landing.style.display = "none";
    if (cmdCenter) cmdCenter.style.display = "flex";

    // Re-render Leaflet map to guarantee tile calculations
    setTimeout(() => {
      if (this.mapManager && this.mapManager.map) {
        this.mapManager.map.invalidateSize();
      }
      if (startDemo) {
        this.demoRunner.jumpToStep(1, true);
      }
    }, 150);
  }

  showLandingScreen() {
    const landing = document.getElementById("landing-screen");
    const cmdCenter = document.getElementById("command-center");

    if (landing) landing.style.display = "flex";
    if (cmdCenter) cmdCenter.style.display = "none";
    this.demoRunner.pause();
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update sidebar active class
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      if (item.getAttribute("data-tab") === tabId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Update visible view section
    const views = document.querySelectorAll(".view-panel");
    views.forEach((v) => {
      if (v.id === `view-${tabId}`) {
        v.classList.add("active");
      } else {
        v.classList.remove("active");
      }
    });

    // Recalculate map on Overview or Map views
    if (tabId === "overview" && this.mapManager && this.mapManager.map) {
      setTimeout(() => this.mapManager.map.invalidateSize(), 50);
    }
  }

  renderInitialViews() {
    // 1. Initial vessel markers
    this.mapManager.renderVessels(OilGuardDataStore.vessels);

    // 2. Render Vessel monitoring table
    this.renderVesselTable(OilGuardDataStore.vessels);

    // 3. Render Telemetry baseline
    this.renderTelemetryPanel(false);

    // 4. Render Incident Centre
    this.renderIncidentCards();

    // 5. Render Incident History
    this.renderHistoryTable();

    // 6. Initial Ocean Vision
    this.oceanVision.renderResult(this.oceanVision.presets.sample_slick);

    // 7. Initial Fusion Engine cards
    this.renderFusionBadges(true);
  }

  renderVesselTable(vessels) {
    const tbody = document.getElementById("vessel-table-body");
    if (!tbody) return;

    tbody.innerHTML = vessels.map((v) => {
      const isHighRisk = v.riskLevel === "HIGH";
      return `
        <tr class="${isHighRisk ? 'row-high-risk' : ''}" onclick="window.app.handleVesselRowClick('${v.id}')">
          <td><strong>${v.name}</strong></td>
          <td>${v.mmsi}</td>
          <td>${v.type}</td>
          <td>${v.speedKn} kn</td>
          <td>${v.heading}°</td>
          <td>${v.position.lat.toFixed(2)}, ${v.position.lng.toFixed(2)}</td>
          <td><span class="badge ${isHighRisk ? 'badge-danger' : 'badge-ok'}">${v.status}</span></td>
          <td><span class="badge ${isHighRisk ? 'badge-critical' : 'badge-low'}">${v.riskLevel}</span></td>
        </tr>
      `;
    }).join("");
  }

  filterVessels(query) {
    const q = query.toLowerCase();
    const filtered = OilGuardDataStore.vessels.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.mmsi.includes(q) ||
      v.type.toLowerCase().includes(q)
    );
    this.renderVesselTable(filtered);
  }

  handleVesselRowClick(vesselId) {
    const v = OilGuardDataStore.vessels.find(x => x.id === vesselId);
    if (!v) return;

    this.mapManager.focusVessel(v.position.lat, v.position.lng, 11);
    this.switchTab("overview");
    this.showToast(v.name, `Centered map on ${v.name} (${v.status})`, "info");
  }

  renderTelemetryPanel(isAnomaly = false) {
    const tel = isAnomaly ? OilGuardDataStore.telemetry.observedIncident : OilGuardDataStore.telemetry.normalBaseline;
    const pressEl = document.getElementById("tel-pressure-val");
    const flowEl = document.getElementById("tel-flow-val");
    const levelEl = document.getElementById("tel-level-val");
    const tempEl = document.getElementById("tel-temp-val");
    const statusEl = document.getElementById("tel-anomaly-status");
    const summaryEl = document.getElementById("tel-anomaly-summary");

    if (pressEl) {
      pressEl.textContent = `${tel.fuelPressurePsi.value} PSI`;
      pressEl.className = isAnomaly ? "metric-val text-danger" : "metric-val text-ok";
    }
    if (flowEl) {
      flowEl.textContent = `${tel.fuelFlowTph.value} t/h`;
      flowEl.className = isAnomaly ? "metric-val text-danger" : "metric-val text-ok";
    }
    if (levelEl) {
      levelEl.textContent = `${tel.fuelLevelPct.value}%`;
      levelEl.className = isAnomaly ? "metric-val text-warn" : "metric-val text-ok";
    }
    if (tempEl) {
      tempEl.textContent = `${tel.engineTempC.value} °C`;
    }
    if (statusEl) {
      statusEl.textContent = isAnomaly ? "ANOMALY DETECTED" : "NORMAL OPERATIONAL BASELINE";
      statusEl.className = isAnomaly ? "badge badge-critical" : "badge badge-ok";
    }
    if (summaryEl) {
      summaryEl.textContent = isAnomaly
        ? tel.anomalySummary
        : "Engine parameters operating within standard verified operational envelopes.";
    }
  }

  renderIncidentCards() {
    const cardWrap = document.getElementById("incident-centre-cards");
    if (!cardWrap) return;

    cardWrap.innerHTML = OilGuardDataStore.incidents.map((inc) => {
      const isHigh = inc.riskLevel === "HIGH";
      return `
        <div class="incident-card ${isHigh ? 'incident-high' : ''}">
          <div class="incident-card-header">
            <div>
              <span class="badge ${isHigh ? 'badge-danger' : 'badge-low'}">${inc.id}</span>
              <span class="incident-title">${inc.title}</span>
            </div>
            <div class="risk-pill ${isHigh ? 'risk-critical' : 'risk-low'}">${inc.riskScore}/100</div>
          </div>
          <div class="incident-card-body">
            <div class="inc-meta-row"><span>VESSEL:</span> <strong>${inc.vesselName} (MMSI: ${inc.mmsi})</strong></div>
            <div class="inc-meta-row"><span>LOCATION:</span> <strong>${inc.location.zoneName}</strong></div>
            <div class="inc-meta-row"><span>SOURCE:</span> <strong>${inc.source}</strong></div>
            <div class="inc-meta-row"><span>STATUS:</span> <strong class="${isHigh ? 'text-danger' : 'text-ok'}">${inc.status}</strong></div>
            <div class="inc-meta-row"><span>POTENTIAL IMPACT:</span> <strong class="${isHigh ? 'text-danger' : 'text-ok'}">${inc.potentialImpact}</strong></div>
          </div>
          <div class="incident-card-actions">
            <button class="btn btn-sm btn-outline" onclick="window.app.switchTab('overview')">VIEW INCIDENT</button>
            <button class="btn btn-sm btn-outline" onclick="window.app.switchTab('vision')">RUN ANALYSIS</button>
            <button class="btn btn-sm btn-primary" onclick="window.app.switchTab('simulation')">SIMULATE SPREAD</button>
            <button class="btn btn-sm btn-outline" onclick="window.app.switchTab('impact')">VIEW IMPACT</button>
            <button class="btn btn-sm btn-outline" onclick="window.app.acknowledgeIncident('${inc.id}')">ACKNOWLEDGE</button>
          </div>
        </div>
      `;
    }).join("");
  }

  renderHistoryTable(filter = "ALL") {
    const tbody = document.getElementById("history-table-body");
    if (!tbody) return;

    const list = OilGuardDataStore.incidents.filter((i) => {
      if (filter === "ALL") return true;
      if (filter === "ACTIVE") return i.status === "Verification Required";
      if (filter === "CLOSED") return i.status.includes("Closed") || i.status.includes("Archived");
      return true;
    });

    tbody.innerHTML = list.map((i) => `
      <tr>
        <td><strong>${i.id}</strong></td>
        <td>${i.vesselName}</td>
        <td>${i.title}</td>
        <td><span class="badge ${i.riskLevel === 'HIGH' ? 'badge-danger' : 'badge-low'}">${i.riskScore} · ${i.riskLevel}</span></td>
        <td>${i.status}</td>
        <td>${i.timestamp.split("T")[0]}</td>
        <td>
          <button class="btn btn-xs btn-outline" onclick="window.app.switchTab('overview')">INSPECT</button>
        </td>
      </tr>
    `).join("");
  }

  filterHistory(val) {
    this.renderHistoryTable(val);
  }

  renderFusionBadges(isHigh = true) {
    const fusion = this.fusionEngine.calculateRisk();
    const badgesEl = document.getElementById("fusion-sources-badges");
    if (badgesEl) {
      badgesEl.innerHTML = `
        <div class="source-tag ${fusion.evidenceStates?.ais !== false ? 'lit' : ''}">AIS ✓ (15)</div>
        <div class="source-tag ${fusion.evidenceStates?.telemetry !== false ? 'lit' : ''}">TELEMETRY ✓ (20)</div>
        <div class="source-tag ${fusion.evidenceStates?.vision !== false ? 'lit' : ''}">OCEAN VISION ✓ (30)</div>
        <div class="source-tag ${fusion.evidenceStates?.satellite !== false ? 'lit' : ''}">SATELLITE SAR ✓ (18)</div>
        <div class="source-tag ${fusion.evidenceStates?.environment !== false ? 'lit' : ''}">ENVIRONMENT ✓ (14)</div>
      `;
    }
  }

  animateRiskScore(target, onComplete) {
    let current = 20;
    const steps = [20, 35, 48, 61, 74, target];
    let i = 0;

    const interval = setInterval(() => {
      if (i < steps.length) {
        this.setRiskScore(steps[i], steps[i] >= 80 ? "CRITICAL" : "HIGH");
        i++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 280);
  }

  setRiskScore(score, level = "HIGH") {
    this.riskScore = score;
    const scoreVal = document.getElementById("hud-risk-score-val");
    const scoreBar = document.getElementById("hud-risk-bar-fill");
    const scoreLevel = document.getElementById("hud-risk-level-label");

    if (scoreVal) scoreVal.textContent = `${score}/100`;
    if (scoreBar) scoreBar.style.width = `${score}%`;
    if (scoreLevel) {
      scoreLevel.textContent = level;
      scoreLevel.className = score >= 80 ? "text-danger" : score >= 60 ? "text-danger" : "text-ok";
    }
  }

  setVesselCount(count) {
    this.vesselCount = count;
    const countEl = document.getElementById("stat-vessels-count");
    if (countEl) countEl.textContent = count;
  }

  setActiveAlertCount(count) {
    const alertEl = document.getElementById("stat-active-alerts");
    if (alertEl) alertEl.textContent = count;
  }

  showWhyModal() {
    const modal = document.getElementById("why-explain-modal");
    const content = document.getElementById("why-modal-content");
    const result = this.fusionEngine.calculateRisk();

    if (content) {
      content.innerHTML = `
        <div class="why-header">
          <div class="why-score-callout">
            <span class="score-num">${result.score}</span>
            <span class="score-sub">/ 100 PROTOTYPE RISK SCORE</span>
          </div>
          <div class="why-status-banner">
            <strong>STATUS: ${result.status}</strong>
            <p>Incident: <strong>POSSIBLE OIL SPILL</strong> — Human verification mandatory prior to response action.</p>
          </div>
        </div>
        <div class="why-evidence-list">
          ${result.whyReasons.map(r => `
            <div class="why-item ${r.confirmed ? 'confirmed' : ''}">
              <div class="why-check">✓</div>
              <div class="why-details">
                <div class="why-item-title">
                  <strong>${r.title}</strong>
                  <span class="points-badge">${r.points}</span>
                </div>
                <div class="why-source-tag">${r.source}</div>
                <p>${r.detail}</p>
              </div>
            </div>
          `).join("")}
        </div>
        <div class="why-footer-note">
          ⚠ <strong>Decision-Support Prototype:</strong> Scores are transparently derived from multi-source correlations and are not scientific forecasts.
        </div>
      `;
    }
    if (modal) modal.style.display = "flex";
  }

  showAlertModal() {
    const modal = document.getElementById("authority-alert-modal");
    if (modal) modal.style.display = "flex";
  }

  hideAlertModal() {
    const modal = document.getElementById("authority-alert-modal");
    if (modal) modal.style.display = "none";
  }

  showFinalBanner() {
    const modal = document.getElementById("final-summary-modal");
    if (modal) modal.style.display = "flex";
  }

  showReportModal() {
    const modal = document.getElementById("incident-report-modal");
    if (modal) modal.style.display = "flex";
  }

  closeAllModals() {
    const modals = document.querySelectorAll(".modal-overlay");
    modals.forEach(m => m.style.display = "none");
  }

  handleManualIncidentReport() {
    const vesselName = document.getElementById("report-vessel-select")?.value || "MV Ocean Star";
    const reportType = document.getElementById("report-condition-input")?.value || "Possible Oil Discharge";

    const newInc = {
      id: `OG-2026-${String(OilGuardDataStore.incidents.length + 1).padStart(3, "0")}`,
      title: `${reportType} — ${vesselName}`,
      source: "Manual Observer Report",
      vesselId: "OG-VESSEL-01",
      vesselName,
      mmsi: "419001234",
      location: { lat: 9.65, lng: 76.25, zoneName: "Kerala Coastal Monitoring Zone" },
      timestamp: new Date().toISOString(),
      reportedCondition: reportType,
      status: "Verification Required",
      riskScore: 78,
      riskLevel: "HIGH",
      evidenceCount: 3,
      potentialImpact: "High",
      recommendedAction: "VERIFY -> ASSESS -> RESPOND"
    };

    OilGuardDataStore.incidents.unshift(newInc);
    this.renderIncidentCards();
    this.renderHistoryTable();
    this.closeAllModals();
    this.showToast("Incident Report Submitted", `Registered ${newInc.id}. Supporting evidence gathering initiated.`, "info");
    this.switchTab("incidents");
  }

  acknowledgeIncident(id) {
    this.showToast("Incident Acknowledged", `Authority duty officer logged confirmation for incident ${id}.`, "ok");
  }

  showToast(title, message, type = "info") {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast-card toast-${type}`;
    toast.innerHTML = `
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("toast-show");
    }, 20);

    setTimeout(() => {
      toast.classList.remove("toast-show");
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  startClock() {
    const clockEl = document.getElementById("utc-clock");
    const update = () => {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toUTCString().replace("GMT", "UTC");
      }
    };
    update();
    setInterval(update, 1000);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.app = new OilGuardApp();
});
