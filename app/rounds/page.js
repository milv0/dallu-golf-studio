import { redirect } from "next/navigation";
import { FEATURE_FLAGS } from "../../lib/features.js";

export default function RoundsPage() {
  redirect(FEATURE_FLAGS.myRound ? "/round" : "/");
}
