"use client";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-10">
      <div className="mb-8 border-b border-line pb-6">
        <div className="font-head text-[13px] font-semibold uppercase tracking-[0.28em] text-accent">
          Dallu Golf Account
        </div>
        <a href="/" className="mt-1 block font-head text-[44px] font-bold uppercase leading-none text-txt transition hover:text-accent">
          Dallu Golf <span className="text-accent">Studio</span>
        </a>
      </div>

      <section className="rounded-xl border border-line bg-panel p-5">
        <div className="mb-4">
          <h1 className="font-head text-3xl font-bold uppercase text-txt">로그인 비활성화</h1>
          <p className="mt-1 text-sm text-txt-soft">
            사용자 인증과 라운딩 기록 저장 기능은 정식 인증 구조를 붙이기 전까지 닫아두었습니다.
          </p>
        </div>

        <div className="grid gap-3">
          <label className="block">
            <span className="mb-1 block font-head text-[11px] uppercase tracking-widest text-txt-faint">이름</span>
            <input disabled placeholder="현재 비활성화"
              className="w-full cursor-not-allowed rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt-faint outline-none opacity-70" />
          </label>
          <label className="block">
            <span className="mb-1 block font-head text-[11px] uppercase tracking-widest text-txt-faint">이메일</span>
            <input disabled placeholder="현재 비활성화"
              className="w-full cursor-not-allowed rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt-faint outline-none opacity-70" />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <a href="/" className="text-sm font-semibold text-txt-soft transition hover:text-txt">홈으로</a>
          <button type="button" disabled
            className="cursor-not-allowed rounded-lg border border-line bg-panel-2 px-5 py-2 font-head text-sm font-bold uppercase tracking-wide text-txt-faint opacity-70">
            로그인 중지
          </button>
        </div>
      </section>
    </main>
  );
}
