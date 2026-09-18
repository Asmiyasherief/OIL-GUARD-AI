/**
 * OilGuard AI — Interactive Spill Trajectory Simulation Controller
 * Simulates wind (3% rule) + ocean surface current advection.
 * Displays NOW, +1H, +3H, +6H time horizons with area & shoreline proximity.
 */
class SpillSimulationController {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.windSpeed = 18.0; // km/h
    this.windDirectionFrom = 225; // SW
    this.currentSpeed = 1.2; // kn
    this.currentDirectionToward = 55; // NE
    this.activeTimeStep = "NOW";

    this.initControls();
  }

  initControls() {
    // Time button listeners
    const timeButtons = document.querySelectorAll(".sim-time-btn");
    timeButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        timeButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const step = btn.getAttribute("data-step");
        this.setTimeStep(step);
      });
    });

    // Wind & Current slider inputs
    const windSpeedInput = document.getElementById("sim-wind-speed");
    const windSpeedVal = document.getElementById("sim-wind-speed-val");
    if (windSpeedInput) {
      windSpeedInput.addEventListener("input", (e) => {
        this.windSpeed = parseFloat(e.target.value);
        if (windSpeedVal) windSpeedVal.textContent = `${this.windSpeed} km/h`;
        this.recalculate();
      });
    }

    const curSpeedInput = document.getElementById("sim-current-speed");
    const curSpeedVal = document.getElementById("sim-current-speed-val");
    if (curSpeedInput) {
      curSpeedInput.addEventListener("input", (e) => {
        this.currentSpeed = parseFloat(e.target.value);
        if (curSpeedVal) curSpeedVal.textContent = `${this.currentSpeed} kn`;
        this.recalculate();
      });
    }

    const windDirInput = document.getElementById("sim-wind-dir");
    const windDirVal = document.getElementById("sim-wind-dir-val");
    if (windDirInput) {
      windDirInput.addEventListener("input", (e) => {
        this.windDirectionFrom = parseInt(e.target.value);
        if (windDirVal) windDirVal.textContent = `${this.windDirectionFrom}° (${this.getCardinal(this.windDirectionFrom)})`;
        this.recalculate();
      });
    }
  }

  setTimeStep(step) {
    this.activeTimeStep = step;
    if (this.mapManager) {
      this.mapManager.updateSpillSpread(step);
    }
    this.updateMetrics();
  }

  recalculate() {
    if (this.mapManager) {
      this.mapManager.updateSpillSpread(this.activeTimeStep);
    }
    this.updateMetrics();
  }

  updateMetrics() {
    const areaEl = document.getElementById("sim-area-val");
    const distEl = document.getElementById("sim-dist-val");
    const zonesEl = document.getElementById("sim-zones-val");
    const speedEl = document.getElementById("sim-net-speed");

    // Calculate net drift
    const windKmh = this.windSpeed * 0.03;
    const curKmh = this.currentSpeed * 1.852;
    const netSpeedKmh = Math.hypot(windKmh, curKmh);

    let h = 0;
    let area = 0.65;
    let dist = 0.0;
    let zones = "Immediate Release Point (Outer Fairway)";

    if (this.activeTimeStep === "+1H") {
      h = 1;
      area = 4.8;
      dist = (netSpeedKmh * 1).toFixed(1);
      zones = "Approaching Inshore Fishing Zone A";
    } else if (this.activeTimeStep === "+3H") {
      h = 3;
      area = 18.2;
      dist = (netSpeedKmh * 3).toFixed(1);
      zones = "Intersecting Fishing Zone A; Near Cochin Port Channel";
    } else if (this.activeTimeStep === "+6H") {
      h = 6;
      area = 52.6;
      dist = (netSpeedKmh * 6).toFixed(1);
      zones = "Fishing Zone A & Chellanam Coastal Shoreline Impact";
    }

    if (areaEl) areaEl.textContent = `${area} km²`;
    if (distEl) distEl.textContent = `${dist} km from origin`;
    if (zonesEl) zonesEl.textContent = zones;
    if (speedEl) speedEl.textContent = `${netSpeedKmh.toFixed(1)} km/h (NE)`;
  }

  getCardinal(deg) {
    const cardinals = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
    return cardinals[Math.round((deg % 360) / 45)];
  }
}

window.SpillSimulationController = SpillSimulationController;
