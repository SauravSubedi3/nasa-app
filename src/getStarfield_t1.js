import * as THREE from "three";

export default function getStarfield({ numStars = 10000000, numStars2 = 500, numStars3 = 15 } = {}) {
  function randomSpherePoint() {
    const radius = Math.random() * 500 + 500;
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    let x = radius * Math.sin(phi) * Math.cos(theta);
    let y = radius * Math.sin(phi) * Math.sin(theta);
    let z = radius * Math.cos(phi);

    return {
      pos: new THREE.Vector3(x, y, z),
      hue: 0.6,
      minDist: radius,
    };
  }

  function createStars(numStars, texturePath, size) {
    const verts = [];
    const colors = [];
    for (let i = 0; i < numStars; i += 1) {
      let p = randomSpherePoint();
      const { pos, hue } = p;
      const col = new THREE.Color().setHSL(hue, 0.2, Math.random());
      verts.push(pos.x, pos.y, pos.z);
      colors.push(col.r, col.g, col.b);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: size,
      vertexColors: true,
      map: new THREE.TextureLoader().load(texturePath),
    });
    return new THREE.Points(geo, mat);
  }

  const stars1 = createStars(numStars, "./textures/stars/circle.png", 5);
  const stars2 = createStars(numStars2, "./textures/stars/newstar.jpg", 50); // Increased size for new stars
  const stars3 = createStars(numStars3, "./textures/stars/newstar.jpg", 250); // New stars with size 100
  
  const starfield = new THREE.Group();
  starfield.add(stars1);
  starfield.add(stars2);
  starfield.add(stars3); // Add the new stars to the starfield

  return starfield;
}