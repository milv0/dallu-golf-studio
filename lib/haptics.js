// Capacitor 앱 전용 햅틱. 웹에서는 아무 일도 하지 않으므로 호출부가 분기할 필요 없다.
// 실패해도 UX가 깨지면 안 되는 부가 피드백이라 조용히 무시한다.
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { isNativeApp } from "./nativePlatform.js";

// 스코어 입력처럼 잦은 상호작용용 — 가장 가벼운 톡.
export async function hapticTap() {
  if (!isNativeApp()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {}
}

// 공유·저장 완료처럼 작업이 끝났을 때의 성공 알림.
export async function hapticSuccess() {
  if (!isNativeApp()) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {}
}
