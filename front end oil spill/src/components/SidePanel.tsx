import type { ReactNode } from "react";
import type { SimState } from "../types";

function Card({
  title,
  locked,
  children,
  danger,
}: {
  title: string;
  locked?: boolean;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <section className={`card ${locked ? "locked" : ""} ${danger ? "alert-card" : ""}`}>
      <h3>{title}</h3>
      {locked ? <p className="disclaimer">Waiting for earlier evidence…</p> : children}
    </section>
  );
}

function Meter({
  value,
  max,
  hot,
}: {
  value: number;
  max: number;
  hot?: boolean;
}) {
  return (
    <div className={`meter ${hot ? "hot" : ""}`}>
      <div style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );
}

export default function SidePanel({ state }: { state: SimState }) {
  const v = state.focusVessel;
  const tel = state.telemetry;

  return (
    <aside className="side">
      <Card title="Vessel watch">
        <div className="kv">
          <span>Vessel</span>
          <span>{v.name}</span>
          <span>Type</span>
          <span>{v.type}</span>
          <span>IMO</span>
          <span>{v.imo}</span>
          <span>Position</span>
          <span>
            {v.position.lat.toFixed(3)}, {v.position.lng.toFixed(3)}
          </span>
          <span>Speed</span>
          <span>{v.speedKn.toFixed(1)} kn</span>
          <span>Status</span>
          <span>
            <span
              className={`badge ${
                v.status === "Incident Vessel"
                  ? "danger"
                  : v.status === "Enhanced Monitoring"
                    ? "warn"
                    : "ok"
              }`}
            >
              {v.status}
            </span>
          </span>
          <span>Zone</span>
          <span>{v.inZone ? "Inside monitoring zone" : "Outside zone"}</span>
        </div>
      </Card>

      <Card title="Ship telemetry" locked={!state.unlocked.telemetry}>
        <div className="kv">
          <span>Fuel level</span>
          <span>{tel.fuelPct.toFixed(1)}%</span>
        </div>
        <Meter value={tel.fuelPct} max={100} hot={tel.fuelDropRate > 0.35} />
        <div className="kv" style={{ marginTop: 10 }}>
          <span>Fuel flow</span>
          <span>{tel.fuelFlowTph.toFixed(1)} t/h</span>
          <span>Pressure</span>
          <span>{tel.pressureBar.toFixed(2)} bar</span>
          <span>Temperature</span>
          <span>{tel.tempC.toFixed(1)} °C</span>
        </div>
        {state.anomaly.possibleLeak && (
          <>
            <p style={{ color: "var(--danger)", fontWeight: 700, marginBottom: 0 }}>
              POSSIBLE LEAK
            </p>
            <ul className="reasons">
              {state.anomaly.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Card title="Satellite evidence" locked={!state.unlocked.satellite}>
        <div className="kv">
          <span>Source</span>
          <span>Sentinel-1 SAR</span>
          <span>Finding</span>
          <span>Possible oil-like anomaly</span>
          <span>Location</span>
          <span>
            {state.sar.center.lat.toFixed(2)}, {state.sar.center.lng.toFixed(2)}
          </span>
        </div>
      </Card>

      <Card title="AI fusion" locked={!state.unlocked.fusion}>
        <div className="kv">
          <span>Telemetry</span>
          <span>{state.fusion.telemetryScore}</span>
          <span>Satellite</span>
          <span>{state.fusion.satelliteScore}</span>
          <span>Vessel association</span>
          <span>{state.fusion.associationScore}</span>
          <span>Prototype risk</span>
          <span>
            {state.fusion.riskScore} · {state.fusion.riskLevel}
          </span>
        </div>
        <Meter value={state.fusion.riskScore} max={100} hot={state.fusion.riskLevel === "HIGH"} />
      </Card>

      <Card title="Drift forcing" locked={!state.unlocked.forecast}>
        <div className="kv">
          <span>Wind</span>
          <span>
            {state.weather.windKn} kn from {state.weather.windFromDeg}°
          </span>
          <span>Current</span>
          <span>
            {state.weather.currentKn} kn toward {state.weather.currentTowardDeg}°
          </span>
        </div>
        <p className="disclaimer">
          Prototype spread from wind (≈3%) plus current. Not an operational forecast.
        </p>
      </Card>

      <Card title="Potentially affected" locked={!state.unlocked.impact}>
        {state.areas.filter((a) => a.potentiallyAffected).length === 0 ? (
          <p className="disclaimer">No overlap with predicted +6 hour envelope yet.</p>
        ) : (
          <ul className="reasons" style={{ color: "var(--text)" }}>
            {state.areas
              .filter((a) => a.potentiallyAffected)
              .map((a) => (
                <li key={a.id}>Potentially affected {a.name}</li>
              ))}
          </ul>
        )}
      </Card>

      <Card title="Marine alert" locked={!state.unlocked.alert} danger={!!state.alert}>
        {state.alert && (
          <div className="kv">
            <span>Incident</span>
            <span>{state.alert.title}</span>
            <span>Vessel</span>
            <span>{state.alert.vessel}</span>
            <span>Type</span>
            <span>{state.alert.incident}</span>
            <span>Risk</span>
            <span className="badge danger">{state.alert.risk}</span>
            <span>Location</span>
            <span>
              {state.alert.location.lat.toFixed(2)}, {state.alert.location.lng.toFixed(2)}
            </span>
            <span>Potentially affected</span>
            <span>{state.alert.affected.join("; ")}</span>
            <span>Response priority</span>
            <span className="badge danger">{state.alert.responsePriority}</span>
          </div>
        )}
      </Card>

      <Card title="Why this is high risk" locked={!state.unlocked.alert}>
        <ul className="reasons" style={{ color: "var(--text)" }}>
          {state.why.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Card>

      <Card title="Response priority" locked={!state.unlocked.response}>
        <p>
          <span className="badge danger">HIGH</span>
        </p>
        <div className="steps">
          <ol>
            {state.responseSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </Card>
    </aside>
  );
}
