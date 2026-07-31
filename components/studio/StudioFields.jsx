"use client";

import { useState } from "react";
import { useLang } from "../../lib/i18n";
import { selectInputText } from "./ScoreInputs";

const CLUB_DEFAULTS = ["Driver", "Wood", "Hybrid", "Iron", "Wedge", "Putter"];
const CLUB_OPTIONS = [
  "Driver",
  "3 Wood", "5 Wood", "7 Wood",
  "2 Hybrid", "3 Hybrid", "4 Hybrid", "5 Hybrid", "6 Hybrid",
  "3 Iron", "4 Iron", "5 Iron", "6 Iron", "7 Iron", "8 Iron", "9 Iron", "10 Iron",
  "Pitching Wedge", "Gap Wedge", "Sand Wedge", "Lob Wedge",
  "Putter",
];

export function PlayerNameControl({ value, onChange, maxLength = 7, placeholder = "PLAYER" }) {
  const { t } = useLang();
  return (
    <label className="flex w-[128px] shrink-0 items-center gap-2 rounded-lg border border-line bg-panel-2 px-2 py-1">
      <span className="font-head text-[10px] font-semibold uppercase tracking-widest text-txt-faint">
        {t("label.name")}
      </span>
      <input
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-right font-head text-sm font-bold uppercase text-txt outline-none placeholder:text-txt-faint"
      />
    </label>
  );
}

export function UnitToggle({ value = "m", onChange }) {
  return (
    <div className="flex overflow-hidden rounded-md border border-line">
      {[["m", "M"], ["yd", "YD"]].map(([unit, label]) => (
        <button
          key={unit}
          type="button"
          onClick={() => onChange(unit)}
          className={"px-2.5 py-1 text-[11px] font-bold transition " +
            (value === unit
              ? "bg-accent text-[#06210f]"
              : "bg-panel-2 text-txt-soft hover:text-txt")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

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

export function Field({ label, value, onChange, onBlur, placeholder, full, type = "text", list, maxLength }) {
  return (
    <label className={"block min-w-0 " + (full ? "md:col-span-2" : "")}>
      <span className="mb-0.5 block font-head text-[10px] uppercase tracking-widest text-txt-faint md:mb-1 md:text-[11px]">
        {label}
      </span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur} list={list} placeholder={placeholder} maxLength={maxLength}
        onClick={type === "date" ? (e) => { try { e.currentTarget.showPicker?.(); } catch {} } : undefined}
        className="min-w-0 max-w-full w-full rounded-lg border border-line-2 bg-panel-2 px-2.5 py-1.5 text-sm text-txt outline-none transition placeholder:text-txt-faint focus:border-accent md:px-3 md:py-2" />
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
  const { t } = useLang();
  const suggestions = clubSuggestions(value);
  return (
    <label className="block min-w-0 md:col-span-2">
      <span className="mb-0.5 block font-head text-[10px] uppercase tracking-widest text-txt-faint md:mb-1 md:text-[11px]">
        {t("field.club")}
      </span>
      <input value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={selectInputText}
        onClick={selectInputText}
        onBlur={(e) => onChange(normalizeClubValue(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onChange(normalizeClubValue(e.currentTarget.value));
            e.currentTarget.blur();
          }
        }}
        placeholder="3, Driver, Putter"
        className="min-w-0 max-w-full w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2.5 text-sm text-txt outline-none transition placeholder:text-txt-faint focus:border-accent md:px-3 md:py-2.5" />
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
