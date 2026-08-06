"use client";

import { LangProvider } from "../../lib/i18n";
import { ThemeProvider } from "../../lib/themeContext";

export default function Providers({ children, lang }) {
  return (
    <ThemeProvider>
      <LangProvider lang={lang}>{children}</LangProvider>
    </ThemeProvider>
  );
}
