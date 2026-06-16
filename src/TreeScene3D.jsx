import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { BanyanData } from './data.js';
import { playHoverSound } from './sound.js';
import gsap from 'gsap';
import canopyImg from './assets/Final hero.jpg';
import aerialImg from './assets/Generated Image June 15, 2026 - 1_36PM.jpg';
import rootsImg from './assets/roots hd.jpg';

// Coordinates calibrated to 'Final hero.jpg' — tree is centered (~50% x).
// Left branch: 20-45%x, Right branch: 55-80%x. Canopy top: ~10%y, trunk: ~70%y.
// Labels on left-branch nodes point LEFT (align:'left'), right-branch nodes point RIGHT.
const CATEGORIES = [
  // Right side of canopy (pushed inwards, scattered around the branch line for a more organic feel)
  { id: "mental", name: "Mental Health", x: 63, y: 13, labelX: 69, labelY: 13, align: "left" },
  { id: "autoimmune", name: "Autoimmune\u00A0& Inflammatory", mobileName: "Autoimmune", x: 49, y: 26, labelX: 55, labelY: 26, align: "left" },
  { id: "cardiovascular", name: "Cardiovascular", x: 64, y: 34, labelX: 70, labelY: 34, align: "left" },
  { id: "musculoskeletal", name: "Musculoskeletal", x: 60, y: 45, labelX: 66, labelY: 45, align: "left" },
  { id: "metabolic", name: "Lifestyle\u00A0/ Metabolic", mobileName: "Metabolic", x: 52, y: 58, labelX: 58, labelY: 58, align: "left" },
  { id: "renal", name: "Renal\u00A0& Urinary", mobileName: "Renal", x: 50, y: 80, labelX: 56, labelY: 80, align: "left" },
  // Left side of canopy (pushed inwards to avoid hero text, scattered for an organic feel)
  { id: "neurological", name: "Neurological", x: 37, y: 24, labelX: 37, labelY: 24, align: "right" },
  { id: "hormonal", name: "Hormonal\u00A0& Endocrine", mobileName: "Hormonal", x: 48, y: 15, labelX: 48, labelY: 15, align: "right" },
  { id: "gut", name: "Gut\u00A0& Digestive Health", mobileName: "Gut Health", x: 38, y: 38, labelX: 38, labelY: 38, align: "right" },
  { id: "respiratory", name: "Respiratory\u00A0& ENT", mobileName: "Respiratory", x: 40, y: 50, labelX: 40, labelY: 50, align: "right" },
  { id: "skin", name: "Skin\u00A0& Hair", x: 46, y: 63, labelX: 46, labelY: 63, align: "right" },
  { id: "oral", name: "Oral\u00A0& Dental Health", mobileName: "Oral Health", x: 44, y: 75, labelX: 44, labelY: 75, align: "right" },
];

// Coordinate configuration for the roots cause nodes
const ROOT_LAYOUTS = {
  "gut-dysfunction": { x: 25, y: 78, labelX: 25, labelY: 82, align: "center", side: "bottom" },
  "environmental-toxins": { x: 35, y: 81, labelX: 35, labelY: 85, align: "center", side: "bottom" },
  "nutrients-deficiency": { x: 45, y: 83, labelX: 45, labelY: 87, align: "center", side: "bottom" },
  "hormonal-imbalance": { x: 55, y: 83, labelX: 55, labelY: 87, align: "center", side: "bottom" },
  "mitochondrial-dysfunction": { x: 65, y: 81, labelX: 65, labelY: 85, align: "center", side: "bottom" },
  "dosha-imbalance": { x: 75, y: 78, labelX: 75, labelY: 82, align: "center", side: "bottom" },
  "hidden-infections": { x: 65, y: 48, labelX: 68, labelY: 48, align: "left", side: "right" },
  "chronic-stress": { x: 65, y: 60, labelX: 68, labelY: 60, align: "left", side: "right" },
  "poor-sleep": { x: 35, y: 48, labelX: 32, labelY: 48, align: "right", side: "left" },
  "inflammation": { x: 35, y: 60, labelX: 32, labelY: 60, align: "right", side: "left" },
  "poor-detoxification": { x: 30, y: 70, labelX: 27, labelY: 70, align: "right", side: "left" }
};

