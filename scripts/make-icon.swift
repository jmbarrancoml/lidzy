import AppKit

let size = NSSize(width: 1024, height: 1024)
let image = NSImage(size: size)
image.lockFocus()

NSColor(calibratedRed: 0.72, green: 0.95, blue: 0.22, alpha: 1).setFill()
NSBezierPath(roundedRect: NSRect(x: 32, y: 32, width: 960, height: 960), xRadius: 220, yRadius: 220).fill()

NSColor.black.setFill()
NSBezierPath(roundedRect: NSRect(x: 205, y: 565, width: 300, height: 170), xRadius: 44, yRadius: 44).fill()
NSBezierPath(roundedRect: NSRect(x: 519, y: 289, width: 300, height: 170), xRadius: 44, yRadius: 44).fill()

let connector = NSBezierPath()
connector.move(to: NSPoint(x: 430, y: 590))
connector.line(to: NSPoint(x: 594, y: 434))
connector.line(to: NSPoint(x: 526, y: 366))
connector.line(to: NSPoint(x: 362, y: 522))
connector.close()
connector.fill()

image.unlockFocus()
guard let data = image.tiffRepresentation,
      let bitmap = NSBitmapImageRep(data: data),
      let png = bitmap.representation(using: .png, properties: [:]) else { exit(1) }
try png.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
