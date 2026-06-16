export const rootCauses = {
  "gut-dysfunction": {
    "name": "Gut dysfunction",
    "subtitle": "MICROBIOME IMBALANCE",
    "number": "01",
    "insight": "The gut is an internal ecosystem in conversation with mood, immunity, and hormones.",
    "body": "An imbalance in gut flora can lead to systemic inflammation and poor absorption.",
    "meta": {
      "Domain": "Biochemical",
      "Span": "Months",
      "Layer": "Microbiome"
    }
  },
  "environmental-toxins": {
    "name": "Environmental toxins",
    "subtitle": "TOXIC LOAD",
    "number": "02",
    "insight": "The environment we live in shapes the health of our cells.",
    "body": "Accumulation of heavy metals, mold, or chemical toxins burdens the body's detoxification systems.",
    "meta": {
      "Domain": "Environmental",
      "Span": "Years",
      "Layer": "Cellular"
    }
  },
  "nutrients-deficiency": {
    "name": "Nutrients deficiency",
    "subtitle": "CELLULAR STARVATION",
    "number": "03",
    "insight": "We do not eat to feed ourselves — we eat to feed the systems that make us.",
    "body": "Lack of essential vitamins and minerals impairs every physiological process.",
    "meta": {
      "Domain": "Nutritional",
      "Span": "Months",
      "Layer": "Metabolic"
    }
  },
  "hormonal-imbalance": {
    "name": "Hormonal imbalance",
    "subtitle": "ENDOCRINE DYSREGULATION",
    "number": "04",
    "insight": "Hormones are the body's chemical messengers, dictating rhythm and function.",
    "body": "When hormones fall out of rhythm, it can cause cascading effects on mood, metabolism, and energy.",
    "meta": {
      "Domain": "Physiological",
      "Span": "Months",
      "Layer": "Endocrine"
    }
  },
  "mitochondrial-dysfunction": {
    "name": "Mitochondrial dysfunction",
    "subtitle": "ENERGY DEPLETION",
    "number": "05",
    "insight": "Mitochondria are the engines of the cell, and when they falter, the whole system slows.",
    "body": "Poor cellular energy production is at the root of fatigue, brain fog, and chronic illness.",
    "meta": {
      "Domain": "Cellular",
      "Span": "Years",
      "Layer": "Mitochondrial"
    }
  },
  "dosha-imbalance": {
    "name": "Dosha imbalance",
    "subtitle": "CONSTITUTIONAL SHIFT",
    "number": "06",
    "insight": "A life out of rhythm produces a body out of rhythm.",
    "body": "In Ayurveda, when Vata, Pitta, or Kapha fall out of balance, disease begins to take root.",
    "meta": {
      "Domain": "Energetic",
      "Span": "Daily",
      "Layer": "Constitutional"
    }
  },
  "hidden-infections": {
    "name": "Hidden infections",
    "subtitle": "IMMUNE BURDEN",
    "number": "07",
    "insight": "The body keeps fighting battles you cannot see.",
    "body": "Chronic, low-grade infections (viral, bacterial, parasitic) continuously drain the immune system and cause systemic inflammation.",
    "meta": {
      "Domain": "Immunological",
      "Span": "Months",
      "Layer": "Immune"
    }
  },
  "chronic-stress": {
    "name": "Chronic stress",
    "subtitle": "CORTISOL DYSREGULATION",
    "number": "08",
    "insight": "Stress is not the storm — it is the soil where storms keep growing.",
    "body": "Prolonged activation of the body's stress response erodes the systems that keep mind and body steady.",
    "meta": {
      "Domain": "Physiological",
      "Span": "Months → Years",
      "Layer": "HPA axis"
    }
  },
  "poor-sleep": {
    "name": "Poor sleep",
    "subtitle": "CIRCADIAN IMBALANCE",
    "number": "09",
    "insight": "Sleep is the body's deepest medicine — and the first to be sacrificed.",
    "body": "Without restorative sleep the body cannot clear, repair, or regulate.",
    "meta": {
      "Domain": "Restorative",
      "Span": "Nightly",
      "Layer": "Circadian"
    }
  },
  "inflammation": {
    "name": "Inflammation",
    "subtitle": "SYSTEMIC FIRE",
    "number": "10",
    "insight": "Inflammation is the body's alarm system stuck in the 'on' position.",
    "body": "Chronic inflammation damages healthy tissue and is the precursor to most chronic diseases.",
    "meta": {
      "Domain": "Immunological",
      "Span": "Months",
      "Layer": "Systemic"
    }
  },
  "poor-detoxification": {
    "name": "Poor detoxification",
    "subtitle": "ELIMINATION BLOCKADE",
    "number": "11",
    "insight": "Toxins that cannot leave the body will take residence within it.",
    "body": "When the liver, kidneys, or lymphatic system are sluggish, metabolic waste and toxins build up.",
    "meta": {
      "Domain": "Metabolic",
      "Span": "Months",
      "Layer": "Elimination"
    }
  }
};

