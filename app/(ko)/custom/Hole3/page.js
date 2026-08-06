import StudioApp from "../../../../components/studio/StudioApp";
import { pageMetadata } from "../../../../lib/seo";

export const metadata = pageMetadata("/custom/Hole3", "ko");

export default function CustomHole3Page() {
  return <StudioApp mode="score3" source="custom" />;
}
