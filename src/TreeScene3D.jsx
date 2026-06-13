import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BanyanData } from './data.js';
import { playHoverSound } from './sound.js';
import gsap from 'gsap';
import canopyImg from './assets/new new new hero.jpg';
import aerialImg from './assets/Aerial Root stage 2.jpg';
import rootsImg from './assets/roots hd.jpg';
import mobileCanopyImg from './assets/hero mobile stage 1.png';
import mobileAerialImg from './assets/hero mobile stage 2.png';

// Coordinates calibrated to 'new new new hero.jpg' — tree is centered (~50% x).
// Left branch: 20-45%x, Right branch: 55-80%x. Canopy top: ~10%y, trunk: ~70%y.
// Labels on left-branch nodes point LEFT (align:'left'), right-branch nodes point RIGHT.
const CATEGORIES = [
  // Right side of canopy (pushed inwards)
  { id: "mental", name: "Mental Health", x: 58, y: 20, labelX: 63, labelY: 20, align: "left" },
  { id: "autoimmune", name: "Autoimmune & Inflammatory", x: 56, y: 28, labelX: 61, labelY: 28, align: "left" },
  { id: "cardiovascular", name: "Cardiovascular", x: 54, y: 40, labelX: 59, labelY: 40, align: "left" },
  { id: "musculoskeletal", name: "Musculoskeletal", x: 53, y: 52, labelX: 58, labelY: 52, align: "left" },
  { id: "metabolic", name: "Lifestyle / Metabolic", x: 55, y: 64, labelX: 60, labelY: 64, align: "left" },
  { id: "renal", name: "Renal & Urinary", x: 58, y: 75, labelX: 63, labelY: 75, align: "left" },
  // Left side of canopy (pushed inwards to avoid hero text)
  { id: "neurological", name: "Neurological", x: 42, y: 20, labelX: 37, labelY: 20, align: "right" },
  { id: "hormonal", name: "Hormonal & Endocrine", x: 44, y: 28, labelX: 39, labelY: 28, align: "right" },
  { id: "gut", name: "Gut & Digestive Health", x: 46, y: 40, labelX: 41, labelY: 40, align: "right" },
  { id: "respiratory", name: "Respiratory & ENT", x: 47, y: 52, labelX: 42, labelY: 52, align: "right" },
  { id: "skin", name: "Skin & Hair", x: 45, y: 64, labelX: 40, labelY: 64, align: "right" },
  { id: "oral", name: "Oral & Dental Health", x: 42, y: 75, labelX: 37, labelY: 75, align: "right" },
];

// Coordinate configuration for the roots cause nodes
const ROOT_LAYOUTS = {
  "chronic-stress": { x: 30, y: 78, labelX: 30, labelY: 82, align: "center", side: "bottom" },
  "nervous-system": { x: 40, y: 81, labelX: 40, labelY: 85, align: "center", side: "bottom" },
  "emotional": { x: 50, y: 83, labelX: 50, labelY: 87, align: "center", side: "bottom" },
  "sleep": { x: 60, y: 80, labelX: 60, labelY: 84, align: "center", side: "bottom" },
  "trauma": { x: 70, y: 79, labelX: 70, labelY: 83, align: "center", side: "bottom" },
  "nutrition": { x: 65, y: 48, labelX: 68, labelY: 48, align: "left", side: "right" },
  "lifestyle": { x: 65, y: 60, labelX: 68, labelY: 60, align: "left", side: "right" }
};

const getCategoryCoords = (cat, isMobile) => {
  if (!isMobile) {
    return { x: cat.x, y: cat.y, labelX: cat.labelX, labelY: cat.labelY };
  }
  // Mobile: Spaced and adjusted curve around the canopy
  // Top and bottom rows point outward to avoid middle overlap, middle rows point inward to avoid screen edges
  const mobileCoords = {
    // Right column
    "mental":          { x: 67, y: 12 },
    "autoimmune":      { x: 78, y: 23 },
    "cardiovascular":  { x: 80, y: 35 },
    "musculoskeletal": { x: 80, y: 47 },
    "metabolic":       { x: 78, y: 59 },
    "renal":           { x: 67, y: 69 },
    // Left column
    "neurological":    { x: 33, y: 12 },
    "hormonal":        { x: 22, y: 23 },
    "gut":             { x: 20, y: 35 },
    "respiratory":     { x: 20, y: 47 },
    "skin":            { x: 22, y: 59 },
    "oral":            { x: 33, y: 69 },
  };
  const mc = mobileCoords[cat.id];
  if (!mc) return { x: cat.x, y: cat.y, labelX: cat.x, labelY: cat.y };
  return { x: mc.x, y: mc.y, labelX: mc.x, labelY: mc.y };
};

// On mobile: Anchor conditions to root paths (`getXForPath`) and stagger Y coordinates
const getMobileConditionCoords = (idx, total) => {
  const spread = 42; // x from 30 to 72 (width of trunk)
  const x = total <= 1 ? 50 : 30 + (idx / (total - 1)) * spread;
  
  // Y coordinates cascade from 15% to 85%
  const yPad = 15;
  const yRange = 70;
  const y = total <= 1 ? 50 : yPad + (idx / (total - 1)) * yRange;

  return { x, y };
};

