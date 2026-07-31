"use client";

import { Heart, MessageCircle, MoreHorizontal, Play, Send } from "lucide-react";

export default function PlacementPreview({ format, size, isHole = false, children }) {
  const isYt = format === "youtube";
  const overlayPct = isHole ? 44 : isYt ? 82 * (size.w / 1761) : 88 * (size.w / 1080);
  const pos = isHole
    ? { left: "4%", bottom: "13%" }
    : isYt
    ? { left: "3%", top: "5%" }
    : { left: "50%", top: "14%", transform: "translateX(-50%)" };
  return (
    <div className={"mx-auto w-full " + (isYt ? "max-w-[560px]" : "max-w-[300px]")}>
      <div
        className="relative overflow-hidden rounded-lg border border-line bg-[#101419] shadow-xl"
        style={{ aspectRatio: isYt ? "16 / 9" : "9 / 16" }}
      >
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-txt-faint">
          <Play size={28} fill="currentColor" className="opacity-40" />
          <span className="font-mono text-[10px] tracking-widest opacity-50">{isYt ? "1920 × 1080" : "1080 × 1920"}</span>
        </div>
        {!isYt && (
          <>
            <div className="pointer-events-none absolute bottom-24 right-2 flex flex-col items-center gap-3 opacity-40">
              <Heart size={18} />
              <MessageCircle size={18} />
              <Send size={18} />
              <MoreHorizontal size={18} />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
          </>
        )}
        {isYt && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-black/40" />
        )}
        <div className="preview-svg absolute" style={{ ...pos, width: overlayPct + "%" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
