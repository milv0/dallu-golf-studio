"use client";

import { LangProvider } from "../../lib/i18n";
import { ThemeProvider } from "../../lib/themeContext";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <LangProvider>{children}</LangProvider>
    </ThemeProvider>
  );
}
