import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BanyanData } from './data.js';
import { playHoverSound } from './sound.js';
import gsap from 'gsap';
import canopyImg from './assets/New hero.jpg';
import aerialImg from './assets/aerial roots close up 2.jpg';
import rootsImg from './assets/roots hd.jpg';

// Compressed coordinates to fit within the 16:10 / 4:3 safe area when cropped
const CATEGORIES = [
  { id: "mental", name: "Mental Health", x: 58, y: 22, labelX: 53, labelY: 22, align: "right" },
  { id: "metabolic", name: "Lifestyle / Metabolic", x: 56, y: 68, labelX: 51, labelY: 68, align: "right" },
  { id: "musculoskeletal", name: "Musculoskeletal", x: 53, y: 56, labelX: 48, labelY: 56, align: "right" },
  { id: "cardiovascular", name: "Cardiovascular", x: 52, y: 44, labelX: 47, labelY: 44, align: "right" },
  { id: "autoimmune", name: "Autoimmune & Inflammatory", x: 55, y: 32, labelX: 50, labelY: 32, align: "right" },
  { id: "hormonal", name: "Hormonal & Endocrine", x: 68, y: 17, labelX: 62, labelY: 17, align: "right" },
  { id: "neurological", name: "Neurological", x: 64, y: 12, labelX: 58, labelY: 12, align: "right" },
  { id: "gut", name: "Gut & Digestive Health", x: 72, y: 26, labelX: 66, labelY: 26, align: "right" },
  { id: "respiratory", name: "Respiratory & ENT", x: 74, y: 35, labelX: 68, labelY: 35, align: "right" },
  { id: "skin", name: "Skin & Hair", x: 75, y: 48, labelX: 69, labelY: 48, align: "right" },
  { id: "oral", name: "Oral & Dental Health", x: 73, y: 60, labelX: 67, labelY: 60, align: "right" },
  { id: "renal", name: "Renal & Urinary", x: 69, y: 70, labelX: 63, labelY: 70, align: "right" }
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

  const canopyGroupRef = useRef(null);
  const aerialGroupRef = useRef(null);
  const rootsGroupRef = useRef(null);
  const lastSelectedCategoryRef = useRef(null);
  const isFirstRenderRef = useRef(true);
  const prevPhaseRef = useRef(phase);

  useEffect(() => {
    if (selectedCategory !== null) {
      lastSelectedCategoryRef.current = BanyanData.categories[selectedCategory];
    }
  }, [selectedCategory]);

  // GSAP Transition orchestrator
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    const isUnderground = (p) => p === 'roots' || p === 'detail';

    if (!isFirstRenderRef.current) {
      if (isUnderground(prev) && isUnderground(phase)) {
        // Already in the underground stage (roots/detail), do not restart the camera transition
        return;
      }
    } else {
      isFirstRenderRef.current = false;
    }

    const targets = [
      canopyGroupRef.current,
      aerialGroupRef.current,
      rootsGroupRef.current
    ].filter(Boolean);

    gsap.killTweensOf(targets);

    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut', duration: 2.4 } });

    // Determine the origin for zooming based on the last selected category
    const catOrigin = lastSelectedCategoryRef.current 
      ? `${lastSelectedCategoryRef.current.x}% ${lastSelectedCategoryRef.current.y}%`
      : '50% 50%';

    if (phase === 'canopy') {
      // Zoom back out to the full canopy
      tl.to(canopyGroupRef.current, { opacity: 1, scale: 1, filter: 'blur(0px)', y: '0vh', transformOrigin: catOrigin, pointerEvents: 'auto' }, 0);
      
      // Aerial background recedes and fades out
      tl.to(aerialGroupRef.current, { opacity: 0, scale: 0.75, filter: 'blur(8px)', y: '0vh', transformOrigin: catOrigin, pointerEvents: 'none' }, 0);

      // Roots background recedes down and fades out
      tl.to(rootsGroupRef.current, { opacity: 0, scale: 0.9, y: '40vh', pointerEvents: 'none' }, 0);

    } else if (phase === 'category') {
      // Zoom deeply into the selected branch
      tl.to(canopyGroupRef.current, { opacity: 0, scale: 5.0, filter: 'blur(12px)', y: '0vh', transformOrigin: catOrigin, pointerEvents: 'none' }, 0);

      // Aerial background fades in while scaling up to create depth
      tl.fromTo(aerialGroupRef.current, 
        { opacity: 0, scale: 0.75, filter: 'blur(8px)', y: '0vh', transformOrigin: catOrigin }, 
        { opacity: 1, scale: 1, filter: 'blur(0px)', y: '0vh', transformOrigin: catOrigin, pointerEvents: 'auto', duration: 2.4 }, 
        0
      );

      // Roots background remains translated down and invisible
      tl.to(rootsGroupRef.current, { opacity: 0, scale: 0.9, y: '40vh', pointerEvents: 'none' }, 0);

    } else if (phase === 'roots' || phase === 'detail') {
      // Descend deeper into the roots (following the root down)
      // Canopy continues to move up and stay hidden
      tl.to(canopyGroupRef.current, { opacity: 0, scale: 5.0, filter: 'blur(12px)', y: '-60vh', pointerEvents: 'none' }, 0);

      // Aerial slides up and out of the viewport, scaling slightly to maintain forward momentum
      tl.to(aerialGroupRef.current, { opacity: 0, scale: 1.15, filter: 'blur(8px)', y: '-60vh', pointerEvents: 'none' }, 0);

      // Roots slides in from the bottom, scaling up to meet the camera
      tl.fromTo(rootsGroupRef.current, { opacity: 0, scale: 0.9, y: '40vh' }, { opacity: 1, scale: 1, y: '0vh', pointerEvents: 'auto', duration: 2.4 }, 0);
    }

    return () => {
      tl.kill();
    };
  }, [phase]);

  // Calculate active categories, conditions, and roots
  const activeCatObj = selectedCategory !== null ? BanyanData.categories[selectedCategory] : null;
  const activeCondObj = selectedCondition ? BanyanData.conditionsById[selectedCondition] : null;
  const activeRootIds = getActiveRootsForCondition(selectedCondition);

  // Text content for roots page left column
  const conditionDescription = activeCondObj 
    ? `This condition emerges from a network of systemic imbalances that influence and reinforce each other. Explore the connected root causes below.`
    : '';

  return (
    <div className="stage-frame">
      {/* ── Canopy Layer Group ── */}
      <div ref={canopyGroupRef} className="group-wrapper canopy-group-wrapper">
        <div className="cinematic-bg-wrapper canopy-bg-wrapper">
          <div 
            className="cinematic-bg canopy-bg" 
            style={{ backgroundImage: `url(${canopyImg})` }} 
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
              const isHovered = hoverCategory === cat.id;
              const isActive = activeCatObj && activeCatObj.id === cat.id;
              const isDimmed = hoverCategory !== null && !isHovered;
              
              return (
                <path
                  key={`line-${cat.id}`}
                  d={getCategoryPath(cat)}
                  stroke={isActive || isHovered ? "var(--gold)" : "rgba(20, 35, 28, 0.38)"}
                  strokeWidth={isActive || isHovered ? 1.5 : 0.9}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  className="canopy-path"
                  style={{ 
                    opacity: isDimmed ? 0.3 : 1,
                    transition: 'stroke 0.4s var(--ease), stroke-width 0.4s var(--ease), opacity 0.4s var(--ease)' 
                  }}
                />
              );
            })}
          </svg>

          {/* Hotspots & Labels */}
          {CATEGORIES.map((cat, idx) => {
            const isHovered = hoverCategory === cat.id;
            const isActive = activeCatObj && activeCatObj.id === cat.id;
            const isDimmed = hoverCategory !== null && !isHovered;

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
                  style={{ left: `${cat.x}%`, top: `${cat.y}%` }}
                  onClick={() => onCategoryClick(idx)}
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
                    left: `${cat.labelX}%`,
                    top: `${cat.labelY}%`,
                    textAlign: cat.align === 'right' ? 'right' : 'left',
                    transform: cat.align === 'right' ? 'translate(calc(-100% - 12px), -50%)' : 'translate(12px, -50%)'
                  }}
                  onClick={() => onCategoryClick(idx)}
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

      {/* ── Aerial Roots Middle Layer Group ── */}
      <div ref={aerialGroupRef} className="group-wrapper aerial-group-wrapper" style={{ opacity: 0 }}>
        <div className="cinematic-bg-wrapper aerial-bg-wrapper">
          <div 
            className="cinematic-bg aerial-bg" 
            style={{ backgroundImage: `url(${aerialImg})` }} 
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
            const pathIdx = idx % 7;
            const count = Math.ceil(activeCatObj.conditions.length / 7);
            const k = Math.floor(idx / 7);
            const waveY = (pathIdx % 2 === 0) ? -8 : 8; // Stagger adjacent nodes
            const y = 20 + 60 * (k + 0.5) / count + waveY;
            const x = getXForPath(pathIdx, y);

            const isHovered = hoverCondition === cond.id;
            const isActive = selectedCondition === cond.id;
            const isDimmed = (selectedCondition != null && !isActive) || (selectedCondition == null && hoverCondition != null && !isHovered);

            const align = x < 50 ? 'right' : 'left';
            const labelStyle = align === 'left'
              ? { left: `${x}%`, top: `${y}%`, transform: 'translate(14px, -50%)', textAlign: 'left' }
              : { left: `${x}%`, top: `${y}%`, transform: 'translate(-100%, -50%) translate(-14px, 0)', textAlign: 'right' };

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
                  transition: 'opacity 0.4s var(--ease)'
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
                  style={labelStyle}
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
      <div ref={rootsGroupRef} className="group-wrapper roots-group-wrapper" style={{ opacity: 0 }}>
        <div className="cinematic-bg-wrapper roots-bg-wrapper">
          <div 
            className="cinematic-bg roots-bg" 
            style={{ backgroundImage: `url(${rootsImg})` }} 
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
              const pathD = getRootPath(id, layout);
              
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
            
            const isDirect = activeCondObj?.root === id;
            const isActive = activeRootIds.includes(id);
            const isHovered = hoverRoot === id;
            const isDimmed = hoverRoot !== null && !isHovered;
            
            const isRightSide = layout.side === 'right';
            const systemicIndex = ["chronic-stress", "nervous-system", "emotional", "sleep", "trauma"].indexOf(id);
            const isEven = systemicIndex % 2 === 0;
            const labelTransform = isRightSide 
              ? 'translate(0%, -50%)' 
              : (isEven ? 'translate(-50%, 15px)' : 'translate(-50%, -48px)');
            
            return (
              <div
                key={id}
                className={`root-node-group ${isActive ? 'is-active' : ''} ${isDimmed ? 'is-dimmed' : ''}`}
                style={{
                  left: `${layout.x}%`,
                  top: `${layout.y}%`,
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
                  style={{
                    left: isRightSide ? '20px' : '0px',
                    transform: labelTransform,
                    textAlign: isRightSide ? 'left' : 'center',
                  }}
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
