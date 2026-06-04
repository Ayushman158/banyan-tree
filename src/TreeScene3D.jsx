import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BanyanData } from './data.js';
import { playHoverSound } from './sound.js';
import canopyImg from './assets/cinematic-canopy.jpg';
import rootsImg from './assets/cinematic-roots.png';

// Coordinate configuration for the 12 categories on the canopy image
const CATEGORIES = [
  { id: "neurological", name: "Neurological", x: 70.5, y: 16, labelX: 64, labelY: 16, align: "right" },
  { id: "hormonal", name: "Hormonal & Endocrine", x: 77.5, y: 22, labelX: 79.5, labelY: 22, align: "left" },
  { id: "gut", name: "Gut & Digestive Health", x: 84.5, y: 31, labelX: 86.5, labelY: 31, align: "left" },
  { id: "respiratory", name: "Respiratory & ENT", x: 79.5, y: 43, labelX: 81.5, labelY: 43, align: "left" },
  { id: "skin", name: "Skin & Hair", x: 78.5, y: 55, labelX: 80.5, labelY: 55, align: "left" },
  { id: "oral", name: "Oral & Dental Health", x: 78.5, y: 67, labelX: 80.5, labelY: 67, align: "left" },
  { id: "renal", name: "Renal & Urinary", x: 73.5, y: 76, labelX: 75.5, labelY: 76, align: "left" },
  { id: "mental", name: "Mental Health", x: 47.5, y: 38, labelX: 39.5, labelY: 38, align: "right" },
  { id: "autoimmune", name: "Autoimmune & Inflammatory", x: 49.5, y: 51, labelX: 39.5, labelY: 51, align: "right" },
  { id: "cardiovascular", name: "Cardiovascular", x: 49.5, y: 58, labelX: 41.5, labelY: 58, align: "right" },
  { id: "musculoskeletal", name: "Musculoskeletal", x: 52.5, y: 65, labelX: 43.5, labelY: 65, align: "right" },
  { id: "metabolic", name: "Lifestyle / Metabolic", x: 53.5, y: 73, labelX: 47.5, labelY: 73, align: "right" }
];

