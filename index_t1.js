import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import getStarfield from "./src/getStarfield_t1.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 200;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

// Load background texture
const loader = new THREE.TextureLoader();

const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
const sunTexture = loader.load('./sun_tx/suntx.jpeg');
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sunMesh);

new OrbitControls(camera, renderer.domElement);

const stars = getStarfield({ numStars: 2000 });
scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);

// Create a pivot point for the planets
const pivot = new THREE.Object3D();
pivot.position.set(0, 0, 0);
scene.add(pivot);

// Function to create a planet with texture and inclination
function createPlanet(texturePath, size, distance, speed, inclination) {
  const planetGeometry = new THREE.SphereGeometry(size, 32, 32);
  const planetTexture = loader.load(texturePath);
  const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);

  // Create a pivot for the planet to handle inclination
  const planetPivot = new THREE.Object3D();
  planetPivot.rotation.z = THREE.MathUtils.degToRad(inclination);
  pivot.add(planetPivot);

  planet.position.x = distance;
  planetPivot.add(planet);

  planet.userData = { distance: distance, speed: speed, inclination: inclination };

  return planet;
}

// Function to create an orbital path
function createOrbitPath(distance, tiltX, tiltY, tiltZ) {
  const curve = new THREE.EllipseCurve(
    0, 0, // ax, aY
    distance, distance, // xRadius, yRadius
    0, 2 * Math.PI, // startAngle, endAngle
    false, // clockwise
    0 // rotation
  );

  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });

  const ellipse = new THREE.Line(geometry, material);
  ellipse.rotation.x = THREE.MathUtils.degToRad(tiltX);
  ellipse.rotation.y = THREE.MathUtils.degToRad(tiltY);
  ellipse.rotation.z = THREE.MathUtils.degToRad(tiltZ);
  scene.add(ellipse);
}

// Add the orbital paths for the planets
createOrbitPath(11, 83, 7, 0); // Mercury
createOrbitPath(15, 88, 3, 0); // Venus
createOrbitPath(20, 65, 22, 0); // Earth
createOrbitPath(30, 62, 22, 0); // Mars
createOrbitPath(50, 87, 4, 0); // Jupiter
createOrbitPath(70, 61, 24, 0); // Saturn
createOrbitPath(90, 1, -8, 0); // Uranus
createOrbitPath(110, 58, 25, 0); // Neptune

// Orbits of asteroids
//createOrbitPath(104, 70, 20, 0); // Small Sphere

// Add the planets with textures, approximate distances, speeds, and inclinations
const planets = [
  createPlanet('./sun_tx/mercurytx.jpg', 0.4, 11, 0.004, 7), // Mercury
  createPlanet('./sun_tx/venustx.jpg', 0.8, 15, 0.0016, 3.39), // Venus
  createPlanet('./sun_tx/earthtx.jpeg', 1, 20, 0.001, 23.5), // Earth
  createPlanet('./sun_tx/marstx.jpg', 0.5, 30, 0.0008, 25.19), // Mars
  createPlanet('./sun_tx/jupitertx.jpeg', 2, 50, 0.0004, 3.13), // Jupiter
  createPlanet('./sun_tx/saturntx.jpg', 1.7, 70, 0.0003, 26.73), // Saturn
  createPlanet('./sun_tx/uranustx.jpeg', 1.2, 90, 0.0002, 97.77), // Uranus
  createPlanet('./sun_tx/neptunetx.jpeg', 1.1, 110, 0.0001, 28.32), // Neptune

  // Adding asteroids in the space
  createPlanet('./sun_tx/moontx.jpg', 0.5, 104, 0.001, 20), // Lucy asteroid
  createPlanet('./sun_tx/moontx.jpg', 0.5, 133, 0.0001, 13), // bennu asteroid
  createPlanet('./sun_tx/moontx.jpg', 0.5, 58, 0.009, 75), // leucos asteroid
  createPlanet('./sun_tx/moontx.jpg', 0.5, 287, 0.001, 75), //  asteroid
  createPlanet('./sun_tx/moontx.jpg', 0.5, 250, 0.06, 75), //  asteroid
  createPlanet('./sun_tx/moontx.jpg', 0.5, 217, 0.069, 75), //  asteroid
  createPlanet('./sun_tx/moontx.jpg', 0.5, 337, 0.00001, 75), //  asteroid
  createPlanet('./sun_tx/moontx.jpg', 0.5, 177, 0.003, 75), //  asteroid
  createPlanet('./sun_tx/moontx.jpg', 0.5, 117, 0.008, 75), //  asteroid
  createPlanet('./sun_tx/moontx.jpg', 0.5, 150, 0.039, 75) //  asteroid
];

// Function to create a moon revolving around the Earth
function createMoon(texturePath, size, distance, speed, parent) {
  const moonGeometry = new THREE.SphereGeometry(size, 32, 32);
  const moonTexture = loader.load(texturePath);
  const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });
  const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  moon.userData = { distance: distance, speed: speed };
  parent.add(moon);

  return moon;
}

// Add a moon to Earth
const earth = planets[2];
const moon = createMoon('./sun_tx/moontx.jpg', 0.27, 2, 0.01, earth);

// Create a GUI for controlling the speed
const gui = document.createElement('div');
gui.style.position = 'absolute';
gui.style.top = '10px';
gui.style.left = '10px';
gui.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
gui.style.padding = '10px';
gui.style.borderRadius = '5px';
document.body.appendChild(gui);

const speedLabel = document.createElement('label');
speedLabel.innerText = 'Rotation Speed: ';
gui.appendChild(speedLabel);

const speedInput = document.createElement('input');
speedInput.type = 'range';
speedInput.min = '0.1';
speedInput.max = '2';
speedInput.step = '0.1';
speedInput.value = '1';
gui.appendChild(speedInput);

let rotationSpeedMultiplier = parseFloat(speedInput.value);
speedInput.addEventListener('input', () => {
  rotationSpeedMultiplier = parseFloat(speedInput.value);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  stars.rotation.y -= 0.0002;

  planets.forEach(planet => {
    const angle = Date.now() * planet.userData.speed * rotationSpeedMultiplier;
    planet.position.x = planet.userData.distance * Math.cos(angle);
    planet.position.y = planet.userData.distance * Math.sin(angle) * Math.sin(THREE.MathUtils.degToRad(planet.userData.inclination));
    planet.position.z = planet.userData.distance * Math.sin(angle) * Math.cos(THREE.MathUtils.degToRad(planet.userData.inclination));
  });

  moon.position.x = moon.userData.distance * Math.cos(Date.now() * moon.userData.speed * rotationSpeedMultiplier);
  moon.position.z = moon.userData.distance * Math.sin(Date.now() * moon.userData.speed * rotationSpeedMultiplier);

  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});