const getConditionLabelStyle = (x, y, isMobile) => {
  const align = x < 50 ? 'right' : 'left';
  const desktopTransform = align === 'left' ? 'translate(14px, -50%)' : 'translate(-100%, -50%) translate(-14px, 0)';
  const desktopTextAlign = align === 'left' ? 'left' : 'right';

  if (!isMobile) {
    return {
      left: `${x}%`,
      top: `${y}%`,
      textAlign: desktopTextAlign,
      transform: desktopTransform
    };
  }
  
  // Mobile: Alternate text alignment (left/right) to utilize empty side space
  let transform = 'translate(-50%, 0)';
  let textAlign = 'center';
  let leftPos = `${x}%`;
  
  if (x < 50) {
    // Left side of trunk, label points to the left edge
    transform = 'translate(-100%, -50%) translate(-12px, 0)';
    textAlign = 'right';
  } else {
    // Right side of trunk, label points to the right edge
    transform = 'translate(12px, -50%)';
    textAlign = 'left';
  }
  
  return {
    left: leftPos,
    top: `${y}%`,
    transform: transform,
    '--mobile-transform': transform,
    textAlign: textAlign,
    maxWidth: '120px',
    whiteSpace: 'normal',
    lineHeight: '1.25'
  };
};

const getRootCoords = (id, layout, isMobile) => {
  if (!isMobile) {
    return layout;
  }
  // Mobile: Cluster root causes organically at the bottom of the screen instead of a rigid grid
  // Mobile: spread root nodes across the visible mid-section of the roots image
  // Bottom UI elements occupy ~200px from bottom (insight + controls + CTA)
  // Keep nodes in y:30-62% so they sit clearly in the image, not behind buttons
  const mobilePositions = {
    // Top row — upper root network
    "nutrition":      { x: 18, y: 34 },
    "nervous-system": { x: 50, y: 30 },
    "sleep":          { x: 78, y: 36 },
    // Middle row — main root mass
    "lifestyle":      { x: 26, y: 50 },
    "chronic-stress": { x: 72, y: 52 },
    // Lower row — deep roots (but above bottom UI)
    "emotional":      { x: 38, y: 63 },
    "trauma":         { x: 62, y: 61 },
  };
  const pos = mobilePositions[id];
  if (!pos) return layout;
  return { ...layout, x: pos.x, y: pos.y };
};

const getRootLabelStyle = (id, layout, isMobile) => {
  const isRightSide = layout.side === 'right';
  const systemicIndex = ["chronic-stress", "nervous-system", "emotional", "sleep", "trauma"].indexOf(id);
  const isEven = systemicIndex % 2 === 0;
  
  if (!isMobile) {
    const labelTransform = isRightSide 
      ? 'translate(0%, -50%)' 
      : (isEven ? 'translate(-50%, 15px)' : 'translate(-50%, -48px)');
    return {
      left: isRightSide ? '20px' : '0px',
      transform: labelTransform,
      textAlign: isRightSide ? 'left' : 'center',
    };
  }
  const coords = getRootCoords(id, layout, true);
  const x = coords.x;
  const y = coords.y;
  
  // Bottom-row nodes (y > 55%) show label ABOVE the dot so they don't
  // overlap the fixed bottom UI (insight bar + controls + CTA).
  // Top/middle nodes show label BELOW the dot.
  const below = y <= 55;
  const baseTransform = below
    ? 'translate(-50%, 14px)'
    : 'translate(-50%, calc(-100% - 10px))';

  let transform = baseTransform;
  let textAlign = 'center';
  let left = '50%';
  
  // Far left edge (x <= 22): anchor to left so label doesn't bleed off-screen
  if (x <= 22) {
    transform = below ? 'translate(-8%, 14px)' : 'translate(-8%, calc(-100% - 10px))';
    textAlign = 'left';
    left = '0';
  }
  // Far right edge (x >= 68): anchor to right edge
  else if (x >= 68) {
    transform = below ? 'translate(-92%, 14px)' : 'translate(-92%, calc(-100% - 10px))';
    textAlign = 'right';
    left = '100%';
  }
  
  return {
    left: left,
    transform: transform,
    '--mobile-transform': transform,
    textAlign: textAlign,
    width: '114px',
    maxWidth: '114px',
  };
};

// Helper: generate consistent but organic-looking dog-leg paths for aerial roots
// We compress the bases to 30%-70% so they fit within cropped screens
const getXForPath = (pathIdx, y) => {
  const bases = [30, 37, 44, 51, 58, 65, 72];
  const base = bases[pathIdx % bases.length];
  const wave = 3.5 * Math.sin((y + pathIdx * 30) * Math.PI / 80);
  return base + wave;
};

const getSvgPath = (pathIdx) => {
  let points = [];
  for (let y = 0; y <= 100; y += 5) {
    points.push(`${getXForPath(pathIdx, y).toFixed(1)} ${y}`);
  }
  return `M ${points.join(' L ')}`;
};