// Coordinate configuration for the roots cause nodes
const ROOT_LAYOUTS = {
  "chronic-stress": { x: 19, y: 78, labelX: 19, labelY: 82, align: "center", side: "bottom" },
  "nervous-system": { x: 33, y: 81, labelX: 33, labelY: 85, align: "center", side: "bottom" },
  "emotional": { x: 49, y: 83, labelX: 49, labelY: 87, align: "center", side: "bottom" },
  "sleep": { x: 63, y: 80, labelX: 63, labelY: 84, align: "center", side: "bottom" },
  "trauma": { x: 77, y: 79, labelX: 77, labelY: 83, align: "center", side: "bottom" },
  "nutrition": { x: 72, y: 48, labelX: 75, labelY: 48, align: "left", side: "right" },
  "lifestyle": { x: 72, y: 60, labelX: 75, labelY: 60, align: "left", side: "right" }
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
  const [hoverRoot, setHoverRoot] = useState(null);
  const [connectionsGlowing, setConnectionsGlowing] = useState(false);

  const isUnderground = phase === 'roots' || phase === 'detail';
  
  // Calculate active categories, conditions, and roots
  const activeCatObj = selectedCategory !== null ? BanyanData.categories[selectedCategory] : null;
  const activeCondObj = selectedCondition ? BanyanData.conditionsById[selectedCondition] : null;
  
  const activeRootIds = getActiveRootsForCondition(selectedCondition);

  // Text content for roots page left column
  const conditionDescription = activeCondObj 
    ? `${activeCondObj.name} is not an isolated condition. It emerges from a network of imbalances that influence and reinforce each other.`
    : '';

  return (
    <div className="stage-frame">
      {/* ── Background layers with descent transition ── */}
      <div className={`cinematic-bg-container ${isUnderground ? 'is-underground' : ''}`}>
        <div 
          className="cinematic-bg canopy-bg" 
          style={{ backgroundImage: `url(${canopyImg})` }} 
        >
          {/* Animated light rays overlay */}
          <div className="sunbeams-overlay" />
        </div>
        <div 
          className="cinematic-bg roots-bg" 
          style={{ backgroundImage: `url(${rootsImg})` }} 
        />
      </div>

      {/* ── Canopy/Category View overlay ── */}
      <AnimatePresence>
        {!isUnderground && (
          <motion.div
            key="canopy-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'canopy' ? 1 : 0 }}
            style={{ pointerEvents: phase === 'canopy' ? 'auto' : 'none' }}
            transition={{ duration: 0.8 }}
            className="view-overlay canopy-view-container"
          >
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
                    stroke={isActive || isHovered ? "var(--gold)" : "rgba(25, 32, 29, 0.15)"}
                    strokeWidth={isActive || isHovered ? 1.2 : 0.6}
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
                      transform: cat.align === 'right' ? 'translate(-100%, -50%)' : 'translate(0%, -50%)'
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Category Conditions List (Slides in from the right) ── */}
      <AnimatePresence>
        {phase === 'category' && activeCatObj && (
          <motion.div
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="conditions-sidebar"
          >
            <div className="sidebar-header">
              <span className="sidebar-eyebrow">Domain Conditions</span>
              <h3 className="sidebar-title">{activeCatObj.name}</h3>
              <p className="sidebar-instructions is-pulsing">
                👇 Select a condition below to descend and trace its roots:
              </p>
            </div>
            <div className="sidebar-list">
              {activeCatObj.conditions.map((cond) => (
                <button
                  key={cond.id}
                  className="sidebar-item-btn"
                  onClick={() => onConditionClick(cond.id)}
                  onMouseEnter={playHoverSound}
                  type="button"
                  data-hoverable="true"
                >
                  <span className="sidebar-item-dot" />
                  <div className="sidebar-item-content">
                    <span className="sidebar-item-name">{cond.name}</span>
                    <span className="sidebar-item-action-hint">Trace root causes →</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Roots / Below-Ground View ── */}
      <AnimatePresence>
        {isUnderground && rootsReady && (
          <motion.div
            key="roots-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="view-overlay roots-view-container"
          >
            {/* SVG Connecting Paths */}
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

              {/* Draw paths for all roots */}
              {Object.entries(ROOT_LAYOUTS).map(([id, layout]) => {
                const isActive = activeRootIds.includes(id) || connectionsGlowing;
                const pathD = getRootPath(id, layout);
                
                return (
                  <g key={`group-${id}`}>
                    {/* Background path (static or glowing) */}
                    <path
                      d={pathD}
                      stroke={isActive ? "var(--gold)" : "rgba(255, 255, 255, 0.03)"}
                      strokeWidth={isActive ? 1.5 : 0.6}
                      fill="none"
                      vectorEffect="non-scaling-stroke"
                      style={{ 
                        opacity: isActive ? 0.75 : 0.15,
                        filter: isActive ? 'url(#glow)' : 'none',
                        transition: 'stroke 0.5s ease, stroke-width 0.5s ease, opacity 0.5s ease' 
                      }}
                    />

                    {/* Foreground pulsing animated path */}
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

            {/* Left Stack (Back, Title, Description, Connections button) */}
            <div className="roots-left-panel">
              <button 
                type="button"
                className="roots-back-link" 
                onClick={() => onCrumbJump('category')}
                onMouseEnter={playHoverSound}
                data-hoverable="true"
              >
                <span>←</span> Back to {activeCatObj?.name || 'Tree'}
              </button>
              
              <div className="roots-condition-detail">
                <p className="roots-cond-desc">{conditionDescription}</p>
                
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
              </div>
            </div>

            {/* Root cause nodes overlay */}
            {Object.entries(ROOT_LAYOUTS).map(([id, layout]) => {
              const rc = BanyanData.rootCauses[id];
              if (!rc) return null;
              
              const isDirect = activeCondObj?.root === id;
              const isActive = activeRootIds.includes(id);
              const isHovered = hoverRoot === id;
              const isDimmed = hoverRoot !== null && !isHovered;
              
              // Stagger bottom labels vertically (odd index above, even index below) to prevent horizontal overlap clutter
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
                    transition: 'opacity 0.4s var(--ease)'
                  }}
                >
                  {/* Node Circle */}
                  <button
                    type="button"
                    className={`root-node-dot ${isDirect ? 'is-direct' : ''} ${isHovered ? 'is-hovered' : ''}`}
                    onClick={() => onRootClick(id)}
                    onMouseEnter={() => { setHoverRoot(id); playHoverSound(); }}
                    onMouseLeave={() => setHoverRoot(null)}
                    data-hoverable="true"
                    aria-label={`Inspect root cause: ${rc.name}`}
                  />

                  {/* Node Label */}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
