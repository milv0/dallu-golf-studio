"use client";

import { ScoreInput } from "./ScoreInputs";

const preventMetaCopy = (event) => event.preventDefault();
const metaLockProps = {
  onCopy: preventMetaCopy,
  onCut: preventMetaCopy,
  onContextMenu: preventMetaCopy,
};

export default function HoleGroup({ holes, offset, setHole, scoreRefs, onScoreKey, scoreMode }) {
  const isBack = offset === 9;
  const parSum = holes.reduce((a, h) => a + (Number(h.par) || 0), 0);
  const scoreSum = holes.reduce((a, h) => a + (Number(h.score) || 0), 0);
  const hasScore = holes.some((h) => h.score !== "" && h.score != null);
  return (
    <div className="mb-3 overflow-hidden rounded-lg border border-line last:mb-0">
      <div className="grid" style={{ gridTemplateColumns: "46px repeat(9, minmax(0,1fr)) 50px" }}>
        <div {...metaLockProps} className="score-meta-lock flex items-center justify-center bg-panel py-1.5 font-head text-[10px] font-bold uppercase tracking-wider text-accent">
          {isBack ? "IN" : "OUT"}
        </div>
        {holes.map((h, i) => (
          <div key={"n" + i} {...metaLockProps} className="score-meta-lock flex items-center justify-center border-l border-line bg-panel py-1.5 font-mono text-[11px] font-semibold text-txt-soft">
            {offset + i + 1}
          </div>
        ))}
        <div {...metaLockProps} className="score-meta-lock flex items-center justify-center border-l border-line bg-panel py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-txt-faint">
          합
        </div>

        <div {...metaLockProps} className="score-meta-lock flex items-center justify-center border-t border-line bg-panel-2 py-1 font-mono text-[10px] uppercase tracking-wider text-txt-faint">
          PAR
        </div>
        {holes.map((h, i) => (
          <div key={"p" + i} {...metaLockProps} className="score-meta-lock flex items-center justify-center border-l border-t border-line bg-panel-2 py-1 font-mono text-sm font-semibold text-txt-soft">
            {h.par || "–"}
          </div>
        ))}
        <div {...metaLockProps} className="score-meta-lock flex items-center justify-center border-l border-t border-line bg-panel-2 py-1 font-mono text-sm font-bold text-txt">
          {parSum || "–"}
        </div>

        <div className="flex items-center justify-center border-t border-line py-1 font-mono text-[10px] uppercase tracking-wider text-txt-faint">
          {scoreMode === "relative" ? "파대비" : "타수"}
        </div>
        {holes.map((h, i) => {
          const idx = offset + i;
          return (
            <div key={"s" + i} className="border-l border-t border-line">
              <ScoreInput idx={idx} par={h.par} score={h.score} mode={scoreMode}
                setHole={setHole} scoreRefs={scoreRefs} onScoreKey={onScoreKey} />
            </div>
          );
        })}
        <div className="flex items-center justify-center border-l border-t border-line font-mono text-base font-bold text-txt">
          {hasScore ? scoreSum : "–"}
        </div>
      </div>
    </div>
  );
}
