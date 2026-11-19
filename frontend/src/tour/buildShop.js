// Builds a 3D model of the Birthday Box venue, based on the venue photos.
//
// Model layout (metres, y up) — the whole model is then mirrored left↔right
// (root.scale.x = -1) so it matches the real venue:
//   Celebration room: x -3..3, z -3.5..3.5 — sofas on the back wall (z=-3.5), screen on
//                     the front wall (z=3.5), decor on the x=-3 wall.
//   Hall:             x 3..8.5, z -3.5..1.5 — entrance at x=8.5, door into the room at x=3.
// After mirroring: walking in, the toy cabinets and cube wall are on your right,
// and you walk straight on into the celebration room (LED steps by the door,
// decor on the far wall).
//
// Everything is added as a "piece" belonging to a tour step (0 hall, 1 projector,
// 2 seating, 3 decor). Pieces pop in when their step is reached and pop out when
// you go back. Walls/ceilings between the camera and the room hide themselves
// (dollhouse cut-away), so you can always see inside.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const H = 3; // ceiling height
const WALL_T = 0.08;
const MIRROR = -1; // -1 mirrors the model left↔right, 1 keeps the model coordinates

// ── helpers ───────────────────────────────────────────────────────────────
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTex(w, h, draw, { repeat, srgb = true } = {}) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}
// Same image as a non-colour texture (for bump maps).
function dataCopy(t) {
  const d = t.clone();
  d.colorSpace = THREE.NoColorSpace;
  d.needsUpdate = true;
  return d;
}

const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0, ...o });
const phys = (o) => new THREE.MeshPhysicalMaterial({ roughness: 0.75, metalness: 0, ...o });
const glow = (color, intensity = 1.6) =>
  new THREE.MeshStandardMaterial({ color: "#000", emissive: color, emissiveIntensity: intensity });
// soft fabric with a velvety sheen
const fabric = (color, extra = {}) =>
  phys({ color, roughness: 0.9, sheen: 1, sheenRoughness: 0.45, sheenColor: new THREE.Color(color).lerp(new THREE.Color("#fff"), 0.35), ...extra });

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}
function rbox(w, h, d, r, mat, x = 0, y = 0, z = 0) {
  const rr = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, rr), mat);
  m.position.set(x, y, z);
  return m;
}
function sphere(r, mat, x = 0, y = 0, z = 0, seg = 16) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), mat);
  m.position.set(x, y, z);
  return m;
}
function at(obj, x, y, z) {
  obj.position.set(x, y, z);
  return obj;
}
function group(x = 0, y = 0, z = 0, ...children) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  children.forEach((c) => g.add(c));
  return g;
}

// ── textures ──────────────────────────────────────────────────────────────
function makeTextures() {
  const r = rng(7);

  const floorWood = canvasTex(1024, 1024, (g, w, h) => {
    const rows = 10, rh = h / rows;
    for (let row = 0; row < rows; row++) {
      let x = -((row * 197) % 400);
      while (x < w) {
        const pw = 300 + Math.floor(r() * 220);
        const l = 30 + r() * 10;
        const grad = g.createLinearGradient(x, 0, x + pw, 0);
        grad.addColorStop(0, `hsl(${19 + r() * 6}, ${52 + r() * 8}%, ${l}%)`);
        grad.addColorStop(1, `hsl(${19 + r() * 6}, ${52 + r() * 8}%, ${l + (r() - 0.5) * 6}%)`);
        g.fillStyle = grad;
        g.fillRect(x, row * rh, pw, rh);
        g.strokeStyle = "rgba(30,12,4,0.55)";
        g.lineWidth = 2;
        g.strokeRect(x, row * rh, pw, rh);
        for (let k = 0; k < 9; k++) {
          const y = row * rh + r() * rh;
          g.strokeStyle = `rgba(60,25,8,${0.1 + r() * 0.2})`;
          g.lineWidth = 0.6 + r() * 1.4;
          g.beginPath();
          g.moveTo(x, y);
          g.bezierCurveTo(x + pw * 0.3, y + 5 * (r() - 0.5), x + pw * 0.6, y + 5 * (r() - 0.5), x + pw, y);
          g.stroke();
        }
        x += pw;
      }
    }
  }, { repeat: [2.2, 2.2] });

  const panelWood = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#b8763c";
    g.fillRect(0, 0, w, h);
    for (let k = 0; k < 90; k++) {
      const y = r() * h;
      g.strokeStyle = `rgba(${80 + r() * 50},${40 + r() * 25},12,${0.1 + r() * 0.25})`;
      g.lineWidth = 0.8 + r() * 2.5;
      g.beginPath();
      g.moveTo(0, y);
      g.bezierCurveTo(w * 0.3, y + 10 * (r() - 0.5), w * 0.7, y + 10 * (r() - 0.5), w, y);
      g.stroke();
    }
  }, { repeat: [1, 1] });

  // soft blotchy noise, used as a bump map for plaster walls and carpet
  const noise = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#808080";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 5000; i++) {
      const v = Math.floor(100 + r() * 60);
      g.fillStyle = `rgba(${v},${v},${v},0.35)`;
      g.beginPath();
      g.arc(r() * w, r() * h, 0.6 + r() * 1.8, 0, 7);
      g.fill();
    }
  }, { repeat: [6, 6], srgb: false });

  const tuft = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#1f6c72";
    g.fillRect(0, 0, w, h);
    // puffy diamonds: lighter centres, dark seams, buttons
    for (let y = 0; y <= h; y += 32)
      for (let x = ((y / 32) % 2) * 32; x <= w; x += 64) {
        const rg = g.createRadialGradient(x + 32, y, 2, x + 32, y, 34);
        rg.addColorStop(0, "rgba(255,255,255,0.10)");
        rg.addColorStop(1, "rgba(0,0,0,0.10)");
        g.fillStyle = rg;
        g.fillRect(x, y - 32, 64, 64);
      }
    g.strokeStyle = "rgba(0,0,0,0.3)";
    g.lineWidth = 2.5;
    for (let i = -w; i < 2 * w; i += 64) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke();
      g.beginPath(); g.moveTo(i, h); g.lineTo(i + h, 0); g.stroke();
    }
    g.fillStyle = "rgba(0,0,0,0.6)";
    for (let y = 0; y <= h; y += 32)
      for (let x = ((y / 32) % 2) * 32; x <= w; x += 64) {
        g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill();
      }
  }, { repeat: [10, 1] });

  const screen = canvasTex(1024, 576, (g, w, h) => {
    const s = w / 640;
    g.scale(s, s);
    const sky = g.createLinearGradient(0, 0, 0, 360);
    sky.addColorStop(0, "#2f7a35");
    sky.addColorStop(1, "#63b552");
    g.fillStyle = sky;
    g.fillRect(0, 0, 640, 360);
    for (let i = 0; i < 9; i++) {
      g.fillStyle = i % 2 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
      g.fillRect(0, i * 36, 640, 36);
    }
    g.fillStyle = "#d9c48c";
    g.beginPath();
    g.moveTo(296, 70); g.lineTo(344, 70); g.lineTo(386, 300); g.lineTo(254, 300);
    g.closePath(); g.fill();
    g.strokeStyle = "#fff"; g.lineWidth = 2;
    [[300, 90, 340], [262, 280, 378]].forEach(([x1, y, x2]) => { g.beginPath(); g.moveTo(x1, y); g.lineTo(x2, y); g.stroke(); });
    const player = (x, y, k, col) => {
      g.fillStyle = col; g.fillRect(x - 5 * k, y - 22 * k, 10 * k, 20 * k);
      g.fillStyle = "#f1d3b3"; g.beginPath(); g.arc(x, y - 27 * k, 5 * k, 0, 7); g.fill();
    };
    player(330, 278, 1.6, "#2b5fd9");
    player(312, 102, 0.9, "#d63b3b");
    player(420, 200, 1.1, "#2b5fd9");
    player(190, 160, 1.0, "#2b5fd9");
    g.fillStyle = "rgba(10,14,40,0.88)";
    g.fillRect(0, 318, 640, 42);
    g.fillStyle = "#fff";
    g.font = "bold 20px sans-serif";
    g.fillText("BIRTHDAY XI  186/4  (18.3)", 18, 346);
    g.fillStyle = "#f7941d";
    g.fillText("LIVE", 560, 346);
  });

  const mural = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#f7f3ea"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#f4c23e"; g.beginPath(); g.arc(300, 360, 210, 0, 7); g.fill();
    g.strokeStyle = "#222"; g.lineWidth = 3;
    const rr = rng(3);
    for (let i = 0; i < 9; i++) {
      const bx = 40 + i * 50, bw = 40 + rr() * 30, bh = 120 + rr() * 200;
      g.strokeRect(bx, h - 60 - bh, bw, bh);
      for (let y = h - 50 - bh; y < h - 80; y += 26)
        for (let x = bx + 6; x < bx + bw - 10; x += 14) g.strokeRect(x, y, 7, 10);
    }
    g.beginPath(); g.arc(150, 120, 40, 0, 7); g.stroke();
    g.beginPath(); g.moveTo(60, 200); g.bezierCurveTo(160, 150, 260, 240, 420, 170); g.stroke();
  });

  const sequin = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#444"; g.fillRect(0, 0, w, h);
    for (let y = 6; y < h; y += 12)
      for (let x = 6 + ((y / 12) % 2) * 6; x < w; x += 12) {
        const v = 140 + Math.floor(r() * 115);
        g.fillStyle = `rgb(${v},${v},${v + 8})`;
        g.beginPath(); g.arc(x, y, 5.2, 0, 7); g.fill();
      }
  }, { repeat: [3, 4] });

  const neon = (text, color, font) =>
    canvasTex(1024, 256, (g, w, h) => {
      g.textAlign = "center"; g.textBaseline = "middle";
      g.font = font;
      g.shadowColor = color; g.shadowBlur = 28;
      g.fillStyle = color;
      g.fillText(text, w / 2, h / 2);
      g.shadowBlur = 8; g.fillStyle = "#fff";
      g.fillText(text, w / 2, h / 2);
    });

  const t = {
    floorWood, panelWood, noise, tuft, screen, mural, sequin,
    neonShine: neon("Let's Shine Together", "#ff4fd8", "italic 600 96px 'Segoe Script', 'Brush Script MT', cursive"),
    neonBirthday: neon("Happy Birthday", "#ffffff", "italic 700 120px 'Segoe Script', 'Brush Script MT', cursive"),
  };
  t.floorBump = dataCopy(floorWood);
  t.panelBump = dataCopy(panelWood);
  t.tuftBump = dataCopy(tuft);
  return t;
}

