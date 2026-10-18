import { DIET, FAIR_SHARE_GHA, SHOPPING, TRAVEL_FACTORS } from './data.js';

export const DEFAULTS = {
  electricity: 5,
  distance: 15,
  travelMode: 'Bus',
  diet: 'Mixed',
  directWater: 135,
  shopping: 'Medium',
};

export const INDIA_PRESET = {
  electricity: 1.2,
  distance: 5,
  travelMode: 'Bus',
  diet: 'Vegetarian',
  directWater: 135,
  shopping: 'Low',
};

export const HIGH_PRESET = {
  electricity: 24,
  distance: 55,
  travelMode: 'Petrol car',
  diet: 'Heavy meat',
  directWater: 300,
  shopping: 'High',
};

export function calculate(profile) {
  const diet = DIET[profile.diet];
  const shopping = SHOPPING[profile.shopping];
  const electricity = profile.electricity * 0.71;
  const travel = profile.distance * TRAVEL_FACTORS[profile.travelMode];
  const carbon = {
    electricity,
    travel,
    diet: diet.carbon,
    consumption: shopping.carbon,
  };
  const carbonDaily = Object.values(carbon).reduce((sum, value) => sum + value, 0);
  const carbonAnnualTons = carbonDaily * 365 / 1000;

  const dietWater = diet.water;
  const shoppingWater = shopping.water;
  const water = {
    green: dietWater * 0.70 + shoppingWater * 0.25,
    blue: profile.directWater + dietWater * 0.15 + shoppingWater * 0.25 + profile.electricity * 2,
    grey: dietWater * 0.15 + shoppingWater * 0.50,
  };
  water.total = water.green + water.blue + water.grey;
  water.greyShare = water.total ? water.grey / water.total : 0;

  const ecology = {
    carbon: carbonAnnualTons * 0.33,
    food: diet.gha,
    consumption: shopping.gha,
    water: (water.total / 10000) * 0.05,
  };
  ecology.total = Object.values(ecology).reduce((sum, value) => sum + value, 0);
  const earths = ecology.total / FAIR_SHARE_GHA;
  const balance = FAIR_SHARE_GHA - ecology.total;
  const verdict = ecology.total <= FAIR_SHARE_GHA
    ? 'within'
    : ecology.total <= 3
      ? 'moderate'
      : 'severe';

  return {
    carbon,
    carbonDaily,
    carbonAnnualTons,
    water,
    ecology,
    earths,
    balance,
    fairSharePercent: ecology.total / FAIR_SHARE_GHA * 100,
    verdict,
  };
}

export function cycleLoad(result, profile) {
  const nitrogenStressed = profile.diet === 'Mixed' || profile.diet === 'Non-vegetarian';
  const nitrogenOverloaded = ['Heavy meat', 'Non-vegetarian'].includes(profile.diet) || profile.shopping === 'High';
  const waterLoad = result.water.total > 5000 ? 'overloaded' : result.water.total > 2500 ? 'stressed' : 'normal';
  return {
    carbon: result.carbonDaily > 8 ? 'overloaded' : result.carbonDaily > 5 ? 'stressed' : 'normal',
    nitrogen: nitrogenOverloaded ? 'overloaded' : nitrogenStressed ? 'stressed' : 'normal',
    water: waterLoad,
  };
}

