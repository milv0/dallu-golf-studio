"use client";

export default function CoursePresets({ builtin = [], favorites = [], selectedClub = "", dbStatus, disabled = false, onRefresh, onToggleFav, onLoad }) {
  const clubs = [...new Set(builtin.map((c) => c.club || c.name))];
  const sel = (selectedClub || "").trim();
  const activeClub = clubs.includes(sel) ? sel : "";
  const clubCourses = builtin.filter((c) => (c.club || c.name) === activeClub);
  const favCourses = builtin.filter((c) => favorites.includes(c.name));
  const courseLabel = (c) => (c.out && c.in ? `${c.out}+${c.in}` : c.out || c.name);
  const courseMeta = (c) => c.holes === 9 ? "9H · OUT/IN 반복" : "18H";

  const Star = ({ name }) => (
    <button type="button" onClick={(e) => { e.stopPropagation(); onToggleFav(name); }}
      className="px-1 text-sm"
      style={{ color: favorites.includes(name) ? "#ffb648" : "var(--color-txt-faint)" }}
      title="즐겨찾기">★</button>
  );

  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">코스</div>
        {!disabled && onRefresh && (
          <button type="button" onClick={onRefresh} title="코스 목록 새로고침"
            className="flex items-center gap-1.5 rounded-md border border-line bg-panel-2 px-2 py-1 text-[11px] font-semibold text-txt-faint transition hover:text-txt">
            <span className={"inline-block h-1.5 w-1.5 rounded-full " +
              (dbStatus?.state === "online" ? "bg-accent" : dbStatus?.state === "offline" ? "bg-[#ffb648]" : "bg-txt-faint animate-pulse")} />
            {dbStatus?.state === "online" ? dbStatus.count : dbStatus?.state === "offline" ? "캐시" : "동기화"}
            <span>↻</span>
          </button>
        )}
      </div>

      {disabled ? (
        <div className="rounded-lg border border-line bg-panel-2 px-3 py-3 text-[12px] leading-relaxed text-txt-soft">
          코스 자동 불러오기는 현재 비활성화되어 있습니다. 홀별 PAR는 아래 스코어 입력에서 직접 입력하세요.
        </div>
      ) : favCourses.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 text-[11px] uppercase tracking-widest text-[#ffb648]">★ 즐겨찾기</div>
          <div className="flex flex-wrap gap-2">
            {favCourses.map((c) => (
              <span key={c.name} className="flex items-center gap-0.5 rounded-full border border-line-2 bg-panel-2 py-1 pl-3 pr-1 text-sm">
                <button type="button" onClick={() => onLoad(c)} className="text-txt hover:text-accent">
                  {c.name}
                  <span className="ml-1 font-mono text-[10px] text-txt-faint">{courseMeta(c)}</span>
                </button>
                <Star name={c.name} />
              </span>
            ))}
          </div>
        </div>
      )}

      {!disabled && (!activeClub ? (
        <p className="text-[12px] text-txt-faint">기본 정보에서 <b className="text-txt-soft">골프장을 선택</b>하면 코스가 표시됩니다.</p>
      ) : clubCourses.length === 0 ? (
        <p className="text-[12px] text-txt-faint">{activeClub} · 등록된 코스가 없습니다.</p>
      ) : (
        <div>
          <div className="mb-1.5 text-[12px] text-txt-soft">{activeClub} · 코스 선택</div>
          <div className="flex flex-col gap-1.5">
            {clubCourses.map((c) => (
              <div key={c.name} className="flex items-center justify-between gap-2 rounded-lg border border-line-2 bg-panel-2 py-1.5 pl-3 pr-1.5 text-sm">
                <button type="button" onClick={() => onLoad(c)} className="flex-1 text-left font-semibold text-txt hover:text-accent">
                  {courseLabel(c)}
                  <span className="ml-2 font-mono text-[10px] font-medium text-txt-faint">{courseMeta(c)}</span>
                </button>
                <Star name={c.name} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
