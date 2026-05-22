/* Banyan — taxonomy of conditions and their root causes.
   12 categories arrayed around the canopy, each containing 3–17 conditions.
   Every condition resolves to one of seven root-cause archetypes below. */

export const rootCauses = {
    "chronic-stress": {
      name: "Chronic Stress",
      number: "01",
      insight: "Stress is not the storm — it is the soil where storms keep growing.",
      body: "Prolonged activation of the body's stress response erodes the systems that keep mind and body steady. Cortisol stays elevated, sleep architecture shallow, digestion suppressed. Over months, the body forgets what calm feels like. The work is not avoiding stress — it is teaching the system to return.",
      meta: { Domain: "Physiological", Span: "Months → Years", Layer: "HPA axis" },
    },
    "nervous-system": {
      name: "Nervous System Dysregulation",
      number: "02",
      insight: "A regulated nervous system is the quiet ground beneath every other practice.",
      body: "When the autonomic nervous system loses its capacity to shift between activation and rest, symptoms travel everywhere — racing thoughts, shallow sleep, unsteady mood, unreliable digestion. Regulation is rebuilt slowly: through breath, rhythm, co-regulation, and time spent in places where the body can finally exhale.",
      meta: { Domain: "Somatic", Span: "Weeks → Months", Layer: "Polyvagal" },
    },
    "emotional": {
      name: "Emotional Suppression",
      number: "03",
      insight: "Emotions that are unfelt do not disappear — they take residence in the body.",
      body: "What gets pushed away does not leave; it settles into muscle, gut, and breath. Years of carefully managed composure can present as fatigue, tightness, hypervigilance, or a quiet dimming of joy. Reconnection is not catharsis — it is the patient practice of allowing feeling to move again.",
      meta: { Domain: "Emotional", Span: "Years", Layer: "Somatic memory" },
    },
    "sleep": {
      name: "Sleep Disruption",
      number: "04",
      insight: "Sleep is the body's deepest medicine — and the first to be sacrificed.",
      body: "Without restorative sleep the body cannot clear, repair, or regulate. Energy thins, mood narrows, immunity falters, hormonal rhythms drift. Healing sleep is rarely about more hours; it is about returning depth — through light, temperature, nervous-system tone, and the slow unlearning of urgency before bed.",
      meta: { Domain: "Restorative", Span: "Nightly", Layer: "Circadian" },
    },
    "trauma": {
      name: "Unprocessed Trauma",
      number: "05",
      insight: "The body keeps a record the mind chose not to read.",
      body: "Trauma is not the event — it is what the nervous system could not metabolize at the time. Years later it can echo as anxiety, autoimmunity, chronic tension, or a sense of not quite arriving in one's own life. Resolution is gentle and embodied, not heroic: the system learns, slowly, that the moment has passed.",
      meta: { Domain: "Psychosomatic", Span: "Lifetime", Layer: "Implicit memory" },
    },
    "lifestyle": {
      name: "Lifestyle Imbalance",
      number: "06",
      insight: "A life out of rhythm produces a body out of rhythm.",
      body: "Modern days are engineered to override our biology — light when there should be dark, urgency where there should be pause, stimulation in place of stillness. The result is a body that never quite finds its register. Restoration begins by re-introducing rhythm: of light, of meals, of movement, of rest.",
      meta: { Domain: "Behavioural", Span: "Daily", Layer: "Circadian / ritual" },
    },
    "nutrition": {
      name: "Nutritional Imbalance",
      number: "07",
      insight: "We do not eat to feed ourselves — we eat to feed the systems that make us.",
      body: "The gut is an internal ecosystem in conversation with mood, immunity, hormones, and thought. Deficiencies and inflammation rarely arrive announced; they show up as fatigue, mental fog, sensitivity, skin disruption. Nourishment is not optimization — it is the patient repair of an interior soil that has been depleted.",
      meta: { Domain: "Biochemical", Span: "Months", Layer: "Microbiome" },
    },
};

const rootOrder = [
  "chronic-stress",
  "nervous-system",
  "emotional",
  "sleep",
  "trauma",
  "lifestyle",
  "nutrition",
];

