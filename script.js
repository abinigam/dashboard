'use strict';
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
function closeMenu() {
  mobileNav.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}
menuButton.addEventListener('click', function () {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  mobileNav.hidden = open;
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
});
mobileNav.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', closeMenu); });
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); }
});
window.matchMedia('(min-width: 801px)').addEventListener('change', function (event) { if (event.matches) closeMenu(); });

const filterButtons = document.querySelectorAll('.filter-button');
const filmCards = document.querySelectorAll('.film-card');
filterButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    const category = button.dataset.filter;
    filterButtons.forEach(function (filter) {
      const active = filter === button;
      filter.classList.toggle('active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    let count = 0;
    filmCards.forEach(function (card) {
      card.hidden = category !== 'all' && card.dataset.category !== category;
      if (!card.hidden) { count++; card.classList.add('visible'); }
    });
    document.getElementById('filter-status').textContent = count + ' films shown. ' + button.textContent + ' selected.';
  });
});

// A native dialog provides focus containment and Escape support.
const modal = document.querySelector('.film-modal');
const player = modal.querySelector('iframe');
const fallback = modal.querySelector('.player-fallback');
let lastFilmTrigger;
document.querySelectorAll('.play-film').forEach(function (button) {
  button.addEventListener('click', function () {
    const id = button.dataset.video;
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
    if (typeof modal.showModal !== 'function') {
      window.open('https://www.youtube.com/watch?v=' + id, '_blank', 'noopener,noreferrer');
      return;
    }
    lastFilmTrigger = button;
    modal.querySelector('#modal-title').textContent = button.dataset.title;
    modal.querySelector('#modal-description').textContent = button.dataset.description;
    player.title = button.dataset.title + ' — Nigam Cinematics';
    player.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    fallback.href = 'https://www.youtube.com/watch?v=' + id;
    modal.showModal();
    document.body.classList.add('modal-open');
    modal.querySelector('.modal-close').focus();
  });
});
modal.querySelector('.modal-close').addEventListener('click', function () { modal.close(); });
modal.addEventListener('click', function (event) {
  if (event.target !== modal) return;
  const rect = modal.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) modal.close();
});
modal.addEventListener('close', function () {
  player.removeAttribute('src');
  document.body.classList.remove('modal-open');
  if (lastFilmTrigger) lastFilmTrigger.focus();
});
document.getElementById('modal-enquiry').addEventListener('click', function () { modal.close(); });

// Carry the selected service into the brief while preserving anchor navigation.
const serviceSelect = document.querySelector('#project-form select[name="service"]');
document.querySelectorAll('[data-service]').forEach(function (link) {
  link.addEventListener('click', function () {
    const service = link.dataset.service;
    if (Array.from(serviceSelect.options).some(function (option) { return option.value === service; })) {
      serviceSelect.value = service;
    }
  });
});

// No backend or storage: the visitor reviews and sends the message in WhatsApp.
document.getElementById('project-form').addEventListener('submit', function (event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  const message = 'Hi Nigam Cinematics,\n\nName: ' + String(fields.get('name')).trim()
    + '\nBusiness: ' + String(fields.get('business')).trim()
    + '\nProject: ' + fields.get('service')
    + '\n\nBrief: ' + String(fields.get('brief')).trim();
  const url = 'https://wa.me/919235600936?text=' + encodeURIComponent(message);
  const fallbackLink = document.getElementById('whatsapp-fallback');
  fallbackLink.href = url;
  fallbackLink.hidden = false;
  document.getElementById('form-status').textContent = 'Your brief is ready. Review it in WhatsApp before sending. If a new tab did not open, use the prepared brief link.';
  window.open(url, '_blank', 'noopener,noreferrer');
});
document.querySelector('#project-form button[type="submit"]').disabled = false;
document.getElementById('year').textContent = String(new Date().getFullYear());

// Content stays visible without JavaScript or with reduced motion.
if (!motionPreference.matches && 'IntersectionObserver' in window) {
  document.body.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(function (element) { revealObserver.observe(element); });
  motionPreference.addEventListener('change', function (event) { if (event.matches) document.body.classList.remove('motion-ready'); });
}
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach(function (link) {
          const current = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('current', current);
          if (current) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    });
  }, { rootMargin: '-15% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach(function (section) { sectionObserver.observe(section); });
}

