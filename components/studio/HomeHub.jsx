export default function HomeHub() {
  const items = [
    {
      href: "/score-18",
      title: "18홀 스코어",
      desc: "전체 라운드 스코어를 한 장의 가로 오버레이로 제작",
      meta: "16:9 영상용",
    },
    {
      href: "/score-9",
      title: "9홀 스코어",
      desc: "전반 또는 후반 9홀 스코어 오버레이 제작",
      meta: "9홀 카드",
    },
    {
      href: "/score-3",
      title: "3홀 스코어",
      desc: "짧은 플레이 모음용 3홀 스코어 오버레이 제작",
      meta: "3홀 카드",
    },
    {
      href: "/hole",
      title: "1홀 오버레이",
      desc: "현재 홀, 거리, 샷, 클럽을 보여주는 라이브 오버레이 제작",
      meta: "단일 홀",
    },
    {
      href: "/records",
      title: "내 라운딩",
      desc: "저장한 라운딩 기록을 다시 불러와 오버레이로 사용",
      meta: "개인 기록",
    },
    {
      href: "/login",
      title: "로그인",
      desc: "이름과 이메일로 내 라운딩 기록을 분리해서 저장",
      meta: "계정",
    },
    {
      href: "/admin",
      title: "코스 DB",
      desc: "골프장 나인, 조합, PAR 데이터를 편집하고 KV에 저장",
      meta: "관리자",
    },
  ];

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-10">
      <div className="mb-8 border-b border-line pb-6">
        <div className="font-head text-[13px] font-semibold uppercase tracking-[0.28em] text-accent">
          Broadcast Overlay Maker · @dallu_golf
        </div>
        <a href="/" className="mt-1 block font-head text-[44px] font-bold uppercase leading-none text-txt transition hover:text-accent">
          Dallu Golf <span className="text-accent">Studio</span>
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <a key={item.href} href={item.href}
            className="rounded-xl border border-line bg-panel p-5 transition hover:border-accent hover:bg-panel-2">
            <div className="font-head text-2xl font-bold uppercase text-txt">{item.title}</div>
            <p className="mt-2 min-h-[42px] text-sm leading-relaxed text-txt-soft">{item.desc}</p>
            <div className="mt-4 font-mono text-[12px] font-bold uppercase tracking-wider text-accent">
              {item.meta}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
