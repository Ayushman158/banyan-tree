/* tree3d.js — Organic Banyan Tree
   Key realism principles:
   - Primary branches are THICK and use 4-pt CatmullRom with "rise-then-arch" shape
   - Each primary limb first grows upward from the trunk, then bends outward
   - Width tapers aggressively so outer twigs are hair-thin
   - Z-spread alternates strongly per limb for genuine 3D depth
   - Aerial roots hang from outer limb tips only */

import * as THREE from 'three';
import { BanyanData } from './data.js';

  /* ─── Seeded PRNG ─────────────────────────────────────────────────────────── */
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ─── Merge geometries ───────────────────────────────────────────────────── */
  function mergeGeos(geos) {
    let vC = 0, iC = 0;
    geos.forEach(g => { vC += g.attributes.position.count; if (g.index) iC += g.index.count; });
    const pos = new Float32Array(vC * 3), nrm = new Float32Array(vC * 3);
    const idx = iC ? new Uint32Array(iC) : null;
    let vO = 0, iO = 0;
    geos.forEach(g => {
      const n = g.attributes.position.count;
      pos.set(g.attributes.position.array, vO * 3);
      if (g.attributes.normal) nrm.set(g.attributes.normal.array, vO * 3);
      if (idx && g.index) { const s = g.index.array; for (let i = 0; i < s.length; i++) idx[iO + i] = s[i] + vO; iO += s.length; }
      vO += n;
    });
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal',   new THREE.BufferAttribute(nrm, 3));
    if (idx) out.setIndex(new THREE.BufferAttribute(idx, 1));
    return out;
  }

  /* ─── Palette ────────────────────────────────────────────────────────────── */
  const C = {
    bark:          0x3e2610,
    barkLight:     0x6a4420,
    barkHighlight: 0x8c5e2c,
    barkShade:     0x1c0e06,
    barkMid:       0x4e3018,
    leaf0:         0x253a18,
    leaf1:         0x355424,
    leaf2:         0x4a6e30,
    leaf3:         0x618040,
    leafLit:       0x8aaa28,
    rootDark:      0x100804,
    rootMid:       0x28180a,
    rootAmbient:   0x3c2610,
    rootLit:       0xb88c18,
    ground:        0xddd0b8,
    groundFar:     0xcabfa8,
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     BanyanTree
   ═══════════════════════════════════════════════════════════════════════════ */
  class BanyanTree {
    constructor(scene, rand) {
      this.scene = scene; this.rand = rand;
      this.branchGroups = {}; this.leafGroups = {}; this.rootGroups = {};
      this._build();
    }

    _build() {
      this._sky();
      this._ground();
      this._trunk();
      this._canopy();
      this._aerials();
      this._roots();
    }

    /* ── Sky Dome ───────────────────────────────────────────────────────── */
    _sky() {
      const vertexShader = `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;
      const fragmentShader = `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          float t = max(pow(max(h, 0.0), 0.6), 0.0);
          gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
        }
      `;
      const uniforms = {
        topColor: { value: new THREE.Color(0x1A4C8B) }, // Deep majestic celestial blue
        bottomColor: { value: new THREE.Color(0x8DA9C4) } // Crisp atmospheric dawn blue
      };
      const skyGeo = new THREE.SphereGeometry(4000, 32, 16);
      const skyMat = new THREE.ShaderMaterial({
        vertexShader, fragmentShader, uniforms,
        side: THREE.BackSide, depthWrite: false
      });
      this.scene.add(new THREE.Mesh(skyGeo, skyMat));
    }

    /* ── Ground ─────────────────────────────────────────────────────────── */
    _ground() {
      const geo = new THREE.PlaneGeometry(16000, 16000, 128, 128);
      
      const pos = geo.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        const x = pos[i];
        const y = pos[i + 1];
        // Procedural noise for natural rolling landscape (softened to prevent exposing trunk base)
        const noise = Math.sin(x * 0.001) * Math.cos(y * 0.001) * 20 +
                      Math.sin(x * 0.003 + y * 0.004) * 8;
        pos[i + 2] = noise;
      }
      geo.computeVertexNormals();

      const mat = new THREE.MeshLambertMaterial({ color: 0x2C4C3B, side: THREE.DoubleSide }); // Rich forest green
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      m.position.y = -5; // Meet the trunk base perfectly
      m.receiveShadow = true;
      this.scene.add(m);

      // Fake shadow disk removed for better realism and to rely on actual shadow map
    }

    /* ── Trunk — multi-layered realistic bark ────────────────────────────── */
    _trunk() {
      this.trunkMats = [];
      const H = 155;

      // Core trunk shape — wider at base, strong taper
      // High polygon count to support detailed vertex displacement, optimized slightly
      const geo = new THREE.CylinderGeometry(15, 38, H, 48, 24);
      
      const posArr = geo.attributes.position.array;
      for (let i = 0; i < posArr.length; i += 3) {
        let vx = posArr[i], vy = posArr[i + 1], vz = posArr[i + 2];
        const y = vy + H / 2; // 0 at bottom, H at top
        const t = y / H;      // 0.0 to 1.0

        const angle = Math.atan2(vz, vx);
        
        // Organic twist: the buttresses twist slightly as they go up
        const a = angle + Math.sin(y * 0.03) * 0.4;

        // Create 7 main buttress ridges
        let ridge1 = Math.cos(a * 7);
        ridge1 = Math.pow((ridge1 + 1) / 2, 2.0);

        // Break symmetry with 3 secondary ridges
        let ridge2 = Math.cos(a * 3 + 2.0);
        ridge2 = Math.pow((ridge2 + 1) / 2, 1.5);

        // Mix ridges
        const totalRidge = (ridge1 * 0.75 + ridge2 * 0.25);

        // Calculate expansion based on height. 
        // Huge expansion at bottom (t=0) fading sharply as it goes up
        const buttressExpansion = totalRidge * 55 * Math.pow(1 - t, 2.2);
        
        // Additional organic base flare (uniform)
        const baseFlare = 15 * Math.pow(1 - t, 4.0);
        
        // Bark texture noise
        const noise = Math.sin(y * 0.5) * Math.sin(angle * 15) * 0.8;

        const r = Math.sqrt(vx * vx + vz * vz);
        if (r > 0) {
          const newR = r + buttressExpansion + baseFlare + noise;
          const scale = newR / r;
          posArr[i]     *= scale;
          posArr[i + 2] *= scale;
        }
      }
      geo.computeVertexNormals();
      geo.translate(0, H / 2, 0);
      
      const mat = new THREE.MeshLambertMaterial({ color: C.bark });
      this.trunkMats.push({ mat, color: C.bark });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      this.scene.add(mesh);

    }

    /* ── Canopy — 12 category branches ─────────────────────────────────── */
    _canopy() {
      const H = 155; // trunk top

      /* Each limb has:
           angle   — final arch direction from vertical (rad). Max ±0.88 (≈50°).
                     Primary branches RISE FIRST then arch out — see _makeLimbCurve.
           startY  — attachment height on trunk
           len     — length of the primary scaffold limb
           droop   — droop per recursion level for outer sub-branches
           z       — primary Z-direction multiplier (alternates for 3D depth)
           W       — primary tube radius — thick like a real scaffold limb */
      const LIMBS = [
        { angle: -0.88, startY:  52, len: 310, droop: 0.30, z:  0.60, W: 18 },
        { angle: -0.68, startY:  72, len: 330, droop: 0.23, z: -0.42, W: 20 },
        { angle: -0.50, startY:  90, len: 315, droop: 0.16, z:  0.52, W: 21 },
        { angle: -0.32, startY: 105, len: 295, droop: 0.09, z: -0.32, W: 20 },
        { angle: -0.14, startY: 118, len: 275, droop: 0.03, z:  0.38, W: 18 },
        { angle: -0.02, startY: 130, len: 255, droop: 0.00, z: -0.22, W: 17 },
        { angle:  0.02, startY: 130, len: 255, droop: 0.00, z:  0.22, W: 17 },
        { angle:  0.14, startY: 118, len: 275, droop: 0.03, z: -0.38, W: 18 },
        { angle:  0.32, startY: 105, len: 295, droop: 0.09, z:  0.32, W: 20 },
        { angle:  0.50, startY:  90, len: 315, droop: 0.16, z: -0.52, W: 21 },
        { angle:  0.68, startY:  72, len: 330, droop: 0.23, z:  0.42, W: 20 },
        { angle:  0.88, startY:  52, len: 310, droop: 0.30, z: -0.60, W: 18 },
      ];

      for (let i = 0; i < 12; i++) {
        const sp   = LIMBS[i];
        const geos = [], tips = [], leafPts = [];

        // Origin: deep inside the trunk so the Tube intersects the surface cleanly
        const tR    = 52 - (sp.startY / H) * 37; // trunk radius at startY
        const outward = new THREE.Vector3(Math.sin(sp.angle * 0.18), 0, sp.z).normalize();
        const sx    = outward.x * tR * 0.1;
        const sz    = outward.z * tR * 0.1;
        const start = new THREE.Vector3(sx, sp.startY, sz);

        const limLen = sp.len * (0.90 + this.rand() * 0.16);

        // Build primary scaffold limb as a single organic S-curve
        const primCurve = this._makeLimbCurve(start, sp.angle, sp.z, limLen, sp.droop);
        const primSegs  = 16;
        geos.push(new THREE.TubeGeometry(primCurve, primSegs, sp.W / 2, 12, false));
        const capGeo = new THREE.SphereGeometry(sp.W / 2, 8, 8);
        capGeo.translate(start.x, start.y, start.z);
        geos.push(capGeo);

        const primEnd = primCurve.getPoint(1.0);

        // Grow sub-branches from intermediate points along the primary limb
        // NOTE: anchor is computed AFTER this loop so tips[] is populated
        const splitPts = [0.45, 0.65, 0.80, 1.0];
        splitPts.forEach((t, si) => {
          const pt       = primCurve.getPoint(t);
          const tang     = primCurve.getTangent(t);
          // Angle at this point along the primary limb
          const localAng = Math.atan2(tang.x, tang.y);
          // Width scales down as we go further along
          const subW     = Math.max(1.8, sp.W * (0.32 - si * 0.06) + this.rand() * 2);
          const subLen   = limLen * (0.30 + this.rand() * 0.18 - si * 0.04);
          const numSubs  = si < 2 ? 2 : 3;
          const spread   = 0.52 + si * 0.12;

          for (let k = 0; k < numSubs; k++) {
            const t2   = numSubs === 1 ? 0 : (k / (numSubs - 1)) - 0.5;
            const aOff = t2 * spread + (this.rand() - 0.5) * 0.28;
            const zOff = (this.rand() - 0.5) * 0.38;
            this._growBranch(
              pt, localAng + aOff, sp.z + zOff,
              subLen, subW, 3, 0, sp.droop,
              geos, tips, leafPts
            );
          }
        });

        // ── Anchor: computed after _growBranch so tips[] is populated ──────
        // Use the "outer" portion of tips — the tips furthest from the trunk
        // in the branch's natural direction. This spreads labels across the canopy.
        let anchor;
        const validTips = tips.filter(t => t.y > 15);
        if (validTips.length >= 3) {
          let selected;
          if (sp.angle < -0.06) {
            // Left-leaning branch → outermost tips, but above a height floor so drooping
            // outer limbs don't project to the same low Y as their inner neighbours.
            const minY  = sp.droop > 0.15 ? 50 : 20;   // raise floor for steep-droop limbs
            const pool  = validTips.filter(t => t.y > minY);
            const sorted = [...(pool.length >= 2 ? pool : validTips)].sort((a, b) => a.x - b.x);
            selected = sorted.slice(0, Math.max(2, Math.floor(sorted.length * 0.38)));
          } else if (sp.angle > 0.06) {
            // Right-leaning branch — mirror of left strategy
            const minY  = sp.droop > 0.15 ? 50 : 20;
            const pool  = validTips.filter(t => t.y > minY);
            const sorted = [...(pool.length >= 2 ? pool : validTips)].sort((a, b) => b.x - a.x);
            selected = sorted.slice(0, Math.max(2, Math.floor(sorted.length * 0.38)));
          } else {
            // Near-vertical (central) branch → highest 35% of tips
            const sorted = [...validTips].sort((a, b) => b.y - a.y);
            selected = sorted.slice(0, Math.max(2, Math.floor(sorted.length * 0.35)));
          }
          anchor = new THREE.Vector3(
            selected.reduce((a, t) => a + t.x, 0) / selected.length,
            selected.reduce((a, t) => a + t.y, 0) / selected.length,
            selected.reduce((a, t) => a + t.z, 0) / selected.length
          );
          // Keep labels from clipping on narrow viewports — pull extreme branches inward
          anchor.x = Math.max(-290, Math.min(290, anchor.x));
        } else {
          // Fallback: walk outer 40–78% of primary limb, find highest Y
          anchor = primCurve.getPoint(0.42);
          for (let tt = 0.48; tt <= 0.78; tt += 0.05) {
            const p = primCurve.getPoint(tt);
            if (p.y > anchor.y) anchor = p.clone();
          }
        }

        if (geos.length) {
          const mat  = new THREE.MeshLambertMaterial({ color: C.bark });
          const mesh = new THREE.Mesh(mergeGeos(geos), mat);
          mesh.castShadow = true;
          this.scene.add(mesh);
          this.branchGroups[i] = { mesh, mat, tips, anchor, primCurve };
        }
        this._makeLeaves(i, leafPts);
      }
    }

    /* Primary limb S-curve: rises vertically from trunk, then arches outward.
       This is the signature shape of a real banyan scaffold limb. */
    _makeLimbCurve(start, angle, zMult, len, droop) {
      const sign = angle < 0 ? -1 : 1;
      // Scaffold arm droop: capped at 2× so tip stays near ground, not underground
      const fullDroop = sign * droop * 2.2;

      // p0: trunk attachment
      const p0 = start.clone();
      // p1: rises mostly vertical, just beginning to lean
      const p1 = new THREE.Vector3(
        start.x + Math.sin(angle * 0.18) * len * 0.15,
        start.y + len * 0.26,
        start.z + zMult * len * 0.08
      );
      // p2: mid-arch — now leaning more toward angle
      const p2 = new THREE.Vector3(
        start.x + Math.sin(angle * 0.62) * len * 0.52,
        start.y + Math.cos(angle * 0.62) * len * 0.52 + (this.rand() - 0.5) * len * 0.06,
        start.z + zMult * len * 0.20 + (this.rand() - 0.5) * len * 0.04
      );
      // p3: final tip at full angle + accumulated droop
      const tipAngle = angle + fullDroop;
      const p3 = new THREE.Vector3(
        start.x + Math.sin(tipAngle) * len,
        start.y + Math.cos(tipAngle) * len,
        start.z + zMult * len * 0.34 + (this.rand() - 0.5) * len * 0.03
      );

      return new THREE.CatmullRomCurve3([p0, p1, p2, p3]);
    }

    /* Recursive sub-branch grower */
    _growBranch(start, angle, zAngle, len, width, depth, droopAccum, droopRate,
                geos, tips, leafPts) {
      const sign      = angle < 0 ? -1 : 1;
      const effAngle  = angle + sign * droopAccum;

      const wob = len * 0.12;
      const end = new THREE.Vector3(
        start.x + Math.sin(effAngle) * len,
        start.y + Math.cos(effAngle) * len,
        start.z + Math.sin(zAngle) * len * 0.30
      );
      const mid = new THREE.Vector3(
        (start.x + end.x) * 0.5 + (this.rand() - 0.5) * wob,
        (start.y + end.y) * 0.5 + (this.rand() - 0.5) * wob * 0.55,
        (start.z + end.z) * 0.5 + (this.rand() - 0.5) * wob * 0.90
      );

      const segs  = Math.max(3, Math.floor(len / 18));
      const rSegs = width > 5 ? 8 : (width > 2.5 ? 6 : 4);
      geos.push(new THREE.TubeGeometry(
        new THREE.QuadraticBezierCurve3(start, mid, end),
        segs, width / 2, rSegs, false
      ));
      const sGeo = new THREE.SphereGeometry(width / 2, rSegs, rSegs);
      sGeo.translate(start.x, start.y, start.z);
      geos.push(sGeo);
      const eGeo = new THREE.SphereGeometry(width / 2, rSegs, rSegs);
      eGeo.translate(end.x, end.y, end.z);
      geos.push(eGeo);

      // Leaf attachment at mid-branch for depth ≤ 3
      if (depth <= 3 && len > 16) leafPts.push(mid.clone());

      if (depth <= 0 || len < 14) {
        tips.push(end.clone());
        leafPts.push(end.clone());
        return;
      }

      const splits = this.rand() < 0.50 ? 2 : 3;
      const spread = 0.46 + (4 - depth) * 0.22;
      for (let i = 0; i < splits; i++) {
        const t    = splits === 1 ? 0 : (i / (splits - 1)) - 0.5;
        const aOff = t * spread + (this.rand() - 0.5) * 0.24;
        const zOff = (this.rand() - 0.5) * 0.28;
        const nLen = len   * (0.53 + this.rand() * 0.24);
        // Aggressive taper — deep branches become hair-thin twigs
        const nW   = Math.max(0.55, width * (0.46 + this.rand() * 0.10));
        this._growBranch(
          end, angle + aOff, zAngle + zOff, nLen, nW,
          depth - 1, droopAccum + droopRate, droopRate,
          geos, tips, leafPts
        );
      }
    }

    /* ── Leaves — 3-layer instanced spheres ─────────────────────────────── */
    _makeLeaves(catIdx, pts) {
      if (!pts.length) return;
      const perPt = 5, total = pts.length * perPt, dummy = new THREE.Object3D();

      const makeLayer = (color, opacity, yOff, sx, sy) => {
        // Low-poly sphere geometry for massive performance boost
        const geo  = new THREE.SphereGeometry(1, 4, 3);
        const mat  = new THREE.MeshLambertMaterial({ color, transparent: opacity < 1, opacity });
        
        mat.onBeforeCompile = (shader) => {
          shader.uniforms.uTime = this.scene.userData.uniforms.uTime;
          shader.vertexShader = `
            uniform float uTime;
            ${shader.vertexShader}
          `.replace(
            `#include <begin_vertex>`,
            `
            #include <begin_vertex>
            vec3 worldPos = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
            float swayX = sin(uTime * 1.5 + worldPos.x * 0.02 + worldPos.y * 0.05) * 1.5;
            float swayZ = cos(uTime * 1.1 + worldPos.z * 0.02 - worldPos.y * 0.05) * 1.5;
            transformed.x += swayX;
            transformed.z += swayZ;
            `
          );
        };

        const mesh = new THREE.InstancedMesh(geo, mat, total);
        mesh.castShadow = false;
        let k = 0;
        pts.forEach(p => {
          for (let j = 0; j < perPt; j++) {
            // Tighter jitter to ensure leaves cluster around the twigs instead of floating in space
            dummy.position.set(
              p.x + (this.rand() - 0.5) * 15,
              p.y + (this.rand() - 0.5) * 10 + yOff,
              p.z + (this.rand() - 0.5) * 12
            );
            const s = sx * (0.55 + this.rand() * 1.0);
            const h = sy * (0.55 + this.rand() * 1.0);
            dummy.scale.set(s, h, s);
            dummy.rotation.set(this.rand() * Math.PI, this.rand() * Math.PI, this.rand() * Math.PI);
            dummy.updateMatrix();
            mesh.setMatrixAt(k++, dummy.matrix);
          }
        });
        mesh.instanceMatrix.needsUpdate = true;
        this.scene.add(mesh);
        return { mesh, mat };
      };

      // Tapered leaf clusters scaled down to look like foliage instead of massive balloons
      const back  = makeLayer(C.leaf0, 0.70, -1, 5.5, 4.0);
      const mid   = makeLayer(C.leaf1, 0.80,  0, 7.0, 5.0);
      const front = makeLayer(C.leaf3, 0.88,  1, 5.5, 3.5);
      this.leafGroups[catIdx] = { back, mid, front };
    }

    /* ── Aerial roots ────────────────────────────────────────────────────── */
    /* ── Aerial prop-roots — one per condition, grouped per category.
         Each root hangs from a branch tip; its attachment point becomes the
         3D anchor for the condition label in the overlay. */
    _aerials() {
      this.catAerialMeshes   = {};
      this.catAerialAnchors  = {};

      for (let catIdx = 0; catIdx < 12; catIdx++) {
        const cat     = BanyanData.categories[catIdx];
        if (!cat) continue;
        const numConds = cat.conditions.length;
        
        const bg = this.branchGroups[catIdx];
        if (!bg || !bg.primCurve) continue;

        const anchors = [], geos = [];

        for (let j = 0; j < numConds; j++) {
          // Distribute securely along the primary branch curve for all conditions
          const step = numConds > 1 ? j / (numConds - 1) : 0.5;
          const t = 0.35 + 0.60 * step; // Spread between 0.35 and 0.95
          const attachPt = bg.primCurve.getPoint(t);
          attachPt.y -= 4.0; // Sink inside the tube slightly

          // Fan them out tangentially so they don't overlap in perspective
          const outward = new THREE.Vector3(attachPt.x, 0, attachPt.z).normalize();
          const perp = new THREE.Vector3(-outward.z, 0, outward.x);
          const fanOffset = (j % 3 === 0) ? -1 : (j % 3 === 1) ? 0 : 1;
          attachPt.add(perp.multiplyScalar(fanOffset * 22));

          // Randomize X and Z slightly for natural swaying, but keep top securely anchored
          const groundY = 1 + this.rand() * 7;
          const swayX   = (this.rand() - 0.5) * 16;
          const swayZ   = (this.rand() - 0.5) * 10;
          const curvePts = [
            attachPt.clone(),
            new THREE.Vector3(
              attachPt.x + swayX * 0.38,
              attachPt.y * 0.55 + groundY * 0.45,
              attachPt.z + swayZ * 0.38
            ),
            new THREE.Vector3(attachPt.x + swayX, groundY, attachPt.z + swayZ),
          ];

          const thick = 0.50 + this.rand() * 0.65;
          geos.push(new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(curvePts), 9, thick, 4, false
          ));
          anchors.push(attachPt.clone());
        }

        if (geos.length) {
          const mat  = new THREE.MeshLambertMaterial({
            color: C.barkLight, transparent: true, opacity: 0.22
          });
          const mesh = new THREE.Mesh(mergeGeos(geos), mat);
          this.scene.add(mesh);
          this.catAerialMeshes[catIdx] = { mesh, mat };
        }
        this.catAerialAnchors[catIdx] = anchors;
      }
    }

    /* ── Underground root system ─────────────────────────────────────────── */
    _roots() {
      // Root trunk (mirror of above trunk)
      const rGeo = new THREE.CylinderGeometry(52, 14, 138, 16, 1);
      rGeo.translate(0, -69, 0);
      const rMat = new THREE.MeshLambertMaterial({ color: C.barkShade });
      if (this.trunkMats) this.trunkMats.push({ mat: rMat, color: C.barkShade });
      this.scene.add(new THREE.Mesh(rGeo, rMat));

      // Lateral root spread at base
      const sMat = new THREE.MeshLambertMaterial({ color: C.rootMid });
      if (this.trunkMats) this.trunkMats.push({ mat: sMat, color: C.rootMid });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const pts = [
          new THREE.Vector3(Math.cos(a)*10, -2, Math.sin(a)*10),
          new THREE.Vector3(Math.cos(a) * 52, -22, Math.sin(a) * 52),
          new THREE.Vector3(Math.cos(a) * 88, -14, Math.sin(a) * 88),
        ];
        this.scene.add(new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 6, 5.5, 6),
          sMat
        ));
      }

      const ANGLES = [-1.28, -0.84, -0.44, 0, 0.44, 0.84, 1.28];
      ANGLES.forEach((a, i) => {
        const geos = [], tipH = { v: new THREE.Vector3(0, -220, 0) };
        const start = new THREE.Vector3(Math.cos(a)*10 + (this.rand()-0.5)*4, -5, Math.sin(a)*10 + (this.rand()-0.5)*4);
        this._growRoot(start, a, 128 + this.rand() * 28, 9.5, 4, geos, tipH);
        if (geos.length) {
          const mat  = new THREE.MeshLambertMaterial({ color: C.rootDark });
          
          mat.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = this.scene.userData.uniforms.uTime;
            shader.uniforms.uIsLit = { value: 0 };
            mat.userData.shader = shader;
            
            shader.vertexShader = `
              varying vec3 vWorldPos;
              ${shader.vertexShader}
            `.replace(
              `#include <worldpos_vertex>`,
              `
              #include <worldpos_vertex>
              vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
              `
            );

            shader.fragmentShader = `
              uniform float uTime;
              uniform float uIsLit;
              varying vec3 vWorldPos;
              ${shader.fragmentShader}
            `.replace(
              `#include <dithering_fragment>`,
              `
              #include <dithering_fragment>
              if (uIsLit > 0.5) {
                 float pulse = sin(vWorldPos.y * 0.05 + uTime * 3.0);
                 pulse = smoothstep(0.85, 1.0, pulse);
                 gl_FragColor.rgb += vec3(1.0, 0.8, 0.2) * pulse * 0.8;
              }
              `
            );
          };

          const mesh = new THREE.Mesh(mergeGeos(geos), mat);
          this.scene.add(mesh);
          this.rootGroups[i] = { mesh, mat, tipPos: tipH.v };
        }
      });
    }

    _growRoot(start, angle, len, width, depth, geos, tipHolder) {
      const end = new THREE.Vector3(
        start.x + Math.sin(angle) * len * 0.85,
        start.y - len * (0.6 + Math.abs(Math.cos(angle)) * 0.4),
        start.z + (this.rand() - 0.5) * len * 0.26
      );
      const mid = new THREE.Vector3(
        (start.x + end.x) * 0.5 + (this.rand() - 0.5) * len * 0.14,
        (start.y + end.y) * 0.5 + (this.rand() - 0.5) * len * 0.10,
        (start.z + end.z) * 0.5 + (this.rand() - 0.5) * len * 0.12
      );
      geos.push(new THREE.TubeGeometry(
        new THREE.QuadraticBezierCurve3(start, mid, end),
        Math.max(3, Math.floor(len / 22)), width / 2, 5
      ));
      const sGeo = new THREE.SphereGeometry(width / 2, 8, 8);
      sGeo.translate(start.x, start.y, start.z);
      geos.push(sGeo);
      const eGeo = new THREE.SphereGeometry(width / 2, 5, 5);
      eGeo.translate(end.x, end.y, end.z);
      geos.push(eGeo);
      if (depth <= 0 || len < 22) { tipHolder.v = end.clone(); return; }
      const splits = this.rand() < 0.55 ? 2 : 3;
      const spread = 0.50 + (4 - depth) * 0.14;
      for (let j = 0; j < splits; j++) {
        const t    = splits === 1 ? 0 : (j / (splits - 1)) - 0.5;
        const aOff = t * spread + (this.rand() - 0.5) * 0.30;
        this._growRoot(end, angle + aOff, len * (0.60 + this.rand() * 0.22),
          Math.max(1.2, width * (0.56 + this.rand() * 0.10)), depth - 1, geos, tipHolder);
      }
    }

    /* ── State setters ───────────────────────────────────────────────────── */
    setLitCategory(catIdx) {
      for (let i = 0; i < 12; i++) {
        const bg = this.branchGroups[i], lg = this.leafGroups[i];
        const am = this.catAerialMeshes?.[i];
        if (!bg) continue;
        const isLit = catIdx === i, isDim = catIdx != null && !isLit;

        // Branches
        bg.mat.color.setHex(isDim ? 0x160c04 : C.bark);
        bg.mat.transparent = isDim; bg.mat.opacity = isDim ? 0.16 : 1.0; bg.mat.needsUpdate = true;

        // Leaves
        if (lg) {
          [lg.back, lg.mid, lg.front].filter(Boolean).forEach(l => {
            l.mat.color.setHex(isLit ? C.leafLit : isDim ? 0x141c0c :
              l === lg.front ? C.leaf3 : l === lg.mid ? C.leaf1 : C.leaf0);
            l.mat.transparent = isDim || l.mat.opacity < 1;
            l.mat.opacity     = isDim ? 0.14 : l === lg.front ? 0.88 : l === lg.mid ? 0.80 : 0.70;
            l.mat.needsUpdate = true;
          });
        }

        // Aerial roots — hide non-selected entirely (saves draw calls)
        if (am) {
          if (catIdx === null) {
            // Canopy: show all dimly
            am.mesh.visible = true;
            am.mat.color.setHex(C.barkLight);
            am.mat.opacity = 0.22;
          } else if (isLit) {
            // Category selected: highlight its roots
            am.mesh.visible = true;
            am.mat.color.setHex(C.bark);
            am.mat.opacity = 0.62;
          } else {
            // Dim: hide entirely for performance
            am.mesh.visible = false;
          }
          am.mat.needsUpdate = true;
        }
      }
    }

    setLitRoot(rootIdx) {
      for (let i = 0; i < 7; i++) {
        const rg = this.rootGroups[i]; if (!rg) continue;
        const isLit = rootIdx === i, isAmb = rootIdx < 0, isDim = rootIdx >= 0 && !isLit;
        rg.mat.color.setHex(isLit ? C.rootLit : isAmb ? C.rootAmbient : isDim ? 0x0a0604 : C.rootDark);
        rg.mat.transparent = isDim; rg.mat.opacity = isDim ? 0.22 : 1.0; 
        if (rg.mat.userData.shader) {
          rg.mat.userData.shader.uniforms.uIsLit.value = isLit ? 1.0 : 0.0;
        }
        rg.mat.needsUpdate = true;
      }
    }

    getCategoryTips() {
      const r = {};
      for (let i = 0; i < 12; i++) r[i] = this.branchGroups[i]?.tips ?? [];
      return r;
    }
    getRootTips() {
      const r = {};
      for (let i = 0; i < 7; i++) r[i] = this.rootGroups[i]?.tipPos ?? new THREE.Vector3(0, -220, 0);
      return r;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     ThreeApp
   ═══════════════════════════════════════════════════════════════════════════ */
  class ThreeApp {
    constructor(container) {
      this.container = container;
      this.w = container.clientWidth  || window.innerWidth;
      this.h = container.clientHeight || window.innerHeight;
      this._initRenderer();
      this._initScene();
      this._initCamera();
      this._initLights();
      this._initTree();
      this._initResize();

      // Wide-angle canopy view — slightly below canopy mid-point so the full
      // tree arc is framed with comfortable margin on all sides.
      this._camPos    = new THREE.Vector3(0, 150, 950);
      this._camTarget = new THREE.Vector3(0, 175, 0);
      this._tPos      = this._camPos.clone();
      this._tTarget   = this._camTarget.clone();
      this.camera.position.copy(this._camPos);
      this.camera.lookAt(this._camTarget);

      this.onTick = null; this._running = false; this._raf = null;
    }

    _initRenderer() {
      const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      r.setSize(this.w, this.h);
      r.shadowMap.enabled   = true;
      r.shadowMap.type      = THREE.PCFSoftShadowMap;
      r.toneMapping         = THREE.ACESFilmicToneMapping;
      r.toneMappingExposure = 1.18;
      r.outputColorSpace    = THREE.SRGBColorSpace;
      r.setClearColor(0x000000, 0);
      this.container.appendChild(r.domElement);
      this.renderer = r;
    }

    _initScene() {
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x8DA9C4, 0.00048); // Match fog to new horizon color
      this.scene.background = null;
      this.scene.userData.uniforms = { uTime: { value: 0 } };
    }

    _initCamera() {
      this.camera = new THREE.PerspectiveCamera(58, this.w / this.h, 1, 9000);
    }

    _initLights() {
      this.scene.add(new THREE.AmbientLight(0xfff8f0, 0.65));

      const sun = new THREE.DirectionalLight(0xffeedd, 1.35); // Boosted sun intensity for contrast
      sun.position.set(360, 640, 240);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.near = 10; sun.shadow.camera.far = 2800;
      sun.shadow.camera.left = sun.shadow.camera.bottom = -1000;
      sun.shadow.camera.right = sun.shadow.camera.top   =  1000;
      sun.shadow.bias = -0.001;
      this.scene.add(sun);

      this.scene.add(new THREE.HemisphereLight(0xfff0e4, 0x2C4C3B, 0.55)); // Tie hemisphere to new ground color

      const fill = new THREE.PointLight(0xd89830, 0.35, 1900);
      fill.position.set(0, -40, 500);
      this.scene.add(fill);

      const rim = new THREE.DirectionalLight(0x8DA9C4, 0.90); // Cinematic rim
      rim.position.set(-480, 360, -540);
      this.scene.add(rim);

      const under = new THREE.PointLight(0x502010, 0.32, 1300);
      under.position.set(0, -270, 180);
      this.scene.add(under);
    }

    _initTree() {
      const rand = mulberry32(42);
      this.tree     = new BanyanTree(this.scene, rand);
      this.catTips  = this.tree.getCategoryTips();
      this.rootTips = this.tree.getRootTips();
      this._initSpores();
    }

    _initSpores() {
      const pCount = 600;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(pCount * 3);
      const phases = new Float32Array(pCount);
      for (let i = 0; i < pCount; i++) {
        pos[i * 3 + 0] = (Math.random() - 0.5) * 1600; // x
        pos[i * 3 + 1] = Math.random() * 600 - 200;    // y
        pos[i * 3 + 2] = (Math.random() - 0.5) * 1600; // z
        phases[i] = Math.random() * Math.PI * 2;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: this.scene.userData.uniforms.uTime,
          color: { value: new THREE.Color(0xfff5c2) }
        },
        vertexShader: `
          uniform float uTime;
          attribute float phase;
          varying float vAlpha;
          void main() {
            vec3 p = position;
            p.x += sin(uTime * 0.2 + phase) * 80.0;
            p.y += cos(uTime * 0.15 + phase) * 40.0;
            p.z += sin(uTime * 0.1 + phase) * 80.0;
            vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = clamp(2000.0 / -mvPosition.z, 0.5, 8.0);
            vAlpha = 0.2 + 0.5 * sin(uTime * 0.8 + phase * 2.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          varying float vAlpha;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float a = (0.5 - dist) * 2.0 * vAlpha;
            gl_FragColor = vec4(color, a);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      this.spores = new THREE.Points(geo, mat);
      this.scene.add(this.spores);
    }

    _initResize() {
      this._onResize = () => {
        this.w = this.container.clientWidth; this.h = this.container.clientHeight;
        this.camera.aspect = this.w / this.h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.w, this.h);
      };
      window.addEventListener('resize', this._onResize);
    }

    start() { this._running = true; this._tick(); }

    stop() {
      this._running = false;
      if (this._raf) cancelAnimationFrame(this._raf);
      window.removeEventListener('resize', this._onResize);
      this.renderer.dispose();
      const ext = this.renderer.getContext().getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
      if (this.renderer.domElement.parentNode)
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    _tick() {
      if (!this._running) return;
      this._raf = requestAnimationFrame(() => this._tick());
      this.scene.userData.uniforms.uTime.value = performance.now() / 1000;
      this._camPos.lerp(this._tPos, 0.040);
      this._camTarget.lerp(this._tTarget, 0.040);
      this.camera.position.copy(this._camPos);
      this.camera.lookAt(this._camTarget);
      this.renderer.render(this.scene, this.camera);
      if (this.onTick) this.onTick(this._projectCats(), this._projectRoots());
    }

    _project(v3) {
      const v = v3.clone().project(this.camera);
      return { x: (v.x * 0.5 + 0.5) * this.w, y: (-v.y * 0.5 + 0.5) * this.h, vis: v.z < 1.0 };
    }

    _projectCats() {
      const result = {};
      for (let i = 0; i < 12; i++) {
        const bg = this.tree.branchGroups[i];
        result[i] = bg ? this._project(bg.anchor) : null;
      }
      return result;
    }

    _projectRoots() {
      return Object.fromEntries(
        Object.entries(this.rootTips).map(([i, v]) => [i, this._project(v)])
      );
    }

    projectTips(catIdx) {
      return (this.catTips[catIdx] ?? []).map(t => this._project(t));
    }

    /* Project each aerial root's attachment point to screen-space.
       Returns one entry per condition in the selected category. */
    getAerialPositions(catIdx) {
      const anchors = this.tree.catAerialAnchors?.[catIdx] ?? [];
      return anchors.map(a => this._project(a));
    }

    setPhase(phase, selectedCategory, selectedRoot) {
      if (phase === 'canopy') {
        this._tPos.set(0, 150, 950);
        this._tTarget.set(0, 175, 0);
        this.tree.setLitCategory(null);
        this.tree.setLitRoot(-99);

      } else if (phase === 'category' && selectedCategory != null) {
        // Frame camera toward the selected branch's aerial root cluster
        const aerials = this.tree.catAerialAnchors?.[selectedCategory] ?? [];
        const pts     = aerials.length ? aerials : (this.catTips[selectedCategory] ?? []);
        const n       = pts.length || 1;
        const tx      = pts.reduce((a, t) => a + t.x, 0) / n;
        const ty      = pts.reduce((a, t) => a + t.y, 0) / n;
        const tz      = pts.reduce((a, t) => a + t.z, 0) / n;
        
        // Shift camera to the side of the branch rather than looking down the barrel, so labels spread horizontally
        const dir = new THREE.Vector3(tx, 0, tz).normalize();
        const perp = new THREE.Vector3(-dir.z, 0, dir.x);
        
        const camPos = new THREE.Vector3(tx, Math.max(ty, 60) + 120, tz).add(dir.multiplyScalar(150)).add(perp.multiplyScalar(320));

        this._tPos.copy(camPos);
        this._tTarget.set(tx, Math.max(ty, 30), tz);
        this.tree.setLitCategory(selectedCategory);
        this.tree.setLitRoot(-1);

      } else if (phase === 'roots' || phase === 'detail') {
        this._tPos.set(0, -120, 600);
        this._tTarget.set(0, -280, 0);
        this.tree.setLitCategory(null);
        const rootIdx = selectedRoot != null ? BanyanData.rootOrder.indexOf(selectedRoot) : -1;
        this.tree.setLitRoot(rootIdx);
      }
    }
  }

export default ThreeApp;
