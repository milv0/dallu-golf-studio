import { toPng } from "html-to-image";

export function exportFileName({ isHole, isScore3, isScore9 }) {
  if (isHole) return "Hole1.png";
  if (isScore3) return "Hole3.png";
  if (isScore9) return "Hole9.png";
  return "Hole18.png";
}

export function progressFileName({ isScore3, isScore9, step }) {
  const base = isScore3 ? "Hole3" : isScore9 ? "Hole9" : "Hole18";
  return `${base}-${String(step).padStart(2, "0")}.png`;
}

export async function createPngDataUrl({ node, size, scale }) {
  await document.fonts?.ready;
  return toPng(node, {
    canvasWidth: size.w * scale,
    canvasHeight: size.h * scale,
    width: size.w,
    height: size.h,
    backgroundColor: "rgba(0,0,0,0)",
    cacheBust: true,
    style: {
      background: "transparent",
      maxWidth: "none",
      width: `${size.w}px`,
      height: `${size.h}px`,
    },
  });
}

export async function dataUrlToFile(dataUrl, fileName) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: "image/png" });
}

export function downloadDataUrl(dataUrl, fileName) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  a.click();
}
