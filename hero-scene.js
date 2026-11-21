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
  const panels = new THREE.Group();
  scene.add(panels);

  const palette = [0xe3b876, 0x5d8eb8, 0xd6ab70, 0x426b92, 0xf0cb90, 0x6f93b0];
  palette.forEach((color, index) => {
    const geometry = new THREE.BoxGeometry(0.58 + index * 0.08, 4.9 - index * 0.18, 0.24);
    const fill = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12, depthWrite: false });
    const panel = new THREE.Mesh(geometry, fill);
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.54 })
    );
    panel.add(edge);
    panels.add(panel);
  });

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
    const bounds = hero.getBoundingClientRect();
    const scroll = THREE.MathUtils.clamp(-bounds.top / Math.max(bounds.height, 1), 0, 1);
    const entrance = 1 - Math.exp(-elapsed * 2.2);
    const spread = 0.62 + entrance * 0.4 + scroll * 1.8;
    panels.position.set(centerX + pointerX * 0.35 + scroll * 1.1, scroll * 1.9, -scroll * 1.2);
    panels.rotation.set(pointerY * 0.15 + scroll * 0.74, 0.28 + scroll * 1.22, -0.44 + scroll * 0.75);
    panels.scale.setScalar((camera.aspect < 1 ? 0.65 : 1) * (0.75 + entrance * 0.25 + scroll * 0.25));

    panels.children.forEach((panel, index) => {
      const offset = index - 2.5;
      panel.position.set(offset * spread, offset * 0.3, -Math.abs(offset) * 0.46);
      panel.rotation.set(0.12 * offset, offset * (0.16 + scroll * 0.2), Math.sin(elapsed * 0.8 + index) * 0.06);
      panel.material.opacity = (0.1 + index * 0.016) * (1 - scroll * 0.55);
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
