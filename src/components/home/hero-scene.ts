/**
 * Escena 3D del hero: objetos de estampado y papelería flotando.
 * Se carga con import() dinámico solo cuando el dispositivo lo soporta.
 */
import * as THREE from "three";

const PALETTE = {
  red: 0xe0312f,
  orange: 0xf0643a,
  yellow: 0xf2b544,
  green: 0x3fae8a,
  blue: 0x4e9fd1,
  violet: 0x6a45a0,
  magenta: 0xd9307f,
  paper: 0xfbf8f4,
};

export interface SceneHandle {
  setPointer: (x: number, y: number) => void;
  setScroll: (progress: number) => void;
  setActive: (active: boolean) => void;
  dispose: () => void;
}

interface Floater {
  obj: THREE.Object3D;
  base: THREE.Vector3;
  baseRot: THREE.Euler;
  speed: number;
  phase: number;
  amp: number;
  spin: number;
  depth: number;
}

function gradientTexture(stops: number[], w = 512, h = 64) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, w, 0);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), `#${c.toString(16).padStart(6, "0")}`));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function mugPrintTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1024, 256);
  const g = ctx.createLinearGradient(260, 0, 760, 0);
  [PALETTE.red, PALETTE.orange, PALETTE.yellow, PALETTE.magenta, PALETTE.violet, PALETTE.blue].forEach((c, i, a) =>
    g.addColorStop(i / (a.length - 1), `#${c.toString(16).padStart(6, "0")}`),
  );
  ctx.fillStyle = g;
  ctx.font = "italic 400 120px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("tu idea", 512, 118);
  ctx.fillRect(380, 196, 264, 8);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function starShape(outer: number, inner: number, points = 5) {
  const s = new THREE.Shape();
  for (let i = 0; i <= points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  return s;
}

/** "M" del logo como tubo con el gradiente de la marca en los vértices. */
function logoM() {
  const pts = [
    new THREE.Vector3(-0.8, -0.85, 0),
    new THREE.Vector3(-0.8, 0.55, 0),
    new THREE.Vector3(-0.62, 0.85, 0),
    new THREE.Vector3(-0.35, 0.7, 0),
    new THREE.Vector3(0, 0.05, 0),
    new THREE.Vector3(0.35, 0.7, 0),
    new THREE.Vector3(0.62, 0.85, 0),
    new THREE.Vector3(0.8, 0.55, 0),
    new THREE.Vector3(0.8, -0.85, 0),
  ];
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.35);
  const tubular = 160;
  const radial = 20;
  const geo = new THREE.TubeGeometry(curve, tubular, 0.13, radial, false);
  const stops = [PALETTE.red, PALETTE.orange, PALETTE.yellow, PALETTE.magenta, PALETTE.violet, PALETTE.blue].map((c) => new THREE.Color(c));
  const colors: number[] = [];
  const count = geo.attributes.position.count;
  for (let i = 0; i < count; i++) {
    const t = Math.floor(i / (radial + 1)) / tubular;
    const f = t * (stops.length - 1);
    const a = stops[Math.floor(f)];
    const b = stops[Math.min(stops.length - 1, Math.floor(f) + 1)];
    const c = a.clone().lerp(b, f - Math.floor(f));
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.05 });
  const mesh = new THREE.Mesh(geo, mat);
  // tapas redondeadas
  const capGeo = new THREE.SphereGeometry(0.13, 20, 12);
  const cap1 = new THREE.Mesh(capGeo, new THREE.MeshStandardMaterial({ color: PALETTE.red, roughness: 0.32 }));
  cap1.position.copy(pts[0]);
  const cap2 = new THREE.Mesh(capGeo, new THREE.MeshStandardMaterial({ color: PALETTE.blue, roughness: 0.32 }));
  cap2.position.copy(pts[pts.length - 1]);
  const g = new THREE.Group();
  g.add(mesh, cap1, cap2);
  return g;
}

