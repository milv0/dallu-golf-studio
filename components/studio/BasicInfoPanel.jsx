import { ClubAutocomplete, Field } from "./StudioFields";
import { useLang } from "../../lib/i18n";

export default function BasicInfoPanel({ title, data, setMeta, clubNameList }) {
  const { t } = useLang();
  const displayTitle = title || t("info.title");
  return (
    <div className="rounded-xl border border-line bg-panel p-2.5 md:p-3">
      <div className="mb-1.5 font-head text-[11px] font-semibold uppercase tracking-widest text-txt-soft">
        {displayTitle}
      </div>
      <div className="flex flex-col gap-2">
        <Field label={t("info.player")} full value={data.player}
               onChange={(v) => setMeta("player", v)} placeholder="이름" />
        <ClubAutocomplete value={data.course} onChange={(v) => setMeta("course", v)}
          onPick={(v) => setMeta("course", v)} options={clubNameList} />
        <Field label={t("info.date")} type="date" value={data.date}
               onChange={(v) => setMeta("date", v)} />
      </div>
    </div>
  );
}
