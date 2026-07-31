"use client";
import { useRef, useCallback } from "react";

export default function useGridNav({ onUp, onDown } = {}) {
  const refs = useRef([]);

  const handleKeyDown = useCallback((e, idx) => {
    if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      refs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" || e.key === "Enter") {
      e.preventDefault();
      refs.current[idx + 1]?.focus();
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      refs.current[idx + 1]?.focus();
    } else if (e.key === "ArrowUp" && onUp) {
      e.preventDefault();
      onUp(idx);
    } else if (e.key === "ArrowDown" && onDown) {
      e.preventDefault();
      onDown(idx);
    }
  }, [onUp, onDown]);

  const navProps = useCallback((idx) => ({
    inputRef: (el) => { refs.current[idx] = el; },
    onKeyDown: (e) => handleKeyDown(e, idx),
  }), [handleKeyDown]);

  return { refs, navProps };
}
