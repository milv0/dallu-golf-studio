"use client";

import { replaceInputTextProps, ScoreInput } from "./ScoreInputs";
import useGridNav from "../../lib/useGridNav";
import { validatePar } from "../../lib/inputValidators";
import { hasNumericValue } from "../../lib/score";
import { useLang } from "../../lib/i18n";

const preventMetaCopy = (event) => event.preventDefault();
const metaLockProps = {
  onCopy: preventMetaCopy,
  onCut: preventMetaCopy,
  onContextMenu: preventMetaCopy,
};

function ParInput({ idx, localIdx, value, setHole, parRefs, nav }) {
  const { t } = useLang();
  const handleChange = (e) => {
    const next = e.target.value.slice(-1);
    if (next === "") {
      setHole(idx, "par", "");
      return;
    }
    if (validatePar(next)) {
      setHole(idx, "par", next);
      setTimeout(() => parRefs?.current[localIdx + 1]?.focus(), 0);
    }
  };

  return (
    <input
      {...metaLockProps}
      {...replaceInputTextProps}
      ref={nav.inputRef}
      aria-label={t("a11y.holePar", { n: idx + 1 })}
      value={value ?? ""}
      placeholder="–"
      inputMode="numeric"
      onChange={handleChange}
      onKeyDown={nav.onKeyDown}
      className="score-meta-lock w-full bg-transparent py-0.5 text-center font-mono text-[12px] font-semibold text-txt-soft outline-none placeholder:text-txt-faint focus:bg-accent/10 focus:text-txt focus:ring-1 focus:ring-inset focus:ring-accent"
    />
  );
}

function HoleNumberInput({ idx, value, setHole, placeholder }) {
  const { t } = useLang();
  return (
    <input
      {...metaLockProps}
      {...replaceInputTextProps}
      aria-label={t("a11y.holeNumber", { n: idx + 1 })}
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
  const { t } = useLang();
  // PAR 행은 좌우/Enter/Tab 이동을 useGridNav에 위임하고, ↓만 스코어 행으로 넘긴다.
  const { refs: parRefs, navProps: parNavProps } = useGridNav({
    onDown: (i) => scoreRefs?.current[offset + i]?.focus(),
  });
  const visibleHoles = holes || [];
  const parSum = visibleHoles.reduce((a, h) => a + (Number(h.par) || 0), 0);
  const scoreSum = visibleHoles.reduce((a, h) => a + (Number(h.score) || 0), 0);
  const hasScore = visibleHoles.some((hole) => hasNumericValue(hole.score));
  const template = `repeat(${Math.max(visibleHoles.length, 1)}, minmax(24px,1fr))${showSum ? " 34px" : ""}`;

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
            {t("label.sum")}
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
                <ParInput idx={idx} localIdx={i} value={h.par} setHole={setHole} parRefs={parRefs} nav={parNavProps(i)} />
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
                localIdx={i}
                par={h.par}
                score={h.score}
                mode={scoreMode}
                setHole={setHole}
                scoreRefs={scoreRefs}
                parRefs={parLocked ? null : parRefs}
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
