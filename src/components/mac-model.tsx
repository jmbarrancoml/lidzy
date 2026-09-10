"use client";

import { createElement, useEffect, useRef, useState } from "react";

type ModelStatus = "loading" | "ready" | "error";

export function MacModel() {
  const modelRef = useRef<HTMLElement | null>(null);
  const [moduleReady, setModuleReady] = useState(false);
  const [status, setStatus] = useState<ModelStatus>("loading");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    void import("@google/model-viewer")
      .then(() => setModuleReady(true))
      .catch(() => setStatus("error"));
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const model = modelRef.current;
    if (!moduleReady || !model) return;
    const handleLoad = () => setStatus("ready");
    const handleError = () => setStatus("error");
    if ((model as HTMLElement & { loaded?: boolean }).loaded) handleLoad();
    model.addEventListener("load", handleLoad);
    model.addEventListener("error", handleError);
    return () => {
      model.removeEventListener("load", handleLoad);
      model.removeEventListener("error", handleError);
    };
  }, [moduleReady]);

  const motionProps = reduceMotion ? {} : {
    "auto-rotate": true,
    "auto-rotate-delay": 1200,
    "rotation-per-second": "8deg",
  };

  return <div className={`mac-model is-${status}`}>
    {status !== "ready" && <div className="model-placeholder" role="status" aria-live="polite">
      <span>{status === "error" ? "3D preview unavailable" : "Loading 3D Mac…"}</span>
    </div>}
    {createElement("model-viewer", {
      ref: modelRef,
      src: "/models/lidzy-macbook.glb",
      poster: "/assets/lidzy-wallpaper.png",
      alt: "Interactive 3D model of an open aluminum laptop",
      "camera-controls": true,
      ...motionProps,
      "camera-orbit": "18deg 72deg 75%",
      "min-camera-orbit": "auto 55deg 55%",
      "max-camera-orbit": "auto 88deg 125%",
      "shadow-intensity": "1.4",
      "shadow-softness": ".7",
      exposure: "1.05",
      loading: "lazy",
      reveal: "auto",
      style: { width: "100%", height: "100%", background: "transparent" },
    }, createElement("div", { slot: "progress-bar", className: "model-progress" }))}
    <p>Drag to inspect · Scroll to zoom</p>
  </div>;
}
