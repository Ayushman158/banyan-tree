/* Scroll-driven narrative sections — real content, editorial design.
   References: Awwwards editorial layouts · Stripe pricing clarity · v0 minimalism */

import { useEffect as _useEffect, useRef as _useRef, useState as _useState, Fragment as _Fragment } from 'react';
import { createPortal as _createPortal } from 'react-dom';
import functionalMedicineImg from './assets/functional-medicine-method.jpg';
import ayurvedaImg from './assets/ayurveda-method.jpg';
import beginAtRootBg from './assets/begin-at-root-bg.jpg';
import {
  Droplet,
  Shield,
  Sparkles,
  Compass,
  Heart,
  Check,
  X,
  Calendar,
  BookOpen,
  ArrowRight,
  ArrowDown,
  ChevronDown,
  Search,
  Leaf,
  Flower2,
  User,
  Sprout,
  Waves,
  Feather,
  SunMoon,
  Shell,
  Clock,
  BarChart3,
  ClipboardList,
  ClipboardCheck,
  Boxes,
  Pill,
  Stethoscope,
  TreeDeciduous,
  Target,
  Network,
  Map,
  Sun
} from 'lucide-react';

function useReveal() {
  const ref = _useRef(null);
  _useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          el.querySelectorAll(".reveal").forEach((n, i) => {
            setTimeout(() => n.classList.add("is-in"), i * 80);
          });
          io.disconnect();
        }
      });
    }, { threshold: 0.02 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Parallax({ speed = 0.05, className = "", children, ...props }) {
  const ref = _useRef(null);
  _useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let isVisible = false;
    let elementTop = 0;
    let elementHeight = 0;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      elementTop = rect.top + window.scrollY;
      elementHeight = rect.height;
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { isVisible = e.isIntersecting; if (isVisible) measure(); });
    }, { threshold: 0 });
    observer.observe(el);
    const onScroll = () => {
      if (!isVisible) return;
      const relativeY = (elementTop - window.scrollY) + elementHeight / 2 - window.innerHeight / 2;
      el.style.setProperty('--parallax-y', `${relativeY * speed}px`);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 100);
    return () => { observer.disconnect(); clearTimeout(t); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", measure); };
  }, [speed]);
  return <div ref={ref} className={`parallax-item ${className}`} {...props}>{children}</div>;
}