export function suggestions(profile, result) {
  const entries = [
    { key: 'electricity', label: 'Electricity', amount: result.carbon.electricity },
    { key: 'travel', label: 'Travel', amount: result.carbon.travel },
    { key: 'diet', label: 'Diet', amount: result.carbon.diet },
    { key: 'consumption', label: 'Consumption', amount: result.carbon.consumption },
  ].sort((a, b) => b.amount - a.amount);

  const dietLadder = ['Heavy meat', 'Non-vegetarian', 'Mixed', 'Vegetarian', 'Vegan'];
  const dietIndex = dietLadder.indexOf(profile.diet);
  const nextDiet = dietIndex >= 0 ? dietLadder[Math.min(dietIndex + 1, dietLadder.length - 1)] : profile.diet;
  const shoppingLadder = ['High', 'Medium', 'Low'];
  const shoppingIndex = shoppingLadder.indexOf(profile.shopping);
  const nextShopping = shoppingIndex >= 0 ? shoppingLadder[Math.min(shoppingIndex + 1, shoppingLadder.length - 1)] : profile.shopping;
  const nextTravel = profile.travelMode === 'Metro / Train'
    ? 'Walk / Cycle'
    : profile.travelMode === 'Walk / Cycle'
      ? profile.travelMode
      : 'Metro / Train';

  const alternatives = {
    electricity: {
      title: 'Use about 1 kWh less each day',
      detail: `Trim from ${profile.electricity} to ${Math.max(0, profile.electricity - 1)} kWh/day.`,
      apply: (p) => ({ ...p, electricity: Math.max(0, Number((p.electricity - 1).toFixed(1))) }),
    },
    travel: {
      title: nextTravel === profile.travelMode ? 'Keep walking or cycling' : `Switch to ${nextTravel}`,
      detail: profile.distance > 0
        ? `Use ${nextTravel} instead of ${profile.travelMode} for ${profile.distance} km/day.`
        : 'At 0 km/day, this estimate has no travel emissions to reduce.',
      apply: (p) => ({ ...p, travelMode: nextTravel }),
    },
    diet: {
      title: nextDiet === profile.diet ? 'Maintain your plant-based pattern' : 'Try one step more plant-rich',
      detail: nextDiet === profile.diet
        ? 'Vegan is already the lowest diet estimate in this model; no further dietary saving is assumed.'
        : `Choose ${nextDiet.toLowerCase()} instead of ${profile.diet.toLowerCase()}.`,
      apply: (p) => ({ ...p, diet: nextDiet }),
    },
    consumption: {
      title: nextShopping === profile.shopping ? 'Maintain low shopping' : 'Choose a lower-shopping week',
      detail: nextShopping === profile.shopping
        ? 'Low is already the lowest shopping estimate in this model; no further consumption saving is assumed.'
        : `Shift from ${profile.shopping.toLowerCase()} to ${nextShopping.toLowerCase()} consumption.`,
      apply: (p) => ({ ...p, shopping: nextShopping }),
    },
  };
  const floorOptions = {
    electricity: { title: 'Keep electricity use at its current minimum', detail: 'The electricity slider is already at 0 kWh/day; no additional modeled reduction remains.' },
    travel: { title: profile.distance === 0 ? 'Maintain a zero-distance day' : 'Keep walking or cycling', detail: profile.distance === 0 ? 'At 0 km/day, this estimate has no travel emissions to reduce.' : 'Walk / Cycle is already the lowest-emission modeled travel mode; no further transport-carbon saving is assumed.' },
    diet: { title: 'Maintain your vegan pattern', detail: 'Vegan is already the lowest diet estimate in this model; no further dietary saving is assumed.' },
    consumption: { title: 'Maintain low shopping', detail: 'Low is already the lowest shopping estimate in this model; no further consumption saving is assumed.' },
  };

  return entries.slice(0, 3).map((entry) => {
    const alternative = alternatives[entry.key];
    const proposedProfile = alternative.apply(profile);
    const proposedResult = calculate(proposedProfile);
    const carbonDelta = result.carbonDaily - proposedResult.carbonDaily;
    const ghaDelta = result.ecology.total - proposedResult.ecology.total;
    const safe = carbonDelta >= -1e-9 && ghaDelta >= -1e-9;
    const actionable = safe && (carbonDelta > 1e-9 || ghaDelta > 1e-9);
    const afterProfile = actionable ? proposedProfile : { ...profile };
    const after = actionable ? proposedResult : result;
    return {
      ...entry,
      ...alternative,
      title: actionable ? alternative.title : floorOptions[entry.key].title,
      detail: actionable ? alternative.detail : floorOptions[entry.key].detail,
      afterProfile,
      after,
      saved: actionable ? Math.max(0, carbonDelta) : 0,
      savedGha: actionable ? Math.max(0, ghaDelta) : 0,
      noAdditionalSaving: !actionable,
    };
  });
}
