"use client";

import Link from "next/link";
import { useLang } from "../../lib/i18n";

export default function LoginPage() {
  const { t } = useLang();
  return (
    <main className="mx-auto max-w-[720px] px-5 py-7 sm:px-6 sm:py-10">
      <div className="mb-6 border-b border-line pb-5 sm:mb-8 sm:pb-6">
        <div className="font-head text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-accent sm:text-[13px] sm:tracking-[0.28em]">
          Dallu Golf Account
        </div>
        <Link href="/" className="mt-1 block font-head text-[34px] font-bold uppercase leading-none text-txt transition hover:text-accent sm:text-[44px]">
          Dallu Golf <span className="text-accent">Studio</span>
        </Link>
      </div>

      <section className="rounded-xl border border-line bg-panel p-5">
        <div className="mb-4">
          <h1 className="font-head text-3xl font-bold uppercase text-txt">{t("home.login")}</h1>
          <p className="mt-1 text-sm text-txt-soft">{t("login.disabledDetail")}</p>
        </div>

        <div className="grid gap-3">
          <label className="block">
            <span className="mb-1 block font-head text-[11px] uppercase tracking-widest text-txt-faint">{t("label.name")}</span>
            <input disabled placeholder={t("label.name")}
              className="w-full cursor-not-allowed rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt-faint outline-none opacity-70" />
          </label>
          <label className="block">
            <span className="mb-1 block font-head text-[11px] uppercase tracking-widest text-txt-faint">{t("label.email")}</span>
            <input disabled placeholder={t("label.email")}
              className="w-full cursor-not-allowed rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt-faint outline-none opacity-70" />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-sm font-semibold text-txt-soft transition hover:text-txt">{t("notfound.home")}</Link>
          <button type="button" disabled
            className="cursor-not-allowed rounded-lg border border-line bg-panel-2 px-5 py-2 font-head text-sm font-bold uppercase tracking-wide text-txt-faint opacity-70">
            {t("home.login")}
          </button>
        </div>
      </section>
    </main>
  );
}
