import { LidzyDemo } from "@/components/lidzy-demo";

const githubUrl = "https://github.com/jmbarrancoml/lidzy";

function Mark() {
  return <svg aria-hidden="true" viewBox="0 0 28 28" className="mark"><path d="M4 5.5h8v7H4zM16 15.5h8v7h-8z" fill="currentColor" /><path d="m10 11 8 8" fill="none" stroke="currentColor" strokeWidth="3" /></svg>;
}

export default function Home() {
  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#top" aria-label="Lidzy home"><Mark />Lidzy</a>
        <nav aria-label="Main navigation"><a href="#features">Features</a><a href="#open-source">Open source</a><a href={githubUrl}>GitHub ↗</a></nav>
      </header>
      <section className="hero shell" id="top">
        <div className="hero-copy">
          <h1>Your desktop<br />follows the lid.</h1>
          <p>Lidzy folds, shades and softens your desktop as you close your MacBook. A small physical detail that makes the whole machine feel alive.</p>
          <div className="actions"><a className="button" href={`${githubUrl}/releases`}>Download for macOS <span>↓</span></a><a className="text-link" href={githubUrl}>View on GitHub ↗</a></div>
        </div>
        <div className="hero-note" aria-hidden="true"><span>A more natural goodbye.</span><i /></div>
        <div className="hinge-strip" aria-hidden="true"><div className="metal top" /><div className="pivot" /><div className="metal bottom" /><p>SMALL MOVEMENTS.<br />A BRIGHTER DESKTOP.</p></div>
        <div className="hero-demo"><LidzyDemo compact /></div>
      </section>
      <section className="features shell" id="features">
        <p className="eyebrow">Features</p><h2>One motion. Your whole desktop.</h2>
        <div className="feature-grid">
          <article><small>01</small><h3>Follow the lid</h3><p>Lidzy reads the built-in lid angle sensor and responds to each degree of movement.</p></article>
          <article><small>02</small><h3>Render in real time</h3><p>Perspective, shade and blur move together to give your desktop a physical sense of depth.</p></article>
          <article><small>03</small><h3>Stay private</h3><p>Everything runs on your Mac. Lidzy never saves or uploads captured screen frames.</p></article>
        </div>
        <LidzyDemo />
      </section>
      <section className="open shell" id="open-source">
        <p className="eyebrow">Open source</p><h2>Built in the open.</h2>
        <div className="open-grid">
          <pre aria-label="Swift effect mapping example"><code>{`struct LidEffects {
  static func values(for angle: Double) -> Effects {
    let progress = max(0, min(1, angle / 120))

    return Effects(
      perspective: 0.72 + progress * 0.28,
      blur: (1 - progress) * 24,
      shade: (1 - progress) * 0.58
    )
  }
}`}</code></pre>
          <div className="open-copy">
            <h3>Lidzy is yours to inspect, change and improve.</h3>
            <p>The native app and this website ship under the MIT License. Build it locally, suggest an improvement or shape the next release.</p>
            <dl><div><dt>macOS</dt><dd>14 Sonoma or later</dd></div><div><dt>Hardware</dt><dd>Apple silicon MacBook</dd></div><div><dt>Permission</dt><dd>Screen Recording</dd></div></dl>
            <div className="actions"><a className="button" href={`${githubUrl}/releases`}>Download latest release <span>↓</span></a><a className="text-link" href={githubUrl}>Browse the source →</a></div>
          </div>
        </div>
      </section>
      <footer className="shell"><a className="brand" href="#top"><Mark />Lidzy</a><div><a href={githubUrl}>GitHub</a><a href={`${githubUrl}/blob/main/LICENSE`}>License</a></div></footer>
    </main>
  );
}
