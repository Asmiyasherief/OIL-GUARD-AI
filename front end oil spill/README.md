# OilGuard AI — Marine Oil Spill Intelligence & Response Decision-Support Platform

> **Hackathon Prototype** · Smart India Hackathon / Marine Surveillance Innovation Track  
> **Operational Cycle:** `DETECT → VERIFY → ASSESS → PROTECT`  
> **Sector:** Kerala Coastal Monitoring Zone (Kochi Outer Fairway & Central Shelf)

---

## 1. Core Problem Statement

Marine oil spills present catastrophic ecological, economic, and social threats to coastal ecosystems, fisheries, tourism, and port infrastructure. When a suspected marine pollution incident occurs, authorities are faced with fragmented, heterogeneous information:
- Commercial vessels moving across traffic corridors
- Incomplete observer reports or ship masters failing to disclose incidents
- High-latency satellite passes and intermittent patrol drone imagery
- Ocean current and wind forcing driving surface slick drift toward sensitive coastlines

The problem is not simply *"detect every oil spill automatically."* The operational challenge is:

> *"How can maritime authorities combine vessel tracking, available surveillance/imagery, satellite observations, environmental forcing, and incident reports to identify and verify possible oil spills faster, estimate potential spread, and understand which coastal areas may be affected?"*

**OilGuard AI** is an authority-side intelligence and decision-support command center that correlates these disparate evidence streams into an explainable, prioritized incident assessment.

---

## 2. System Architecture & Workflow

OilGuard AI bridges the intelligence gap between raw sensors and executive response:

```
+-----------------------------------------------------------------------------------+
|                            MULTI-SOURCE EVIDENCE INGESTION                        |
+-------------------+-------------------+-------------------+-----------------------+
|  Simulated AIS /  |   Authorized      |    Surveillance   |  Sentinel-1 SAR C-Band|
|  VTS Trajectory   |   Ship Telemetry  |  Patrol Drone Vis |  Satellite Radar Pass |
+---------+---------+---------+---------+---------+---------+-----------+-----------+
          |                   |                   |                     |
          v                   v                   v                     v
    Unexpected          Fuel Pressure       Ocean Vision AI       Radar Backscatter
    Deceleration         Drop (-43%)          (94% Confidence)      Damping (-5.8 dB)
          |                   |                   |                     |
+---------+-------------------+-------------------+---------------------+-----------+
|                               AI FUSION ENGINE                                    |
|   Transparent Scoring: AIS (15) + Telemetry (20) + Vision (28) + SAR (12) + Env (12)   |
|   Result: Prototype Risk Score: 87 / 100  -->  STATUS: POSSIBLE OIL SPILL         |
+-------------------------------------+---------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------------+
|                        SPILL TRAJECTORY SPREAD SIMULATION                         |
|   Wind Vector (3% Windage: 18 km/h SW) + Surface Current Vector (1.2 kn NE)       |
|   Horizons: NOW (0.65 km²)  -->  +1H (4.8 km²)  -->  +3H (18.2 km²)  -->  +6H (52.6 km²) |
+-------------------------------------+---------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------------+
|                         COASTAL IMPACT SEVERITY ANALYSIS                          |
|   - Fishing Zone A (Artisanal Waters):  HIGH POTENTIAL IMPACT (T+2.2 Hours)       |
|   - Coastal Communities (Chellanam):    HIGH POTENTIAL IMPACT (T+4.8 Hours)       |
|   - Cochin Port Approaches & Fairway:   MEDIUM POTENTIAL IMPACT (T+5.5 Hours)     |
|   - Sensitive Marine Reserve:           MEDIUM POTENTIAL IMPACT (Tidal Risk)      |
+-------------------------------------+---------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------------+
|                   SIMULATED AUTHORITY EMERGENCY ALERT BROADCAST                   |
|                  Recommended Action: VERIFY --> ASSESS --> RESPOND                |
+-----------------------------------------------------------------------------------+
```

