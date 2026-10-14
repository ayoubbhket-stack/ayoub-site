// Hero 3D: a growing campaign chart in orange glass that reacts to the cursor.
// Loaded lazily after first paint.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export function mountChart(host, reduced) {

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  // studio environment for reflections: white softboxes + orange strip
  const env = new THREE.Scene(); env.background = new THREE.Color('#050505');
  const panel = (w, h, c, k, p) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...p); m.lookAt(0, 0, 0); env.add(m); };
  panel(16, 5, '#fff', 2.4, [0, 9, 7]); panel(12, 6, '#eee', 1.2, [-4, 3, 12]); panel(3, 12, '#2ee59d', 3, [11, 1, 2]); panel(2, 10, '#fff', 1.4, [-11, -1, 4]);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(env, 0.02).texture;

  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  const rig = new THREE.Group(); scene.add(rig);
  const chart = new THREE.Group(); rig.add(chart);
  const heights = [1.6, 2.4, 2.0, 3.4, 4.2, 3.8, 5.6, 7.2];
  const glass = new THREE.MeshPhysicalMaterial({ color: '#2ee59d', metalness: 0.15, roughness: 0.12, transmission: 0.55, thickness: 1.2, ior: 1.45, clearcoat: 1, envMapIntensity: 1.6 });
  const solid = new THREE.MeshPhysicalMaterial({ color: '#2ee59d', metalness: 0.4, roughness: 0.25, clearcoat: 1, emissive: '#003a24', envMapIntensity: 1.4 });
  const dark = new THREE.MeshPhysicalMaterial({ color: '#1a1a1a', metalness: 0.9, roughness: 0.3, clearcoat: 0.6 });
  const bars = heights.map((h, i) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(1, 1, 1, 4, 0.12), i === heights.length - 1 ? solid : (i % 2 ? glass : dark));
    m.position.set((i - (heights.length - 1) / 2) * 1.55, 0, 0); m.userData.h = h; m.scale.set(1, 0.001, 1); chart.add(m); return m;
  });
  // trend line + chrome dot on top of the last bar
  const pts = heights.map((h, i) => new THREE.Vector3((i - (heights.length - 1) / 2) * 1.55, h + 0.9, 0));
  const curve = new THREE.CatmullRomCurve3(pts);
  const line = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.06, 10, false), new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 1, roughness: 0.1 }));
  line.material.transparent = true; line.material.opacity = 0; chart.add(line);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 1, roughness: 0.04, iridescence: 0.8, iridescenceIOR: 1.8 }));
  dot.position.copy(pts.at(-1)); dot.scale.setScalar(0.001); chart.add(dot);
  // floor glow
  const glow = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.MeshBasicMaterial({ color: '#2ee59d', transparent: true, opacity: 0.12 }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = -0.01; chart.add(glow);
  // floating shapes
  const floaters = [];
  [[new THREE.TorusGeometry(1.1, 0.12, 16, 64), solid, [-9, 7, -4]], [new THREE.IcosahedronGeometry(0.9, 0), dark, [9, 9, -2]], [new THREE.OctahedronGeometry(0.7), solid, [7, 1.5, 4]]].forEach(([g, m, p]) => { const o = new THREE.Mesh(g, m); o.position.set(...p); o.userData.b = new THREE.Vector3(...p); o.userData.s = Math.random() * 6; rig.add(o); floaters.push(o); });
  scene.add(new THREE.HemisphereLight(0xffffff, 0x002a1a, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-6, 10, 8); scene.add(key);
  const rim = new THREE.PointLight(0x2ee59d, 220, 60); rim.position.set(8, 6, -4); scene.add(rim);

  let narrow = false;
  const size = () => {
    const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h;
    narrow = w < 760;
    // desktop: chart sits to the right of the headline; phone: above it
    rig.position.set(narrow ? 0.5 : 8.5, narrow ? 8.1 : 1.4, 0); rig.scale.setScalar(narrow ? 0.44 : 0.78);
    cam.position.set(0, narrow ? 8 : 6.5, narrow ? 26 : 24); cam.lookAt(narrow ? 0 : 2.5, narrow ? 5 : 3.2, 0); cam.updateProjectionMatrix();
    floaters.forEach((f, i) => { f.visible = !narrow || i === 0; });
  };
  const ro = new ResizeObserver(size); ro.observe(host); size();
  let mx = 0, my = 0, t = 0, vis = true;
  const onMove = (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; };
  addEventListener('pointermove', onMove, { passive: true });
  const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }); io.observe(host);
  const clock = new THREE.Clock();
  let raf = 0;
  (function loop() {
    raf = requestAnimationFrame(loop);
    if (!vis) return;
    const dt = Math.min(clock.getDelta(), 0.1); t += dt;
    bars.forEach((b, i) => { const target = b.userData.h; const delay = 0.35 + i * 0.12; const p = reduced ? 1 : Math.min(1, Math.max(0, (t - delay) / 1.1)); const e = 1 - Math.pow(1 - p, 3); b.scale.y = Math.max(0.001, target * e); b.position.y = b.scale.y / 2; });
    const lp = reduced ? 1 : Math.min(1, Math.max(0, (t - 1.6) / 0.8)); line.material.opacity = lp; dot.scale.setScalar(Math.max(0.001, lp));
    dot.position.y = pts.at(-1).y + (reduced ? 0 : Math.sin(t * 2) * 0.12);
    chart.rotation.y += ((reduced ? -0.35 : -0.35 + mx * 0.5 + Math.sin(t * 0.3) * 0.08) - chart.rotation.y) * 0.05;
    chart.rotation.x += ((reduced ? 0 : my * 0.12) - chart.rotation.x) * 0.05;
    floaters.forEach((f) => { f.position.y = f.userData.b.y + Math.sin(t * 0.8 + f.userData.s) * 0.5; f.rotation.x += dt * 0.4; f.rotation.y += dt * 0.5; });
    rim.position.x = 8 + mx * 6;
    renderer.render(scene, cam);
  })();

  return () => {
    cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); removeEventListener('pointermove', onMove);
    scene.traverse((o) => { o.geometry?.dispose?.(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    renderer.dispose(); renderer.domElement.remove();
  };
}
