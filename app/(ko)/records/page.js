import { redirect } from "next/navigation";
import RoundRecords from "../../../components/studio/RoundRecords";
import { FEATURE_FLAGS } from "../../../lib/features.js";

export default function RecordsPage() {
  if (!FEATURE_FLAGS.myRound) redirect("/");
  return <RoundRecords />;
}
