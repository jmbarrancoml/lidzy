# Lidzy

Lidzy is an open-source macOS utility that makes your desktop respond to the physical angle of your MacBook lid. The repository contains the native Swift app and its interactive website.

## Status

Lidzy is an early technical preview. The native app reads the undocumented lid-angle HID sensor, captures the desktop with ScreenCaptureKit and renders a click-through perspective overlay while the lid moves.

The sensor uses an undocumented HID report and may stop working after a macOS update. Screen capture stays in memory and Lidzy never saves or uploads frames.

## Requirements

- macOS 14 Sonoma or later
- Apple silicon MacBook with a lid-angle sensor
- Xcode 16 or a Swift 5.10 toolchain
- Screen Recording permission

## Run the website

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Run the native preview

```bash
cd native
swift run Lidzy
```

macOS asks for Screen Recording permission on first launch. Quit and reopen Lidzy after granting it.

## Install a release

1. Download `Lidzy-0.1.0-macos.zip` from [Releases](https://github.com/jmbarrancoml/lidzy/releases).
2. Extract the archive and drag `Lidzy.app` into Applications.
3. Control-click Lidzy and choose **Open** on the first launch. The current preview uses ad-hoc signing.
4. Allow Screen Recording in **System Settings → Privacy & Security → Screen Recording**.
5. Quit and reopen Lidzy. Its MacBook icon appears in the menu bar.
6. Open the menu and switch on **Follow lid**. Lidzy starts capture only while the lid is below the effect threshold.

Open the menu bar item to pause the effect, select Silk, Shade or Frost, and open Settings. Move the lid slowly to see the desktop follow it. Press **Quit Lidzy** from the menu when you finish.

## Project layout

- `src/`: Next.js website and interactive browser demo
- `native/`: SwiftUI menu bar app, sensor reader and ScreenCaptureKit compositor

## Acknowledgements

The sensor implementation builds on the HID discovery documented by [Sam Henri Gold's LidAngleSensor](https://github.com/samhenrigold/LidAngleSensor).

## License

[MIT](LICENSE)
