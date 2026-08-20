import "../globals.css";
import RootShell from "../../components/RootShell";
import { rootMetadata, rootViewport } from "../../lib/seo";

export const metadata = rootMetadata("ko");
export const viewport = rootViewport();

export default function KoRootLayout({ children }) {
  return <RootShell lang="ko">{children}</RootShell>;
}
