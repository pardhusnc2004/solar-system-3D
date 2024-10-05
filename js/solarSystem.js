import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const starTexture = textureLoader.load("./image/stars.jpg");
const sunTexture = textureLoader.load("./image/sun.jpg");
const mercuryTexture = textureLoader.load("./image/mercury.jpg");
const venusTexture = textureLoader.load("./image/venus.jpg");
const earthTexture = textureLoader.load("./image/earth.jpg");
const marsTexture = textureLoader.load("./image/mars.jpg");
const jupiterTexture = textureLoader.load("./image/jupiter.jpg");
const saturnTexture = textureLoader.load("./image/saturn.jpg");
const uranusTexture = textureLoader.load("./image/uranus.jpg");
const neptuneTexture = textureLoader.load("./image/neptune.jpg");
const plutoTexture = textureLoader.load("./image/pluto.jpg");
const saturnRingTexture = textureLoader.load("./image/saturn_ring.png");
const uranusRingTexture = textureLoader.load("./image/uranus_ring.png");

const scene = new THREE.Scene();

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  starTexture,
  starTexture,
  starTexture,
  starTexture,
  starTexture,
  starTexture,
]);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-50, 90, 150);

const orbit = new OrbitControls(camera, renderer.domElement);

// Create the Sun
const sunGeo = new THREE.SphereGeometry(15, 50, 50);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeo, sunMaterial);
scene.add(sun);

const sunLight = new THREE.PointLight(0xffffff, 4, 300);
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0);
scene.add(ambientLight);

// Planet orbit paths (elliptical)
const path_of_planets = [];
function createEllipticalOrbit(a, b, color, width) {
  const material = new THREE.LineBasicMaterial({
    color: color,
    linewidth: width,
  });
  const geometry = new THREE.BufferGeometry();
  const ellipsePoints = [];

  const numSegments = 100;
  for (let i = 0; i <= numSegments; i++) {
    const angle = (i / numSegments) * Math.PI * 2;
    const x = a * Math.cos(angle); // semi-major axis
    const z = b * Math.sin(angle); // semi-minor axis
    ellipsePoints.push(x, 0, z);
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(ellipsePoints, 3));
  const ellipse = new THREE.LineLoop(geometry, material);
  scene.add(ellipse);
  path_of_planets.push(ellipse);
}

// Generate a planet, with an optional moon
const generatePlanet = (size, planetTexture, semiMajor, semiMinor, speed, ring, moonTexture = null) => {
  const planetGeometry = new THREE.SphereGeometry(size, 50, 50);
  const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);

  const planetObj = new THREE.Object3D();
  scene.add(planetObj);
  planetObj.add(planet);

  // Add ring if it exists
  if (ring) {
    const ringGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      map: ring.ringmat,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    planetObj.add(ringMesh);
    ringMesh.position.set(0, 0, 0);
    ringMesh.rotation.x = -0.5 * Math.PI;
  }

  // Add a moon if moonTexture is provided
  if (moonTexture) {
    const moonGeo = new THREE.SphereGeometry(1.5, 30, 30);
    const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });
    const moon = new THREE.Mesh(moonGeo, moonMaterial);
    const moonObj = new THREE.Object3D();
    moon.position.set(10, 0, 0);  // Moon's distance from the planet
    moonObj.add(moon);
    planetObj.add(moonObj);  // Attach the Moon to the planet

    planetObj.moonObj = moonObj;  // Store reference to moon object
  }

  // Create elliptical orbit path
  createEllipticalOrbit(semiMajor, semiMinor, 0xffffff, 1);

  return {
    planetObj: planetObj,
    planet: planet,
    semiMajor: semiMajor,
    semiMinor: semiMinor,
    angle: 0,
    speed: speed,
  };
};

// Create the planets with elliptical orbits and attach a moon to Earth
const planets = [
  generatePlanet(3.2, mercuryTexture, 28, 22, 0.004),
  generatePlanet(5.8, venusTexture, 44, 35, 0.015),
  generatePlanet(6, earthTexture, 62, 50, 0.01, null, textureLoader.load("./image/moon.jpg")),  // Earth with Moon
  generatePlanet(4, marsTexture, 78, 65, 0.008),
  generatePlanet(12, jupiterTexture, 100, 85, 0.002),
  generatePlanet(10, saturnTexture, 138, 110, 0.0009, { innerRadius: 10, outerRadius: 20, ringmat: saturnRingTexture }),
  generatePlanet(7, uranusTexture, 176, 145, 0.0004, { innerRadius: 7, outerRadius: 12, ringmat: uranusRingTexture }),
  generatePlanet(7, neptuneTexture, 200, 160, 0.0001),
  generatePlanet(2.8, plutoTexture, 216, 175, 0.0007),
];

