"use client";

import { useState } from "react";
import { RelativeScoreHint, ScoreModeToggle, replaceInputTextProps, useScoreInputRefs } from "./ScoreInputs";
import { validateNumericOnly } from "../../lib/inputValidators";
import { Field, PlayerNameControl, UnitToggle } from "./StudioFields";
import PanelHeader, { ResetButton } from "./PanelHeader";
import ScoreEntryGrid from "./ScoreEntryGrid";
import { useLang } from "../../lib/i18n";
import { hasNumericValue } from "../../lib/score";

export function ThreeHoleForm({ data, setField, setHole, onReset }) {
  const { t } = useLang();
  const { scoreRefs, handleScoreKey } = useScoreInputRefs();
  const [scoreMode, setScoreMode] = useState("strokes");
  const showDist = data.metaMode === "parDist";
  const showHoleNumbers = data.metaMode === "holePar" && data.showHoleNumbers === true;
  const toggleHoleNumbers = (checked) => {
    setField("showHoleNumbers", checked);
    setField("metaMode", checked ? "holePar" : "par");
  };
  const toggleDistance = (checked) => {
    setField("showHoleNumbers", false);
    setField("metaMode", checked ? "parDist" : "par");
  };

  return (
    <div className="rounded-xl border border-line bg-panel p-3 md:p-4">
      <PanelHeader title={t("manual.threeTitle")}>
        <ScoreModeToggle value={scoreMode} onChange={setScoreMode} />
        {onReset ? <ResetButton onClick={onReset} /> : null}
      </PanelHeader>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-txt-soft">
          <input type="checkbox" checked={showHoleNumbers}
            onChange={(e) => toggleHoleNumbers(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]" />
          {t("manual.showHoleNumbers")}
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-txt-soft">
          <input type="checkbox" checked={showDist}
            onChange={(e) => toggleDistance(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]" />
          {t("hole.distance")}
        </label>
        {showDist && (
          <UnitToggle value={data.unit || "m"} onChange={(unit) => setField("unit", unit)} />
        )}
      </div>

      <ScoreEntryGrid
        holes={data.holes}
        setHole={setHole}
        scoreRefs={scoreRefs}
        onScoreKey={handleScoreKey}
        scoreMode={scoreMode}
        showSum={false}
        showHoleNumbers={showHoleNumbers}
        editableHoleNumbers
      />
      {scoreMode === "relative" && <RelativeScoreHint className="mt-2" />}

      {showDist && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(data.holes || []).slice(0, 3).map((h, i) => (
            <input key={i} value={h.distance || ""}
              {...replaceInputTextProps}
              onChange={(e) => {
                if (validateNumericOnly(e.target.value)) setHole(i, "distance", e.target.value);
              }}
              aria-label={t("a11y.holeDistance", { n: i + 1 })}
              placeholder={`- ${(data.unit || "m") === "yd" ? "yd" : "m"}`}
              inputMode="numeric"
              className="rounded-lg border border-line-2 bg-panel-2 px-2.5 py-1.5 text-center text-sm text-txt outline-none placeholder:text-txt-faint focus:border-accent" />
          ))}
        </div>
      )}

      <div className="mt-2">
        <Field label={t("manual.toPar")} value={data.toPar} onChange={(v) => setField("toPar", v)} placeholder={t("manual.toParPlaceholder")} />
      </div>
    </div>
  );
}

export function LinkedThreeHolePanel({ round, selected, showHoleNumbers, onSelect, onShowHoleNumbers }) {
  const { t } = useLang();
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
            {t("manual.threeSelect")}
          </div>
          <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[11px] font-bold text-accent">
            {groupLabel(selectedStart)}
          </span>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-txt-soft">
          <input type="checkbox" checked={showHoleNumbers}
            onChange={(e) => onShowHoleNumbers(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]" />
          {t("manual.showHoleNumbers")}
        </label>
      </div>
      <div className="grid grid-cols-9 gap-1">
        {round.holes.map((h, i) => {
          const start = Math.min(i, Math.max(round.holes.length - 3, 0));
          const active = Array.isArray(selected) && selected.includes(i);
          const has = hasNumericValue(h.score);
          return (
            <button key={i} type="button" onClick={() => onSelect(start)}
              title={t("a11y.threeGroup", { a: start + 1, b: start + 3 })}
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
        {t("manual.threeHoleHint")}
      </div>
    </div>
  );
}

export function ManualNineForm({ data, setField, setHole, onReset }) {
  const { t } = useLang();
  const { scoreRefs, handleScoreKey } = useScoreInputRefs();
  const [scoreMode, setScoreMode] = useState("strokes");
  const holes = data.holes || [];
  const parSum = holes.reduce((a, h) => a + (Number(h.par) || 0), 0);
  const allParFilled = holes.length >= 9 && holes.every((h) => h.par !== "" && h.par != null);

  return (
    <div className="rounded-xl border border-line bg-panel p-3 md:p-4">
      <PanelHeader title={t("manual.nineTitle")}>
        <PlayerNameControl value={data.player} onChange={(v) => setField("player", v)} />
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
      {allParFilled && parSum !== 36 && (
        <div className="mt-2 text-[11px] font-semibold text-[#ffb648]">
          {t("label.parWarning")}
        </div>
      )}
    </div>
  );
}
