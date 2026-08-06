import StudioApp from "../../../components/studio/StudioApp";
import JsonLd from "../../../components/JsonLd";
import { pageMetadata, webAppJsonLd } from "../../../lib/seo";

export const metadata = pageMetadata("/", "en");

export default function HomePageEn() {
  return (
    <>
      <JsonLd data={webAppJsonLd("en")} />
      <StudioApp mode="home" />
    </>
  );
}
