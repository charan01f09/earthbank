import { BENCHMARKS, FAIR_SHARE_GHA } from './data.js';

function comparisonMarkup(items, title) {
  const max = 10;
  const width = 240;
  const markerX = width * FAIR_SHARE_GHA / max;
  return `
    <svg class="bar-chart" viewBox="0 0 360 ${items.length * 54 + 30}" role="img" aria-label="${title}. A vertical reference line marks Earth's fair share at 1.5 global hectares per person.">
      <line class="bar-chart__limit" x1="${markerX + 103}" y1="8" x2="${markerX + 103}" y2="${items.length * 54 + 10}" />
      <text class="bar-chart__limit-label" x="${markerX + 108}" y="16">1.5 gha limit</text>
      ${items.map((item, index) => {
        const y = index * 54 + 30;
        const barWidth = Math.max(1, Math.min(width, width * item.gha / max));
        const fill = item.name === 'You' ? 'var(--color-forest)' : 'var(--color-teal)';
        return `<g class="bar-chart__row">
          <text class="bar-chart__label" x="0" y="${y + 3}">${item.name}</text>
          <rect class="bar-chart__track" x="103" y="${y - 12}" width="${width}" height="16" rx="8" />
          <rect class="bar-chart__fill" x="103" y="${y - 12}" width="${barWidth}" height="16" rx="8" style="fill:${fill}" />
          <text class="bar-chart__value" x="${Math.min(350, 109 + barWidth)}" y="${y + 3}">${item.gha.toFixed(1)}</text>
        </g>`;
      }).join('')}
    </svg>`;
}

export function renderWorldComparison() {
  const container = document.querySelector('#world-comparison-chart');
  container.innerHTML = comparisonMarkup(BENCHMARKS.map((item) => ({ name: item.name, gha: item.gha })), 'Approximate ecological footprint by region');
  const list = document.querySelector('#world-comparison-values');
  list.innerHTML = BENCHMARKS.map((item) => `<span>${item.label}: <strong>${item.gha.toFixed(1)} gha</strong></span>`).join('');
}

export function renderPersonalComparison(gha) {
  const container = document.querySelector('#personal-comparison-chart');
  const items = [
    { name: 'You', gha },
    { name: 'India', gha: 1.2 },
    { name: 'World', gha: 2.7 },
    { name: 'USA', gha: 8.0 },
  ];
  container.innerHTML = comparisonMarkup(items, 'Approximate ecological footprint: you compared with India, world and USA');
}

export function renderDonut(contributions) {
  const container = document.querySelector('#contribution-donut');
  const list = document.querySelector('#contribution-legend');
  const colors = ['var(--color-forest)', 'var(--color-teal)', 'var(--color-sand-deep)', 'var(--color-ink-soft)'];
  const labels = ['Electricity', 'Travel', 'Diet', 'Consumption'];
  const values = [contributions.electricity, contributions.travel, contributions.diet, contributions.consumption];
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const circles = values.map((value, index) => {
    const portion = Math.max(0, value) / total * circumference;
    const circle = `<circle class="donut-segment" cx="52" cy="52" r="${radius}" fill="none" stroke="${colors[index]}" stroke-width="13" stroke-dasharray="${portion} ${circumference - portion}" stroke-dashoffset="${-offset}" />`;
    offset += portion;
    return circle;
  }).join('');
  container.innerHTML = `<svg viewBox="0 0 104 104" role="img" aria-label="Daily carbon contributions: ${labels.map((label, i) => `${label} ${values[i].toFixed(1)} kg`).join(', ')}"><circle cx="52" cy="52" r="${radius}" fill="none" stroke="var(--color-track)" stroke-width="13" />${circles}<text class="donut-total" x="52" y="50">${total.toFixed(1)}</text><text class="donut-unit" x="52" y="64">kg / day</text></svg>`;
  list.innerHTML = labels.map((label, index) => `<span class="legend-item"><i class="legend-swatch" style="--swatch:${colors[index]}" aria-hidden="true"></i><span>${label}</span><strong>${values[index].toFixed(1)}</strong></span>`).join('');
}

export function renderWaterStack(water) {
  const bar = document.querySelector('#water-stack');
  const legend = document.querySelector('#water-legend');
  const segments = [
    { name: 'Green', value: water.green, color: 'var(--color-forest)' },
    { name: 'Blue', value: water.blue, color: 'var(--color-teal)' },
    { name: 'Grey', value: water.grey, color: 'var(--color-slate)' },
  ];
  bar.innerHTML = segments.map((part) => `<span class="water-segment" title="${part.name}: ${Math.round(part.value).toLocaleString()} L" style="width:${part.value / water.total * 100}%;--segment:${part.color}"></span>`).join('');
  legend.innerHTML = segments.map((part) => `<span><i style="--swatch:${part.color}" aria-hidden="true"></i>${part.name} <strong>${Math.round(part.value).toLocaleString()} L</strong></span>`).join('');
  bar.setAttribute('aria-label', `Green water ${Math.round(water.green)} liters, Blue water ${Math.round(water.blue)} liters, Grey water ${Math.round(water.grey)} liters per day`);
}

export function updateFootprintMeter(gha) {
  const max = 10;
  const pointer = Math.min(98, gha / max * 100);
  const limit = FAIR_SHARE_GHA / max * 100;
  const meter = document.querySelector('#footprint-meter');
  meter.style.setProperty('--limit-position', `${limit}%`);
  meter.style.setProperty('--pointer-position', `${pointer}%`);
  meter.setAttribute('aria-valuenow', gha.toFixed(2));
  meter.setAttribute('aria-valuetext', `${gha.toFixed(2)} global hectares; Earth's limit is 1.5 global hectares`);
  document.querySelector('#meter-pointer-label').textContent = `${gha.toFixed(2)} gha`;
}