// Return contributing bottom roots for a given biochemical/lifestyle root to create interconnected path active states
const getActiveRootsForCondition = (condId) => {
  if (!condId) return [];
  const cond = BanyanData.conditionsById[condId];
  if (!cond) return [];
  
  const directRoot = cond.root;
  const cat = BanyanData.categories.find(c => c.id === cond.categoryId);
  const defaultRoot = cat ? cat.defaultRoot : null;
  
  const active = new Set([directRoot]);
  if (defaultRoot) active.add(defaultRoot);
  
  if (directRoot === 'nutrition' || directRoot === 'lifestyle') {
    active.add('chronic-stress');
    active.add('sleep');
    active.add('nervous-system');
  } else {
    active.add('nervous-system');
    active.add('sleep');
  }
  
  return Array.from(active);
};

// Generates the SVG dog-leg path for the category lines
const getCategoryPath = (cat) => {
  const breakX = cat.align === 'left' ? cat.labelX - 1.5 : cat.labelX + 1.5;
  return `M ${cat.x} ${cat.y} L ${breakX} ${cat.labelY} L ${cat.labelX} ${cat.labelY}`;
};

// Generates the curved SVG path for the roots lines converging at the center (50, 30)
const getRootPath = (id, layout) => {
  const jx = 50;
  const jy = 30;
  if (layout.side === 'bottom') {
    return `M ${layout.x} ${layout.y} C ${layout.x} ${layout.y - 12}, ${jx} ${jy + 15}, ${jx} ${jy}`;
  } else {
    return `M ${jx} ${jy} C ${jx + 12} ${jy}, ${layout.x - 10} ${layout.y}, ${layout.x} ${layout.y}`;
  }
};

