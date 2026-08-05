"use client";

import Link from "next/link";
import StudioNav from "./StudioNav";
import { useLang } from "../../lib/i18n";

export default function RoundRecords() {
  const { t } = useLang();
  return (
    <main className="mx-auto max-w-[1180px] px-5 py-6 sm:px-6 sm:py-8">
      <div className="mb-5 flex flex-col items-start justify-between gap-4 border-b border-line pb-5 sm:mb-6 sm:flex-row sm:items-end">
        <div>
          <div className="font-head text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-accent sm:text-[13px] sm:tracking-[0.28em]">
            Round Archive · @dallu_golf
          </div>
          <Link href="/" className="mt-1 block font-head text-[34px] font-bold uppercase leading-none tracking-tight text-txt transition hover:text-accent sm:text-[40px]">
            Dallu Golf <span className="text-accent">Studio</span>
          </Link>
          <p className="mt-2 text-sm text-txt-soft">{t("records.disabled")}</p>
        </div>
        <span
          aria-disabled="true"
          className="cursor-not-allowed rounded-lg border border-line bg-panel-2 px-3 py-1.5 font-head text-xs font-bold uppercase tracking-wide text-txt-faint opacity-70 sm:px-4 sm:py-2 sm:text-sm">
          {t("records.enter18")}
        </span>
      </div>

      <StudioNav active="records" />

      <div className="rounded-xl border border-line bg-panel p-8 text-center">
        <div className="font-head text-2xl font-bold text-txt">{t("records.title")}</div>
        <p className="mt-2 text-sm text-txt-soft">
          {t("records.disabledDetail")}
        </p>
        <button type="button" disabled
          className="mt-5 inline-flex cursor-not-allowed rounded-lg border border-line bg-panel-2 px-4 py-2 text-sm font-bold text-txt-faint opacity-70">
          {t("records.load")}
        </button>
      </div>
    </main>
  );
}
