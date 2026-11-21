const sequence = document.querySelector('.project-cinema');

if (sequence) {
  const stage = sequence.querySelector('.project-cinema-stage');
  const canvas = sequence.querySelector('canvas');
  const caption = sequence.querySelector('.project-cinema-caption');
  const bar = sequence.querySelector('.project-cinema-progress span');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cards = [...document.querySelectorAll('#projects .project-top')].slice(0, 3);
  const chapters = cards.map(card => {
    const chapter = document.createElement('div');
    chapter.className = 'project-cinema-chapter';
    const title = document.createElement('strong');
    const subtitle = document.createElement('span');
    title.textContent = card.querySelector('h3').textContent;
    subtitle.textContent = card.querySelector('span').textContent;
    chapter.append(title, subtitle);
    caption.append(chapter);
    return chapter;
  });

  let frame = null;
  let renderScene;
  let inView = false;
  let loading = false;

  function render() {
    frame = null;
    const stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
    const distance = Math.max(1, sequence.offsetHeight - stage.offsetHeight);
    const progress = Math.max(0, Math.min(1, (stickyTop - sequence.getBoundingClientRect().top) / distance));
    const chapterProgress = progress * (chapters.length - 1);
    chapters.forEach((chapter, index) => {
      const offset = index - chapterProgress;
      const opacity = Math.max(0, 1 - Math.abs(offset));
      chapter.style.opacity = String(opacity * opacity);
      chapter.style.transform = 'translate3d(' + (offset * 8) + 'vw,' + (Math.abs(offset) * 45) + 'px,0) scale(' + (1 - Math.abs(offset) * 0.055) + ')';
    });
    bar.style.transform = 'scaleX(' + progress + ')';
    renderScene?.(progress);
  }

  function schedule() {
    if (!sequence.hidden && inView && frame === null) frame = requestAnimationFrame(render);
  }

  function updatePreference() {
    sequence.hidden = motion.matches;
    if (sequence.hidden) {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      return;
    }
    schedule();
    if (loading || !('WebGL2RenderingContext' in window)) return;
    loading = true;
    const threeUrl = 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
    import(/* @vite-ignore */ threeUrl).then(THREE => {
      renderScene = createScene(THREE, canvas, schedule);
      schedule();
    }).catch(() => { canvas.hidden = true; });
  }

  if (chapters.length === 3 && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      schedule();
    }).observe(sequence);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', updatePreference);
    updatePreference();
  }
}

function createScene(THREE, canvas, schedule) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
  camera.position.z = 1;
  const uniforms = { progress: { value: 0 }, aspect: { value: 1 } };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform float progress;
      uniform float aspect;
      varying vec2 vUv;

      vec3 sceneAt(vec2 p, float chapter, float travel) {
        vec3 gold = vec3(0.87, 0.58, 0.26);
        vec3 teal = vec3(0.21, 0.76, 0.68);
        vec3 blue = vec3(0.33, 0.52, 0.93);
        vec3 tint = mix(mix(gold, teal, step(0.5, chapter)), blue, step(1.5, chapter));
        float x = p.x;
        float wave = sin(x * (2.2 + chapter * 1.55) + travel + chapter * 1.8);
        float ridge = p.y - 0.38 - wave * (0.13 + chapter * 0.035);
        float lanes = abs(fract(ridge * 15.0 + sin(x * 3.5) * 0.41) - 0.5);
        float threads = 1.0 - smoothstep(0.016, 0.078, lanes);
        float band = exp(-abs(ridge) * 3.5);
        float light = exp(-length(vec2(x - 0.32, p.y - 0.38)) * 2.2);
        return vec3(0.045, 0.067, 0.105) + tint * (0.48 * threads * band + light * 0.57);
      }

      void main() {
        float beat = progress * 2.0;
        float chapter = floor(beat);
        float blend = smoothstep(0.08, 0.92, fract(beat));
        vec2 p = vUv - 0.5;
        p.x *= aspect;
        p /= 1.0 + progress * 0.48;
        p.y += sin(p.x * 2.5 + progress * 2.5) * (0.08 + progress * 0.13);
        vec3 color = mix(sceneAt(p, chapter, beat * 2.5),
          sceneAt(p, min(chapter + 1.0, 2.0), beat * 2.5), blend);
        float shade = mix(0.33, 1.0, smoothstep(0.12, 0.78, vUv.y));
        gl_FragColor = vec4(color * shade, 1.0);
      }
    `
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  let width = 0;
  let height = 0;
  let contextLost = false;
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    canvas.style.visibility = 'hidden';
  });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    canvas.style.visibility = '';
    width = height = 0;
    schedule();
  });
  new ResizeObserver(schedule).observe(canvas);

  return progress => {
    if (contextLost) return;
    const nextWidth = canvas.clientWidth;
    const nextHeight = canvas.clientHeight;
    if (!nextWidth || !nextHeight) return;
    if (width !== nextWidth || height !== nextHeight) {
      width = nextWidth;
      height = nextHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      uniforms.aspect.value = width / height;
    }
    uniforms.progress.value = progress;
    renderer.render(scene, camera);
  };
}
