import StudioApp from "../../components/studio/StudioApp";
import JsonLd from "../../components/JsonLd";
import { pageMetadata, webAppJsonLd } from "../../lib/seo";

export const metadata = pageMetadata("/", "ko");

export default function HomePage() {
  return (
    <>
      <JsonLd data={webAppJsonLd("ko")} />
      <StudioApp mode="home" />
    </>
  );
}
