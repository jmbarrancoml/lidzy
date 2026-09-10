"use client";

import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

type ScreenEffect = { blur: number; brightness: number };

class ModelErrorBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function prepareTexture(texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1, -1);
  texture.offset.set(0, 1);
  texture.needsUpdate = true;
  return texture;
}

function createScreenTexture(source: HTMLImageElement, filter: string, overscan = 0) {
  const canvas = document.createElement("canvas");
  const sourceWidth = source.naturalWidth || source.width;
  const sourceHeight = source.naturalHeight || source.height;
  canvas.width = Math.min(1024, sourceWidth);
  canvas.height = Math.round(canvas.width * sourceHeight / sourceWidth);
  const context = canvas.getContext("2d");
  if (context) {
    context.filter = filter;
    context.drawImage(source, -overscan, -overscan, canvas.width + overscan * 2, canvas.height + overscan * 2);
  }
  return prepareTexture(new THREE.CanvasTexture(canvas));
}

function Laptop({ progress, effect, onReady, onError, connectInvalidation }: { progress: React.MutableRefObject<number>; effect: React.MutableRefObject<ScreenEffect>; onReady: () => void; onError: () => void; connectInvalidation: (invalidate: (() => void) | null) => void }) {
  const { scene } = useGLTF("/models/lidzy-macbook.glb");
  const wallpaper = useTexture("/assets/lidzy-wallpaper.png");
  const screenTextures = useMemo(() => {
    const source = wallpaper.image as HTMLImageElement;
    return [0, 7, 14, 22].map((radius) => createScreenTexture(
      source,
      `${radius ? `blur(${radius}px) ` : ""}contrast(1.42) saturate(1.22) brightness(.78)`,
      radius ? 24 : 0,
    ));
  }, [wallpaper]);
  const screen = useRef<THREE.Object3D | null>(null);
  const displayMaterial = useRef<THREE.MeshBasicMaterial | null>(null);
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
    let injectedDisplay: THREE.Mesh | null = null;
    const disposeOwnedResources = () => {
      connectInvalidation(null);
      if (injectedDisplay) {
        injectedDisplay.parent?.remove(injectedDisplay);
        injectedDisplay.geometry.dispose();
        const displayMaterials = Array.isArray(injectedDisplay.material) ? injectedDisplay.material : [injectedDisplay.material];
        for (const material of displayMaterials) material.dispose();
        injectedDisplay = null;
      }
      screen.current = null;
      displayMaterial.current = null;
      model.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) material.dispose();
      });
      for (const texture of screenTextures) texture.dispose();
    };
    const lid = model.getObjectByName("Screen");
    screen.current = lid ?? null;
    if (!lid) {
      onError();
      return disposeOwnedResources;
    }
    initialRotation.current = lid.rotation.x;
    const material = new THREE.MeshBasicMaterial({ map: screenTextures[0], color: 0xffffff, side: THREE.FrontSide, toneMapped: false });
    const display = new THREE.Mesh(new THREE.PlaneGeometry(.286, .177), material);
    display.name = "LidzyDisplay";
    display.position.set(0, .101, -.0075);
    display.rotation.y = Math.PI;
    lid.add(display);
    injectedDisplay = display;
    displayMaterial.current = material;
    connectInvalidation(invalidate);
    onReady();
    invalidate();
    return disposeOwnedResources;
  }, [connectInvalidation, invalidate, model, onError, onReady, screenTextures]);

  useFrame(() => {
    const amount = THREE.MathUtils.clamp(progress.current, 0, 1);
    if (screen.current) screen.current.rotation.x = initialRotation.current + amount * THREE.MathUtils.degToRad(100);
    if (displayMaterial.current) {
      const textureIndex = Math.round(THREE.MathUtils.clamp(effect.current.blur, 0, 1) * (screenTextures.length - 1));
      const nextMap = screenTextures[textureIndex];
      if (displayMaterial.current.map !== nextMap) {
        displayMaterial.current.map = nextMap;
        displayMaterial.current.needsUpdate = true;
      }
      displayMaterial.current.color.setScalar(effect.current.brightness);
    }
  });

  return <primitive object={model} scale={.045} position={[0, -.28, 0]} rotation={[0, 0, 0]}/>;
}

function ModelLights() {
  return <><ambientLight intensity={.72}/><directionalLight position={[3, 5, 4]} intensity={2.1}/><directionalLight position={[-4, 2, 2]} intensity={.55}/></>;
}

export function MacModel() {
  const progress = useRef(0);
  const effect = useRef<ScreenEffect>({ blur: 0, brightness: 1 });
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
      effect.current = { blur: reduceMotion ? 0 : amount, brightness: reduceMotion ? 1 : 1 - amount * .55 };
      wrapper.current?.style.setProperty("--scroll-progress", String(amount));
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
      <ModelErrorBoundary onError={handleError}><Suspense fallback={null}><Laptop progress={progress} effect={effect} onReady={handleReady} onError={handleError} connectInvalidation={connectInvalidation}/></Suspense></ModelErrorBoundary>
    </Canvas>
    {!reduceMotion && <div className="scroll-cue" aria-hidden="true"><span>Scroll to close</span><i/></div>}
  </div>;
}

export function ControlledMacModel({ progress, blur = 0, brightness = 1 }: { progress: number; blur?: number; brightness?: number }) {
  const progressRef = useRef(progress);
  const effect = useRef<ScreenEffect>({ blur, brightness });
  const invalidate = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const handleReady = useCallback(() => setStatus("ready"), []);
  const handleError = useCallback(() => setStatus("error"), []);
  const connectInvalidation = useCallback((next: (() => void) | null) => { invalidate.current = next; }, []);

  useEffect(() => {
    progressRef.current = THREE.MathUtils.clamp(progress, 0, 1);
    effect.current = { blur, brightness };
    invalidate.current?.();
  }, [blur, brightness, progress]);

  return <div className={`controlled-mac-model is-${status}`}>
    {status !== "ready" && <div className="model-loading" role="status" aria-live="polite">{status === "error" ? "3D preview unavailable" : "Loading 3D Mac…"}</div>}
    <Canvas frameloop="demand" camera={{ position: [0, .14, 2.35], fov: 30 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ModelLights/>
      <ModelErrorBoundary onError={handleError}><Suspense fallback={null}><Laptop progress={progressRef} effect={effect} onReady={handleReady} onError={handleError} connectInvalidation={connectInvalidation}/></Suspense></ModelErrorBoundary>
    </Canvas>
  </div>;
}

useGLTF.preload("/models/lidzy-macbook.glb");
