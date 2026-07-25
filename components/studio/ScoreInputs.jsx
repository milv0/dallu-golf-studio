"use client";

import { useEffect, useState } from "react";

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
  "w-full bg-transparent py-2.5 text-center font-mono text-lg font-bold text-txt outline-none placeholder:text-txt-faint focus:bg-accent/10 focus:ring-1 focus:ring-inset focus:ring-accent";

export const manualScoreClass =
  "border-l border-line bg-transparent px-2 py-2.5 text-center font-mono text-sm font-bold text-txt outline-none placeholder:text-txt-faint focus:bg-accent/10 focus:ring-1 focus:ring-inset focus:ring-accent";

export function RelativeScoreHint({ className = "mb-2" }) {
  return (
    <p className={`${className} text-[11px] text-txt-faint`}>
      파 기준 입력: 버디 <b className="text-txt-soft">-1</b> · 파 <b className="text-txt-soft">0</b> · 보기 <b className="text-txt-soft">1</b> · ←/→ 조정
    </p>
  );
}

export function RelativeScoreInput({
  idx,
  par,
  score,
  onScore,
  scoreRefs,
  onScoreKey,
  ariaLabel,
  className = manualScoreClass,
  placeholder = "0",
}) {
  const display = relativeScoreDisplay(score, par);
  const [buf, setBuf] = useState(display);

  useEffect(() => { setBuf(display); }, [display]);

  const applyRelative = (rel) => {
    const p = Number(par);
    if (Number.isNaN(p)) return;
    const next = Math.max(REL_MIN, Math.min(REL_MAX, rel));
    setBuf(String(next));
    onScore(String(p + next));
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
    applyRelative(rel);
  };

  const handleKeyDown = (e) => {
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
      value={buf}
      inputMode="numeric"
      ref={(el) => { if (scoreRefs) scoreRefs.current[idx] = el; }}
      onKeyDown={handleKeyDown}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}

// 타수/파대비 겸용 스코어 입력. 내부 저장은 항상 절대 타수.
export function ScoreInput({ idx, par, score, mode, setHole, scoreRefs, onScoreKey }) {
  const display = mode === "relative" ? relativeScoreDisplay(score, par) : (score ?? "");
  const [buf, setBuf] = useState(display);

  useEffect(() => { setBuf(display); }, [display, mode]);

  if (mode === "relative") {
    return (
      <RelativeScoreInput
        idx={idx}
        par={par}
        score={score}
        onScore={(value) => setHole(idx, "score", value)}
        scoreRefs={scoreRefs}
        onScoreKey={onScoreKey}
        ariaLabel={`홀 ${idx + 1} 파대비`}
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
    if (!/^\d+$/.test(value)) return;
    setBuf(value);
    setHole(idx, "score", value);
  };

  return (
    <input
      aria-label={`홀 ${idx + 1} 스코어`}
      value={buf}
      inputMode="numeric"
      ref={(el) => { if (scoreRefs) scoreRefs.current[idx] = el; }}
      onKeyDown={(e) => onScoreKey?.(e, idx)}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="–"
      className={roundScoreClass}
    />
  );
}
