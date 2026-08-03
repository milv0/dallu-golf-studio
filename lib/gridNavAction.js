// 키 입력 → 이동 동작 결정만 담당하는 순수 함수. useGridNav가 이 결과로 focus를 옮긴다.
// null을 반환하면 브라우저 기본 동작을 그대로 둔다(마지막 칸의 Tab이 포커스를 빠져나갈 수 있게).
export function gridNavAction({ key, shiftKey = false, idx, hasNext, hasUp = false, hasDown = false }) {
  if (key === "ArrowLeft") return idx > 0 ? "prev" : null;
  if (key === "ArrowRight" || key === "Enter") return hasNext ? "next" : null;
  if (key === "Tab") return !shiftKey && hasNext ? "next" : null;
  if (key === "ArrowUp") return hasUp ? "up" : null;
  if (key === "ArrowDown") return hasDown ? "down" : null;
  return null;
}
