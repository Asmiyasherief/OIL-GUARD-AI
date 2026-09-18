import { useEffect, useMemo, useState } from "react";
import MapView from "./components/MapView";
import SidePanel from "./components/SidePanel";
import StoryRail from "./components/StoryRail";
import { computeState } from "./sim/engine";

export default function App() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const state = useMemo(() => computeState(t), [t]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setT((prev) => {
        const next = prev + 0.0045;
        if (next >= 1) {
          setPlaying(false);
          return 1;
        }
        return next;
      });
    }, 80);
    return () => window.clearInterval(id);
  }, [playing]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo">OG</div>
          <div>
            <h1>OilGuard AI</h1>
            <p>Kerala coast watch · detection, evidence, predicted impact</p>
          </div>
        </div>
        <div className="live-pill">
          <span />
          LIVE DEMO
        </div>
        <div className="controls">
          <button type="button" onClick={() => setPlaying((p) => !p)}>
            {playing ? "Pause" : "Play"}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={t}
            onChange={(e) => {
              setPlaying(false);
              setT(Number(e.target.value));
            }}
          />
          <button
            type="button"
            className="jump"
            onClick={() => {
              setPlaying(false);
              setT(1);
            }}
          >
            Jump to alert
          </button>
          <button
            type="button"
            onClick={() => {
              setT(0);
              setPlaying(true);
            }}
          >
            Restart
          </button>
          <span className="mono" style={{ color: "var(--muted)", fontSize: 12 }}>
            {Math.round(t * 100)}% · {state.phase}
          </span>
        </div>
      </header>
      <div className="workspace">
        <StoryRail state={state} />
        <div className="map-wrap">
          <MapView state={state} />
          <div className="map-overlay">
            {state.spillLocation && (
              <div className="card">
                <h3>Possible spill location</h3>
                <div className="mono">
                  📍 {state.spillLocation.lat.toFixed(2)}, {state.spillLocation.lng.toFixed(2)}
                </div>
              </div>
            )}
            <div className="card legend">
              <div>
                <span className="swatch" style={{ background: "#2ee6c7" }} />
                Monitoring zone
              </div>
              <div>
                <span className="swatch" style={{ background: "#9be7ff" }} />
                Sentinel-1 SAR anomaly
              </div>
              <div>
                <span className="swatch" style={{ background: "#ff5d6c" }} />
                Predicted spread NOW → +6h
              </div>
              <div>
                <span className="swatch" style={{ background: "#5ee2a0" }} />
                Fishing / coastal / port / ecology
              </div>
            </div>
          </div>
        </div>
        <SidePanel state={state} />
      </div>
    </div>
  );
}