export default function TreeScene3D({
  phase,
  selectedCategory,
  selectedCondition,
  selectedRoot,
  rootsReady,
  onCategoryClick,
  onConditionClick,
  onRootClick,
  onCrumbJump
}) {
  const [hoverCategory, setHoverCategory] = useState(null);
  const [hoverCondition, setHoverCondition] = useState(null);
  const [hoverRoot, setHoverRoot] = useState(null);
  const [connectionsGlowing, setConnectionsGlowing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [conditionsRevealed, setConditionsRevealed] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const canopyGroupRef = useRef(null);
  const aerialGroupRef = useRef(null);
  const aerialBgRef = useRef(null);       // bg wrapper — clip-path lives here
  const aerialBgInnerRef = useRef(null);  // actual image div — scale/blur lives here
  const rootsGroupRef = useRef(null);
  const rootsBgRef = useRef(null);
  const stageFrameRef = useRef(null);
  const lastSelectedCategoryRef = useRef(null);
  const isFirstRenderRef = useRef(true);
  const prevPhaseRef = useRef(phase);

  // Initialise the mask start state and the image's pre-reveal state.
  // Top 35% = sky + upper canopy — visually identical to Stage 1, so the
  // crossfade is completely seamless. Roots hang from ~35%→75% in the image.
  useEffect(() => {
    if (aerialBgRef.current) {
      const val = 'linear-gradient(to bottom, black 0%, black 20%, transparent 35%)';
      aerialBgRef.current.style.maskImage = val;
      aerialBgRef.current.style.webkitMaskImage = val;
    }
    if (aerialBgInnerRef.current) {
      // Skip blur/scale on mobile — use simple opacity transitions instead, and explicitly clear any filters
      if (isMobile) {
        gsap.set(aerialBgInnerRef.current, {
          opacity: 0.7,
          scaleX: 1.0,
          scaleY: 1.0,
          filter: 'none',
          transformOrigin: 'center 32%'
        });
      } else {
        gsap.set(aerialBgInnerRef.current, {
          scaleX: 1.04,
          scaleY: 0.92,
          filter: 'blur(3px)',
          transformOrigin: 'center 32%'  // anchor at canopy — where roots emerge
        });
      }
    }
  }, [isMobile]);

  useEffect(() => {
    if (selectedCategory !== null) {
      lastSelectedCategoryRef.current = BanyanData.categories[selectedCategory];
    }
  }, [selectedCategory]);

  // GSAP Transition orchestrator — documentary-style, organic, premium
  // On mobile: shorter durations, no blur filters, reduced zoom for 60fps smoothness
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    const isUnderground = (p) => p === 'roots' || p === 'detail';
    const mobile = isMobile;

    if (!isFirstRenderRef.current) {
      if (isUnderground(prev) && isUnderground(phase)) return;
    } else {
      isFirstRenderRef.current = false;
    }

    const targets = [
      stageFrameRef.current,
      canopyGroupRef.current,
      aerialGroupRef.current,
      rootsGroupRef.current
    ].filter(Boolean);

    gsap.killTweensOf(targets);

    // Reset conditions on every phase change
    setConditionsRevealed(false);

    if (phase === 'canopy') {
      const tl = gsap.timeline();

      // Scale the whole scene back to 1.0
      if (stageFrameRef.current) {
        tl.to(stageFrameRef.current, { scale: 1.0, duration: mobile ? 0.7 : 1.2, ease: 'power2.inOut' }, 0);
      }

      // Aerial fades out gracefully
      tl.to(aerialGroupRef.current, { opacity: 0, duration: mobile ? 0.5 : 0.9, ease: 'power1.inOut', pointerEvents: 'none' }, 0);

      // Stage 1 fades back in (no blur on mobile)
      tl.to(canopyGroupRef.current, {
        opacity: 1,
        filter: mobile ? 'none' : 'blur(0px)',
        duration: mobile ? 0.6 : 1.0,
        ease: 'power1.inOut',
        pointerEvents: 'auto'
      }, 0.1);

      // Restore the Stage 1 interactive overlay to full opacity
      const canopyOverlay = canopyGroupRef.current?.querySelector('.canopy-view-container');
      if (canopyOverlay) {
        tl.to(canopyOverlay, { opacity: 1, duration: mobile ? 0.5 : 0.8, ease: 'power1.inOut', pointerEvents: 'auto' }, 0.1);
      }

      // After aerial is hidden, reset BOTH the mask and the image state
      // so the next reveal starts fresh
      tl.call(() => {
        if (aerialBgRef.current) {
          const val = 'linear-gradient(to bottom, black 0%, black 20%, transparent 35%)';
          aerialBgRef.current.style.maskImage = val;
          aerialBgRef.current.style.webkitMaskImage = val;
        }
        if (aerialBgInnerRef.current) {
          gsap.set(aerialBgInnerRef.current, mobile ? {
            scaleX: 1.0,
            scaleY: 1.0,
            filter: 'none',
            transformOrigin: 'center 32%'
          } : {
            scaleX: 1.04,
            scaleY: 0.92,
            filter: 'blur(3px)',
            transformOrigin: 'center 32%'
          });
        }
        if (!mobile) {
          const paths = aerialGroupRef.current?.querySelectorAll('.aerial-path');
          if (paths && paths.length > 0) {
            gsap.set(paths, { strokeDashoffset: 120, strokeDasharray: 120 });
          }
        }
        const labelGroups = aerialGroupRef.current?.querySelectorAll('.condition-interactive-group');
        if (labelGroups && labelGroups.length > 0) {
          gsap.set(labelGroups, { opacity: 0, y: 0, scale: 1.0, filter: mobile ? 'none' : 'blur(0px)' });
        }
      }, [], mobile ? 0.6 : 1.0);

      // Roots stays hidden
      tl.to(rootsGroupRef.current, { opacity: 0, y: '0vh', duration: mobile ? 0.4 : 0.6, ease: 'power2.inOut', pointerEvents: 'none' }, 0);

    } else if (phase === 'category') {
      const tl = gsap.timeline();

      // ── STEP 1: Gentle intentional zoom into Stage 1 (canopy) ────────────
      // Mobile: subtler zoom (1.04 vs 1.08) and faster
      if (stageFrameRef.current) {
        tl.to(stageFrameRef.current, {
          scale: mobile ? 1.04 : 1.08,
          duration: mobile ? 0.5 : 0.8,
          ease: 'power3.out'
        }, 0);
      }

      // Immediately fade out the Stage 1 category labels/lines overlay
      const canopyOverlay = canopyGroupRef.current?.querySelector('.canopy-view-container');
      if (canopyOverlay) {
        tl.to(canopyOverlay, {
          opacity: 0,
          duration: mobile ? 0.25 : 0.35,
          ease: 'power2.out',
          pointerEvents: 'none'
        }, 0);
      }

      // ── STEP 2: Elegant Reveal of Stage 2 ───
      const revealStart = mobile ? 0.45 : 0.75;
      tl.set(aerialGroupRef.current, { opacity: 1, pointerEvents: 'auto' }, revealStart);

      // Fade out Stage 1 canopy background
      tl.to(canopyGroupRef.current, {
        opacity: 0,
        duration: mobile ? 0.7 : 1.1,
        ease: 'power1.inOut',
        pointerEvents: 'none'
      }, revealStart);

      // Layer A — Feathered Mask Reveal (faster on mobile)
      const maskObj = { pct: 35 };
      tl.fromTo(maskObj,
        { pct: 35 },
        {
          pct: 115,
          duration: mobile ? 1.2 : 2.2,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (aerialBgRef.current) {
              const val = `linear-gradient(to bottom, black 0%, black ${maskObj.pct - 15}%, transparent ${maskObj.pct}%)`;
              aerialBgRef.current.style.maskImage = val;
              aerialBgRef.current.style.webkitMaskImage = val;
            }
          }
        },
        revealStart
      );

      // Layer B — Depth of Field & Physical Stretch (skip blur on mobile)
      if (aerialBgInnerRef.current) {
        if (mobile) {
          // Mobile: simple opacity fade, no blur/scale for GPU performance
          tl.fromTo(aerialBgInnerRef.current,
            { opacity: 0.7 },
            { opacity: 1, duration: 1.0, ease: 'power2.out' },
            revealStart
          );
        } else {
          tl.fromTo(aerialBgInnerRef.current,
            {
              scaleX: 1.04,
              scaleY: 0.88,
              filter: 'blur(4px)',
              transformOrigin: 'center 32%'
            },
            {
              scaleX: 1.0,
              scaleY: 1.0,
              filter: 'blur(0px)',
              duration: 2.4,
              ease: 'power2.out'
            },
            revealStart
          );
        }
      }

      // Layer C — SVG path energy flow (desktop only — hidden on mobile via CSS)
      if (!mobile) {
        const paths = aerialGroupRef.current?.querySelectorAll('.aerial-path');
        if (paths && paths.length > 0) {
          tl.fromTo(paths,
            { strokeDasharray: 120, strokeDashoffset: 120 },
            {
              strokeDashoffset: 0,
              duration: 2.0,
              ease: 'power2.out',
              stagger: 0.1
            },
            revealStart + 0.1
          );
        }
      }

      // Roots panel stays hidden
      tl.to(rootsGroupRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.4 }, 0);

      // ── STEP 3: Disease nodes drop/bounce in after roots are fully revealed
      const conditionRevealTime = mobile ? 1.6 : 2.95;
      tl.call(() => setConditionsRevealed(true), [], conditionRevealTime);

      // Staggered cinematic drop/bounce of labels (lighter on mobile — no blur)
      const labelGroups = aerialGroupRef.current?.querySelectorAll('.condition-interactive-group');
      if (labelGroups && labelGroups.length > 0) {
        tl.fromTo(labelGroups,
          {
            opacity: 0,
            y: mobile ? -12 : -25,
            filter: mobile ? 'none' : 'blur(3px)',
            scale: mobile ? 0.95 : 0.9
          },
          {
            opacity: 1,
            y: 0,
            filter: mobile ? 'none' : 'blur(0px)',
            scale: 1.0,
            duration: mobile ? 0.6 : 1.1,
            ease: mobile ? 'power2.out' : 'back.out(1.2)',
            stagger: mobile ? 0.04 : 0.08
          },
          conditionRevealTime
        );
      }

    } else if (phase === 'roots' || phase === 'detail') {
      const tl = gsap.timeline();

      // Return zoom to normal before descending
      if (stageFrameRef.current) {
        tl.to(stageFrameRef.current, { scale: 1.0, duration: mobile ? 0.6 : 1.0, ease: 'power2.inOut' }, 0);
      }

      // Canopy slides gently upward and fades (no blur on mobile)
      tl.to(canopyGroupRef.current, {
        opacity: 0, y: mobile ? '-6vh' : '-12vh', filter: mobile ? 'none' : 'blur(3px)',
        duration: mobile ? 0.7 : 1.2, ease: 'power2.inOut', pointerEvents: 'none'
      }, 0);

      // Aerial slides up and fades (no blur on mobile)
      tl.to(aerialGroupRef.current, {
        opacity: 0, y: mobile ? '-6vh' : '-12vh', filter: mobile ? 'none' : 'blur(3px)',
        duration: mobile ? 0.6 : 1.0, ease: 'power2.inOut', pointerEvents: 'none'
      }, 0);

      // Roots rises gracefully from below (faster on mobile)
      tl.fromTo(rootsGroupRef.current,
        { opacity: 0, y: mobile ? '10vh' : '18vh' },
        { opacity: 1, y: '0vh', duration: mobile ? 1.0 : 1.8, ease: 'power2.out', pointerEvents: 'auto' },
        mobile ? 0.15 : 0.25
      );
    }

    return () => {
      gsap.killTweensOf(targets);
    };
  }, [phase, isMobile]);

  // Calculate active categories, conditions, and roots
  const activeCatObj = selectedCategory !== null ? BanyanData.categories[selectedCategory] : null;
  const activeCondObj = selectedCondition ? BanyanData.conditionsById[selectedCondition] : null;
  const activeRootIds = getActiveRootsForCondition(selectedCondition);

  // Text content for roots page left column
  const conditionDescription = activeCondObj 
    ? `This condition emerges from a network of systemic imbalances that influence and reinforce each other. Explore the connected root causes below.`
    : '';

  return (
    <div className="stage-frame" ref={stageFrameRef}>
      <div ref={canopyGroupRef} className="group-wrapper canopy-group-wrapper">
        <div 
          className="cinematic-bg-wrapper canopy-bg-wrapper"
          style={{ '--bg-image': `url("${isMobile ? mobileCanopyImg : canopyImg}")` }}
        >
          <div 
            className="cinematic-bg canopy-bg" 
            style={{ backgroundImage: `url("${isMobile ? mobileCanopyImg : canopyImg}")` }} 
          >
            {/* Animated light rays overlay */}
            <div className="sunbeams-overlay" />
          </div>
        </div>
        
        <div className="view-overlay canopy-view-container">
          {/* SVG Connecting Lines */}
          <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            className="canopy-svg"
          >
            {CATEGORIES.map((cat) => {
              const coords = getCategoryCoords(cat, isMobile);
              const isHovered = hoverCategory === cat.id;
              const isActive = activeCatObj && activeCatObj.id === cat.id;
              const isDimmed = hoverCategory !== null && !isHovered;
              
              return (
                <React.Fragment key={cat.id}>
                  {/* Desktop Path */}
                  <path
                    d={getCategoryPath(cat)}
                    stroke={isActive || isHovered ? "var(--gold)" : "rgba(20, 35, 28, 0.38)"}
                    strokeWidth={isActive || isHovered ? 1.5 : 0.9}
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                    className="canopy-path desktop-path"
                    style={{ 
                       opacity: isDimmed ? 0.3 : 1,
                       transition: 'stroke 0.4s var(--ease), stroke-width 0.4s var(--ease), opacity 0.4s var(--ease)' 
                    }}
                  />
                  {/* Mobile Path */}
                  <path
                    d={`M ${coords.x} ${coords.y} L ${coords.x} 48 L ${coords.x < 50 ? 48 : 52} 48`}
                    stroke={isActive || isHovered ? "var(--gold)" : "rgba(20, 35, 28, 0.38)"}
                    strokeWidth={isActive || isHovered ? 1.5 : 0.9}
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                    className="canopy-path mobile-path"
                    style={{ 
                       opacity: isDimmed ? 0.3 : 1,
                       transition: 'stroke 0.4s var(--ease), stroke-width 0.4s var(--ease), opacity 0.4s var(--ease)' 
                     }}
                  />
                </React.Fragment>
              );
            })}
          </svg>
 
          {/* Hotspots & Labels */}
          {CATEGORIES.map((cat, idx) => {
            const coords = getCategoryCoords(cat, isMobile);
            const isHovered = hoverCategory === cat.id;
            const isActive = activeCatObj && activeCatObj.id === cat.id;
            const isDimmed = hoverCategory !== null && !isHovered;
 
            // Resolve actual index in BanyanData.categories to avoid mismatches
            const actualIdx = BanyanData.categories.findIndex(c => c.id === cat.id);
            const resolvedClickIdx = actualIdx !== -1 ? actualIdx : idx;

            // Determine if the label should point outward (top/bottom rows) or inward (middle rows)
            const isTopOrBottom = ['mental', 'neurological', 'renal', 'oral'].includes(cat.id);
            
            let mobileTransform = '';
            let mobileTextAlign = '';
            
            if (isTopOrBottom) {
              // Points OUTWARD:
              //   left-column (align='right')  → points LEFT (outward)  → translate(calc(-100% - 14px), -50%)
              //   right-column (align='left')  → points RIGHT (outward) → translate(14px, -50%)
              mobileTransform = cat.align === 'right'
                ? 'translate(calc(-100% - 14px), -50%)'
                : 'translate(14px, -50%)';
              mobileTextAlign = cat.align === 'right' ? 'right' : 'left';
            } else {
              // Points INWARD:
              //   left-column (align='right')  → points RIGHT (inward)  → translate(14px, -50%)
              //   right-column (align='left')  → points LEFT (inward)   → translate(calc(-100% - 14px), -50%)
              mobileTransform = cat.align === 'right'
                ? 'translate(14px, -50%)'
                : 'translate(calc(-100% - 14px), -50%)';
              mobileTextAlign = cat.align === 'right' ? 'left' : 'right';
            }

            return (
              <div 
                key={cat.id}
                className={`category-interactive-group ${isDimmed ? 'is-dimmed' : ''}`}
                style={{ transition: 'opacity 0.4s var(--ease)' }}
              >
                {/* Hotspot Dot */}
                <button
                  type="button"
                  className={`category-hotspot ${isActive ? 'is-active' : ''} ${isHovered ? 'is-hovered' : ''}`}
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  onClick={() => onCategoryClick(resolvedClickIdx)}
                  onMouseEnter={() => { setHoverCategory(cat.id); playHoverSound(); }}
                  onMouseLeave={() => setHoverCategory(null)}
                  data-hoverable="true"
                  aria-label={`Select category ${cat.name}`}
                />
 
                {/* Text Label */}
                <button
                  type="button"
                  className={`category-label ${isActive ? 'is-active' : ''} ${isHovered ? 'is-hovered' : ''}`}
                  style={{
                    '--desktop-x': `${cat.labelX}%`,
                    '--desktop-y': `${cat.labelY}%`,
                    '--mobile-x': `${coords.x}%`,
                    '--mobile-y': `${coords.y}%`,
                    '--mobile-transform': mobileTransform,
                    '--mobile-text-align': mobileTextAlign,
                    '--desktop-transform': cat.align === 'right' ? 'translate(calc(-100% - 12px), -50%)' : 'translate(12px, -50%)',
                    '--desktop-text-align': cat.align === 'right' ? 'right' : 'left',
                    left: 'var(--desktop-x)',
                    top: 'var(--desktop-y)',
                    textAlign: 'var(--desktop-text-align)',
                    transform: 'var(--desktop-transform)'
                  }}
                  onClick={() => onCategoryClick(resolvedClickIdx)}
                  onMouseEnter={() => { setHoverCategory(cat.id); playHoverSound(); }}
                  onMouseLeave={() => setHoverCategory(null)}
                  data-hoverable="true"
                >
                  {cat.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* aerialGroupRef: controls overall presence (opacity)
          aerialBgRef:   controls the clip-path reveal (root descent boundary)
          aerialBgInnerRef: controls depth-of-field (scale + blur focus pull)
          The interactive overlay (.aerial-view-container) is NOT clipped — it
          receives conditions via conditionsRevealed + staggered CSS animation. */}
      <div ref={aerialGroupRef} className="group-wrapper aerial-group-wrapper">
        <div 
          ref={aerialBgRef} 
          className="cinematic-bg-wrapper aerial-bg-wrapper"
          style={{ '--bg-image': `url("${isMobile ? mobileAerialImg : aerialImg}")` }}
        >
          <div 
            ref={aerialBgInnerRef}
            className="cinematic-bg aerial-bg" 
            style={{ backgroundImage: `url("${isMobile ? mobileAerialImg : aerialImg}")` }} 
          />
        </div>
        
        <div className="view-overlay aerial-view-container">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="aerial-svg">
            <defs>
              <filter id="aerial-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {Array.from({ length: 7 }).map((_, i) => {
              const conditionIndex = activeCatObj?.conditions?.findIndex(c => c.id === hoverCondition) ?? -1;
              const hoveredPathIdx = conditionIndex !== -1 ? conditionIndex % 7 : null;
              
              const selectedConditionIndex = activeCatObj?.conditions?.findIndex(c => c.id === selectedCondition) ?? -1;
              const selectedPathIdx = selectedConditionIndex !== -1 ? selectedConditionIndex % 7 : null;

              const isPathActive = (selectedPathIdx === i) || (selectedCondition == null && hoveredPathIdx === i);
              const isPathDimmed = (selectedCondition != null && selectedPathIdx !== i) || (selectedCondition == null && hoverCondition != null && hoveredPathIdx !== i);

              return (
                <g key={`aerial-path-group-${i}`}>
                  <path
                    d={getSvgPath(i)}
                    stroke={isPathActive ? "var(--gold)" : "rgba(255, 255, 255, 0.32)"}
                    strokeWidth={isPathActive ? 2.2 : 1.1}
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                    className={`aerial-path ${isPathActive ? 'is-active' : ''}`}
                    style={{
                      opacity: isPathActive ? 0.95 : (isPathDimmed ? 0.18 : 0.65),
                      filter: isPathActive ? 'url(#aerial-glow)' : 'none',
                      transition: 'stroke 0.4s var(--ease), stroke-width 0.4s var(--ease), opacity 0.4s var(--ease)'
                    }}
                  />
                  {isPathActive && (
                    <path
                      d={getSvgPath(i)}
                      className="aerial-path-cue"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {activeCatObj?.conditions?.map((cond, idx) => {
            const total = activeCatObj.conditions.length;
            // Desktop: use organic path-based positions
            const pathIdx = idx % 7;
            const count = Math.ceil(total / 7);
            const k = Math.floor(idx / 7);
            const waveY = (pathIdx % 2 === 0) ? -8 : 8;
            const desktopY = 20 + 60 * (k + 0.5) / count + waveY;
            const desktopX = getXForPath(pathIdx, desktopY);
            
            // Mobile: use evenly spaced grid
            const mobileCoords = getMobileConditionCoords(idx, total);
            const x = isMobile ? mobileCoords.x : desktopX;
            const y = isMobile ? mobileCoords.y : desktopY;

            const isHovered = hoverCondition === cond.id;
            const isActive = selectedCondition === cond.id;
            const isDimmed = (selectedCondition != null && !isActive) || (selectedCondition == null && hoverCondition != null && !isHovered);

            return (
              <div
                key={cond.id}
                className={`condition-interactive-group ${isDimmed ? 'is-dimmed' : ''}`}
                style={{
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  pointerEvents: 'none',
                  transition: (isDimmed || hoverCondition != null || selectedCondition != null) ? 'opacity 0.4s var(--ease)' : undefined,
                }}
              >
                <button
                  type="button"
                  className={`condition-hotspot ${isActive ? 'is-active' : ''} ${isHovered ? 'is-hovered' : ''}`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => onConditionClick(cond.id)}
                  onMouseEnter={() => { setHoverCondition(cond.id); playHoverSound(); }}
                  onMouseLeave={() => setHoverCondition(null)}
                  data-hoverable="true"
                  aria-label={`Trace condition ${cond.name}`}
                />

                <button
                  type="button"
                  className={`condition-label ${isActive ? 'is-active' : ''} ${isHovered ? 'is-hovered' : ''}`}
                  style={getConditionLabelStyle(x, y, isMobile)}
                  onClick={() => onConditionClick(cond.id)}
                  onMouseEnter={() => { setHoverCondition(cond.id); playHoverSound(); }}
                  onMouseLeave={() => setHoverCondition(null)}
                  data-hoverable="true"
                >
                  {cond.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Roots / Below-Ground View Group ── */}
      <div 
        ref={rootsGroupRef} 
        className="group-wrapper roots-group-wrapper"
      >
        <div 
          ref={rootsBgRef} 
          className="cinematic-bg-wrapper roots-bg-wrapper"
          style={{ '--bg-image': `url("${rootsImg}")` }}
        >
          <div 
            className="cinematic-bg roots-bg" 
            style={{ backgroundImage: `url("${rootsImg}")` }} 
          />
        </div>

        <div className="view-overlay roots-view-container">
          <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            className="roots-svg"
          >
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {Object.entries(ROOT_LAYOUTS).map(([id, layout]) => {
              const isActive = activeRootIds.includes(id) || connectionsGlowing;
              const coords = getRootCoords(id, layout, isMobile);
              const pathD = getRootPath(id, coords);
              
              return (
                <g key={`group-${id}`}>
                  <path
                    d={pathD}
                    stroke={isActive ? "var(--gold)" : "rgba(122, 90, 62, 0.45)"}
                    strokeWidth={isActive ? 1.8 : 0.95}
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                    style={{ 
                      opacity: isActive ? 0.85 : 0.42,
                      filter: isActive ? 'url(#glow)' : 'none',
                      transition: 'stroke 0.5s ease, stroke-width 0.5s ease, opacity 0.5s ease' 
                    }}
                  />

                  {isActive && (
                    <path
                      d={pathD}
                      stroke="#fff8e7"
                      strokeWidth={1.2}
                      fill="none"
                      vectorEffect="non-scaling-stroke"
                      className="roots-pulse-path"
                      style={{ 
                        filter: 'url(#glow)',
                        strokeDasharray: '4, 16',
                        animation: 'rootsDash 4s linear infinite'
                      }}
                    />
                  )}
                </g>
              );
            })}
          </svg>



          {/* Root cause nodes overlay */}
          {Object.entries(ROOT_LAYOUTS).map(([id, layout]) => {
            const rc = BanyanData.rootCauses[id];
            if (!rc) return null;
            
            const coords = getRootCoords(id, layout, isMobile);
            const isDirect = activeCondObj?.root === id;
            const isActive = activeRootIds.includes(id);
            const isHovered = hoverRoot === id;
            const isDimmed = hoverRoot !== null && !isHovered;
            
            const isRightSide = layout.side === 'right';
            const labelStyle = getRootLabelStyle(id, layout, isMobile);
            
            return (
              <div
                key={id}
                className={`root-node-group ${isActive ? 'is-active' : ''} ${isDimmed ? 'is-dimmed' : ''}`}
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                  transform: 'translate(-50%, -50%)',
                  opacity: rootsReady ? 1 : 0,
                  pointerEvents: rootsReady ? 'auto' : 'none',
                  transition: 'opacity 0.4s var(--ease)'
                }}
              >
                <button
                  type="button"
                  className={`root-node-dot ${isDirect ? 'is-direct' : ''} ${isHovered ? 'is-hovered' : ''}`}
                  onClick={() => onRootClick(id)}
                  onMouseEnter={() => { setHoverRoot(id); playHoverSound(); }}
                  onMouseLeave={() => setHoverRoot(null)}
                  data-hoverable="true"
                  aria-label={`Inspect root cause: ${rc.name}`}
                />

                <div
                  className={`root-node-label-box ${layout.side}`}
                  style={labelStyle}
                >
                  <div className="root-node-title-row">
                    {isDirect && (
                      <svg className="root-sparkle" width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" fill="#ffdf9e" />
                      </svg>
                    )}
                    <span className="root-node-name" onClick={() => onRootClick(id)}>
                      {rc.name}
                    </span>
                  </div>
                  <span className="root-node-subtitle">{rc.subtitle}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel: Shown only when a root node is clicked */}
        <AnimatePresence>
          {rootsReady && phase === 'detail' && selectedRoot && (
            <motion.div 
              key="roots-detail-panel"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="roots-left-panel"
            >
              <button 
                className="roots-panel-close" 
                onClick={() => onCrumbJump('roots')}
                data-hoverable="true"
                aria-label="Close details"
              >
                ✕
              </button>

              <button 
                type="button"
                className="roots-back-link" 
                onClick={() => onCrumbJump('category')}
                onMouseEnter={playHoverSound}
                data-hoverable="true"
              >
                <span>←</span> Back to {activeCatObj?.name || 'Tree'}
              </button>
              
              <div className="roots-detail-content">
                <div className="panel-eyebrow">
                  <span>Root cause · {BanyanData.rootCauses[selectedRoot].number}</span>
                </div>
                <h3 className="panel-title">{BanyanData.rootCauses[selectedRoot].name}</h3>
                <p className="panel-insight">{BanyanData.rootCauses[selectedRoot].insight}</p>
                <p className="panel-body">{BanyanData.rootCauses[selectedRoot].body}</p>
                <dl className="panel-meta">
                  {Object.entries(BanyanData.rootCauses[selectedRoot].meta).map(([k, v]) => (
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
                  <button className="btn btn--ghost" data-hoverable="true" onClick={() => onCrumbJump('roots')}>
                    Continue exploring
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Floating Controls: Shown on roots overview */}
          {rootsReady && phase === 'roots' && (
            <motion.div 
              key="roots-floating-controls"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="roots-floating-controls"
            >
              <button 
                type="button"
                className="roots-back-link" 
                onClick={() => onCrumbJump('category')}
                onMouseEnter={playHoverSound}
                data-hoverable="true"
              >
                <span>←</span> Back to {activeCatObj?.name || 'Tree'}
              </button>
              
              <button 
                type="button"
                className={`roots-explore-btn ${connectionsGlowing ? 'is-active' : ''}`}
                onClick={() => {
                  setConnectionsGlowing(prev => !prev);
                  playHoverSound();
                }}
                onMouseEnter={playHoverSound}
                data-hoverable="true"
              >
                <span className="btn-glow" />
                {connectionsGlowing ? 'Hide System Network' : 'Explore the Connections'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