// ── reusable props ────────────────────────────────────────────────────────
const TOY_COLORS = ["#f5d142", "#c98a4b", "#f2efe9", "#f39bc0", "#7fb3e6", "#d8473f", "#a5714a", "#9aa0a6", "#8fd3c1"];

// Plush toy (teddy / bunny / chick style), ~0.25 m tall at s=1, facing +z.
function makePlushFactory() {
  const cache = new Map();
  const furOf = (c) => {
    if (!cache.has(c)) cache.set(c, fabric(c, { roughness: 1, sheenRoughness: 0.6 }));
    return cache.get(c);
  };
  const eye = std({ color: "#111", roughness: 0.15 });
  const muzzle = fabric("#f3e3cf", { roughness: 1 });
  const capsule = new THREE.CapsuleGeometry(0.014, 0.05, 4, 8);
  return (color, s, rand) => {
    const fur = furOf(color);
    const g = group();
    const body = sphere(0.06, fur, 0, 0.065, 0, 12);
    body.scale.set(1, 1.12, 0.92);
    g.add(body);
    g.add(sphere(0.052, fur, 0, 0.165, 0.005, 12));
    g.add(sphere(0.022, muzzle, 0, 0.155, 0.047, 8));
    g.add(sphere(0.0075, eye, -0.019, 0.178, 0.045, 6));
    g.add(sphere(0.0075, eye, 0.019, 0.178, 0.045, 6));
    g.add(sphere(0.022, fur, -0.058, 0.085, 0.02, 8));
    g.add(sphere(0.022, fur, 0.058, 0.085, 0.02, 8));
    g.add(sphere(0.024, fur, -0.03, 0.018, 0.04, 8));
    g.add(sphere(0.024, fur, 0.03, 0.018, 0.04, 8));
    const kind = rand();
    if (kind < 0.35) {
      // bunny ears
      [-1, 1].forEach((sx) => {
        const e = new THREE.Mesh(capsule, fur);
        e.position.set(0.022 * sx, 0.24, 0);
        e.rotation.z = -0.15 * sx;
        g.add(e);
      });
    } else if (kind < 0.85) {
      g.add(sphere(0.02, fur, -0.04, 0.205, 0, 8));
      g.add(sphere(0.02, fur, 0.04, 0.205, 0, 8));
    }
    g.scale.setScalar(s);
    return g;
  };
}

