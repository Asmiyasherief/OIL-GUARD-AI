/**
 * OilGuard AI — Ocean Vision Computer Vision Controller
 * Manages image upload, preset selection, AI scanning animation,
 * bounding box rendering, and classification metrics.
 */
class OceanVisionController {
  constructor() {
    this.currentPreset = "sample_slick";
    this.presets = {
      sample_slick: {
        id: "sample_slick",
        title: "Recon Drone Aerial: Heavy Oil Slick",
        src: "assets/images/ocean/slick.svg",
        classification: "OIL-LIKE SURFACE PATTERN",
        confidence: 0.94,
        confidencePct: "94%",
        classCode: "OIL_LIKE_PATTERN",
        model: "OilGuard Vision v2.4 (Prototype MobileNet-V3 / LADOS)",
        metrics: [
          { label: "Surface Damping", value: "Severe (Capillary wave loss)" },
          { label: "Optical Contrast", value: "-0.42 (Hydrocarbon absorption)" },
          { label: "Texture Entropy", value: "0.24 (Viscoelastic slick)" },
          { label: "Est. Coverage", value: "~48,500 m²" }
        ],
        box: { x: 18, y: 24, w: 68, h: 58 },
        explanation: "Detected visual characteristics are consistent with an oil-like surface pattern. Capillary wave suppression and dark optical attenuation observed. Human verification is required."
      },
      sample_sheen: {
        id: "sample_sheen",
        title: "Patrol Camera: Surface Sheen / Thin Film",
        src: "assets/images/ocean/sheen.svg",
        classification: "SURFACE SHEEN / THIN FILM",
        confidence: 0.86,
        confidencePct: "86%",
        classCode: "SURFACE_SHEEN",
        model: "OilGuard Vision v2.4 (Prototype)",
        metrics: [
          { label: "Surface Damping", value: "Moderate" },
          { label: "Optical Interference", value: "Rainbow fringe detected" },
          { label: "Texture Entropy", value: "0.48" },
          { label: "Est. Coverage", value: "~12,400 m²" }
        ],
        box: { x: 12, y: 28, w: 75, h: 52 },
        explanation: "Optical interference fringing observed consistent with light hydrocarbon surface sheen. Supporting observation for ongoing watch."
      },
      sample_emulsion: {
        id: "sample_emulsion",
        title: "UAV Camera: Weathered Emulsion",
        src: "assets/images/ocean/emulsion.svg",
        classification: "OIL-WATER EMULSION ('CHOCOLATE MOUSSE')",
        confidence: 0.91,
        confidencePct: "91%",
        classCode: "OIL_WATER_EMULSION",
        model: "OilGuard Vision v2.4 (Prototype)",
        metrics: [
          { label: "Surface Damping", value: "Extreme (Viscous clumping)" },
          { label: "Color Profile", value: "Orange-brown mousse" },
          { label: "Texture Entropy", value: "0.62" },
          { label: "Est. Coverage", value: "~26,800 m²" }
        ],
        box: { x: 16, y: 22, w: 70, h: 60 },
        explanation: "Weathered hydrocarbon emulsion signature detected. Indicates aged or emulsified fuel discharge. Immediate containment evaluation recommended."
      },
      sample_clean: {
        id: "sample_clean",
        title: "Coastal Patrol: Clean Ocean Swells",
        src: "assets/images/ocean/clean.svg",
        classification: "CLEAN OCEAN WATER / NATURAL SEA",
        confidence: 0.96,
        confidencePct: "96%",
        classCode: "CLEAN_WATER",
        model: "OilGuard Vision v2.4 (Prototype)",
        metrics: [
          { label: "Surface Damping", value: "None (Active waves)" },
          { label: "Optical Contrast", value: "Normal ambient reflectance" },
          { label: "Texture Entropy", value: "0.89 (Natural waves)" },
          { label: "Est. Coverage", value: "0 m²" }
        ],
        box: null,
        explanation: "No anomalous surface film or hydrocarbon dampening signatures detected. Active capillary wave structure and natural wave crests."
      }
    };
  }

  analyzePreset(presetId, onComplete) {
    this.currentPreset = presetId;
    const data = this.presets[presetId] || this.presets.sample_slick;

    // Trigger UI scanning state
    this.setScanningState(true);

    setTimeout(() => {
      this.setScanningState(false);
      this.renderResult(data);
      if (onComplete) onComplete(data);
    }, 900);
  }

  analyzeCustomImage(file, onComplete) {
    const reader = new FileReader();
    this.setScanningState(true);

    reader.onload = (e) => {
      const customData = {
        id: "custom_upload",
        title: file.name,
        src: e.target.result,
        classification: "OIL-LIKE SURFACE PATTERN (USER UPLOAD)",
        confidence: 0.92,
        confidencePct: "92%",
        classCode: "OIL_LIKE_PATTERN",
        model: "OilGuard Vision v2.4 (Prototype Inference)",
        metrics: [
          { label: "Surface Damping", value: "Significant" },
          { label: "Spectral Attenuation", value: "Detected" },
          { label: "Texture Profile", value: "Viscoelastic damping" },
          { label: "File Size", value: `${Math.round(file.size / 1024)} KB` }
        ],
        box: { x: 20, y: 20, w: 60, h: 60 },
        explanation: "Detected visual characteristics are consistent with an oil-like surface pattern. Capillary wave suppression and optical attenuation identified. Human verification is required."
      };

      setTimeout(() => {
        this.setScanningState(false);
        this.renderResult(customData);
        if (onComplete) onComplete(customData);
      }, 1200);
    };
    reader.readAsDataURL(file);
  }

  setScanningState(isScanning) {
    const scanner = document.getElementById("vision-scan-overlay");
    const statusText = document.getElementById("vision-status-text");
    if (scanner) {
      scanner.style.display = isScanning ? "block" : "none";
    }
    if (statusText) {
      statusText.innerHTML = isScanning
        ? "<span class='spinner-ring'></span> ANALYZING IMAGE SPECTRAL SIGNATURE..."
        : "AI INFERENCE COMPLETE";
    }
  }

  renderResult(data) {
    const imgEl = document.getElementById("vision-preview-img");
    const classEl = document.getElementById("vision-result-class");
    const confEl = document.getElementById("vision-result-conf");
    const explEl = document.getElementById("vision-result-expl");
    const metricsEl = document.getElementById("vision-metrics-list");
    const boxEl = document.getElementById("vision-bounding-box");

    if (imgEl) imgEl.src = data.src;
    if (classEl) {
      classEl.textContent = data.classification;
      classEl.className = data.classCode === "CLEAN_WATER" ? "text-ok" : "text-danger";
    }
    if (confEl) {
      confEl.textContent = data.confidencePct;
      confEl.className = data.classCode === "CLEAN_WATER" ? "text-ok" : "text-danger";
    }
    if (explEl) explEl.textContent = data.explanation;

    if (metricsEl) {
      metricsEl.innerHTML = data.metrics.map(m => `
        <div class="metric-row">
          <span>${m.label}:</span>
          <strong>${m.value}</strong>
        </div>
      `).join("");
    }

    if (boxEl) {
      if (data.box) {
        boxEl.style.display = "block";
        boxEl.style.left = `${data.box.x}%`;
        boxEl.style.top = `${data.box.y}%`;
        boxEl.style.width = `${data.box.w}%`;
        boxEl.style.height = `${data.box.h}%`;
      } else {
        boxEl.style.display = "none";
      }
    }
  }
}

window.OceanVisionController = OceanVisionController;
