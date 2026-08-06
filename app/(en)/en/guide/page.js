import GuidePage from "../../../../components/studio/GuidePage";
import JsonLd from "../../../../components/JsonLd";
import { guideFor } from "../../../../lib/guideContent";
import { faqJsonLd, pageMetadata } from "../../../../lib/seo";

export const metadata = pageMetadata("/guide", "en");

export default function GuideEn() {
  return (
    <>
      <JsonLd data={faqJsonLd(guideFor("en"))} />
      <GuidePage />
    </>
  );
}
