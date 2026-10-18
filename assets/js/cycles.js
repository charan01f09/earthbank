import { CYCLES } from './data.js';
import { cycleLoad } from './calculations.js';

const cycleMarkup = (key, mode) => {
  const cycle = CYCLES[key];
  const nodes = cycle.nodes;
  return `<svg class="cycle-diagram ${mode === 'overload' ? 'cycle-diagram--overload' : ''}" viewBox="0 0 420 242" role="img" aria-label="Simplified ${cycle.name} cycle. In natural balance, matter moves among the four labeled stores; human overload adds faster, more concentrated flows.">
    <defs><marker id="cycle-arrow" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" /></marker></defs>
    <path class="cycle-flow" d="M177 62 C139 74,120 91,112 118" marker-end="url(#cycle-arrow)" />
    <path class="cycle-flow" d="M127 153 C151 177,174 189,196 193" marker-end="url(#cycle-arrow)" />
    <path class="cycle-flow" d="M226 193 C262 182,293 165,306 148" marker-end="url(#cycle-arrow)" />
    <path class="cycle-flow" d="M300 117 C286 83,257 66,241 61" marker-end="url(#cycle-arrow)" />
    <path class="cycle-flow cycle-flow--transfer" d="M153 135 C202 112,246 112,278 135" marker-end="url(#cycle-arrow)" />
    <g class="cycle-node" transform="translate(151 31)"><rect width="118" height="40" rx="20"/><text x="59" y="25">${nodes[0]}</text></g>
    <g class="cycle-node" transform="translate(39 116)"><rect width="130" height="42" rx="21"/><text x="65" y="26">${nodes[1]}</text></g>
    <g class="cycle-node" transform="translate(250 116)"><rect width="132" height="42" rx="21"/><text x="66" y="26">${nodes[2]}</text></g>
    <g class="cycle-node" transform="translate(151 174)"><rect width="118" height="40" rx="20"/><text x="59" y="25">${nodes[3]}</text></g>
    <text class="cycle-caption" x="210" y="232" text-anchor="middle">${mode === 'overload' ? 'Human additions accelerate selected flows' : 'Natural stores exchange matter over time'}</text>
  </svg>`;
};

const equationsByCycle = {
  carbon: `<div class="equation-card"><span class="equation-label">Photosynthesis · natural carbon flow</span><strong>6CO<sub>2</sub> + 6H<sub>2</sub>O <span aria-label="yields">→</span> (sunlight) C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub></strong><p>Sunlight powers plants to store carbon in sugars.</p></div>
    <div class="equation-card"><span class="equation-label">Fossil-fuel combustion · carbon transfer</span><strong>C<sub>x</sub>H<sub>y</sub> + (x + y/4)O<sub>2</sub> <span aria-label="yields">→</span> xCO<sub>2</sub> + (y/2)H<sub>2</sub>O + heat</strong><p>Combustion moves long-stored carbon into the atmosphere.</p></div>
    <div class="equation-card"><span class="equation-label">Ocean acidification · carbonate chemistry</span><strong>CO<sub>2</sub> + H<sub>2</sub>O ⇌ H<sub>2</sub>CO<sub>3</sub> ⇌ H<sup>+</sup> + HCO<sub>3</sub><sup>−</sup></strong><p>More dissolved CO₂ shifts seawater chemistry; corals and shellfish can find shell-building harder.</p>${pHScale()}</div>`,
  nitrogen: `<div class="equation-card"><span class="equation-label">Haber–Bosch · industrial nitrogen fixation</span><strong>N<sub>2</sub> + 3H<sub>2</sub> ⇌ 2NH<sub>3</sub></strong><p>Ammonia supplies reactive nitrogen for fertilizers and other products.</p></div><div class="equation-card"><span class="equation-label">When nutrients escape a field</span><p>Fertilizer runoff can carry reactive nitrogen into streams and lakes. Added nutrients can fuel eutrophication and algal blooms; decomposition may use up dissolved oxygen.</p></div>`,
  phosphorus: `<div class="equation-card"><span class="equation-label">Phosphorus · no large atmospheric store</span><strong>Rock phosphate → soil phosphate → food webs → sediment</strong><p>Weathering and erosion move phosphorus; fertilizer runoff can add a pulse that fuels algal blooms.</p></div>`,
  sulfur: `<div class="equation-card"><span class="equation-label">Acid deposition · nitrogen dioxide pathway</span><strong>4NO<sub>2</sub> + O<sub>2</sub> + 2H<sub>2</sub>O → 4HNO<sub>3</sub></strong><p>Nitric acid can form through atmospheric reactions involving nitrogen oxides.</p></div><div class="equation-card"><span class="equation-label">Sulfur dioxide pathway</span><strong>SO<sub>2</sub> + H<sub>2</sub>O → H<sub>2</sub>SO<sub>3</sub></strong><p>Acidic deposition weathers carbonate stone; marble monuments can lose fine surface detail.</p></div>`,
  water: `<div class="equation-card"><span class="equation-label">Water cycle · powered by sunlight and gravity</span><strong>Evaporation → condensation → precipitation → runoff / recharge</strong><p>Groundwater recharge can be slower than pumping. Persistent overuse lowers water tables and can reduce water available to wells, wetlands and rivers.</p></div>`,
};