// Decorative orbital artwork; pauses offscreen and respects reduced motion.
(function orbitalArtwork() {
  const canvas = document.getElementById('orbital-canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  let width = 0, height = 0, frame = 0, rotation = 0, lastTime = 0;
  let running = false, inView = true;
  const points = [];
  for (let latitude = 1; latitude < 31; latitude++) {
    const phi = Math.PI * latitude / 31;
    const count = Math.max(12, Math.round(90 * Math.sin(phi)));
    for (let longitude = 0; longitude < count; longitude++) {
      const theta = Math.PI * 2 * longitude / count;
      points.push({x: Math.sin(phi) * Math.cos(theta), y: Math.cos(phi), z: Math.sin(phi) * Math.sin(theta)});
    }
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0); draw();
  }
  function draw() {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    const cx = width * 0.5, cy = height * 0.5, radius = Math.min(width, height) * 0.285;
    const aura = context.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.5);
    aura.addColorStop(0, 'rgba(213,160,69,0.18)');
    aura.addColorStop(0.5, 'rgba(106,72,146,0.10)');
    aura.addColorStop(1, 'rgba(8,10,18,0)');
    context.fillStyle = aura; context.fillRect(0, 0, width, height);
    context.save(); context.translate(cx, cy); context.rotate(-0.4);
    const orbit = context.createLinearGradient(-radius * 1.5, 0, radius * 1.5, 0);
    orbit.addColorStop(0, 'rgba(231,193,125,0.18)');
    orbit.addColorStop(0.5, 'rgba(255,224,164,0.85)');
    orbit.addColorStop(1, 'rgba(176,148,245,0.45)');
    context.strokeStyle = orbit; context.lineWidth = 1;
    context.beginPath(); context.ellipse(0, 0, radius * 1.55, radius * 0.42, 0, 0, Math.PI * 2); context.stroke();
    context.rotate(0.85); context.strokeStyle = 'rgba(144,177,254,0.23)';
    context.beginPath(); context.ellipse(0, 0, radius * 1.3, radius * 0.52, 0, 0, Math.PI * 2); context.stroke(); context.restore();
    const projected = points.map(function (point) {
      const x = point.x * Math.cos(rotation) + point.z * Math.sin(rotation);
      const z = -point.x * Math.sin(rotation) + point.z * Math.cos(rotation);
      const y = point.y * Math.cos(0.25) - z * Math.sin(0.25);
      return {x: x, y: y, z: point.y * Math.sin(0.25) + z * Math.cos(0.25)};
    }).sort(function (a, b) { return a.z - b.z; });
    projected.forEach(function (point) {
      const perspective = 1 + point.z * 0.10;
      const alpha = 0.15 + (point.z + 1) * 0.35;
      context.fillStyle = point.y > 0.12 ? 'rgba(230,179,102,' + alpha + ')' : 'rgba(248,220,169,' + alpha + ')';
      context.beginPath();
      context.arc(cx + point.x * radius * perspective, cy + point.y * radius * perspective, 0.65 + (point.z + 1) * 0.5, 0, Math.PI * 2); context.fill();
    });
    const angle = rotation * 1.3, x = Math.cos(angle) * radius * 1.55, y = Math.sin(angle) * radius * 0.42;
    const sx = cx + x * Math.cos(-0.4) - y * Math.sin(-0.4);
    const sy = cy + x * Math.sin(-0.4) + y * Math.cos(-0.4);
    context.shadowBlur = 17; context.shadowColor = '#e7c17d'; context.fillStyle = '#fff0cf';
    context.beginPath(); context.arc(sx, sy, 3, 0, Math.PI * 2); context.fill(); context.shadowBlur = 0;
  }
  function animate(time) {
    if (!running) return;
    if (time - lastTime > 32) { rotation += Math.min(time - lastTime, 64) * 0.00014; lastTime = time; draw(); }
    frame = requestAnimationFrame(animate);
  }
  function syncAnimation() {
    const shouldRun = inView && !document.hidden && !motionPreference.matches;
    if (shouldRun && !running) { running = true; lastTime = performance.now(); frame = requestAnimationFrame(animate); }
    else if (!shouldRun) { running = false; cancelAnimationFrame(frame); draw(); }
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (entries) { inView = entries[0].isIntersecting; syncAnimation(); }).observe(canvas);
  document.addEventListener('visibilitychange', syncAnimation);
  motionPreference.addEventListener('change', syncAnimation);
  resize(); syncAnimation();
})();
