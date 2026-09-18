"""
OilGuard AI — Multi-Source Decision-Support AI Fusion Service
Combines heterogeneous maritime evidence into an explainable prototype risk assessment.

Point Distribution (Max 100):
- AIS / Vessel Behavior Anomaly: 15 pts
- Authorized Telemetry Anomaly: 20 pts
- Ocean Image Pattern (Vision AI): 30 pts
- Sentinel-1 SAR Satellite Observation: 20 pts
- Environmental Sensitivity / Proximity: 15 pts
"""

def calculate_fusion_risk(data):
    """
    Computes transparent risk score and evidence explanations.
    """
    ais_input = data.get("ais", {})
    telemetry_input = data.get("telemetry", {})
    vision_input = data.get("vision", {})
    satellite_input = data.get("satellite", {})
    environment_input = data.get("environment", {})

    breakdown = []
    total_score = 0

    # 1. AIS / Vessel Anomaly (Max 15 pts)
    ais_points = 0
    ais_reasons = []
    if ais_input.get("inMonitoringZone", True):
        ais_points += 5
        ais_reasons.append("Vessel entered designated Kerala Coastal Monitoring Zone")
    if ais_input.get("abnormalSpeedReduction", True):
        ais_points += 6
        ais_reasons.append("Sudden course deceleration observed (12.0 kn -> 6.1 kn)")
    if ais_input.get("headingDeviation", True):
        ais_points += 4
        ais_reasons.append("Irregular heading oscillation outside standard navigation fairway")
    ais_points = min(15, ais_points)
    total_score += ais_points
    breakdown.append({
        "source": "AIS / VTS Trajectory",
        "weight": 15,
        "score": ais_points,
        "status": "CONFIRMED" if ais_points >= 10 else "NORMAL",
        "findings": ais_reasons
    })

    # 2. Telemetry Anomaly (Max 20 pts)
    tel_points = 0
    tel_reasons = []
    if telemetry_input.get("anomalyDetected", True):
        tel_points = 20
        tel_reasons.append("Fuel manifold pressure dropped to 41 PSI (Normal baseline: 72 PSI, -43%)")
        tel_reasons.append("Fuel flow abnormal surge (+17.8 t/h over operational baseline)")
        tel_reasons.append("Rapid tank depletion rate: 0.86%/hr indicates possible line breach")
    total_score += tel_points
    breakdown.append({
        "source": "Authorized Telemetry",
        "weight": 20,
        "score": tel_points,
        "status": "ANOMALY DETECTED" if tel_points > 0 else "NORMAL",
        "findings": tel_reasons if tel_reasons else ["Telemetry within normal operational tolerances"]
    })

    # 3. Ocean Image Evidence (Max 30 pts)
    vis_points = 0
    vis_reasons = []
    confidence = vision_input.get("confidence", 0.94)
    detected_class = vision_input.get("class", "OIL_LIKE_PATTERN")
    if detected_class == "OIL_LIKE_PATTERN":
        vis_points = round(30 * confidence)
        vis_reasons.append(f"Computer vision model detected oil-like surface pattern (confidence: {int(confidence * 100)}%)")
        vis_reasons.append("High surface damping and visual dampening consistent with hydrocarbon slick")
    elif detected_class == "SURFACE_SHEEN":
        vis_points = round(20 * confidence)
        vis_reasons.append(f"Optical interference sheen detected (confidence: {int(confidence * 100)}%)")
    else:
        vis_reasons.append("No definitive hydrocarbon surface signatures identified")
    total_score += vis_points
    breakdown.append({
        "source": "Ocean Vision AI",
        "weight": 30,
        "score": vis_points,
        "status": "CONFIRMED" if vis_points >= 20 else "INCONCLUSIVE",
        "findings": vis_reasons
    })

    # 4. Satellite Supporting Evidence (Max 20 pts)
    sat_points = 0
    sat_reasons = []
    if satellite_input.get("sarAnomalyPresent", True):
        # Supporting satellite pass contributes 12 points out of 20 (not live monitoring)
        sat_points = 12
        sat_reasons.append("Sentinel-1 SAR C-band radar reveals localized backscatter depression")
        sat_reasons.append("Roughness attenuation corresponds geometrically with vessel track")
    else:
        sat_reasons.append("No significant radar backscatter depression in latest pass")
    total_score += sat_points
    breakdown.append({
        "source": "Sentinel-1 SAR Satellite",
        "weight": 20,
        "score": sat_points,
        "status": "SUPPORTING OBSERVATION" if sat_points > 0 else "NO EVIDENCE",
        "findings": sat_reasons
    })

    # 5. Environmental Sensitivity / Proximity (Max 15 pts)
    env_points = 0
    env_reasons = []
    if environment_input.get("proximityToFishingZone", True):
        env_points += 5
        env_reasons.append("Within 3.8 km of Inshore Artisanal Fishing Grounds")
    if environment_input.get("proximityToCoast", True):
        env_points += 4
        env_reasons.append("Within 7.2 km of Chellanam coastal residential shoreline")
    if environment_input.get("proximityToEcologicalReserve", True):
        env_points += 3
        env_reasons.append("Proximity to Vembanad Ramsar wetland buffer zone")
    env_points = min(15, env_points)
    total_score += env_points
    breakdown.append({
        "source": "Environmental Sensitivity",
        "weight": 15,
        "score": env_points,
        "status": "CRITICAL PROXIMITY",
        "findings": env_reasons
    })

    # Risk level classification
    if total_score >= 80:
        risk_level = "CRITICAL"
        status_label = "HIGH RISK / VERIFICATION REQUIRED"
    elif total_score >= 60:
        risk_level = "HIGH"
        status_label = "HIGH RISK / INVESTIGATION REQUIRED"
    elif total_score >= 30:
        risk_level = "MEDIUM"
        status_label = "MODERATE RISK / ENHANCED MONITORING"
    else:
        risk_level = "LOW"
        status_label = "LOW RISK / NORMAL TRACKING"

    return {
        "prototypeRiskScore": total_score,
        "maxPossible": 100,
        "riskLevel": risk_level,
        "statusLabel": status_label,
        "assessment": "POSSIBLE OIL SPILL",
        "verificationRequired": True,
        "breakdown": breakdown,
        "whyAlert": [
            "Vessel located inside active Kerala coastal monitoring zone",
            "Authorized telemetry revealed critical fuel pressure drop & flow surge",
            "Ocean Vision AI detected oil-like surface pattern with 94% confidence",
            "Sentinel-1 SAR C-band radar observation corroborated dark-patch backscatter anomaly",
            "Drift vector projects possible movement toward inshore artisanal fishing grounds and coastal settlements"
        ],
        "disclaimer": "OilGuard AI is a decision-support prototype. Risk scores are advisory and require human/authority verification."
    }
