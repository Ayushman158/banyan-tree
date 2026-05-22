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

  /* Categories — 12, arranged left-to-right around the canopy.
     `defaultRoot` is the most-common underlying cause for that category;
     individual conditions can override with their own `root`. */
  const categories = [
    {
      id: "mental",
      name: "Mental Health",
      tag: "Mind",
      defaultRoot: "nervous-system",
      conditions: [
        { name: "Depression", root: "emotional" },
        { name: "Anxiety" },
        { name: "Bipolar Disorder", root: "trauma" },
        { name: "Psychotic Spectrum", root: "trauma" },
        { name: "ADHD" },
        { name: "Insomnia", root: "sleep" },
        { name: "Burnout", root: "chronic-stress" },
        { name: "Brain Fog", root: "nutrition" },
        { name: "Mood Swings" },
        { name: "Low Motivation", root: "emotional" },
      ],
    },
    {
      id: "metabolic",
      name: "Metabolic",
      tag: "Metabolism",
      defaultRoot: "lifestyle",
      conditions: [
        { name: "Obesity" },
        { name: "Type 2 Diabetes" },
        { name: "Fatty Liver" },
        { name: "Gout" },
        { name: "Chronic Fatigue", root: "chronic-stress" },
        { name: "Low Immunity", root: "nutrition" },
        { name: "Sluggish Metabolism" },
        { name: "Temperature Intolerance" },
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
        { name: "Back & Neck Pain" },
        { name: "Osteoporosis", root: "nutrition" },
        { name: "Tendinitis", root: "lifestyle" },
        { name: "Sciatica" },
        { name: "Frozen Shoulder", root: "emotional" },
        { name: "Joint Stiffness" },
      ],
    },
    {
      id: "cardiovascular",
      name: "Cardiovascular",
      tag: "Circulation",
      defaultRoot: "lifestyle",
      conditions: [
        { name: "Dyslipidemia" },
        { name: "Hypertension", root: "chronic-stress" },
        { name: "Atherosclerosis" },
        { name: "Coronary Artery Disease" },
        { name: "Arterial Calcification" },
        { name: "DVT" },
        { name: "Varicose Veins" },
        { name: "Postural Hypotension", root: "nervous-system" },
      ],
    },
    {
      id: "autoimmune",
      name: "Autoimmune",
      tag: "Inflammation",
      defaultRoot: "trauma",
      conditions: [
        { name: "Hashimoto's Thyroiditis" },
        { name: "Graves' Disease", root: "chronic-stress" },
        { name: "Celiac Disease", root: "nutrition" },
        { name: "Multiple Sclerosis" },
        { name: "Lupus" },
        { name: "Psoriasis", root: "emotional" },
        { name: "IBD", root: "nutrition" },
        { name: "Myasthenia Gravis" },
        { name: "Other Autoimmunity" },
      ],
    },
    {
      id: "hormonal",
      name: "Endocrine",
      tag: "Hormones",
      defaultRoot: "chronic-stress",
      conditions: [
        { name: "Hypothyroidism" },
        { name: "Hyperthyroidism" },
        { name: "PCOS", root: "lifestyle" },
        { name: "Adrenal Fatigue" },
        { name: "Cushing's Syndrome" },
        { name: "Endometriosis", root: "trauma" },
        { name: "Infertility", root: "emotional" },
        { name: "Perimenopause" },
        { name: "PMS" },
        { name: "Dysmenorrhea" },
        { name: "Erectile Dysfunction", root: "emotional" },
        { name: "Amenorrhea" },
      ],
    },
    {
      id: "neurological",
      name: "Neurological",
      tag: "Nervous",
      defaultRoot: "nervous-system",
      conditions: [
        { name: "Alzheimer's", root: "lifestyle" },
        { name: "Parkinson's" },
        { name: "Epilepsy" },
        { name: "Migraine", root: "chronic-stress" },
        { name: "Neuropathy" },
        { name: "Restless Legs", root: "sleep" },
        { name: "Tension Headache", root: "chronic-stress" },
        { name: "Peripheral Tingling" },
      ],
    },
    {
      id: "gut",
      name: "Digestive",
      tag: "Gut",
      defaultRoot: "nutrition",
      conditions: [
        { name: "IBS", root: "nervous-system" },
        { name: "GERD" },
        { name: "Peptic Ulcer", root: "chronic-stress" },
        { name: "Crohn's Disease", root: "trauma" },
        { name: "Gallstones" },
        { name: "Pancreatitis" },
        { name: "Acid Reflux" },
        { name: "Bloating" },
        { name: "Gas" },
        { name: "Indigestion" },
        { name: "Poor Appetite", root: "emotional" },
        { name: "Overeating", root: "emotional" },
        { name: "Constipation" },
        { name: "Diarrhea" },
        { name: "Hemorrhoids" },
        { name: "Anal Fissure" },
        { name: "Gastritis" },
      ],
    },
    {
      id: "respiratory",
      name: "Respiratory",
      tag: "Breath",
      defaultRoot: "emotional",
      conditions: [
        { name: "Asthma" },
        { name: "COPD", root: "lifestyle" },
        { name: "Sleep Apnea", root: "sleep" },
        { name: "Bronchitis" },
        { name: "Allergic Rhinitis", root: "nutrition" },
        { name: "Sinusitis" },
        { name: "Tonsillitis" },
        { name: "Sore Throat" },
        { name: "Common Cold" },
        { name: "Snoring", root: "sleep" },
        { name: "Post-Nasal Drip" },
        { name: "Chronic Cough" },
        { name: "Vertigo", root: "nervous-system" },
        { name: "Tinnitus", root: "chronic-stress" },
        { name: "Dry Eyes" },
      ],
    },
    {
      id: "skin",
      name: "Skin & Hair",
      tag: "Skin",
      defaultRoot: "nutrition",
      conditions: [
        { name: "Acne" },
        { name: "Hair Fall", root: "chronic-stress" },
        { name: "Dandruff" },
        { name: "Eczema", root: "emotional" },
        { name: "Rosacea" },
        { name: "Vitiligo", root: "trauma" },
        { name: "Hives" },
        { name: "Oily Skin" },
        { name: "Dry Skin" },
        { name: "Dark Circles", root: "sleep" },
        { name: "Premature Aging", root: "lifestyle" },
        { name: "Body Odor" },
        { name: "Excessive Sweating", root: "nervous-system" },
        { name: "Boils" },
        { name: "Heat Rash" },
        { name: "Fungal Infections" },
      ],
    },
    {
      id: "oral",
      name: "Oral & Dental",
      tag: "Mouth",
      defaultRoot: "nutrition",
      conditions: [
        { name: "Mouth Ulcers" },
        { name: "Halitosis" },
        { name: "Oral Thrush" },
      ],
    },
    {
      id: "renal",
      name: "Renal & Urinary",
      tag: "Filter",
      defaultRoot: "lifestyle",
      conditions: [
        { name: "Chronic Kidney Disease" },
        { name: "Kidney Stones", root: "nutrition" },
        { name: "UTI" },
        { name: "Water Retention" },
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
