import Foundation
import IOKit.hid
import CoreGraphics

enum EffectStyle: String, CaseIterable, Identifiable { case silk = "Silk", shade = "Shade", frost = "Frost"; var id: Self { self } }
struct EffectValues: Equatable {
    let perspective: Double; let blur: Double; let shade: Double
    static func values(for angle: Double, style: EffectStyle) -> EffectValues {
        let progress = max(0, min(1, angle / 120))
        return EffectValues(perspective: 0.72 + progress * 0.28, blur: style == .frost ? (1 - progress) * 24 : (1 - progress) * 5, shade: style == .shade ? (1 - progress) * 0.68 : (1 - progress) * 0.36)
    }
}
@MainActor final class LidzyModel: ObservableObject {
    @Published var angle = 90.0 { didSet { applyEffect() } }
    @Published var isEnabled = false {
        didSet {
            if isEnabled && !CGPreflightScreenCaptureAccess() {
                CGRequestScreenCaptureAccess()
            }
            applyEffect()
        }
    }
    @Published var style: EffectStyle = .silk { didSet { applyEffect() } }
    @Published var followsSensor = true
    @Published var sensorAvailable = false
    private let sensor = LidAngleSensor()
    private let compositor = DesktopCompositor()
    private var captureIsRequested = false
    init() {
        sensor.onAngle = { [weak self] angle in Task { @MainActor in guard let self, self.followsSensor else { return }; self.sensorAvailable = true; self.angle = angle } }
        sensor.start()
    }
    private func applyEffect() {
        let values = EffectValues.values(for: angle, style: style)
        let shouldCapture = isEnabled && angle < 112
        compositor.update(values: values, active: shouldCapture)
        if shouldCapture != captureIsRequested {
            captureIsRequested = shouldCapture
            Task { await compositor.setCaptureEnabled(shouldCapture) }
        }
    }
}
final class LidAngleSensor {
    var onAngle: ((Double) -> Void)?
    private var manager: IOHIDManager?
    private var device: IOHIDDevice?
    private var timer: Timer?
    func start() {
        let manager = IOHIDManagerCreate(kCFAllocatorDefault, IOOptionBits(kIOHIDOptionsTypeNone))
        let matching: [String: Any] = [kIOHIDVendorIDKey: 0x05AC, kIOHIDPrimaryUsagePageKey: 0x20, kIOHIDPrimaryUsageKey: 0x8A]
        IOHIDManagerSetDeviceMatching(manager, matching as CFDictionary)
        IOHIDManagerRegisterDeviceMatchingCallback(manager, { context, _, _, device in
            guard let context else { return }
            let sensor = Unmanaged<LidAngleSensor>.fromOpaque(context).takeUnretainedValue()
            sensor.device = device
            sensor.beginPolling()
        }, Unmanaged.passUnretained(self).toOpaque())
        IOHIDManagerScheduleWithRunLoop(manager, CFRunLoopGetMain(), CFRunLoopMode.defaultMode.rawValue); IOHIDManagerOpen(manager, IOOptionBits(kIOHIDOptionsTypeNone)); self.manager = manager
    }

    private func beginPolling() {
        guard timer == nil else { return }
        timer = .scheduledTimer(withTimeInterval: 1.0 / 30.0, repeats: true) { [weak self] _ in self?.read() }
    }

    private func read() {
        guard let device else { return }
        var report = [UInt8](repeating: 0, count: 8); var length = report.count
        let result = IOHIDDeviceGetReport(device, kIOHIDReportTypeFeature, 1, &report, &length)
        guard result == kIOReturnSuccess, length >= 3 else { return }
        let raw = UInt16(report[1]) | UInt16(report[2]) << 8
        onAngle?(min(180, max(0, Double(raw))))
    }
}
