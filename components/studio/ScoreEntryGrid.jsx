"use client";

import { useRef } from "react";
import { replaceInputTextProps, ScoreInput } from "./ScoreInputs";

const preventMetaCopy = (event) => event.preventDefault();
const metaLockProps = {
  onCopy: preventMetaCopy,
  onCut: preventMetaCopy,
  onContextMenu: preventMetaCopy,
};

function ParInput({ idx, localIdx, value, setHole, parRefs }) {
  const handleChange = (next) => {
    if (next === "" || /^[3456]$/.test(next)) {
      setHole(idx, "par", next);
      if (next !== "") {
        setTimeout(() => parRefs?.current[localIdx + 1]?.focus(), 0);
      }
    }
  };

  return (
    <input
      {...metaLockProps}
      {...replaceInputTextProps}
      ref={(el) => { if (parRefs) parRefs.current[localIdx] = el; }}
      aria-label={`홀 ${idx + 1} PAR`}
      value={value ?? ""}
      inputMode="numeric"
      maxLength={1}
      onChange={(e) => handleChange(e.target.value)}
      className="score-meta-lock w-full bg-transparent py-0.5 text-center font-mono text-[12px] font-semibold text-txt-soft outline-none focus:bg-accent/10 focus:text-txt focus:ring-1 focus:ring-inset focus:ring-accent"
    />
  );
}

function HoleNumberInput({ idx, value, setHole, placeholder }) {
  return (
    <input
      {...metaLockProps}
      {...replaceInputTextProps}
      aria-label={`${idx + 1}번째 홀 번호`}
      value={value ?? ""}
      onChange={(e) => setHole(idx, "hole", e.target.value)}
      placeholder={placeholder}
      className="score-meta-lock w-full bg-transparent py-0.5 text-center font-mono text-[10px] font-semibold text-txt-soft outline-none placeholder:text-txt-faint focus:bg-accent/10 focus:text-txt"
    />
  );
}

export default function ScoreEntryGrid({
  holes,
  offset = 0,
  setHole,
  scoreRefs,
  onScoreKey,
  scoreMode,
  showSum = true,
  showHoleNumbers = true,
  editableHoleNumbers = false,
  parLocked = false,
}) {
  const parRefs = useRef([]);
  const visibleHoles = holes || [];
  const parSum = visibleHoles.reduce((a, h) => a + (Number(h.par) || 0), 0);
  const scoreSum = visibleHoles.reduce((a, h) => a + (Number(h.score) || 0), 0);
  const hasScore = visibleHoles.some((h) => h.score !== "" && h.score != null);
  const template = `repeat(${Math.max(visibleHoles.length, 1)}, minmax(0,1fr))${showSum ? " 34px" : ""}`;

  return (
    <div className="mb-2 overflow-hidden rounded-lg border border-line last:mb-0">
      <div className="grid" style={{ gridTemplateColumns: template }}>
        {showHoleNumbers && visibleHoles.map((h, i) => {
          const idx = offset + i;
          return editableHoleNumbers ? (
            <div key={"n" + i} className="border-l border-line bg-panel first:border-l-0">
              <HoleNumberInput idx={idx} value={h.hole} setHole={setHole} placeholder={String(idx + 1)} />
            </div>
          ) : (
            <div key={"n" + i} {...metaLockProps} className="score-meta-lock flex items-center justify-center border-l border-line bg-panel py-0.5 font-mono text-[10px] font-semibold text-txt-soft first:border-l-0">
              {h.hole || idx + 1}
            </div>
          );
        })}
        {showHoleNumbers && showSum && (
          <div {...metaLockProps} className="score-meta-lock flex items-center justify-center border-l border-line bg-panel py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-txt-faint">
            합
          </div>
        )}

        {visibleHoles.map((h, i) => {
          const idx = offset + i;
          return (
            <div key={"p" + i} className={(showHoleNumbers ? "border-t " : "") + "border-l border-line bg-panel-2 first:border-l-0"}>
              {parLocked ? (
                <div className="score-meta-lock flex items-center justify-center py-0.5 font-mono text-[12px] font-semibold text-txt-soft">
                  {h.par || "–"}
                </div>
              ) : (
                <ParInput idx={idx} localIdx={i} value={h.par} setHole={setHole} parRefs={parRefs} />
              )}
            </div>
          );
        })}
        {showSum && (
          <div {...metaLockProps} className={(showHoleNumbers ? "border-t " : "") + "score-meta-lock flex items-center justify-center border-l border-line bg-panel-2 py-0.5 font-mono text-[12px] font-bold text-txt"}>
            {parSum || "–"}
          </div>
        )}

        {visibleHoles.map((h, i) => {
          const idx = offset + i;
          return (
            <div key={"s" + i} className="border-l border-t border-line first:border-l-0">
              <ScoreInput
                idx={idx}
                par={h.par}
                score={h.score}
                mode={scoreMode}
                setHole={setHole}
                scoreRefs={scoreRefs}
                onScoreKey={onScoreKey}
              />
            </div>
          );
        })}
        {showSum && (
          <div className="flex items-center justify-center border-l border-t border-line font-mono text-sm font-bold text-txt">
            {hasScore ? scoreSum : "–"}
          </div>
        )}
      </div>
    </div>
  );
}
