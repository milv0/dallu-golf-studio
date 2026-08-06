"use client";

import Link from "next/link";
import { useLang } from "../../lib/i18n";
import { guideFor } from "../../lib/guideContent";
import { AppHeader } from "./StudioNav";

function FaqSection({ title, items }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 font-head text-[14px] font-semibold uppercase tracking-widest text-accent">
        {title}
      </h2>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.q} className="rounded-xl border border-line bg-panel p-4">
            <div className="font-head text-[14px] font-bold text-txt">{item.q}</div>
            <div className="mt-2 text-[13px] leading-relaxed text-txt-soft">{item.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function GuidePage() {
  const { lang, t, href } = useLang();
  // 본문은 lib/guideContent.js가 소유한다 — 이 컴포넌트는 렌더링만 한다.
  const guide = guideFor(lang);

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-[640px] px-4 pb-12 pt-8 md:px-6">
        <h1 className="font-head text-[32px] font-bold uppercase leading-none text-txt">Guide</h1>
        <p className="mt-2 text-sm text-txt-soft">{guide.subtitle}</p>

      <section className="mt-8">
        <h2 className="mb-4 font-head text-[14px] font-semibold uppercase tracking-widest text-accent">{guide.usageTitle}</h2>
        <div className="flex flex-col gap-3">
          {guide.steps.map((s) => (
            <div key={s.step} className="flex gap-3 rounded-xl border border-line bg-panel p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 font-head text-[15px] font-bold text-accent">
                {s.step}
              </div>
              <div>
                <div className="font-head text-[15px] font-bold text-txt">{s.title}</div>
                <div className="mt-1 text-[13px] leading-relaxed text-txt-soft">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {guide.sections.map((section) => (
        <FaqSection key={section.id} title={section.title} items={section.items} />
      ))}

      <div className="mt-10 text-center">
        <Link href={href("/")} className="inline-block rounded-lg bg-accent px-5 py-2 font-head text-sm font-bold uppercase tracking-wide text-[#06210f] transition hover:bg-accent-2">
          {t("notfound.home")}
        </Link>
      </div>
      </main>
    </>
  );
}
