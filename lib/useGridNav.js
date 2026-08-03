"use client";
import { useRef, useCallback } from "react";
import { gridNavAction } from "./gridNavAction";

export default function useGridNav({ onUp, onDown } = {}) {
  const refs = useRef([]);

  const handleKeyDown = useCallback((e, idx) => {
    const action = gridNavAction({
      key: e.key,
      shiftKey: e.shiftKey,
      idx,
      hasNext: Boolean(refs.current[idx + 1]),
      hasUp: Boolean(onUp),
      hasDown: Boolean(onDown),
    });
    // action이 null이면 기본 동작 유지 — 마지막 칸에서 Tab이 다음 컨트롤로 빠져나간다.
    if (!action) return;
    e.preventDefault();
    if (action === "prev") refs.current[idx - 1]?.focus();
    else if (action === "next") refs.current[idx + 1]?.focus();
    else if (action === "up") onUp(idx);
    else if (action === "down") onDown(idx);
  }, [onUp, onDown]);

  const navProps = useCallback((idx) => ({
    inputRef: (el) => { refs.current[idx] = el; },
    onKeyDown: (e) => handleKeyDown(e, idx),
  }), [handleKeyDown]);

  return { refs, navProps };
}
