"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "../../lib/i18n";
import { validateScore } from "../../lib/inputValidators";

const REL_MIN = -3;
const REL_MAX = 5;

export function parseRelativeScore(value) {
  const s = String(value).trim().toUpperCase();
  if (!/^-?\d+$/.test(s)) return null;
  const n = parseInt(s, 10);
  return n >= REL_MIN && n <= REL_MAX ? n : null;
}

export function relativeScoreDisplay(score, par) {
  if (score === "" || score == null || par === "" || par == null) return "";
  const n = Number(score) - Number(par);
  if (Number.isNaN(n)) return "";
  return String(n);
}

const roundScoreClass =
  "w-full bg-transparent py-3.5 text-center font-mono text-xl font-bold text-txt outline-none placeholder:text-txt-faint focus:bg-accent/10 focus:ring-1 focus:ring-inset focus:ring-accent md:py-3 md:text-xl";

export const manualScoreClass =
  "border-l border-line bg-transparent px-2 py-2.5 text-center font-mono text-sm font-bold text-txt outline-none placeholder:text-txt-faint focus:bg-accent/10 focus:ring-1 focus:ring-inset focus:ring-accent";

export function selectInputText(event) {
  const el = event.currentTarget;
  try { el.select(); } catch {}
  if (typeof window !== "undefined") {
    window.requestAnimationFrame(() => {
      try { el.select(); } catch {}
    });
  }
}

export const replaceInputTextProps = {
  onFocus: selectInputText,
  onClick: selectInputText,
  onMouseUp: (event) => event.preventDefault(),
};

export function useScoreInputRefs() {
  const scoreRefs = useRef([]);
  const handleScoreKey = useCallback((event, idx) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    scoreRefs.current[idx + 1]?.focus();
  }, []);
  return { scoreRefs, handleScoreKey };
}

export function RelativeScoreHint({ className = "mb-2" }) {
  const { t } = useLang();
  return (
    <p className={`${className} text-[11px] text-txt-faint`}>
      {t("score.relativeHint")}<b className="text-txt-soft">-1</b>{t("score.par")}<b className="text-txt-soft">0</b>{t("score.bogey")}<b className="text-txt-soft">1</b><span className="hidden md:inline">{t("score.arrowHint")}</span>
    </p>
  );
}

export function ScoreModeToggle({ value, onChange }) {
  const { t } = useLang();
  return (
    <div role="group" aria-label={t("a11y.scoreMode")} className="flex overflow-hidden rounded-lg border border-line">
      {[["strokes", t("score.strokes")], ["relative", t("score.toPar")]].map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          className={"px-3 py-1 text-xs font-semibold transition " +
            (value === key ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function RelativeScoreInput({
  idx,
  localIdx,
  par,
  score,
  onScore,
  scoreRefs,
  parRefs,
  onScoreKey,
  ariaLabel,
  className = manualScoreClass,
  placeholder = "0",
}) {
  const display = relativeScoreDisplay(score, par);
  const [buf, setBuf] = useState(display);

  useEffect(() => { setBuf(display); }, [display]);

  const applyRelative = (rel, autoAdvance = false) => {
    const p = Number(par);
    if (Number.isNaN(p)) return;
    const next = Math.max(REL_MIN, Math.min(REL_MAX, rel));
    setBuf(String(next));
    onScore(String(p + next));
    if (autoAdvance) {
      setTimeout(() => scoreRefs?.current[idx + 1]?.focus(), 0);
    }
  };

  const handleChange = (value) => {
    if (value === "") {
      setBuf("");
      onScore("");
      return;
    }
    if (value === "-") {
      setBuf(value);
      return;
    }
    if (!/^-?\d*$/.test(value)) return;
    const rel = parseRelativeScore(value);
    if (rel == null) return;
    applyRelative(rel, true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      parRefs?.current[localIdx]?.focus();
      return;
    }
    if (e.key === "ArrowDown") {
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const current = parseRelativeScore(buf);
      const base = current == null ? 0 : current;
      applyRelative(base + (e.key === "ArrowLeft" ? -1 : 1));
      return;
    }
    if ((e.key === "Enter" || e.key === "Tab") && parseRelativeScore(buf) == null) {
      applyRelative(0);
    }
    onScoreKey?.(e, idx);
  };

  return (
    <input
      aria-label={ariaLabel}
      {...replaceInputTextProps}
      value={buf}
      inputMode="text"
      enterKeyHint="next"
      ref={(el) => { if (scoreRefs) scoreRefs.current[idx] = el; }}
      onKeyDown={handleKeyDown}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}

// 타수/파대비 겸용 스코어 입력. 내부 저장은 항상 절대 타수.
export function ScoreInput({ idx, localIdx, par, score, mode, setHole, scoreRefs, parRefs, onScoreKey }) {
  const { t } = useLang();
  const display = mode === "relative" ? relativeScoreDisplay(score, par) : (score ?? "");
  const [buf, setBuf] = useState(display);

  useEffect(() => { setBuf(display); }, [display, mode]);

  if (mode === "relative") {
    return (
      <RelativeScoreInput
        idx={idx}
        localIdx={localIdx}
        par={par}
        score={score}
        onScore={(value) => setHole(idx, "score", value)}
        scoreRefs={scoreRefs}
        parRefs={parRefs}
        onScoreKey={onScoreKey}
        ariaLabel={t("a11y.holeToPar", { n: idx + 1 })}
        className={roundScoreClass}
        placeholder="–"
      />
    );
  }

  const handleChange = (value) => {
    if (value === "") {
      setBuf("");
      setHole(idx, "score", "");
      return;
    }
    if (!validateScore(value)) return;
    setBuf(value);
    setHole(idx, "score", value);
    if (value.length >= 2 || Number(value) >= 2) {
      setTimeout(() => scoreRefs?.current[idx + 1]?.focus(), 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      parRefs?.current[localIdx]?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scoreRefs?.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scoreRefs?.current[idx + 1]?.focus();
    }
    onScoreKey?.(e, idx);
  };

  return (
    <input
      aria-label={t("a11y.holeScore", { n: idx + 1 })}
      {...replaceInputTextProps}
      value={buf}
      inputMode="numeric"
      ref={(el) => { if (scoreRefs) scoreRefs.current[idx] = el; }}
      onKeyDown={handleKeyDown}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="–"
      className={roundScoreClass}
    />
  );
}