const getCategoryCoords = (cat, isMobile) => {
  if (!isMobile) {
    return { x: cat.x, y: cat.y, labelX: cat.labelX, labelY: cat.labelY };
  }
  // Mobile: Spaced and adjusted curve around the canopy
  // Top and bottom rows point outward to avoid middle overlap, middle rows point inward to avoid screen edges
  const mobileCoords = {
    // Right column - scattered around the branch line for an organic feel
    "mental":          { x: 68, y: 26 },
    "autoimmune":      { x: 60, y: 48 },
    "cardiovascular":  { x: 74, y: 38 },
    "musculoskeletal": { x: 62, y: 66 },
    "metabolic":       { x: 70, y: 56 },
    "renal":           { x: 55, y: 75 },
    // Left column - scattered around the branch line for an organic feel
    "neurological":    { x: 32, y: 28 },
    "hormonal":        { x: 40, y: 40 },
    "gut":             { x: 30, y: 52 },
    "respiratory":     { x: 38, y: 64 },
    "skin":            { x: 30, y: 58 },
    "oral":            { x: 44, y: 75 },
  };
  const mc = mobileCoords[cat.id];
  if (!mc) return { x: cat.x, y: cat.y, labelX: cat.x, labelY: cat.y };
  return { x: mc.x, y: mc.y, labelX: mc.x, labelY: mc.y };
};

// On mobile: two balanced columns flanking the trunk. Pills are centred on these
// anchors (nodes removed), so the columns sit well clear of the centre.
const getMobileConditionCoords = (idx, total) => {
  const x = total <= 1 ? 50 : (idx % 2 === 0 ? 26 : 74);

  // Y coordinates cascade from 32% to 75% to avoid top header and bottom UI
  const yPad = 32;
  const yRange = 43;
  const y = total <= 1 ? 50 : yPad + (idx / (total - 1)) * yRange;

  return { x, y };
};

const getConditionLabelStyle = (x, y, isMobile) => {
  // Circular nodes removed — each pill is centered directly on its anchor point
  // with its text centre-aligned for a cleaner, more premium balance.
  if (!isMobile) {
    return {
      left: `${x}%`,
      top: `${y}%`,
      textAlign: 'center',
      transform: 'translate(-50%, -50%)'
    };
  }

  const transform = 'translate(-50%, -50%)';
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform,
    '--mobile-transform': transform,
    textAlign: 'center',
    maxWidth: '120px',
    whiteSpace: 'normal',
    lineHeight: '1.25'
  };
};

const getRootCoords = (id, layout, isMobile) => {
  if (!isMobile) {
    return layout;
  }
  // Mobile: 6 on left, 5 on right side-by-side layout
  // Nodes placed at x: 12 and x: 88, with labels extending inwards
  const mobilePositions = {
    // Left Column (pills are centred on the anchor, so columns sit inset from the edge)
    "gut-dysfunction":      { x: 27, y: 35 },
    "poor-sleep":           { x: 27, y: 43 },
    "hidden-infections":    { x: 27, y: 51 },
    "mitochondrial-dysfunction": { x: 27, y: 59 },
    "dosha-imbalance":      { x: 27, y: 67 },
    "poor-detoxification":  { x: 27, y: 75 },

    // Right Column
    "hormonal-imbalance":   { x: 73, y: 38 },
    "environmental-toxins": { x: 73, y: 47 },
    "nutrients-deficiency": { x: 73, y: 56 },
    "chronic-stress":       { x: 73, y: 65 },
    "inflammation":         { x: 73, y: 74 },
  };
  const pos = mobilePositions[id];
  if (!pos) return layout;
  return { ...layout, x: pos.x, y: pos.y };
};

