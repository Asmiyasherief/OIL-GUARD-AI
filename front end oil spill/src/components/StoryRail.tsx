import type { SimState } from "../types";
import { PHASE_LABEL, PHASE_ORDER } from "../sim/scenario";

export default function StoryRail({ state }: { state: SimState }) {
  return (
    <aside className="rail">
      <h2>Incident story</h2>
      {PHASE_ORDER.map((id) => {
        const on = state.unlocked[id];
        const now = state.phase === id;
        return (
          <div key={id} className={`step ${on ? "on" : ""} ${now ? "now" : ""}`}>
            <div className="dot" />
            <div>
              <div>{PHASE_LABEL[id]}</div>
            </div>
          </div>
        );
      })}
      <p className="disclaimer">
        Prototype decision-support demo. Not an operational ocean forecast or
        confirmed damage assessment.
      </p>
    </aside>
  );
}
