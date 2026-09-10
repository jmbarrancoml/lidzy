import SwiftUI
struct MenuBarView: View {
    @ObservedObject var model: HingeModel
    var body: some View { VStack(alignment: .leading, spacing: 16) { HStack { Label("Hinge", systemImage: "macbook").font(.headline); Spacer(); Text("\(Int(model.angle))°").monospacedDigit().foregroundStyle(.secondary) }; Toggle("Follow lid", isOn: $model.isEnabled); Picker("Style", selection: $model.style) { ForEach(EffectStyle.allCases) { Text($0.rawValue).tag($0) } }; Divider(); SettingsLink { Text("Settings…") }; Button("Quit Hinge") { NSApplication.shared.terminate(nil) } }.padding(16).frame(width: 270) }
}
struct SettingsView: View {
    @ObservedObject var model: HingeModel
    var body: some View { VStack(alignment: .leading, spacing: 24) { VStack(alignment: .leading, spacing: 5) { Text("Desktop movement").font(.title2.bold()); Text("Tune how your desktop responds as the lid moves.").foregroundStyle(.secondary) }; GroupBox { VStack(spacing: 18) { HStack { Text("Lid angle"); Spacer(); Text("\(Int(model.angle))°").monospacedDigit() }; Slider(value: $model.angle, in: 20...120) { Text("Lid angle") }.disabled(model.followsSensor); Toggle("Follow the built-in sensor", isOn: $model.followsSensor); Picker("Visual style", selection: $model.style) { ForEach(EffectStyle.allCases) { Text($0.rawValue).tag($0) } }.pickerStyle(.segmented) }.padding(8) }; HStack { Circle().fill(model.sensorAvailable ? .green : .orange).frame(width: 8, height: 8); Text(model.sensorAvailable ? "Lid sensor connected" : "Move the lid to detect its sensor").font(.callout).foregroundStyle(.secondary) }; Spacer() }.padding(28) }
}
