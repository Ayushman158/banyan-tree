/* Scroll-driven narrative sections — real content, editorial design.
   References: Awwwards editorial layouts · Stripe pricing clarity · v0 minimalism */

import { useEffect as _useEffect, useRef as _useRef } from 'react';
import functionalMedicineImg from './assets/functional-medicine-method.jpg';
import ayurvedaImg from './assets/ayurveda-method.jpg';
import beginAtRootBg from './assets/begin-at-root-bg.jpg';
import {
  Microscope,
  Droplet,
  Shield,
  Sparkles,
  Compass,
  Scale,
  Heart,
  Flame,
  Check,
  X,
  Calendar,
  BookOpen,
  ArrowRight,
  ArrowDown,
  Search,
  Activity,
  Orbit,
  Leaf,
  Flower2
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
    }, { threshold: 0.14 });
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
  return (
    <section className="spread spread--dark" id="philosophy" ref={ref}>
      <div className="section-tag reveal"><span>I · Philosophy</span></div>
      <div className="philosophy">
        <div className="col-left">
          <h2 className="section-h reveal">
            Two sciences.<br/>
            <em>One person.</em>
          </h2>
        </div>
        <Parallax speed={0.05} className="col-right">
          <blockquote className="reveal delay-1">
            Modern medicine arrives at the symptom.
            Ancient wisdom asks what came before it.
            Together, they trace back to what actually started it.
          </blockquote>
          <p className="reveal delay-2">
            Functional Medicine provides the precision: lab markers, nutrient
            deficiencies, gut ecology, hormonal cascades. The physiology of why
            symptoms persist long after the trigger has passed.
          </p>
          <p className="reveal delay-3">
            Ayurveda provides the context: your constitution, your digestive
            fire, the rhythms your body was wired to move with. The conditions
            in which a particular body tends to lose and regain its balance.
          </p>
          <p className="reveal delay-3">
            Used together, they don't manage symptoms. They find the source.
          </p>
        </Parallax>
      </div>
    </section>
  );
}

/* ── II — Method ─────────────────────────────────────────────────────────── */
function Methodology() {
  const ref = useReveal();
  const fmSteps = [
    { Icon: Search,    label: "Root Cause Analysis",      desc: "Identify why symptoms exist" },
    { Icon: Droplet,   label: "Fix Nutrient Deficiencies", desc: "Restore vitamins, minerals, amino acids & cofactors" },
    { Icon: Activity,  label: "Heal Gut & Liver",          desc: "Improve digestion, absorption & detox capacity" },
    { Icon: Sparkles,  label: "Enhance Detoxification",    desc: "Activate gentle, safe detox pathways" },
  ];
  const aySteps = [
    { Icon: Compass, label: "Prakriti Analysis",            desc: "Understand your unique constitution" },
    { Icon: Orbit,   label: "Optimise the Five Elements",   desc: "Balance Earth, Water, Fire, Air & Ether" },
    { Icon: Scale,   label: "Balance the Doshas",           desc: "Harmonise Vata, Pitta & Kapha" },
    { Icon: Flame,   label: "Strengthen Digestion (Agni)",  desc: "Prevent toxin buildup, fuel transformation" },
  ];
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
            <h3 className="method-flow__name">Functional Medicine</h3>
            <span className="method-flow__sub">Fix the physiology first</span>
          </div>
          <ol className="method-flow__steps">
            {fmSteps.map(({ Icon, label, desc }, i) => (
              <li className="method-node" key={label}>
                <span className="method-node__icon"><Icon size={20} strokeWidth={1.6} /></span>
                <span className="method-node__body">
                  <span className="method-node__label">{label}</span>
                  <span className="method-node__desc">{desc}</span>
                </span>
                {i < fmSteps.length - 1 && (
                  <span className="method-node__link" aria-hidden="true"><ArrowDown size={15} strokeWidth={2} /></span>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Central connector */}
        <div className="method-flow__amp" aria-hidden="true">
          <span className="method-flow__amp-line method-flow__amp-line--t" />
          <span className="method-flow__amp-mark">&amp;</span>
          <span className="method-flow__amp-line method-flow__amp-line--b" />
        </div>

        {/* Ayurveda */}
        <div className="method-flow__col method-flow__col--ay">
          <div className="method-flow__head">
            <span className="method-flow__crest"><Flower2 size={22} strokeWidth={1.5} /></span>
            <h3 className="method-flow__name">Ayurveda</h3>
            <span className="method-flow__sub">Restore balance &amp; rhythm</span>
          </div>
          <ol className="method-flow__steps">
            {aySteps.map(({ Icon, label, desc }, i) => (
              <li className="method-node" key={label}>
                <span className="method-node__icon"><Icon size={20} strokeWidth={1.6} /></span>
                <span className="method-node__body">
                  <span className="method-node__label">{label}</span>
                  <span className="method-node__desc">{desc}</span>
                </span>
                {i < aySteps.length - 1 && (
                  <span className="method-node__link" aria-hidden="true"><ArrowDown size={15} strokeWidth={2} /></span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="method-process__foot reveal">
        This is not symptom management.<br/>
        <em>This is cellular repair, digestive healing, and lifestyle realignment.</em>
      </p>
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
function SiteFooter({ onOpenJournal }) {
  return (
    <footer>
      <div className="left">
        <span className="mark">Himanshu Garg</span>
        <span>Functional Medicine · Ayurveda · Lisbon &amp; Kyoto</span>
      </div>
      <div className="right">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (onOpenJournal) onOpenJournal();
          }}
          data-hoverable="true"
        >
          Journal
        </a>
        <a href="#philosophy" data-hoverable="true">Philosophy</a>
        <a href="#programs" data-hoverable="true">Programs</a>
        <a href="#begin" data-hoverable="true">Contact</a>
      </div>
    </footer>
  );
}

export { Philosophy, Methodology, Pricing, Voices, Qualifier, FinalCTA, SiteFooter };
