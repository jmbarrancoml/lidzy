"use client";

import { useState } from "react";
import { ControlledMacModel } from "@/components/mac-model";

type Style = "silk" | "shade" | "frost";

export function LidzyDemo() {
  const [angle, setAngle] = useState(73);
  const [style, setStyle] = useState<Style>("silk");
  const closeProgress = (120 - angle) / (120 - 20);
  const blur = style === "frost" ? closeProgress : style === "silk" ? closeProgress * .2 : 0;
  const brightness = style === "shade" ? 1 - closeProgress * .55 : 1 - closeProgress * .2;

  return <div className="demo demo-feature">
    <ControlledMacModel progress={closeProgress} blur={blur} brightness={brightness}/>
    <div className="controls">
      <div className="control-heading"><label htmlFor="feature-angle">Lid angle</label><output>{angle}°</output></div>
      <input id="feature-angle" type="range" min="20" max="120" value={angle} onChange={(event) => setAngle(Number(event.target.value))}/>
      <div className="ticks"><span>20°</span><span>45°</span><span>90°</span><span>120°</span></div>
      <p className="control-label">Visual style</p>
      <div className="style-tabs" role="group" aria-label="Visual style">{(["silk", "shade", "frost"] as Style[]).map((item) => <button key={item} aria-pressed={style === item} className={style === item ? "active" : ""} onClick={() => setStyle(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
      <div className="motion-note"><span>✣</span><p>Move the slider to see how your desktop responds as you open and close your MacBook.</p><small>REAL MOTION.<br/>REAL RESULTS.</small></div>
    </div>
  </div>;
}
