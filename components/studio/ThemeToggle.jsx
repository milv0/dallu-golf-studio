"use client";

import { Moon, Sun } from "lucide-react";
import { useLang } from "../../lib/i18n";
import { useTheme } from "../../lib/themeContext";

export default function ThemeToggle({ className, iconSize = 18 }) {
  const { t } = useLang();
  const { theme, toggleTheme } = useTheme();
  const label = theme === "dark" ? t("theme.toLight") : t("theme.toDark");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={className || "flex h-10 w-10 items-center justify-center rounded-full border border-line bg-panel text-txt-soft transition hover:border-accent hover:text-txt active:scale-95"}
    >
      {theme === "dark"
        ? <Sun aria-hidden="true" size={iconSize} strokeWidth={2.2} />
        : <Moon aria-hidden="true" size={iconSize} strokeWidth={2.2} />}
    </button>
  );
}
