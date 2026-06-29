/* Scroll-driven narrative sections — real content, editorial design.
   References: Awwwards editorial layouts · Stripe pricing clarity · v0 minimalism */

import { useEffect as _useEffect, useRef as _useRef, useState as _useState, Fragment as _Fragment } from 'react';
import { createPortal as _createPortal } from 'react-dom';
import functionalMedicineImg from './assets/functional-medicine-method.jpg';
import ayurvedaImg from './assets/ayurveda-method.jpg';
import beginAtRootBg from './assets/begin-at-root-bg.jpg';
import { POLICIES, PolicyModal } from './policies.jsx';
import { BrandMark } from './BrandMark.jsx';
// Per-step illustrations for the method detail popup
import illoLens from './assets/The Method Assets/Root Cause Analysis.png';
import illoSprout from './assets/The Method Assets/Fix Nutrient Deficiencies.png';
import illoWaves from './assets/The Method Assets/Heal Gut and Liver.png';
import illoCell from './assets/The Method Assets/Optimise Mitochondrial Health.png';
import illoDetox from './assets/The Method Assets/Support Detoxification.png';
import illoAura from './assets/The Method Assets/Prakriti analysis.png';
import illoDoshas from './assets/The Method Assets/Balance Doshas.png';
import illoAgni from './assets/The Method Assets/Improve Digestion(Agni).png';
import illoElements from './assets/The Method Assets/Optimise the Five Elements.png';
import illoRhythm from './assets/The Method Assets/Restore Ahara, Vihara, Achara & Vichara.png';

const STEP_ILLUSTRATIONS = {
  lens: illoLens,
  sprout: illoSprout,
  waves: illoWaves,
  cell: illoCell,
  detox: illoDetox,
  aura: illoAura,
  doshas: illoDoshas,
  agni: illoAgni,
  elements: illoElements,
  rhythm: illoRhythm,
};
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
  Play,
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

/* WhatsApp contact. Every contact CTA opens this number with a pre-filled
   message; program buttons pass their own message so Himanshu sees which plan. */
const WHATSAPP_NUMBER = "917906978483";
const waUrl = (message) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
export const WHATSAPP_URL = waUrl("Hi Himanshu, I'd like to book a 45-minute discovery call and begin root-cause healing.");

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
const PHIL_ASSUMPTIONS = [
  "It's all in your head",
  "You'll have to live with it",
  "That's normal for your age",
  "It's just poor genetics",
  "Your labs are normal, so don't worry",
  "Nothing more can be done",
];