export const rootOrder = [
  "gut-dysfunction",
  "environmental-toxins",
  "nutrients-deficiency",
  "hormonal-imbalance",
  "mitochondrial-dysfunction",
  "dosha-imbalance",
  "hidden-infections",
  "chronic-stress",
  "poor-sleep",
  "inflammation",
  "poor-detoxification"
];

const categories = [
  {
    "id": "mental",
    "name": "Mental Health",
    "tag": "Mind",
    "icon": "ph:brain",
    "defaultRoot": "chronic-stress",
    "conditions": [
      {
        "name": "Depression",
        "root": "chronic-stress"
      },
      {
        "name": "Anxiety",
        "root": "chronic-stress"
      },
      {
        "name": "OCD",
        "root": "chronic-stress"
      },
      {
        "name": "Psychotic Disorders",
        "root": "chronic-stress"
      },
      {
        "name": "ADHD",
        "root": "chronic-stress"
      },
      {
        "name": "Insomnia",
        "root": "chronic-stress"
      },
      {
        "name": "Brain Fog",
        "root": "chronic-stress"
      },
      {
        "name": "Mood Swings",
        "root": "chronic-stress"
      },
      {
        "name": "Low Motivation",
        "root": "chronic-stress"
      }
    ]
  },
  {
    "id": "metabolic",
    "name": "Metabolic Conditions",
    "tag": "Metabolism",
    "icon": "ph:flame",
    "defaultRoot": "mitochondrial-dysfunction",
    "conditions": [
      {
        "name": "Obesity",
        "root": "mitochondrial-dysfunction"
      },
      {
        "name": "Type 2 Diabetes",
        "root": "mitochondrial-dysfunction"
      },
      {
        "name": "Fatty Liver",
        "root": "mitochondrial-dysfunction"
      },
      {
        "name": "Gout",
        "root": "mitochondrial-dysfunction"
      },
      {
        "name": "Chronic Fatigue",
        "root": "mitochondrial-dysfunction"
      },
      {
        "name": "Low Immunity",
        "root": "mitochondrial-dysfunction"
      },
      {
        "name": "Sluggish Metabolism",
        "root": "mitochondrial-dysfunction"
      },
      {
        "name": "Hot/cold Intolerance",
        "root": "mitochondrial-dysfunction"
      },
      {
        "name": "Poor Recovery",
        "root": "mitochondrial-dysfunction"
      }
    ]
  },
  {
    "id": "musculoskeletal",
    "name": "Musculoskeletal Conditions",
    "tag": "Frame",
    "icon": "ph:bone",
    "defaultRoot": "inflammation",
    "conditions": [
      {
        "name": "Osteoarthritis",
        "root": "inflammation"
      },
      {
        "name": "Rheumatoid Arthritis",
        "root": "inflammation"
      },
      {
        "name": "Fibromyalgia",
        "root": "inflammation"
      },
      {
        "name": "Back/Neck/Knee Pain",
        "root": "inflammation"
      },
      {
        "name": "Osteoporosis",
        "root": "inflammation"
      },
      {
        "name": "Tendinitis",
        "root": "inflammation"
      },
      {
        "name": "Sciatica",
        "root": "inflammation"
      },
      {
        "name": "Frozen Shoulder",
        "root": "inflammation"
      }
    ]
  },
  {
    "id": "cardiovascular",
    "name": "Cardiovascular Conditions",
    "tag": "Circulation",
    "icon": "ph:heartbeat",
    "defaultRoot": "inflammation",
    "conditions": [
      {
        "name": "Dyslipidemia (Cholestrol imbalance)",
        "root": "inflammation"
      },
      {
        "name": "Hypertension/hypotension",
        "root": "inflammation"
      },
      {
        "name": "Deep vein thrombosis",
        "root": "inflammation"
      },
      {
        "name": "Atherosclerosis",
        "root": "inflammation"
      },
      {
        "name": "Palpitations",
        "root": "inflammation"
      },
      {
        "name": "Varicose Veins",
        "root": "inflammation"
      }
    ]
  },
  {
    "id": "autoimmune",
    "name": "Autoimmune Conditions",
    "tag": "Inflammation",
    "icon": "ph:shield-check",
    "defaultRoot": "hidden-infections",
    "conditions": [
      {
        "name": "Hashimoto’s Thyroiditis",
        "root": "hidden-infections"
      },
      {
        "name": "Graves’ Disease",
        "root": "hidden-infections"
      },
      {
        "name": "Celiac Disease",
        "root": "hidden-infections"
      },
      {
        "name": "Multiple Sclerosis",
        "root": "hidden-infections"
      },
      {
        "name": "Lupus (SLE)",
        "root": "hidden-infections"
      },
      {
        "name": "Inflammatory Bowel Disease (IBD)",
        "root": "hidden-infections"
      },
      {
        "name": "Myasthenia Gravis",
        "root": "hidden-infections"
      }
    ]
  },
  {
    "id": "hormonal",
    "name": "Hormonal Conditions",
    "tag": "Hormones",
    "icon": "ph:activity",
    "defaultRoot": "hormonal-imbalance",
    "conditions": [
      {
        "name": "Hypothyroidism/hyperthyroidism",
        "root": "hormonal-imbalance"
      },
      {
        "name": "Polycystic Ovary Syndrome (PCOS)",
        "root": "hormonal-imbalance"
      },
      {
        "name": "Adrenal Fatigue",
        "root": "hormonal-imbalance"
      },
      {
        "name": "Endometriosis",
        "root": "hormonal-imbalance"
      },
      {
        "name": "Infertility",
        "root": "hormonal-imbalance"
      },
      {
        "name": "Perimenopause Symptoms",
        "root": "hormonal-imbalance"
      },
      {
        "name": "PMS (Premenstrual Syndrome)",
        "root": "hormonal-imbalance"
      },
      {
        "name": "Painful Periods (Dysmenorrhea)",
        "root": "hormonal-imbalance"
      },
      {
        "name": "Erectile Dysfunction/low testosterone",
        "root": "hormonal-imbalance"
      },
      {
        "name": "Amenorrhea (absent periods)",
        "root": "hormonal-imbalance"
      },
      {
        "name": "Heavy periods/irregular periods",
        "root": "hormonal-imbalance"
      },
      {
        "name": "Fibroids",
        "root": "hormonal-imbalance"
      },
      {
        "name": "BPH/prostate",
        "root": "hormonal-imbalance"
      }
    ]
  },
  {
    "id": "neurological",
    "name": "Neurological Conditions",
    "tag": "Nervous",
    "icon": "ph:network",
    "defaultRoot": "environmental-toxins",
    "conditions": [
      {
        "name": "Alzheimer’s Disease",
        "root": "environmental-toxins"
      },
      {
        "name": "Parkinson’s Disease",
        "root": "environmental-toxins"
      },
      {
        "name": "Epilepsy",
        "root": "environmental-toxins"
      },
      {
        "name": "Headache/migraine",
        "root": "environmental-toxins"
      },
      {
        "name": "Neuropathy",
        "root": "environmental-toxins"
      },
      {
        "name": "Restless Legs Syndrome",
        "root": "environmental-toxins"
      },
      {
        "name": "Peripheral Tingling",
        "root": "environmental-toxins"
      }
    ]
  },
  {
    "id": "gut",
    "name": "Gut & Digestion",
    "tag": "Gut",
    "icon": "ph:leaf",
    "defaultRoot": "gut-dysfunction",
    "conditions": [
      {
        "name": "IBS/IBD",
        "root": "gut-dysfunction"
      },
      {
        "name": "Peptic Ulcer/ H pylori",
        "root": "gut-dysfunction"
      },
      {
        "name": "Gallstones",
        "root": "gut-dysfunction"
      },
      {
        "name": "Pancreatitis",
        "root": "gut-dysfunction"
      },
      {
        "name": "Acid Reflux (gerd)",
        "root": "gut-dysfunction"
      },
      {
        "name": "Gas / bloating",
        "root": "gut-dysfunction"
      },
      {
        "name": "Indigestion/dyspepsia",
        "root": "gut-dysfunction"
      },
      {
        "name": "Poor Appetite",
        "root": "gut-dysfunction"
      },
      {
        "name": "Constipation",
        "root": "gut-dysfunction"
      },
      {
        "name": "Diarrhea",
        "root": "gut-dysfunction"
      },
      {
        "name": "Piles/fissures",
        "root": "gut-dysfunction"
      },
      {
        "name": "Gastritis",
        "root": "gut-dysfunction"
      }
    ]
  },
  {
    "id": "respiratory",
    "name": "Respiratory",
    "tag": "Breath",
    "icon": "tabler:lungs",
    "defaultRoot": "poor-detoxification",
    "conditions": [
      {
        "name": "Asthma",
        "root": "poor-detoxification"
      },
      {
        "name": "Sleep Apnea",
        "root": "poor-detoxification"
      },
      {
        "name": "Bronchitis",
        "root": "poor-detoxification"
      },
      {
        "name": "Allergic Rhinitis",
        "root": "poor-detoxification"
      },
      {
        "name": "Sinusitis",
        "root": "poor-detoxification"
      },
      {
        "name": "Tonsillitis / Sore throat",
        "root": "poor-detoxification"
      },
      {
        "name": "Common Cold",
        "root": "poor-detoxification"
      },
      {
        "name": "Snoring",
        "root": "poor-detoxification"
      },
      {
        "name": "Post-Nasal Drip",
        "root": "poor-detoxification"
      },
      {
        "name": "Chronic Cough",
        "root": "poor-detoxification"
      },
      {
        "name": "Vertigo",
        "root": "poor-detoxification"
      },
      {
        "name": "Tinnitus",
        "root": "poor-detoxification"
      }
    ]
  },
  {
    "id": "skin",
    "name": "Skin & Hair",
    "tag": "Skin",
    "icon": "ph:sparkle",
    "defaultRoot": "poor-detoxification",
    "conditions": [
      {
        "name": "Acne/pigmentation",
        "root": "poor-detoxification"
      },
      {
        "name": "Hair Fall",
        "root": "poor-detoxification"
      },
      {
        "name": "Dandruff",
        "root": "poor-detoxification"
      },
      {
        "name": "Eczema",
        "root": "poor-detoxification"
      },
      {
        "name": "Rosacea/heat rashes",
        "root": "poor-detoxification"
      },
      {
        "name": "Vitiligo",
        "root": "poor-detoxification"
      },
      {
        "name": "Hives",
        "root": "poor-detoxification"
      },
      {
        "name": "Oily/Dry Skin",
        "root": "poor-detoxification"
      },
      {
        "name": "Puffiness / Dark Circles",
        "root": "poor-detoxification"
      },
      {
        "name": "Premature Aging",
        "root": "poor-detoxification"
      },
      {
        "name": "Body Odor",
        "root": "poor-detoxification"
      },
      {
        "name": "Excessive Sweating",
        "root": "poor-detoxification"
      },
      {
        "name": "Boils",
        "root": "poor-detoxification"
      },
      {
        "name": "Psoriasis",
        "root": "poor-detoxification"
      }
    ]
  },
  {
    "id": "oral",
    "name": "Eyes & Dental",
    "tag": "Eyes & Mouth",
    "icon": "ph:tooth",
    "defaultRoot": "nutrients-deficiency",
    "conditions": [
      {
        "name": "Mouth Ulcers",
        "root": "nutrients-deficiency"
      },
      {
        "name": "Bleeding gums",
        "root": "nutrients-deficiency"
      },
      {
        "name": "Bad Breath",
        "root": "nutrients-deficiency"
      },
      {
        "name": "Oral Thrush",
        "root": "nutrients-deficiency"
      },
      {
        "name": "Dry eyes",
        "root": "nutrients-deficiency"
      },
      {
        "name": "Itchy/watery eyes",
        "root": "nutrients-deficiency"
      }
    ]
  },
  {
    "id": "renal",
    "name": "Renal & Urinary Conditions",
    "tag": "Filter",
    "icon": "ph:drop",
    "defaultRoot": "poor-detoxification",
    "conditions": [
      {
        "name": "Chronic Kidney Disease (CKD)",
        "root": "poor-detoxification"
      },
      {
        "name": "Kidney Stones",
        "root": "poor-detoxification"
      },
      {
        "name": "Urinary Tract Infection (UTI)",
        "root": "poor-detoxification"
      },
      {
        "name": "Water Retention",
        "root": "poor-detoxification"
      },
      {
        "name": "Frequent Urination",
        "root": "poor-detoxification"
      }
    ]
  }
];

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

const conditionsById = {};
categories.forEach(cat => cat.conditions.forEach(c => { conditionsById[c.id] = c; }));

export { categories };
export const BanyanData = { categories, rootCauses, rootOrder, conditionsById };
