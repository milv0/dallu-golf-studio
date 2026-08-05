"use client";

import { ClubField, UnitToggle } from "./StudioFields";
import PanelHeader, { ResetButton } from "./PanelHeader";
import { replaceInputTextProps } from "./ScoreInputs";
import { useLang } from "../../lib/i18n";
import useGridNav from "../../lib/useGridNav";
import { PAR_OPTIONS, validateHoleNumber, validateNumericOnly } from "../../lib/inputValidators";
import { hasNumericValue } from "../../lib/score";

function CoreInput({ label, value, onChange, placeholder, inputMode = "text", inputRef, onKeyDown }) {
  return (
    <label className="block min-w-0 border-l border-line first:border-l-0">
      <span className="block bg-panel py-0.5 text-center font-head text-[10px] font-semibold uppercase tracking-widest text-txt-faint">
        {label}
      </span>
      <input
        {...replaceInputTextProps}
        ref={inputRef}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full border-t border-line bg-transparent px-1 py-2 text-center font-mono text-lg font-bold text-txt outline-none placeholder:text-txt-faint focus:bg-accent/10 focus:ring-1 focus:ring-inset focus:ring-accent"
      />
    </label>
  );
}

export default function HoleCardForm({ round, holeCard, setHC, loadHoleFromRound, onReset, linked = true, cardStyle = "classic" }) {
  const { t } = useLang();
  const { navProps } = useGridNav();

  // PAR을 줄이면 기존 타수가 버튼 범위(PAR×2)를 벗어나 선택 표시가 사라진다 — 상한으로 맞춘다.
  const setPar = (nextPar) => {
    setHC("par", nextPar);
    const maxShot = (Number(nextPar) || 4) * 2;
    if (Number(holeCard.currentShot) > maxShot) setHC("currentShot", String(maxShot));
  };

  return (
    <div className="rounded-xl border border-line bg-panel p-3 md:p-4">
      <PanelHeader title={t("hole.title")}>
        <UnitToggle value={holeCard.unit || "m"} onChange={(unit) => setHC("unit", unit)} />
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
              const has = hasNumericValue(h.score);
              return (
                <button key={i} type="button" onClick={() => loadHoleFromRound(n)}
                  title={has
                    ? t("a11y.holeButtonScore", { n, par: h.par, score: h.score })
                    : t("a11y.holeButton", { n, par: h.par })}
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
        <div className="grid grid-cols-3">
          {linked ? (
            <label className="block min-w-0 border-l border-line first:border-l-0">
              <span className="block bg-panel py-0.5 text-center font-head text-[10px] font-semibold uppercase tracking-widest text-txt-faint">{t("hole.labelHole")}</span>
              <input readOnly value={holeCard.hole || "–"} tabIndex={-1}
                ref={navProps(0).inputRef}
                onKeyDown={navProps(0).onKeyDown}
                className="w-full border-t border-line bg-transparent px-1 py-2 text-center font-mono text-lg font-bold text-txt outline-none" />
            </label>
          ) : (
            <CoreInput label={t("hole.labelHole")} value={holeCard.hole} onChange={(v) => {
              if (!validateHoleNumber(v)) return;
              setHC("hole", v);
            }} placeholder="–" inputMode="numeric" {...navProps(0)} />
          )}
          <CoreInput label={t("hole.distance")} value={holeCard.distance} onChange={(v) => {
            if (validateNumericOnly(v)) setHC("distance", v);
          }} placeholder="–" inputMode="numeric" {...navProps(1)} />
          {/* PAR과 SHOT은 아래 버튼 그리드가 단일 입력 수단이다(값 범위가 좁아 키패드가 불필요). */}
          <CoreInput label="±" value={holeCard.toPar} onChange={(v) => setHC("toPar", v)} placeholder="–" {...navProps(2)} />
        </div>
      </div>

      <div className="mt-4 border-t border-line pt-3">
        <span className="mb-1.5 block font-head text-[11px] uppercase tracking-widest text-accent">
          {t("hole.par")}
        </span>
        <div className="flex gap-1.5">
          {PAR_OPTIONS.map((n) => (
            <button key={n} type="button" onClick={() => setPar(String(n))}
              aria-pressed={String(n) === String(holeCard.par)}
              className={"h-9 flex-1 rounded-md font-mono text-sm font-bold transition " +
                (String(n) === String(holeCard.par)
                  ? "bg-accent text-[#06210f]"
                  : "border border-line bg-panel-2 text-txt-soft hover:text-txt")}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-line pt-3">
        <span className="mb-1.5 block font-head text-[11px] uppercase tracking-widest text-accent">
          {t("hole.currentShot")}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: (Number(holeCard.par) || 4) * 2 }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" onClick={() => setHC("currentShot", String(n))}
              aria-pressed={String(n) === String(holeCard.currentShot)}
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
      <div className="mt-3">
        <div className={"w-full " + (cardStyle === "minimal" ? "opacity-40" : "")}>
          <ClubField value={holeCard.club} onChange={(v) => setHC("club", v)}
            disabled={cardStyle === "minimal"} />
        </div>
      </div>
      <label className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm font-semibold text-txt-soft">
        <input
          type="checkbox"
          checked={holeCard.showResultBanner !== false}
          onChange={(e) => setHC("showResultBanner", e.target.checked)}
          className="h-4 w-4 accent-[var(--color-accent)]"
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
