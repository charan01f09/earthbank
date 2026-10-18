import { DEFAULTS, HIGH_PRESET, INDIA_PRESET, calculate, suggestions } from './calculations.js';
import { renderDonut, renderPersonalComparison, renderWaterStack, updateFootprintMeter } from './charts.js';
import { updateLiveChemistry } from './cycles.js';

const form = document.querySelector('#lifestyle-form');
const verdictCard = document.querySelector('#verdict-card');
let activeScenario = null;
let lastVerdict = null;
let latestProfile = null;
let latestResult = null;

const format = (value, decimals = 0) => Number(value).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const setText = (selector, text) => { document.querySelector(selector).textContent = text; };

function readProfile() {
  return {
    electricity: Number(form.elements.electricity.value),
    distance: Number(form.elements.distance.value),
    travelMode: form.elements.travelMode.value,
    diet: form.elements.diet.value,
    directWater: Number(form.elements.directWater.value),
    shopping: form.querySelector('input[name="shopping"]:checked').value,
  };
}

function animateValue(selector, value, decimals = 1) {
  const element = document.querySelector(selector);
  const current = Number(element.dataset.current || element.textContent.replace(/,/g, ''));
  const next = Number(value);
  element.dataset.current = String(next);
  if (!Number.isFinite(current) || !Number.isFinite(next) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.textContent = format(next, decimals);
    return;
  }
  const started = performance.now();
  const duration = 240;
  const ease = (t) => 1 - (1 - t) ** 3;
  function tick(now) {
    const progress = Math.min(1, (now - started) / duration);
    element.textContent = format(current + (next - current) * ease(progress), decimals);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function updateRangeOutputs() {
  setText('#electricity-output', form.elements.electricity.value);
  setText('#distance-output', form.elements.distance.value);
  setText('#direct-water-output', form.elements.directWater.value);
}

function updateVerdict(result) {
  const labels = {
    within: { badge: "WITHIN EARTH'S BIOCAPACITY", title: "WITHIN EARTH'S BIOCAPACITY", description: 'Your lifestyle can be sustained by Earth indefinitely.' },
    moderate: { badge: 'MODERATE OVERSHOOT', title: 'EXCEEDING BIOCAPACITY', description: 'Your lifestyle draws on more than one fair share.' },
    severe: { badge: 'SEVERE OVERSHOOT', title: 'EXCEEDING BIOCAPACITY', description: `If everyone lived like this, we would need ${result.earths.toFixed(2)} Earths.` },
  };
  const state = labels[result.verdict];
  verdictCard.classList.remove('verdict-card--within', 'verdict-card--moderate', 'verdict-card--severe');
  verdictCard.classList.add(`verdict-card--${result.verdict}`);
  if (lastVerdict && lastVerdict !== result.verdict) {
    verdictCard.classList.remove('is-changing');
    void verdictCard.offsetWidth;
    verdictCard.classList.add('is-changing');
    window.setTimeout(() => verdictCard.classList.remove('is-changing'), 650);
  }
  lastVerdict = result.verdict;
  setText('#verdict-badge', state.badge);
  const title = document.querySelector('#verdict-title');
  title.innerHTML = result.verdict === 'within'
    ? "WITHIN EARTH'S BIOCAPACITY"
    : `EXCEEDING BIOCAPACITY <span>(${result.verdict === 'moderate' ? 'Moderate' : 'Severe'} Overshoot)</span>`;
  setText('#verdict-description', state.description);
  animateValue('#earths-needed', result.earths, 2);
  const balanceLabel = result.balance >= 0 ? `+${format(result.balance, 2)} gha surplus` : `${format(Math.abs(result.balance), 2)} gha deficit`;
  setText('#balance-result', result.verdict === 'within' ? balanceLabel : `${format(Math.abs(result.balance), 2)} gha deficit`);
  setText('#fair-share-sentence', `Your footprint is ${format(result.ecology.total, 2)} gha. Earth's fair share is 1.5 gha. You are using ${format(result.fairSharePercent, 0)}% of your fair share.`);
  updateFootprintMeter(result.ecology.total);
}

function scenarioVerdict(earths) {
  if (earths <= 1) return 'Within biocapacity';
  if (earths <= 2) return 'Moderate overshoot';
  return 'Severe overshoot';
}

function renderSuggestions(profile, result) {
  const items = suggestions(profile, result);
  const list = document.querySelector('#suggestion-list');
  if (activeScenario && !items.some((item) => item.key === activeScenario && !item.noAdditionalSaving)) activeScenario = null;
  list.innerHTML = items.map((item, index) => `
    <article class="suggestion-card ${activeScenario === item.key ? 'suggestion-card--selected' : ''}">
      <div class="suggestion-card__rank">0${index + 1}</div>
      <div class="suggestion-card__copy"><span class="eyebrow">${item.label} · ${item.noAdditionalSaving ? 'modeled minimum' : 'estimated saving'}</span><h3>${item.title}</h3><p>${item.detail}</p><div class="saving-line"><strong>~${format(item.saved, 2)} kg CO₂e / day</strong><span>~${format(item.savedGha, 2)} gha</span></div></div>
      ${item.noAdditionalSaving ? '<span class="suggestion-minimum" role="note">Already at low end</span>' : `<button class="button button--small ${activeScenario === item.key ? 'button--primary' : 'button--outline'} what-if-button" type="button" data-scenario="${item.key}" aria-pressed="${activeScenario === item.key}">${activeScenario === item.key ? 'Showing this change' : 'What if I do this?'}</button>`}
    </article>`).join('');
  list.querySelectorAll('[data-scenario]').forEach((button) => button.addEventListener('click', () => {
    activeScenario = activeScenario === button.dataset.scenario ? null : button.dataset.scenario;
    renderSuggestions(latestProfile, latestResult);
    renderScenario(items.find((item) => item.key === activeScenario) || null);
  }));
  renderScenario(items.find((item) => item.key === activeScenario) || null);
}

function renderScenario(item) {
  const panel = document.querySelector('#scenario-panel');
  if (!item) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;
  document.querySelector('#scenario-comparison').innerHTML = `
    <div class="scenario-outcome"><span class="scenario-label">CURRENT ESTIMATE</span><strong>${format(latestResult.ecology.total, 2)} <small>gha</small></strong><span>${format(latestResult.earths, 2)} Earths · ${scenarioVerdict(latestResult.earths)}</span></div>
    <div class="scenario-arrow" aria-hidden="true">→</div>
    <div class="scenario-outcome scenario-outcome--after"><span class="scenario-label">WITH THIS CHANGE</span><strong>${format(item.after.ecology.total, 2)} <small>gha</small></strong><span>${format(item.after.earths, 2)} Earths · ${scenarioVerdict(item.after.earths)}</span></div>
    <p class="scenario-saving">Estimated difference: <strong>${format(Math.max(0, latestResult.carbonDaily - item.after.carbonDaily), 2)} kg CO₂e/day</strong> and <strong>${format(Math.max(0, latestResult.ecology.total - item.after.ecology.total), 2)} gha</strong>. This scenario changes only one modeled input.</p>`;
}

function updateAll() {
  latestProfile = readProfile();
  latestResult = calculate(latestProfile);
  updateRangeOutputs();
  animateValue('#carbon-daily', latestResult.carbonDaily, 1);
  animateValue('#carbon-annual', latestResult.carbonAnnualTons, 2);
  animateValue('#water-daily', latestResult.water.total, 0);
  animateValue('#ecology-total', latestResult.ecology.total, 2);
  renderWaterStack(latestResult.water);
  renderDonut(latestResult.carbon);
  renderPersonalComparison(latestResult.ecology.total);
  updateVerdict(latestResult);
  updateLiveChemistry(latestProfile, latestResult);
  renderSuggestions(latestProfile, latestResult);
}

function applyProfile(profile) {
  form.elements.electricity.value = profile.electricity;
  form.elements.distance.value = profile.distance;
  form.elements.travelMode.value = profile.travelMode;
  form.elements.diet.value = profile.diet;
  form.elements.directWater.value = profile.directWater;
  const radio = form.querySelector(`input[name="shopping"][value="${profile.shopping}"]`);
  if (radio) radio.checked = true;
  activeScenario = null;
  updateAll();
}

form.addEventListener('input', updateAll);
form.addEventListener('change', updateAll);
document.querySelector('#reset-button').addEventListener('click', () => applyProfile(DEFAULTS));
document.querySelector('#india-button').addEventListener('click', () => applyProfile(INDIA_PRESET));
document.querySelector('#high-button').addEventListener('click', () => applyProfile(HIGH_PRESET));
document.querySelector('#scenario-close').addEventListener('click', () => {
  activeScenario = null;
  renderSuggestions(latestProfile, latestResult);
});
document.querySelector('#copy-button').addEventListener('click', async () => {
  const summary = [
    `Eco-Footprint & Biocapacity estimate`,
    `Carbon: ${latestResult.carbonDaily.toFixed(1)} kg CO₂e/day (${latestResult.carbonAnnualTons.toFixed(2)} tons CO₂e/year)`,
    `Water: ${Math.round(latestResult.water.total).toLocaleString()} liters/day`,
    `Ecological Footprint: ${latestResult.ecology.total.toFixed(2)} gha`,
    `Earths needed: ${latestResult.earths.toFixed(2)} (fair share 1.5 gha/person)`,
    `All values are approximate and for educational purposes.`,
  ].join('\n');
  const status = document.querySelector('#copy-status');
  let clipboardTimeout;
  try {
    await Promise.race([
      navigator.clipboard.writeText(summary),
      new Promise((_, reject) => {
        clipboardTimeout = window.setTimeout(() => reject(new Error('Clipboard write timed out')), 1200);
      }),
    ]);
    status.textContent = 'Results copied.';
  } catch {
    const textArea = document.createElement('textarea');
    textArea.value = summary;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.append(textArea);
    textArea.select();
    const copied = document.execCommand('copy');
    textArea.remove();
    status.textContent = copied ? 'Results copied.' : 'Copy is not available in this browser.';
  } finally {
    window.clearTimeout(clipboardTimeout);
  }
  window.setTimeout(() => { status.textContent = ''; }, 3200);
});

applyProfile(DEFAULTS);
