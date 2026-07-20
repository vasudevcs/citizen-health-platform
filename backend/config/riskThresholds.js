// ─────────────────────────────────────────────────────────────────────────
// Risk Assessment thresholds — single source of truth for the rule-based
// engine. Change limits here, not inline in riskEngine.js.
// Units: blood_sugar = mg/dL (fasting), blood_pressure = mmHg, bmi = kg/m^2
// ─────────────────────────────────────────────────────────────────────────

const RISK_LEVELS = ['low', 'moderate', 'high', 'critical'];

// score bands (0-100, higher = worse) -> level
const LEVEL_BANDS = [
  { max: 24, level: 'low' },
  { max: 49, level: 'moderate' },
  { max: 74, level: 'high' },
  { max: 100, level: 'critical' },
];

const DIABETES = {
  fastingBloodSugar: { normal: 99, prediabetic: 125 }, // >125 = diabetic range
  bmiOverweight: 25,
  bmiObese: 30,
  ageRisk: 45,
  points: { bloodSugarDiabetic: 40, bloodSugarPrediabetic: 20, bmiObese: 20, bmiOverweight: 10, age: 10, familyHistory: 15, sedentary: 10 },
};

const HYPERTENSION = {
  systolicElevated: 130,
  systolicStage1: 140,
  systolicStage2: 160,
  diastolicStage1: 90,
  diastolicStage2: 100,
  ageRisk: 45,
  points: { stage2: 40, stage1: 25, elevated: 12, age: 10, familyHistory: 12, bmiObese: 10, sedentary: 8 },
};

const CARDIOVASCULAR = {
  restingHeartRateHigh: 100,
  restingHeartRateLow: 50,
  ageRisk: 50,
  points: { hypertensionStage2: 25, hypertensionStage1: 15, bmiObese: 15, highHeartRate: 10, age: 15, smoker: 20, familyHistory: 15, diabetic: 15, sedentary: 10 },
};

const OBESITY = {
  bmiOverweight: 25,
  bmiObese: 30,
  bmiSevereObese: 35,
  points: { severeObese: 45, obese: 30, overweight: 15, sedentary: 15, familyHistory: 10 },
};

module.exports = {
  RISK_LEVELS,
  LEVEL_BANDS,
  DIABETES,
  HYPERTENSION,
  CARDIOVASCULAR,
  OBESITY,
  ENGINE_VERSION: 'rule-based-v1',
};
