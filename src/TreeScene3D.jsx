/* scene3d.jsx — React wrapper for the Three.js tree scene.
   Strategy:
     - Three.js canvas fills the stage (full hero height)
     - HTML overlay elements (labels, nodes) sit on top
     - Overlay POSITIONS are updated every frame via direct DOM ref manipulation
       — no setState, no re-render per frame
     - React re-renders only when the set of visible elements changes (phase / selection) */

import React, { useEffect, useRef } from 'react';
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

  // WeakMap dimension cache to prevent layout thrashing (offsetWidth/offsetHeight calls inside tick)
  const dimCache = useRef(new WeakMap());

  const getDim = (el, defaultW = 140, defaultH = 38) => {
    if (!el) return { w: defaultW, h: defaultH };
    let cached = dimCache.current.get(el);
    if (!cached) {
      cached = { w: el.offsetWidth || defaultW, h: el.offsetHeight || defaultH };
      if (cached.w > 0 && cached.h > 0) {
        dimCache.current.set(el, cached);
      }
    }
    return cached;
  };

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
          const { w, h } = getDim(el, 140, 38);
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
        el.style.setProperty('--pos-x', `${p.x.toFixed(1)}px`);
        el.style.setProperty('--pos-y', `${p.y.toFixed(1)}px`);
        el.style.visibility = '';
      });

      // Root node positions
      rootRefs.current.forEach((ref, i) => {
        const el = ref.current;
        if (!el) return;
        const p = rootPts[i];
        if (p && p.vis) {
          // Stagger vertically to prevent overlap, but keep them attached to their 3D root tips horizontally
          const yOffset = (i % 2 === 0 ? 0 : 70);
          el.style.setProperty('--pos-x', `${p.x.toFixed(1)}px`);
          el.style.setProperty('--pos-y', `${(p.y + yOffset).toFixed(1)}px`);
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
          let cached = dimCache.current.get(el);
          if (!cached) {
            const labelEl = el.querySelector('.ol-cond__label');
            cached = {
              w: labelEl ? (labelEl.offsetWidth || 100) : 100,
              h: labelEl ? (labelEl.offsetHeight || 24) : 24
            };
            if (cached.w > 0 && cached.h > 0) {
              dimCache.current.set(el, cached);
            }
          }
          activeConds.push({
            el,
            p,
            w: cached.w,
            h: cached.h,
            index: i,
            drop: 0,
            xOffset: (i % 2 === 0 ? -160 : 160)
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
          const currX = curr.p.x + curr.xOffset;
          const prevX = prev.p.x + prev.xOffset;
          const dx = Math.abs(currX - prevX);
          const combinedHalfWidths = (curr.w + prev.w) / 2;
          const minHorizontalGap = 16;

          if (dx < combinedHalfWidths + minHorizontalGap) {
            const currY = curr.p.y + curr.drop;
            const prevY = prev.p.y + prev.drop;
            const minVerticalDistance = prev.h + 2; 
            if (currY < prevY + minVerticalDistance) {
              curr.drop = Math.max(curr.drop, prevY + minVerticalDistance - curr.p.y);
            }
          }
        }
      }

      activeConds.forEach(({ el, p, drop, xOffset }) => {
        el.style.setProperty('--pos-x', `${(p.x + xOffset).toFixed(1)}px`);
        el.style.setProperty('--pos-y', `${(p.y + drop).toFixed(1)}px`);
        el.style.setProperty('--drop', `${drop.toFixed(1)}px`);
        el.style.setProperty('--thread-x', `${(-xOffset).toFixed(1)}px`);
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

  const isUnderground = phase === 'roots' || phase === 'detail';

  return (
    <div className="stage-frame">
      {/* Three.js canvas lives here */}
      <div ref={containerRef} className="three-container" />
      {/* Underground veil overlay */}
      <div className={`underground-veil ${isUnderground ? 'is-active' : ''}`} aria-hidden="true" />

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
          // Only show the root label if it is the root cause for the selected condition
          const vis      = (phase === 'roots' || phase === 'detail') && rootsReady && isActive;
          if (!vis) return null; // dynamically hide non-relevant roots

          return (
            <button
              key={`root-${id}`}
              ref={rootRefs.current[i]}
              className={`ol-root ${vis ? 'is-visible' : ''} ${isActive ? 'is-active' : ''}`}
              onClick={() => vis && onRootClick(id)}
              onMouseEnter={() => vis && appRef.current?.tree.setLitRoot(i)}
              onMouseLeave={() => vis && appRef.current?.tree.setLitRoot(selectedRoot != null ? BanyanData.rootOrder.indexOf(selectedRoot) : -1)}
              data-hoverable="true"
              tabIndex={vis ? 0 : -1}
            >
              <div className="ol-root__label-box">
                <div className="ol-root__row">
                  <svg className="ol-root__sparkle" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" fill="#ffdf9e" />
                  </svg>
                  <span className="ol-root__name">{rc.name}</span>
                </div>
                <span className="ol-root__subtitle">{rc.subtitle}</span>
              </div>
            </button>
          );
        })}

      </div>
    </div>
  );
}

export default TreeScene3D;
