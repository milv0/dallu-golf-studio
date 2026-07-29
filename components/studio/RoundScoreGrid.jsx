"use client";

import { ScoreInput } from "./ScoreInputs";

const preventMetaCopy = (event) => event.preventDefault();
const metaLockProps = {
  onCopy: preventMetaCopy,
  onCut: preventMetaCopy,
  onContextMenu: preventMetaCopy,
};

function ParInput({ idx, value, setHole }) {
  const handleChange = (next) => {
    if (next === "" || /^[345]$/.test(next)) setHole(idx, "par", next);
  };

  return (
    <input
      {...metaLockProps}
      aria-label={`홀 ${idx + 1} PAR`}
      value={value ?? ""}
      inputMode="numeric"
      maxLength={1}
      onChange={(e) => handleChange(e.target.value)}
      className="score-meta-lock w-full bg-transparent py-0.5 text-center font-mono text-[12px] font-semibold text-txt-soft outline-none focus:bg-accent/10 focus:text-txt focus:ring-1 focus:ring-inset focus:ring-accent"
    />
  );
}

export default function HoleGroup({ holes, offset, setHole, scoreRefs, onScoreKey, scoreMode }) {
  const parSum = holes.reduce((a, h) => a + (Number(h.par) || 0), 0);
  const scoreSum = holes.reduce((a, h) => a + (Number(h.score) || 0), 0);
  const hasScore = holes.some((h) => h.score !== "" && h.score != null);
  return (
    <div className="mb-2 overflow-hidden rounded-lg border border-line last:mb-0">
      <div className="grid" style={{ gridTemplateColumns: "repeat(9, minmax(0,1fr)) 34px" }}>
        {holes.map((h, i) => (
          <div key={"n" + i} {...metaLockProps} className="score-meta-lock flex items-center justify-center border-l border-line first:border-l-0 bg-panel py-0.5 font-mono text-[10px] font-semibold text-txt-soft">
            {offset + i + 1}
          </div>
        ))}
        <div {...metaLockProps} className="score-meta-lock flex items-center justify-center border-l border-line bg-panel py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-txt-faint">
          합
        </div>

        {holes.map((h, i) => (
          <div key={"p" + i} className="border-l border-t border-line bg-panel-2 first:border-l-0">
            <ParInput idx={offset + i} value={h.par} setHole={setHole} />
          </div>
        ))}
        <div {...metaLockProps} className="score-meta-lock flex items-center justify-center border-l border-t border-line bg-panel-2 py-0.5 font-mono text-[12px] font-bold text-txt">
          {parSum || "–"}
        </div>

        {holes.map((h, i) => {
          const idx = offset + i;
          return (
            <div key={"s" + i} className="border-l border-t border-line first:border-l-0">
              <ScoreInput idx={idx} par={h.par} score={h.score} mode={scoreMode}
                setHole={setHole} scoreRefs={scoreRefs} onScoreKey={onScoreKey} />
            </div>
          );
        })}
        <div className="flex items-center justify-center border-l border-t border-line font-mono text-sm font-bold text-txt">
          {hasScore ? scoreSum : "–"}
        </div>
      </div>
    </div>
  );
}
