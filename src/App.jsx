/* App — Banyan light-mode experience.
   Phase machine: canopy → category → roots → detail. */

import React, { useEffect as useE, useRef as useR, useState as useS, useMemo as useM } from 'react';
import { BanyanData } from './data.js';
import TreeScene3D from './TreeScene3D.jsx';
import { Philosophy, Methodology, Voices, FinalCTA, SiteFooter } from './sections.jsx';
import { initSoundscape } from './sound.js';
import SoilJournal from './SoilJournal.jsx';
import SoilProfile from './SoilProfile.jsx';

/* ---------- Subtle drifting dust motes ---------- */
function Particles({ count = 28 }) {
  const items = useM(() => {
    const a = [];
    for (let i = 0; i < count; i++) {
      a.push({
        left: Math.random() * 100,
        top: 90 + Math.random() * 30,
        size: 1 + Math.random() * 2,
        dx: (Math.random() - 0.5) * 80 + "px",
        dur: 24 + Math.random() * 26,
        delay: -Math.random() * 40,
        op: 0.12 + Math.random() * 0.18,
      });
    }
    return a;
  }, [count]);
  return (
    <div className="particles" aria-hidden="true">
      {items.map((p, i) => (
        <span
          key={i}
          style={{
            left: p.left + "%",
            top: p.top + "%",
            width: p.size + "px",
            height: p.size + "px",
            animationDuration: p.dur + "s",
            animationDelay: p.delay + "s",
            opacity: p.op,
            "--dx": p.dx,
          }}
        />
      ))}
    </div>
  );
}

/* ---------- Custom cursor ---------- */
function Cursor() {
  const ringRef = useR(null);
  const dotRef = useR(null);
  useE(() => {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let dx = mx, dy = my;
    let raf;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dx += (mx - dx) * 0.5;
      dy += (my - dy) * 0.5;
      if (ringRef.current) ringRef.current.style.transform =
        `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      if (dotRef.current) dotRef.current.style.transform =
        `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    const onOver = (e) => {
      const t = e.target.closest("[data-hoverable], a, button");
      if (ringRef.current) {
        if (t) ringRef.current.classList.add("is-hover");
        else ringRef.current.classList.remove("is-hover");
      }
    };
    document.addEventListener("mousemove", onOver);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousemove", onOver);
    };
  }, []);
  return (
    <>
      <div className="cursor" ref={ringRef}></div>
      <div className="cursor-dot" ref={dotRef}></div>
    </>
  );
}

/* ---------- Loader ---------- */
function Loader({ gone }) {
  return (
    <div className={`loader ${gone ? "is-gone" : ""}`}>
      <div className="loader-ring">
        <span className="loader-mark">b.</span>
      </div>
      <div className="loader-label">Tuning the atmosphere</div>
    </div>
  );
}

/* ---------- Nav ---------- */
function Nav({ onOpenJournal }) {
  const [scrolled, setScrolled] = useS(false);

  useE(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="nav-mark">Banyan</div>
      <div className="nav-right">
        <div className="nav-links">
          <a href="#philosophy" data-hoverable="true">Philosophy</a>
          <a href="#method" data-hoverable="true">Method</a>
          <a href="#voices" data-hoverable="true">Voices</a>
          <button className="nav-link-btn" onClick={onOpenJournal} data-hoverable="true">Journal</button>
        </div>
        <button className="nav-cta" onClick={onOpenJournal} data-hoverable="true">Begin</button>
      </div>
    </nav>
  );
}

/* ---------- Breadcrumb ---------- */
function Crumb({ category, condition, root, onJump }) {
  const visible = category != null || condition || root;
  return (
    <div className={`crumb ${visible ? "is-visible" : ""}`}>
      <span
        className={`crumb-step ${!condition && category != null ? "is-current" : ""}`}
        onClick={() => onJump("canopy")}
        data-hoverable="true"
      >
        The tree
      </span>
      {category != null && (
        <>
          <span className="crumb-sep">/</span>
          <span
            className={`crumb-step ${condition == null ? "is-current" : ""}`}
            onClick={() => onJump("category")}
            data-hoverable="true"
          >
            {BanyanData.categories[category].name}
          </span>
        </>
      )}
      {condition && (
        <>
          <span className="crumb-sep">/</span>
          <span
            className={`crumb-step ${!root ? "is-current" : ""}`}
            onClick={() => onJump("roots")}
            data-hoverable="true"
          >
            {BanyanData.conditionsById[condition].name}
          </span>
        </>
      )}
      {root && (
        <>
          <span className="crumb-sep">/</span>
          <span className="crumb-step is-current">
            {BanyanData.rootCauses[root].name}
          </span>
        </>
      )}
    </div>
  );
}

