/**
 * OilGuard AI — 12-Step Automated Hackathon Demo Controller
 * Executes the complete authority-side intelligence story:
 * DETECT -> VERIFY -> ASSESS -> PROTECT
 */
class HackathonDemoRunner {
  constructor(app) {
    this.app = app;
    this.currentStep = 1;
    this.totalSteps = 12;
    this.isPlaying = false;
    this.timer = null;
    this.speed = 1.0; // 1x normal speed

    this.stepDurations = {
      1: 5000,   // Baseline
      2: 6000,   // Zone entry
      3: 5000,   // Investigation trigger
      4: 6500,   // Telemetry anomaly
      5: 7000,   // Ocean Vision AI
      6: 6000,   // Satellite SAR evidence
      7: 6500,   // AI Fusion Engine
      8: 6000,   // Risk score animation (20->87)
      9: 7500,   // Spill simulation NOW->+6H
      10: 6000,  // Impact analysis
      11: 6500,  // Authority alert modal
      12: 8000   // Final wrap-up
    };

    this.stepDescriptions = {
      1: {
        title: "STEP 1: Maritime Baseline Monitoring",
        narrative: "Command Center online. Monitoring 23 authorized commercial vessels along the Kerala shipping fairway. No active incident alerts.",
        navTab: "overview"
      },
      2: {
        title: "STEP 2: Vessel Enters Coastal Monitoring Zone",
        narrative: "MV Ocean Star (Product Tanker) crosses the Kerala Coastal Monitoring Zone boundary. Vessel count updates from 23 to 24.",
        navTab: "overview"
      },
      3: {
        title: "STEP 3: Unusual Behavior — Investigation Trigger",
        narrative: "Vessel slows abruptly from 12.0 kn to 6.1 kn with irregular heading deviation. An investigation trigger is generated (not proof of a spill).",
        navTab: "vessels"
      },
      4: {
        title: "STEP 4: Authorized Telemetry Anomaly",
        narrative: "Authorized telemetry feed indicates fuel line pressure drop to 41 PSI (norm: 72 PSI) and anomalous flow surge. Anomaly detected.",
        navTab: "vessels"
      },
      5: {
        title: "STEP 5: Ocean Vision AI Surface Analysis",
        narrative: "Patrol drone imagery ingested. Ocean Vision AI processes optical feed and identifies 'OIL-LIKE SURFACE PATTERN' with 94% confidence.",
        navTab: "vision"
      },
      6: {
        title: "STEP 6: Sentinel-1 SAR Supporting Evidence",
        narrative: "Latest available Sentinel-1 SAR satellite pass confirms localized radar backscatter depression (-5.8 dB) along the vessel's wake.",
        navTab: "satellite"
      },
      7: {
        title: "STEP 7: AI Multi-Source Fusion Engine",
        narrative: "OilGuard Fusion Engine correlates AIS, Telemetry, Ocean Imagery, SAR Satellite data, and Environmental Sensitivity.",
        navTab: "overview"
      },
      8: {
        title: "STEP 8: Decision-Support Risk Calculation",
        narrative: "Risk score dynamically aggregates: 20 → 35 → 48 → 61 → 74 → 87/100. Status: HIGH RISK — HUMAN VERIFICATION REQUIRED.",
        navTab: "overview"
      },
      9: {
        title: "STEP 9: Prototype Spill Trajectory Simulation",
        narrative: "Simulation models surface advection driven by 18 km/h SW winds and 1.2 kn NE current. Evaluates NOW → +1H → +3H → +6H drift.",
        navTab: "simulation"
      },
      10: {
        title: "STEP 10: Coastal & Environmental Impact Analysis",
        narrative: "Trajectory intersects Inshore Fishing Grounds (HIGH), Chellanam Coastal Community (HIGH), and Cochin Port Approaches (MEDIUM).",
        navTab: "impact"
      },
      11: {
        title: "STEP 11: Authority Alert Generation",
        narrative: "Simulated emergency alert dispatched to Coast Guard & Maritime Board. Recommended response workflow: VERIFY → ASSESS → RESPOND.",
        navTab: "alerts"
      },
      12: {
        title: "STEP 12: Incident Assessment Complete",
        narrative: "Incident OG-2026-001 cataloged. Workflow fulfilled: DETECT → VERIFY → ASSESS → PROTECT with full human verification safeguards.",
        navTab: "overview"
      }
    };

    this.initUI();
  }

