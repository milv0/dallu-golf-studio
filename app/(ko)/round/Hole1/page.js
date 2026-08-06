import { redirect } from "next/navigation";
import StudioApp from "../../../../components/studio/StudioApp";
import { FEATURE_FLAGS } from "../../../../lib/features.js";

export default function RoundHolePage() {
  if (!FEATURE_FLAGS.myRound) redirect("/");
  return <StudioApp mode="hole" source="round" />;
}