const getRootLabelStyle = (id, layout, isMobile) => {
  // Circular nodes removed — each root pill is centred directly on its anchor
  // point with centre-aligned text, for a balanced, premium layout.
  if (!isMobile) {
    return {
      left: '0px',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
    };
  }

  return {
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    width: '120px',
    maxWidth: '120px',
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
  
  active.add('chronic-stress');
  active.add('poor-sleep');
  active.add('inflammation');
  
  return Array.from(active);
};

// Generates the SVG dog-leg path for the category lines
const getCategoryPath = (cat) => {
  const breakX = cat.align === 'left' ? cat.labelX - 1.5 : cat.labelX + 1.5;
  return `M ${cat.x} ${cat.y} L ${breakX} ${cat.labelY} L ${cat.labelX} ${cat.labelY}`;
};

// Generates the curved SVG path for the roots lines converging at the center (50, 30)
const getRootPath = (id, layout, isMobile) => {
  const jx = 50;
  const jy = 30;
  if (isMobile) {
    if (id === 'hormonal-imbalance') {
      return `M 50 30 L 50 33`; // Ground the center node slightly
    }
    const { x, y } = layout;
    // Organic bezier curve extending horizontally from node, converging vertically at (50, 30)
    const cp1x = x + (jx - x) * 0.5;
    const cp1y = y;
    const cp2x = jx;
    const cp2y = jy + (y - jy) * 0.5;
    return `M ${x} ${y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${jx} ${jy}`;
  }
  
  if (layout.side === 'bottom') {
    return `M ${layout.x} ${layout.y} C ${layout.x} ${layout.y - 12}, ${jx} ${jy + 15}, ${jx} ${jy}`;
  } else if (layout.side === 'right') {
    return `M ${jx} ${jy} C ${jx + 12} ${jy}, ${layout.x - 10} ${layout.y}, ${layout.x} ${layout.y}`;
  } else if (layout.side === 'left') {
    return `M ${jx} ${jy} C ${jx - 12} ${jy}, ${layout.x + 10} ${layout.y}, ${layout.x} ${layout.y}`;
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
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 600 : false);
  const [conditionsRevealed, setConditionsRevealed] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const canopyGroupRef = useRef(null);
  const canopyGlowRef = useRef(null);
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
          filter: 'none',
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
      canopyGlowRef.current,
      aerialGroupRef.current,
      rootsGroupRef.current
    ].filter(Boolean);

    gsap.killTweensOf(targets);

    // Reset conditions on every phase change
    setConditionsRevealed(false);

    if (phase === 'canopy') {
      const tl = gsap.timeline();

      // Calculate the coordinate of the last selected category to shrink the mask back to it
      let selectedCoords = { x: 50, y: 32 };
      if (lastSelectedCategoryRef.current) {
        const catConfig = CATEGORIES.find(c => c.id === lastSelectedCategoryRef.current.id);
        if (catConfig) {
          selectedCoords = getCategoryCoords(catConfig, mobile);
        }
      }

      // Scale the whole scene back to 1.0
      if (stageFrameRef.current) {
        tl.to(stageFrameRef.current, { scale: 1.0, duration: mobile ? 0.7 : 1.2, ease: 'power2.inOut' }, 0);
      }

      // Fade out the canopy light shift glow
      if (canopyGlowRef.current) {
        tl.to(canopyGlowRef.current, {
          opacity: 0,
          duration: mobile ? 0.6 : 0.9,
          ease: 'power2.inOut'
        }, 0);
      }

      // Fade out Stage 2 wrapper and slide down
      tl.to(aerialGroupRef.current, { 
        opacity: 0, 
        y: mobile ? '12vh' : '20vh',
        duration: mobile ? 0.7 : 1.1, 
        ease: 'power2.inOut', 
        pointerEvents: 'none' 
      }, 0);

      // Stage 1 fades in
      tl.to(canopyGroupRef.current, {
        opacity: 1,
        y: '0vh',
        filter: 'none',
        duration: mobile ? 0.8 : 1.2,
        ease: 'power1.inOut',
        pointerEvents: 'auto'
      }, 0.1);

      // Restore Stage 1 category labels to full opacity and reset their individual opacities/dimmed states
      const categoryGroups = canopyGroupRef.current?.querySelectorAll('.category-interactive-group');
      if (categoryGroups && categoryGroups.length > 0) {
        tl.to(categoryGroups, {
          opacity: 1,
          duration: mobile ? 0.5 : 0.8,
          ease: 'power1.inOut'
        }, 0.15);
      }

      const canopyOverlay = canopyGroupRef.current?.querySelector('.canopy-view-container');
      if (canopyOverlay) {
        tl.to(canopyOverlay, { opacity: 1, duration: mobile ? 0.5 : 0.8, ease: 'power1.inOut', pointerEvents: 'auto' }, 0.15);
      }

      // After aerial is hidden, reset the image state
      tl.call(() => {
        if (aerialBgInnerRef.current) {
          gsap.set(aerialBgInnerRef.current, mobile ? {
            scaleX: 1.0,
            scaleY: 1.0,
            opacity: 0.6,
            filter: 'none',
            transformOrigin: 'center 25%'
          } : {
            scaleX: 1.03,
            scaleY: 0.94,
            filter: 'none',
            transformOrigin: 'center 25%'
          });
        }
        const labelGroups = aerialGroupRef.current?.querySelectorAll('.condition-interactive-group');
        if (labelGroups && labelGroups.length > 0) {
          gsap.set(labelGroups, { opacity: 0, y: mobile ? 8 : 15, scale: 1.0, filter: 'none' });
        }
      }, [], mobile ? 0.8 : 1.2);

      // Roots stays hidden
      tl.to(rootsGroupRef.current, { opacity: 0, y: '0vh', duration: mobile ? 0.4 : 0.6, ease: 'power2.inOut', pointerEvents: 'none' }, 0);

    } else if (phase === 'category') {
      const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });

      // Calculate the category coordinates to center the radial reveal
      let selectedCoords = { x: 50, y: 32 };
      if (lastSelectedCategoryRef.current) {
        const catConfig = CATEGORIES.find(c => c.id === lastSelectedCategoryRef.current.id);
        if (catConfig) {
          selectedCoords = getCategoryCoords(catConfig, mobile);
        }
      }

      // Ensure canopy group is positioned at center and visible at start IF coming from canopy
      // If coming from roots, it's already above viewport, so we just set it up.
      tl.set(canopyGroupRef.current, {
        opacity: prev === 'canopy' ? 1 : 0,
        y: prev === 'canopy' ? '0vh' : (mobile ? '-30vh' : '-50vh'),
        filter: 'none',
        pointerEvents: 'none' // Disable clicks immediately
      }, 0);
      
      // Cinematic Pan: Slide the entire canopy up as we pan down to the roots (or down if coming from roots)
      const rootsRevealStart = 0.3;
      tl.to(canopyGroupRef.current, {
        opacity: 0,
        y: mobile ? '-15vh' : '-25vh',
        duration: mobile ? 1.0 : 1.6,
        ease: 'power2.inOut'
      }, rootsRevealStart);

      // Dim other categories first
      const categoryGroups = canopyGroupRef.current?.querySelectorAll('.category-interactive-group');
      if (categoryGroups && categoryGroups.length > 0) {
        categoryGroups.forEach(group => {
          const catId = group.getAttribute('data-cat-id');
          const isActive = lastSelectedCategoryRef.current && lastSelectedCategoryRef.current.id === catId;
          if (isActive) {
            // Active category stays high contrast
            tl.to(group, {
              opacity: 1,
              duration: 0.1
            }, 0);
            // Fade out after 800ms
            tl.to(group, {
              opacity: 0,
              duration: mobile ? 0.35 : 0.5,
              ease: 'power2.inOut'
            }, mobile ? 0.45 : 0.8);
          } else {
            // Other categories dim to 0.12 over 400ms
            tl.to(group, {
              opacity: 0.12,
              duration: mobile ? 0.3 : 0.4,
              ease: 'power1.out'
            }, 0);
            // Then fade out
            tl.to(group, {
              opacity: 0,
              duration: mobile ? 0.35 : 0.5,
              ease: 'power2.inOut'
            }, mobile ? 0.35 : 0.65);
          }
        });
      }

      // Fade out the SVG connecting lines immediately
      const canopySvg = canopyGroupRef.current?.querySelector('.canopy-svg');
      if (canopySvg) {
        tl.to(canopySvg, {
          opacity: 0,
          duration: mobile ? 0.3 : 0.4,
          ease: 'power1.out'
        }, 0);
      }

      // Slow Zoom: Scale stage frame smoothly from 1.0 to 1.06 over 950ms
      if (stageFrameRef.current) {
        tl.to(stageFrameRef.current, {
          scale: 1.06,
          duration: 0.95,
          ease: 'power2.out'
        }, 0);
      }

      // Canopy Light Shift: Fade in warm golden atmosphere glow over 950ms
      if (canopyGlowRef.current) {
        tl.to(canopyGlowRef.current, {
          opacity: 0.9,
          duration: 0.95,
          ease: 'power2.out'
        }, 0);
      }

      const comingFromRoots = prev === 'roots' || prev === 'detail';

      // Prepare Stage 2 starting lower down (or higher up if coming from roots)
      tl.set(aerialGroupRef.current, {
        opacity: 0,
        y: comingFromRoots ? (mobile ? '-15vh' : '-25vh') : (mobile ? '15vh' : '25vh'),
        filter: 'none',
        pointerEvents: 'none'
      }, 0);

      // Start the reveal
      const rootsRevealDuration = mobile ? 1.1 : 1.8;

      tl.to(aerialGroupRef.current, {
        opacity: 1,
        y: '0vh',
        duration: rootsRevealDuration,
        ease: 'power2.inOut',
        pointerEvents: 'auto'
      }, rootsRevealStart);

      // Depth of field: background comes into focus
      if (aerialBgInnerRef.current) {
        if (mobile) {
          tl.fromTo(aerialBgInnerRef.current,
            { opacity: 0.7 },
            { opacity: 1, duration: rootsRevealDuration, ease: 'sine.out' },
            rootsRevealStart
          );
        } else {
          tl.fromTo(aerialBgInnerRef.current,
            {
              scaleX: 1.04,
              scaleY: 0.92,
              filter: 'none',
              transformOrigin: 'center 32%'
            },
            {
              scaleX: 1.0,
              scaleY: 1.0,
              filter: 'none',
              duration: rootsRevealDuration + 0.2,
              ease: 'sine.out'
            },
            rootsRevealStart
          );
        }
      }

      // Roots panel stays hidden
      tl.to(rootsGroupRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.4 }, 0);

      // Once radial mask is fully open, pause briefly, then reveal disease labels
      const pauseDuration = mobile ? 0.50 : 0.65;
      const conditionRevealTime = rootsRevealStart + rootsRevealDuration + pauseDuration;

      tl.call(() => setConditionsRevealed(true), [], conditionRevealTime);

      const labelGroups = aerialGroupRef.current?.querySelectorAll('.condition-interactive-group');
      if (labelGroups && labelGroups.length > 0) {
        tl.fromTo(labelGroups,
          {
            opacity: 0,
            y: mobile ? 8 : 12,
            filter: 'none',
            scale: 1.0
          },
          {
            opacity: 1,
            y: 0,
            filter: 'none',
            scale: 1.0,
            duration: mobile ? 0.8 : 1.2,
            ease: 'power2.out',
            stagger: 0.08
          },
          conditionRevealTime
        );
      }

      // Set canopy opacity to 0 and pointerEvents to none after transition is fully done
      tl.set(canopyGroupRef.current, { opacity: 0, pointerEvents: 'none' }, conditionRevealTime + 0.5);

    } else if (phase === 'roots' || phase === 'detail') {
      const tl = gsap.timeline();

      // Return zoom to normal before descending
      if (stageFrameRef.current) {
        tl.to(stageFrameRef.current, { scale: 1.0, duration: mobile ? 0.6 : 1.0, ease: 'power2.inOut' }, 0);
      }

      // Canopy slides further upward out of view
      tl.to(canopyGroupRef.current, {
        opacity: 0, y: mobile ? '-25vh' : '-40vh', filter: 'none',
        duration: mobile ? 0.7 : 1.2, ease: 'power2.inOut', pointerEvents: 'none'
      }, 0);

      // Aerial slides up out of view
      tl.to(aerialGroupRef.current, {
        opacity: 0, y: mobile ? '-15vh' : '-25vh', filter: 'none',
        duration: mobile ? 0.6 : 1.0, ease: 'power2.inOut', pointerEvents: 'none'
      }, 0);

      // Roots rises gracefully from below
      tl.fromTo(rootsGroupRef.current,
        { opacity: 0, y: mobile ? '15vh' : '25vh' },
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
          style={{ '--bg-image': `url("${canopyImg}")` }}
        >
          <div 
            className="cinematic-bg canopy-bg" 
            style={{ backgroundImage: `url("${canopyImg}")` }} 
          >
            {/* Animated light rays overlay */}
            <div className="sunbeams-overlay" />
          </div>
          <div className="canopy-atmosphere-glow" ref={canopyGlowRef} />
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
                  {!isMobile && (
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
                  )}
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

            // Mobile: Always point outward (left-column points left, right-column points right)
            // to keep the center tree clean and visible.
            const mobileTransform = cat.align === 'right'
              ? 'translate(calc(-100% - 14px), -50%)'
              : 'translate(14px, -50%)';
            const mobileTextAlign = cat.align === 'right' ? 'right' : 'left';

            return (
              <div 
                key={cat.id}
                data-cat-id={cat.id}
                className={`category-interactive-group ${isDimmed ? 'is-dimmed' : ''}`}
                style={{ transition: phase === 'canopy' ? 'opacity 0.4s var(--ease)' : 'none' }}
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
                  {BanyanData.categories[resolvedClickIdx]?.icon && (
                    <span className="pill-icon">
                      <Icon icon={BanyanData.categories[resolvedClickIdx].icon} width={15} height={15} />
                    </span>
                  )}
                  {isMobile ? (cat.mobileName || cat.name) : cat.name}
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
          style={{ '--bg-image': `url("${aerialImg}")` }}
        >
          <div 
            ref={aerialBgInnerRef}
            className="cinematic-bg aerial-bg" 
            style={{ backgroundImage: `url("${aerialImg}")` }} 
          />
        </div>
        
        <div className="view-overlay aerial-view-container">


          {activeCatObj?.conditions?.map((cond, idx) => {
            const total = activeCatObj.conditions.length;
            // Desktop: a centred "constellation" — rows are evenly spread across
            // the width and stacked with generous vertical spacing, so pills never
            // overlap regardless of how many conditions a category has. A small
            // deterministic jitter keeps it feeling organic rather than gridded.
            const cols = total <= 9 ? 3 : 4;
            const rows = Math.ceil(total / cols);
            const row = Math.floor(idx / cols);
            const itemsInRow = Math.min(cols, total - row * cols);
            const colInRow = idx - row * cols;
            const jitterX = (((idx * 37) % 7) - 3) * 0.5; // ±1.5%
            const jitterY = (((idx * 53) % 5) - 2) * 1.1; // ±2.2%
            const desktopX = 19 + (colInRow + 0.5) * (62 / itemsInRow) + jitterX;
            const desktopY = 15 + (row + 0.5) * (70 / rows) + jitterY;

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
                  style={{ left: `${x}%`, top: `${y}%`, pointerEvents: conditionsRevealed ? 'auto' : 'none' }}
                  onClick={() => onConditionClick(cond.id)}
                  onMouseEnter={() => { setHoverCondition(cond.id); playHoverSound(); }}
                  onMouseLeave={() => setHoverCondition(null)}
                  data-hoverable="true"
                  aria-label={`Trace condition ${cond.name}`}
                />

                <button
                  type="button"
                  className={`condition-label ${isActive ? 'is-active' : ''} ${isHovered ? 'is-hovered' : ''}`}
                  style={{ ...getConditionLabelStyle(x, y, isMobile), pointerEvents: conditionsRevealed ? 'auto' : 'none' }}
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
              const pathD = getRootPath(id, coords, isMobile);
              
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
                  style={{ pointerEvents: rootsReady ? 'auto' : 'none' }}
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
                    <span 
                      className="root-node-name" 
                      style={{ pointerEvents: rootsReady ? 'auto' : 'none' }}
                      onClick={() => onRootClick(id)}
                    >
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
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