---

## 3. Key Components & Real-World Data Logic

### 3.1 AIS / VTS Vessel Tracking
- **Role:** Identity, kinematic tracking, and anomalous maneuver detection.
- **Data:** Simulated AIS/VTS feed (`MV Ocean Star`, `MV Coral`, `MT Blue Horizon`, `MV Arabian Pearl`).
- **Core Principle:** AIS alone does **NOT** detect oil spills. Unexpected speed drops (e.g., 12.0 kn to 6.1 kn) or erratic course deviations serve strictly as an **investigation trigger** to cue secondary remote sensing.

### 3.2 Authorized Ship Telemetry
- **Role:** Internal machinery anomaly detection.
- **Data:** Fuel pressure (Normal: 72 PSI, Observed: 41 PSI), fuel flow rate (+17.8 t/h spike), tank depletion rate (0.86%/h).
- **Compliance Safeguard:** Government authorities cannot automatically tap a foreign vessel's private engine computers. The prototype clearly designates this as an *authorized telemetry feed* or simulated data-sharing agreement.

### 3.3 Ocean Vision AI (Computer Vision)
- **Role:** Optical surface anomaly classification.
- **Classes:** `OIL-LIKE SURFACE PATTERN`, `SURFACE SHEEN`, `OIL-WATER EMULSION`, `CLEAN WATER`.
- **Primary Scenario Output:** Class: *Possible Oil-like Pattern*, Confidence: *94%*.
- **Safeguard:** Outputs are explicitly labeled as decision-support evidence requiring on-scene human verification.

### 3.4 Sentinel-1 SAR Satellite Evidence
- **Role:** Wide-area synthetic aperture radar verification.
- **Sensor:** C-Band SAR (5.405 GHz), Interferometric Wide (IW) mode, dual-polarization (VV + VH).
- **Finding:** Dark-patch sea surface backscatter depression (-5.8 dB attenuation) caused by hydrocarbon dampening of capillary waves.
- **Crucial Clarification:** Sentinel-1 is **not live video**. Passes occur every few days; OilGuard presents the *latest available observation pass* as supporting evidence.

### 3.5 Spill Trajectory Simulation
- **Role:** Decision-support drift projection.
- **Model:** Fay-type empirical advection:
  $$\vec{V}_{\text{drift}} = 0.03 \cdot \vec{V}_{\text{wind}} + \vec{V}_{\text{current}}$$
- **Horizons:** Interactive map rendering of `NOW`, `+1H`, `+3H`, `+6H` expanding contours.
- **Labeling:** *Prototype spill trajectory simulation — not an operational oceanographic forecast.*

---

## 4. Transparent AI Fusion Risk Engine

The OilGuard Fusion Engine avoids "black-box" scoring by exposing an auditable 100-point breakdown:

| Evidence Stream | Max Points | Demo Finding | Points Awarded | Status |
| :--- | :---: | :--- | :---: | :--- |
| **AIS / VTS Anomaly** | 15 | Vessel inside monitoring corridor; speed dropped 12 → 6.1 kn | **15** | CONFIRMED |
| **Authorized Telemetry** | 20 | Fuel line pressure dropped to 41 PSI (-43%); flow surge | **20** | ANOMALY DETECTED |
| **Ocean Vision AI** | 30 | Optical oil-like pattern detected with 94% confidence | **28** | CONFIRMED |
| **Sentinel-1 SAR Satellite** | 20 | Supporting pass corroborates -5.8 dB radar backscatter drop | **12** | SUPPORTING |
| **Environmental Sensitivity** | 15 | Immediate proximity to Inshore Fishing Zone A & coast | **12** | HIGH PROXIMITY |
| **Total Decision Score** | **100** | **Risk Level: CRITICAL / HIGH RISK** | **87 / 100** | **VERIFICATION REQUIRED** |

