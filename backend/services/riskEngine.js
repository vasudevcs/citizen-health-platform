const T = require('./../config/riskThresholds');

// ─────────────────────────────────────────────────────────────────────────
// This module is intentionally the ONLY place that knows how a risk score
// is computed. citizenController.js only ever calls `assess(input)` and
// stores whatever it gets back. To swap in an ML model later:
//   1. Build a new module (e.g. services/mlRiskEngine.js) exporting the
//      same `assess(input) -> { provider, conditions }` shape.
//   2. Change the single `require('./riskEngine')` line in
//      citizenController.js to point at it.
// No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────

function clampScore(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function levelFromScore(score) {
  const band = T.LEVEL_BANDS.find((b) => score <= b.max);
  return band ? band.level : 'critical';
}

/**
 * Normalizes raw latest-vitals + user-submitted profile answers into a flat
 * input object every assessor reads from. Keeping this in one place means
 * assessors never touch the HealthVital document shape directly.
 */
function buildInput(latestVitals, profile) {
  const bp = latestVitals.blood_pressure;
  const bmiDoc = latestVitals.bmi;
  const sugarDoc = latestVitals.blood_sugar;
  const hrDoc = latestVitals.heart_rate;
  const activityDoc = latestVitals.activity;

  return {
    age: profile.age ?? null,
    gender: profile.gender ?? null,
    smoker: !!profile.smoker,
    familyHistory: {
      diabetes: !!profile.familyHistory?.diabetes,
      hypertension: !!profile.familyHistory?.hypertension,
      cardiovascular: !!profile.familyHistory?.cardiovascular,
      obesity: !!profile.familyHistory?.obesity,
    },
    systolic: bp?.value?.primary ?? null,
    diastolic: bp?.value?.secondary ?? null,
    bloodSugar: sugarDoc?.value?.primary ?? null,
    bmi: bmiDoc?.value?.primary ?? null,
    heartRate: hrDoc?.value?.primary ?? null,
    dailySteps: activityDoc?.value?.primary ?? null,
    sedentary: activityDoc?.value?.primary != null ? activityDoc.value.primary < 5000 : null,
    hasVitalsData: !!(bp || bmiDoc || sugarDoc || hrDoc || activityDoc),
  };
}

// ── Diabetes ────────────────────────────────────────────────────────────
function assessDiabetes(input) {
  const C = T.DIABETES;
  let score = 0;
  const factors = [];
  const recommendations = [];

  if (input.bloodSugar != null) {
    if (input.bloodSugar > C.fastingBloodSugar.prediabetic) {
      score += C.points.bloodSugarDiabetic;
      factors.push(`Fasting blood sugar ${input.bloodSugar} mg/dL is in the diabetic range`);
      recommendations.push('Consult a doctor for a formal diabetes screening (HbA1c test)');
    } else if (input.bloodSugar > C.fastingBloodSugar.normal) {
      score += C.points.bloodSugarPrediabetic;
      factors.push(`Fasting blood sugar ${input.bloodSugar} mg/dL is in the prediabetic range`);
      recommendations.push('Reduce refined sugar and carbohydrate intake');
    }
  }
  if (input.bmi != null) {
    if (input.bmi >= C.bmiObese) {
      score += C.points.bmiObese;
      factors.push(`BMI ${input.bmi} is in the obese range`);
    } else if (input.bmi >= C.bmiOverweight) {
      score += C.points.bmiOverweight;
      factors.push(`BMI ${input.bmi} is in the overweight range`);
    }
  }
  if (input.age != null && input.age >= C.ageRisk) {
    score += C.points.age;
    factors.push(`Age ${input.age} increases baseline diabetes risk`);
  }
  if (input.familyHistory.diabetes) {
    score += C.points.familyHistory;
    factors.push('Family history of diabetes');
  }
  if (input.sedentary) {
    score += C.points.sedentary;
    factors.push('Low daily activity (under 5,000 steps/day)');
    recommendations.push('Aim for at least 30 minutes of moderate activity most days');
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain current diet and activity habits, and recheck blood sugar periodically');
  }

  return { score: clampScore(score), factors, recommendations };
}

// ── Hypertension ────────────────────────────────────────────────────────
function assessHypertension(input) {
  const C = T.HYPERTENSION;
  let score = 0;
  const factors = [];
  const recommendations = [];

  if (input.systolic != null && input.diastolic != null) {
    if (input.systolic >= C.systolicStage2 || input.diastolic >= C.diastolicStage2) {
      score += C.points.stage2;
      factors.push(`Blood pressure ${input.systolic}/${input.diastolic} mmHg is Stage 2 hypertension`);
      recommendations.push('See a doctor promptly to discuss blood pressure management');
    } else if (input.systolic >= C.systolicStage1 || input.diastolic >= C.diastolicStage1) {
      score += C.points.stage1;
      factors.push(`Blood pressure ${input.systolic}/${input.diastolic} mmHg is Stage 1 hypertension`);
      recommendations.push('Reduce sodium intake and monitor blood pressure weekly');
    } else if (input.systolic >= C.systolicElevated) {
      score += C.points.elevated;
      factors.push(`Blood pressure ${input.systolic}/${input.diastolic} mmHg is elevated`);
    }
  }
  if (input.age != null && input.age >= C.ageRisk) {
    score += C.points.age;
    factors.push(`Age ${input.age} increases baseline hypertension risk`);
  }
  if (input.familyHistory.hypertension) {
    score += C.points.familyHistory;
    factors.push('Family history of hypertension');
  }
  if (input.bmi != null && input.bmi >= T.DIABETES.bmiObese) {
    score += C.points.bmiObese;
    factors.push(`BMI ${input.bmi} is in the obese range`);
  }
  if (input.sedentary) {
    score += C.points.sedentary;
    factors.push('Low daily activity (under 5,000 steps/day)');
  }

  if (recommendations.length === 0) {
    recommendations.push('Keep blood pressure checks regular and maintain a low-sodium diet');
  }

  return { score: clampScore(score), factors, recommendations };
}

// ── Cardiovascular ──────────────────────────────────────────────────────
function assessCardiovascular(input) {
  const C = T.CARDIOVASCULAR;
  let score = 0;
  const factors = [];
  const recommendations = [];

  if (input.systolic != null && input.diastolic != null) {
    if (input.systolic >= T.HYPERTENSION.systolicStage2 || input.diastolic >= T.HYPERTENSION.diastolicStage2) {
      score += C.points.hypertensionStage2;
      factors.push('Stage 2 hypertension increases cardiovascular strain');
    } else if (input.systolic >= T.HYPERTENSION.systolicStage1 || input.diastolic >= T.HYPERTENSION.diastolicStage1) {
      score += C.points.hypertensionStage1;
      factors.push('Stage 1 hypertension increases cardiovascular strain');
    }
  }
  if (input.bmi != null && input.bmi >= T.DIABETES.bmiObese) {
    score += C.points.bmiObese;
    factors.push(`BMI ${input.bmi} is in the obese range`);
  }
  if (input.heartRate != null && (input.heartRate >= C.restingHeartRateHigh || input.heartRate <= C.restingHeartRateLow)) {
    score += C.points.highHeartRate;
    factors.push(`Resting heart rate ${input.heartRate} bpm is outside the typical range`);
    recommendations.push('Discuss resting heart rate with a doctor if it persists');
  }
  if (input.age != null && input.age >= C.ageRisk) {
    score += C.points.age;
    factors.push(`Age ${input.age} increases baseline cardiovascular risk`);
  }
  if (input.smoker) {
    score += C.points.smoker;
    factors.push('Current smoker');
    recommendations.push('Smoking cessation is the single biggest step to lower cardiovascular risk');
  }
  if (input.familyHistory.cardiovascular) {
    score += C.points.familyHistory;
    factors.push('Family history of cardiovascular disease');
  }
  if (input.bloodSugar != null && input.bloodSugar > T.DIABETES.fastingBloodSugar.prediabetic) {
    score += C.points.diabetic;
    factors.push('Elevated blood sugar adds cardiovascular risk');
  }
  if (input.sedentary) {
    score += C.points.sedentary;
    factors.push('Low daily activity (under 5,000 steps/day)');
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain regular cardio activity and periodic checkups');
  }

  return { score: clampScore(score), factors, recommendations };
}

// ── Obesity ──────────────────────────────────────────────────────────────
function assessObesity(input) {
  const C = T.OBESITY;
  let score = 0;
  const factors = [];
  const recommendations = [];

  if (input.bmi != null) {
    if (input.bmi >= C.bmiSevereObese) {
      score += C.points.severeObese;
      factors.push(`BMI ${input.bmi} indicates severe obesity`);
      recommendations.push('Speak with a doctor about a structured weight-management plan');
    } else if (input.bmi >= C.bmiObese) {
      score += C.points.obese;
      factors.push(`BMI ${input.bmi} indicates obesity`);
      recommendations.push('Consider a structured diet and activity plan');
    } else if (input.bmi >= C.bmiOverweight) {
      score += C.points.overweight;
      factors.push(`BMI ${input.bmi} indicates overweight`);
    }
  }
  if (input.sedentary) {
    score += C.points.sedentary;
    factors.push('Low daily activity (under 5,000 steps/day)');
    recommendations.push('Gradually increase daily steps toward 8,000-10,000');
  }
  if (input.familyHistory.obesity) {
    score += C.points.familyHistory;
    factors.push('Family history of obesity');
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain current weight through balanced diet and regular activity');
  }

  return { score: clampScore(score), factors, recommendations };
}

const ASSESSORS = {
  diabetes: assessDiabetes,
  hypertension: assessHypertension,
  cardiovascular: assessCardiovascular,
  obesity: assessObesity,
};

/**
 * Public engine interface. `input` is the normalized object from
 * buildInput(). Returns { provider, conditions: { <name>: {score, level,
 * factors, recommendations} } }.
 */
function assess(input) {
  const conditions = {};
  for (const [name, fn] of Object.entries(ASSESSORS)) {
    const result = fn(input);
    conditions[name] = {
      score: result.score,
      level: levelFromScore(result.score),
      factors: result.factors,
      recommendations: result.recommendations,
    };
  }
  return { provider: T.ENGINE_VERSION, conditions };
}

module.exports = { assess, buildInput, levelFromScore };