function Philosophy() {
  const sectionRef = _useRef(null);
  const introRef = _useRef(null);
  const [started, setStarted] = _useState(false);
  const [step, setStep] = _useState(0);
  const [phase, setPhase] = _useState("in");   // in → out → loops

  // Begin the sequence only once it scrolls into view (skip for reduced motion)
  _useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setStarted(true); return; }
    const el = introRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); io.disconnect(); }
    }, { threshold: 0.55 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Drive each statement in an infinite loop. The strike is a mount-timed CSS
  // animation so it replays cleanly on every fresh sentence.
  _useEffect(() => {
    if (!started) return;
    setPhase("in");
    const t2 = setTimeout(() => setPhase("out"), 3500);
    const t3 = setTimeout(() => setStep((s) => (s + 1) % PHIL_ASSUMPTIONS.length), 4200);
    return () => { clearTimeout(t2); clearTimeout(t3); };
  }, [started, step]);

  // Let the chart and closing line fade up naturally as each enters view
  _useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const targets = root.querySelectorAll(".section-tag, .vs, .phil-closing");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.05 });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const rows = [
    {
      trad: { Icon: Clock,          label: "10-Minute Appointments",      desc: "Limited time to understand your health story" },
      root: { Icon: ClipboardCheck, label: "12-Week Guided Journey",      desc: "Deep dive into your health with time and attention" },
    },
    {
      trad: { Icon: BarChart3,      label: "Standard Reference Ranges",   desc: "Labs compared to population averages, not optimal levels" },
      root: { Icon: Target,         label: "Functional & Optimal Analysis", desc: "100+ markers analyzed against optimal ranges, beyond 'normal'" },
    },
    {
      trad: { Icon: ClipboardList,  label: "Symptom Management",          desc: "Focus on managing symptoms, not why they exist" },
      root: { Icon: Search,         label: "Root-Cause Investigation",    desc: "Find out what's driving your symptoms" },
    },
    {
      trad: { Icon: Boxes,          label: "Condition-Specific",          desc: "One condition at a time, often missing the bigger picture" },
      root: { Icon: Network,        label: "Whole-Body Systems Approach", desc: "Gut, hormones, inflammation, nutrients & lifestyle, interconnected" },
    },
    {
      trad: { Icon: Pill,           label: "Treatment Plan",              desc: "Medication or temporary solutions" },
      root: { Icon: Map,            label: "Personalized Healing Roadmap", desc: "A step-by-step plan to address the root, not just the branches" },
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
    <section className="spread philosophy-vs" id="philosophy" ref={sectionRef}>
      <div className="philosophy-vs__aura" aria-hidden="true" />

      <div className="section-tag reveal"><span>I · The Why</span></div>

      {/* Cinematic editorial intro — dismissals questioned, then the bridge */}
      <div className="phil-intro" ref={introRef}>
        <div className="phil-statements">
          {started && (
            <div className={`phil-statement is-${phase}`} key={step}>
              <span className="phil-statement__text">{PHIL_ASSUMPTIONS[step]}</span>
              <span className="phil-statement__strike" aria-hidden="true" />
            </div>
          )}
        </div>
        <p className="phil-caption">Common answers. Unresolved symptoms.</p>
        <div className="phil-bridge is-in">
          <h2 className="phil-bridge__title">Why root cause healing?</h2>
          <p className="phil-bridge__sub">
            Most people know their diagnosis. Few people understand what created it.
          </p>
        </div>
      </div>

      <div className="vs reveal delay-2">
        <span className="vs__spine" aria-hidden="true" />
        <span className="vs__badge">VS</span>
        <div className="vs__grid">
          {/* Column headers */}
          <div className="vs__head vs__head--trad">
            <span className="vs__crest"><Stethoscope size={22} strokeWidth={1.5} /></span>
            <h3 className="vs__name">Conventional Healthcare</h3>
          </div>
          <div className="vs__axis vs__axis--head" aria-hidden="true" />
          <div className="vs__head vs__head--root">
            <span className="vs__crest"><TreeDeciduous size={22} strokeWidth={1.5} /></span>
            <h3 className="vs__name">Root Cause Healing</h3>
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

      <p className="phil-closing reveal">
        This isn't about replacing your doctor. It's about finding the answers
        beyond the diagnosis.
      </p>
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
          <path className="s-fill scene-drift" d="M8 66 q11 -7 22 0 t22 0 t22 0 t22 0 t22 0 t22 0 v40 h-132 Z" opacity="0.5" />
          <path className="s-fill scene-drift-rev" d="M8 74 q11 -6 22 0 t22 0 t22 0 t22 0 t22 0 t22 0 v40 h-132 Z" opacity="0.32" />
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
        <circle className="s-fill scene-fall scene-st-1" cx="46" cy="44" r="1.8" />
        <circle className="s-fill scene-fall scene-st-3" cx="70" cy="54" r="1.8" />
        <circle className="s-fill scene-fall scene-st-5" cx="58" cy="88" r="1.6" />
      </svg>
    ),
    /* Prakriti Analysis — a seated figure radiating a calm aura */
    aura: (
      <svg viewBox="0 0 120 120" className="scene scene--aura">
        <circle cx="60" cy="62" r="22" className="s-stroke scene-ripple scene-st-1" strokeWidth="1.2" />
        <circle cx="60" cy="62" r="22" className="s-stroke scene-ripple scene-st-3" strokeWidth="1.2" />
        <circle cx="60" cy="62" r="22" className="s-stroke scene-ripple scene-st-5" strokeWidth="1.2" />
        <g className="scene-breathe-figure">
          <g transform="translate(35.625, 33.25) scale(2.5)">
            <path d="M6.84159 14.75C6.53159 15.432 5.81959 15.736 5.18859 16.066L1.54259 17.973C0.077588 18.74 0.808588 20.75 2.37959 20.75C5.87159 20.75 8.63359 19.056 11.7896 17.75C12.5846 17.421 12.9696 17.491 13.7496 17.841" className="s-stroke" style={{ strokeWidth: 0.8 }} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.74959 17.841C7.52959 17.491 7.91459 17.421 8.70959 17.75C11.8656 19.056 14.6276 20.75 18.1196 20.75C19.6896 20.75 20.4216 18.74 18.9566 17.973L15.3106 16.066C14.6796 15.736 13.9666 15.432 13.6576 14.75" className="s-stroke" style={{ strokeWidth: 0.8 }} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.74959 2.75C7.74959 3.28043 7.9603 3.78914 8.33537 4.16421C8.71045 4.53929 9.21916 4.75 9.74959 4.75C10.28 4.75 10.7887 4.53929 11.1638 4.16421C11.5389 3.78914 11.7496 3.28043 11.7496 2.75C11.7496 2.21957 11.5389 1.71086 11.1638 1.33579C10.7887 0.960714 10.28 0.75 9.74959 0.75C9.21916 0.75 8.71045 0.960714 8.33537 1.33579C7.9603 1.71086 7.74959 2.21957 7.74959 2.75Z" className="s-stroke" style={{ strokeWidth: 0.8 }} />
            <path d="M9.74959 6.75C8.15829 6.75 6.63217 7.38214 5.50695 8.50736C4.38173 9.63258 3.74959 11.1587 3.74959 12.75C5.34089 12.75 6.86701 12.1179 7.99223 10.9926C9.11745 9.86742 9.74959 8.3413 9.74959 6.75ZM9.74959 6.75C11.3409 6.75 12.867 7.38214 13.9922 8.50736C15.1174 9.63258 15.7496 11.1587 15.7496 12.75C14.1583 12.75 12.6322 12.1179 11.5069 10.9926C10.3817 9.86742 9.74959 8.3413 9.74959 6.75Z" className="s-stroke" style={{ strokeWidth: 0.8 }} strokeLinejoin="round" />
            <circle cx="9.75" cy="11.5" r="0.8" className="s-fill scene-twinkle scene-st-2" style={{ fill: '#c8a96b' }} />
          </g>
        </g>
      </svg>
    ),
    /* Balance Doshas — air, fire & water orbiting a still centre */
    doshas: (
      <svg viewBox="0 0 120 120" className="scene scene--doshas">
        <circle cx="60" cy="60" r="30" className="s-stroke" strokeWidth="1.2" opacity="0.25" strokeDasharray="2 2" />
        <g className="scene-spin-slow">
          {/* Vata (Air/Wind) */}
          <g className="scene-twinkle scene-st-1">
            <g transform="translate(50.1, 20) scale(0.9)">
              <path fillRule="evenodd" clipRule="evenodd" d="M5 3.25C5 2.60721 5.19061 1.97886 5.54772 1.4444C5.90484 0.909939 6.41242 0.493378 7.00628 0.247393C7.60014 0.00140817 8.25361 -0.0629527 8.88404 0.0624493C9.51448 0.187851 10.0936 0.497384 10.5481 0.951904C11.0026 1.40643 11.3122 1.98552 11.4376 2.61596C11.563 3.2464 11.4986 3.89986 11.2526 4.49372C11.0066 5.08758 10.5901 5.59516 10.0556 5.95228C9.52114 6.30939 8.89279 6.5 8.25 6.5H1.75C1.55109 6.5 1.36032 6.42098 1.21967 6.28033C1.07902 6.13968 1 5.94891 1 5.75C1 5.55109 1.07902 5.36032 1.21967 5.21967C1.36032 5.07902 1.55109 5 1.75 5H8.25C8.59612 5 8.93446 4.89737 9.22225 4.70507C9.51003 4.51278 9.73434 4.23947 9.86679 3.9197C9.99924 3.59993 10.0339 3.24806 9.96637 2.90859C9.89885 2.56913 9.73218 2.25731 9.48744 2.01256C9.2427 1.76782 8.93087 1.60115 8.59141 1.53363C8.25194 1.4661 7.90007 1.50076 7.5803 1.63321C7.26053 1.76567 6.98722 1.98997 6.79493 2.27775C6.60264 2.56554 6.5 2.90388 6.5 3.25V3.607C6.5 3.80591 6.42098 3.99668 6.28033 4.13733C6.13968 4.27798 5.94891 4.357 5.75 4.357C5.55109 4.357 5.36032 4.27798 5.21967 4.13733C5.07902 3.99668 5 3.80591 5 3.607V3.25ZM13 5.25C13 4.40943 13.2493 3.58774 13.7163 2.88883C14.1833 2.18992 14.847 1.64519 15.6236 1.32351C16.4002 1.00184 17.2547 0.917677 18.0791 1.08166C18.9036 1.24565 19.6608 1.65042 20.2552 2.2448C20.8496 2.83917 21.2543 3.59645 21.4183 4.42087C21.5823 5.24529 21.4982 6.09982 21.1765 6.87641C20.8548 7.65299 20.3101 8.31675 19.6112 8.78375C18.9123 9.25074 18.0906 9.5 17.25 9.5H0.75C0.551088 9.5 0.360322 9.42098 0.21967 9.28033C0.0790177 9.13968 0 8.94891 0 8.75C0 8.55109 0.0790177 8.36032 0.21967 8.21967C0.360322 8.07902 0.551088 8 0.75 8H17.25C17.7939 8 18.3256 7.83872 18.7778 7.53654C19.2301 7.23437 19.5825 6.80488 19.7907 6.30238C19.9988 5.79988 20.0533 5.24695 19.9472 4.7135C19.841 4.18006 19.5791 3.69005 19.1945 3.30546C18.8099 2.92086 18.3199 2.65895 17.7865 2.55284C17.2531 2.44673 16.7001 2.50119 16.1976 2.70933C15.6951 2.91747 15.2656 3.26995 14.9635 3.72218C14.6613 4.17442 14.5 4.7061 14.5 5.25V5.75C14.5 5.94891 14.421 6.13968 14.2803 6.28033C14.1397 6.42098 13.9489 6.5 13.75 6.5C13.5511 6.5 13.3603 6.42098 13.2197 6.28033C13.079 6.13968 13 5.94891 13 5.75V5.25ZM2 11.75C2 11.5511 2.07902 11.3603 2.21967 11.2197C2.36032 11.079 2.55109 11 2.75 11H17.25C18.0906 11 18.9123 11.2493 19.6112 11.7163C20.3101 12.1833 20.8548 12.847 21.1765 13.6236C21.4982 14.4002 21.5823 15.2547 21.4183 16.0791C21.2543 16.9036 20.8496 17.6608 20.2552 18.2552C19.6608 18.8496 18.9036 19.2544 18.0791 19.4183C17.2547 19.5823 16.4002 19.4982 15.6236 19.1765C14.847 18.8548 14.1833 18.3101 13.7163 17.6112C13.2493 16.9123 13 16.0906 13 15.25V14.75C13 14.5511 13.079 14.3603 13.2197 14.2197C13.3603 14.079 13.5511 14 13.75 14C13.9489 14 14.1397 14.079 14.2803 14.2197C14.421 14.3603 14.5 14.5511 14.5 14.75V15.25C14.5 15.7939 14.6613 16.3256 14.9635 16.7778C15.2656 17.2301 15.6951 17.5825 16.1976 17.7907C16.7001 17.9988 17.2531 18.0533 17.7865 17.9472C18.3199 17.8411 18.8099 17.5791 19.1945 17.1945C19.5791 16.81 19.841 16.3199 19.9472 15.7865C20.0533 15.2531 19.9988 14.7001 19.7907 14.1976C19.5825 13.6951 19.2301 13.2656 18.7778 12.9635C18.3256 12.6613 17.7939 12.5 17.25 12.5H2.75C2.55109 12.5 2.36032 12.421 2.21967 12.2803C2.07902 12.1397 2 11.9489 2 11.75Z" className="s-fill" />
            </g>
          </g>
          {/* Pitta (Fire/Flame) */}
          <g className="scene-twinkle scene-st-3">
            <g transform="translate(24.4, 65.4) scale(1.2)">
              <path d="M9.32 15.653C9.22691 15.5329 9.16948 15.389 9.15427 15.2378C9.13906 15.0866 9.16669 14.9342 9.234 14.798C9.41 14.456 9.479 14.065 9.434 13.68C9.39728 13.4053 9.30654 13.1405 9.167 12.901C9.03002 12.6641 8.84589 12.4579 8.626 12.295C7.87834 11.7331 7.35369 10.9247 7.145 10.013C5.437 12.252 6.092 13.523 6.91 14.643C7.0056 14.7744 7.05592 14.9333 7.0534 15.0958C7.05087 15.2583 6.99563 15.4156 6.896 15.544C6.79415 15.6738 6.65751 15.7719 6.502 15.827C6.34826 15.8808 6.18219 15.8888 6.024 15.85C4.919 15.58 3.879 15.066 3.174 14.247C2.77465 13.7919 2.46701 13.2638 2.268 12.692C2.06678 12.1152 1.97751 11.5053 2.005 10.895C2.005 10.895 1.872 8.43199 4.842 6.01899C4.842 6.01899 8.352 3.04099 7.134 0.838995C7.089 0.7307 7.07564 0.611864 7.09546 0.49628C7.11528 0.380696 7.16748 0.273105 7.246 0.185995C7.32238 0.100768 7.42304 0.0409897 7.53442 0.0147076C7.64581 -0.0115745 7.76257 -0.00309841 7.869 0.0389948L8.015 0.0969948C9.33707 0.932703 10.3704 2.15452 10.975 3.59699C11.555 5.00999 11.551 6.65699 11.159 8.12399C11.484 7.83199 11.755 7.48299 11.96 7.09099L11.989 7.02699C12.187 6.54999 12.81 6.70199 13.044 7.01399C13.13 7.15099 15.336 10.357 14.151 13.062C13.7183 13.8819 13.0854 14.5792 12.311 15.089C11.6619 15.5205 10.9362 15.8237 10.173 15.982C10.0153 16.0154 9.8513 16.0022 9.701 15.944C9.54937 15.8849 9.41737 15.7844 9.32 15.654V15.653ZM7.554 7.89199C7.64727 7.84287 7.7556 7.83061 7.85749 7.85766C7.95938 7.8847 8.04737 7.94908 8.104 8.038C8.144 8.098 8.169 8.164 8.179 8.236L8.224 8.585C8.244 9.096 8.238 9.63 8.437 10.121C8.643 10.625 8.963 11.071 9.369 11.419C9.89204 11.7632 10.2969 12.2595 10.529 12.841C10.749 13.405 10.779 14.031 10.613 14.614C11.1211 14.4543 11.5932 14.1972 12.003 13.857L12.106 13.773C12.442 13.496 12.719 13.15 12.919 12.756C13.12 12.363 13.241 11.931 13.273 11.487C13.338 10.462 12.989 9.433 12.446 8.515C12.198 8.875 11.856 9.154 11.461 9.319C11.214 9.424 10.952 9.489 10.685 9.509C10.5321 9.51838 10.3797 9.48367 10.246 9.409C10.1103 9.33201 9.99904 9.21833 9.925 9.081C9.864 8.97018 9.82914 8.84689 9.82307 8.72055C9.817 8.5942 9.8399 8.46814 9.89 8.352C10.302 7.38 10.43 6.30199 10.255 5.25499C10.0481 4.05704 9.47435 2.95288 8.613 2.09499C8.457 4.29999 6.196 6.35299 5.732 6.79499C5.65975 6.86241 5.58503 6.92712 5.508 6.98899C3.082 8.95399 3.248 10.744 3.248 10.823C3.20109 11.534 3.36047 12.2434 3.707 12.866C4.072 13.511 4.597 14.043 5.227 14.406C4.5 12.808 4.5 10.89 7.183 8.14L7.555 7.88999L7.554 7.89199Z" className="s-fill" />
            </g>
          </g>
          {/* Kapha (Water/Drop) */}
          <g className="scene-twinkle scene-st-5">
            <g transform="translate(76.4, 65.4) scale(1.2)">
              {/* Soft fill path */}
              <path d="M12.5 10C12.5 12.7616 10.7616 14.5 8 14.5C5.23844 14.5 3.5 12.7616 3.5 10C3.5 7.03656 6.72594 3.03593 7.71531 1.87875C7.75052 1.83763 7.7942 1.80463 7.84337 1.782C7.89254 1.75937 7.94603 1.74765 8.00016 1.74765C8.05428 1.74765 8.10777 1.75937 8.15694 1.782C8.20611 1.80463 8.2498 1.83763 8.285 1.87875C9.27406 3.03593 12.5 7.03656 12.5 10Z" className="s-fill-soft" />
              {/* Outline stroke */}
              <path d="M12.5 10C12.5 12.7616 10.7616 14.5 8 14.5C5.23844 14.5 3.5 12.7616 3.5 10C3.5 7.03656 6.72594 3.03593 7.71531 1.87875C7.75052 1.83763 7.7942 1.80463 7.84337 1.782C7.89254 1.75937 7.94603 1.74765 8.00016 1.74765C8.05428 1.74765 8.10777 1.75937 8.15694 1.782C8.20611 1.80463 8.2498 1.83763 8.285 1.87875C9.27406 3.03593 12.5 7.03656 12.5 10Z" className="s-stroke" style={{ strokeWidth: 1.5 }} strokeMiterlimit="10" />
              {/* Accent stroke */}
              <path d="M10.75 10.25C10.75 10.8467 10.5129 11.419 10.091 11.841C9.66903 12.2629 9.09674 12.5 8.5 12.5" className="s-stroke" style={{ strokeWidth: 1.5 }} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        </g>
        <circle cx="60" cy="60" r="3.2" className="s-fill" />
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
        <circle cx="60" cy="60" r="32" className="s-stroke" strokeWidth="1.2" opacity="0.25" strokeDasharray="2 2" />
        <g className="scene-spin-slow">
          {/* Earth — at top (60, 28) */}
          <g className="scene-twinkle scene-st-1">
            <g transform="translate(60, 28)">
              {/* Soil box */}
              <rect x="-5.5" y="-2" width="11" height="9" rx="1" className="s-stroke s-fill-soft" style={{ strokeWidth: 1.2 }} />
              {/* Strata lines */}
              <line x1="-5.5" y1="1" x2="5.5" y2="1" className="s-stroke" style={{ strokeWidth: 1.0 }} />
              <line x1="-5.5" y1="4" x2="5.5" y2="4" className="s-stroke" style={{ strokeWidth: 1.0 }} />
              {/* Sprout */}
              <path d="M 0 -2 C -2.5 -4 -2.5 -7 0 -5.5" className="s-fill" />
              <path d="M 0 -2 C 2.5 -4 2.5 -7 0 -5.5" className="s-fill" />
              <line x1="0" y1="-2" x2="0" y2="0" className="s-stroke" style={{ strokeWidth: 1.2 }} />
            </g>
          </g>
          {/* Water — at (90.4, 50.1) */}
          <g className="scene-twinkle scene-st-2">
            <g transform="translate(90.4, 50.1)">
              {/* Drop soft fill */}
              <path d="M 0 -7 C -3 -3 -3.5 -1 0 -1 C 3.5 -1 3 -3 0 -7 Z" className="s-fill-soft" />
              {/* Drop outline */}
              <path d="M 0 -7 C -3 -3 -3.5 -1 0 -1 C 3.5 -1 3 -3 0 -7 Z" className="s-stroke" style={{ strokeWidth: 1.2 }} />
              {/* Waves below */}
              <path d="M -6 2.5 C -3.5 0.5 -2.5 4.5 0 2.5 C 2.5 0.5 3.5 4.5 6 2.5" className="s-stroke" style={{ strokeWidth: 1.2 }} />
              <path d="M -6 6 C -3.5 4 -2.5 8 0 6 C 2.5 4 3.5 8 6 6" className="s-stroke" style={{ strokeWidth: 1.2 }} />
            </g>
          </g>
          {/* Fire — at (78.8, 85.9) */}
          <g className="scene-twinkle scene-st-3">
            <g transform="translate(78.8, 85.9)">
              {/* Flame soft fill */}
              <path d="M 0 5 C -3 5 -4 3 -4 1 C -4 -1.5 -1 -5 0 -6 C 1 -5 4 -1.5 4 1 C 4 3 3 5 0 5 Z" className="s-fill-soft" />
              {/* Flame outline */}
              <path d="M 0 5 C -3 5 -4 3 -4 1 C -4 -1.5 -1 -5 0 -6 C 1 -5 4 -1.5 4 1 C 4 3 3 5 0 5 Z" className="s-stroke" style={{ strokeWidth: 1.2 }} />
              {/* Inner core */}
              <path d="M 0 4 C -1.5 4 -2 2.5 -2 1 C -2 -0.5 -0.5 -3 0 -3.5 C 0.5 -3 2 -0.5 2 1 C 2 2.5 1.5 4 0 4 Z" className="s-fill" />
              {/* Spark dot */}
              <circle cx="0" cy="-8.5" r="1.1" className="s-fill" />
            </g>
          </g>
          {/* Air — at (41.2, 85.9) */}
          <g className="scene-twinkle scene-st-4">
            <g transform="translate(41.2, 85.9)">
              {/* Swirl 1 */}
              <path d="M -6.5 -2.5 H 1 C 2.5 -2.5 3.5 -1.5 3.5 0 C 3.5 1.5 2.5 2.5 1 2.5 C -0.5 2.5 -1.5 1.5 -1.5 0 C -1.5 -1 -0.5 -1.5 0 -1.5" className="s-stroke" style={{ strokeWidth: 1.2 }} fill="none" />
              {/* Swirl 2 */}
              <path d="M -5 2.5 H -1 C 0.5 2.5 1.5 3.5 1.5 5 C 1.5 6.5 0.5 7.5 -1 7.5 C -2.5 7.5 -3.5 6.5 -3.5 5 C -3.5 4 -2.5 3.5 -2 3.5" className="s-stroke" style={{ strokeWidth: 1.2 }} fill="none" />
            </g>
          </g>
          {/* Ether — at (29.6, 50.1) */}
          <g className="scene-twinkle scene-st-5">
            <g transform="translate(29.6, 50.1)">
              {/* Outer ring */}
              <circle cx="0" cy="0" r="6.5" className="s-stroke" style={{ strokeWidth: 1.2 }} />
              {/* Celestial soft fill inside */}
              <circle cx="0" cy="0" r="6.5" className="s-fill-soft" />
              {/* Center star */}
              <path d="M 0 -4 L 1 -1 L 4 0 L 1 1 L 0 4 L -1 1 L -4 0 L -1 -1 Z" className="s-fill" />
            </g>
          </g>
        </g>
        <circle cx="60" cy="60" r="3.2" className="s-fill" />
      </svg>
    ),
    /* Restore Ahara, Vihara, Achara & Vichara — the sun's daily arc over the horizon */
    rhythm: (
      <svg viewBox="0 0 120 120" className="scene scene--rhythm">
        <defs>
          <clipPath id="skyClip"><rect x="0" y="0" width="120" height="78" /></clipPath>
        </defs>
        <path d="M30 78 A30 30 0 0 1 90 78" className="s-stroke" strokeWidth="1.6" fill="none" opacity="0.35" strokeDasharray="3 3" />
        <line x1="20" y1="78" x2="100" y2="78" className="s-stroke" strokeWidth="2.2" opacity="0.4" />
        <g clipPath="url(#skyClip)">
          <g className="scene-arc">
            {/* Sun */}
            <g className="scene-spin-rays">
              <circle cx="60" cy="48" r="8" className="s-fill" />
              <g className="s-stroke" strokeWidth="2" strokeLinecap="round">
                <line x1="60" y1="32" x2="60" y2="37" />
                <line x1="76" y1="48" x2="71" y2="48" />
                <line x1="44" y1="48" x2="49" y2="48" />
                <line x1="71" y1="37" x2="68" y2="40" />
                <line x1="49" y1="37" x2="52" y2="40" />
              </g>
            </g>
            {/* Crescent Moon (opposite to the sun at (60, 108)) */}
            <path className="s-fill" d="M55 102 A6 6 0 1 1 65 110 A4.5 4.5 0 1 0 55 102 Z" />
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
    { Icon: Compass,  anim: "rhythm",   label: "Restore Ahara, Vihara, Achara & Vichara", desc: "Realign your diet, daily rhythms, conduct, and thought with your constitution for sustainable, whole-life healing." },
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

  const preloadIllustration = (step) => {
    const src = STEP_ILLUSTRATIONS[step.anim];
    if (src) { const img = new Image(); img.src = src; }
  };

  const renderNode = (step, i, discipline, disciplineName) => {
    const { Icon, label } = step;
    return (
      <li className="method-node" key={label}>
        <button
          type="button"
          className="method-node__inner"
          onClick={() => openDetail(step, discipline, disciplineName, i)}
          onMouseEnter={() => preloadIllustration(step)}
          onFocus={() => preloadIllustration(step)}
          aria-haspopup="dialog"
          aria-label={`${label} — read more`}
        >
          <span className="method-node__icon">
            {step.anim ? <StepScene kind={step.anim} /> : <Icon size={20} strokeWidth={1.6} />}
          </span>
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
            <div className="method-detail__image-container" aria-hidden="true">
              <img
                src={STEP_ILLUSTRATIONS[active.anim] || (active.discipline === 'fm' ? functionalMedicineImg : ayurvedaImg)}
                alt={active.label}
                className="method-detail__image"
              />
            </div>
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
      tier: "1 Month",
      name: "Foundation",
      tagline: "Your first step into root-cause healing.",
      price: "40,000",
      duration: "1 month",
      badge: null,
      inheritsFrom: null,
      features: [
        "Root cause analysis",
        "Prakruthi analysis",
        "Lab report interpretation & review",
        "Personalised nutrition guidance",
        "Weekly 1:1 check-in calls",
        "Supplement protocol (if needed)",
        "Nervous system regulation",
        "Breathwork practices (as per level)",
        "WhatsApp support (working hours)",
      ],
      forWhom: "Beginners, clarity seekers, and mild-to-moderate symptoms.",
    },
    {
      tier: "3 Months",
      name: "Deep Healing",
      tagline: "Systematic, guided root work over a full season.",
      price: "90,000",
      duration: "3 months",
      badge: "Most chosen",
      inheritsFrom: "Foundation",
      features: [
        "Advanced test interpretation & review",
        "Gut microbiome healing & restoration",
        "Detoxification pathway optimization",
        "Lymphatic system support",
        "Sleep optimization",
        "Circadian rhythm optimization",
        "Doctor consultations (if needed)",
      ],
      forWhom: "Chronic issues, metabolic & hormonal imbalance, gut healing.",
    },
    {
      tier: "6 Months",
      name: "Transformation",
      tagline: "Full immersion. A roadmap built for the long term.",
      price: "1,60,000",
      duration: "6 months",
      badge: null,
      inheritsFrom: "Deep Healing",
      features: [
        "Ongoing protocol adjustments",
        "Advanced breathwork practices",
        "Environmental toxins assessment",
        "Daily routine & lifestyle optimization",
        "Dopamine & productivity rewiring",
        "Habit rewiring & relapse prevention",
        "Long-term maintenance protocol",
        "Exercise form & technique correction",
      ],
      forWhom: "Complex, long-standing conditions requiring deep, sustained work.",
    },
  ];

  return (
    <section className="spread pricing-section" id="programs" ref={ref}>
      <div className="section-tag reveal"><span>IV · Programs</span></div>
      <div className="pricing-header">
        <h2 className="section-h reveal">
          Choose the depth<br/>
          <em>of your healing.</em>
        </h2>
        <p className="pricing-subhead reveal delay-1">
          Three levels of engagement, each a complete program. Not a subscription.
          The difference is depth, duration, and how far down the root I go with you.
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
              {plan.inheritsFrom && (
                <p className="plan-inherits">
                  <span className="plan-inherits__text">
                    Everything in <strong>{plan.inheritsFrom}</strong>, plus
                  </span>
                </p>
              )}
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
                <a
                  className="btn btn--primary plan-cta"
                  href={waUrl(`Hi Himanshu, I'm interested in the ${plan.name} program (${plan.duration}). I'd like to begin.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-hoverable="true"
                >
                  Begin Your Healing Journey
                  <ArrowRight size={14} className="btn-icon-right" />
                </a>
              </div>
            </div>
          </Parallax>
        ))}
      </div>
    </section>
  );
}

/* ── IV · Voices — client video testimonials ─────────────────────────────────
   Videos live on YouTube (Unlisted is fine — embeddable but not searchable).
   Cards are populated from a Google Sheet the client owns, so he can add new
   testimonials himself with no code and no redeploy: he adds a row
   (name, age, profession, youtube_url, after_text) and it appears live.

   Wire it up by setting VITE_TESTIMONIALS_SHEET_CSV to the sheet's
   "Publish to web → CSV" link. If it's unset or unreachable, the placeholder
   stories below are shown instead. */
const TESTIMONIALS_SHEET_CSV = import.meta.env.VITE_TESTIMONIALS_SHEET_CSV ||
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlipE7TtkWiES65tAAyv8XoSsQr_-yU93d-fjvMHws2JtuSOAcWyohJQGFX48sF5vA5btSdGI-SNFt/pub?output=csv";

const FALLBACK_STORIES = [
  {
    name: "Coming soon", age: "39", profession: "Marketing Professional",
    after: "In 3 months, years of acidity-driven migraines, breathlessness, and chronic fatigue eased dramatically. Lab work confirmed improved metabolic markers and resolved insulin resistance — without adding a single new medication.",
    youtubeId: null, thumb: null,
  },
  {
    name: "Coming soon", age: "45", profession: "Business Owner",
    after: "After a season of guided, root-cause work, the dependence on daily medication gave way to steady energy, better digestion, and sleep that finally felt restorative. The change held — confirmed by post-protocol blood tests.",
    youtubeId: null, thumb: null,
  },
  {
    name: "Coming soon", age: "32", profession: "Software Engineer",
    after: "The constant jumping between practitioners stopped. A calmer nervous system, a rebuilt gut, and a renewed trust in her own body replaced the anxiety, fatigue, and bloating she'd carried for years.",
    youtubeId: null, thumb: null,
  },
];

// Extract the 11-char video id from any common YouTube URL form
function youtubeId(url = "") {
  const m = String(url).match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/);
  return m ? m[1] : null;
}
// Prefer the HD (1280×720) thumbnail; fall back to hqdefault for older/SD uploads.
const youtubeThumb = (id) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
const youtubeThumbFallback = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const youtubeEmbed = (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;

/* Render the "What Changed" text, turning **double-asterisk** phrases into
   highlighted (bold, brand-gold) spans. Splits into plain text + emphasis —
   no HTML injection, so it's safe for client-authored sheet content. */
function renderHighlights(text = "") {
  return String(text).split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="story-highlight">{part.slice(2, -2)}</strong>
      : part
  );
}

// Minimal RFC-4180 CSV parser (handles quoted fields, embedded commas/newlines)
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ""; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== '\r') field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Map sheet rows → story objects by header name (order-independent)
function rowsToStories(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name) => headers.indexOf(name);
  const iName = col("name"), iAge = col("age"), iProf = col("profession"),
        iUrl = col("youtube_url"), iAfter = col("after_text");
  return rows.slice(1)
    .filter((r) => r.some((c) => c && c.trim()))
    .map((r) => {
      const id = youtubeId(iUrl >= 0 ? r[iUrl] : "");
      const get = (i) => (i >= 0 && r[i] ? r[i].trim() : "");
      return {
        name: get(iName), age: get(iAge), profession: get(iProf), after: get(iAfter),
        youtubeId: id, thumb: id ? youtubeThumb(id) : null,
      };
    })
    // A row shows as long as it has a name; video + paragraph are optional
    // (no video → "coming soon" card; no paragraph → just name & profession).
    .filter((s) => s.name);
}

/* Lightbox that plays a client's YouTube story. Loads the player only on open
   (click-to-play facade), so the page stays fast. Closes on backdrop/Esc. */
function VideoLightbox({ story, onClose }) {
  _useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return _createPortal(
    <div className="video-lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="video-lightbox__panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="video-lightbox__close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className="video-lightbox__video">
          <iframe
            src={youtubeEmbed(story.youtubeId)}
            title={`${story.name} — story`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            frameBorder="0"
          />
        </div>
        <div className="video-lightbox__caption">
          <span className="story-name">{story.name}</span>
          <span className="story-meta">{[story.age, story.profession].filter(Boolean).join(" · ")}</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Voices() {
  const ref = useReveal();
  const scrollerRef = _useRef(null);
  const [activeVideo, setActiveVideo] = _useState(null);
  const [stories, setStories] = _useState(FALLBACK_STORIES);

  // Pull live testimonials from the client's published Google Sheet.
  _useEffect(() => {
    if (!TESTIMONIALS_SHEET_CSV) return;
    let cancelled = false;
    fetch(TESTIMONIALS_SHEET_CSV)
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((text) => {
        const parsed = rowsToStories(parseCSV(text));
        if (!cancelled && parsed.length) setStories(parsed);
      })
      .catch(() => { /* keep the placeholder fallback */ });
    return () => { cancelled = true; };
  }, []);

  /* Auto-advance with a pure CSS keyframe animation (runs on the compositor
     thread, so it stays smooth on iOS even when the main thread is busy). Manual
     drag/swipe is handled in JS: we pause the CSS animation, take over the
     transform, then hand control back — resuming the animation from the exact
     current position via a negative animation-delay so there's no jump. */
  _useEffect(() => {
    const el = scrollerRef.current;
    const track = el && el.firstElementChild;
    if (!el || !track) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const PX_PER_SEC = 32;
    let half = 0, offset = 0, resumeTimer;

    const measure = () => {
      half = track.scrollWidth / 2;
      if (half > 0) track.style.animationDuration = (half / PX_PER_SEC) + "s";
    };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(track);
    window.addEventListener("resize", measure);

    const wrap = () => {
      if (half <= 0) return;
      while (offset <= -half) offset += half;
      while (offset > 0) offset -= half;
    };

    // Resume the compositor animation seamlessly from the current offset
    const startAuto = () => {
      if (reduce || half <= 0) return;
      wrap();
      const phase = (-offset) / half;          // 0..1 along the loop
      const dur = half / PX_PER_SEC;
      track.style.transform = "";              // let the animation drive it
      track.style.animationDelay = (-(phase * dur)) + "s";
      track.classList.add("is-auto");
    };
    // Freeze at the current animated position and take over manually
    const stopAuto = () => {
      const m = new DOMMatrixReadOnly(getComputedStyle(track).transform);
      offset = m.m41 || offset;
      track.classList.remove("is-auto");
      track.style.transform = `translate3d(${offset}px,0,0)`;
    };

    startAuto();

    const scheduleResume = () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startAuto, 1600);
    };

    const onEnter = () => stopAuto();
    const onLeave = () => scheduleResume();
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    // Horizontal wheel / trackpad nudges the row too
    const onWheel = (e) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      stopAuto();
      offset -= d; wrap();
      track.style.transform = `translate3d(${offset}px,0,0)`;
      scheduleResume();
    };
    el.addEventListener("wheel", onWheel, { passive: true });

    // Unified pointer drag (mouse + touch). touch-action:pan-y lets vertical
    // page scroll pass through while we own horizontal drags.
    let down = false, startX = 0, startOffset = 0, moved = false;
    const onDown = (e) => {
      down = true; moved = false; startX = e.clientX;
      stopAuto(); startOffset = offset;
    };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) { moved = true; el.classList.add("is-dragging"); }
      offset = startOffset + dx; wrap();
      track.style.transform = `translate3d(${offset}px,0,0)`;
    };
    const onUp = () => {
      if (!down) return;
      down = false; el.classList.remove("is-dragging"); scheduleResume();
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    // Don't let a drag turn into a card click
    const onClickCapture = (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } };
    el.addEventListener("click", onClickCapture, true);

    return () => {
      clearTimeout(resumeTimer);
      if (ro) ro.disconnect();
      window.removeEventListener("resize", measure);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, [stories]);

  // Need enough cards to fill the row twice; pad short lists.
  const base = stories.length ? stories : FALLBACK_STORIES;
  const loop = base.length < 3 ? [...base, ...base, ...base, ...base] : [...base, ...base];

  return (
    <section className="spread" id="voices" ref={ref}>
      <div className="section-tag reveal"><span>III · Voices</span></div>
      <div className="voices-header">
        <h2 className="section-h reveal">
          Real stories.<br/>
          <em>Real healing.</em>
        </h2>
        <p className="voices-subhead reveal delay-1">
          What changed once they stopped chasing symptoms and started healing at the root.
        </p>
      </div>

      {/* Real scroll container: auto-advances, but the user can swipe/drag/wheel.
          Content is duplicated so scrollLeft can wrap for a seamless loop. */}
      <div className="story-marquee reveal delay-1" ref={scrollerRef}>
        <div className="story-track">
          {loop.map((s, i) => {
            const playable = Boolean(s.youtubeId);
            return (
              <article className="story-card" key={i} aria-hidden={i >= base.length}>
                <button
                  type="button"
                  className={`story-media ${playable ? "is-playable" : "is-pending"}`}
                  onClick={() => playable && setActiveVideo(s)}
                  disabled={!playable}
                  tabIndex={i >= base.length ? -1 : 0}
                  aria-label={playable ? `Play ${s.name}'s story` : "Video coming soon"}
                >
                  {s.thumb && (
                    <img
                      className="story-media-img"
                      src={s.thumb}
                      alt=""
                      loading="lazy"
                      draggable="false"
                      onError={(e) => {
                        // maxresdefault missing (SD upload): fall back once to hqdefault.
                        const fb = s.youtubeId ? youtubeThumbFallback(s.youtubeId) : "";
                        if (fb && e.currentTarget.src !== fb) e.currentTarget.src = fb;
                      }}
                    />
                  )}
                  <span className="story-play" aria-hidden="true">
                    <Play size={22} fill="currentColor" />
                  </span>
                  {!playable && <span className="story-pending-label">Video coming soon</span>}
                  <span className="story-media-tag">Their Story</span>
                </button>
                <div className="story-body">
                  <div className={`story-who ${s.after ? "" : "story-who--bare"}`}>
                    <span className="story-name">{s.name}</span>
                    <span className="story-meta">{[s.age, s.profession].filter(Boolean).join(" · ")}</span>
                  </div>
                  {s.after && <span className="story-after-tag">What Changed</span>}
                  {s.after && <p className="story-after">{renderHighlights(s.after)}</p>}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {activeVideo && <VideoLightbox story={activeVideo} onClose={() => setActiveVideo(null)} />}
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
    "You are unwilling to change food or lifestyle.",
    "You expect healing without personal involvement or responsibility.",
    "Work and social commitments currently take priority over focused health healing.",
    "You are too busy to follow the process consistently.",
    "You are attached to symptom suppression instead of root-cause healing.",
    "You are constantly jumping from one practitioner or program to another.",
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
          I hand you and wish you luck with. It is committed, guided, root-cause healing. It requires you to show up for it.
        </p>
      </div>

      <div className="qualifier-grid">
        <div className="qualifier-col qualifier-col--yes reveal delay-1">
          <div className="qualifier-col__header qualifier-col__header--yes">
            <span className="qualifier-header-icon qualifier-header-icon--yes">
              <Check size={15} strokeWidth={2.5} />
            </span>
            This is for you if
          </div>
          <ul className="qualifier-list qualifier-list--yes">
            {isFor.map((item, i) => (
              <li key={i}>
                <span className="qualifier-item-chip qualifier-item-chip--yes" aria-hidden="true">
                  <Check size={12} strokeWidth={2.6} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="qualifier-col qualifier-col--no reveal delay-2">
          <div className="qualifier-col__header qualifier-col__header--no">
            <span className="qualifier-header-icon qualifier-header-icon--no">
              <X size={15} strokeWidth={2.5} />
            </span>
            This may not be for you if
          </div>
          <ul className="qualifier-list qualifier-list--no">
            {notFor.map((item, i) => (
              <li key={i}>
                <span className="qualifier-item-chip qualifier-item-chip--no" aria-hidden="true">
                  <X size={12} strokeWidth={2.6} />
                </span>
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
      <div className="final-bg-mark" aria-hidden="true">HG</div>
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
          A 45-minute discovery call designed to understand your symptoms,
          health history, and goals. No urgency. No prescriptions. Together,
          we'll map the surface and explore what lies underneath.
        </p>
        <div className="final-actions reveal delay-3">
          <a
            className="btn btn--primary"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-hoverable="true"
          >
            Get in touch
          </a>
          <a className="btn btn--ghost" href="#method" data-hoverable="true">
            Explore Healing Pathways
          </a>
        </div>
      </Parallax>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
function SiteFooter() {
  const [activePolicy, setActivePolicy] = _useState(null);
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo"><BrandMark /></span>
            <div className="footer-brand-text">
              <span className="mark">Himanshu Garg</span>
              <span className="footer-role">Functional Medicine Health Coach</span>
            </div>
          </div>
          <div className="footer-nav">
            <a href="#philosophy" data-hoverable="true">Philosophy</a>
            <a href="#method" data-hoverable="true">Method</a>
            <a href="#programs" data-hoverable="true">Programs</a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" data-hoverable="true">Contact</a>
          </div>
        </div>
        <nav className="footer-legal" aria-label="Legal">
          {POLICIES.map((p) => (
            <button
              type="button"
              key={p.id}
              className="footer-legal__link"
              onClick={() => setActivePolicy(p)}
              data-hoverable="true"
            >
              {p.title}
            </button>
          ))}
        </nav>
        <div className="footer-bottom">
          <p className="copyright">&copy; {new Date().getFullYear()} Himanshu Garg. All rights reserved.</p>
          <p className="footer-tagline">Healing at the root.</p>
        </div>
      </div>
      <PolicyModal policy={activePolicy} onClose={() => setActivePolicy(null)} />
    </footer>
  );
}

export { Philosophy, Methodology, Pricing, Voices, Qualifier, FinalCTA, SiteFooter };
