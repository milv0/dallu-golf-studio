export default function HomeHub() {
  const secondary = [
    { href: "/records", title: "내 라운딩", meta: "저장 기록" },
    { href: "/score-9?source=custom", title: "9홀 직접", meta: "수동 입력" },
    { href: "/score-3?source=custom", title: "3홀 직접", meta: "수동 입력" },
    { href: "/admin", title: "코스 DB", meta: "관리자" },
    { href: "/login", title: "로그인", meta: "계정" },
  ];

  return (
    <main className="mx-auto max-w-[980px] px-6 py-10">
      <div className="mb-8 border-b border-line pb-6">
        <div className="font-head text-[13px] font-semibold uppercase tracking-[0.28em] text-accent">
          Broadcast Overlay Maker · @dallu_golf
        </div>
        <a href="/" className="mt-1 block font-head text-[44px] font-bold uppercase leading-none text-txt transition hover:text-accent">
          Dallu Golf <span className="text-accent">Studio</span>
        </a>
      </div>

      <a href="/score-18"
        className="block rounded-xl border border-line bg-panel p-6 transition hover:border-accent hover:bg-panel-2">
        <div className="font-head text-[34px] font-bold uppercase leading-none text-txt">
          라운딩 입력 시작
        </div>
        <p className="mt-2 text-sm leading-relaxed text-txt-soft">
          선수, 코스, 날짜, 18홀 스코어를 입력한 뒤 18홀/9홀/3홀/1홀 오버레이로 저장합니다.
        </p>
        <div className="mt-5 inline-flex rounded-lg bg-accent px-4 py-2 font-head text-sm font-bold uppercase tracking-wide text-[#06210f]">
          시작하기
        </div>
      </a>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {secondary.map((item) => (
          <a key={item.href} href={item.href}
            className="rounded-xl border border-line bg-panel p-4 transition hover:border-accent hover:bg-panel-2">
            <div className="font-head text-xl font-bold uppercase text-txt">{item.title}</div>
            <div className="mt-2 font-mono text-[11px] font-bold uppercase tracking-wider text-accent">
              {item.meta}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
