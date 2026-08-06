import StudioApp from "../../../../../components/studio/StudioApp";
import { pageMetadata } from "../../../../../lib/seo";

export const metadata = pageMetadata("/custom/Hole18", "en");

export default function CustomHole18PageEn() {
  return <StudioApp mode="score18" source="custom" />;
}
