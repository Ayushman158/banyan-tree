/* scene3d.jsx — React wrapper for the Three.js tree scene.
   Strategy:
     - Three.js canvas fills the stage (full hero height)
     - HTML overlay elements (labels, nodes) sit on top
     - Overlay POSITIONS are updated every frame via direct DOM ref manipulation
       — no setState, no re-render per frame
     - React re-renders only when the set of visible elements changes (phase / selection) */

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { BanyanData } from './data.js';
import ThreeApp from './Tree3D.jsx';

/* Maximum conditions in any category (Digestive = 17) */
const MAX_CONDS = 18;

function TreeScene3D({
  phase,
  selectedCategory,
  selectedCondition,
  selectedRoot,
  rootsReady,
  onCategoryClick,
  onConditionClick,
  onRootClick,
}) {
  const containerRef  = useRef(null);
  const appRef        = useRef(null);

  /* Refs for every possible overlay element (no re-create on selection change) */
  const catRefs  = useRef(Array.from({ length: 12 }, () => React.createRef()));
  const condRefs = useRef(Array.from({ length: MAX_CONDS }, () => React.createRef()));
  const rootRefs = useRef(Array.from({ length: 7 },  () => React.createRef()));

  /* ── Init Three.js once ─────────────────────────────────────────────────── */
  useEffect(() => {
    const app = new ThreeApp(containerRef.current);
    appRef.current = app;

    /* Per-frame overlay sync — direct DOM mutation, zero React overhead */
    app.onTick = (catPts, rootPts) => {
      const container = containerRef.current;
      if (!container) return;

      // Category label positions (with basic 2D anti-overlap)
      const activeCats = [];
      catRefs.current.forEach((ref, i) => {
        const p = catPts[i];
        if (p && p.vis) {
          activeCats.push({ el: ref.current, p: { ...p }, i });
        } else if (ref.current) {
          ref.current.style.visibility = 'hidden';
        }
      });
      // Sort top to bottom
      activeCats.sort((a, b) => a.p.y - b.p.y);
      for (let j = 1; j < activeCats.length; j++) {
        const curr = activeCats[j];
        const prev = activeCats[j - 1];
        // If labels are horizontally close, push the current one down
        if (Math.abs(curr.p.x - prev.p.x) < 140) {
          if (curr.p.y - prev.p.y < 46) {
            curr.p.y = prev.p.y + 46;
          }
        }
      }
      activeCats.forEach(({ el, p }) => {
        el.style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) translate(-50%,-50%)`;
        el.style.visibility = '';
      });

      // Root node positions
      rootRefs.current.forEach((ref, i) => {
        const el = ref.current;
        if (!el) return;
        const p = rootPts[i];
        if (p && p.vis) {
          el.style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) translate(-50%,-50%)`;
          el.style.visibility = '';
        } else {
          el.style.visibility = 'hidden';
        }
      });
    };

    app.start();
    return () => { app.stop(); appRef.current = null; };
  }, []);

  /* ── Sync condition node positions each time selectedCategory changes ────── */
  useEffect(() => {
    if (!appRef.current || selectedCategory == null) return;
    const container = containerRef.current;

    const syncConds = (catPts, _rootPts) => {
      if (!container) return;
      const tipPts = appRef.current.getAerialPositions(selectedCategory);
      const cat    = BanyanData.categories[selectedCategory];
      condRefs.current.forEach((ref, i) => {
        const el = ref.current;
        if (!el) return;
        const p = tipPts[i];
        if (p && p.vis && i < cat.conditions.length) {
          // Add an alternating vertical drop to ensure dense clusters don't overlap perfectly
          const drop = (i % 4) * 42;
          el.style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) translate(-50%,0%)`;
          el.style.setProperty('--drop', `${drop}px`);
          el.style.visibility = '';
        } else {
          el.style.visibility = 'hidden';
        }
      });
    };

    const prev = appRef.current.onTick;
    appRef.current.onTick = (catPts, rootPts) => {
      prev && prev(catPts, rootPts);
      syncConds(catPts, rootPts);
    };
    return () => {
      if (appRef.current) appRef.current.onTick = prev;
    };
  }, [selectedCategory]);

  /* ── Propagate phase + selection to Three.js ────────────────────────────── */
  useEffect(() => {
    appRef.current?.setPhase(phase, selectedCategory, selectedRoot);
  }, [phase, selectedCategory, selectedRoot]);

  /* ── Current conditions for the selected category ─────────────────────── */
  const currentCat  = selectedCategory != null ? BanyanData.categories[selectedCategory] : null;
  const conditions  = currentCat?.conditions ?? [];

  return (
    <div className="stage-frame">
      {/* Three.js canvas lives here */}
      <div ref={containerRef} className="three-container" />

      {/* HTML overlays — positioned by the tick loop */}
      <div className="scene-overlay" aria-hidden="false">

        {/* ── Category labels (canopy phase) ─────────────────────────────── */}
        {BanyanData.categories.map((cat, i) => (
          <button
            key={`cat-${i}`}
            ref={catRefs.current[i]}
            className={`ol-cat ${phase === 'canopy' ? 'is-visible' : ''} ${selectedCategory === i ? 'is-lit' : ''}`}
            onClick={() => onCategoryClick(i)}
            data-hoverable="true"
            tabIndex={phase === 'canopy' ? 0 : -1}
          >
            <span className="ol-cat__dot" />
            <span className="ol-cat__name">{cat.name}</span>
          </button>
        ))}

        {/* ── Condition nodes (category phase) ───────────────────────────── */}
        {conditions.map((cond, i) => {
          const isActive = selectedCondition === cond.id;
          return (
            <button
              key={`cond-${cond.id}`}
              ref={condRefs.current[i]}
              className={`ol-cond ${phase === 'category' ? 'is-visible' : ''} ${isActive ? 'is-active' : ''}`}
              onClick={() => onConditionClick(cond.id)}
              data-hoverable="true"
              tabIndex={phase === 'category' ? 0 : -1}
            >
              <span className="ol-cond__halo" />
              <span className="ol-cond__core" />
              <span className="ol-cond__label">{cond.name}</span>
            </button>
          );
        })}
        {/* Hide remaining cond slots */}
        {Array.from({ length: MAX_CONDS - conditions.length }, (_, i) => (
          <span key={`cond-empty-${i}`} ref={condRefs.current[conditions.length + i]}
            style={{ visibility: 'hidden', position: 'absolute' }} />
        ))}

        {/* ── Root-cause nodes (roots / detail phase) ────────────────────── */}
        {BanyanData.rootOrder.map((id, i) => {
          const rc      = BanyanData.rootCauses[id];
          const isActive = selectedRoot === id;
          const isDim    = selectedRoot && !isActive;
          // rootsReady gates visibility so nodes don't appear during the camera descent
          const vis      = (phase === 'roots' || phase === 'detail') && rootsReady;
          return (
            <button
              key={`root-${id}`}
              ref={rootRefs.current[i]}
              className={`ol-root ${vis ? 'is-visible' : ''} ${isActive ? 'is-active' : ''} ${isDim ? 'is-dim' : ''}`}
              onClick={() => vis && onRootClick(id)}
              data-hoverable="true"
              tabIndex={vis ? 0 : -1}
            >
              <span className="ol-root__ring" />
              <span className="ol-root__halo" />
              <span className="ol-root__core" />
              <span className="ol-root__label">{rc.name}</span>
            </button>
          );
        })}

      </div>
    </div>
  );
}

export default TreeScene3D;
