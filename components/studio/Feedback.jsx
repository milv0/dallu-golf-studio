"use client";

import { useEffect } from "react";

export function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(onClose, 2800);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-50 flex justify-center px-4">
      <div className="max-w-[520px] rounded-xl border border-line bg-panel px-4 py-3 text-sm font-semibold text-txt shadow-xl">
        {message}
      </div>
    </div>
  );
}

export function ConfirmDialog({ request, onCancel, onConfirm }) {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[360px] rounded-2xl border border-line bg-panel p-4 shadow-2xl">
        <div className="font-head text-xl font-bold uppercase text-txt">
          확인
        </div>
        <p className="mt-2 text-sm leading-relaxed text-txt-soft">
          {request.message}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={onCancel}
            className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm font-bold text-txt-soft transition active:scale-[0.98]">
            취소
          </button>
          <button type="button" onClick={onConfirm}
            className="rounded-lg bg-accent px-3 py-2 text-sm font-bold text-[#06210f] transition active:scale-[0.98]">
            네
          </button>
        </div>
      </div>
    </div>
  );
}