const categories = [
  {
    id: "mental",
    name: "Mental Health",
    tag: "Mind",
    defaultRoot: "nervous-system",
    conditions: [
      { name: "Depression", root: "emotional" },
      { name: "Anxiety", root: "nervous-system" },
      { name: "Bipolar Disorder", root: "trauma" },
      { name: "Psychotic Disorders", root: "trauma" },
      { name: "ADHD", root: "nervous-system" },
      { name: "Insomnia", root: "sleep" },
      { name: "Burnout", root: "chronic-stress" },
      { name: "Brain Fog", root: "nutrition" },
      { name: "Mood Swings", root: "emotional" },
      { name: "Low Motivation", root: "emotional" },
    ],
  },
  {
    id: "metabolic",
    name: "Lifestyle / Metabolic",
    tag: "Metabolism",
    defaultRoot: "lifestyle",
    conditions: [
      { name: "Obesity", root: "lifestyle" },
      { name: "Type 2 Diabetes", root: "lifestyle" },
      { name: "Fatty Liver (NAFLD)", root: "nutrition" },
      { name: "Gout", root: "nutrition" },
      { name: "Fatigue / Chronic Fatigue", root: "chronic-stress" },
      { name: "Low Immunity", root: "nutrition" },
      { name: "Sluggish Metabolism", root: "lifestyle" },
      { name: "Temperature Intolerance", root: "nervous-system" },
      { name: "Poor Recovery", root: "sleep" },
    ],
  },
  {
    id: "musculoskeletal",
    name: "Musculoskeletal",
    tag: "Frame",
    defaultRoot: "chronic-stress",
    conditions: [
      { name: "Osteoarthritis", root: "lifestyle" },
      { name: "Rheumatoid Arthritis", root: "trauma" },
      { name: "Fibromyalgia", root: "nervous-system" },
      { name: "Back & Neck Pain", root: "chronic-stress" },
      { name: "Osteoporosis", root: "nutrition" },
      { name: "Tendinitis", root: "lifestyle" },
      { name: "Sciatica", root: "nervous-system" },
      { name: "Frozen Shoulder", root: "emotional" },
      { name: "Joint Stiffness", root: "lifestyle" },
    ],
  },
  {
    id: "cardiovascular",
    name: "Cardiovascular",
    tag: "Circulation",
    defaultRoot: "lifestyle",
    conditions: [
      { name: "Dyslipidemia", root: "nutrition" },
      { name: "Hypertension", root: "chronic-stress" },
      { name: "Atherosclerosis", root: "lifestyle" },
      { name: "Coronary Artery Disease", root: "lifestyle" },
      { name: "Coronary Artery Calcification", root: "lifestyle" },
      { name: "Deep Vein Thrombosis (DVT)", root: "lifestyle" },
      { name: "Varicose Veins", root: "lifestyle" },
      { name: "Postural Hypotension", root: "nervous-system" },
    ],
  },
  {
    id: "autoimmune",
    name: "Autoimmune & Inflammatory",
    tag: "Inflammation",
    defaultRoot: "trauma",
    conditions: [
      { name: "Hashimoto’s Thyroiditis", root: "trauma" },
      { name: "Graves’ Disease", root: "chronic-stress" },
      { name: "Celiac Disease", root: "nutrition" },
      { name: "Multiple Sclerosis", root: "trauma" },
      { name: "Lupus (SLE)", root: "trauma" },
      { name: "Psoriasis", root: "emotional" },
      { name: "Inflammatory Bowel Disease (IBD)", root: "nutrition" },
      { name: "Myasthenia Gravis", root: "trauma" },
      { name: "Other Autoimmune Conditions", root: "trauma" },
    ],
  },
  {
    id: "hormonal",
    name: "Hormonal & Endocrine",
    tag: "Hormones",
    defaultRoot: "chronic-stress",
    conditions: [
      { name: "Hypothyroidism", root: "chronic-stress" },
      { name: "Hyperthyroidism", root: "chronic-stress" },
      { name: "Polycystic Ovary Syndrome (PCOS)", root: "lifestyle" },
      { name: "Adrenal Fatigue", root: "chronic-stress" },
      { name: "Cushing’s Syndrome", root: "chronic-stress" },
      { name: "Endometriosis", root: "trauma" },
      { name: "Infertility", root: "emotional" },
      { name: "Perimenopause Symptoms", root: "lifestyle" },
      { name: "PMS (Premenstrual Syndrome)", root: "lifestyle" },
      { name: "Painful Periods (Dysmenorrhea)", root: "lifestyle" },
      { name: "Erectile Dysfunction", root: "emotional" },
      { name: "Amenorrhea", root: "chronic-stress" },
    ],
  },
  {
    id: "neurological",
    name: "Neurological",
    tag: "Nervous",
    defaultRoot: "nervous-system",
    conditions: [
      { name: "Alzheimer’s Disease", root: "lifestyle" },
      { name: "Parkinson’s Disease", root: "lifestyle" },
      { name: "Epilepsy", root: "nervous-system" },
      { name: "Migraine", root: "chronic-stress" },
      { name: "Neuropathy", root: "nutrition" },
      { name: "Restless Legs Syndrome", root: "sleep" },
      { name: "Headache (Tension / Stress-Related)", root: "chronic-stress" },
      { name: "Peripheral Tingling", root: "nervous-system" },
    ],
  },
  {
    id: "gut",
    name: "Gut & Digestive Health",
    tag: "Gut",
    defaultRoot: "nutrition",
    conditions: [
      { name: "Irritable Bowel Syndrome (IBS)", root: "nervous-system" },
      { name: "Gastroesophageal Reflux Disease (GERD)", root: "lifestyle" },
      { name: "Peptic Ulcer", root: "chronic-stress" },
      { name: "Crohn’s Disease", root: "trauma" },
      { name: "Gallstones", root: "nutrition" },
      { name: "Pancreatitis", root: "lifestyle" },
      { name: "Acid Reflux", root: "lifestyle" },
      { name: "Gas / Flatulence", root: "nutrition" },
      { name: "Indigestion", root: "nutrition" },
      { name: "Poor Appetite", root: "emotional" },
      { name: "Overeating", root: "emotional" },
      { name: "Constipation", root: "lifestyle" },
      { name: "Diarrhea", root: "nutrition" },
      { name: "Bloating", root: "nutrition" },
      { name: "Piles (Hemorrhoids)", root: "lifestyle" },
      { name: "Anal Fissure", root: "lifestyle" },
      { name: "Gastritis", root: "chronic-stress" },
    ],
  },
  {
    id: "respiratory",
    name: "Respiratory & ENT",
    tag: "Breath",
    defaultRoot: "emotional",
    conditions: [
      { name: "Asthma", root: "emotional" },
      { name: "Chronic Obstructive Pulmonary Disease (COPD)", root: "lifestyle" },
      { name: "Sleep Apnea", root: "sleep" },
      { name: "Bronchitis", root: "lifestyle" },
      { name: "Allergic Rhinitis", root: "nutrition" },
      { name: "Sinusitis", root: "lifestyle" },
      { name: "Tonsillitis / Pharyngitis", root: "lifestyle" },
      { name: "Sore Throat", root: "lifestyle" },
      { name: "Common Cold", root: "lifestyle" },
      { name: "Snoring", root: "sleep" },
      { name: "Post-Nasal Drip", root: "lifestyle" },
      { name: "Chronic Cough", root: "emotional" },
      { name: "Vertigo", root: "nervous-system" },
      { name: "Tinnitus", root: "chronic-stress" },
      { name: "Dry Eyes", root: "nutrition" },
    ],
  },
  {
    id: "skin",
    name: "Skin & Hair",
    tag: "Skin",
    defaultRoot: "nutrition",
    conditions: [
      { name: "Acne", root: "nutrition" },
      { name: "Hair Fall", root: "chronic-stress" },
      { name: "Dandruff", root: "nutrition" },
      { name: "Eczema", root: "emotional" },
      { name: "Rosacea", root: "nutrition" },
      { name: "Vitiligo", root: "trauma" },
      { name: "Hives", root: "nervous-system" },
      { name: "Oily Skin", root: "nutrition" },
      { name: "Dry Skin", root: "nutrition" },
      { name: "Puffiness / Dark Circles", root: "sleep" },
      { name: "Premature Aging", root: "lifestyle" },
      { name: "Body Odor", root: "nutrition" },
      { name: "Excessive Sweating", root: "nervous-system" },
      { name: "Boils", root: "nutrition" },
      { name: "Heat Rashes", root: "lifestyle" },
      { name: "Fungal Skin Infections", root: "nutrition" },
    ],
  },
  {
    id: "oral",
    name: "Oral & Dental Health",
    tag: "Mouth",
    defaultRoot: "nutrition",
    conditions: [
      { name: "Mouth Ulcers", root: "nutrition" },
      { name: "Bad Breath (Halitosis)", root: "nutrition" },
      { name: "Oral Thrush", root: "nutrition" },
    ],
  },
  {
    id: "renal",
    name: "Renal & Urinary",
    tag: "Filter",
    defaultRoot: "lifestyle",
    conditions: [
      { name: "Chronic Kidney Disease (CKD)", root: "lifestyle" },
      { name: "Kidney Stones", root: "nutrition" },
      { name: "Urinary Tract Infection (UTI)", root: "nutrition" },
      { name: "Water Retention", root: "lifestyle" },
      { name: "Frequent Urination", root: "nervous-system" },
    ],
  },
];

// Add a stable id to each condition: <cat>-<slug>.
categories.forEach(cat => {
  cat.conditions.forEach(c => {
    c.id = cat.id + "-" + c.name.toLowerCase()
      .replace(/['']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    if (!c.root) c.root = cat.defaultRoot;
    c.categoryId = cat.id;
  });
});

// Build flat condition lookup.
const conditionsById = {};
categories.forEach(cat => cat.conditions.forEach(c => { conditionsById[c.id] = c; }));

export { categories };
export const BanyanData = { categories, rootCauses, rootOrder, conditionsById };
