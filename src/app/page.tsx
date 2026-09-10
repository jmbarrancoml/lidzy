import Image from "next/image";
import { LidzyDemo } from "@/components/lidzy-demo";

const githubUrl = "https://github.com/jmbarrancoml/lidzy";

function Mark() {
  return <svg aria-hidden="true" viewBox="0 0 28 28" className="mark"><path d="M4 4h8v8H4zM16 16h8v8h-8z" fill="currentColor"/><path d="m10 10 8 8" stroke="currentColor" strokeWidth="4"/></svg>;
}

function Nav() {
  return <header className="nav page-grid"><a className="brand" href="#top" aria-label="Lidzy home"><Mark/>Lidzy<i/></a><nav aria-label="Main navigation"><a href="#features">Features</a><a href="#download">Download</a><a href={githubUrl}>GitHub ↗</a><a href="#open-source">About</a></nav><p>A more considered desktop.</p></header>;
}

export default function Home() {
  return <main>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <section className="hero" id="top">
      <Nav/>
      <div className="hero-main page-grid" id="main-content">
        <div className="hero-copy">
          <h1>Your desktop<br/>follows the lid.</h1>
          <p>Lidzy gently folds and blurs your desktop as you close your MacBook, so what you see matches what&apos;s happening.</p>
          <div className="actions"><a className="button" href={`${githubUrl}/releases/latest`}>Download for macOS <span>↓</span></a><a className="text-link" href={githubUrl}>View on GitHub ↗</a></div>
        </div>
        <div className="hero-mantra"><span>A more<br/>natural<br/>goodbye.</span><i/></div>
        <figure className="hinge-photo"><Image src="/assets/lidzy-hinge.png" alt="Close view of a laptop hinge" fill priority sizes="18vw"/><figcaption>SMALL MOVEMENTS.<br/>A BRIGHTER DESKTOP.</figcaption></figure>
        <div className="hero-laptop"><LidzyDemo variant="hero"/></div>
      </div>
    </section>

    <section className="features" id="features">
      <Nav/>
      <div className="section-inner">
        <p className="eyebrow">Features</p>
        <h2>One motion. Your whole desktop.</h2>
        <div className="feature-grid">
          <article><small>01</small><h3>Follow the lid</h3><p>Lidzy reads your built-in lid angle sensor in real time, translating physical motion into a responsive desktop experience.</p></article>
          <article><small>02</small><h3>Render in real time</h3><p>Perspective, blur and shade respond to every degree of movement, creating a natural sense of depth as your screen closes.</p></article>
          <article><small>03</small><h3>Stay private</h3><p>Everything runs on your device. Lidzy processes frames locally and never saves or uploads your screen.</p></article>
        </div>
        <LidzyDemo variant="feature"/>
      </div>
    </section>

    <section className="open" id="open-source">
      <div className="diagonal" aria-hidden="true"/>
      <div className="open-inner">
        <div className="open-kicker"><p className="eyebrow">Open source</p><span>BUILT TO MOVE TOGETHER</span></div>
        <h2>Built in the open.</h2>
        <p className="side-note">SAME IDEAS.<br/>BRIGHTER TOGETHER.</p>
        <div className="open-grid">
          <pre aria-label="Swift effect mapping example"><code>{`01  import Foundation
02  import CoreGraphics
03
04  struct LidEffects {
05    static func effects(for angle: Double) -> Effects {
06      let progress = max(0, min(1, angle / 120))
07
08      return Effects(
09        perspective: 0.72 + progress * 0.28,
10        blur: (1 - progress) * 24,
11        shade: (1 - progress) * 0.58
12      )
13    }
14  }`}</code></pre>
          <div className="open-copy" id="download"><h3>Lidzy is open source.<br/>A small utility, a more open Mac.</h3><p>The source is available on GitHub under the MIT License. Read it, learn from it, suggest improvements, or make it your own.</p><p className="requirements-label">Requirements</p><ul><li>macOS 14 or later</li><li>Apple silicon MacBook</li><li>Screen Recording permission</li></ul><div className="download-actions"><a className="button" href={`${githubUrl}/releases/latest`}>↓ <span>Download latest release</span></a><a className="text-link" href={githubUrl}>Browse the source　→</a></div></div>
        </div>
        <footer><a className="brand" href="#top"><Mark/>Lidzy</a><nav><a href={githubUrl}>GitHub</a><a href={`${githubUrl}/blob/main/LICENSE`}>License</a><a href={`${githubUrl}/blob/main/README.md#privacy`}>Privacy</a></nav></footer>
      </div>
    </section>
  </main>;
}
