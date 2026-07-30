import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <h1 className="font-head text-[8rem] font-bold leading-none text-accent">
        404
      </h1>
      <p className="mt-4 font-body text-lg text-txt-soft">
        페이지를 찾을 수 없어요
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-accent px-6 py-3 font-head text-sm font-semibold uppercase tracking-wide text-[#06210f] transition hover:bg-accent-2"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
