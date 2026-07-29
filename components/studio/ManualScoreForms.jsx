"use client";

import { useRef } from "react";
import { RelativeScoreHint, RelativeScoreInput, manualScoreClass } from "./ScoreInputs";
import { Field } from "./StudioFields";

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

export function ThreeHoleForm({ data, setField, setHole }) {
  const { scoreRefs, handleScoreKey } = useScoreRefs();

  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="mb-3 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
        3홀 카드 수동 입력
      </div>
      <label className="mb-3 flex items-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm font-semibold text-txt-soft">
        <input type="checkbox" checked={data.showHoleNumbers !== false}
          onChange={(e) => setField("showHoleNumbers", e.target.checked)}
          className="h-4 w-4 accent-[var(--color-accent)]" />
        홀 번호 표시
      </label>

      <div className="overflow-hidden rounded-lg border border-line">
        <div className="grid grid-cols-[54px_repeat(3,minmax(0,1fr))] border-b border-line bg-panel-2 text-center font-head text-[11px] font-semibold uppercase tracking-widest text-txt-faint">
          <div className="py-2">입력</div>
          {[1, 2, 3].map((n) => <div key={n} className="border-l border-line py-2">Hole {n}</div>)}
        </div>
        {[
          ["hole", "홀", "1"],
          ["par", "PAR", "4"],
          ["score", "파대비", "0"],
        ].map(([key, label, placeholder]) => (
          <div key={key} className="grid grid-cols-[54px_repeat(3,minmax(0,1fr))] border-b border-line last:border-b-0">
            <div className="flex items-center justify-center bg-panel-2 font-head text-[11px] font-semibold uppercase tracking-widest text-txt-faint">
              {label}
            </div>
            {data.holes.map((hole, i) => (
              key === "score" ? (
                <RelativeScoreInput key={i}
                  idx={i}
                  par={hole.par}
                  score={hole.score}
                  onScore={(value) => setHole(i, "score", value)}
                  scoreRefs={scoreRefs}
                  onScoreKey={handleScoreKey}
                  ariaLabel={`3홀 직접입력 ${i + 1}번째 홀 파대비`} />
              ) : (
                <input key={i} value={hole[key] || ""} onChange={(e) => setHole(i, key, e.target.value)}
                  placeholder={placeholder}
                  inputMode={key === "hole" ? "text" : "numeric"}
                  className="border-l border-line bg-transparent px-2 py-2.5 text-center font-mono text-sm font-bold text-txt outline-none placeholder:text-txt-faint focus:bg-accent/10 focus:ring-1 focus:ring-inset focus:ring-accent" />
              )
            ))}
          </div>
        ))}
      </div>
      <RelativeScoreHint className="mt-2" />

      <div className="mt-3">
        <Field label="TO PAR 직접입력" value={data.toPar} onChange={(v) => setField("toPar", v)} placeholder="자동 계산" />
      </div>
    </div>
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

export function ManualNineForm({ data, setHole }) {
  const { scoreRefs, handleScoreKey } = useScoreRefs();

  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="mb-3 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
        9홀 직접 입력
      </div>
      <div className="overflow-x-auto rounded-lg border border-line">
        <div className="grid min-w-[520px] sm:min-w-0" style={{ gridTemplateColumns: "54px repeat(9, minmax(0,1fr))" }}>
          <div className="flex items-center justify-center bg-panel-2 py-2 font-head text-[11px] font-semibold uppercase tracking-widest text-txt-faint">
            홀
          </div>
          {data.holes.map((hole, i) => (
            <input key={i} value={hole.hole || ""} onChange={(e) => setHole(i, "hole", e.target.value)}
              placeholder={String(i + 1)}
              className="border-l border-line bg-panel-2 px-1 py-2 text-center font-mono text-[12px] font-bold text-txt outline-none placeholder:text-txt-faint focus:bg-accent/10" />
          ))}
          <div className="flex items-center justify-center border-t border-line bg-panel-2 py-2 font-head text-[11px] font-semibold uppercase tracking-widest text-txt-faint">
            PAR
          </div>
          {data.holes.map((hole, i) => (
            <input key={i} value={hole.par || ""} onChange={(e) => setHole(i, "par", e.target.value)}
              placeholder="4" inputMode="numeric"
              className="border-l border-t border-line bg-transparent px-1 py-2 text-center font-mono text-sm font-bold text-txt outline-none placeholder:text-txt-faint focus:bg-accent/10" />
          ))}
          <div className="flex items-center justify-center border-t border-line bg-panel-2 py-2 font-head text-[11px] font-semibold uppercase tracking-widest text-txt-faint">
            파대비
          </div>
          {data.holes.map((hole, i) => (
            <RelativeScoreInput key={i}
              idx={i}
              par={hole.par}
              score={hole.score}
              onScore={(value) => setHole(i, "score", value)}
              scoreRefs={scoreRefs}
              onScoreKey={handleScoreKey}
              ariaLabel={`9홀 직접입력 ${i + 1}번째 홀 파대비`}
              className={`${manualScoreClass} border-t`} />
          ))}
        </div>
      </div>
      <RelativeScoreHint className="mt-2" />
    </div>
  );
}
