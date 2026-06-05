/* App — Banyan light-mode experience.
   Phase machine: canopy → category → roots → detail. */

import React, { useEffect as useE, useRef as useR, useState as useS, useMemo as useM } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BanyanData } from './data.js';
import TreeScene3D from './TreeScene3D.jsx';
import { Philosophy, Methodology, Pricing, Voices, Qualifier, FinalCTA, SiteFooter, StatsStrip } from './sections.jsx';
import { initSoundscape } from './sound.js';
import SoilJournal from './SoilJournal.jsx';
import SoilProfile from './SoilProfile.jsx';
import splashVideo from './assets/kling_20260603_作品__4501_0.mp4';

/* ---------- Subtle drifting dust motes ---------- */
function Particles({ count = 28 }) {
  const items = useM(() => {
    const a = [];
    for (let i = 0; i < count; i++) {
      const size = 1 + Math.random() * 2.5;
      a.push({
        left: Math.random() * 100,
        top: 90 + Math.random() * 30,
        size,
        dx: (Math.random() - 0.5) * 80 + "px",
        dur: 24 + Math.random() * 26,
        delay: -Math.random() * 40,
        op: 0.12 + Math.random() * 0.18,
        depth: size * 0.5 + Math.random() * 0.5, // Closer/larger particles shift faster
      });
    }
    return a;
  }, [count]);
  return (
    <div className="particles" aria-hidden="true">
      {items.map((p, i) => (
        <span
          key={i}
          className="particle-wrapper"
          style={{
            left: p.left + "%",
            top: p.top + "%",
            transform: `translate(calc(var(--mouse-x, 0) * ${p.depth * 36}px), calc(var(--mouse-y, 0) * ${p.depth * 36}px))`
          }}
        >
          <span
            className="particle-dot"
            style={{
              width: p.size + "px",
              height: p.size + "px",
              animationDuration: p.dur + "s",
              animationDelay: p.delay + "s",
              opacity: p.op,
              "--dx": p.dx,
            }}
          />
        </span>
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
    let hoveredEl = null;
    const onMove = (e) => { 
      mx = e.clientX; 
      my = e.clientY; 
      
      const t = e.target.closest("[data-hoverable]");
      if (t !== hoveredEl) {
        if (hoveredEl) {
          hoveredEl.style.removeProperty('--mag-x');
          hoveredEl.style.removeProperty('--mag-y');
          hoveredEl.style.removeProperty('--mag-rx');
          hoveredEl.style.removeProperty('--mag-ry');
          hoveredEl.classList.remove('is-magnetized');
        }
        hoveredEl = t;
        if (hoveredEl) {
          hoveredEl.classList.add('is-magnetized');
          // Dispatch a custom event so sounds can play
          window.dispatchEvent(new CustomEvent('magnetHover'));
        }
      }

      if (hoveredEl) {
        const rect = hoveredEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distX = mx - centerX;
        const distY = my - centerY;
        hoveredEl.style.setProperty('--mag-x', distX + "px");
        hoveredEl.style.setProperty('--mag-y', distY + "px");
        hoveredEl.style.setProperty('--mag-rx', (distY / (rect.height / 2) * -12) + "deg");
        hoveredEl.style.setProperty('--mag-ry', (distX / (rect.width / 2) * 12) + "deg");
      }
    };
    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dx += (mx - dx) * 0.5;
      dy += (my - dy) * 0.5;
      if (ringRef.current) ringRef.current.style.transform =
        `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      if (dotRef.current) dotRef.current.style.transform =
        `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
      
      const normX = (rx / window.innerWidth) - 0.5;
      const normY = (ry / window.innerHeight) - 0.5;
      document.documentElement.style.setProperty('--mouse-x', normX.toFixed(4));
      document.documentElement.style.setProperty('--mouse-y', normY.toFixed(4));

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
        <span className="loader-mark">h.</span>
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
      <div className="nav-mark">Himanshu Garg</div>
      <div className="nav-right">
        <div className="nav-links">
          <a href="#philosophy" data-hoverable="true">Philosophy</a>
          <a href="#method" data-hoverable="true">Method</a>
          <a href="#voices" data-hoverable="true">Voices</a>
          <button className="nav-link-btn" onClick={onOpenJournal} data-hoverable="true">Journal</button>
        </div>
        <a href="#apply" className="nav-cta" data-hoverable="true">Apply for Consult</a>
      </div>
    </nav>
  );
}

/* ---------- Breadcrumb ---------- */
function Crumb({ category, condition, root, phase, onJump }) {
  const visible = category != null || condition || root;
  const isUnderground = phase === "roots" || phase === "detail";
  return (
    <div className={`crumb ${visible ? "is-visible" : ""} ${isUnderground ? "is-underground" : ""}`}>
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




/* ---------- App ---------- */
function App() {
  const [loaded, setLoaded] = useS(false);
  const [heroEntered, setHeroEntered] = useS(false);
  const [phase, setPhase] = useS("canopy");
  const [selectedCategory, setSelectedCategory] = useS(null);
  const [selectedCondition, setSelectedCondition] = useS(null);
  const [selectedRoot, setSelectedRoot] = useS(null);
  const [rootsReady, setRootsReady] = useS(false);
  
  const [showJournal, setShowJournal] = useS(false);
  const [journalAnswers, setJournalAnswers] = useS(null);
  const [showSplash, setShowSplash] = useS(true);

  useE(() => {
    initSoundscape();
    const t = setTimeout(() => setLoaded(true), 1400);
    return () => clearTimeout(t);
  }, []);

  useE(() => {
    if (!loaded) return;
    // Fire entrance after the loader finishes fading (1.8s transition)
    const t = setTimeout(() => setHeroEntered(true), 1800);
    return () => clearTimeout(t);
  }, [loaded]);

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
    }, 2400);
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
      <div className={`underground-page-tint${(phase === "roots" || phase === "detail") ? " is-active" : ""}`} aria-hidden="true"></div>
      <Particles count={24} />
      <Loader gone={loaded} />
      
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            className="splash-screen"
          >
            <video
              className="splash-video"
              src={splashVideo}
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="splash-overlay" />
            <div className="splash-content">
              <span className="splash-eyebrow">An atlas of root cause healing</span>
              <h1 className="splash-title">HIMANSHU GARG</h1>
              <p className="splash-tagline">Every symptom has a deeper root.</p>
              <button
                type="button"
                className="splash-btn"
                onClick={() => setShowSplash(false)}
                data-hoverable="true"
              >
                Enter the Canopy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSplash && <Nav onOpenJournal={() => setShowJournal(true)} />}

      <section className={`stage${(phase === 'roots' || phase === 'detail') ? ' is-underground' : ''}`} data-screen-label="01 Hero">
        {!showSplash && (
          <Crumb
            category={selectedCategory}
            condition={selectedCondition}
            root={phase === "detail" ? selectedRoot : null}
            phase={phase}
            onJump={onCrumbJump}
          />
        )}
        {/* Atmospheric depth layers — behind the image */}
        <div className="atmo-sun-glow"     aria-hidden="true" />
        <div className="atmo-cloud-drift atmo-cloud-drift--one" aria-hidden="true" />
        <div className="atmo-cloud-drift atmo-cloud-drift--two" aria-hidden="true" />
        <div className="atmo-horizon-mist" aria-hidden="true" />
        <div className="atmo-water"        aria-hidden="true" />
        <TreeScene3D
          phase={phase}
          selectedCategory={selectedCategory}
          selectedCondition={selectedCondition}
          selectedRoot={selectedRoot}
          rootsReady={rootsReady}
          onCategoryClick={onCategoryClick}
          onConditionClick={onConditionClick}
          onRootClick={onRootClick}
          onCrumbJump={onCrumbJump}
        />



        {/* Bottom-left tagline (canopy phase only) */}
        <div
          className={`hero-tagline${heroEntered ? " is-entered" : ""}`}
          style={{ opacity: !showSplash && phase === "canopy" && heroEntered ? 1 : 0 }}
        >

          
          <span className="hero-eyebrow">An atlas of root cause healing</span>
          
          <h1 className="hero-title">
            <span>Every symptom</span>
            <span>has a</span>
            <span className="gold-italic">deeper root.</span>
          </h1>
          
          <div className="hero-divider" />
          
          <p className="hero-description">
            Explore symptoms, uncover root causes, and understand the hidden patterns shaping your health.
          </p>
          
          <button className="hero-btn" onClick={() => setShowJournal(true)} data-hoverable="true">
            <span>Begin the Journey</span>
            <span className="arrow">→</span>
          </button>
          
          <p className="hero-author">Guided by Himanshu Garg</p>
        </div>

        {/* Bottom-right cue with counts */}
        <div
          className={`hero-cue${heroEntered ? " is-entered" : ""}`}
          style={{ opacity: !showSplash && phase === "canopy" && heroEntered ? 1 : 0 }}
        >
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



        {backLabel && (
          <button
            className={`stage-back ${phase !== "canopy" && phase !== "detail" ? "is-visible" : ""}`}
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

        <AnimatePresence>
          {phase === "category" && (
            <motion.div
              className="canopy-tooltip"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <span className="pulse"></span> Click a symptom to reveal its root causes
            </motion.div>
          )}
          {phase === "roots" && !rootsReady && (
            <motion.div
              className="descending-tooltip"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              Descending to root causes...
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`soil-story ${(phase === 'roots' || phase === 'detail') && rootsReady ? 'is-visible' : ''}`} aria-hidden="true">
          <span className="soil-story__layer soil-story__layer--top" />
          <span className="soil-story__layer soil-story__layer--mid" />
          <span className="soil-story__layer soil-story__layer--deep" />
          <span className="soil-story__path soil-story__path--one" />
          <span className="soil-story__path soil-story__path--two" />
          <span className="soil-story__path soil-story__path--three" />
        </div>

        {/* Underground: bottom-right healing pathways */}
        <div className={`underground-cta ${(phase === 'roots' || phase === 'detail') && rootsReady ? 'is-visible' : ''}`}>
          <button className="btn btn--ghost underground-cta__btn" onClick={() => setShowJournal(true)} data-hoverable="true">
            View Healing Pathways
            <span className="underground-cta__arrow">→</span>
          </button>
        </div>
      </section>



      <Philosophy />
      <StatsStrip />
      <Methodology />
      <Voices />
      <Pricing />
      <Qualifier />
      <FinalCTA />
      <SiteFooter onOpenJournal={() => setShowJournal(true)} />

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
