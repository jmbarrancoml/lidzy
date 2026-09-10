# Hinge

Hinge is an open-source macOS utility that makes your desktop respond to the physical angle of your MacBook lid. The repository contains the native Swift app and its interactive website.

## Status

Hinge is an early technical preview. The native app reads the undocumented lid-angle HID sensor, captures the desktop with ScreenCaptureKit and renders a click-through perspective overlay while the lid moves.

The sensor uses an undocumented HID report and may stop working after a macOS update. Screen capture stays in memory and Hinge never saves or uploads frames.

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
swift run Hinge
```

macOS asks for Screen Recording permission on first launch. Quit and reopen Hinge after granting it.

## Project layout

- `src/`: Next.js website and interactive browser demo
- `native/`: SwiftUI menu bar app, sensor reader and ScreenCaptureKit compositor

## Acknowledgements

The sensor implementation builds on the HID discovery documented by [Sam Henri Gold's LidAngleSensor](https://github.com/samhenrigold/LidAngleSensor).

## License

[MIT](LICENSE)
