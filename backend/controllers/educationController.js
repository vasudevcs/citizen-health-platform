const EducationProgress = require('../models/EducationProgress');

// Static curated health-education library. No CMS yet — same approach as
// the Mental Wellbeing resource library. Swap for a DB-backed
// EducationContent collection once the Admin module can manage it.
const CONTENT = [
  {
    id: 'nutrition-basics',
    category: 'nutrition',
    type: 'article',
    title: 'Nutrition Basics for a Balanced Diet',
    description: 'Understanding macronutrients, portion sizes, and building balanced meals.',
    durationMinutes: 8,
    body: `A balanced diet centers on three macronutrients: carbohydrates for energy, protein for tissue repair and growth, and fats for hormone production and nutrient absorption. Most adults benefit from filling roughly half a plate with vegetables and fruit, a quarter with whole grains or starchy vegetables, and a quarter with a protein source.

Portion size matters as much as food choice. A simple guide: protein about the size of your palm, carbohydrates about the size of your cupped hand, and fats about the size of your thumb per meal.

Aim for variety across the week rather than perfection at every meal — different colored vegetables and fruits supply different vitamins and antioxidants. Limit ultra-processed foods high in added sugar and sodium where you can, but an occasional treat is a normal part of a sustainable diet, not a failure.`,
  },
  {
    id: 'hydration-habits',
    category: 'nutrition',
    type: 'article',
    title: 'Daily Hydration Habits',
    description: 'Why water intake matters and simple habits to stay hydrated.',
    durationMinutes: 4,
    body: `Water regulates body temperature, lubricates joints, and helps carry nutrients to cells. A common guideline is about 8 cups (roughly 2 liters) a day for most adults, though needs vary with activity level, climate, and body size — thirst and pale-yellow urine are simple everyday indicators that you're getting enough.

Simple habits help: keep a water bottle within reach, drink a glass with each meal, and set a reminder if you tend to forget during busy periods. Fruits and vegetables with high water content — cucumber, watermelon, oranges — also contribute to daily fluid intake.

Coffee and tea count toward hydration despite their mild diuretic effect. If you exercise heavily or are in hot weather, increase intake and consider a drink with electrolytes for longer sessions.`,
  },
  {
    id: 'diabetes-management',
    category: 'chronic-disease',
    type: 'guide',
    title: 'Living Well with Diabetes',
    description: 'Blood sugar monitoring, diet adjustments, and warning signs to watch for.',
    durationMinutes: 12,
    body: `Managing diabetes well starts with regular blood sugar monitoring — your care team will set target ranges based on your specific situation. Keeping a log of readings alongside meals and activity helps identify patterns over time.

Diet adjustments generally focus on consistent carbohydrate intake spread across the day rather than large amounts at once, pairing carbohydrates with protein or fiber to slow sugar absorption, and limiting sugary drinks. Regular physical activity improves insulin sensitivity and helps with blood sugar control.

Warning signs that need prompt attention include unusual thirst, frequent urination, blurred vision, slow-healing cuts, or numbness in the feet. Symptoms of very low blood sugar — shakiness, sweating, confusion — need immediate treatment with fast-acting sugar. This guide is educational; always follow your own doctor's specific plan and medication instructions.`,
  },
  {
    id: 'hypertension-guide',
    category: 'chronic-disease',
    type: 'guide',
    title: 'Managing High Blood Pressure',
    description: 'Lifestyle changes and medication adherence tips for hypertension.',
    durationMinutes: 10,
    body: `High blood pressure often has no symptoms, which is why regular monitoring matters even when you feel fine. Lifestyle changes that help lower blood pressure include reducing sodium intake, maintaining a healthy weight, staying physically active, limiting alcohol, and managing stress.

If you're prescribed medication, taking it consistently at the same time each day — not just when blood pressure feels "high" — is important, since these medications work by maintaining steady control rather than treating symptoms. Never stop or adjust blood pressure medication without talking to your doctor first, as stopping abruptly can cause a dangerous rebound.

Home monitoring, done at the same time each day and after resting quietly for a few minutes, gives your care team useful data between visits. Seek urgent care for a severe headache, chest pain, or shortness of breath alongside a very high reading.`,
  },
  {
    id: 'prenatal-care',
    category: 'maternal-health',
    type: 'article',
    title: 'Prenatal Care Essentials',
    description: 'Checkup schedules, nutrition, and warning signs during pregnancy.',
    durationMinutes: 9,
    body: `Regular prenatal checkups let your care team track the pregnancy's progress and catch potential issues early. A typical schedule is roughly monthly visits through 28 weeks, every two weeks from 28–36 weeks, and weekly after that, though your provider may adjust this based on your situation.

Nutrition needs increase during pregnancy — folic acid, iron, calcium, and protein are especially important, and a prenatal vitamin is commonly recommended. Staying hydrated and getting moderate exercise (as approved by your provider) supports overall wellbeing.

Contact your provider promptly for warning signs such as heavy bleeding, severe abdominal pain, sudden swelling, severe headaches, vision changes, or a noticeable decrease in the baby's movement.`,
  },
  {
    id: 'postpartum-recovery',
    category: 'maternal-health',
    type: 'article',
    title: 'Postpartum Recovery Basics',
    description: 'Physical and emotional recovery in the weeks after childbirth.',
    durationMinutes: 7,
    body: `Physical recovery after childbirth typically takes about six weeks, though it varies by delivery type and individual healing. Rest when possible, stay hydrated, and don't hesitate to ask for help with household tasks so you can focus on recovery and the baby.

Emotional changes are common in the days after birth — the "baby blues" (mood swings, tearfulness) usually ease within two weeks. If low mood, anxiety, or difficulty bonding persists beyond that, or feels severe, that may be postpartum depression, which is treatable — reaching out to a provider is a sign of strength, not failure.

Attend your postpartum checkup, typically scheduled within the first few weeks, and contact your provider sooner for heavy bleeding, fever, severe pain, or thoughts of harming yourself or the baby.`,
  },
  {
    id: 'annual-screenings',
    category: 'preventive-care',
    type: 'article',
    title: 'Recommended Annual Health Screenings',
    description: 'Which checkups and screenings to schedule by age group.',
    durationMinutes: 6,
    body: `Preventive screenings catch issues before symptoms appear, when they're often easier to treat. Common baseline screenings for most adults include blood pressure and cholesterol checks, and a periodic general checkup.

Screening needs increase with age and personal/family history: this can include diabetes screening, colorectal cancer screening starting around age 45, and cancer screenings appropriate to your age and sex (such as mammograms or cervical cancer screening) as recommended by your provider. Dental and eye checkups are worth keeping on an annual or biannual schedule too.

Because guidelines vary by individual risk factors, family history, and country, the most reliable next step is asking your own doctor which screenings apply to you and how often.`,
  },
  {
    id: 'vaccination-schedule',
    category: 'preventive-care',
    type: 'guide',
    title: 'Adult Vaccination Schedule',
    description: 'Staying up to date on recommended vaccines through adulthood.',
    durationMinutes: 5,
    body: `Vaccination isn't just for childhood — several vaccines are recommended on an ongoing basis for adults. A seasonal flu vaccine is generally recommended annually, and tetanus/diphtheria boosters are typically recommended roughly every 10 years.

Depending on age, health conditions, and prior vaccination history, additional vaccines may be recommended, such as those for pneumonia or shingles later in life. Travel to certain regions may call for additional vaccines specific to that destination.

Keep a personal vaccination record if possible, since recommendations depend partly on what you've already received. Your doctor or local pharmacy can review your history and let you know what's due.`,
  },
  {
    id: 'cpr-basics',
    category: 'first-aid',
    type: 'video',
    title: 'CPR Basics: What Everyone Should Know',
    description: 'A step-by-step walkthrough of hands-only CPR for emergencies.',
    durationMinutes: 6,
    body: `Hands-only CPR is designed for bystanders responding to an adult who is unresponsive and not breathing normally. First, call emergency services (or have someone else call) before starting compressions.

Place the heel of one hand on the center of the chest, the other hand on top, and push hard and fast — about 2 inches deep at a rate of 100–120 compressions per minute (roughly the tempo of a fast heartbeat). Allow the chest to fully recoil between compressions and continue until emergency responders arrive or the person starts breathing normally.

This overview is not a substitute for a certified CPR course, which includes hands-on practice and covers additional scenarios like rescue breaths for children and infants. Consider taking an in-person or accredited online course to build real hands-on confidence.`,
  },
  {
    id: 'wound-care',
    category: 'first-aid',
    type: 'article',
    title: 'Basic Wound Care at Home',
    description: 'Cleaning, dressing, and knowing when a wound needs medical attention.',
    durationMinutes: 4,
    body: `For minor cuts and scrapes, start by washing your hands, then rinse the wound gently with clean running water to remove dirt and debris. Mild soap can be used around the wound, but avoid getting it directly in an open cut. Pat dry with a clean cloth.

Apply a thin layer of an antibiotic ointment if you have one, then cover with a clean bandage to keep the area moist and protected, which helps healing and reduces scarring. Change the dressing daily or whenever it gets wet or dirty.

Seek medical attention for wounds that are deep, won't stop bleeding after 10 minutes of firm pressure, show signs of infection (increasing redness, warmth, swelling, pus, or fever), resulted from an animal or human bite, or if you're unsure about your tetanus vaccination status.`,
  },
];

