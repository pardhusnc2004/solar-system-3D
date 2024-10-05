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

const neoTexture1 = textureLoader.load("./image/stone.jpg");
const neoTexture2 = textureLoader.load("./image/stone.jpg");
const neoTexture3 = textureLoader.load("./image/stone.jpg");
const neoTexture4 = textureLoader.load("./image/stone.jpg");

const phoTexture1 = textureLoader.load("./image/stone.jpg");
const phoTexture2 = textureLoader.load("./image/stone.jpg");
const phoTexture3 = textureLoader.load("./image/stone.jpg");
const phoTexture4 = textureLoader.load("./image/stone.jpg");

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
function createEllipticalOrbit(a, b, inclination = 0, color = 0xffffff, width = 1) {
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

  // Apply inclination (tilt the orbit)
  ellipse.rotation.x = THREE.Math.degToRad(inclination);  // Rotate in the x-axis to apply inclination

  scene.add(ellipse);
  path_of_planets.push(ellipse);
  
  return ellipse;
}


// Generate a planet, with an optional moon
const generatePlanet = (size, planetTexture, semiMajor, semiMinor, inclination, speed, ring, moonTexture = null) => {
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
    moonObj.name = "Moon";  // Give the Moon a name for raycasting
    moon.position.set(10, 0, 0);  // Moon's distance from the planet
    
    moonObj.add(moon);
    planetObj.add(moonObj);  // Attach the Moon to the planet
  
    planetObj.moonObj = moonObj;  // Store reference to moon object
  }

  // Create elliptical orbit path with inclination
  const orbit = createEllipticalOrbit(semiMajor, semiMinor, inclination, 0xffffff, 1);

  return {
    planetObj: planetObj,
    planet: planet,
    orbit: orbit,
    semiMajor: semiMajor,
    semiMinor: semiMinor,
    inclination: inclination * (Math.PI / 180), // Convert inclination to radians
    angle: 0,
    speed: speed,
  };
};


// Create the planets with elliptical orbits and attach a moon to Earth
const planets = [
  generatePlanet(3.2, mercuryTexture, 28, 22, 7.0, 0.004),  // Mercury with 7° inclination
  generatePlanet(5.8, venusTexture, 44, 35, 3.4, 0.015),  // Venus with 3.4° inclination
  generatePlanet(6, earthTexture, 62, 50, 0.0, 0.01, null, textureLoader.load("./image/moon.jpg")),  // Earth with 0° inclination and Moon
  generatePlanet(4, marsTexture, 78, 65, 1.85, 0.008),  // Mars with 1.85° inclination
  generatePlanet(12, jupiterTexture, 100, 85, 1.3, 0.002),  // Jupiter with 1.3° inclination
  generatePlanet(10, saturnTexture, 138, 110, 2.49, 0.0009, { innerRadius: 10, outerRadius: 20, ringmat: saturnRingTexture }),  // Saturn with 2.49° inclination
  generatePlanet(7, uranusTexture, 176, 145, 0.77, 0.0004, { innerRadius: 7, outerRadius: 12, ringmat: uranusRingTexture }),  // Uranus with 0.77° inclination
  generatePlanet(7, neptuneTexture, 200, 160, 1.77, 0.0001),  // Neptune with 1.77° inclination
  generatePlanet(2.8, plutoTexture, 216, 175, 17.16, 0.0007),  // Pluto with 17.16° inclination
];

// GUI controls
var GUI = dat.gui.GUI;
const gui = new GUI();
const options = {
  "Real view": false,
  "Show path": false,
  "Show NEOs": false,    // Add this
  "Show PHOs": false,    // Add this
  speed: 5,
};
gui.add(options, "Real view").onChange((e) => {
  ambientLight.intensity = e ? 0 : 0.5;
});

gui.add(options, "Show path").onChange((e) => {
  path_of_planets.forEach((orbit) => {
    orbit.visible = e;
  });
});

gui.add(options, "Show NEOs").onChange((visible) => {
  neoBodiesWithTail.forEach(neo => {
    neo.bodyObj.visible = visible;
    // Also hide/show the tail particles
    neo.tail.forEach(particle => {
      particle.visible = visible;
    });
  });
});

