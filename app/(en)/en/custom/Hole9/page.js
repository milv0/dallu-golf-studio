import StudioApp from "../../../../../components/studio/StudioApp";
import { pageMetadata } from "../../../../../lib/seo";

export const metadata = pageMetadata("/custom/Hole9", "en");

export default function CustomHole9PageEn() {
  return <StudioApp mode="score9" source="custom" />;
}
