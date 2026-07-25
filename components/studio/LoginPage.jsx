"use client";

import { useEffect, useMemo, useState } from "react";
import { isValidEmail, loadCurrentUser, saveCurrentUser } from "../../lib/auth";
import { loginEmailUser } from "../../lib/api";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fallback, setFallback] = useState(false);
  const next = useMemo(() => {
    if (typeof window === "undefined") return "/records";
    return new URLSearchParams(window.location.search).get("next") || "/records";
  }, []);

  useEffect(() => {
    const user = loadCurrentUser();
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, []);

  const canSubmit = name.trim().length > 0 && isValidEmail(email);

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    setBusy(true);
    try {
      const user = await loginEmailUser({ name, email });
      saveCurrentUser(user);
      window.location.href = next;
    } catch {
      saveCurrentUser({ name, email });
      setFallback(true);
      window.location.href = next;
    } finally {
      setBusy(false);
    }
  };

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

      <form onSubmit={submit} className="rounded-xl border border-line bg-panel p-5">
        <div className="mb-4">
          <h1 className="font-head text-3xl font-bold uppercase text-txt">로그인</h1>
          <p className="mt-1 text-sm text-txt-soft">
            지금은 이름과 이메일로 라운딩 기록을 구분합니다. 이메일 인증 링크는 이후 연결 예정입니다.
          </p>
        </div>

        <div className="grid gap-3">
          <label className="block">
            <span className="mb-1 block font-head text-[11px] uppercase tracking-widest text-txt-faint">이름</span>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              className="w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none transition placeholder:text-txt-faint focus:border-accent" />
          </label>
          <label className="block">
            <span className="mb-1 block font-head text-[11px] uppercase tracking-widest text-txt-faint">이메일</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com" inputMode="email"
              className="w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none transition placeholder:text-txt-faint focus:border-accent" />
          </label>
        </div>

        {touched && !canSubmit && (
          <div className="mt-3 rounded-lg border border-[#ffb648]/40 bg-[#ffb648]/10 px-3 py-2 text-sm font-semibold text-[#ffb648]">
            이름과 올바른 이메일을 입력하세요.
          </div>
        )}
        {fallback && (
          <div className="mt-3 rounded-lg border border-[#ffb648]/40 bg-[#ffb648]/10 px-3 py-2 text-sm font-semibold text-[#ffb648]">
            서버 로그인이 연결되지 않아 이 브라우저에만 로그인 상태를 저장했습니다.
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <a href="/" className="text-sm font-semibold text-txt-soft transition hover:text-txt">홈으로</a>
          <button type="submit" disabled={busy}
            className="rounded-lg bg-accent px-5 py-2 font-head text-sm font-bold uppercase tracking-wide text-[#06210f] transition hover:bg-accent-2 disabled:opacity-60">
            {busy ? "처리 중..." : "로그인"}
          </button>
        </div>
      </form>
    </main>
  );
}
