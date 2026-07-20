const HealthVital = require('../models/HealthVital');

const ALL_VITAL_TYPES = [
  'blood_pressure',
  'blood_sugar',
  'bmi',
  'heart_rate',
  'weight',
  'oxygen_saturation',
  'sleep',
  'activity',
];

/**
 * Fetch the most recent reading for each vital type for a citizen.
 * Returns a map keyed by type, e.g. { blood_pressure: <doc>, bmi: <doc> }.
 * Types with no recorded readings are simply absent from the map.
 */
async function getLatestVitalsMap(citizenId, types = ALL_VITAL_TYPES) {
  const latestVitals = {};
  await Promise.all(
    types.map(async (type) => {
      const v = await HealthVital.findOne({ citizen: citizenId, type })
        .sort({ recordedAt: -1 })
        .lean();
      if (v) latestVitals[type] = v;
    })
  );
  return latestVitals;
}

module.exports = { getLatestVitalsMap, ALL_VITAL_TYPES };
