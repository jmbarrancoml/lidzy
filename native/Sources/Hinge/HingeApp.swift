import SwiftUI
@main struct HingeApp: App {
    @StateObject private var model = HingeModel()
    var body: some Scene {
        MenuBarExtra("Hinge", systemImage: "macbook") { MenuBarView(model: model) }.menuBarExtraStyle(.window)
        Settings { SettingsView(model: model).frame(width: 520, height: 420) }
    }
}
