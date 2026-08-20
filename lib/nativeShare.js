// Capacitor 앱의 PNG 공유 경로. WKWebView에서는 navigator.share의 파일 공유가
// 불안정하므로 캐시에 파일로 쓴 뒤 네이티브 공유 시트를 연다.
// 기본 Share 플러그인은 file URL을 일반 파일로 전달해 iOS가 '파일에 저장'만 보일 수 있다.
// 전용 브리지는 이를 UIImage로 열어 사진 앱의 '이미지 저장' 액션까지 제공한다.
import { registerPlugin } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";

const ImageShare = registerPlugin("ImageShare");

export async function shareImageNative({ dataUrl, fileName }) {
  const base64 = dataUrl.split(",")[1];
  const written = await Filesystem.writeFile({
    path: fileName,
    data: base64,
    directory: Directory.Cache,
  });
  await ImageShare.shareImage({ url: written.uri });
}
