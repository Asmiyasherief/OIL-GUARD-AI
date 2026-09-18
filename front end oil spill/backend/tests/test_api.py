"""
OilGuard AI — API Automated Test Suite
Verifies all 10 REST endpoints and calculation integrity.
"""
import sys
import os
import unittest
import json

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from app import app
from services.fusion_service import calculate_fusion_risk
from services.spread_service import simulate_spill_trajectory
from services.vision_service import analyze_image_bytes

class TestOilGuardAPI(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "ONLINE")

    def test_vessels(self):
        res = self.client.get("/api/vessels")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreater(data["count"], 0)
        names = [v["name"] for v in data["vessels"]]
        self.assertIn("MV Ocean Star", names)

    def test_incidents(self):
        res = self.client.get("/api/incidents")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreater(data["count"], 0)

    def test_telemetry(self):
        res = self.client.get("/api/telemetry?vesselId=OG-VESSEL-01")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("observedIncident", data)
        self.assertEqual(data["observedIncident"]["fuelPressurePsi"]["value"], 41.0)

    def test_image_analysis_preset(self):
        res = self.client.post("/api/analyze-image", json={"presetId": "sample_slick"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["analysis"]["confidence"], 0.94)
        self.assertEqual(data["analysis"]["classCode"], "OIL_LIKE_PATTERN")

    def test_satellite(self):
        res = self.client.get("/api/satellite")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["sensor"], "Synthetic Aperture Radar (SAR) C-Band (5.405 GHz)")

    def test_fusion_risk(self):
        payload = {
            "ais": { "inMonitoringZone": True, "abnormalSpeedReduction": True, "headingDeviation": True },
            "telemetry": { "anomalyDetected": True },
            "vision": { "class": "OIL_LIKE_PATTERN", "confidence": 0.94 },
            "satellite": { "sarAnomalyPresent": True },
            "environment": { "proximityToFishingZone": True, "proximityToCoast": True, "proximityToEcologicalReserve": True }
        }
        res = self.client.post("/api/risk", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["prototypeRiskScore"], 87)
        self.assertEqual(data["riskLevel"], "CRITICAL")

    def test_spread_simulation(self):
        payload = {
            "origin": { "lat": 9.65, "lng": 76.25 },
            "wind": { "speedKmh": 18.0, "directionFromDeg": 225 },
            "current": { "speedKnots": 1.2, "directionTowardDeg": 55 }
        }
        res = self.client.post("/api/spread", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(len(data["scenarios"]), 4) # NOW, +1H, +3H, +6H

    def test_impact(self):
        res = self.client.get("/api/impact")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["type"], "FeatureCollection")

    def test_demo_start(self):
        res = self.client.post("/api/demo/start")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(len(data["timeline"]), 12)

if __name__ == "__main__":
    unittest.main()