function pHScale() {
  return `<div class="ph-scale" aria-label="Illustrative pH direction, not a personal ocean prediction"><div class="ph-scale__labels"><span>More acidic</span><span>More alkaline</span></div><div class="ph-scale__track"><span id="ph-marker"></span></div><div class="ph-scale__ends"><span>lower pH</span><span>higher pH</span></div><p class="micro-note" id="ph-caption">Illustrative direction only: added CO₂ shifts ocean chemistry toward lower pH.</p></div>`;
}

let selected = 'carbon';
let mode = 'balanced';
let latestCarbonDaily = 0;
const tabs = [...document.querySelectorAll('[data-cycle-tab]')];
const panel = document.querySelector('#cycle-detail');

function showCycle(key) {
  selected = key;
  const item = CYCLES[key];
  panel.setAttribute('aria-labelledby', `tab-${key}`);
  tabs.forEach((tab) => {
    const active = tab.dataset.cycleTab === key;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  panel.innerHTML = `<div class="cycle-copy"><span class="eyebrow">${item.eyebrow}</span><h3>${item.name}: movement and pressure</h3><p>${item.description}</p><p class="cycle-note">${item.note}</p><div class="cycle-mode" role="group" aria-label="Cycle pathway state"><button type="button" data-cycle-mode="balanced" aria-pressed="${mode === 'balanced'}">Natural balance</button><button type="button" data-cycle-mode="overload" aria-pressed="${mode === 'overload'}">Human overload</button></div><p class="cycle-mode-hint" aria-live="polite">${mode === 'overload' ? 'Human-added flows are highlighted.' : 'Natural transfers shown at a balanced pace.'}</p></div><div class="cycle-visual">${cycleMarkup(key, mode)}</div><div class="equation-grid">${equationsByCycle[key]}</div>`;
  panel.querySelectorAll('[data-cycle-mode]').forEach((button) => button.addEventListener('click', () => {
    mode = button.dataset.cycleMode;
    showCycle(key);
  }));
  const cycleMarker = panel.querySelector('#ph-marker');
  if (cycleMarker) cycleMarker.style.setProperty('--ph-position', latestCarbonDaily > 8 ? '30%' : latestCarbonDaily > 5 ? '48%' : '64%');
  const cycleCaption = panel.querySelector('#ph-caption');
  if (cycleCaption) cycleCaption.textContent = latestCarbonDaily > 8 ? 'Higher modeled CO₂; more acidic direction, illustrative only.' : latestCarbonDaily > 5 ? 'Some modeled carbon pressure; pH direction shown for context.' : 'Illustrative direction only: added CO₂ shifts ocean chemistry toward lower pH.';
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => showCycle(tab.dataset.cycleTab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus();
    showCycle(tabs[next].dataset.cycleTab);
  });
});

