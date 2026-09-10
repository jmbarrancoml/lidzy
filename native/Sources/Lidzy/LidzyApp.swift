import SwiftUI
@main struct LidzyApp: App {
    @StateObject private var model = LidzyModel()
    var body: some Scene {
        MenuBarExtra("Lidzy", systemImage: "macbook") { MenuBarView(model: model) }.menuBarExtraStyle(.window)
        Settings { SettingsView(model: model).frame(width: 520, height: 420) }
    }
}
