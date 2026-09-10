#!/bin/sh
set -eu

project_root=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
build_root=$(mktemp -d "${TMPDIR:-/tmp}/lidzy-build.XXXXXX")
trap 'rm -rf "$build_root"' EXIT

swift build -c release --package-path "$project_root/native" --scratch-path "$build_root/swift"

app_path="$build_root/Lidzy.app"
mkdir -p "$app_path/Contents/MacOS"
mkdir -p "$app_path/Contents/Resources"
cp "$build_root/swift/release/Lidzy" "$app_path/Contents/MacOS/Lidzy"
cp "$project_root/native/Resources/Info.plist" "$app_path/Contents/Info.plist"

iconset="$build_root/Lidzy.iconset"
mkdir -p "$iconset"
swift "$project_root/scripts/make-icon.swift" "$build_root/icon-1024.png"
for size in 16 32 128 256 512; do
  sips -z "$size" "$size" "$build_root/icon-1024.png" --out "$iconset/icon_${size}x${size}.png" >/dev/null
  double=$((size * 2))
  sips -z "$double" "$double" "$build_root/icon-1024.png" --out "$iconset/icon_${size}x${size}@2x.png" >/dev/null
done
iconutil -c icns "$iconset" -o "$app_path/Contents/Resources/Lidzy.icns"
codesign --force --deep --sign - "$app_path"

mkdir -p "$project_root/dist"
ditto -c -k --norsrc --keepParent "$app_path" "$project_root/dist/Lidzy-0.1.0-macos.zip"
printf 'Created %s\n' "$project_root/dist/Lidzy-0.1.0-macos.zip"
