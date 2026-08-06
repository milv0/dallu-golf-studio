import StudioApp from "../../../../../components/studio/StudioApp";
import { pageMetadata } from "../../../../../lib/seo";

export const metadata = pageMetadata("/custom/Hole3", "en");

export default function CustomHole3PageEn() {
  return <StudioApp mode="score3" source="custom" />;
}