// GUI controls
var GUI = dat.gui.GUI;
const gui = new GUI();
const options = {
  "Real view": true,
  "Show path": true,
  speed: 1,
};
gui.add(options, "Real view").onChange((e) => {
  ambientLight.intensity = e ? 0 : 0.5;
});
gui.add(options, "Show path").onChange((e) => {
  path_of_planets.forEach((orbit) => {
    orbit.visible = e;
  });
});
const maxSpeed = new URL(window.location.href).searchParams.get("ms") * 1;
gui.add(options, "speed", 0, maxSpeed ? maxSpeed : 20);

// Create Asteroid Belt
const asteroidBelt = [];
function createAsteroidBelt(minRadius, maxRadius, count) {
  const asteroidGeo = new THREE.SphereGeometry(0.2, 12, 12);
  const asteroidMat = new THREE.MeshStandardMaterial({ color: 0x808080 });

  for (let i = 0; i < count; i++) {
    const radius = THREE.MathUtils.randFloat(minRadius, maxRadius);
    const angle = Math.random() * Math.PI * 2;
    const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);

    asteroid.position.set(radius * Math.cos(angle), 0, radius * Math.sin(angle));
    scene.add(asteroid);
    
    asteroidBelt.push({
      mesh: asteroid,
      radius: radius,
      angle: angle,
      speed: THREE.MathUtils.randFloat(0.0005, 0.002),
    });
  }
}

// Add asteroid belt between Mars and Jupiter
createAsteroidBelt(85, 95, 2000);
createAsteroidBelt(0, 1000, 5000)

// Store details of planets
const objectsData = [
  {
    name: 'Sun',
    details: `
      <strong>Description:</strong> The Sun is the star at the center of the Solar System.<br>
      <strong>Distance from sun (approx):</strong> 0 km<br>
      <strong>Revolution time:</strong> N/A<br>
      <strong>Rotation time:</strong> 25 days<br>
      <strong>Number of moons:</strong> 0<br>
      <strong>Diameter:</strong> 1.39 million km<br>
      <strong>Significance:</strong> The Sun provides the energy necessary for life on Earth.
    `,
    object: sun,
  },
  {
    name: 'Mercury',
    details: `
      <strong>Description:</strong> Mercury is the smallest and closest planet to the Sun.<br>
      <strong>Distance from sun (approx):</strong> 57.9 million km<br>
      <strong>Revolution time:</strong> 0.24 Earth years<br>
      <strong>Rotation time:</strong> 58.6 Earth days<br>
      <strong>Number of moons:</strong> 0<br>
      <strong>Diameter:</strong> 4,880 km<br>
      <strong>Significance:</strong> Mercury is known for its extreme temperatures and being the closest planet to the Sun.
    `,
    object: planets[0].planet,
  },
  {
    name: 'Venus',
    details: `
      <strong>Description:</strong> Venus is the second planet from the Sun and is similar in size to Earth.<br>
      <strong>Distance from sun (approx):</strong> 108.2 million km<br>
      <strong>Revolution time:</strong> 0.62 Earth years<br>
      <strong>Rotation time:</strong> 243 Earth days<br>
      <strong>Number of moons:</strong> 0<br>
      <strong>Diameter:</strong> 12,104 km<br>
      <strong>Significance:</strong> Venus has a thick, toxic atmosphere that traps heat, making it the hottest planet.
    `,
    object: planets[1].planet,
  },
  {
    name: 'Earth',
    details: `
      <strong>Description:</strong> Earth is the third planet from the Sun and the only known planet with life.<br>
      <strong>Distance from sun (approx):</strong> 149.6 million km<br>
      <strong>Revolution time:</strong> 1 Earth year<br>
      <strong>Rotation time:</strong> 24 hours<br>
      <strong>Number of moons:</strong> 1<br>
      <strong>Diameter:</strong> 12,742 km<br>
      <strong>Significance:</strong> Earth is the only planet known to support life and has liquid water on its surface.
    `,
    object: planets[2].planet,
  },
  {
    name: 'Mars',
    details: `
      <strong>Description:</strong> Mars is the fourth planet from the Sun, often called the Red Planet.<br>
      <strong>Distance from sun (approx):</strong> 227.9 million km<br>
      <strong>Revolution time:</strong> 1.88 Earth years<br>
      <strong>Rotation time:</strong> 24.6 hours<br>
      <strong>Number of moons:</strong> 2<br>
      <strong>Diameter:</strong> 6,779 km<br>
      <strong>Significance:</strong> Mars is a potential target for future human exploration due to its relatively Earth-like conditions.
    `,
    object: planets[3].planet,
  },
  {
    name: 'Jupiter',
    details: `
      <strong>Description:</strong> Jupiter is the largest planet in the Solar System.<br>
      <strong>Distance from sun (approx):</strong> 778.3 million km<br>
      <strong>Revolution time:</strong> 11.86 Earth years<br>
      <strong>Rotation time:</strong> 9.9 hours<br>
      <strong>Number of moons:</strong> 79<br>
      <strong>Diameter:</strong> 139,822 km<br>
      <strong>Significance:</strong> Jupiter's Great Red Spot is a giant storm that has been ongoing for centuries.
    `,
    object: planets[4].planet,
  },
  {
    name: 'Saturn',
    details: `
      <strong>Description:</strong> Saturn is the sixth planet from the Sun, famous for its stunning rings.<br>
      <strong>Distance from sun (approx):</strong> 1.43 billion km<br>
      <strong>Revolution time:</strong> 29.46 Earth years<br>
      <strong>Rotation time:</strong> 10.7 hours<br>
      <strong>Number of moons:</strong> 83<br>
      <strong>Diameter:</strong> 120,536 km<br>
      <strong>Significance:</strong> Saturn's rings are made of ice and rock particles and are the largest in the Solar System.
    `,
    object: planets[5].planet,
  },
  {
    name: 'Uranus',
    details: `
      <strong>Description:</strong> Uranus is the seventh planet from the Sun and orbits on its side.<br>
      <strong>Distance from sun (approx):</strong> 2.87 billion km<br>
      <strong>Revolution time:</strong> 84 Earth years<br>
      <strong>Rotation time:</strong> 17 hours<br>
      <strong>Number of moons:</strong> 27<br>
      <strong>Diameter:</strong> 50,724 km<br>
      <strong>Significance:</strong> Uranus has a blue-green color due to methane in its atmosphere.
    `,
    object: planets[6].planet,
  },
  {
    name: 'Neptune',
    details: `
      <strong>Description:</strong> Neptune is the eighth and farthest planet from the Sun.<br>
      <strong>Distance from sun (approx):</strong> 4.5 billion km<br>
      <strong>Revolution time:</strong> 164.8 Earth years<br>
      <strong>Rotation time:</strong> 16 hours<br>
      <strong>Number of moons:</strong> 14<br>
      <strong>Diameter:</strong> 49,244 km<br>
      <strong>Significance:</strong> Neptune has strong winds and a storm system similar to Jupiter's Great Red Spot.
    `,
    object: planets[7].planet,
  },
  {
    name: 'Pluto',
    details: `
      <strong>Description:</strong> Pluto, now classified as a dwarf planet, is located in the Kuiper Belt.<br>
      <strong>Distance from sun (approx):</strong> 5.91 billion km<br>
      <strong>Revolution time:</strong> 248 Earth years<br>
      <strong>Rotation time:</strong> 6.4 Earth days<br>
      <strong>Number of moons:</strong> 5<br>
      <strong>Diameter:</strong> 2,377 km<br>
      <strong>Significance:</strong> Pluto was reclassified as a dwarf planet in 2006.
    `,
    object: planets[8].planet,
  },
];

