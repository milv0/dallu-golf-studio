import StudioApp from "../../../../../components/studio/StudioApp";
import { pageMetadata } from "../../../../../lib/seo";

export const metadata = pageMetadata("/custom/Hole1", "en");

export default function CustomHole1PageEn() {
  return <StudioApp mode="hole" source="custom" />;
}
