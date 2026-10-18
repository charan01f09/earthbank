import { TIMELINE } from './data.js';
import { renderWorldComparison } from './charts.js';
import './simulator.js';
import './quiz.js';

document.documentElement.classList.add('has-js');

const themeButton = document.querySelector('#theme-toggle');
const root = document.documentElement;
const savedTheme = localStorage.getItem('earth-account-theme');
const systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
function setTheme(theme) {
  root.dataset.theme = theme;
  const dark = theme === 'dark';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  themeButton.querySelector('.theme-toggle__label').textContent = dark ? 'Light mode' : 'Dark mode';
  document.querySelector('meta[name="theme-color"]').content = dark ? '#11241e' : '#f4f1e5';
}
setTheme(savedTheme || (systemDark ? 'dark' : 'light'));
themeButton.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
  localStorage.setItem('earth-account-theme', next);
});

renderWorldComparison();

const slider = document.querySelector('#timeline-slider');
function interpolate(year) {
  const earlier = [...TIMELINE].reverse().find((item) => item.year <= year) || TIMELINE[0];
  const later = TIMELINE.find((item) => item.year >= year) || TIMELINE.at(-1);
  if (earlier.year === later.year) return earlier.earths;
  const portion = (year - earlier.year) / (later.year - earlier.year);
  return earlier.earths + (later.earths - earlier.earths) * portion;
}
function updateTimeline() {
  const year = Number(slider.value);
  const earths = interpolate(year);
  const label = `About ${earths.toFixed(2)} Earths of demand`;
  document.querySelector('#timeline-year').textContent = String(year);
  document.querySelector('#timeline-slider-output').textContent = String(year);
  document.querySelector('#timeline-description').textContent = label;
  document.querySelector('#timeline-footprint').style.width = `${Math.min(100, earths / 2 * 100)}%`;
  slider.setAttribute('aria-valuetext', `${year}: ${earths.toFixed(2)} Earths of demand, compared with one Earth of biocapacity`);
}
slider.addEventListener('input', updateTimeline);
updateTimeline();

const counter = document.querySelector('[data-counter]');
const counterTarget = Number(counter.dataset.counter);
const counterDecimals = Number(counter.dataset.decimals || 0);
function animateHeroCounter() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    counter.textContent = counterTarget.toFixed(counterDecimals);
    return;
  }
  const started = performance.now();
  const duration = 1100;
  const frame = (now) => {
    const progress = Math.min(1, (now - started) / duration);
    const eased = 1 - (1 - progress) ** 3;
    counter.textContent = (counterTarget * eased).toFixed(counterDecimals);
    if (progress < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      animateHeroCounter();
      counterObserver.disconnect();
    }
  }, { threshold: 0.25 });
  counterObserver.observe(counter);
} else animateHeroCounter();

const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries, io) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  }), { threshold: 0.08, rootMargin: '0px 0px -32px 0px' })
  : null;
document.querySelectorAll('.chapter-main > *, .hero-copy, .hero-art, .account-strip').forEach((element, index) => {
  element.classList.add('reveal');
  element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 65}ms`);
  if (observer) observer.observe(element);
  else element.classList.add('is-visible');
});

const currentLinks = [...document.querySelectorAll('.chapter-nav a')];
const sections = currentLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      currentLinks.forEach((link) => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-36% 0px -58% 0px' });
  sections.forEach((section) => navObserver.observe(section));
}
