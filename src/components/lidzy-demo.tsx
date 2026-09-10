"use client";

import { useState } from "react";

type Style = "silk" | "shade" | "frost";

export function LidzyDemo({ compact = false }: { compact?: boolean }) {
  const [angle, setAngle] = useState(compact ? 78 : 112);
  const [style, setStyle] = useState<Style>("silk");
  const progress = angle / 120;
  const tilt = (1 - progress) * 54;
  const blur = style === "frost" ? (1 - progress) * 16 : style === "silk" ? (1 - progress) * 4 : 0;
  const shade = style === "shade" ? (1 - progress) * 0.72 : (1 - progress) * 0.38;

  return (
    <div className={`demo ${compact ? "compact" : "full"}`}>
      <div className="laptop" aria-hidden="true" style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}>
        <div className="screen-shell"><div className="screen" style={{ filter: `blur(${blur}px)`, boxShadow: `inset 0 -15rem 12rem rgba(0,0,0,${shade})` }}>
          <div className="menu"><b>●</b><span>Lidzy</span><span>File</span><span>View</span><i>9:41 AM</i></div>
          <div className="landscape"><span className="sun" /><span className="hill one" /><span className="hill two" /><span className="hill three" /></div>
          <div className="dock"><i>⌘</i><i>◉</i><i>✉</i><i>✦</i></div>
        </div></div><div className="base" />
      </div>
      <div className="controls">
        <div className="control-heading"><label htmlFor={`angle-${compact}`}>Lid angle</label><output>{angle}°</output></div>
        <input id={`angle-${compact}`} type="range" min="20" max="120" value={angle} onChange={(event) => setAngle(Number(event.target.value))} />
        {!compact && <><div className="ticks"><span>20°</span><span>70°</span><span>120°</span></div><p className="control-label">Visual style</p><div className="style-tabs" role="group" aria-label="Visual style">{(["silk", "shade", "frost"] as Style[]).map((item) => <button key={item} aria-pressed={style === item} className={style === item ? "active" : ""} onClick={() => setStyle(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div><p className="hint">Drag the slider to move the desktop.</p></>}
      </div>
    </div>
  );
}
