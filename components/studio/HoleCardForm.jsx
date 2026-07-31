"use client";

import { ClubField } from "./StudioFields";
import PanelHeader, { ResetButton } from "./PanelHeader";
import { replaceInputTextProps } from "./ScoreInputs";
import { useLang } from "../../lib/i18n";

function CoreInput({ label, value, onChange, placeholder, inputMode = "text" }) {
  return (
    <label className="block min-w-0 border-l border-line first:border-l-0">
      <span className="block bg-panel py-0.5 text-center font-head text-[10px] font-semibold uppercase tracking-widest text-txt-faint">
        {label}
      </span>
      <input
        {...replaceInputTextProps}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full border-t border-line bg-transparent px-1 py-2 text-center font-mono text-lg font-bold text-txt outline-none placeholder:text-txt-faint focus:bg-accent/10 focus:ring-1 focus:ring-inset focus:ring-accent"
      />
    </label>
  );
}

export default function HoleCardForm({ round, holeCard, setHC, loadHoleFromRound, onReset, linked = true, cardStyle = "classic" }) {
  const { t } = useLang();
  return (
    <div className="rounded-xl border border-line bg-panel p-3 md:p-4">
      <PanelHeader title={t("hole.title")}>
        {onReset ? <ResetButton onClick={onReset} /> : null}
      </PanelHeader>
      {linked && (
        <div className="mb-2">
          <span className="mb-1.5 block font-head text-[11px] uppercase tracking-widest text-accent">
            {t("hole.selector")}
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
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-line">
        <div className="grid grid-cols-5">
          {linked ? (
            <label className="block min-w-0 border-l border-line first:border-l-0">
              <span className="block bg-panel py-0.5 text-center font-head text-[10px] font-semibold uppercase tracking-widest text-txt-faint">{t("hole.labelHole")}</span>
              <input readOnly value={holeCard.hole || "–"} tabIndex={-1}
                className="w-full border-t border-line bg-transparent px-1 py-2 text-center font-mono text-lg font-bold text-txt outline-none" />
            </label>
          ) : (
            <CoreInput label={t("hole.labelHole")} value={holeCard.hole} onChange={(v) => {
              if (v === "") { setHC("hole", ""); return; }
              if (!/^\d{1,2}$/.test(v)) return;
              const n = parseInt(v, 10);
              if (n >= 1 && n <= 18) setHC("hole", v);
            }} placeholder="–" inputMode="numeric" />
          )}
          <CoreInput label="P" value={holeCard.par} onChange={(v) => {
            if (v === "" || /^[3456]$/.test(v)) setHC("par", v);
          }} placeholder="–" inputMode="numeric" />
          <CoreInput label={t("hole.distance")} value={holeCard.distance} onChange={(v) => {
            if (v === "" || /^\d+$/.test(v)) setHC("distance", v);
          }} placeholder="–" inputMode="numeric" />
          <CoreInput label={t("hole.labelShot")} value={holeCard.currentShot} onChange={(v) => {
            if (v === "") { setHC("currentShot", ""); return; }
            if (!/^\d+$/.test(v)) return;
            const max = (Number(holeCard.par) || 4) * 2;
            if (Number(v) >= 1 && Number(v) <= max) setHC("currentShot", v);
          }} placeholder="–" inputMode="numeric" />
          <CoreInput label="±" value={holeCard.toPar} onChange={(v) => setHC("toPar", v)} placeholder="–" />
        </div>
      </div>

      <div className="mt-4 border-t border-line pt-3">
        <span className="mb-1.5 block font-head text-[11px] uppercase tracking-widest text-accent">
          {t("hole.currentShot")}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: (Number(holeCard.par) || 4) * 2 }, (_, i) => i + 1).map((n) => (
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
            {t("hole.none")}
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-md border border-line">
          {[["m", "M"], ["yd", "YD"]].map(([u, l]) => (
            <button key={u} type="button" onClick={() => setHC("unit", u)}
              className={"px-2.5 py-1 text-[11px] font-bold transition " +
                (holeCard.unit === u ? "bg-accent text-[#06210f]" : "bg-panel-2 text-txt-soft hover:text-txt")}>
              {l}
            </button>
          ))}
        </div>
        <div className={"max-w-[180px] flex-1 " + (cardStyle === "minimal" ? "opacity-40 pointer-events-none" : "")}>
          <ClubField value={holeCard.club} onChange={(v) => setHC("club", v)} />
        </div>
      </div>
      <label className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm font-semibold text-txt-soft">
        <input
          type="checkbox"
          checked={holeCard.showResultBanner !== false}
          onChange={(e) => setHC("showResultBanner", e.target.checked)}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        {t("hole.forBanner")}
      </label>
      {linked && (
        <p className="mt-2 text-[12px] text-txt-faint">
          {t("hole.linkedHint")}
        </p>
      )}
    </div>
  );
}
