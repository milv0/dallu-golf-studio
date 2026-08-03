import { redirect } from "next/navigation";
import LoginPage from "../../components/studio/LoginPage";
import { FEATURE_FLAGS } from "../../lib/features.js";

export default function LoginRoute() {
  if (!FEATURE_FLAGS.myRound) redirect("/");
  return <LoginPage />;
}