// Glass-fronted toy cabinet, front facing +z, origin at bottom-centre-back.
function toyCabinet(w, h, d, shelves, mats, plush, seed) {
  const rand = rng(seed);
  const g = group();
  const t = 0.04;
  g.add(rbox(t, h, d, 0.01, mats.panel, -w / 2 + t / 2, h / 2, d / 2));
  g.add(rbox(t, h, d, 0.01, mats.panel, w / 2 - t / 2, h / 2, d / 2));
  g.add(rbox(w, t, d, 0.01, mats.panel, 0, h - t / 2, d / 2));
  g.add(rbox(w, 0.08, d, 0.01, mats.panel, 0, 0.04, d / 2));
  g.add(box(w - 2 * t, h - 0.1, 0.02, mats.mirror, 0, h / 2, 0.02));
  const gap = (h - 0.12) / shelves;
  for (let i = 0; i < shelves; i++) {
    const y = 0.08 + i * gap;
    if (i > 0) g.add(box(w - 2 * t, 0.03, d, mats.panel, 0, y, d / 2));
    g.add(box(w - 2 * t, 0.012, 0.02, mats.warmLed, 0, y + gap - 0.03, d - 0.04));
    const n = Math.max(2, Math.floor((w - 0.1) / 0.16));
    for (let k = 0; k < n; k++) {
      const s = 0.9 + rand() * 0.55;
      const toy = plush(TOY_COLORS[Math.floor(rand() * TOY_COLORS.length)], s, rand);
      toy.position.set(-w / 2 + 0.1 + (k + 0.5) * ((w - 0.2) / n), y + 0.015, d * 0.5 + (rand() - 0.5) * 0.06);
      toy.rotation.y = (rand() - 0.5) * 0.6;
      g.add(toy);
    }
  }
  g.add(box(0.012, h - 0.1, 0.012, mats.warmLed, -w / 2 + t + 0.01, h / 2, d - 0.03));
  g.add(box(0.012, h - 0.1, 0.012, mats.warmLed, w / 2 - t - 0.01, h / 2, d - 0.03));
  const glass = box(w - 2 * t, h - 0.1, 0.008, mats.glass, 0, h / 2, d);
  glass.castShadow = false;
  g.add(glass);
  return g;
}

// Octagon ring in the XY plane (flat top/bottom), protruding along z.
function octagonRing(R, t, depth, mat, skip = []) {
  const g = group();
  const edge = 2 * R * Math.sin(Math.PI / 8);
  const apo = R * Math.cos(Math.PI / 8);
  for (let i = 0; i < 8; i++) {
    if (skip.includes(i)) continue;
    const a = (i / 8) * Math.PI * 2;
    const m = rbox(edge + t * 0.85, t, depth, 0.012, mat, Math.cos(a) * apo, Math.sin(a) * apo, 0);
    m.rotation.z = a + Math.PI / 2;
    g.add(m);
  }
  return g;
}

// Picket fence running along z, origin at its centre.
function fence(len, mat) {
  const g = group();
  const n = Math.round(len / 0.11);
  for (let i = 0; i <= n; i++) {
    const z = -len / 2 + (i * len) / n;
    g.add(rbox(0.03, 0.55, 0.05, 0.006, mat, 0, 0.275, z));
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.07, 4), mat);
    tip.position.set(0, 0.585, z);
    tip.rotation.y = Math.PI / 4;
    g.add(tip);
  }
  g.add(rbox(0.025, 0.04, len + 0.04, 0.006, mat, -0.03, 0.15, 0));
  g.add(rbox(0.025, 0.04, len + 0.04, 0.006, mat, -0.03, 0.42, 0));
  return g;
}

function bouquet(rand) {
  const g = group();
  const cols = ["#f472b6", "#fff", "#fda4af", "#f9a8d4", "#fef3c7"];
  const leaf = std({ color: "#3f7d3a", roughness: 0.8 });
  for (let i = 0; i < 6; i++) {
    const l = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.14, 5), leaf);
    const a = (i / 6) * Math.PI * 2;
    l.position.set(Math.cos(a) * 0.05, 0.08, Math.sin(a) * 0.05);
    l.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6);
    g.add(l);
  }
  for (let i = 0; i < 11; i++) {
    const a = rand() * Math.PI * 2, rr = rand() * 0.09;
    g.add(sphere(0.03 + rand() * 0.02, fabric(cols[i % cols.length], { roughness: 0.9 }),
      Math.cos(a) * rr, 0.1 + rand() * 0.09, Math.sin(a) * rr, 10));
  }
  return g;
}