/* ── I · Philosophy ──────────────────────────────────────────────────────── */
function Philosophy() {
  const ref = useReveal();
  const rows = [
    {
      trad: { Icon: Clock,          label: "Short Consultations",        desc: "Limited time to address your concerns" },
      root: { Icon: ClipboardCheck, label: "Deep Health Assessment",     desc: "Time to understand your full health story" },
    },
    {
      trad: { Icon: BarChart3,      label: "Population-Based Ranges",     desc: "Labs read against population averages" },
      root: { Icon: Target,         label: "Functional & Optimal Analysis", desc: "Beyond “normal” to what's optimal for you" },
    },
    {
      trad: { Icon: ClipboardList,  label: "Symptom Management",          desc: "Focused on suppressing symptoms" },
      root: { Icon: Search,         label: "Root-Cause Investigation",    desc: "Why symptoms developed in the first place" },
    },
    {
      trad: { Icon: Boxes,          label: "Isolated Body Systems",       desc: "Each system treated separately" },
      root: { Icon: Network,        label: "Whole-Body Systems View",     desc: "Gut, hormones, mind & lifestyle, connected" },
    },
    {
      trad: { Icon: Pill,           label: "Reactive Care",               desc: "Addressing problems after they appear" },
      root: { Icon: Map,            label: "Personalized Healing Roadmap", desc: "Step-by-step guidance for your biology" },
    },
  ];

  const renderCell = (item, side, isLast) => (
    <div className={`vs__cell vs__cell--${side}${isLast ? " is-last" : ""}`}>
      <span className="vs__icon"><item.Icon size={18} strokeWidth={1.6} /></span>
      <span className="vs__text">
        <span className="vs__label">{item.label}</span>
        <span className="vs__desc">{item.desc}</span>
      </span>
    </div>
  );

  return (
    <section className="spread philosophy-vs" id="philosophy" ref={ref}>
      <div className="philosophy-vs__aura" aria-hidden="true" />

      <header className="method-process__head">
        <div className="section-tag reveal"><span>III · Philosophy</span></div>
        <h2 className="section-h reveal">
          Two paths.<br/><em>One clear choice.</em>
        </h2>
        <p className="method-process__intro reveal delay-1">
          The same symptoms, approached two very different ways — the shift from
          managing disease to understanding why it began.
        </p>
      </header>

      <div className="vs reveal delay-2">
        <span className="vs__spine" aria-hidden="true" />
        <span className="vs__badge">VS</span>
        <div className="vs__grid">
          {/* Column headers */}
          <div className="vs__head vs__head--trad">
            <span className="vs__crest"><Stethoscope size={22} strokeWidth={1.5} /></span>
            <h3 className="vs__name">Traditional Healthcare</h3>
            <span className="vs__sub">Reactive &amp; symptom-focused</span>
          </div>
          <div className="vs__axis vs__axis--head" aria-hidden="true" />
          <div className="vs__head vs__head--root">
            <span className="vs__crest"><TreeDeciduous size={22} strokeWidth={1.5} /></span>
            <h3 className="vs__name">Atlas of Root-Cause Healing</h3>
            <span className="vs__sub">Proactive &amp; root-cause focused</span>
          </div>

          {/* Paired rows */}
          {rows.map((row, i) => (
            <_Fragment key={row.root.label}>
              {renderCell(row.trad, "trad", i === rows.length - 1)}
              <div className="vs__axis" aria-hidden="true" />
              {renderCell(row.root, "root", i === rows.length - 1)}
            </_Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Soft, soothing per-step illustrations shown in the detail sheet.
   All motion is slow, low-contrast and loops gently — pure SVG + CSS. */
function StepScene({ kind }) {
  const scenes = {
    /* Root Cause Analysis — magnifying glass revealing cells, beside a test tube */
    lens: (
      <svg viewBox="0 0 120 120" className="scene scene--lens">
        <g className="scene-drift-slow">
          <rect x="74" y="34" width="13" height="50" rx="6.5" className="s-stroke" strokeWidth="2.4" />
          <rect x="71" y="28" width="19" height="8" rx="2.5" className="s-fill" />
          <path d="M74 60 Q80.5 64 87 60 L87 78 Q80.5 84 74 78 Z" className="s-fill-soft" />
          <circle cx="80" cy="68" r="1.8" className="s-fill scene-twinkle scene-st-2" />
          <circle cx="83" cy="74" r="1.5" className="s-fill scene-twinkle scene-st-3" />
        </g>
        <g className="scene-float">
          <circle cx="46" cy="50" r="20" className="s-fill-soft" />
          <circle cx="46" cy="50" r="20" className="s-stroke" strokeWidth="2.6" />
          <line x1="61" y1="65" x2="82" y2="86" className="s-stroke" strokeWidth="5" />
          <circle cx="39" cy="46" r="3.2" className="s-fill scene-twinkle scene-st-1" />
          <circle cx="51" cy="44" r="2.4" className="s-fill scene-twinkle scene-st-2" />
          <circle cx="44" cy="56" r="2.8" className="s-fill scene-twinkle scene-st-3" />
          <circle cx="53" cy="55" r="2" className="s-fill scene-twinkle scene-st-4" />
        </g>
      </svg>
    ),
    /* Fix Nutrient Deficiencies — seedling in soil drinking in nutrients */
    sprout: (
      <svg viewBox="0 0 120 120" className="scene scene--sprout">
        <path d="M30 86 Q60 78 90 86" className="s-stroke" strokeWidth="2.4" fill="none" />
        <path d="M30 86 Q60 78 90 86 L90 94 L30 94 Z" className="s-fill-soft" />
        <g className="scene-sway-base">
          <path d="M60 86 C60 72 60 62 60 50" className="s-stroke" strokeWidth="2.6" />
          <path className="s-fill" d="M60 66 C47 64 41 53 47 46 C58 48 62 59 60 66 Z" />
          <path className="s-fill" d="M60 58 C73 56 79 45 73 38 C62 40 58 51 60 58 Z" />
          <path className="s-stroke" d="M53 56 L60 60" strokeWidth="1.4" />
          <path className="s-stroke" d="M67 49 L60 53" strokeWidth="1.4" />
        </g>
        <circle className="s-fill scene-rise scene-st-1" cx="42" cy="44" r="2.2" />
        <circle className="s-fill scene-rise scene-st-3" cx="78" cy="48" r="2" />
        <circle className="s-fill scene-rise scene-st-5" cx="60" cy="34" r="2" />
      </svg>
    ),
    /* Heal Gut & Liver — soft fluid moving inside an organ */
    waves: (
      <svg viewBox="0 0 120 120" className="scene scene--waves">
        <defs>
          <clipPath id="gutClip"><circle cx="60" cy="62" r="29" /></clipPath>
        </defs>
        <g clipPath="url(#gutClip)">
          <rect x="20" y="20" width="80" height="84" className="s-fill-soft" />
          <path className="s-fill scene-drift" d="M14 66 q11 -7 22 0 t22 0 t22 0 t22 0 v40 h-110 Z" opacity="0.5" />
          <path className="s-fill scene-drift-rev" d="M14 74 q11 -6 22 0 t22 0 t22 0 t22 0 v40 h-110 Z" opacity="0.32" />
        </g>
        <circle cx="60" cy="62" r="29" className="s-stroke" strokeWidth="2.6" />
        <circle cx="50" cy="50" r="2" className="s-fill scene-twinkle scene-st-2" />
        <circle cx="68" cy="46" r="1.6" className="s-fill scene-twinkle scene-st-4" />
      </svg>
    ),
    /* Optimize Mitochondrial Health — a breathing cell with energy orbiting */
    cell: (
      <svg viewBox="0 0 120 120" className="scene scene--cell">
        <circle cx="60" cy="60" r="30" className="s-stroke scene-breathe" strokeWidth="2" opacity="0.5" />
        <g className="scene-breathe">
          <ellipse cx="60" cy="60" rx="20" ry="11" className="s-stroke" strokeWidth="2.2" />
          <ellipse cx="60" cy="60" rx="20" ry="11" className="s-fill-soft" />
          <path d="M44 60 q5 -7 10 0 t10 0 t10 0" className="s-stroke" strokeWidth="1.6" fill="none" />
        </g>
        <g className="scene-orbit">
          <circle cx="60" cy="26" r="3" className="s-fill scene-twinkle scene-st-1" />
          <circle cx="94" cy="60" r="2.6" className="s-fill scene-twinkle scene-st-3" />
          <circle cx="60" cy="94" r="3" className="s-fill scene-twinkle scene-st-2" />
          <circle cx="26" cy="60" r="2.6" className="s-fill scene-twinkle scene-st-4" />
        </g>
      </svg>
    ),
    /* Support Detoxification — a leaf with veins shedding droplets */
    detox: (
      <svg viewBox="0 0 120 120" className="scene scene--detox">
        <g className="scene-sway-base">
          <path className="s-stroke" d="M60 28 C38 38 34 70 56 88 C80 70 82 40 60 28 Z" strokeWidth="2.5" fill="none" />
          <path className="s-fill-soft" d="M60 28 C38 38 34 70 56 88 C80 70 82 40 60 28 Z" />
          <path className="s-stroke" d="M60 30 C58 52 56 72 56 88" strokeWidth="1.8" fill="none" />
          <path className="s-stroke" d="M58 46 L46 44" strokeWidth="1.3" />
          <path className="s-stroke" d="M58 58 L70 54" strokeWidth="1.3" />
          <path className="s-stroke" d="M57 70 L46 70" strokeWidth="1.3" />
        </g>
        <circle className="s-fill scene-fall scene-st-1" cx="44" cy="58" r="2" />
        <circle className="s-fill scene-fall scene-st-3" cx="76" cy="64" r="2" />
        <circle className="s-fill scene-fall scene-st-5" cx="60" cy="76" r="1.6" />
      </svg>
    ),
    /* Prakriti Analysis — a seated figure radiating a calm aura */
    aura: (
      <svg viewBox="0 0 120 120" className="scene scene--aura">
        <circle cx="60" cy="66" r="22" className="s-stroke scene-ripple scene-st-1" strokeWidth="1.6" />
        <circle cx="60" cy="66" r="22" className="s-stroke scene-ripple scene-st-3" strokeWidth="1.6" />
        <circle cx="60" cy="66" r="22" className="s-stroke scene-ripple scene-st-5" strokeWidth="1.6" />
        <circle cx="60" cy="46" r="9" className="s-fill" />
        <path className="s-fill" d="M40 84 C42 66 78 66 80 84 C70 88 50 88 40 84 Z" />
        <path className="s-stroke" d="M40 84 C30 78 30 70 38 70" strokeWidth="2.4" fill="none" />
        <path className="s-stroke" d="M80 84 C90 78 90 70 82 70" strokeWidth="2.4" fill="none" />
      </svg>
    ),
    /* Balance Doshas — air, fire & water orbiting a still centre */
    doshas: (
      <svg viewBox="0 0 120 120" className="scene scene--doshas">
        <circle cx="60" cy="60" r="30" className="s-stroke" strokeWidth="1.3" opacity="0.28" />
        <g className="scene-spin-slow">
          <path className="s-stroke scene-twinkle scene-st-1" d="M52 26 q10 -4 8 5 q-2 7 -8 5" strokeWidth="2.2" fill="none" />
          <path className="s-fill scene-twinkle scene-st-3" d="M34 84 C28 78 30 70 34 65 C38 70 40 78 34 84 Z" />
          <path className="s-fill scene-twinkle scene-st-5" d="M86 74 C86 80 82 84 78 84 C74 84 70 80 70 74 C70 68 78 60 78 60 C78 60 86 68 86 74 Z" />
        </g>
        <circle cx="60" cy="60" r="3.4" className="s-fill" />
      </svg>
    ),
    /* Improve Digestion (Agni) — a living flame over a small hearth */
    agni: (
      <svg viewBox="0 0 120 120" className="scene scene--agni">
        <path className="s-stroke" d="M40 92 Q60 104 80 92" strokeWidth="2.6" fill="none" />
        <path className="s-fill scene-flame scene-flame-1" d="M60 90 C42 78 49 58 60 42 C71 58 78 78 60 90 Z" />
        <path className="s-fill scene-flame scene-flame-2" d="M60 90 C50 82 52 67 60 56 C68 67 70 82 60 90 Z" opacity="0.55" />
        <path className="s-flame-core scene-flame scene-flame-3" d="M60 90 C54 84 55 75 60 68 C65 75 66 84 60 90 Z" />
      </svg>
    ),
    /* Optimize the Five Elements — earth, water, fire, air, ether in slow rotation */
    elements: (
      <svg viewBox="0 0 120 120" className="scene scene--elements">
        <circle cx="60" cy="60" r="31" className="s-stroke" strokeWidth="1.2" opacity="0.26" />
        <g className="scene-spin-slow">
          <rect x="55" y="24" width="10" height="10" rx="1.5" className="s-fill scene-twinkle scene-st-1" />
          <path className="s-fill scene-twinkle scene-st-2" d="M89 51 C89 55 86 58 82.5 58 C79 58 76 55 76 51 C76 47 82.5 41 82.5 41 C82.5 41 89 47 89 51 Z" />
          <path className="s-fill scene-twinkle scene-st-3" d="M78 84 C71 78 74 70 78 65 C82 70 85 78 78 84 Z" />
          <path className="s-stroke scene-twinkle scene-st-4" d="M36 80 q10 -4 8 4 q-2 6 -8 4" strokeWidth="2" fill="none" />
          <circle cx="31" cy="51" r="5.4" className="s-stroke scene-twinkle scene-st-5" strokeWidth="2" />
        </g>
        <circle cx="60" cy="60" r="3.2" className="s-fill" />
      </svg>
    ),
    /* Restore Ahara, Vihara & Achara — the sun's daily arc over the horizon */
    rhythm: (
      <svg viewBox="0 0 120 120" className="scene scene--rhythm">
        <path d="M30 78 A30 30 0 0 1 90 78" className="s-stroke" strokeWidth="1.6" fill="none" opacity="0.4" />
        <line x1="24" y1="78" x2="96" y2="78" className="s-stroke" strokeWidth="2.4" />
        <g className="scene-arc">
          <g className="scene-spin-rays">
            <circle cx="60" cy="44" r="8" className="s-fill" />
            <g className="s-stroke" strokeWidth="2" strokeLinecap="round">
              <line x1="60" y1="28" x2="60" y2="33" />
              <line x1="76" y1="44" x2="71" y2="44" />
              <line x1="44" y1="44" x2="49" y2="44" />
              <line x1="71" y1="33" x2="68" y2="36" />
              <line x1="49" y1="33" x2="52" y2="36" />
            </g>
          </g>
        </g>
      </svg>
    ),
  };
  return scenes[kind] || null;
}

/* ── II — Method ─────────────────────────────────────────────────────────── */
function Methodology() {
  const ref = useReveal();
  const [active, setActive] = _useState(null);
  const fmSteps = [
    { Icon: Search,    anim: "lens",   label: "Root Cause Analysis",           desc: "Identify the upstream drivers behind your symptoms — not just what you feel, but why it's happening." },
    { Icon: Sprout,    anim: "sprout", label: "Fix Nutrient Deficiencies",     desc: "Restore the vitamins, minerals, amino acids, and cofactors your body needs to repair and function." },
    { Icon: Waves,     anim: "waves",  label: "Heal Gut & Liver",              desc: "Improve digestion, absorption, and microbiome balance while rebuilding the liver's detox capacity." },
    { Icon: Sparkles,  anim: "cell",   label: "Optimize Mitochondrial Health", desc: "Recharge your cells at the source — supporting energy production, cellular repair, and metabolic resilience." },
    { Icon: Feather,   anim: "detox",  label: "Support Detoxification",        desc: "Activate gentle, safe detox pathways that help the body clear what's been accumulating." },
  ];
  const aySteps = [
    { Icon: User,     anim: "aura",     label: "Prakriti Analysis",                    desc: "Understand your unique constitution — the natural blueprint that shapes how your body responds." },
    { Icon: Shell,    anim: "doshas",   label: "Balance Doshas",                        desc: "Harmonize Vata, Pitta, and Kapha to rebuild stability, resilience, and lasting vitality." },
    { Icon: Sun,      anim: "agni",     label: "Improve Digestion (Agni)",              desc: "Strengthen digestive fire to prevent the build-up of toxins (ama) and fuel metabolism from within." },
    { Icon: SunMoon,  anim: "elements", label: "Optimize the Five Elements",            desc: "Bring Earth, Water, Fire, Air & Ether back into balance to restore harmony across the system." },
    { Icon: Compass,  anim: "rhythm",   label: "Restore Ahara, Vihara & Achara",       desc: "Realign your diet, daily rhythms, and conduct with your constitution for sustainable, whole-life healing." },
  ];

  const openDetail = (step, discipline, disciplineName, index) =>
    setActive({ ...step, discipline, disciplineName, index });
  const closeDetail = () => setActive(null);

  _useEffect(() => {
    if (!active) return;
    const onKey = (e) => { if (e.key === "Escape") closeDetail(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active]);

  const renderNode = (step, i, discipline, disciplineName) => {
    const { Icon, label } = step;
    return (
      <li className="method-node" key={label}>
        <button
          type="button"
          className="method-node__inner"
          onClick={() => openDetail(step, discipline, disciplineName, i)}
          aria-haspopup="dialog"
          aria-label={`${label} — read more`}
        >
          <span className="method-node__icon"><Icon size={20} strokeWidth={1.6} /></span>
          <span className="method-node__label">{label}</span>
          <span className="method-node__more" aria-hidden="true"><ChevronDown size={13} strokeWidth={1.5} /></span>
        </button>
        {i < 4 && (
          <span className="method-node__link" aria-hidden="true" />
        )}
      </li>
    );
  };

  const ActiveIcon = active?.Icon;

  return (
    <section className="spread method-section method-process" id="method" ref={ref}>
      <div className="method-process__aura" aria-hidden="true" />

      {/* Header */}
      <header className="method-process__head">
        <div className="section-tag reveal"><span>II · The Method</span></div>
        <h2 className="section-h method-process__title reveal">
          My approach:<br/><em>Integrative Healing.</em>
        </h2>
        <p className="method-process__lede reveal delay-1">
          Science-led. Traditionally grounded. Root-cause focused.
        </p>
        <p className="method-process__intro reveal delay-1">
          I combine modern Functional Medicine with the wisdom of Ayurveda to
          build personalised healing plans, targeting the root causes of
          imbalance on the physical, mental, and emotional level.
        </p>
      </header>

      {/* Two-column process with central ampersand */}
      <div className="method-flow reveal delay-2">
        {/* Functional Medicine */}
        <div className="method-flow__col method-flow__col--fm">
          <div className="method-flow__head">
            <span className="method-flow__crest"><Leaf size={22} strokeWidth={1.5} /></span>
            <h3 className="method-flow__name">Functional<br/>Medicine</h3>
            <span className="method-flow__sub">Fix the physiology first</span>
          </div>
          <ol className="method-flow__steps">
            {fmSteps.map((step, i) => renderNode(step, i, "fm", "Functional Medicine"))}
          </ol>
        </div>

        {/* Central connector */}
        <div className="method-flow__amp" aria-hidden="true">
          <span className="method-flow__amp-arrow method-flow__amp-arrow--top" aria-hidden="true">
            <ArrowRight size={14} strokeWidth={1.5} />
          </span>
          <span className="method-flow__amp-mark">&amp;</span>
          <span className="method-flow__amp-arrow method-flow__amp-arrow--bottom" aria-hidden="true">
            <ArrowRight size={14} strokeWidth={1.5} />
          </span>
        </div>

        {/* Ayurveda */}
        <div className="method-flow__col method-flow__col--ay">
          <div className="method-flow__head">
            <span className="method-flow__crest"><Flower2 size={22} strokeWidth={1.5} /></span>
            <h3 className="method-flow__name">Ayurveda</h3>
            <span className="method-flow__sub">Restore balance &amp; rhythm</span>
          </div>
          <ol className="method-flow__steps">
            {aySteps.map((step, i) => renderNode(step, i, "ay", "Ayurveda"))}
          </ol>
        </div>
      </div>

      <p className="method-process__foot reveal">
        This is not symptom management.<br/>
        <em>This is cellular repair, digestive healing, and whole-body balance.</em>
      </p>

      {/* Step detail sheet — portalled to <body> so position:fixed escapes any
          transformed ancestor and anchors to the viewport */}
      {active && _createPortal(
        <div
          className="method-detail"
          role="dialog"
          aria-modal="true"
          aria-labelledby="method-detail-title"
          onClick={closeDetail}
        >
          <div
            className={`method-detail__panel method-detail__panel--${active.discipline}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="method-detail__close"
              onClick={closeDetail}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <span className="method-detail__scene" aria-hidden="true">
              {active.anim ? <StepScene kind={active.anim} /> : (ActiveIcon && <ActiveIcon size={26} strokeWidth={1.5} />)}
            </span>
            <span className="method-detail__tag">{active.disciplineName}</span>
            <h4 id="method-detail-title" className="method-detail__title">{active.label}</h4>
            <p className="method-detail__desc">{active.desc}</p>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}

/* ── III · Programs (Pricing) ────────────────────────────────────────────── */
function Pricing() {
  const ref = useReveal();
  const plans = [
    {
      tier: "ALIVE 1.0",
      name: "Foundation",
      tagline: "Your first step into root-cause healing.",
      price: "59,999",
      duration: "1 month",
      badge: null,
      features: [
        "Root Cause Analysis (Baseline RCA)",
        "Personalised diet plan",
        "Supplement protocol (if required)",
        "Access to daily tracker",
        "Weekly check-in call (30 min)",
        "Meditation & breathwork (foundation)",
        "Lifestyle & habit guidance",
        "WhatsApp support (working hours)",
      ],
      forWhom: "Beginners, clarity seekers, and mild-to-moderate symptoms.",
    },
    {
      tier: "ALIVE 2.0",
      name: "Deep Healing",
      tagline: "Three months of systematic, guided root work.",
      price: "1,49,999",
      duration: "3 months",
      badge: "Most chosen",
      features: [
        "Root Cause Analysis, pre and post protocol",
        "Custom diet & supplement protocol",
        "Advanced test interpretation",
        "Weekly check-in calls (30 min)",
        "Meditation (nervous-system based)",
        "Gratitude journal & learning modules",
        "Custom-designed 9-day detox",
        "Healing with 8 natural elements",
      ],
      forWhom: "Chronic issues, metabolic & hormonal imbalance, gut healing.",
    },
    {
      tier: "ALIVE 3.0",
      name: "Transformation",
      tagline: "Full immersion. A roadmap built for the long term.",
      price: "2,79,999",
      duration: "3 months",
      badge: null,
      features: [
        "Comprehensive Root Cause Analysis, multiple reviews",
        "Fully personalised long-term healing roadmap",
        "Advanced diet, supplement & lifestyle protocol",
        "Weekly check-in calls (45 min)",
        "Unlimited test interpretation & optimisation",
        "Nervous system regulation program",
        "Trauma-informed meditation & breathwork",
        "Multiple detox & reset phases",
        "Dedicated accountability & care partner",
        "Priority WhatsApp support",
        "Habit rewiring & relapse prevention",
      ],
      forWhom: "Complex, long-standing conditions requiring deep, sustained work.",
    },
  ];

  return (
    <section className="spread pricing-section" id="programs" ref={ref}>
      <div className="section-tag reveal"><span>III · Programs</span></div>
      <div className="pricing-header">
        <h2 className="section-h reveal">
          Choose the depth<br/>
          <em>of your healing.</em>
        </h2>
        <p className="pricing-subhead reveal delay-1">
          Three levels of engagement, each a complete program. Not a subscription.
          The difference is depth, duration, and how far down the root we go together.
        </p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan, i) => (
          <Parallax speed={[0.02, -0.01, 0.03][i]} key={plan.tier}>
            <div className={`plan-card reveal delay-${i + 1}${plan.badge ? ' plan-card--featured' : ''}`}>
              {plan.badge && (
                <div className="plan-badge">{plan.badge}</div>
              )}
              <div className="plan-top">
                <div className="plan-tier">{plan.tier}</div>
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-tagline">{plan.tagline}</p>
              </div>
              <div className="plan-price-block">
                <span className="plan-currency">₹</span>
                <span className="plan-price">{plan.price}</span>
                <span className="plan-duration">/ {plan.duration}</span>
              </div>
              <ul className="plan-features">
                {plan.features.map((f, j) => (
                  <li key={j} className="plan-feature-item">
                    <Check className="plan-feature-icon" size={14} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="plan-bottom">
                <p className="plan-for"><em>Best for:</em> {plan.forWhom}</p>
                <button className="btn btn--primary plan-cta" data-hoverable="true">
                  Begin Your Healing Journey
                  <ArrowRight size={14} className="btn-icon-right" />
                </button>
              </div>
            </div>
          </Parallax>
        ))}
      </div>
    </section>
  );
}

/* ── IV · Voices ─────────────────────────────────────────────────────────── */
function Voices() {
  const ref = useReveal();
  const voices = [
    {
      quote: "I had tried doctors, diets, and supplements for years with no lasting relief. For the first time, I understood why my body was behaving the way it was.",
      name: "Anonymous, F · 38",
      detail: "Gut & Hormonal Health",
      speed: 0.02,
    },
    {
      quote: "This was not a quick fix. That's exactly why it worked. The guidance, accountability, and education helped me take control of my health instead of depending on medicines.",
      name: "Anonymous, M · 45",
      detail: "Metabolic & Lifestyle Conditions",
      speed: 0.05,
    },
    {
      quote: "I finally stopped jumping from one practitioner to another. The process helped me calm my system, rebuild my digestion, and trust my body again.",
      name: "Anonymous, F · 32",
      detail: "Anxiety, Fatigue & Digestive Issues",
      speed: 0.03,
    },
  ];
  return (
    <section className="spread" id="voices" ref={ref}>
      <div className="section-tag reveal"><span>IV · Voices</span></div>
      <div className="voices-header">
        <h2 className="section-h reveal">
          Real stories.<br/>
          <em>Real healing.</em>
        </h2>
        <p className="voices-subhead reveal delay-1">
          What happens when we stop chasing symptoms and start healing at the root.
        </p>
      </div>
      <div className="voices">
        {voices.map((v, i) => (
          <Parallax speed={v.speed} key={v.name}>
            <article className={`voice reveal delay-${(i % 3) + 1}`}>
              <p className="quote">"{v.quote}"</p>
              <div className="who">
                <span className="name">{v.name}</span>
                <span className="detail">{v.detail}</span>
              </div>
            </article>
          </Parallax>
        ))}
      </div>
    </section>
  );
}

/* ── V — Qualifier ───────────────────────────────────────────────────────── */
function Qualifier() {
  const ref = useReveal();
  const isFor = [
    "You've tried multiple treatments, doctors, diets, or supplements. Ready now to go deeper into lab-based, root-cause healing.",
    "You can trust a process and allow your body the time it needs, without rushing or constantly switching approaches.",
    "You want to be educated and empowered, not just handed another protocol to follow blindly.",
  ];
  const notFor = [
    "You're unwilling to change diet or lifestyle.",
    "You expect healing without personal involvement or responsibility.",
    "You're looking for instant results or a quick fix.",
    "You are attached to symptom suppression rather than root-cause resolution.",
  ];
  return (
    <section className="spread qualifier-section" id="apply" ref={ref}>
      <div className="section-tag reveal"><span>V · Before You Apply</span></div>
      <div className="qualifier-statement reveal">
        <h2 className="section-h">
          This program<br/>
          <em>requires commitment.</em>
        </h2>
        <p className="qualifier-body">
          This is not a supplement plan. Not a crash diet. Not a collection of protocols
          we hand you and wish you luck with. It is committed, guided, root-cause healing. It requires you to show up for it.
        </p>
      </div>

      <div className="qualifier-grid">
        <div className="qualifier-col reveal delay-1">
          <div className="qualifier-col__header qualifier-col__header--yes">
            <span className="qualifier-header-icon qualifier-header-icon--yes">
              <Check size={14} strokeWidth={2.5} />
            </span>
            This is for you if
          </div>
          <ul className="qualifier-list qualifier-list--yes">
            {isFor.map((item, i) => (
              <li key={i}>
                <Check className="qualifier-item-icon" size={14} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="qualifier-col reveal delay-2">
          <div className="qualifier-col__header qualifier-col__header--no">
            <span className="qualifier-header-icon qualifier-header-icon--no">
              <X size={14} strokeWidth={2.5} />
            </span>
            This may not be for you if
          </div>
          <ul className="qualifier-list qualifier-list--no">
            {notFor.map((item, i) => (
              <li key={i}>
                <X className="qualifier-item-icon" size={14} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="qualifier-close reveal delay-3">
        <em>Healing is a partnership.</em><br/>
        I guide the process. You show up for it.
      </p>
    </section>
  );
}

/* ── VI — Final CTA ──────────────────────────────────────────────────────── */
function FinalCTA() {
  const ref = useReveal();
  return (
    <section className="spread final" id="begin" ref={ref} style={{ backgroundImage: `url("${beginAtRootBg}")` }}>
      <div className="final-bg-mark" aria-hidden="true">h.</div>
      <Parallax speed={0.03} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36, width: "100%" }}>
        <div className="section-tag reveal" style={{ marginBottom: 24 }}>
          <span>VI · Begin</span>
        </div>
        <p className="final-prelude reveal">
          Healing is not the suppression of symptoms.<br/>
          It is the restoration of the conditions in which<br/>
          the body remembers how to be well.
        </p>
        <h2 className="reveal delay-1">
          <span className="line">Begin at the</span>
          <em className="line">root.</em>
        </h2>
        <p className="reveal delay-2">
          A 90-minute first consultation, in person or remote. No urgency,
          no prescriptions. We map the surface together, and we listen for
          what is underneath.
        </p>
        <div className="reveal delay-3" style={{ display: "flex", gap: 14, marginTop: 12 }}>
          <button className="btn btn--primary" data-hoverable="true">
            Schedule a consultation
          </button>
          <button className="btn btn--ghost" data-hoverable="true">
            Read the philosophy
          </button>
        </div>
      </Parallax>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
function SiteFooter() {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo">h.</span>
            <div className="footer-brand-text">
              <span className="mark">Himanshu Garg</span>
              <span className="footer-role">Functional Medicine Practitioner</span>
            </div>
          </div>
          <div className="footer-nav">
            <a href="#philosophy" data-hoverable="true">Philosophy</a>
            <a href="#method" data-hoverable="true">Method</a>
            <a href="#programs" data-hoverable="true">Programs</a>
            <a href="#begin" data-hoverable="true">Contact</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="copyright">&copy; {new Date().getFullYear()} Himanshu Garg. All rights reserved.</p>
          <p className="footer-tagline">Healing at the root.</p>
        </div>
      </div>
    </footer>
  );
}

export { Philosophy, Methodology, Pricing, Voices, Qualifier, FinalCTA, SiteFooter };
