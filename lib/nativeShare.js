// Capacitor 앱의 PNG 공유 경로. WKWebView에서는 navigator.share의 파일 공유가
// 불안정하므로 캐시에 파일로 쓴 뒤 네이티브 공유 시트를 연다.
// 시트의 '이미지 저장'이 사진 앱 저장을 담당하므로 사진 보관함 권한 없이 저장 동선이 성립한다.
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export async function shareImageNative({ dataUrl, fileName }) {
  const base64 = dataUrl.split(",")[1];
  const written = await Filesystem.writeFile({
    path: fileName,
    data: base64,
    directory: Directory.Cache,
  });
  await Share.share({ files: [written.uri] });
}
