const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const hero = document.querySelector('.hero');
const canvas = document.querySelector('.hero-scene');

if (hero && canvas && !motion.matches && 'WebGL2RenderingContext' in window) {
  const threeUrl = 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
  import(/* @vite-ignore */ threeUrl).then(startScene).catch(error => {
    console.warn('Portfolio hero animation unavailable', error);
  });
}

function startScene(THREE) {
  if (motion.matches) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.z = 8;
  const orbits = new THREE.Group();
  scene.add(orbits);

  const ringColors = [0xe1b86d, 0x648baf, 0xdabf94];
  ringColors.forEach((color, index) => {
    const points = Array.from({ length: 121 }, (_, step) => {
      const angle = step / 120 * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * (1.5 + index * 0.3), Math.sin(angle) * 0.72, 0);
    });
    const ring = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 - index * 0.06 })
    );
    ring.rotation.set(0.3 + index * 0.56, 0.2 + index * 0.37, index * 0.65 - 0.28);
    orbits.add(ring);
    const satellite = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 12, 8),
      new THREE.MeshBasicMaterial({ color })
    );
    ring.add(satellite);
  });

  const positions = new Float32Array(180 * 3);
  for (let index = 0; index < positions.length; index += 3) {
    positions[index] = (Math.random() - 0.5) * 15;
    positions[index + 1] = (Math.random() - 0.5) * 9;
    positions[index + 2] = (Math.random() - 0.5) * 5;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({ color: 0xd5b77d, size: 0.026, transparent: true, opacity: 0.48, depthWrite: false })
  );
  scene.add(dust);

  let inView = false;
  let contextLost = false;
  let frame = null;
  let previousTime = null;
  let elapsed = 0;
  let pointerX = 0;
  let pointerY = 0;
  let centerX = 0;

  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
    centerX = width > 760 ? Math.min(2.5, camera.aspect * 1.05) : 0;
  }

  function draw(time) {
    elapsed += previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    const easing = 1 - Math.exp(-elapsed * 1.8);
    orbits.position.x += (centerX + pointerX * 0.35 - orbits.position.x) * 0.055;
    orbits.rotation.x += (pointerY * 0.25 - orbits.rotation.x) * 0.05;
    orbits.rotation.y = elapsed * 0.18;
    orbits.rotation.z = -0.2 + elapsed * 0.05;
    orbits.scale.setScalar(0.82 + easing * 0.18);
    dust.rotation.y = elapsed * 0.035;

    orbits.children.forEach((ring, index) => {
      const angle = elapsed * (0.75 + index * 0.22) + index * 2;
      ring.children[0].position.set(Math.cos(angle) * (1.5 + index * 0.3), Math.sin(angle) * 0.72, 0);
    });

    renderer.render(scene, camera);
    frame = requestAnimationFrame(draw);
  }

  function syncAnimation() {
    const enabled = !motion.matches && !contextLost;
    canvas.classList.toggle('is-active', enabled);
    if (enabled && inView && !document.hidden) {
      if (frame === null) frame = requestAnimationFrame(draw);
    } else if (frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
      previousTime = null;
    }
  }

  resize();
  orbits.position.x = centerX;
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncAnimation();
  }).observe(hero);
  hero.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const bounds = hero.getBoundingClientRect();
    pointerX = (event.clientX - bounds.left) / bounds.width * 2 - 1;
    pointerY = 1 - (event.clientY - bounds.top) / bounds.height * 2;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointerX = pointerY = 0; });
  document.addEventListener('visibilitychange', syncAnimation);
  motion.addEventListener('change', syncAnimation);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    syncAnimation();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    resize();
    syncAnimation();
  });
}
