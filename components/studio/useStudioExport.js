"use client";

import { useRef, useState } from "react";
import {
  createPngDataUrl,
  createZipBlob,
  dataUrlToFile,
  downloadBlob,
  downloadDataUrl,
  exportFileName,
  isShareCancelError,
  progressFileName,
  progressZipFileName,
} from "../../lib/exportImage";
import { isNativeApp } from "../../lib/nativePlatform";
import { useLang } from "../../lib/i18n";

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
  const { t } = useLang();
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
        showToast(t("toast.downloadStart"));
      }
    } catch {
      setExportError(t("toast.exportFail"));
      showToast(t("toast.exportFail"));
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
      showToast(t("toast.batchDone", { n: batchProgressCount }));
    } catch {
      showToast(t("toast.batchFail"));
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
      // Capacitor 앱: 파일 기반 네이티브 공유 시트. 플러그인은 앱에서만 필요하므로 동적 import.
      if (isNativeApp()) {
        const { shareImageNative } = await import("../../lib/nativeShare");
        await shareImageNative(image);
        return;
      }
      const file = await dataUrlToFile(image.dataUrl, image.fileName);
      const sharePayload = { files: [file], title: image.fileName };
      if (navigator.share && (!navigator.canShare || navigator.canShare(sharePayload))) {
        await navigator.share(sharePayload);
      } else {
        downloadDataUrl(image.dataUrl, image.fileName);
        showToast(t("toast.shareUnsupported"));
      }
    } catch (e) {
      if (!isShareCancelError(e)) {
        showToast(t("toast.shareFail"));
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
