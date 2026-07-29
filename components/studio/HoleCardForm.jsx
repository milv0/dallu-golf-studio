"use client";

import { ClubField, Field } from "./StudioFields";

export default function HoleCardForm({ round, holeCard, setHC, loadHoleFromRound }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="mb-3 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
        현재 홀 정보
      </div>
      <div className="mb-3">
        <span className="mb-1.5 block font-head text-[11px] uppercase tracking-widest text-accent">
          홀 선택 (PAR·토탈 자동 연동)
        </span>
        <div className="grid grid-cols-9 gap-1">
          {round.holes.map((h, i) => {
            const n = i + 1;
            const active = String(n) === String(holeCard.hole);
            const has = h.score !== "" && h.score != null;
            return (
              <button key={i} type="button" onClick={() => loadHoleFromRound(n)}
                title={`${n}번 홀 · Par ${h.par}${has ? ` · ${h.score}타` : ""}`}
                className={"rounded-md py-1.5 text-center font-mono text-[13px] font-bold transition " +
                  (active
                    ? "bg-accent text-[#06210f]"
                    : has
                      ? "border border-line-2 bg-panel-2 text-txt-soft hover:text-txt"
                      : "border border-line bg-panel-2 text-txt-faint hover:text-txt")}>
                {n}
              </button>
            );
          })}
        </div>
        <div className="mt-1 text-[11px] text-txt-faint">
          라임 배경 = 선택된 홀
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="홀 번호" value={holeCard.hole} onChange={(v) => setHC("hole", v)} placeholder="1" />
        <Field label="PAR" value={holeCard.par} onChange={(v) => setHC("par", v)} placeholder="4" />
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="font-head text-[11px] uppercase tracking-widest text-txt-faint">거리</span>
            <div className="flex overflow-hidden rounded-md border border-line">
              {[["m", "M"], ["yd", "YD"]].map(([u, l]) => (
                <button key={u} type="button" onClick={() => setHC("unit", u)}
                  className={"px-2 py-0.5 text-[11px] font-bold transition " +
                    (holeCard.unit === u ? "bg-accent text-[#06210f]" : "bg-panel-2 text-txt-soft hover:text-txt")}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <input value={holeCard.distance} onChange={(e) => setHC("distance", e.target.value)}
            placeholder={holeCard.unit === "yd" ? "212" : "195"}
            className="w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none focus:border-accent" />
        </div>
        <Field label="토탈 (E, -2...)" value={holeCard.toPar} onChange={(v) => setHC("toPar", v)} placeholder="E" />
        <Field label="현재 타수" value={holeCard.currentShot} onChange={(v) => setHC("currentShot", v)} placeholder="4" />
        <ClubField value={holeCard.club} onChange={(v) => setHC("club", v)} />
      </div>
      <label className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm font-semibold text-txt-soft">
        <input
          type="checkbox"
          checked={holeCard.showResultBanner !== false}
          onChange={(e) => setHC("showResultBanner", e.target.checked)}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        FOR EAGLE/BIRDIE 배너 표시
      </label>
      <div className="mt-3">
        <span className="mb-1.5 block font-head text-[11px] uppercase tracking-widest text-accent">
          현재 타수 (지금까지 친 횟수)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: Math.min(Math.max((Number(holeCard.par) || 4) + 2, 6), 9) }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" onClick={() => setHC("currentShot", String(n))}
              className={"h-9 w-9 rounded-md font-mono text-sm font-bold transition " +
                (String(n) === String(holeCard.currentShot)
                  ? "bg-accent text-[#06210f]"
                  : "border border-line bg-panel-2 text-txt-soft hover:text-txt")}>
              {n}
            </button>
          ))}
          <button type="button" onClick={() => setHC("currentShot", "")}
            className="h-9 rounded-md border border-line bg-panel-2 px-3 text-xs font-semibold text-txt-faint hover:text-txt">
            없음
          </button>
        </div>
      </div>
      <p className="mt-2 text-[12px] text-txt-faint">
        홀 선택 → PAR·토탈·타수 자동 반영 · 거리/클럽은 직접 입력
      </p>
    </div>
  );
}
