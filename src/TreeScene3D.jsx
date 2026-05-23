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

      // Category label positions (with dynamic offsetWidth-based anti-overlap)
      const activeCats = [];
      catRefs.current.forEach((ref, i) => {
        const p = catPts[i];
        if (p && p.vis) {
          const el = ref.current;
          const w = el ? (el.offsetWidth || 140) : 140;
          const h = el ? (el.offsetHeight || 38) : 38;
          activeCats.push({ el, p: { ...p }, w, h, i });
        } else if (ref.current) {
          ref.current.style.visibility = 'hidden';
        }
      });
      // Sort top to bottom
      activeCats.sort((a, b) => a.p.y - b.p.y);
      for (let j = 0; j < activeCats.length; j++) {
        const curr = activeCats[j];
        for (let k = 0; k < j; k++) {
          const prev = activeCats[k];
          const dx = Math.abs(curr.p.x - prev.p.x);
          const combinedHalfWidths = (curr.w + prev.w) / 2;
          const minHorizontalGap = 16;
          if (dx < combinedHalfWidths + minHorizontalGap) {
            const dy = curr.p.y - prev.p.y;
            const minVerticalDistance = (curr.h + prev.h) / 2 + 10;
            if (dy < minVerticalDistance) {
              curr.p.y = prev.p.y + minVerticalDistance;
            }
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
      if (!cat) return;

      const activeConds = [];
      condRefs.current.forEach((ref, i) => {
        const el = ref.current;
        if (!el) return;
        if (i >= cat.conditions.length) {
          el.style.visibility = 'hidden';
          return;
        }
        const p = tipPts[i];
        if (p && p.vis) {
          const labelEl = el.querySelector('.ol-cond__label');
          const w = labelEl ? (labelEl.offsetWidth || 100) : 100;
          const h = labelEl ? (labelEl.offsetHeight || 24) : 24;
          activeConds.push({
            el,
            p,
            w,
            h,
            index: i,
            drop: (i % 4) * 20
          });
        } else {
          el.style.visibility = 'hidden';
        }
      });

      // Sort by Y position (p.y + initial drop) top-to-bottom
      activeConds.sort((a, b) => (a.p.y + a.drop) - (b.p.y + b.drop));

      // Resolve overlaps cascading top-to-bottom
      for (let j = 0; j < activeConds.length; j++) {
        const curr = activeConds[j];
        for (let k = 0; k < j; k++) {
          const prev = activeConds[k];
          const dx = Math.abs(curr.p.x - prev.p.x);
          const combinedHalfWidths = (curr.w + prev.w) / 2;
          const minHorizontalGap = 12;

          if (dx < combinedHalfWidths + minHorizontalGap) {
            const currY = curr.p.y + curr.drop;
            const prevY = prev.p.y + prev.drop;
            const minVerticalDistance = prev.h + 8; // prev label height + 8px gap
            if (currY < prevY + minVerticalDistance) {
              curr.drop = Math.max(curr.drop, prevY + minVerticalDistance - curr.p.y);
            }
          }
        }
      }

      activeConds.forEach(({ el, p, drop }) => {
        el.style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) translate(-50%,0%)`;
        el.style.setProperty('--drop', `${drop.toFixed(1)}px`);
        el.style.visibility = '';
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
              <span className="ol-root__connector" />
              <span className="ol-root__halo" />
              <span className="ol-root__core" />
              <div className="ol-root__label-box">
                <span className="ol-root__label">{rc.name}</span>
              </div>
            </button>
          );
        })}

      </div>
    </div>
  );
}

export default TreeScene3D;
