"use client";

import { useMemo } from "react";
import { emptyRound } from "../../lib/score";
import { STUDIO_STORAGE_KEYS, writeJsonStorage } from "../../lib/studioStorage";
import {
  emptyCustomRound,
  emptyHoleCard,
  emptyManualNine,
  emptyThreeHoleCard,
  preservePlayer,
} from "./studioDefaults";

// 6개 초기화 액션을 한곳에 모은다. 모두 "확인 다이얼로그 → 초기화 → 토스트" 형태로 동일하다.
export default function useStudioResets({
  t,
  requestConfirm,
  showToast,
  setRound,
  setCustomRound,
  setManualNine,
  setThreeHole,
  setHoleCard,
  setCustomHoleCard,
  setHoleRange,
}) {
  return useMemo(() => {
    const confirmReset = (confirmKey, toastKey, apply) => () => {
      requestConfirm(t(confirmKey), () => {
        apply();
        showToast(t(toastKey));
      });
    };

    return {
      resetRound: confirmReset("confirm.reset18", "toast.reset18", () => {
        const next = emptyRound();
        setRound(next);
        setHoleRange("all");
        // 초기화는 디바운스를 우회해 즉시 반영한다.
        writeJsonStorage(STUDIO_STORAGE_KEYS.round, next);
      }),
      resetCustomRound: confirmReset("confirm.resetCustom18", "toast.resetCustom18", () => {
        setCustomRound((prev) => preservePlayer(emptyCustomRound(), prev));
        setHoleRange("all");
      }),
      resetManualNine: confirmReset("confirm.reset9", "toast.reset9", () => {
        setManualNine((prev) => preservePlayer(emptyManualNine(), prev));
      }),
      resetThreeHole: confirmReset("confirm.reset3", "toast.reset3", () => {
        setThreeHole(emptyThreeHoleCard());
      }),
      resetHoleCard: confirmReset("confirm.reset1", "toast.reset1", () => {
        const next = emptyHoleCard();
        setHoleCard(next);
        writeJsonStorage(STUDIO_STORAGE_KEYS.holeCard, next);
      }),
      resetCustomHoleCard: confirmReset("confirm.resetCustom1", "toast.resetCustom1", () => {
        setCustomHoleCard((prev) => preservePlayer(emptyHoleCard(), prev));
      }),
    };
  }, [
    t,
    requestConfirm,
    showToast,
    setRound,
    setCustomRound,
    setManualNine,
    setThreeHole,
    setHoleCard,
    setCustomHoleCard,
    setHoleRange,
  ]);
}
