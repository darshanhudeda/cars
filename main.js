import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CARS } from './cars.js';
import { buildCar } from './carBuilder.js';

// ---------------- Scene setup ----------------
const app = document.getElementById('app');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0D0F12);
scene.fog = new THREE.Fog(0x0D0F12, 9, 22);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(4.5, 2.2, 5.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
app.appendChild(renderer.domElement);

// ---------------- Lighting: garage showroom feel ----------------
const hemi = new THREE.HemisphereLight(0x3a3f47, 0x0a0a0c, 0.6);
scene.add(hemi);

const keyLight = new THREE.SpotLight(0xfff2d6, 220, 30, Math.PI / 5, 0.4, 1.2);
keyLight.position.set(5, 8, 4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
scene.add(keyLight);

const rimLight = new THREE.SpotLight(0xffb800, 90, 30, Math.PI / 4, 0.5, 1.5);
rimLight.position.set(-6, 4, -5);
scene.add(rimLight);

const fillLight = new THREE.PointLight(0x4477aa, 30, 20);
fillLight.position.set(-3, 2, 4);
scene.add(fillLight);

// Ground with soft reflection-ish grid ring
const groundGeo = new THREE.CircleGeometry(14, 48);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x15181d, roughness: 0.55, metalness: 0.15 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Subtle concentric ring accents (garage floor markings)
for (let r = 3; r <= 9; r += 3) {
  const ringGeo = new THREE.RingGeometry(r, r + 0.03, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x2a2f36, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.01;
  scene.add(ring);
}

// ---------------- Controls (360° view) ----------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2.8;
controls.maxDistance = 11;
controls.maxPolarAngle = Math.PI / 2 - 0.02;
controls.target.set(0, 0.6, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = 1.1;
controls.update();

let userInteracted = false;

// ---------------- State ----------------
let currentCarObj = null;
let currentIndex = 0;
const carGroupHolder = new THREE.Group();
scene.add(carGroupHolder);

// ---------------- Sound ----------------
// Each car has ONE audio file containing its full rev-up + driving-away
// sequence. A tap plays that sequence start to finish; while it's playing,
// further taps are ignored so the sequence never gets cut off and restarted.
let currentAudio = null;
let isPlaying = false;

function setSoundButtonState(playing) {
  const btn = document.getElementById('btnSound');
  if (!btn) return;
  btn.classList.toggle('playing', playing);
  const label = btn.querySelector('.label');
  if (label) label.textContent = playing ? 'Playing…' : 'Rev Engine';
}

function stopCarSound() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  isPlaying = false;
  setSoundButtonState(false);
}

function playCarSound() {
  if (isPlaying) return; // let the current rev + drive sequence finish
  const spec = CARS[currentIndex];
  if (!spec.sound) return;

  currentAudio = new Audio(spec.sound);
  currentAudio.volume = 0.85;
  isPlaying = true;
  setSoundButtonState(true);

  currentAudio.addEventListener('ended', () => {
    isPlaying = false;
    setSoundButtonState(false);
  });

  currentAudio.play().catch(() => {
    console.warn(`Couldn't play engine sound for ${spec.name}. Make sure ${spec.sound} exists.`);
    isPlaying = false;
    setSoundButtonState(false);
  });
}

// Tap the car (short press, not a drag) to hear its engine
let pointerDownPos = null;
renderer.domElement.addEventListener('pointerdown', (e) => {
  pointerDownPos = { x: e.clientX, y: e.clientY };
  if (!userInteracted) { userInteracted = true; controls.autoRotate = false; }
});
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!pointerDownPos) return;
  const dx = e.clientX - pointerDownPos.x;
  const dy = e.clientY - pointerDownPos.y;
  const moved = Math.sqrt(dx * dx + dy * dy);
  pointerDownPos = null;
  if (moved < 6) playCarSound();
});

document.getElementById('btnSound').addEventListener('click', playCarSound);

// ---------------- Load a car ----------------
async function loadCar(index) {
  currentIndex = index;
  const spec = CARS[index];
  stopCarSound();

  if (currentCarObj) {
    carGroupHolder.remove(currentCarObj.group);
  }

  const built = await buildCar(spec);
  currentCarObj = built;
  carGroupHolder.add(built.group);

  // Info panel
  document.getElementById('carName').textContent = spec.name;
  document.getElementById('statTop').textContent = spec.top;
  document.getElementById('statZero').textContent = spec.zero;
  document.getElementById('statPower').textContent = spec.power;

  // Gallery active state
  document.querySelectorAll('.car-card').forEach((c, i) => c.classList.toggle('active', i === index));
}

// ---------------- Gallery build ----------------
const galleryEl = document.getElementById('gallery');
CARS.forEach((spec, i) => {
  const card = document.createElement('div');
  card.className = 'car-card';
  card.innerHTML = `<div class="swatch" style="background:#${spec.color.toString(16).padStart(6, '0')}"></div><div class="name">${spec.name.split(' ')[0]}</div>`;
  card.addEventListener('click', () => loadCar(i));
  galleryEl.appendChild(card);
});

// ---------------- Resize ----------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------- Render loop ----------------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// ---------------- Intro sequence ----------------
window.addEventListener('load', () => {
  loadCar(0);
  setTimeout(() => {
    document.getElementById('loading').classList.add('hide');
    document.getElementById('doorTop').classList.add('open');
    document.getElementById('doorBottom').classList.add('open');
    document.getElementById('doorLabel').classList.add('hide');
  }, 500);
  animate();
});

setTimeout(() => {
  const hint = document.getElementById('hint');
  if (hint) hint.style.opacity = '0';
}, 7000);
