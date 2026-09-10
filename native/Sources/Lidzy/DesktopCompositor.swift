import AppKit
import CoreImage
import CoreMedia
import ScreenCaptureKit

@MainActor
final class DesktopCompositor: NSObject, SCStreamOutput {
    private let imageView = NSImageView()
    private let context = CIContext(options: [.useSoftwareRenderer: false])
    private var overlay: NSWindow?
    private var stream: SCStream?
    private var latestImage: CGImage?
    private var isStarting = false
    private var currentValues = EffectValues.values(for: 120, style: .silk)
    private var effectIsActive = false
    private var captureWanted = false

    func setCaptureEnabled(_ enabled: Bool) async {
        captureWanted = enabled
        if enabled {
            await start()
            if !captureWanted { await stop() }
        } else {
            await stop()
            if captureWanted { await start() }
        }
    }

    private func start() async {
        guard stream == nil, !isStarting else { return }
        isStarting = true
        defer { isStarting = false }

        do {
            guard let screen = NSScreen.main else { return }
            let overlay = self.overlay ?? makeOverlay(on: screen)
            self.overlay = overlay
            let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: true)
            let screenID = screen.deviceDescription[NSDeviceDescriptionKey("NSScreenNumber")] as? CGDirectDisplayID
            guard let display = content.displays.first(where: { $0.displayID == screenID }) ?? content.displays.first else { return }
            let overlayWindow = content.windows.first(where: { Int($0.windowID) == overlay.windowNumber })
            let filter = SCContentFilter(display: display, excludingWindows: overlayWindow.map { [$0] } ?? [])
            let configuration = SCStreamConfiguration()
            configuration.width = display.width
            configuration.height = display.height
            configuration.minimumFrameInterval = CMTime(value: 1, timescale: 30)
            configuration.queueDepth = 3
            configuration.showsCursor = true
            configuration.pixelFormat = kCVPixelFormatType_32BGRA

            let stream = SCStream(filter: filter, configuration: configuration, delegate: nil)
            try stream.addStreamOutput(self, type: .screen, sampleHandlerQueue: DispatchQueue(label: "app.lidzy.capture", qos: .userInteractive))
            try await stream.startCapture()
            self.stream = stream
        } catch {
            NSLog("Lidzy could not start screen capture: %@", error.localizedDescription)
        }
    }

    private func stop() async {
        guard let stream else { return }
        try? await stream.stopCapture()
        self.stream = nil
        effectIsActive = false
        hide()
    }

    nonisolated func stream(_ stream: SCStream, didOutputSampleBuffer sampleBuffer: CMSampleBuffer, of type: SCStreamOutputType) {
        guard type == .screen, sampleBuffer.isValid, let pixelBuffer = sampleBuffer.imageBuffer else { return }
        let retained = Unmanaged.passRetained(pixelBuffer)
        Task { @MainActor [weak self] in
            let pixelBuffer = retained.takeRetainedValue()
            guard let self else { return }
            let image = CIImage(cvPixelBuffer: pixelBuffer)
            self.latestImage = self.context.createCGImage(image, from: image.extent)
            self.renderLatest()
        }
    }

    func update(values: EffectValues, active: Bool) {
        currentValues = values
        effectIsActive = active
        renderLatest()
    }

    private func renderLatest() {
        guard effectIsActive, let image = latestImage, let screen = NSScreen.main else {
            hide()
            return
        }
        let window = overlay ?? makeOverlay(on: screen)
        if overlay == nil { overlay = window }
        imageView.image = NSImage(cgImage: image, size: screen.frame.size)

        var transform = CATransform3DIdentity
        transform.m34 = -1 / 900
        let tilt = (1 - currentValues.perspective) * .pi * 0.72
        transform = CATransform3DRotate(transform, tilt, 1, 0, 0)
        transform = CATransform3DScale(transform, currentValues.perspective, currentValues.perspective, 1)
        imageView.layer?.anchorPoint = CGPoint(x: 0.5, y: 0)
        imageView.layer?.position = CGPoint(x: screen.frame.width / 2, y: screen.frame.height)
        imageView.layer?.transform = transform
        imageView.layer?.filters = currentValues.blur > 0.5 ? [makeBlur(radius: currentValues.blur)] : []
        imageView.layer?.opacity = Float(1 - currentValues.shade)
        window.orderFrontRegardless()
    }

    private func makeOverlay(on screen: NSScreen) -> NSWindow {
        let window = NSWindow(contentRect: screen.frame, styleMask: .borderless, backing: .buffered, defer: false, screen: screen)
        window.level = .screenSaver
        window.backgroundColor = .black
        window.isOpaque = true
        window.ignoresMouseEvents = true
        window.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary]
        window.sharingType = .none
        imageView.frame = NSRect(origin: .zero, size: screen.frame.size)
        imageView.imageScaling = .scaleAxesIndependently
        imageView.wantsLayer = true
        window.contentView = imageView
        return window
    }

    private func makeBlur(radius: Double) -> CIFilter {
        let filter = CIFilter(name: "CIGaussianBlur")!
        filter.setValue(radius, forKey: kCIInputRadiusKey)
        filter.name = "lidzyBlur"
        return filter
    }

    private func hide() {
        overlay?.orderOut(nil)
    }
}
