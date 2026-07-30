"use client";

import Link from "next/link";
import { useLang } from "../lib/i18n";

export default function NotFound() {
  const { t } = useLang();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <h1 className="font-head text-[8rem] font-bold leading-none text-accent">
        {t("notfound.title")}
      </h1>
      <p className="mt-4 font-body text-lg text-txt-soft">
        {t("notfound.message")}
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-accent px-6 py-3 font-head text-sm font-semibold uppercase tracking-wide text-[#06210f] transition hover:bg-accent-2"
      >
        {t("notfound.home")}
      </Link>
    </main>
  );
}
