"use client";

import { useRef, useState } from "react";
import { RelativeScoreHint, ScoreModeToggle } from "./ScoreInputs";
import { Field } from "./StudioFields";
import PanelHeader, { ResetButton } from "./PanelHeader";
import ScoreEntryGrid from "./ScoreEntryGrid";

function useScoreRefs() {
  const scoreRefs = useRef([]);
  const handleScoreKey = (e, idx) => {
    if (e.key === "Enter") {
      e.preventDefault();
      scoreRefs.current[idx + 1]?.focus();
    }
  };
  return { scoreRefs, handleScoreKey };
}

export function ThreeHoleForm({ data, setField, setHole, onReset }) {
  const { scoreRefs, handleScoreKey } = useScoreRefs();
  const [scoreMode, setScoreMode] = useState("strokes");

  return (
    <div className="rounded-xl border border-line bg-panel p-3 md:p-4">
      <PanelHeader title="3홀 입력">
        <ScoreModeToggle value={scoreMode} onChange={setScoreMode} />
        {onReset ? <ResetButton onClick={onReset} /> : null}
      </PanelHeader>
      <label className="mb-2 flex items-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-sm font-semibold text-txt-soft">
        <input type="checkbox" checked={data.showHoleNumbers !== false}
          onChange={(e) => setField("showHoleNumbers", e.target.checked)}
          className="h-4 w-4 accent-[var(--color-accent)]" />
        홀 번호 표시
      </label>

      <ScoreEntryGrid
        holes={data.holes}
        setHole={setHole}
        scoreRefs={scoreRefs}
        onScoreKey={handleScoreKey}
        scoreMode={scoreMode}
        showSum={false}
        showHoleNumbers={data.showHoleNumbers !== false}
        editableHoleNumbers
      />
      {scoreMode === "relative" && <RelativeScoreHint className="mt-2" />}

      <div className="mt-2">
        <Field label="TO PAR 직접입력" value={data.toPar} onChange={(v) => setField("toPar", v)} placeholder="자동 계산" />
      </div>
    </div>
  );
}

function InlinePlayerControl({ value, onChange }) {
  return (
    <label className="flex min-w-[160px] items-center gap-2 rounded-lg border border-line bg-panel-2 px-2 py-1">
      <span className="font-head text-[10px] font-semibold uppercase tracking-widest text-txt-faint">
        이름
      </span>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="PLAYER"
        className="min-w-0 flex-1 bg-transparent text-right font-head text-sm font-bold uppercase text-txt outline-none placeholder:text-txt-faint"
      />
    </label>
  );
}

export function LinkedThreeHolePanel({ round, selected, showHoleNumbers, onSelect, onShowHoleNumbers }) {
  const selectedStart = Array.isArray(selected) && selected.length === 3 ? Math.min(...selected) : 0;
  const groupLabel = (start) => {
    const a = start + 1;
    const b = start + 2;
    const c = start + 3;
    return c <= 9 ? `${a}${b}${c}` : `${a}-${c}`;
  };
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
            3홀 선택
          </div>
          <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[11px] font-bold text-accent">
            {groupLabel(selectedStart)}
          </span>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-txt-soft">
          <input type="checkbox" checked={showHoleNumbers}
            onChange={(e) => onShowHoleNumbers(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]" />
          홀 번호 표시
        </label>
      </div>
      <div className="grid grid-cols-9 gap-1">
        {round.holes.map((h, i) => {
          const start = Math.min(i, Math.max(round.holes.length - 3, 0));
          const active = Array.isArray(selected) && selected.includes(i);
          const has = h.score !== "" && h.score != null;
          return (
            <button key={i} type="button" onClick={() => onSelect(start)}
              title={`${start + 1}-${start + 3}번 홀 묶음 선택`}
              className={"rounded-md py-1.5 text-center font-mono text-[13px] font-bold transition " +
                (active
                  ? "bg-accent text-[#06210f]"
                  : has
                  ? "border border-accent/40 bg-panel-2 text-accent hover:border-accent"
                  : "border border-line bg-panel-2 text-txt-faint hover:text-txt")}>
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-2 text-[11px] text-txt-faint">
        시작 홀을 누르면 연속된 3홀이 선택됩니다. 예: 2번 선택 → 234.
      </div>
    </div>
  );
}

export function ManualNineForm({ data, setField, setHole, onReset }) {
  const { scoreRefs, handleScoreKey } = useScoreRefs();
  const [scoreMode, setScoreMode] = useState("strokes");

  return (
    <div className="rounded-xl border border-line bg-panel p-3 md:p-4">
      <PanelHeader title="9홀 입력">
        <InlinePlayerControl value={data.player} onChange={(v) => setField("player", v)} />
        <ScoreModeToggle value={scoreMode} onChange={setScoreMode} />
        {onReset ? <ResetButton onClick={onReset} /> : null}
      </PanelHeader>
      <ScoreEntryGrid
        holes={data.holes}
        setHole={setHole}
        scoreRefs={scoreRefs}
        onScoreKey={handleScoreKey}
        scoreMode={scoreMode}
        showSum
        editableHoleNumbers
      />
      {scoreMode === "relative" && <RelativeScoreHint className="mt-2" />}
    </div>
  );
}
