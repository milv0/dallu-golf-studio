import StudioApp from "../../../../components/studio/StudioApp";
import { pageMetadata } from "../../../../lib/seo";

export const metadata = pageMetadata("/custom/Hole1", "ko");

export default function CustomHole1Page() {
  return <StudioApp mode="hole" source="custom" />;
}
