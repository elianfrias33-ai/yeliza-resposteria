import './style.css';
import { negocio, bizcochos } from './datos.js';

const waLink = (m) => `https://wa.me/${negocio.whatsapp}?text=${encodeURIComponent(m)}`;
const mapaUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(negocio.busquedaMapa)}`;

// Rellenar datos del negocio
document.querySelectorAll('[data-dato]').forEach((el) => { el.textContent = negocio[el.dataset.dato]; });
document.querySelectorAll('[data-link="instagram"]').forEach((a) => (a.href = negocio.instagram));
document.querySelectorAll('[data-link="mapa"]').forEach((a) => (a.href = mapaUrl));
document.querySelectorAll('[data-link="mapaEmbed"]').forEach((f) => (f.src = `https://www.google.com/maps?q=${encodeURIComponent(negocio.busquedaMapa)}&output=embed`));

// Galería
const chips = document.getElementById('chips');
const gal = document.getElementById('gallery');
const cats = ['Todos', ...new Set(bizcochos.map((b) => b.categoria))];
gal.innerHTML = bizcochos.map((b) => `
  <article class="card rv" data-c="${b.categoria}">
    <div class="ph"><span class="cat">${b.categoria}</span><img src="/fotos/${b.foto}" alt="${b.nombre}" loading="lazy"></div>
    <div class="info">
      <div><h3>${b.nombre}</h3><small>Pídelo igual o personalizado</small></div>
      <a class="ask" target="_blank" rel="noopener" aria-label="Pedir ${b.nombre}" href="${waLink(`Hola Yeliza, me interesa el bizcocho "${b.nombre}" (${b.categoria}). ¿Me das información?`)}"><svg viewBox="0 0 24 24"><use href="#i-wa"/></svg></a>
    </div>
  </article>`).join('');
chips.innerHTML = cats.map((c, k) => `<button class="chip${k ? '' : ' on'}">${c}</button>`).join('');
chips.addEventListener('click', (e) => {
  if (!e.target.classList.contains('chip')) return;
  chips.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c === e.target));
  const c = e.target.textContent;
  gal.querySelectorAll('.card').forEach((el) => {
    const oculto = c !== 'Todos' && el.dataset.c !== c;
    el.classList.toggle('hide', oculto);
    if (!oculto) { el.classList.remove('in'); void el.offsetWidth; requestAnimationFrame(() => el.classList.add('in')); }
  });
});

// Botones de WhatsApp
document.querySelectorAll('.wa').forEach((a) => {
  a.href = waLink(a.dataset.msg || negocio.mensajeWhatsApp);
  a.target = '_blank';
  a.rel = 'noopener';
});

// Formulario de pedido → WhatsApp
document.getElementById('orderForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  const fecha = d.fecha ? new Date(d.fecha + 'T12:00').toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
  const msg = `Hola Yeliza 👋 Quiero hacer un pedido:\n\n• Nombre: ${d.nombre}\n• Tipo: ${d.tipo}\n• Fecha: ${fecha}\n• Personas: ${d.personas || '-'}\n• Sabor: ${d.sabor}\n• Entrega: ${d.entrega}\n• Detalles: ${d.detalles || '-'}`;
  window.open(waLink(msg), '_blank');
});

// ===== Animaciones al hacer scroll =====
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.grid').forEach((g) => [...g.children].forEach((el, k) => el.style.setProperty('--d', (k % 3) * 0.12 + 's')));
const io = new IntersectionObserver((es) => es.forEach((x) => {
  if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); }
}), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.rv,#strip').forEach((el) => io.observe(el));

// Contador del 4.8
const cio = new IntersectionObserver((es) => es.forEach((x) => {
  if (!x.isIntersecting) return;
  cio.unobserve(x.target);
  const el = x.target, to = +el.dataset.to;
  if (reduce) return;
  const t0 = performance.now();
  (function f(t) { const p = Math.min((t - t0) / 1200, 1); el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(1); if (p < 1) requestAnimationFrame(f); })(t0);
}), { threshold: 0.6 });
document.querySelectorAll('.count').forEach((el) => cio.observe(el));

// Barra de progreso, menú y parallax de la portada
const bar = document.getElementById('progress');
const nav = document.querySelector('nav');
const art = document.querySelector('.hero-art .slot img');
let ticking = false;
function onScroll() {
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  nav.classList.toggle('scrolled', y > 10);
  if (art && !reduce && y < 900) art.style.transform = `translateY(${y * 0.08}px) scale(1.08)`;
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
onScroll();
