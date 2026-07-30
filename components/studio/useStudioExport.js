"use client";

import { useRef, useState } from "react";
import {
  createPngDataUrl,
  createZipBlob,
  dataUrlToFile,
  downloadBlob,
  downloadDataUrl,
  exportFileName,
  progressFileName,
  progressZipFileName,
} from "../../lib/exportImage";

function nextFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
  });
}

export default function useStudioExport({
  canExport,
  canBatchExport,
  batchProgressCount,
  size,
  exportScale,
  isHole,
  isScore3,
  isScore9,
  showToast,
}) {
  const [busy, setBusy] = useState(false);
  const [exportError, setExportError] = useState("");
  const [batchExportStep, setBatchExportStep] = useState(null);
  const captureRef = useRef(null);
  const batchCaptureRef = useRef(null);

  async function createExportImage() {
    if (!captureRef.current) return null;
    if (!canExport) return null;
    const exportNode = captureRef.current.querySelector("svg") || captureRef.current;
    return {
      dataUrl: await createPngDataUrl({ node: exportNode, size, scale: exportScale }),
      fileName: exportFileName({ isHole, isScore3, isScore9 }),
    };
  }

  async function handleExport() {
    setBusy(true);
    setExportError("");
    try {
      const image = await createExportImage();
      if (image) {
        downloadDataUrl(image.dataUrl, image.fileName);
        showToast("PNG 다운로드를 시작했습니다.");
      }
    } catch (e) {
      setExportError("내보내기 실패: " + e.message);
      showToast("내보내기 실패 — 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function handleBatchExport() {
    if (!canBatchExport) return;
    setBusy(true);
    try {
      const files = [];
      for (let step = 1; step <= batchProgressCount; step++) {
        setBatchExportStep(step);
        await nextFrame();
        const exportNode = batchCaptureRef.current?.querySelector("svg");
        if (!exportNode) throw new Error("진행 상태 내보내기 노드를 찾을 수 없습니다.");
        const dataUrl = await createPngDataUrl({ node: exportNode, size, scale: exportScale });
        const file = await dataUrlToFile(dataUrl, progressFileName({ isScore3, isScore9, step }));
        files.push({ name: file.name, blob: file });
      }
      const zip = await createZipBlob(files);
      downloadBlob(zip, progressZipFileName({ isScore3, isScore9 }));
      showToast(`홀별 이미지 ${batchProgressCount}장을 ZIP으로 저장합니다.`);
    } catch (e) {
      showToast("홀별 저장 실패: " + e.message);
    } finally {
      setBatchExportStep(null);
      setBusy(false);
    }
  }

  async function handleShareExport() {
    setBusy(true);
    try {
      const image = await createExportImage();
      if (!image) return;
      const file = await dataUrlToFile(image.dataUrl, image.fileName);
      const sharePayload = { files: [file], title: image.fileName };
      if (navigator.share && (!navigator.canShare || navigator.canShare(sharePayload))) {
        await navigator.share(sharePayload);
      } else {
        downloadDataUrl(image.dataUrl, image.fileName);
        showToast("공유 저장을 지원하지 않아 PNG 다운로드로 처리했습니다.");
      }
    } catch (e) {
      if (e?.name !== "AbortError") {
        showToast("공유 실패: " + e.message);
      }
    } finally {
      setBusy(false);
    }
  }

  return {
    busy,
    exportError,
    captureRef,
    batchCaptureRef,
    batchExportStep,
    handleExport,
    handleBatchExport,
    handleShareExport,
  };
}