/* ---------- Root-cause panel ---------- */
function RootPanel({ data, trace, onClose }) {
  return (
    <>
      <div className={`panel-scrim ${data ? "is-visible" : ""}`} onClick={onClose}></div>
      <div className={`panel ${data ? "is-visible" : ""}`} role="dialog" aria-modal="true">
        <button className="panel-close" onClick={onClose} data-hoverable="true">×</button>
        {data && (
          <>
            <div className="panel-eyebrow">
              <span>Root cause · {data.number}</span>
              {trace && (
                <span className="panel-eyebrow-trace">From: {trace}</span>
              )}
            </div>
            <h3 className="panel-title">{data.name}</h3>
            <p className="panel-insight">{data.insight}</p>
            <p className="panel-body">{data.body}</p>
            <dl className="panel-meta">
              {Object.entries(data.meta).map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="panel-actions">
              <button className="btn btn--primary" data-hoverable="true">
                Begin a consultation
              </button>
              <button className="btn btn--ghost" data-hoverable="true" onClick={onClose}>
                Continue exploring
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ---------- App ---------- */
function App() {
  const [loaded, setLoaded] = useS(false);
  const [phase, setPhase] = useS("canopy");
  const [selectedCategory, setSelectedCategory] = useS(null);
  const [selectedCondition, setSelectedCondition] = useS(null);
  const [selectedRoot, setSelectedRoot] = useS(null);
  const [rootsReady, setRootsReady] = useS(false);
  
  const [showJournal, setShowJournal] = useS(false);
  const [journalAnswers, setJournalAnswers] = useS(null);

  useE(() => {
    initSoundscape();
    const t = setTimeout(() => setLoaded(true), 1400);
    return () => clearTimeout(t);
  }, []);

  const onCategoryClick = (catIdx) => {
    setSelectedCategory(catIdx);
    setSelectedCondition(null);
    setSelectedRoot(null);
    setPhase("category");
  };

  const onConditionClick = (condId) => {
    const cond = BanyanData.conditionsById[condId];
    setSelectedCondition(condId);
    setRootsReady(false);   // hide root nodes during descent
    setPhase("roots");
    // Reveal root nodes only after the camera has substantially arrived underground
    setTimeout(() => {
      setRootsReady(true);
      if (cond) setSelectedRoot(cond.root);
    }, 1500);
  };

  const onRootClick = (rootId) => {
    setSelectedRoot(rootId);
    setPhase("detail");
  };

  const onPanelClose = () => setPhase("roots");

  const onCrumbJump = (target) => {
    if (target === "canopy") {
      setRootsReady(false);
      setSelectedCategory(null);
      setSelectedCondition(null);
      setSelectedRoot(null);
      setPhase("canopy");
    } else if (target === "category") {
      setRootsReady(false);
      setSelectedCondition(null);
      setSelectedRoot(null);
      setPhase("category");
    } else if (target === "roots") {
      // Already underground — roots should stay visible
      setSelectedRoot(null);
      setPhase("roots");
    }
  };

  useE(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (phase === "detail") onPanelClose();
      else if (phase === "roots") onCrumbJump("category");
      else if (phase === "category") onCrumbJump("canopy");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const catData = selectedCategory != null ? BanyanData.categories[selectedCategory] : null;
  const condData = selectedCondition ? BanyanData.conditionsById[selectedCondition] : null;
  const rootData = phase === "detail" && selectedRoot ? BanyanData.rootCauses[selectedRoot] : null;

  // Trace for panel
  const trace = [
    catData?.name,
    condData?.name,
  ].filter(Boolean).join(" · ");

  // Determine which "back" label to show
  let backLabel = null;
  let backAction = null;
  if (phase === "category") {
    backLabel = "Back to the tree";
    backAction = () => onCrumbJump("canopy");
  } else if (phase === "roots" || phase === "detail") {
    backLabel = catData ? `Back to ${catData.name}` : "Back";
    backAction = () => onCrumbJump("category");
  }

  return (
    <>
      <Cursor />
      <div className="paper-grain" aria-hidden="true"></div>
      <div className="paper-vignette" aria-hidden="true"></div>
      <Particles count={24} />
      <Loader gone={loaded} />
      <Nav onOpenJournal={() => setShowJournal(true)} />
      <Crumb
        category={selectedCategory}
        condition={selectedCondition}
        root={phase === "detail" ? selectedRoot : null}
        onJump={onCrumbJump}
      />

      <section className={`stage${(phase === 'roots' || phase === 'detail') ? ' is-underground' : ''}`} data-screen-label="01 Hero">
        {/* Atmospheric depth layers — sit behind the 3D canvas */}
        <div className="atmo-sun-glow"     aria-hidden="true" />
        <div className="atmo-cloud-drift atmo-cloud-drift--one" aria-hidden="true" />
        <div className="atmo-cloud-drift atmo-cloud-drift--two" aria-hidden="true" />
        <div className="atmo-horizon-mist" aria-hidden="true" />
        <div className="atmo-water"        aria-hidden="true" />
        <div className="atmo-fore-dark"    aria-hidden="true" />
        <TreeScene3D
          phase={phase}
          selectedCategory={selectedCategory}
          selectedCondition={selectedCondition}
          selectedRoot={selectedRoot}
          rootsReady={rootsReady}
          onCategoryClick={onCategoryClick}
          onConditionClick={onConditionClick}
          onRootClick={onRootClick}
        />

        {/* Bottom-left tagline (canopy phase only) */}
        <div className="hero-tagline" style={{
          opacity: phase === "canopy" ? 1 : 0,
        }}>
          <div className="label">An atlas of root-cause health</div>
          <h1>
            Every symptom<br/>
            has a <em>deeper&nbsp;root.</em>
          </h1>
        </div>

        {/* Bottom-right cue with counts */}
        <div className="hero-cue" style={{
          opacity: phase === "canopy" ? 1 : 0,
        }}>
          <p className="text">
            Twelve domains of the modern body, one hundred twenty-one conditions,
            traced back to the patterns that quietly shape them.
          </p>
          <div className="meta">
            <span><strong>12</strong> domains</span>
            <span className="sep"></span>
            <span><strong>121</strong> conditions</span>
            <span className="sep"></span>
            <span><strong>7</strong> roots</span>
          </div>
          <div className="cue-line">
            <span className="pulse"></span>
            Choose a domain to begin
          </div>
        </div>

        {/* Banners */}
        <div className={`cat-banner ${phase === "category" ? "is-visible" : ""}`}>
          <span className="label">Domain</span>
          <span className="name">{catData?.name || ""}</span>
          <span className="meta">
            {catData?.conditions?.length || 0} conditions · Choose one to trace its root
          </span>
        </div>

        <div className={`cond-banner ${(phase === "roots" || phase === "detail") ? "is-visible" : ""}`}>
          <span className="label">Tracing the root of</span>
          <span className="name">{condData?.name || ""}</span>
          <span className="meta">
            {catData?.name || ""} · Below the surface
          </span>
        </div>

        {backLabel && (
          <button
            className={`stage-back ${phase !== "canopy" ? "is-visible" : ""}`}
            onClick={backAction}
            data-hoverable="true"
          >
            <span>←</span>
            <span>{backLabel}</span>
          </button>
        )}

        {/* Underground: bottom-left insight card */}
        <div className={`underground-insight ${(phase === 'roots' || phase === 'detail') && rootsReady ? 'is-visible' : ''}`}>
          <span className="underground-insight__icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.6" />
              <path d="M5.5 9.5C6 7 8 6 8 4" stroke="currentColor" strokeLinecap="round" />
              <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
            </svg>
          </span>
          <span>Each root is connected.<br/>Healing one nourishes all.</span>
        </div>

        <div className={`soil-story ${(phase === 'roots' || phase === 'detail') && rootsReady ? 'is-visible' : ''}`} aria-hidden="true">
          <span className="soil-story__layer soil-story__layer--top" />
          <span className="soil-story__layer soil-story__layer--mid" />
          <span className="soil-story__layer soil-story__layer--deep" />
          <span className="soil-story__path soil-story__path--one" />
          <span className="soil-story__path soil-story__path--two" />
          <span className="soil-story__path soil-story__path--three" />
        </div>

        {/* Underground: scroll hint */}
        <div className={`underground-scroll ${(phase === 'roots' || phase === 'detail') && rootsReady ? 'is-visible' : ''}`}>
          <span className="underground-scroll__icon">
            <svg width="18" height="28" viewBox="0 0 18 28" fill="none">
              <rect x="1" y="1" width="16" height="26" rx="8" stroke="currentColor" strokeOpacity="0.45" />
              <rect x="7.5" y="5" width="3" height="6" rx="1.5" fill="currentColor" fillOpacity="0.6">
                <animate attributeName="y" values="5;12;5" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
              </rect>
            </svg>
          </span>
          <span>Scroll to explore deeper</span>
        </div>

        {/* Underground: bottom-right healing pathways */}
        <div className={`underground-cta ${(phase === 'roots' || phase === 'detail') && rootsReady ? 'is-visible' : ''}`}>
          <button className="btn btn--ghost underground-cta__btn" onClick={() => setShowJournal(true)} data-hoverable="true">
            View Healing Pathways
            <span className="underground-cta__arrow">→</span>
          </button>
        </div>
      </section>

      <RootPanel data={rootData} trace={trace} onClose={onPanelClose} />

      <Philosophy />
      <Methodology />
      <Voices />
      <FinalCTA />
      <SiteFooter />

      {showJournal && !journalAnswers && (
        <SoilJournal onComplete={setJournalAnswers} onClose={() => setShowJournal(false)} />
      )}
      {showJournal && journalAnswers && (
        <SoilProfile answers={journalAnswers} onRestart={() => setJournalAnswers(null)} onClose={() => { setShowJournal(false); setJournalAnswers(null); }} />
      )}
    </>
  );
}

export default App;