showCycle(selected);

const triggerDescriptions = {
  photosynthesis: { title: 'Photosynthesis', equation: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', text: 'Plants use light to draw carbon into sugars and release oxygen.' },
  combustion: { title: 'Fossil-fuel combustion', equation: 'CₓHᵧ + (x + y/4)O₂ → xCO₂ + (y/2)H₂O + heat', text: 'Combustion moves stored carbon into the air as greenhouse gases.' },
  ocean: { title: 'Ocean acidification', equation: 'CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻', text: 'Dissolved CO₂ shifts seawater chemistry, affecting corals and shellfish.' },
  nitrogen: { title: 'Haber–Bosch and fertilizer runoff', equation: 'N₂ + 3H₂ ⇌ 2NH₃', text: 'Reactive nitrogen supports crops; excess runoff can drive eutrophication and algal blooms.' },
  acidRain: { title: 'Acid-rain chemistry', equation: '4NO₂ + O₂ + 2H₂O → 4HNO₃  ·  SO₂ + H₂O → H₂SO₃', text: 'Air pollutants can form acids that weather soils and carbonate stone.' },
  nutrients: { title: 'Nutrient pollution', equation: 'Nitrate + phosphate → faster algal growth', text: 'A high grey-water share signals more water linked to pollution in this simplified estimate.' },
};

export function updateLiveChemistry(profile, result) {
  const active = [triggerDescriptions.photosynthesis];
  if (result.carbonDaily > 5) active.push(triggerDescriptions.combustion);
  if (result.carbonDaily > 8) active.push(triggerDescriptions.ocean);
  if (['Non-vegetarian', 'Heavy meat'].includes(profile.diet) || profile.shopping === 'High') active.push(triggerDescriptions.nitrogen);
  if ((['Petrol car', 'Diesel car'].includes(profile.travelMode) && profile.distance >= 30) || profile.electricity >= 15) active.push(triggerDescriptions.acidRain);
  if (result.water.greyShare > 0.22) active.push(triggerDescriptions.nutrients);

  document.querySelector('#live-chemistry-list').innerHTML = active.map((item) => `<article class="live-equation"><div><span class="equation-label">${item.title}</span><strong>${item.equation}</strong></div><p>${item.text}</p></article>`).join('');
  const loads = cycleLoad(result, profile);
  document.querySelector('#cycle-loads').innerHTML = Object.entries(loads).map(([name, state]) => `<div class="load-item load-item--${state}" aria-label="${name[0].toUpperCase()}${name.slice(1)} cycle: ${state}"><span>${name} cycle</span><strong>${state[0].toUpperCase()}${state.slice(1)}</strong></div>`).join('');
  latestCarbonDaily = result.carbonDaily;
  const cycleMarker = document.querySelector('#ph-marker');
  if (cycleMarker) cycleMarker.style.setProperty('--ph-position', result.carbonDaily > 8 ? '30%' : result.carbonDaily > 5 ? '48%' : '64%');
  const cycleCaption = document.querySelector('#ph-caption');
  if (cycleCaption) cycleCaption.textContent = result.carbonDaily > 8 ? 'Higher modeled CO₂; more acidic direction, illustrative only.' : result.carbonDaily > 5 ? 'Some modeled carbon pressure; pH direction shown for context.' : 'Illustrative direction only: added CO₂ shifts ocean chemistry toward lower pH.';
  const marker = document.querySelector('#live-ph-marker');
  if (marker) marker.style.setProperty('--ph-position', result.carbonDaily > 8 ? '30%' : result.carbonDaily > 5 ? '48%' : '64%');
  const phNote = document.querySelector('#live-ph-caption');
  if (phNote) phNote.textContent = result.carbonDaily > 8 ? 'Higher modeled CO₂ · more acidic direction (illustrative)' : result.carbonDaily > 5 ? 'Some carbon pressure · pH direction shown for context' : 'A chemistry pathway, not a direct ocean forecast';
}