const CATEGORIES = [
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'chronic-disease', label: 'Chronic Disease' },
  { value: 'maternal-health', label: 'Maternal Health' },
  { value: 'preventive-care', label: 'Preventive Care' },
  { value: 'first-aid', label: 'First Aid' },
];

function contentById(id) {
  return CONTENT.find((c) => c.id === id) || null;
}

// ─────────────────────────────────────────────
// GET /education/content — library, optional ?category=
// ─────────────────────────────────────────────
exports.listContent = async (req, res, next) => {
  try {
    const items = req.query.category
      ? CONTENT.filter((c) => c.category === req.query.category)
      : CONTENT;
    res.json({ success: true, data: { items, categories: CATEGORIES } });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /education/content/:id
// ─────────────────────────────────────────────
exports.getContent = async (req, res, next) => {
  try {
    const item = contentById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /education/progress — all progress rows for the citizen
// ─────────────────────────────────────────────
exports.getProgress = async (req, res, next) => {
  try {
    const rows = await EducationProgress.find({ citizen: req.user.id }).lean();
    const completedIds = rows.filter((r) => r.completed).map((r) => r.contentId);
    const bookmarkedIds = rows.filter((r) => r.bookmarked).map((r) => r.contentId);

    res.json({
      success: true,
      data: {
        completedIds,
        bookmarkedIds,
        completedCount: completedIds.length,
        totalCount: CONTENT.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// PATCH /education/content/:id/progress — mark completed/bookmarked
// ─────────────────────────────────────────────
exports.updateProgress = async (req, res, next) => {
  try {
    const item = contentById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    const update = { ...req.body };
    if (update.completed === true) update.completedAt = new Date();
    if (update.completed === false) update.completedAt = null;

    if (Object.keys(update).length === 0) {
      const current = await EducationProgress.findOne({ citizen: req.user.id, contentId: req.params.id });
      return res.json({ success: true, data: current || { citizen: req.user.id, contentId: req.params.id, completed: false, bookmarked: false } });
    }

    const progress = await EducationProgress.findOneAndUpdate(
      { citizen: req.user.id, contentId: req.params.id },
      { $set: update },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
};
