const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
const header = document.querySelector('.topbar');
const year = document.getElementById('year');
const progress = document.querySelector('.scroll-progress');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (year) year.textContent = new Date().getFullYear();

function closeMenu() {
  nav?.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Open navigation');
}
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!header?.contains(event.target)) closeMenu();
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
  document.documentElement.classList.add('js-ready');
}

// One scheduled update per frame; scrolling never changes layout.
let scheduled = false;
function updateScroll() {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  const fraction = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
  if (progress) progress.style.transform = `scaleX(${fraction})`;
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
  const sections = [...document.querySelectorAll('main > section[id]')];
  const current = sections.filter(section => section.getBoundingClientRect().top <= 160).at(-1);
  nav?.querySelectorAll('a').forEach(link => {
    if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scheduled = false;
}
function scheduleScroll() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(updateScroll);
  }
}
window.addEventListener('scroll', scheduleScroll, { passive: true });
window.addEventListener('resize', scheduleScroll);
updateScroll();

// Reveal once when the work enters view. No dependency, scroll hijacking, or hidden fallback.
let observer;
const targets = [...document.querySelectorAll('.hero-copy > *, .hero-card, .section-heading, .about-card, .skills-list > span, .project-card, .contact-card')];
function setupReveals() {
  observer?.disconnect();
  targets.forEach(el => {
    el.classList.remove('is-pending');
    el.classList.add('is-visible');
  });
  if (motion.matches || !('IntersectionObserver' in window)) return;
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('is-pending');
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
  targets.forEach((el, index) => {
    el.dataset.reveal = '';
    const siblings = [...el.parentElement.children];
    const delay = el.parentElement.classList.contains('skills-list')
      ? (siblings.indexOf(el) % 6) * 45
      : el.parentElement.classList.contains('hero-copy') ? Math.min(index, 3) * 65 : 0;
    el.style.setProperty('--reveal-delay', delay + 'ms');
    observer.observe(el);
    el.classList.remove('is-visible');
    el.classList.add('is-pending');
  });
}
setupReveals();
motion.addEventListener('change', setupReveals);
// Preserve browser find, anchor navigation, and keyboard access through pending content.
document.addEventListener('focusin', event => {
  const pending = event.target.closest?.('.is-pending');
  if (pending) {
    pending.classList.remove('is-pending');
    pending.classList.add('is-visible');
    observer?.unobserve(pending);
  }
});
window.addEventListener('beforeprint', () => targets.forEach(el => el.classList.remove('is-pending')));

// Pointer accents are confined to their surfaces and never run on touch devices.
const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const interactiveSurfaces = [...document.querySelectorAll('.hero-card, .project-card')];
interactiveSurfaces.forEach(surface => {
  let frame = 0;
  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    surface.style.removeProperty('--pointer-x');
    surface.style.removeProperty('--pointer-y');
    surface.style.removeProperty('--signature-x');
    surface.style.removeProperty('--signature-y');
    surface.classList.remove('pointer-active');
  }
  surface.addEventListener('pointermove', event => {
    if (motion.matches || !precisePointer.matches || event.pointerType === 'touch') return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const box = surface.getBoundingClientRect();
      const x = Math.max(0, Math.min(box.width, event.clientX - box.left));
      const y = Math.max(0, Math.min(box.height, event.clientY - box.top));
      surface.style.setProperty('--pointer-x', x + 'px');
      surface.style.setProperty('--pointer-y', y + 'px');
      surface.style.setProperty('--signature-x', ((x / box.width - .5) * 10) + 'px');
      surface.style.setProperty('--signature-y', ((y / box.height - .5) * 8) + 'px');
      surface.classList.add('pointer-active');
      frame = 0;
    });
  });
  surface.addEventListener('pointerleave', reset);
  motion.addEventListener('change', reset);
  precisePointer.addEventListener('change', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
});

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  let submitting = false;
  contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || !contactForm.reportValidity()) return;
    const button = contactForm.querySelector('button[type="submit"]');
    const status = contactForm.querySelector('.form-status');
    const original = button.innerHTML;
    const values = Object.fromEntries(new FormData(contactForm));
    if (values._honey) return;
    submitting = true;
    button.disabled = true;
    button.textContent = 'Sending…';
    contactForm.setAttribute('aria-busy', 'true');
    status.textContent = '';
    status.removeAttribute('data-error');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('https://formsubmit.co/ajax/abhyudayrakam0404@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(values),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || String(result.success) !== 'true') throw new Error('Submission not confirmed');
      status.textContent = 'Message submitted. Thank you for getting in touch.';
      contactForm.reset();
    } catch {
      status.dataset.error = 'true';
      status.textContent = 'We couldn’t confirm your submission. Your message is still here—try again or email me directly.';
    } finally {
      clearTimeout(timeout);
      submitting = false;
      button.disabled = false;
      button.innerHTML = original;
      contactForm.removeAttribute('aria-busy');
    }
  });
}