function mug(printTex: THREE.Texture) {
  const g = new THREE.Group();
  const ceramic = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.28, metalness: 0 });
  // cuerpo con perfil torneado (pared exterior + interior)
  const profile = [
    new THREE.Vector2(0, -0.6),
    new THREE.Vector2(0.52, -0.6),
    new THREE.Vector2(0.56, -0.56),
    new THREE.Vector2(0.56, 0.6),
    new THREE.Vector2(0.5, 0.62),
    new THREE.Vector2(0.5, -0.5),
    new THREE.Vector2(0, -0.5),
  ];
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), ceramic);
  body.castShadow = true;
  g.add(body);
  // estampado
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.562, 0.562, 0.72, 48, 1, true, -Math.PI * 0.55, Math.PI * 1.1),
    new THREE.MeshStandardMaterial({ map: printTex, roughness: 0.35, transparent: false }),
  );
  band.position.y = 0.02;
  g.add(band);
  // café
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.5, 40), new THREE.MeshStandardMaterial({ color: 0x5b3a29, roughness: 0.2 }));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 0.46;
  g.add(coffee);
  // asa
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.07, 16, 40, Math.PI * 1.15), ceramic);
  handle.rotation.z = -Math.PI * 0.57;
  handle.position.set(0.58, 0.02, 0);
  handle.castShadow = true;
  g.add(handle);
  return g;
}

