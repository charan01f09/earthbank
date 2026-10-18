export const FAIR_SHARE_GHA = 1.5;

export const TRAVEL_FACTORS = {
  'Walk / Cycle': 0,
  Bus: 0.09,
  'Metro / Train': 0.04,
  'Two-wheeler': 0.05,
  'Petrol car': 0.17,
  'Diesel car': 0.19,
  'Flight-heavy': 0.25,
};

export const DIET = {
  Vegan: { carbon: 1.5, water: 2000, gha: 0.4 },
  Vegetarian: { carbon: 2.0, water: 2500, gha: 0.6 },
  Mixed: { carbon: 3.3, water: 3500, gha: 0.9 },
  'Non-vegetarian': { carbon: 4.5, water: 4500, gha: 1.3 },
  'Heavy meat': { carbon: 7.0, water: 6000, gha: 1.9 },
};

export const SHOPPING = {
  Low: { carbon: 1.0, water: 300, gha: 0.1 },
  Medium: { carbon: 2.5, water: 800, gha: 0.25 },
  High: { carbon: 5.0, water: 1800, gha: 0.6 },
};

export const BENCHMARKS = [
  { name: 'India', gha: 1.2, label: 'India · approx.' },
  { name: 'World', gha: 2.7, label: 'World · approx.' },
  { name: 'Europe', gha: 4.5, label: 'Europe · illustrative avg.' },
  { name: 'USA', gha: 8.0, label: 'USA · approx.' },
];

export const TIMELINE = [
  { year: 1970, earths: 0.98 },
  { year: 1980, earths: 1.06 },
  { year: 1990, earths: 1.18 },
  { year: 2000, earths: 1.29 },
  { year: 2010, earths: 1.47 },
  { year: 2020, earths: 1.59 },
  { year: 2026, earths: 1.70 },
];

export const CYCLES = {
  carbon: {
    name: 'Carbon',
    eyebrow: 'A mobile element · atmosphere, life, rock and sea',
    description: 'Carbon moves among the air, living things, oceans and rocks. Plants draw CO₂ from the atmosphere; respiration, decay and combustion return it. Burning fossil carbon transfers long-stored carbon to the atmosphere faster than natural sinks can rebalance it.',
    nodes: ['CO₂ · air', 'Green plants', 'Ocean', 'Fossil carbon'],
    note: 'More atmospheric CO₂ also dissolves into seawater, shifting carbonate chemistry. Corals and shell-building animals need carbonate ions to build and maintain shells and skeletons.',
  },
  nitrogen: {
    name: 'Nitrogen',
    eyebrow: 'A nutrient cycle · air, soil, water and living things',
    description: 'Most nitrogen is N₂ gas in the air, which most organisms cannot use directly. Microbes and industrial Haber–Bosch fixation turn it into reactive forms that plants can use. Excess fertilizer can wash into waterways, fueling eutrophication and algal blooms.',
    nodes: ['N₂ · air', 'Reactive N', 'Crops & life', 'Waterways'],
    note: 'The Haber–Bosch process made reactive nitrogen widely available for fertilizer; careful use matters because surplus nitrogen can travel far beyond a field.',
  },
  phosphorus: {
    name: 'Phosphorus',
    eyebrow: 'A slow cycle · rock, soil, water and life',
    description: 'Phosphorus cycles mainly through rocks, soils, sediments and organisms—not the atmosphere. Weathering releases phosphate; plants take it up, food webs pass it along, and runoff carries excess fertilizer or eroded soil into lakes and coasts.',
    nodes: ['Rock · phosphate', 'Soil', 'Crops & life', 'Lake sediment'],
    note: 'An extra pulse of phosphorus can stimulate blooms. When the bloom dies and decomposes, oxygen in the water may be depleted, stressing aquatic life.',
  },
  sulfur: {
    name: 'Sulfur',
    eyebrow: 'A pathway through rock, air, water and organisms',
    description: 'Sulfur is stored in rocks, soils, oceans and living things. Volcanoes and decomposition release some sulfur compounds; fossil-fuel burning can add sulfur dioxide to the air, where reactions contribute to acidic deposition.',
    nodes: ['Rock & fuel', 'SO₂ · air', 'Soil & water', 'Living things'],
    note: 'Acidic deposition can weather carbonate stone. Marble monuments, made largely of calcite, can lose detail as their surface reacts with acids.',
  },
  water: {
    name: 'Water',
    eyebrow: 'A moving cycle · atmosphere, land, rivers and aquifers',
    description: 'Sunlight drives evaporation and plant transpiration; water vapor condenses, falls as precipitation, and flows over or through land. Pumping groundwater faster than it is replenished can lower water tables and stress rivers, wetlands and wells.',
    nodes: ['Atmosphere', 'Rivers & rain', 'Groundwater', 'Living land'],
    note: 'A water footprint includes water used directly and indirectly along supply chains. Green, blue and grey water describe different kinds of use; they are not interchangeable measures of scarcity.',
  },
};

export const QUIZ = [
  {
    question: 'In the Earth-bank analogy, what does biocapacity represent?',
    options: ['Nature’s ability to regenerate resources and absorb some wastes', 'The amount of money spent on energy', 'Only the amount of freshwater in rivers'],
    answer: 0,
    explanation: 'Biocapacity is the regenerative supply side: biologically productive areas provide resources and absorb some wastes.',
  },
  {
    question: 'Which unit is used for the Ecological Footprint in this guide?',
    options: ['Liters per day', 'Global hectares (gha)', 'Kilograms of nitrogen'],
    answer: 1,
    explanation: 'Global hectares express biologically productive area using a common productivity-weighted unit.',
  },
  {
    question: 'What does a carbon footprint total in this calculator?',
    options: ['Only carbon atoms in food', 'Greenhouse-gas emissions expressed as CO₂-equivalent', 'All water used at home'],
    answer: 1,
    explanation: 'CO₂-equivalent puts different greenhouse gases on a shared warming-impact basis for comparison.',
  },
  {
    question: 'What can happen when extra carbon dioxide dissolves in seawater?',
    options: ['It can shift carbonate chemistry and lower pH', 'It turns all seawater into freshwater', 'It stops the water cycle'],
    answer: 0,
    explanation: 'Dissolved CO₂ participates in reactions that increase hydrogen ions and change carbonate availability.',
  },
  {
    question: 'What is the main role of the Haber–Bosch process?',
    options: ['Fix nitrogen gas into ammonia', 'Remove phosphorus from rocks', 'Turn oxygen into carbon dioxide'],
    answer: 0,
    explanation: 'Haber–Bosch combines nitrogen and hydrogen to produce ammonia, a key starting material for many fertilizers.',
  },
  {
    question: 'Why can fertilizer runoff trigger an algal bloom?',
    options: ['Nutrients such as nitrogen and phosphorus can fuel rapid growth', 'It cools water below freezing', 'It removes all sunlight from the atmosphere'],
    answer: 0,
    explanation: 'Excess nutrient inputs can stimulate algae; decomposition of the resulting biomass may consume dissolved oxygen.',
  },
];