// Hover effect
const hoverContainer = document.createElement('div');
hoverContainer.style.position = 'absolute';
hoverContainer.style.color = 'white';
hoverContainer.style.padding = '10px';
hoverContainer.style.borderRadius = '8px';
hoverContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
hoverContainer.style.display = 'none';
hoverContainer.style.fontSize = '14px';
document.body.appendChild(hoverContainer);

// Raycaster for detecting hover
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(objectsData.map(data => data.object));

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    const objectData = objectsData.find(data => data.object === intersectedObject);
    
    if (objectData) {
      hoverContainer.innerHTML = `<strong>${objectData.name}</strong><br>${objectData.details}`;
      hoverContainer.style.left = event.clientX + 'px';
      hoverContainer.style.top = event.clientY + 'px';
      hoverContainer.style.display = 'block';
    }
  } else {
    hoverContainer.style.display = 'none';
  }
}

window.addEventListener('mousemove', onMouseMove);

function animate() {
  // Sun rotation
  sun.rotateY(options.speed * 0.004);

  // Planets' elliptical orbits and self-rotation
  planets.forEach((planetData) => {
    planetData.angle += options.speed * planetData.speed;
    planetData.planetObj.position.x = planetData.semiMajor * Math.cos(planetData.angle);
    planetData.planetObj.position.z = planetData.semiMinor * Math.sin(planetData.angle);
    planetData.planet.rotateY(options.speed * planetData.speed);

    // If the planet has a moon (Earth), rotate its moon around the planet
    if (planetData.planetObj.moonObj) {
      planetData.planetObj.moonObj.rotation.y += 0.02;
    }
  });

  // Asteroids' elliptical orbits
  asteroidBelt.forEach((asteroidData) => {
    asteroidData.angle += options.speed * asteroidData.speed;
    asteroidData.mesh.position.x = asteroidData.radius * Math.cos(asteroidData.angle);
    asteroidData.mesh.position.z = asteroidData.radius * Math.sin(asteroidData.angle);
  });

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Resize handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
