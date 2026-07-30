import { ClubAutocomplete, Field } from "./StudioFields";

export default function BasicInfoPanel({ title = "기본 정보", data, setMeta, clubNameList }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-2.5 md:p-3">
      <div className="mb-1.5 font-head text-[11px] font-semibold uppercase tracking-widest text-txt-soft">
        {title}
      </div>
      <div className="flex flex-col gap-2">
        <Field label="선수" full value={data.player}
               onChange={(v) => setMeta("player", v)} placeholder="이름" />
        <ClubAutocomplete value={data.course} onChange={(v) => setMeta("course", v)}
          onPick={(v) => setMeta("course", v)} options={clubNameList} />
        <Field label="날짜" type="date" value={data.date}
               onChange={(v) => setMeta("date", v)} />
      </div>
    </div>
  );
}