gui.add(options, "Show PHOs").onChange((visible) => {
  phoBodiesWithTail.forEach(pho => {
    pho.bodyObj.visible = visible;
    // Also hide/show the tail particles
    pho.tail.forEach(particle => {
      particle.visible = visible;
    });
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

const neos = [
  { name: 'Apollo', diameter: 1.1, a: 70, e: 0.7, i: 10, texture: neoTexture1 },
  { name: 'Amor', diameter: 0.9, a: 80, e: 0.4, i: 5, texture: neoTexture2 },
  { name: 'Aten', diameter: 1.0, a: 85, e: 0.5, i: 8, texture: neoTexture3 },
  { name: 'Phaethon', diameter: 1.1, a: 90, e: 0.6, i: 7, texture: neoTexture4 },
  { name: 'Eros', diameter: 0.8, a: 95, e: 0.3, i: 11, texture: neoTexture1 },
  { name: 'Ganymed', diameter: 0.7, a: 100, e: 0.4, i: 9, texture: neoTexture2 },
  { name: 'Icarus', diameter: 1.2, a: 105, e: 0.5, i: 6, texture: neoTexture3 },
  { name: 'Geographos', diameter: 0.6, a: 110, e: 0.4, i: 15, texture: neoTexture4 },
  { name: 'Hathor', diameter: 1.1, a: 115, e: 0.5, i: 12, texture: neoTexture1 },
  { name: 'Toro', diameter: 1.0, a: 120, e: 0.3, i: 5, texture: neoTexture2 },
  { name: 'Anteros', diameter: 0.9, a: 125, e: 0.6, i: 10, texture: neoTexture3 },
  { name: 'Alinda', diameter: 0.8, a: 130, e: 0.7, i: 14, texture: neoTexture4 },
  { name: 'Bacchus', diameter: 1.2, a: 135, e: 0.5, i: 7, texture: neoTexture1 },
  { name: 'Castalia', diameter: 0.9, a: 140, e: 0.6, i: 8, texture: neoTexture2 },
  { name: 'Hermes', diameter: 0.8, a: 145, e: 0.7, i: 5, texture: neoTexture3 },
  { name: 'Hektor', diameter: 1.1, a: 150, e: 0.4, i: 11, texture: neoTexture4 },
  { name: 'Orpheus', diameter: 1.0, a: 155, e: 0.6, i: 9, texture: neoTexture1 },
  { name: 'Daedalus', diameter: 1.2, a: 160, e: 0.5, i: 10, texture: neoTexture2 },
  { name: 'Juno', diameter: 1.1, a: 165, e: 0.3, i: 12, texture: neoTexture3 },
  { name: 'Kleopatra', diameter: 0.7, a: 170, e: 0.4, i: 15, texture: neoTexture4 }
];

const phos = [
  { name: 'Apophis', diameter: 0.9, a: 180, e: 0.7, i: 20, texture: phoTexture1 },
  { name: 'Toutatis', diameter: 0.8, a: 190, e: 0.5, i: 25, texture: phoTexture2 },
  { name: 'Bennu', diameter: 0.6, a: 200, e: 0.4, i: 15, texture: phoTexture3 },
  { name: '1999 RQ36', diameter: 0.9, a: 210, e: 0.6, i: 10, texture: phoTexture4 },
  { name: 'Didymos', diameter: 1.0, a: 220, e: 0.5, i: 8, texture: phoTexture1 },
  { name: 'Psyche', diameter: 1.2, a: 230, e: 0.7, i: 7, texture: phoTexture2 },
  { name: 'Ryugu', diameter: 1.1, a: 240, e: 0.3, i: 11, texture: phoTexture3 },
  { name: 'Florence', diameter: 1.2, a: 250, e: 0.4, i: 9, texture: phoTexture4 },
  { name: 'Aegis', diameter: 1.0, a: 260, e: 0.6, i: 12, texture: phoTexture1 },
  { name: '2005 YU55', diameter: 0.8, a: 270, e: 0.5, i: 14, texture: phoTexture2 },
  { name: '1998 OR2', diameter: 1.1, a: 280, e: 0.4, i: 5, texture: phoTexture3 },
  { name: '1989 JA', diameter: 0.9, a: 290, e: 0.7, i: 10, texture: phoTexture4 },
  { name: '2007 VK184', diameter: 1.2, a: 300, e: 0.5, i: 7, texture: phoTexture1 },
  { name: '1997 XF11', diameter: 0.7, a: 310, e: 0.6, i: 8, texture: phoTexture2 },
  { name: '1994 WR12', diameter: 1.0, a: 320, e: 0.5, i: 11, texture: phoTexture3 },
  { name: '1991 VG', diameter: 1.1, a: 330, e: 0.4, i: 6, texture: phoTexture4 },
  { name: '2012 DA14', diameter: 1.2, a: 340, e: 0.7, i: 12, texture: phoTexture1 },
  { name: '2014 JO25', diameter: 1.0, a: 350, e: 0.5, i: 10, texture: phoTexture2 },
  { name: '2013 TX68', diameter: 0.9, a: 360, e: 0.6, i: 8, texture: phoTexture3 },
  { name: '2010 RF12', diameter: 1.1, a: 370, e: 0.4, i: 9, texture: phoTexture4 }
];


// Function to create NEO/PHO with elliptical orbit
const createOrbitingBodyWithoutOrbit = (name, diameter, semiMajor, eccentricity, inclination, texture) => {
  const geometry = new THREE.SphereGeometry(diameter, 32, 32);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const body = new THREE.Mesh(geometry, material);

  const bodyObj = new THREE.Object3D();
  scene.add(bodyObj);
  bodyObj.add(body);

  const semiMinor = semiMajor * Math.sqrt(1 - eccentricity * eccentricity);

  return {
    name: name,
    bodyObj: bodyObj,
    semiMajor: semiMajor,
    semiMinor: semiMinor,
    inclination: inclination * (Math.PI / 180),
    angle: 0,
    speed: 0.001 + Math.random() * 0.001  // Randomize speed slightly for variety
  };
};

// Create NEOs and PHOs
const neoBodies = neos.map(neo => createOrbitingBodyWithoutOrbit(neo.name, neo.diameter, neo.a, neo.e, neo.i, neo.texture));
const phoBodies = phos.map(pho => createOrbitingBodyWithoutOrbit(pho.name, pho.diameter, pho.a, pho.e, pho.i, pho.texture));

// Add animation for NEO/PHO movement
function animateNEOsAndPHOs(bodies) {
  bodies.forEach((bodyData) => {
    bodyData.angle += options.speed * bodyData.speed;

    // Calculate the position along the elliptical orbit using angle
    const x = bodyData.semiMajor * Math.cos(bodyData.angle);
    const z = bodyData.semiMinor * Math.sin(bodyData.angle);

    // Apply inclination and position the body
    bodyData.bodyObj.position.set(
      x * Math.cos(bodyData.inclination),
      x * Math.sin(bodyData.inclination),
      z
    );

    bodyData.bodyObj.rotation.y += 0.01;  // Rotate the body for a better visual effect
  });
}


function createTail(neoOrPhoObj, color, tailLength = 100, tailThickness = 0.25) {
  const particles = [];
  const particleMaterial = new THREE.MeshBasicMaterial({ color: color });

  // Create particles for the tail
  for (let i = 0; i < tailLength; i++) {
    const particleGeometry = new THREE.SphereGeometry(tailThickness, 16, 16);  // Increased size and segments for thicker tail
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    
    particle.position.set(neoOrPhoObj.position.x, neoOrPhoObj.position.y, neoOrPhoObj.position.z);
    particles.push(particle);
    scene.add(particle);
  }

  return particles;
}

// Update the particle positions to create the tail effect
function updateTail(particles, neoOrPhoObj) {
  for (let i = particles.length - 1; i > 0; i--) {
      particles[i].position.copy(particles[i - 1].position);
  }
  particles[0].position.set(neoOrPhoObj.position.x, neoOrPhoObj.position.y, neoOrPhoObj.position.z);
}

// Generate NEOs and PHOs without orbits, with tail effect
const createNEOorPHOWithTail = (name, diameter, semiMajor, eccentricity, inclination, texture, tailColor) => {
  const geometry = new THREE.SphereGeometry(diameter, 32, 32);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const body = new THREE.Mesh(geometry, material);

  const bodyObj = new THREE.Object3D();
  scene.add(bodyObj);
  bodyObj.add(body);

  const semiMinor = semiMajor * Math.sqrt(1 - eccentricity * eccentricity);
  
  // Set the inclination (Kepler’s variable) to the object
  bodyObj.rotation.z = inclination * (Math.PI / 180);  // Apply inclination (tilt)

  // Create the tail for the NEO or PHO
  const tail = createTail(bodyObj, tailColor);

  return {
      name: name,
      bodyObj: bodyObj,
      semiMajor: semiMajor,
      semiMinor: semiMinor,
      inclination: inclination * (Math.PI / 180),
      angle: 0,
      speed: 0.001 + Math.random() * 0.001,  // Randomize speed slightly for variety
      tail: tail
  };
};

// NEOs and PHOs with tail effect
const neoBodiesWithTail = neos.map(neo => createNEOorPHOWithTail(neo.name, neo.diameter, neo.a, neo.e, neo.i, neo.texture, 0xff0000));  // Red tail for NEOs
const phoBodiesWithTail = phos.map(pho => createNEOorPHOWithTail(pho.name, pho.diameter, pho.a, pho.e, pho.i, pho.texture, 0xff9900));  // Orange tail for PHOs

// Function to animate NEOs and PHOs along with their tails
function animateNEOsAndPHOsWithTail(bodies) {
  bodies.forEach((bodyData) => {
      bodyData.angle += options.speed * bodyData.speed;

      // Calculate the position along the elliptical orbit using angle
      const x = bodyData.semiMajor * Math.cos(bodyData.angle);
      const z = bodyData.semiMinor * Math.sin(bodyData.angle);

      // Apply inclination (Kepler's i) and set position of the body
      bodyData.bodyObj.position.set(
          x * Math.cos(bodyData.inclination),
          x * Math.sin(bodyData.inclination),
          z
      );

      bodyData.bodyObj.rotation.y += 0.01;  // Rotate the body

      // Update tail to follow the object
      updateTail(bodyData.tail, bodyData.bodyObj);
  });
}

const neoData = neoBodiesWithTail.map(neo => ({
  name: neo.name,
  details: `
    <strong>Description:</strong> NEO: ${neo.name}<br>
    <strong>Diameter:</strong> ${neo.diameter} km<br>
    <strong>Orbit Eccentricity:</strong> ${neo.e}<br>
    <strong>Inclination:</strong> ${neo.i} degrees
  `,
  object: neo.bodyObj,  // This should be the 3D object of the NEO
}));

// Add PHOs to objectsData
const phoData = phoBodiesWithTail.map(pho => ({
  name: pho.name,
  details: `
    <strong>Description:</strong> PHO: ${pho.name}<br>
    <strong>Diameter:</strong> ${pho.diameter} km<br>
    <strong>Orbit Eccentricity:</strong> ${pho.e}<br>
    <strong>Inclination:</strong> ${pho.i} degrees
  `,
  object: pho.bodyObj,  // This should be the 3D object of the PHO
}));

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
    name: 'Moon',
    details: `
      <strong>Description:</strong> The Moon is Earth's only natural satellite.<br>
      <strong>Distance from Earth:</strong> 384,400 km<br>
      <strong>Revolution time:</strong> 27.3 days<br>
      <strong>Diameter:</strong> 3,474 km<br>
      <strong>Significance:</strong> The Moon influences Earth's tides and stabilizes Earth's axial tilt.
    `,
    object: planets[2].planetObj.moonObj,  // Earth's moon object
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
  {
    name: 'Midas',
    details: `
      <strong>Description:</strong> NEO: Midas<br>
      <strong>Diameter:</strong> 0.92 km<br>
      <strong>Orbit Eccentricity:</strong> 0.6<br>
      <strong>Inclination:</strong> 10 degrees
    `,
    object: neoBodiesWithTail[0].bodyObj,
  },
  {
    name: 'Oljato',
    details: `
      <strong>Description:</strong> NEO: Oljato<br>
      <strong>Diameter:</strong> 0.922 km<br>
      <strong>Orbit Eccentricity:</strong> 0.5<br>
      <strong>Inclination:</strong> 15 degrees
    `,
    object: neoBodiesWithTail[1].bodyObj,
  },
  {
    name: 'Eros',
    details: `
      <strong>Description:</strong> NEO: Eros<br>
      <strong>Diameter:</strong> 0.925 km<br>
      <strong>Orbit Eccentricity:</strong> 0.23<br>
      <strong>Inclination:</strong> 11 degrees
    `,
    object: neoBodiesWithTail[2].bodyObj,
  },
  {
    name: 'Ganymed',
    details: `
      <strong>Description:</strong> NEO: Ganymed<br>
      <strong>Diameter:</strong> 0.932 km<br>
      <strong>Orbit Eccentricity:</strong> 0.23<br>
      <strong>Inclination:</strong> 26 degrees
    `,
    object: neoBodiesWithTail[3].bodyObj,
  },
  {
    name: 'Toutatis',
    details: `
      <strong>Description:</strong> PHO: Toutatis<br>
      <strong>Diameter:</strong> 0.93 km<br>
      <strong>Orbit Eccentricity:</strong> 0.7<br>
      <strong>Inclination:</strong> 20 degrees
    `,
    object: phoBodiesWithTail[0].bodyObj,
  },
  {
    name: 'Apophis',
    details: `
      <strong>Description:</strong> PHO: Apophis<br>
      <strong>Diameter:</strong> 0.925 km<br>
      <strong>Orbit Eccentricity:</strong> 0.6<br>
      <strong>Inclination:</strong> 25 degrees
    `,
    object: phoBodiesWithTail[1].bodyObj,
  },
  {
    name: 'Bennu',
    details: `
      <strong>Description:</strong> PHO: Bennu<br>
      <strong>Diameter:</strong> 0.923 km<br>
      <strong>Orbit Eccentricity:</strong> 0.35<br>
      <strong>Inclination:</strong> 6 degrees
    `,
    object: phoBodiesWithTail[2].bodyObj,
  },
  {
    name: '1999 RQ36',
    details: `
      <strong>Description:</strong> PHO: 1999 RQ36<br>
      <strong>Diameter:</strong> 0.928 km<br>
      <strong>Orbit Eccentricity:</strong> 0.35<br>
      <strong>Inclination:</strong> 10 degrees
    `,
    object: phoBodiesWithTail[3].bodyObj,
  },
];



console.log("NEO Bodies:", neoBodiesWithTail);
console.log("PHO Bodies:", phoBodiesWithTail);
console.log("Moon:", planets[2].planetObj.moonObj);


function createLabel(text, position) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  const fontSize = 64;
  canvas.width = 512;  // Setting high resolution for the text
  canvas.height = 128;
  context.font = `${fontSize}px Arial`;
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);

  sprite.position.set(position.x, position.y + 10, position.z);  // Offset the label slightly above the NEO/PHO
  sprite.scale.set(20, 10, 1);  // Adjust the size of the label sprite

  return sprite;
}

// Function to add labels for NEOs and PHOs
// Function to add labels for NEOs and PHOs
function addNEOAndPHOLabels() {
  // Add labels for NEOs
  neoBodiesWithTail.forEach((neo) => {
    const label = createLabel(neo.name, neo.bodyObj.position);
    neo.bodyObj.add(label);  // Attach label to NEO object
  });

  // Add labels for PHOs
  phoBodiesWithTail.forEach((pho) => {
    const label = createLabel(pho.name, pho.bodyObj.position);
    pho.bodyObj.add(label);  // Attach label to PHO object
  });
}

// Call the function to add NEO and PHO labels
addNEOAndPHOLabels();

// Function to make labels face the camera
function updateLabelsFacingCamera() {
  scene.traverse((object) => {
    if (object.isSprite) {
      object.lookAt(camera.position);  // Make sure labels face the camera
    }
  });
}


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

  
  animateNEOsAndPHOsWithTail(neoBodiesWithTail);
  animateNEOsAndPHOsWithTail(phoBodiesWithTail);

  // Ensure the labels always face the camera
  updateLabelsFacingCamera();

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
