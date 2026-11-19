// Sets up the renderer, camera, lighting and controls for the 3D venue tour, and
// flies the camera between the tour stops.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { buildShop } from "./buildShop";

// Camera position + look-at target for each stop (index = tour step), in world
// space. The hall is on the -x side of the celebration room.
const VIEWS = [
  // `narrow`: how much further back the camera sits on portrait phones, where the
  // view is much narrower (outside views only; inside views already fit).
  { pos: [-12.2, 4.6, -2.6], target: [-5.8, 0.9, -0.3], narrow: 1.25 }, // the hall, seen from the entrance
  { pos: [-1.1, 1.55, -3.25], target: [0.1, 1.85, 3.4] }, // projector → screen
  { pos: [-0.6, 1.75, 2.7], target: [0, 0.8, -3.0] }, // seating
  { pos: [-1.7, 1.6, 0.9], target: [3.0, 1.25, 0.6] }, // decor
  { pos: [-6.8, 11.5, 10.5], target: [-2.7, 0, -1.0], narrow: 1.5 }, // whole venue
];
const START = { pos: [-17, 10, -6], target: [-5.8, 0.9, -0.3] };

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function backgroundTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(256, 180, 20, 256, 256, 380);
  grad.addColorStop(0, "#2a2350");
  grad.addColorStop(1, "#110e24");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createTour(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  const pixelRatio = Math.min(window.devicePixelRatio, 1.75);
  renderer.setPixelRatio(pixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false; // re-rendered only when something changes
  container.appendChild(renderer.domElement);

  RectAreaLightUniformsLib.init();

  const scene = new THREE.Scene();
  const bg = backgroundTexture();
  scene.background = bg;
  // soft image-based lighting so metals, gloss and fabric pick up reflections
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.35;
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight("#fff4ea", "#3a3340", 0.45));

  const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 120);
  camera.position.set(...START.pos);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...START.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 0.4;
  controls.maxDistance = 30;
  controls.maxPolarAngle = Math.PI * 0.495; // never below the floor

  const shop = buildShop(scene);
  if (import.meta.env.DEV) window.__tour = { scene, camera, THREE };

  // glow on LEDs, neon and the screen
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(pixelRatio);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.38, 0.4, 0.92);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const clock = new THREE.Clock();
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  let tween = null;
  let current = 0;
  function goTo(step) {
    current = step;
    const now = clock.getElapsedTime();
    shop.setStep(Math.min(step, 3), now, reduceMotion);
    const v = VIEWS[step];
    const from = { pos: camera.position.clone(), target: controls.target.clone() };
    const to = { pos: new THREE.Vector3(...v.pos), target: new THREE.Vector3(...v.target) };
    if (v.narrow && camera.aspect < 0.8) to.pos.sub(to.target).multiplyScalar(v.narrow).add(to.target);
    if (reduceMotion) {
      camera.position.copy(to.pos);
      controls.target.copy(to.target);
      return;
    }
    // lift the camera a little on long moves so it swoops over walls instead of through them
    const lift = Math.min(from.pos.distanceTo(to.pos) * 0.25, 3);
    tween = { from, to, lift, t0: now, dur: 1.9 };
    controls.enabled = false;
  }

  function resize() {
    const w = container.clientWidth || 1, h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    const wasNarrow = camera.fov === 72;
    camera.fov = camera.aspect < 0.8 ? 72 : 55; // wider lens on phones (portrait)
    // Shift the picture up so the model sits above the info card at the bottom.
    const lift = Math.round(h * (camera.aspect < 0.8 ? 0.11 : h < 500 ? 0 : 0.06));
    camera.setViewOffset(w, h, 0, lift, w, h);
    camera.updateProjectionMatrix();
    // phone rotated between portrait and landscape: re-frame the current stop
    if (started && wasNarrow !== (camera.fov === 72) && !tween) goTo(current);
  }
  let started = false;
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // Adaptive quality: after a short warm-up, if the device can't keep up,
  // drop the resolution and then the glow effect.
  let perfFrames = 0, perfTime = 0, perfLevel = 0;
  function adaptQuality(rawDt, now) {
    if (perfLevel >= 2 || now < 1.5) return;
    perfFrames++;
    perfTime += rawDt;
    if (perfFrames < 60) return;
    const fps = perfFrames / perfTime;
    perfFrames = 0;
    perfTime = 0;
    if (fps >= 40) return;
    perfLevel++;
    if (perfLevel === 1) {
      renderer.setPixelRatio(1);
      composer.setPixelRatio(1);
    } else {
      bloom.enabled = false;
    }
    resize();
  }

  let raf = 0;
  started = true;
  renderer.shadowMap.needsUpdate = true;
  function frame() {
    raf = requestAnimationFrame(frame);
    const rawDt = clock.getDelta();
    const dt = Math.min(rawDt, 0.05);
    const now = clock.elapsedTime;
    adaptQuality(rawDt, now);
    if (tween) {
      const k = Math.min(1, (now - tween.t0) / tween.dur);
      const e = easeInOut(k);
      camera.position.lerpVectors(tween.from.pos, tween.to.pos, e);
      camera.position.y += Math.sin(Math.PI * e) * tween.lift;
      controls.target.lerpVectors(tween.from.target, tween.to.target, e);
      if (k >= 1) {
        tween = null;
        controls.enabled = true;
      }
    }
    controls.update();
    if (shop.update(dt, now, camera)) renderer.shadowMap.needsUpdate = true;
    composer.render();
  }
  frame();

  return {
    goTo,
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      shop.dispose();
      bloom.dispose();
      composer.dispose();
      envRT.dispose();
      bg.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
