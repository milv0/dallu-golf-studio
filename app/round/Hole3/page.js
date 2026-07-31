import { redirect } from "next/navigation";
import StudioApp from "../../../components/studio/StudioApp";
import { FEATURE_FLAGS } from "../../../lib/features.js";

export default function RoundHole3Page() {
  if (!FEATURE_FLAGS.myRound) redirect("/");
  return <StudioApp mode="score3" source="round" />;
}