export function createHeroScene(canvas: HTMLCanvasElement, opts: { lite: boolean }): SceneHandle {
  const { lite } = opts;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.25 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !lite;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  camera.position.set(0, 0.2, 11);

  // Luces suaves con tonos de la marca
  scene.add(new THREE.HemisphereLight(0xfff6ec, 0xe9ddf5, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 6, 6);
  key.castShadow = !lite;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -6;
  key.shadow.radius = 6;
  key.shadow.bias = -0.0005;
  scene.add(key);
  const rimA = new THREE.PointLight(PALETTE.magenta, 18, 14);
  rimA.position.set(-4.5, 2.5, 2);
  const rimB = new THREE.PointLight(PALETTE.blue, 14, 14);
  rimB.position.set(4.5, -2, 3);
  scene.add(rimA, rimB);

  // Recibe sombras sin dibujar un piso
  const shadowCatcher = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.07 }));
  shadowCatcher.position.z = -2.2;
  shadowCatcher.receiveShadow = true;
  scene.add(shadowCatcher);

  const world = new THREE.Group();
  scene.add(world);

  const floaters: Floater[] = [];
  const add = (obj: THREE.Object3D, pos: [number, number, number], rot: [number, number, number], o: Partial<Floater> = {}) => {
    obj.position.set(...pos);
    obj.rotation.set(...rot);
    obj.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).castShadow = !lite;
    });
    world.add(obj);
    floaters.push({
      obj,
      base: obj.position.clone(),
      baseRot: obj.rotation.clone(),
      speed: o.speed ?? 0.5 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      amp: o.amp ?? 0.12 + Math.random() * 0.1,
      spin: o.spin ?? 0.15,
      depth: o.depth ?? 1,
    });
  };

  const disposables: { dispose: () => void }[] = [];
  const printTex = mugPrintTexture();
  disposables.push(printTex);

  // Objetos protagonistas
  const m = logoM();
  m.scale.setScalar(1.15);
  add(m, [0.9, 0.9, 0.2], [0.1, -0.35, 0.05], { amp: 0.1, spin: 0.1, depth: 1.2 });

  const mugObj = mug(printTex);
  mugObj.scale.setScalar(1.35);
  add(mugObj, [-0.9, -1.1, 0.8], [0.16, -0.45, -0.06], { amp: 0.12, spin: 0, depth: 1.5 });

  const paperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
  const stickerMat = (c: number) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.45 });

  // Tarjeta con gradiente
  const cardGeo = new THREE.ExtrudeGeometry(roundedRectShape(1.2, 0.75, 0.08), { depth: 0.03, bevelEnabled: false });
  cardGeo.center();
  const gradTex = gradientTexture([PALETTE.red, PALETTE.orange, PALETTE.yellow, PALETTE.magenta, PALETTE.violet, PALETTE.blue]);
  disposables.push(gradTex, cardGeo);
  const cardMat = new THREE.MeshStandardMaterial({ map: gradTex, roughness: 0.4 });
  // Ajusta UV para que el gradiente cubra la tarjeta
  const uv = cardGeo.attributes.uv;
  const posA = cardGeo.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (posA.getX(i) + 0.6) / 1.2, (posA.getY(i) + 0.375) / 0.75);
  add(new THREE.Mesh(cardGeo, cardMat), [2.5, -1.3, -0.4], [0.3, -0.5, 0.35], { depth: 0.8 });

  // Sticker circular + estrella
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.05, 40), stickerMat(PALETTE.magenta));
  add(disc, [-2.6, 1.3, -0.3], [1.3, 0.2, 0.3], { depth: 1.1 });
  const starGeo = new THREE.ExtrudeGeometry(starShape(0.38, 0.18), { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
  starGeo.center();
  add(new THREE.Mesh(starGeo, stickerMat(PALETTE.yellow)), [-0.4, 1.9, -0.8], [0.2, 0.4, 0.2], { depth: 0.7, spin: 0.3 });

  if (!lite) {
    // Hojas de papel
    const sheetGeo = new THREE.BoxGeometry(1.1, 1.5, 0.015);
    const sheet1 = new THREE.Mesh(sheetGeo, paperMat);
    add(sheet1, [-2.9, -0.9, -1.2], [0.25, 0.5, 0.3], { depth: 0.6, spin: 0.08 });
    const sheet2 = new THREE.Mesh(sheetGeo, new THREE.MeshStandardMaterial({ color: 0xece4f4, roughness: 0.85 }));
    add(sheet2, [3.0, 1.5, -1.4], [-0.2, -0.6, -0.25], { depth: 0.5, spin: 0.08 });
    // Figuras geométricas
    add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 0), stickerMat(PALETTE.green)), [1.9, 2.2, -0.6], [0.4, 0.2, 0], { spin: 0.5, depth: 0.9 });
    add(new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.09, 16, 40), stickerMat(PALETTE.violet)), [2.0, 0.1, 1.2], [0.8, 0.3, 0], { spin: 0.4, depth: 1.6 });
    add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), stickerMat(PALETTE.orange)), [-1.8, 0.4, 1.4], [0, 0, 0], { depth: 1.8 });
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 6), stickerMat(PALETTE.blue)), [0.2, -2.3, -0.5], [1.1, 0, 0.4], { depth: 0.8 });
    // Lápiz
    const pencil = new THREE.Group();
    const bodyP = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.4, 6), stickerMat(PALETTE.yellow));
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 6), new THREE.MeshStandardMaterial({ color: 0xf1d3a6, roughness: 0.7 }));
    tip.position.y = -0.81;
    tip.rotation.z = Math.PI;
    const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 12), stickerMat(PALETTE.magenta));
    eraser.position.y = 0.77;
    pencil.add(bodyP, tip, eraser);
    add(pencil, [3.2, -0.2, 0.2], [0, 0, 0.9], { depth: 1.1, spin: 0.1 });
  }

  // Tamaño / cámara responsiva
  let width = 1;
  let height = 1;
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // En pantallas angostas alejar la cámara para que todo quepa
    camera.position.z = camera.aspect < 0.8 ? 14 : camera.aspect < 1.2 ? 12 : 11;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // Estado de interacción
  const pointer = new THREE.Vector2();
  const pointerSmooth = new THREE.Vector2();
  let scroll = 0;
  let scrollSmooth = 0;
  let active = true;
  let raf = 0;
  const clock = new THREE.Clock();

  const render = () => {
    raf = 0;
    if (!active) return;
    const t = clock.getElapsedTime();
    pointerSmooth.lerp(pointer, 0.05);
    scrollSmooth += (scroll - scrollSmooth) * 0.08;

    world.rotation.y = pointerSmooth.x * 0.22 + scrollSmooth * 0.5;
    world.rotation.x = -pointerSmooth.y * 0.12 + scrollSmooth * 0.15;
    world.position.y = scrollSmooth * 1.6;

    for (const f of floaters) {
      f.obj.position.y = f.base.y + Math.sin(t * f.speed + f.phase) * f.amp + scrollSmooth * f.depth * 0.8;
      f.obj.position.x = f.base.x + pointerSmooth.x * 0.15 * f.depth;
      f.obj.rotation.x = f.baseRot.x + Math.sin(t * f.speed * 0.6 + f.phase) * 0.12;
      f.obj.rotation.y = f.baseRot.y + (f.spin ? t * f.spin * 0.3 : Math.sin(t * 0.4 + f.phase) * 0.25);
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(render);
  };
  raf = requestAnimationFrame(render);

  return {
    setPointer: (x, y) => pointer.set(x, y),
    setScroll: (p) => {
      scroll = p;
    },
    setActive: (a) => {
      if (a === active) return;
      active = a;
      if (a && !raf) {
        clock.getDelta();
        raf = requestAnimationFrame(render);
      }
    },
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => m.dispose());
        }
      });
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
