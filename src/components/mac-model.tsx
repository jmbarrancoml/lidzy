"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

function Laptop({ progress, onReady, onError, connectInvalidation }: { progress: React.MutableRefObject<number>; onReady: () => void; onError: () => void; connectInvalidation: (invalidate: (() => void) | null) => void }) {
  const { scene } = useGLTF("/models/lidzy-macbook.glb");
  const wallpaper = useTexture("/assets/lidzy-wallpaper.png");
  const wallpaperTexture = useMemo(() => {
    const texture = wallpaper.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = true;
    texture.needsUpdate = true;
    return texture;
  }, [wallpaper]);
  const screen = useRef<THREE.Object3D | null>(null);
  const initialRotation = useRef(0);
  const { invalidate } = useThree();

  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.material = Array.isArray(object.material)
        ? object.material.map((material) => material.clone())
        : object.material.clone();
    });
    return clone;
  }, [scene]);

  useEffect(() => {
    const disposeOwnedResources = () => {
      connectInvalidation(null);
      model.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) material.dispose();
      });
      wallpaperTexture.dispose();
    };
    const lid = model.getObjectByName("Screen");
    screen.current = lid ?? null;
    if (!lid) {
      onError();
      return disposeOwnedResources;
    }
    initialRotation.current = lid.rotation.x;
    lid.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const meshMaterials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of meshMaterials) {
        if (!(material instanceof THREE.MeshStandardMaterial)) continue;
        material.map = wallpaperTexture;
        material.emissiveMap = wallpaperTexture;
        material.emissive = new THREE.Color(0xffffff);
        material.emissiveIntensity = .75;
        material.needsUpdate = true;
      }
    });
    connectInvalidation(invalidate);
    onReady();
    invalidate();
    return disposeOwnedResources;
  }, [connectInvalidation, invalidate, model, onError, onReady, wallpaperTexture]);

  useFrame(() => {
    const amount = THREE.MathUtils.smoothstep(progress.current, 0, 1);
    if (screen.current) screen.current.rotation.x = initialRotation.current - amount * 1.43;
  });

  return <primitive object={model} scale={.045} position={[0, -.28, 0]} rotation={[0, 0, 0]}/>;
}

function ModelLights() {
  return <><ambientLight intensity={1.7}/><directionalLight position={[3, 5, 4]} intensity={3.2}/><directionalLight position={[-4, 2, 2]} intensity={1.2}/></>;
}

export function MacModel() {
  const progress = useRef(0);
  const invalidate = useRef<(() => void) | null>(null);
  const wrapper = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [reduceMotion, setReduceMotion] = useState(false);
  const handleReady = useCallback(() => setStatus("ready"), []);
  const handleError = useCallback(() => setStatus("error"), []);
  const connectInvalidation = useCallback((next: (() => void) | null) => { invalidate.current = next; }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const viewportHeight = hero.querySelector<HTMLElement>(".hero-sticky")?.clientHeight ?? window.innerHeight;
      const travel = Math.max(1, hero.offsetHeight - viewportHeight);
      const amount = reduceMotion ? 0 : THREE.MathUtils.clamp(-hero.getBoundingClientRect().top / travel, 0, 1);
      progress.current = amount;
      wrapper.current?.style.setProperty("--scroll-progress", String(amount));
      wrapper.current?.style.setProperty("--scroll-blur", reduceMotion ? "0px" : `${amount * 1.5}px`);
      wrapper.current?.style.setProperty("--scroll-brightness", String(reduceMotion ? 1 : 1 - amount * .42));
      invalidate.current?.();
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduceMotion]);

  return <div ref={wrapper} className={`mac-scroll-model is-${status}`}>
    {status !== "ready" && <div className="model-loading" role="status" aria-live="polite">{status === "error" ? "3D preview unavailable" : "Loading 3D Mac…"}</div>}
    <Canvas frameloop="demand" camera={{ position: [0, .14, 2.35], fov: 30 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ModelLights/>
      <Suspense fallback={null}><Laptop progress={progress} onReady={handleReady} onError={handleError} connectInvalidation={connectInvalidation}/></Suspense>
    </Canvas>
    {!reduceMotion && <div className="scroll-cue" aria-hidden="true"><span>Scroll to close</span><i/></div>}
  </div>;
}

export function ControlledMacModel({ progress, blur = 0, brightness = 1 }: { progress: number; blur?: number; brightness?: number }) {
  const progressRef = useRef(progress);
  const invalidate = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const handleReady = useCallback(() => setStatus("ready"), []);
  const handleError = useCallback(() => setStatus("error"), []);
  const connectInvalidation = useCallback((next: (() => void) | null) => { invalidate.current = next; }, []);

  useEffect(() => {
    progressRef.current = THREE.MathUtils.clamp(progress, 0, 1);
    invalidate.current?.();
  }, [progress]);

  return <div className={`controlled-mac-model is-${status}`} style={{ filter: `blur(${blur}px) brightness(${brightness})` }}>
    {status !== "ready" && <div className="model-loading" role="status" aria-live="polite">{status === "error" ? "3D preview unavailable" : "Loading 3D Mac…"}</div>}
    <Canvas frameloop="demand" camera={{ position: [0, .14, 2.35], fov: 30 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ModelLights/>
      <Suspense fallback={null}><Laptop progress={progressRef} onReady={handleReady} onError={handleError} connectInvalidation={connectInvalidation}/></Suspense>
    </Canvas>
  </div>;
}

useGLTF.preload("/models/lidzy-macbook.glb");
