"use client";

import { useState } from "react";

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
    <label className={"block " + (full ? "col-span-2" : "")}>
      <span className="mb-1 block font-head text-[11px] uppercase tracking-widest text-txt-faint">
        {label}
      </span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur} list={list} placeholder={placeholder}
        onClick={type === "date" ? (e) => { try { e.currentTarget.showPicker?.(); } catch {} } : undefined}
        className="w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none transition placeholder:text-txt-faint focus:border-accent [color-scheme:dark]" />
    </label>
  );
}

export function ClubAutocomplete({ value, onChange, onPick, options }) {
  const [open, setOpen] = useState(false);
  const q = (value || "").trim();
  const matches = q ? options.filter((o) => o.includes(q)).slice(0, 8) : [];
  return (
    <label className="relative col-span-2 block">
      <span className="mb-1 block font-head text-[11px] uppercase tracking-widest text-txt-faint">골프장</span>
      <input value={value} placeholder="골프장 이름 검색"
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none transition placeholder:text-txt-faint focus:border-accent" />
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
    <label className="col-span-2 block">
      <span className="mb-1 block font-head text-[11px] uppercase tracking-widest text-txt-faint">
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
        className="w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none transition placeholder:text-txt-faint focus:border-accent" />
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
