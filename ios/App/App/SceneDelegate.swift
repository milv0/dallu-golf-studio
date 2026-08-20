import UIKit
import Photos
import Capacitor

// 웹 감싼 티를 줄이는 WebView 설정.
// - 스와이프 제스처로 화면 뒤로가기 (iOS 표준 내비게이션 관성)
// - 고무줄 바운스 제거 (네이티브 앱은 화면 끝에서 튕기지 않는다)
class AppBridgeViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        webView?.allowsBackForwardNavigationGestures = true
        webView?.scrollView.bounces = false
    }

    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(ImageSharePlugin())
    }
}

// file URL 자체를 공유하면 iOS가 범용 파일로 취급해 '파일에 저장'만 보여줄 수 있다.
// 앱 전용 활동은 사진 추가 권한을 받은 뒤 UIImage를 사진 보관함에 직접 저장한다.
private final class SaveImageActivity: UIActivity {
    static let type = UIActivity.ActivityType("com.dallugolf.golfscorecardmaker.saveImage")
    private var image: UIImage?

    override var activityType: UIActivity.ActivityType? { Self.type }
    override var activityTitle: String? { "사진에 저장" }
    override var activityImage: UIImage? { UIImage(systemName: "photo.badge.arrow.down") }
    override class var activityCategory: UIActivity.Category { .share }

    override func canPerform(withActivityItems activityItems: [Any]) -> Bool {
        activityItems.contains { $0 is UIImage }
    }

    override func prepare(withActivityItems activityItems: [Any]) {
        image = activityItems.first { $0 is UIImage } as? UIImage
    }

    override func perform() {
        guard let image else {
            activityDidFinish(false)
            return
        }

        switch PHPhotoLibrary.authorizationStatus(for: .addOnly) {
        case .authorized, .limited:
            save(image)
        case .notDetermined:
            PHPhotoLibrary.requestAuthorization(for: .addOnly) { [weak self] status in
                DispatchQueue.main.async {
                    guard status == .authorized || status == .limited else {
                        self?.activityDidFinish(false)
                        return
                    }
                    self?.save(image)
                }
            }
        default:
            activityDidFinish(false)
        }
    }

    private func save(_ image: UIImage) {
        PHPhotoLibrary.shared().performChanges({
            PHAssetChangeRequest.creationRequestForAsset(from: image)
        }) { [weak self] success, error in
            DispatchQueue.main.async {
                self?.activityDidFinish(success && error == nil)
            }
        }
    }
}

@objc(ImageSharePlugin)
class ImageSharePlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "ImageSharePlugin"
    let jsName = "ImageShare"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "shareImage", returnType: CAPPluginReturnPromise)
    ]

    @objc func shareImage(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"),
              let url = URL(string: urlString),
              url.isFileURL,
              let image = UIImage(contentsOfFile: url.path) else {
            call.reject("공유할 PNG 파일을 열 수 없습니다.")
            return
        }

        DispatchQueue.main.async { [weak self] in
            guard let viewController = self?.bridge?.viewController else {
                call.reject("공유 화면을 열 수 없습니다.")
                return
            }
            guard viewController.presentedViewController == nil else {
                call.reject("이미 공유 화면이 열려 있습니다.")
                return
            }

            let activityController = UIActivityViewController(
                activityItems: [image],
                applicationActivities: [SaveImageActivity()]
            )
            activityController.completionWithItemsHandler = { activityType, completed, _, error in
                if let error {
                    call.reject("이미지 공유에 실패했습니다.", nil, error)
                } else if completed {
                    call.resolve()
                } else if activityType == SaveImageActivity.type {
                    call.reject("사진 앱 저장에 실패했습니다.")
                } else {
                    call.reject("Share canceled")
                }
            }
            if let popover = activityController.popoverPresentationController {
                popover.sourceView = viewController.view
                popover.sourceRect = viewController.view.bounds
                popover.permittedArrowDirections = []
            }
            viewController.present(activityController, animated: true)
        }
    }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = AppBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
