"""
OilGuard AI — REST API Backend Server
Marine Oil Spill Intelligence & Response Decision-Support Platform
Smart India Hackathon Prototype
"""
import os
import json
import logging
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from services.fusion_service import calculate_fusion_risk
from services.vision_service import analyze_image_bytes, SAMPLE_PRESETS
from services.spread_service import simulate_spill_trajectory
from services.satellite_service import get_sentinel1_observation

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("OilGuard-Backend")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
DATA_DIR = os.path.join(ROOT_DIR, "data")

app = Flask(__name__, static_folder=ROOT_DIR, static_url_path="")
CORS(app)

def load_json_file(filename, default=None):
    filepath = os.path.join(DATA_DIR, filename)
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading {filename}: {e}")
    return default if default is not None else {}

# 1. Health check
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ONLINE",
        "service": "OilGuard AI Backend",
        "version": "1.0.0-hackathon-prototype",
        "environment": "Kerala Coast Watch Monitoring",
        "timestamp": "2026-09-18T09:00:00Z"
    })

# 2. Vessels
@app.route("/api/vessels", methods=["GET"])
def get_vessels():
    vessels = load_json_file("vessels.json", [])
    return jsonify({
        "count": len(vessels),
        "source": "Prototype AIS / VTS feed (Simulated)",
        "vessels": vessels
    })

# 3. Incidents
@app.route("/api/incidents", methods=["GET"])
def get_incidents():
    incidents = load_json_file("incidents.json", [])
    return jsonify({
        "count": len(incidents),
        "active": [inc for inc in incidents if inc.get("status") != "Closed / Resolved"],
        "history": incidents
    })

# 4. Telemetry
@app.route("/api/telemetry", methods=["GET"])
def get_telemetry():
    vessel_id = request.args.get("vesselId", "OG-VESSEL-01")
    telemetry_data = load_json_file("telemetry.json", {})
    return jsonify(telemetry_data)

# 5. Image Analysis (Ocean Vision)
@app.route("/api/analyze-image", methods=["POST"])
def analyze_image():
    preset_id = request.form.get("presetId") or (request.json.get("presetId") if request.is_json else None)
    file = request.files.get("image")

    image_bytes = None
    if file:
        image_bytes = file.read()

    result = analyze_image_bytes(image_bytes=image_bytes, preset_id=preset_id)
    return jsonify({
        "status": "SUCCESS",
        "analysis": result,
        "disclaimer": "AI output is decision-support evidence and requires human verification."
    })

# 6. Satellite Evidence
@app.route("/api/satellite", methods=["GET"])
def get_satellite():
    observation = get_sentinel1_observation()
    return jsonify(observation)

# 7. AI Fusion Risk
@app.route("/api/risk", methods=["POST"])
def calculate_risk():
    payload = request.get_json(silent=True) or {}
    result = calculate_fusion_risk(payload)
    return jsonify(result)

# 8. Spill Spread Simulation
@app.route("/api/spread", methods=["POST"])
def get_spread():
    payload = request.get_json(silent=True) or {}
    origin = payload.get("origin", { "lat": 9.65, "lng": 76.25 })
    wind = payload.get("wind") or load_json_file("wind.json", {})
    current = payload.get("current") or load_json_file("currents.json", {})

    trajectory = simulate_spill_trajectory(origin, wind, current)
    return jsonify(trajectory)

# 9. Coastal Impact Zones
@app.route("/api/impact", methods=["GET"])
def get_impact():
    impact_data = load_json_file("impact-zones.geojson", {})
    return jsonify(impact_data)

# 10. Start Demo State
@app.route("/api/demo/start", methods=["POST"])
def start_demo():
    return jsonify({
        "status": "DEMO_INITIALIZED",
        "timeline": [
            { "step": 1, "label": "Initial Baseline", "vesselCount": 23 },
            { "step": 2, "label": "Vessel Zone Entry", "vesselCount": 24, "target": "MV Ocean Star" },
            { "step": 3, "label": "Investigation Trigger", "speed": 6.1 },
            { "step": 4, "label": "Authorized Telemetry Anomaly", "pressure": 41.0 },
            { "step": 5, "label": "Ocean Vision AI Detection", "confidence": 0.94 },
            { "step": 6, "label": "Sentinel-1 SAR Evidence", "status": "Corroborated" },
            { "step": 7, "label": "AI Multi-Source Fusion", "sourcesLit": 5 },
            { "step": 8, "label": "Risk Score Progression", "finalScore": 87 },
            { "step": 9, "label": "Spill Trajectory Simulation", "horizon": "+6H" },
            { "step": 10, "label": "Coastal Impact Analysis", "affectedZones": 4 },
            { "step": 11, "label": "Authority Alert Broadcast", "action": "VERIFY -> ASSESS -> RESPOND" },
            { "step": 12, "label": "Incident Assessment Complete", "status": "READY" }
        ]
    })

# 11. Incident History
@app.route("/api/history", methods=["GET"])
def get_history():
    incidents = load_json_file("incidents.json", [])
    return jsonify({
        "total": len(incidents),
        "records": incidents
    })

# Serve root index.html and static assets
@app.route("/")
def serve_index():
    return send_from_directory(ROOT_DIR, "index.html")

@app.route("/<path:path>")
def serve_static(path):
    if os.path.exists(os.path.join(ROOT_DIR, path)):
        return send_from_directory(ROOT_DIR, path)
    return send_from_directory(ROOT_DIR, "index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"==================================================")
    print(f" OilGuard AI Backend Running on http://127.0.0.1:{port}")
    print(f" Serving Kerala Coastal Intelligence API & Frontend")
    print(f"==================================================")
    app.run(host="0.0.0.0", port=port, debug=True)