// ── the scene ─────────────────────────────────────────────────────────────
export function buildShop(scene) {
  const tex = makeTextures();
  const mats = {
    floorWood: phys({ map: tex.floorWood, bumpMap: tex.floorBump, bumpScale: 1.2, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.3 }),
    panel: std({ map: tex.panelWood, bumpMap: tex.panelBump, bumpScale: 0.8, roughness: 0.5 }),
    sage: std({ color: "#7f8c80", roughness: 0.93, bumpMap: tex.noise, bumpScale: 0.5 }),
    hallCeil: std({ color: "#dcd8cf", roughness: 0.95 }),
    darkWall: std({ color: "#3a3d42", roughness: 0.95, bumpMap: tex.noise, bumpScale: 0.6 }),
    darkCeil: std({ color: "#2a2c30", roughness: 0.95 }),
    carpet: std({ color: "#55585e", roughness: 1, bumpMap: tex.noise, bumpScale: 1.4 }),
    riser: std({ color: "#303237", roughness: 1, bumpMap: tex.noise, bumpScale: 1 }),
    skirting: std({ color: "#5b3a22", roughness: 0.6 }),
    mirror: std({ color: "#c9b9a6", roughness: 0.15, metalness: 0.8 }),
    glass: phys({ color: "#ffffff", roughness: 0.04, transparent: true, opacity: 0.1, depthWrite: false }),
    warmLed: glow("#ffcf7a", 2.6),
    blueLed: glow("#4d6bff", 3.2),
    tuft: fabric("#ffffff", { map: tex.tuft, bumpMap: tex.tuftBump, bumpScale: 3, sheenColor: new THREE.Color("#5ec2c7") }),
    teal: fabric("#1f6c72"),
    black: std({ color: "#15161a", roughness: 0.5 }),
    plastic: std({ color: "#cfd0d4", roughness: 0.4 }),
    white: std({ color: "#f4f1ea", roughness: 0.6 }),
    chairBlue: fabric("#1f3fa8"),
    gold: std({ color: "#d4a72c", roughness: 0.22, metalness: 1 }),
    velvetRed: fabric("#8c1424", { sheenColor: new THREE.Color("#ff6b7a") }),
  };
  const plush = makePlushFactory();

  // Everything lives under one root, mirrored to match the real venue.
  const root = new THREE.Group();
  root.scale.x = MIRROR;
  scene.add(root);

  // pieces per step
  const steps = [[], [], [], []];
  const all = [];

  // Move a group's pivot to the bottom-centre of its contents, so it pops in
  // from where it stands (not from the world origin).
  const _box = new THREE.Box3();
  function recentre(obj) {
    if (!obj.isGroup || obj.children.length === 0) return;
    obj.updateMatrixWorld(true);
    _box.setFromObject(obj);
    const pivot = _box.getCenter(new THREE.Vector3());
    pivot.y = _box.min.y;
    const local = pivot.clone().sub(obj.position).applyQuaternion(obj.quaternion.clone().invert()).divide(obj.scale);
    obj.children.forEach((c) => c.position.sub(local));
    obj.position.copy(pivot);
  }

  function piece(step, obj, opts = {}) {
    recentre(obj);
    obj.traverse((o) => {
      if (o.isMesh) {
        const emissive = o.material.emissiveIntensity > 1 || o.material.isMeshBasicMaterial || o.material.transparent;
        o.castShadow = !emissive && !opts.noShadow;
        o.receiveShadow = !o.material.isMeshBasicMaterial;
      }
    });
    obj.userData.base = obj.position.clone();
    obj.userData.baseScale = obj.scale.clone();
    obj.userData.p = 0;
    obj.userData.target = 0;
    obj.userData.startAt = 0;
    obj.userData.order = steps[step].length;
    obj.userData.rule = opts.rule || null;
    obj.userData.noDrop = !!opts.noDrop;
    if (obj.isLight) obj.userData.baseIntensity = obj.intensity;
    obj.visible = false;
    steps[step].push(obj);
    all.push(obj);
    (opts.world ? scene : root).add(obj);
    return obj;
  }

  // Cut-away rule in world space (mirror applied).
  const worldRule = (normal, point) => {
    normal.x *= MIRROR;
    point.x *= MIRROR;
    return { normal, point };
  };

  // A wall along x (at z=fixed) or along z (at x=fixed), inner face at `fixed`,
  // `inward` = +1/-1 direction of the room interior. Optional door [from, to, height].
  function wall(step, axis, fixed, a0, a1, mat, inward, door) {
    const mid = (a0 + a1) / 2;
    const off = fixed - (inward * WALL_T) / 2;
    const g = axis === "x" ? group(mid, H / 2, off) : group(off, H / 2, mid);
    const seg = (s0, s1, y0, y1) => {
      const len = s1 - s0, c = (s0 + s1) / 2 - mid, hh = y1 - y0, cy = (y0 + y1) / 2 - H / 2;
      g.add(axis === "x" ? box(len, hh, WALL_T, mat, c, cy, 0) : box(WALL_T, hh, len, mat, 0, cy, c));
    };
    // extend each wall by its thickness at both ends so corners overlap (no gaps)
    const e0 = a0 - WALL_T, e1 = a1 + WALL_T;
    if (door) {
      seg(e0, door[0], 0, H);
      seg(door[1], e1, 0, H);
      seg(door[0], door[1], door[2], H);
    } else seg(e0, e1, 0, H);
    const normal = axis === "x" ? new THREE.Vector3(0, 0, inward) : new THREE.Vector3(inward, 0, 0);
    const point = axis === "x" ? new THREE.Vector3(0, 0, fixed) : new THREE.Vector3(fixed, 0, 0);
    return piece(step, g, { rule: worldRule(normal, point), noDrop: true });
  }
  const ruleOf = (w) => ({ rule: w.userData.rule });
  // skirting board along a wall (same cut-away rule as the wall)
  function skirting(step, w, axis, fixed, a0, a1, inward) {
    const mid = (a0 + a1) / 2, len = a1 - a0, z = fixed + inward * 0.012;
    const m = axis === "x" ? box(len, 0.08, 0.024, mats.skirting, mid, 0.04, z) : box(0.024, 0.08, len, mats.skirting, z, 0.04, mid);
    return piece(step, m, { ...ruleOf(w), noDrop: true });
  }
  function ceiling(step, x0, x1, z0, z1, mat) {
    const m = box(x1 - x0, 0.06, z1 - z0, mat, (x0 + x1) / 2, H + 0.03, (z0 + z1) / 2);
    return piece(step, m, { rule: worldRule(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, H, 0)), noDrop: true, noShadow: true });
  }
  function floor(step, x0, x1, z0, z1, mat) {
    return piece(step, box(x1 - x0, 0.04, z1 - z0, mat, (x0 + x1) / 2, -0.02, (z0 + z1) / 2), { noDrop: true });
  }
  function light(step, color, intensity, x, y, z, distance = 7, shadow = false) {
    const l = new THREE.PointLight(color, intensity, distance, 2);
    l.position.set(x, y, z);
    if (shadow) {
      l.castShadow = true;
      l.shadow.mapSize.set(1024, 1024);
      l.shadow.bias = -0.002;
      l.shadow.normalBias = 0.03;
      l.shadow.camera.near = 0.1;
      l.shadow.camera.far = distance;
    }
    return piece(step, l);
  }
  function downlights(step, spots, ceilMat) {
    const g = group();
    const disc = glow("#fff4dc", 3);
    spots.forEach(([x, z]) => {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 20), ceilMat);
      ring.position.set(x, H - 0.005, z);
      const d = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.022, 20), disc);
      d.position.set(x, H - 0.01, z);
      g.add(ring, d);
    });
    return piece(step, g, { noShadow: true });
  }

  // ═════ STEP 0 — THE HALL ═════
  // You come in through the entrance (model x=8.5) and walk straight towards the
  // door into the celebration room (model x=3). After the mirror, the toy cabinets
  // and the wooden cube wall (model z=HZ1 wall) are on your RIGHT as you walk in,
  // with the door to the celebration room just left of the cabinets. The chairs,
  // mural and stage are on the opposite wall (model z=HZ0).
  const HX0 = 3, HX1 = 8.5, HZ0 = -3.5, HZ1 = 1.5;
  const DOOR = [-0.3, 0.8, 2.2]; // hall → celebration room
  const ENTRANCE = [-1.6, -0.5, 2.2]; // street → hall
  floor(0, HX0, HX1, HZ0, HZ1, mats.floorWood);
  const hallBack = wall(0, "x", HZ0, HX0, HX1, mats.sage, 1);
  const hallFront = wall(0, "x", HZ1, HX0, HX1, mats.sage, -1);
  const hallRight = wall(0, "z", HX1, HZ0, HZ1, mats.sage, -1, ENTRANCE);
  const hallLeft = wall(0, "z", HX0, HZ0, HZ1, mats.sage, 1, DOOR);
  ceiling(0, HX0, HX1, HZ0, HZ1, mats.hallCeil);
  skirting(0, hallBack, "x", HZ0, HX0, HX1, 1);
  skirting(0, hallFront, "x", HZ1, HX0, HX1, -1);
  skirting(0, hallRight, "z", HX1, HZ0, ENTRANCE[0], -1);
  skirting(0, hallRight, "z", HX1, ENTRANCE[1], HZ1, -1);
  skirting(0, hallLeft, "z", HX0, HZ0, DOOR[0], 1);
  skirting(0, hallLeft, "z", HX0, DOOR[1], HZ1, 1);
  // wooden door frames (hall side)
  const doorFrame = (x, d, w) => {
    const g = group();
    g.add(rbox(0.06, d[2], 0.08, 0.01, mats.panel, x, d[2] / 2, d[0] - 0.04));
    g.add(rbox(0.06, d[2], 0.08, 0.01, mats.panel, x, d[2] / 2, d[1] + 0.04));
    g.add(rbox(0.06, 0.08, d[1] - d[0] + 0.16, 0.01, mats.panel, x, d[2] + 0.04, (d[0] + d[1]) / 2));
    return piece(0, g, { ...ruleOf(w), noDrop: true });
  };
  doorFrame(HX0 + 0.03, DOOR, hallLeft);
  doorFrame(HX1 - 0.03, ENTRANCE, hallRight);
  // warm cove light along the ceiling edges
  piece(0, box(HX1 - HX0, 0.03, 0.03, mats.warmLed, (HX0 + HX1) / 2, H - 0.06, HZ1 - 0.03), ruleOf(hallFront));
  piece(0, box(HX1 - HX0, 0.03, 0.03, mats.warmLed, (HX0 + HX1) / 2, H - 0.06, HZ0 + 0.03), ruleOf(hallBack));
  downlights(0, [[4.0, -2.6], [4.0, 0.6], [7.6, -2.6], [7.6, 0.6]], mats.white);

  // toy cabinets on the right-hand wall, next to the door into the celebration room
  const cabA = at(toyCabinet(0.75, 2.3, 0.38, 5, mats, plush, 11), 3.6, 0, HZ1);
  cabA.rotation.y = Math.PI;
  piece(0, cabA);
  const cabB = at(toyCabinet(1.6, 2.2, 0.38, 4, mats, plush, 23), 4.9, 0, HZ1);
  cabB.rotation.y = Math.PI;
  piece(0, cabB);
  // flower table in front of the cabinets
  {
    const r = rng(5);
    const t = group(4.9, 0, HZ1 - 0.85);
    t.add(rbox(0.9, 0.72, 0.55, 0.03, fabric("#f6f2ea"), 0, 0.36, 0));
    const garland = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 10, 24), fabric("#f59e0b"));
    garland.position.set(0, 0.95, 0.1);
    t.add(garland);
    const b = bouquet(r); b.position.set(0.25, 0.72, 0); t.add(b);
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.14, 16), mats.gold);
    lamp.position.set(-0.25, 0.79, -0.05);
    t.add(lamp);
    piece(0, t);
  }
  // wooden cube display wall, continuing along the same wall towards the entrance
  {
    const r = rng(31);
    const g = group(7.15, 0, HZ1);
    const cells = [
      [-0.9, 0.35, 0.5, 0.6], [-0.35, 0.3, 0.45, 0.5], [-0.9, 1.0, 0.45, 0.45], [-0.4, 0.9, 0.5, 0.55],
      [0.2, 0.55, 0.45, 0.9], [-0.95, 1.6, 0.45, 0.5], [-0.35, 1.55, 0.5, 0.45], [0.25, 1.35, 0.45, 0.45],
      [-0.8, 2.25, 0.5, 0.45], [-0.2, 2.15, 0.45, 0.55], [0.4, 2.0, 0.45, 0.5], [0.55, 2.55, 0.45, 0.4],
      [0.75, 1.1, 0.4, 0.4],
    ];
    cells.forEach(([x, y, w, h]) => {
      const d = 0.22 + r() * 0.14;
      g.add(rbox(w, h, d, 0.012, mats.panel, x, y, -d / 2));
      g.add(box(w * 0.85, 0.01, 0.01, mats.warmLed, x, y + h / 2 - 0.02, -d + 0.01));
      if (r() > 0.4) {
        const fig = plush(TOY_COLORS[Math.floor(r() * TOY_COLORS.length)], 0.8, r);
        fig.position.set(x, y + h / 2, -d * 0.6);
        fig.rotation.y = Math.PI;
        g.add(fig);
      }
    });
    piece(0, g, ruleOf(hallFront));
  }
  // "Let's Shine Together" neon on the entrance wall, next to the cube wall
  {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.33),
      new THREE.MeshBasicMaterial({ map: tex.neonShine, transparent: true, toneMapped: false }));
    m.position.set(HX1 - 0.01, 1.85, 0.55);
    m.rotation.y = -Math.PI / 2;
    m.scale.x = MIRROR; // keep the lettering readable after mirroring
    piece(0, m, ruleOf(hallRight));
  }
  // stepped wooden stage in the far corner (entrance side), with a teddy
  {
    const g = group();
    g.add(rbox(1.7, 0.2, 1.1, 0.015, mats.panel, 7.65, 0.1, HZ0 + 0.55));
    g.add(rbox(1.1, 0.2, 0.8, 0.015, mats.panel, 7.95, 0.3, HZ0 + 0.4));
    g.add(rbox(0.6, 0.2, 0.5, 0.015, mats.panel, 8.2, 0.5, HZ0 + 0.25));
    piece(0, g);
    const fur = fabric("#b8875a", { roughness: 1 });
    const muzzle = fabric("#e8cfae", { roughness: 1 });
    const eye = std({ color: "#111", roughness: 0.15 });
    const teddy = group(7.2, 0.2, HZ0 + 0.75);
    const body = sphere(0.17, fur, 0, 0.17, 0, 20);
    body.scale.set(1, 1.1, 0.9);
    teddy.add(body);
    teddy.add(sphere(0.13, fur, 0, 0.43, 0.02, 20));
    teddy.add(sphere(0.05, muzzle, 0, 0.41, 0.13, 12));
    teddy.add(sphere(0.016, eye, 0, 0.43, 0.175, 8));
    teddy.add(sphere(0.014, eye, -0.045, 0.47, 0.12, 8));
    teddy.add(sphere(0.014, eye, 0.045, 0.47, 0.12, 8));
    teddy.add(sphere(0.05, fur, -0.1, 0.54, 0, 12));
    teddy.add(sphere(0.05, fur, 0.1, 0.54, 0, 12));
    teddy.add(sphere(0.06, fur, -0.15, 0.22, 0.06, 12));
    teddy.add(sphere(0.06, fur, 0.15, 0.22, 0.06, 12));
    teddy.add(sphere(0.07, fur, -0.1, 0.05, 0.12, 12));
    teddy.add(sphere(0.07, fur, 0.1, 0.05, 0.12, 12));
    const bow = std({ color: "#1b1b1b", roughness: 0.4 });
    teddy.add(sphere(0.03, bow, -0.035, 0.32, 0.11, 8));
    teddy.add(sphere(0.03, bow, 0.035, 0.32, 0.11, 8));
    teddy.rotation.y = -0.5;
    piece(0, teddy);
  }
  // mural behind the stage + wood slats behind the chairs (left-hand wall)
  {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.7), std({ map: tex.mural, roughness: 0.9 }));
    m.position.set(6.6, 1.55, HZ0 + 0.01);
    m.scale.x = MIRROR; // keep the artwork the right way round after mirroring
    piece(0, m, ruleOf(hallBack));
    const slats = group(4.6, 0, HZ0);
    for (let i = 0; i < 9; i++) slats.add(rbox(0.2, 2.6, 0.04, 0.01, mats.panel, -1.2 + i * 0.3, 1.3, 0.02));
    piece(0, slats, ruleOf(hallBack));
  }
  // blue covered chairs against the left-hand wall, facing into the hall
  {
    const g = group();
    const band = fabric("#f4f1ea");
    for (let i = 0; i < 4; i++) {
      const c = group(3.8 + i * 0.58, 0, HZ0 + 0.45);
      c.add(rbox(0.46, 0.45, 0.46, 0.05, mats.chairBlue, 0, 0.225, 0));
      c.add(rbox(0.46, 0.58, 0.08, 0.035, mats.chairBlue, 0, 0.72, -0.2));
      c.add(rbox(0.12, 0.52, 0.085, 0.02, band, 0, 0.72, -0.205));
      g.add(c);
    }
    piece(0, g);
  }
  // gear-shaped ceiling lights
  {
    const g = group();
    const ringMat = std({ color: "#2b2b2b", roughness: 0.45, metalness: 0.4 });
    const lightMat = glow("#fff6e0", 3);
    [[5.6, -1.7, 0.42], [6.5, -1.0, 0.34], [5.4, -0.6, 0.3]].forEach(([x, z, r]) => {
      const gear = group(x, H - 0.35, z);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.06, 10, 36), ringMat);
      ring.rotation.x = Math.PI / 2;
      gear.add(ring);
      const inner = new THREE.Mesh(new THREE.TorusGeometry(r - 0.07, 0.02, 8, 36), lightMat);
      inner.rotation.x = Math.PI / 2;
      gear.add(inner);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const tooth = rbox(0.12, 0.1, 0.1, 0.015, ringMat, Math.cos(a) * (r + 0.07), 0, Math.sin(a) * (r + 0.07));
        tooth.rotation.y = -a;
        gear.add(tooth);
      }
      gear.add(box(0.01, 0.35, 0.01, ringMat, 0, 0.17, 0));
      g.add(gear);
    });
    piece(0, g);
  }
  light(0, "#ffe2b0", 14, 5.8, 2.6, -1.2, 9, true);
  light(0, "#ffe2b0", 6, 7.4, 2.5, -2.4);
  light(0, "#ffc070", 3, 5.0, 1.2, HZ1 - 0.9, 3);

  // ═════ STEP 1 — THE PROJECTOR (celebration room + screen) ═════
  const RX0 = -3, RX1 = 3, RZ0 = -3.5, RZ1 = 3.5;
  floor(1, RX0, RX1, RZ0, RZ1, mats.carpet);
  const roomBack = wall(1, "x", RZ0, RX0, RX1, mats.darkWall, 1);
  const roomFront = wall(1, "x", RZ1, RX0, RX1, mats.darkWall, -1);
  const roomLeft = wall(1, "z", RX0, RZ0, RZ1, mats.darkWall, 1);
  const roomRight = wall(1, "z", RX1, RZ0, RZ1, mats.darkWall, -1, DOOR);
  ceiling(1, RX0, RX1, RZ0, RZ1, mats.darkCeil);
  // warm LED strips where the walls meet the ceiling
  piece(1, box(RX1 - RX0, 0.03, 0.03, mats.warmLed, 0, H - 0.05, RZ0 + 0.03), ruleOf(roomBack));
  piece(1, box(0.03, 0.03, RZ1 - RZ0, mats.warmLed, RX0 + 0.03, H - 0.05, 0), ruleOf(roomLeft));
  piece(1, box(0.03, 0.03, RZ1 - RZ0, mats.warmLed, RX1 - 0.03, H - 0.05, 0), ruleOf(roomRight));
  // speakers + AC
  {
    const spk = (x) => {
      const g = group(x, 2.5, RZ0 + 0.1);
      g.add(rbox(0.2, 0.3, 0.17, 0.02, mats.black, 0, 0, 0));
      const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 20), std({ color: "#2a2a2e", roughness: 0.8 }));
      cone.rotation.x = Math.PI / 2;
      cone.position.set(0, -0.04, 0.086);
      g.add(cone);
      return g;
    };
    piece(1, spk(-2.5), ruleOf(roomBack));
    piece(1, spk(2.5), ruleOf(roomBack));
    const ac = group(RX0 + 0.13, 2.55, 0.6);
    ac.add(rbox(0.22, 0.3, 0.95, 0.04, mats.plastic, 0, 0, 0));
    ac.add(box(0.02, 0.02, 0.85, std({ color: "#9a9aa0" }), 0.11, -0.1, 0));
    piece(1, ac, ruleOf(roomLeft));
  }
  // the projector, hanging from the ceiling above the sofas
  const LENS = new THREE.Vector3(0, 2.5, -1.25);
  let BEAM = null; // beam shape (model space), for the inside-the-beam check
  {
    const g = group(0, 0, 0);
    g.add(box(0.03, 0.35, 0.03, mats.black, 0, H - 0.17, -1.45));
    g.add(rbox(0.42, 0.16, 0.38, 0.03, mats.plastic, 0, 2.5, -1.45));
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.05, 24), mats.black);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(LENS.x, LENS.y, LENS.z - 0.01);
    g.add(barrel);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.02, 24), glow("#fffbe8", 4));
    lens.rotation.x = Math.PI / 2;
    lens.position.copy(LENS);
    g.add(lens);
    piece(1, g);
  }
  // the screen on the front wall
  const SCR = { w: 3.2, h: 1.8, y: 1.7, z: RZ1 - 0.04 };
  {
    const g = group();
    g.add(rbox(SCR.w + 0.16, SCR.h + 0.16, 0.05, 0.01, mats.black, 0, SCR.y, SCR.z));
    const img = new THREE.Mesh(new THREE.PlaneGeometry(SCR.w, SCR.h),
      new THREE.MeshBasicMaterial({ map: tex.screen, toneMapped: false, color: new THREE.Color(0.92, 0.92, 0.92) }));
    img.position.set(0, SCR.y, SCR.z - 0.03);
    img.rotation.y = Math.PI;
    img.scale.x = MIRROR; // keep the picture/scoreboard readable after mirroring
    g.add(img);
    piece(1, g, ruleOf(roomFront));
  }
  // light beam from the lens to the screen
  const beamMat = new THREE.MeshBasicMaterial({
    color: "#fff3cf", transparent: true, opacity: 0.08, depthWrite: false,
    side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  {
    const z = SCR.z - 0.04, hw = SCR.w / 2, y0 = SCR.y - SCR.h / 2, y1 = SCR.y + SCR.h / 2;
    const L = [LENS.x, LENS.y, LENS.z + 0.03];
    BEAM = { L: LENS, z, hw, y0, y1 };
    const c = [[-hw, y0, z], [hw, y0, z], [hw, y1, z], [-hw, y1, z]];
    const pos = [];
    for (let i = 0; i < 4; i++) pos.push(...L, ...c[i], ...c[(i + 1) % 4]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    piece(1, new THREE.Mesh(geo, beamMat), { noDrop: true, noShadow: true });
  }
  // light spilling from the screen into the room (world space: x=0 is unaffected by the mirror)
  {
    const rect = new THREE.RectAreaLight("#bfe8b5", 1.4, SCR.w, SCR.h);
    rect.position.set(0, SCR.y, SCR.z - 0.05);
    rect.lookAt(0, SCR.y, 0);
    piece(1, rect, { world: true });
  }
  light(1, "#ffd9a0", 6, 0, 2.7, 0.3, 8, true);
  light(1, "#ffd9a0", 2.5, -1.8, 2.7, 1.8);

  // ═════ STEP 2 — THE SEATING ═════
  // (model x is mirrored: the steps at model +x end up on the LEFT when facing the sofas)
  {
    const g = group();
    g.add(rbox(5.4, 0.45, 1.1, 0.02, mats.riser, -0.3, 0.225, RZ0 + 0.55));
    g.add(box(5.4, 0.02, 0.02, mats.blueLed, -0.3, 0.44, RZ0 + 1.1));
    piece(2, g);
  }
  // two rows of tufted sofas, with separate seat cushions
  const sofa = (x0, x1, y, zBack, depth) => {
    const g = group();
    const w = x1 - x0, cx = (x0 + x1) / 2;
    g.add(rbox(w, 0.24, depth, 0.03, mats.tuft, cx, y + 0.12, zBack + depth / 2));
    const n = Math.round(w / 0.62), cw = w / n;
    for (let i = 0; i < n; i++)
      g.add(rbox(cw - 0.02, 0.15, depth - 0.2, 0.06, mats.teal, x0 + cw * (i + 0.5), y + 0.31, zBack + 0.2 + (depth - 0.2) / 2));
    const back = rbox(w, 0.62, 0.2, 0.07, mats.tuft, cx, y + 0.62, zBack + 0.1);
    back.rotation.x = -0.08;
    g.add(back);
    return g;
  };
  piece(2, sofa(-2.9, 2.1, 0.45, RZ0, 0.75));
  piece(2, sofa(-2.9, 2.1, 0, RZ0 + 1.1, 0.8));
  // LED-lit steps up to the back row
  {
    const g = group();
    [[0.15, -0.95], [0.3, -1.35], [0.45, -1.75]].forEach(([h, z]) => {
      g.add(rbox(0.75, h, 0.4, 0.015, mats.riser, 2.6, h / 2, z - 0.2));
      g.add(box(0.75, 0.02, 0.02, mats.blueLed, 2.6, h, z));
    });
    piece(2, g);
  }
  // wooden octagon frames above the sofas
  {
    const g = group(0, 0, RZ0 + 0.13);
    const a = octagonRing(0.55, 0.07, 0.24, mats.panel, [1, 2, 3]);
    a.position.set(0.6, 2.05, 0);
    const b = octagonRing(0.55, 0.07, 0.24, mats.panel);
    b.position.set(-0.75, 2.05, 0);
    g.add(a, b);
    g.add(rbox(0.5, 0.08, 0.2, 0.03, mats.teal, 0.6, 1.62, 0));
    g.add(rbox(0.5, 0.08, 0.2, 0.03, mats.teal, -0.75, 1.62, 0));
    piece(2, g, ruleOf(roomBack));
  }
  light(2, "#5b6cff", 4, 2.4, 0.5, -1.4, 3.5);
  light(2, "#ffd9a0", 2.5, -0.4, 2.2, -2.2, 4);

  // ═════ STEP 3 — THE DECOR (model x=-3 wall → the right-hand wall) ═════
  const DZ = 0.6; // centre of the decor wall
  {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.2),
      std({ map: tex.sequin, metalness: 0.95, roughness: 0.25, emissive: "#ffffff", emissiveMap: tex.sequin, emissiveIntensity: 0.18 }));
    m.position.set(RX0 + 0.03, 1.15, DZ);
    m.rotation.y = Math.PI / 2;
    piece(3, m, ruleOf(roomLeft));
    const n = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.31),
      new THREE.MeshBasicMaterial({ map: tex.neonBirthday, transparent: true, toneMapped: false }));
    n.position.set(RX0 + 0.06, 1.85, DZ);
    n.rotation.y = Math.PI / 2;
    n.scale.x = MIRROR; // keep the lettering readable after mirroring
    piece(3, n, ruleOf(roomLeft));
  }
  // gold display frames in front of the backdrop
  {
    const g = group();
    const fill = std({ color: "#c7c9d1", metalness: 0.9, roughness: 0.2 });
    [[DZ - 0.35, 1.6], [DZ + 0.4, 1.3]].forEach(([z, h]) => {
      const f = group(RX0 + 0.45, 0, z);
      [-0.22, 0.22].forEach((dz) => f.add(box(0.025, h, 0.025, mats.gold, 0, h / 2, dz)));
      f.add(box(0.025, 0.025, 0.47, mats.gold, 0, h, 0));
      f.add(box(0.012, h - 0.05, 0.42, fill, 0, h / 2, 0));
      g.add(f);
    });
    piece(3, g);
  }
  // balloon arch: shiny latex + chrome-gold balloons
  {
    const r = rng(99);
    const cols = ["#f472b6", "#fde047", "#7dd3c0", "#c4b5fd", "#93c5fd", "#f9a8d4", "#a3e635", "#fecdd3", "#9a9a3c", "#ffffff"];
    const legH = 1.5, rad = 1.05;
    const pts = [];
    const pathLen = legH * 2 + Math.PI * rad;
    for (let s = 0; s < pathLen; s += 0.055) {
      let z, y;
      if (s < legH) { z = -rad; y = s; }
      else if (s < legH + Math.PI * rad) { const a = Math.PI - (s - legH) / rad; z = Math.cos(a) * rad; y = legH + Math.sin(a) * rad; }
      else { z = rad; y = legH - (s - legH - Math.PI * rad); }
      for (let k = 0; k < 3; k++) pts.push([(r() - 0.5) * 0.24, y + (r() - 0.5) * 0.16, z + (r() - 0.5) * 0.2, 0.075 + r() * 0.065]);
    }
    const goldPts = pts.filter(() => r() < 0.12);
    const latexPts = pts.filter((p) => !goldPts.includes(p));
    const geo = new THREE.SphereGeometry(1, 20, 14);
    const make = (list, mat, colour) => {
      const mesh = new THREE.InstancedMesh(geo, mat, list.length);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), col = new THREE.Color();
      list.forEach(([x, y, z, s], i) => {
        q.setFromEuler(e.set((r() - 0.5) * 0.8, 0, (r() - 0.5) * 0.8));
        m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s * 1.12, s));
        mesh.setMatrixAt(i, m4);
        if (colour) mesh.setColorAt(i, col.set(cols[Math.floor(r() * cols.length)]));
      });
      return mesh;
    };
    const g = group(RX0 + 0.55, 0.08, DZ);
    g.add(make(latexPts, phys({ roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12 }), true));
    g.add(make(goldPts, std({ color: "#e0b43c", metalness: 1, roughness: 0.18 }), false));
    piece(3, g);
  }
  // red velvet octagon panels with a warm halo
  {
    const g = group();
    const oct = (R, depth) => {
      const geo = new THREE.CylinderGeometry(R, R, depth, 8);
      geo.rotateY(Math.PI / 8);
      geo.rotateZ(Math.PI / 2);
      return geo;
    };
    [[2.25, 2.0], [2.35, 1.15]].forEach(([z, y]) => {
      const halo = new THREE.Mesh(oct(0.36, 0.02), glow("#ff9a3c", 2));
      halo.position.set(RX0 + 0.02, y, z);
      const panel = new THREE.Mesh(oct(0.33, 0.06), mats.velvetRed);
      panel.position.set(RX0 + 0.06, y, z);
      g.add(halo, panel);
    });
    piece(3, g, ruleOf(roomLeft));
  }
  // white picket fences + pedestals with flowers
  piece(3, at(fence(0.75, mats.white), RX0 + 1.15, 0, DZ - 0.75));
  piece(3, at(fence(0.75, mats.white), RX0 + 1.15, 0, DZ + 0.8));
  {
    const r = rng(42);
    const g = group();
    [[RX0 + 0.85, DZ + 1.55, 0.95], [RX0 + 1.1, DZ + 1.85, 0.7]].forEach(([x, z, h], i) => {
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, h, 32), std({ color: "#f3e7c9", roughness: 0.5 }));
      ped.position.set(x, h / 2, z);
      g.add(ped);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 32), mats.gold);
      rim.position.set(x, h, z);
      g.add(rim);
      if (i === 0) { const b = bouquet(r); b.position.set(x, h, z); g.add(b); }
    });
    // a few big floor balloons + a subwoofer
    const latex = (c) => phys({ color: c, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 });
    [["#d9a07a", -0.6, 0.2], ["#93c5fd", 0.1, 0.18], ["#93c5fd", 0.35, 0.15]].forEach(([c, dz, s]) => {
      const b = sphere(s, latex(c), RX0 + 0.9, s * 1.05, DZ + dz, 24);
      b.scale.y = 1.08;
      g.add(b);
    });
    g.add(rbox(0.45, 0.45, 0.45, 0.03, mats.black, RX0 + 0.35, 0.225, 2.9));
    piece(3, g);
  }
  light(3, "#ffe7c2", 3.5, RX0 + 1.6, 2.3, DZ, 7, false);
  light(3, "#ff8fd0", 1.2, RX0 + 1.0, 0.9, DZ + 1.6, 3);

  // ── runtime ──────────────────────────────────────────────────────────────
  const easeOutBack = (t) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const tmp = new THREE.Vector3();
  let beamFade = 1;

  function setStep(k, now, instant = false) {
    steps.forEach((list, s) => {
      list.forEach((obj) => {
        const u = obj.userData;
        const target = s <= k ? 1 : 0;
        if (target === 1 && u.target === 0) u.startAt = now + (s === k ? Math.min(u.order * 0.06, 1.4) : 0);
        u.target = target;
        if (instant) u.p = target;
      });
    });
  }

  // Returns true when anything moved or appeared/disappeared (so shadows need re-rendering).
  function update(dt, now, camera) {
    let changed = false;
    for (const obj of all) {
      const u = obj.userData;
      const before = u.p;
      if (u.target === 1 && now >= u.startAt) u.p = Math.min(1, u.p + dt / 0.6);
      else if (u.target === 0) u.p = Math.max(0, u.p - dt / 0.3);
      if (u.p !== before) changed = true;

      let vis = u.p > 0.001;
      if (vis && u.rule) vis = tmp.copy(camera.position).sub(u.rule.point).dot(u.rule.normal) > 0;
      if (obj.visible !== vis) { obj.visible = vis; changed = true; }
      if (!vis) continue;

      if (obj.isLight) {
        obj.intensity = u.baseIntensity * u.p;
      } else {
        const e = u.target === 1 ? easeOutBack(u.p) : u.p;
        obj.scale.copy(u.baseScale).multiplyScalar(Math.max(e, 0.0001));
        if (!u.noDrop) obj.position.y = u.base.y + (1 - easeOutCubic(u.p)) * 0.5;
      }
    }
    // projector beam: gentle flicker, faded out while the camera is inside the beam
    root.worldToLocal(tmp.copy(camera.position));
    const t = (tmp.z - BEAM.L.z) / (BEAM.z - BEAM.L.z);
    const inside = t > -0.15 && t < 1.05 &&
      Math.abs(tmp.x - BEAM.L.x) < t * BEAM.hw + 0.35 &&
      tmp.y > BEAM.L.y + t * (BEAM.y0 - BEAM.L.y) - 0.35 && tmp.y < BEAM.L.y + t * (BEAM.y1 - BEAM.L.y) + 0.35;
    beamFade += ((inside ? 0 : 1) - beamFade) * Math.min(1, dt * 6);
    beamMat.opacity = (0.05 + 0.008 * Math.sin(now * 9) + 0.005 * Math.sin(now * 23)) * beamFade;
    return changed;
  }

  function dispose() {
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) [].concat(o.material).forEach((m) => m.dispose());
    });
    Object.values(tex).forEach((t) => t.dispose());
  }

  return { setStep, update, dispose };
}
