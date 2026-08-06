import "../globals.css";
import RootShell from "../../components/RootShell";
import { rootMetadata } from "../../lib/seo";

export const metadata = rootMetadata("en");

export default function EnRootLayout({ children }) {
  return <RootShell lang="en">{children}</RootShell>;
}
