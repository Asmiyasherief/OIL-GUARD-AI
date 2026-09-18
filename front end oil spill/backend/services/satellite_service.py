"""
OilGuard AI — Sentinel-1 SAR Satellite Evidence Service
Provides supporting remote-sensing radar evidence for maritime oil-spill verification.

DISCLAIMER:
Satellite observation is not continuous live monitoring. It is used as a supporting
verification source when an observation is available.
"""

def get_sentinel1_observation():
    """
    Returns latest available Sentinel-1 SAR observation metadata and footprint.
    """
    return {
        "satellite": "Copernicus Sentinel-1B",
        "sensor": "Synthetic Aperture Radar (SAR) C-Band (5.405 GHz)",
        "acquisitionMode": "Interferometric Wide Swath (IW)",
        "polarization": "VV + VH dual-polarization",
        "resolution": "10m spatial resolution",
        "orbitPass": "Descending (Track 063)",
        "observationTimestamp": "2026-09-18T08:42:15Z (Simulated latest pass)",
        "observationStatus": "Supporting Evidence Available",
        "evidenceType": "Dark-patch sea surface backscatter attenuation",
        "confidence": "Supporting / Corroborating",
        "coverage": "Kerala Coastal Sector (Kochi Anchorage to Alappuzha)",
        "footprint": {
            "type": "Polygon",
            "coordinates": [
                [
                    [75.60, 9.40],
                    [76.40, 9.40],
                    [76.40, 10.10],
                    [75.60, 10.10],
                    [75.60, 9.40]
                ]
            ]
        },
        "detectedAnomaly": {
            "type": "Polygon",
            "coordinates": [
                [
                    [76.22, 9.63],
                    [76.27, 9.64],
                    [76.29, 9.67],
                    [76.24, 9.68],
                    [76.21, 9.65],
                    [76.22, 9.63]
                ]
            ],
            "areaSqKm": 8.4,
            "meanBackscatterDampingDb": -5.8,
            "interpretation": "Localized capillary wave suppression causing reduced radar backscatter (-5.8 dB vs ambient sea clutter). Consistent with thin surface hydrocarbon film or biogenic slick."
        },
        "disclaimer": "Satellite observation is not continuous live monitoring. It is used as a supporting verification source when an observation is available."
    }