  initUI() {
    const playBtn = document.getElementById("demo-play-btn");
    const restartBtn = document.getElementById("demo-restart-btn");
    const prevBtn = document.getElementById("demo-prev-btn");
    const nextBtn = document.getElementById("demo-next-btn");
    const speedBtn = document.getElementById("demo-speed-btn");

    if (playBtn) {
      playBtn.addEventListener("click", () => this.togglePlay());
    }
    if (restartBtn) {
      restartBtn.addEventListener("click", () => this.jumpToStep(1, true));
    }
    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.jumpToStep(Math.max(1, this.currentStep - 1), false));
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.jumpToStep(Math.min(this.totalSteps, this.currentStep + 1), false));
    }
    if (speedBtn) {
      speedBtn.addEventListener("click", () => {
        this.speed = this.speed === 1.0 ? 2.0 : this.speed === 2.0 ? 0.5 : 1.0;
        speedBtn.textContent = `${this.speed}x`;
      });
    }

    // Step breadcrumb clicks
    const crumbs = document.querySelectorAll(".demo-step-crumb");
    crumbs.forEach((crumb) => {
      crumb.addEventListener("click", () => {
        const stepNum = parseInt(crumb.getAttribute("data-step"));
        this.jumpToStep(stepNum, false);
      });
    });
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying = true;
    const playBtn = document.getElementById("demo-play-btn");
    if (playBtn) playBtn.innerHTML = "<span class='btn-icon'>⏸</span> Pause Demo";
    this.executeCurrentStep();
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) clearTimeout(this.timer);
    const playBtn = document.getElementById("demo-play-btn");
    if (playBtn) playBtn.innerHTML = "<span class='btn-icon'>▶</span> Resume Demo";
  }

  jumpToStep(step, autoPlay = false) {
    if (this.timer) clearTimeout(this.timer);
    this.currentStep = step;
    if (autoPlay) {
      this.play();
    } else {
      this.executeCurrentStep(false);
    }
  }

  executeCurrentStep(scheduleNext = true) {
    const info = this.stepDescriptions[this.currentStep];
    this.updateDemoBanner(info);
    this.updateBreadcrumbs();

    // Trigger state change depending on step
    switch (this.currentStep) {
      case 1:
        this.applyStep1_Baseline();
        break;
      case 2:
        this.applyStep2_ZoneEntry();
        break;
      case 3:
        this.applyStep3_InvestigationTrigger();
        break;
      case 4:
        this.applyStep4_TelemetryAnomaly();
        break;
      case 5:
        this.applyStep5_OceanVision();
        break;
      case 6:
        this.applyStep6_SatelliteEvidence();
        break;
      case 7:
        this.applyStep7_FusionEngine();
        break;
      case 8:
        this.applyStep8_RiskProgression();
        break;
      case 9:
        this.applyStep9_SpillSimulation();
        break;
      case 10:
        this.applyStep10_ImpactAnalysis();
        break;
      case 11:
        this.applyStep11_AuthorityAlert();
        break;
      case 12:
        this.applyStep12_FinalAssessment();
        break;
    }

    if (this.isPlaying && scheduleNext) {
      const duration = (this.stepDurations[this.currentStep] || 6000) / this.speed;
      this.timer = setTimeout(() => {
        if (this.currentStep < this.totalSteps) {
          this.currentStep++;
          this.executeCurrentStep(true);
        } else {
          this.pause();
        }
      }, duration);
    }
  }

  // Step 1: Initial baseline (23 ships, normal)
  applyStep1_Baseline() {
    this.app.switchTab("overview");
    this.app.setVesselCount(23);
    this.app.setRiskScore(14, "LOW");
    this.app.setActiveAlertCount(0);
    this.app.mapManager.updateSpillSpread("NONE");
    this.app.hideAlertModal();

    // Update Ocean Star to pre-entry position
    const v = OilGuardDataStore.vessels[0];
    v.position = { lat: 9.42, lng: 75.88 };
    v.speedKn = 12.0;
    v.status = "TRACKING (EN ROUTE)";
    v.riskLevel = "LOW";
    this.app.mapManager.renderVessels(OilGuardDataStore.vessels);
  }

  // Step 2: MV Ocean Star enters zone (23 -> 24)
  applyStep2_ZoneEntry() {
    this.app.switchTab("overview");
    const v = OilGuardDataStore.vessels[0];
    v.position = { lat: 9.55, lng: 76.10 };
    v.speedKn = 12.0;
    v.status = "INSIDE MONITORING ZONE";
    v.riskLevel = "LOW";

    this.app.setVesselCount(24);
    this.app.mapManager.renderVessels(OilGuardDataStore.vessels);
    this.app.showToast("Vessel Entered Zone", "MV Ocean Star crossed into Kerala Coastal Monitoring Zone.", "info");
  }

  // Step 3: Unusual behavior (speed drops 12 -> 6.1 kn)
  applyStep3_InvestigationTrigger() {
    this.app.switchTab("vessels");
    const v = OilGuardDataStore.vessels[0];
    v.position = { lat: 9.65, lng: 76.25 };
    v.speedKn = 6.1;
    v.status = "UNDER ANALYSIS";
    v.riskLevel = "HIGH";

    this.app.mapManager.renderVessels(OilGuardDataStore.vessels);
    this.app.mapManager.focusVessel(9.65, 76.25, 10);
    this.app.showToast("Investigation Trigger Generated", "Unusual course deceleration detected for MV Ocean Star (12.0 -> 6.1 kn). NOT proof of spill.", "warn");
  }

  // Step 4: Telemetry Anomaly activates
  applyStep4_TelemetryAnomaly() {
    this.app.switchTab("vessels");
    this.app.renderTelemetryPanel(true); // Anomaly state
    this.app.showToast("Telemetry Anomaly Detected", "Fuel manifold pressure drop to 41 PSI (-43%) and anomalous flow surge.", "danger");
  }

  // Step 5: Ocean Vision AI detects oil-like pattern (94%)
  applyStep5_OceanVision() {
    this.app.switchTab("vision");
    this.app.oceanVision.analyzePreset("sample_slick", (data) => {
      this.app.showToast("Ocean Vision AI Detection", "Oil-like surface pattern detected with 94% confidence. Human verification required.", "danger");
    });
  }

  // Step 6: Sentinel-1 SAR satellite supporting observation
  applyStep6_SatelliteEvidence() {
    this.app.switchTab("satellite");
    this.app.mapManager.toggleSAR(true);
    this.app.showToast("Satellite Evidence Corroborated", "Sentinel-1 SAR C-band observation detects -5.8 dB backscatter attenuation in vessel corridor.", "info");
  }

  // Step 7: AI Fusion Engine lights up all sources
  applyStep7_FusionEngine() {
    this.app.switchTab("overview");
    this.app.mapManager.focusVessel(9.65, 76.25, 10);
    this.app.fusionEngine.evidenceStates = { ais: true, telemetry: true, vision: true, satellite: true, environment: true };
    this.app.renderFusionBadges(true);
    this.app.showToast("AI Fusion Correlation", "AIS, Telemetry, Ocean Imagery, SAR Satellite & Environmental sensitivity combined.", "info");
  }

  // Step 8: Risk score animates 20 -> 35 -> 48 -> 61 -> 74 -> 87
  applyStep8_RiskProgression() {
    this.app.switchTab("overview");
    this.app.animateRiskScore(87, () => {
      this.app.setRiskScore(87, "CRITICAL");
      this.app.setActiveAlertCount(1);
      this.app.showToast("Decision-Support Risk: 87/100", "POSSIBLE OIL SPILL — High Risk. Human authority verification required.", "danger");
    });
  }

  // Step 9: Spill simulation NOW -> +1H -> +3H -> +6H
  applyStep9_SpillSimulation() {
    this.app.switchTab("simulation");
    this.app.mapManager.updateSpillSpread("NOW");

    setTimeout(() => {
      this.app.spillSim.setTimeStep("+1H");
    }, 1500 / this.speed);

    setTimeout(() => {
      this.app.spillSim.setTimeStep("+3H");
    }, 3200 / this.speed);

    setTimeout(() => {
      this.app.spillSim.setTimeStep("+6H");
      this.app.showToast("Spill Trajectory Simulation", "Prototype spread indicates drift toward Inshore Fishing Grounds & Chellanam shoreline.", "warn");
    }, 5000 / this.speed);
  }

  // Step 10: Coastal impact analysis activates
  applyStep10_ImpactAnalysis() {
    this.app.switchTab("impact");
    this.app.mapManager.toggleImpact(true);
    this.app.showToast("Potential Impact Assessed", "Fishing Zones: HIGH | Coastal Communities: HIGH | Cochin Port: MEDIUM", "warn");
  }

  // Step 11: Authority alert broadcast modal slides in
  applyStep11_AuthorityAlert() {
    this.app.switchTab("alerts");
    this.app.showAlertModal();
  }

  // Step 12: Final wrap-up summary
  applyStep12_FinalAssessment() {
    this.app.switchTab("overview");
    this.app.showFinalBanner();
  }

  updateDemoBanner(info) {
    const titleEl = document.getElementById("demo-step-title");
    const descEl = document.getElementById("demo-step-desc");
    const counterEl = document.getElementById("demo-step-counter");

    if (titleEl) titleEl.textContent = info.title;
    if (descEl) descEl.textContent = info.narrative;
    if (counterEl) counterEl.textContent = `STEP ${this.currentStep} / ${this.totalSteps}`;
  }

  updateBreadcrumbs() {
    const crumbs = document.querySelectorAll(".demo-step-crumb");
    crumbs.forEach((crumb) => {
      const stepNum = parseInt(crumb.getAttribute("data-step"));
      if (stepNum === this.currentStep) {
        crumb.className = "demo-step-crumb active";
      } else if (stepNum < this.currentStep) {
        crumb.className = "demo-step-crumb completed";
      } else {
        crumb.className = "demo-step-crumb";
      }
    });
  }
}

window.HackathonDemoRunner = HackathonDemoRunner;
