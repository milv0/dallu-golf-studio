import "../globals.css";
import RootShell from "../../components/RootShell";
import { rootMetadata } from "../../lib/seo";

export const metadata = rootMetadata("ko");

export default function KoRootLayout({ children }) {
  return <RootShell lang="ko">{children}</RootShell>;
}
