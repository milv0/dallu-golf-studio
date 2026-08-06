import StudioApp from "../../../../components/studio/StudioApp";
import { pageMetadata } from "../../../../lib/seo";

export const metadata = pageMetadata("/custom/Hole18", "ko");

export default function CustomHole18Page() {
  return <StudioApp mode="score18" source="custom" />;
}