Clicking **"WHY THIS ALERT?"** in the dashboard renders an animated checklist explaining each evidentiary finding with checkmarks.

---

## 5. Automated 12-Step Hackathon Demonstration

OilGuard AI includes a single-click **START DEMO** engine that automatically guides judges through the complete incident timeline in 60–90 seconds:

1. **Step 1 — Maritime Baseline:** Command center monitors 23 commercial vessels; no active alerts.
2. **Step 2 — Zone Entry:** `MV Ocean Star` enters the Kerala Monitoring Zone. Ship counter updates: **23 → 24**.
3. **Step 3 — Investigation Trigger:** Sudden speed drop (12.0 → 6.1 kn) triggers investigation status (not proof of spill).
4. **Step 4 — Telemetry Anomaly:** Fuel pressure drops to 41 PSI, flow rate spikes. Status: `ANOMALY DETECTED`.
5. **Step 5 — Ocean Vision AI:** Drone photo analyzed. Computer vision displays: `OIL-LIKE PATTERN (94% confidence)`.
6. **Step 6 — Satellite Evidence:** Sentinel-1 SAR C-band observation confirms radar backscatter attenuation.
7. **Step 7 — AI Fusion Correlation:** All 5 evidence streams light up (`AIS ✓`, `TELEMETRY ✓`, `VISION ✓`, `SAR ✓`, `ENV ✓`).
8. **Step 8 — Risk Score Progression:** Risk score animates `20 → 35 → 48 → 61 → 74 → 87/100` (`HIGH RISK — VERIFICATION REQUIRED`).
9. **Step 9 — Spill Spread Simulation:** Trajectory models drift along 048° NE across `NOW → +1H → +3H → +6H`.
10. **Step 10 — Impact Analysis:** Intersection highlights Fishing Ground (HIGH), Port (MEDIUM), and Coastal Community (HIGH).
11. **Step 11 — Authority Alert:** Simulated emergency alert modal slides in with action: `VERIFY → ASSESS → RESPOND`.
12. **Step 12 — Final Assessment:** Incident `OG-2026-001` logged. System displays: `DETECT → VERIFY → ASSESS → PROTECT`.

---

## 6. Regulatory Context: IMO MARPOL Annex I

> **Judge Pitch Statement:**  
> *"Ships have strict reporting and pollution-prevention obligations under MARPOL Annex I. OilGuard AI does not replace that process. Our system focuses on the authority-side intelligence gap by combining available vessel, imagery, satellite and environmental evidence to help verify possible incidents, assess potential spread, and identify potentially affected coastal areas faster."*

---

## 7. Judge Defense & Frequently Asked Questions (FAQ)

#### Q1: "How do you get data from a foreign ship?"
> **Answer:** "We do not access a foreign vessel's private systems. The prototype uses simulated AIS/VTS data. In real deployment, authorities would use authorized maritime surveillance data. Private telemetry would only be available through an authorized data-sharing mechanism or Port State Control agreement."

#### Q2: "Can AIS alone detect an oil spill?"
> **Answer:** "No. AIS provides vessel identity, speed, course, and position. OilGuard uses vessel behavior as an investigation trigger and combines it with independent evidence such as optical imagery, satellite radar observations, and incident reports."

#### Q3: "What if the ship does not report the spill?"
> **Answer:** "OilGuard supports independent observation workflows using surveillance tracks, patrol drone photos, and Sentinel-1 passes. It does not claim to detect every spill automatically, but provides a verification bridge when anomalies are observed."

#### Q4: "Is the satellite feed live video?"
> **Answer:** "No. Sentinel-1 is Synthetic Aperture Radar (SAR), not live continuous video. OilGuard uses the latest available observation pass as supporting corroboration."

#### Q5: "Why use AI?"
> **Answer:** "Authorities receive fragmented, multi-modal data. AI assists in combining heterogeneous evidence streams, calculating an explainable risk score, and prioritizing incidents for human duty officers."

