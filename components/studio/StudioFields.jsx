"use client";

import { useState } from "react";
import { useLang } from "../../lib/i18n";

const CLUB_DEFAULTS = ["Driver", "Wood", "Hybrid", "Iron", "Wedge", "Putter"];
const CLUB_OPTIONS = [
  "Driver",
  "3 Wood", "5 Wood", "7 Wood",
  "2 Hybrid", "3 Hybrid", "4 Hybrid", "5 Hybrid", "6 Hybrid",
  "3 Iron", "4 Iron", "5 Iron", "6 Iron", "7 Iron", "8 Iron", "9 Iron", "10 Iron",
  "Pitching Wedge", "Gap Wedge", "Sand Wedge", "Lob Wedge",
  "Putter",
];

function clubSuggestions(value) {
  const q = String(value || "").trim().toLowerCase();
  if (!q) return CLUB_DEFAULTS;
  const number = q.match(/\d+/)?.[0];
  if (number) return [`${number} Wood`, `${number} Hybrid`, `${number} Iron`];
  const compact = q.replace(/\s+/g, "");
  return CLUB_OPTIONS.filter((club) => {
    const s = club.toLowerCase();
    return s.includes(q) || s.replace(/\s+/g, "").includes(compact);
  }).slice(0, 6);
}

function normalizeClubValue(value) {
  const trimmed = String(value || "").trim();
  if (!/^\d+$/.test(trimmed)) return trimmed;
  const n = Number(trimmed);
  return n >= 3 && n <= 10 ? `${n} Iron` : trimmed;
}

export function Field({ label, value, onChange, onBlur, placeholder, full, type = "text", list }) {
  return (
    <label className={"block min-w-0 " + (full ? "md:col-span-2" : "")}>
      <span className="mb-0.5 block font-head text-[10px] uppercase tracking-widest text-txt-faint md:mb-1 md:text-[11px]">
        {label}
      </span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur} list={list} placeholder={placeholder}
        onClick={type === "date" ? (e) => { try { e.currentTarget.showPicker?.(); } catch {} } : undefined}
        className="min-w-0 max-w-full w-full rounded-lg border border-line-2 bg-panel-2 px-2.5 py-1.5 text-sm text-txt outline-none transition placeholder:text-txt-faint focus:border-accent md:px-3 md:py-2 [color-scheme:dark]" />
    </label>
  );
}

export function ClubAutocomplete({ value, onChange, onPick, options }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const q = (value || "").trim();
  const matches = q ? options.filter((o) => o.includes(q)).slice(0, 8) : [];
  return (
    <label className="relative block min-w-0 md:col-span-2">
      <span className="mb-0.5 block font-head text-[10px] uppercase tracking-widest text-txt-faint md:mb-1 md:text-[11px]">{t("field.course")}</span>
      <input value={value} placeholder={t("field.coursePlaceholder")}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="min-w-0 max-w-full w-full rounded-lg border border-line-2 bg-panel-2 px-2.5 py-1.5 text-sm text-txt outline-none transition placeholder:text-txt-faint focus:border-accent md:px-3 md:py-2" />
      {open && matches.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-line-2 bg-panel shadow-lg">
          {matches.map((m) => (
            <li key={m}>
              <button type="button" onMouseDown={() => { (onPick || onChange)(m); setOpen(false); }}
                className="block w-full px-3 py-2 text-left text-sm text-txt hover:bg-panel-2">
                {m}
              </button>
            </li>
          ))}
        </ul>
      )}
    </label>
  );
}

export function ClubField({ value, onChange }) {
  const suggestions = clubSuggestions(value);
  return (
    <label className="block min-w-0 md:col-span-2">
      <span className="mb-0.5 block font-head text-[10px] uppercase tracking-widest text-txt-faint md:mb-1 md:text-[11px]">
        선택 클럽
      </span>
      <input value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onChange(normalizeClubValue(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onChange(normalizeClubValue(e.currentTarget.value));
            e.currentTarget.blur();
          }
        }}
        placeholder="3, Driver, Putter"
        className="min-w-0 max-w-full w-full rounded-lg border border-line-2 bg-panel-2 px-2.5 py-1.5 text-sm text-txt outline-none transition placeholder:text-txt-faint focus:border-accent md:px-3 md:py-2" />
      <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
        {suggestions.map((club) => (
          <button key={club} type="button" onClick={() => onChange(club)}
            className={"shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition " +
              (String(value).toLowerCase() === club.toLowerCase()
                ? "border-accent bg-accent text-[#06210f]"
                : "border-line bg-panel-2 text-txt-soft hover:border-accent hover:text-txt")}>
            {club}
          </button>
        ))}
      </div>
    </label>
  );
}
