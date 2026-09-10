"use client";

import { useState } from "react";
import Image from "next/image";

type Style = "silk" | "shade" | "frost";

export function LidzyDemo({ variant }: { variant: "hero" | "feature" }) {
  const [angle, setAngle] = useState(variant === "hero" ? 76 : 73);
  const [style, setStyle] = useState<Style>("silk");
  const progress = angle / 120;
  const tilt = (1 - progress) * 48;
  const blur = style === "frost" ? (1 - progress) * 18 : style === "silk" ? (1 - progress) * 3 : 0;
  const shade = style === "shade" ? (1 - progress) * .68 : (1 - progress) * .3;

  return <div className={`demo demo-${variant}`}>
    <div className="macbook" aria-hidden="true">
      <div className="display" style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}>
        <div className="camera"/>
        <div className="desktop" style={{ filter: `blur(${blur}px)`, boxShadow: `inset 0 -18rem 13rem rgba(0,0,0,${shade})` }}>
          <Image className="desktop-wallpaper" src="/assets/lidzy-wallpaper.png" alt="" fill priority={variant === "hero"} sizes={variant === "hero" ? "(max-width: 900px) 96vw, 76vw" : "(max-width: 900px) 92vw, 32vw"}/>
          <div className="desktop-menu"><b>●</b><span>Lidzy</span><span>File</span><span>Edit</span><span>View</span><span>Go</span><span>Window</span><i>Mon Apr 22　9:41 AM</i></div>
          {variant === "hero" && <div className="lock"><small>MON　APR　28</small><strong>9:41</strong><span>▢</span><p>Good things ahead.</p></div>}
          {variant === "feature" && <div className="dock"><span>⌘</span><span>◉</span><span>✉</span><span>✦</span><span>▰</span></div>}
        </div>
      </div>
      <div className="keyboard"><div className="keys"/><div className="trackpad"/></div>
      <div className="edge"/>
    </div>
    {variant === "hero" ? <div className="hero-control"><label htmlFor="hero-angle">Lid angle</label><input id="hero-angle" type="range" min="20" max="120" value={angle} onChange={e => setAngle(Number(e.target.value))}/></div> : <div className="controls"><div className="control-heading"><label htmlFor="feature-angle">Lid angle</label><output>{angle}°</output></div><input id="feature-angle" type="range" min="20" max="120" value={angle} onChange={e => setAngle(Number(e.target.value))}/><div className="ticks"><span>20°</span><span>45°</span><span>90°</span><span>120°</span></div><p className="control-label">Visual style</p><div className="style-tabs" role="group" aria-label="Visual style">{(["silk","shade","frost"] as Style[]).map(item => <button key={item} aria-pressed={style === item} className={style === item ? "active" : ""} onClick={() => setStyle(item)}>{item[0].toUpperCase()+item.slice(1)}</button>)}</div><div className="motion-note"><span>✣</span><p>Move the slider to see how your desktop responds as you open and close your MacBook.</p><small>REAL MOTION.<br/>REAL RESULTS.</small></div></div>}
  </div>;
}
