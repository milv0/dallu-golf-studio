// 프리셋: 릴스 3홀 카드 — 9홀 카드와 같은 레이아웃의 3홀 축소판
import { memo } from "react";
import { cardColors } from "../../lib/theme";
import { normalizeToParDisplay, toParColor, toParForPlayedHoles } from "../../lib/score";
import { CompactScorecard } from "./scorecardPrimitives";

export const SIZE = { w: 520, h: 200 };

function ReelsThreeHoleCard({ data, theme = "light" }) {
  const { w, h } = SIZE;
  const c = cardColors(theme);
  const holes = (data.holes || []).slice(0, 3);
  const showHoleNumbers = data.showHoleNumbers !== false;
  const toPar = normalizeToParDisplay(data.toPar) || toParForPlayedHoles(holes);
  const toParFill = toParColor(toPar, c);

  return (
    <CompactScorecard
      w={w}
      h={h}
      c={c}
      holes={holes}
      startIndex={0}
      showHoleNumbers={showHoleNumbers}
      metaMode={data.metaMode || "holePar"}
      unit={data.unit || "m"}
      toPar={toPar}
      toParColor={toParFill}
    />
  );
}

export default memo(ReelsThreeHoleCard);
