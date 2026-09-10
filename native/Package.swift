// swift-tools-version: 5.10
import PackageDescription
let package = Package(name: "Lidzy", platforms: [.macOS(.v14)], products: [.executable(name: "Lidzy", targets: ["Lidzy"])], targets: [.executableTarget(name: "Lidzy"), .testTarget(name: "LidzyTests", dependencies: ["Lidzy"])])
