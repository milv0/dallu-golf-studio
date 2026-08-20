import "../globals.css";
import RootShell from "../../components/RootShell";
import { rootMetadata, rootViewport } from "../../lib/seo";

export const metadata = rootMetadata("en");
export const viewport = rootViewport();

export default function EnRootLayout({ children }) {
  return <RootShell lang="en">{children}</RootShell>;
}