#### Q6: "Can this system replace maritime authorities?"
> **Answer:** "No. OilGuard is decision support. Human and authority verification is a mandatory, uncompromising step in the workflow before any response is dispatched."

#### Q7: "Can the spill trajectory prediction be trusted operationally?"
> **Answer:** "The hackathon model is a simplified prototype simulation. Production deployment would require integration with validated operational oceanographic hydrodynamic models (such as NOAA GNOME or OpenDrift) and authoritative ocean current APIs."

---

## 8. Technology Stack

- **Frontend:** HTML5, Modern CSS3 (Glassmorphism & Marine Command-and-Control Theme), Vanilla ES6 Modules.
- **Geospatial & 3D Mapping:** Leaflet.js (CartoDB Dark Basemaps, GeoJSON Sensitivity Overlays), Three.js (3D Interactive Ocean Particle Hero).
- **Backend (REST API):** Python 3, Flask, Flask-CORS.
- **Data & Simulation Services:** NumPy, Scikit-learn, PIL / Computer Vision heuristics, GeoJSON geometries.
- **Dual-Mode Architecture:** The application runs 100% offline in any browser or on GitHub Pages via a self-contained client data store (`js/data-store.js`), and automatically upgrades to live REST endpoints when `backend/app.py` is running.

---

## 9. Quickstart & Installation Instructions

### Option A: Instant Browser / GitHub Pages Execution (Zero Dependencies)
Because the frontend is built using standard ES6 modules and CDN libraries, you can run it immediately without compiling:
1. Simply double-click `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).
2. Or serve statically with Python:
   ```bash
   python -m http.server 8080
   ```
3. Open `http://localhost:8080` in your browser.

### Option B: Run with Python Flask REST API Backend
To run the full client-server system with real-time REST endpoints:
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the Flask backend server:
   ```bash
   python backend/app.py
   ```
3. Open `http://localhost:5000` in your browser. The status indicator in the top navbar will illuminate green: **FLASK API ONLINE**.
4. Run automated test suite:
   ```bash
   python backend/tests/test_api.py
   ```

---

## 10. Future Production Scope

In a live operational deployment, OilGuard AI would integrate with:
- **Enterprise GIS:** PostgreSQL / PostGIS database clusters.
- **Live Vessel Feeds:** Direct encrypted ingestion of national AIS/VTS radar networks.
- **Copernicus Data Space Ecosystem:** Automated API ingestion of Sentinel-1 IW SAR Level-1 GRD products.
- **Operational Ocean Modeling:** Hydrodynamic coupling with INCOIS (Indian National Centre for Ocean Information Services) ocean current models and NCMRWF meteorological forecasts.
- **Edge Deployment:** Onboard edge AI vision containers deployed to Coast Guard Dornier aircraft and maritime patrol UAVs.

---

## 11. Team Contributions (5-Member SIH Team)

- **Lead Full-Stack & Systems Architect:** Core framework, Command Center dashboard, responsive layouts.
- **Geospatial & Mapping Engineer:** Leaflet GIS integration, Kerala monitoring zone, and coastal impact polygons.
- **AI/ML & Computer Vision Engineer:** Ocean Vision image classifier and Multi-Source Fusion Risk Engine.
- **Simulation & Oceanographic Modeler:** Wind-current vector advection algorithms and time-horizon progression.
- **Product Engineer & Regulatory Specialist:** MARPOL Annex I compliance, Judge Defense matrix, and UI/UX design.

---

## 12. Prototype Disclaimer

> *"OilGuard AI is a hackathon decision-support prototype. AIS, telemetry and incident inputs used in the demonstration may be simulated. Satellite imagery is treated as supporting evidence rather than continuous live monitoring. The spill trajectory component is a simplified prototype simulation and is not an operational oceanographic forecast. Real deployment would require authorized maritime data access, validated models, official geospatial datasets, appropriate satellite-data services and human/authority verification."*
