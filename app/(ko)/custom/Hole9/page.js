import StudioApp from "../../../../components/studio/StudioApp";
import { pageMetadata } from "../../../../lib/seo";

export const metadata = pageMetadata("/custom/Hole9", "ko");

export default function CustomHole9Page() {
  return <StudioApp mode="score9" source="custom" />;
}
