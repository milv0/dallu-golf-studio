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

export function progressZipFileName({ isScore3, isScore9 }) {
  const base = isScore3 ? "Hole3" : isScore9 ? "Hole9" : "Hole18";
  return `${base}-progress.zip`;
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

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes) {
  let c = 0xffffffff;
  for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u16(value) {
  const out = new Uint8Array(2);
  const view = new DataView(out.buffer);
  view.setUint16(0, value, true);
  return out;
}

function u32(value) {
  const out = new Uint8Array(4);
  const view = new DataView(out.buffer);
  view.setUint32(0, value >>> 0, true);
  return out;
}

function dosTimestamp(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = Math.max(date.getFullYear() - 1980, 0);
  const dosDate = (year << 9) | (month << 5) | day;
  return { time, date: dosDate };
}

export async function createZipBlob(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  const now = dosTimestamp();
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const data = new Uint8Array(await file.blob.arrayBuffer());
    const crc = crc32(data);
    const size = data.byteLength;
    const localHeader = [
      u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(now.time), u16(now.date),
      u32(crc), u32(size), u32(size), u16(nameBytes.length), u16(0), nameBytes,
    ];
    const localSize = localHeader.reduce((sum, part) => sum + part.byteLength, 0) + size;
    localParts.push(...localHeader, data);
    centralParts.push(
      u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(now.time), u16(now.date),
      u32(crc), u32(size), u32(size), u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0),
      u32(0), u32(offset), nameBytes,
    );
    offset += localSize;
  }

  const centralOffset = offset;
  const centralSize = centralParts.reduce((sum, part) => sum + part.byteLength, 0);
  const end = [
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
    u32(centralSize), u32(centralOffset), u16(0),
  ];
  return new Blob([...localParts, ...centralParts, ...end], { type: "application/zip" });
}
