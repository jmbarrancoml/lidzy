// swift-tools-version: 5.10
import PackageDescription
let package = Package(name: "Hinge", platforms: [.macOS(.v14)], products: [.executable(name: "Hinge", targets: ["Hinge"])], targets: [.executableTarget(name: "Hinge"), .testTarget(name: "HingeTests", dependencies: ["Hinge"])])
