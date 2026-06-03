/* tree3d.js — Organic Banyan Tree
   Key realism principles:
   - Primary branches are THICK and use 4-pt CatmullRom with "rise-then-arch" shape
   - Each primary limb first grows upward from the trunk, then bends outward
   - Width tapers aggressively so outer twigs are hair-thin
   - Z-spread alternates strongly per limb for genuine 3D depth
   - Aerial roots hang from outer limb tips only */

import * as THREE from 'three';
import { BanyanData } from './data.js';
import canopyBackUrl from './assets/canopy-layer-back.webp';
import canopyMidUrl from './assets/canopy-layer-mid.webp';
import canopyDetailUrl from './assets/canopy-leaf-detail.webp';
import barkRidgeUrl from './assets/banyan-bark-ridge.webp';
import mossGroundUrl from './assets/moss-rock-ground.webp';
import rootGlowUrl from './assets/root-glow-sprite.webp';

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
    // Wood & Bark
    bark:          0x6a4428,
    barkLight:     0x8b623a,
    barkMid:       0x704d2f,
    barkShade:     0x4b321f,

    // Muted banyan greens: alive, not saturated or game-like.
    leaf0:         0x4c6538,
    leaf1:         0x607b45,
    leaf2:         0x78915b,
    leaf3:         0x92a86f,
    leafLit:       0xb8c884,

    // Roots — warm earthy ochre tones
    rootDark:      0x3b2918,
    rootMid:       0x6f4828,
    rootAmbient:   0x8a633e,
    rootLit:       0xe4b86a,
    // Ground — warm grass/earth
    ground:        0xcdd8a9,
    groundFar:     0xbac797,
  };

  function applyBarkShader(mat, scene) {
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = scene.userData.uniforms.uTime;
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
        varying vec3 vWorldPos;
        ${shader.fragmentShader}
      `.replace(
        `#include <map_fragment>`,
        `
        #include <map_fragment>
        // Fast procedural noise for subtle color variation
        float n = fract(sin(dot(vWorldPos.xyz, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        vec3 barkBase = vec3(0.65, 0.55, 0.45);
        vec3 barkHighlights = vec3(0.9, 0.8, 0.7);
        vec3 textureMod = mix(barkBase, barkHighlights, n * 0.4);
        diffuseColor.rgb *= textureMod;

        // Glowing golden veins flowing along the bark
        // Use world position to create winding vein lines
        float veinNoise = sin(vWorldPos.x * 0.12 + vWorldPos.y * 0.08) * 
                          cos(vWorldPos.z * 0.12 - vWorldPos.y * 0.06);
        float veinWidth = 0.94; // Threshold to make veins narrow
        float veinMask = smoothstep(veinWidth, 1.0, veinNoise);
        
        // Add time-based pulsing wave moving upwards
        float wave = sin(vWorldPos.y * 0.04 - uTime * 2.0) * 0.5 + 0.5;
        vec3 goldVeinColor = vec3(1.0, 0.72, 0.25) * veinMask * wave * 1.5;
        
        diffuseColor.rgb += goldVeinColor;
        `
      );
    };
  }

  function createSingleLeafGeometry() {
    const geo = new THREE.BufferGeometry();
    
    // Vertices for a beautiful creased organic leaf:
    // Base at (0,0,0), tip at (0, 1.4, 0), mid-left/right at X = -0.45 / 0.45
    // Spreading slightly on Z axis for organic curvature
    const vertices = new Float32Array([
      0.0,  0.0,  0.0,     // 0: base
     -0.45, 0.6, -0.05,    // 1: mid-left (bent back)
      0.0,  0.7,  0.15,    // 2: mid-spine (creased forward)
      0.45, 0.6, -0.05,    // 3: mid-right (bent back)
      0.0,  1.4,  0.0      // 4: tip
    ]);

    // Front indices
    const indices = new Uint16Array([
      0, 2, 1, // left half base
      1, 2, 4, // left half tip
      0, 3, 2, // right half base
      2, 3, 4  // right half tip
    ]);

    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    geo.computeVertexNormals();

    return geo;
  }

  function createLeafClusterGeometry() {
    const leafGeos = [];
    const leafCount = 8;
    
    // 8 leaves radially distributed in a beautiful cluster
    for (let i = 0; i < leafCount; i++) {
      const leaf = createSingleLeafGeometry();
      
      // Jitter scale slightly
      const scale = 1.0 + Math.sin(i * 1.7) * 0.25; // 0.75 to 1.25
      leaf.scale(scale, scale, scale);
      
      // Radial distribution angle
      const angleY = (i / leafCount) * Math.PI * 2 + Math.sin(i * 2.3) * 0.2;
      
      // Outward tilt: alternate between slightly higher/lower angles for volume
      const tilt = 0.4 + Math.sin(i * 1.5) * 0.25; // 0.15 to 0.65 rad (~8 to 37 deg)
      
      leaf.rotateX(tilt);
      leaf.rotateY(angleY);
      
      // Translate outwards from the center branchlet stem
      const dist = 0.6 + Math.sin(i * 1.1) * 0.2;
      leaf.translate(
        Math.sin(angleY) * dist,
        Math.cos(tilt) * 0.35 + (i * 0.15), // stack vertically to form a lush bunch
        Math.cos(angleY) * dist
      );
      
      leafGeos.push(leaf);
    }
    
    const merged = mergeGeos(leafGeos);
    leafGeos.forEach(g => g.dispose());
    return merged;
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     BanyanTree
   ═══════════════════════════════════════════════════════════════════════════ */
  class BanyanTree {
    constructor(scene, rand) {
      this.scene = scene; this.rand = rand;
      this.branchGroups = {}; this.leafGroups = {}; this.rootGroups = {}; this.rootGlowSprites = {};
      this.leafGeo = createLeafClusterGeometry();
      this.textures = this._loadTextures();
      this._build();
    }

    _loadTextures() {
      const loader = new THREE.TextureLoader();
      const load = (url) => {
        const tex = loader.load(url);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        return tex;
      };
      const bark = load(barkRidgeUrl);
      bark.wrapS = bark.wrapT = THREE.RepeatWrapping;
      bark.repeat.set(2.5, 3.8);
      const moss = load(mossGroundUrl);
      moss.wrapS = moss.wrapT = THREE.RepeatWrapping;
      moss.repeat.set(1.6, 1.0);
      return {
        canopyBack: load(canopyBackUrl),
        canopyMid: load(canopyMidUrl),
        canopyDetail: load(canopyDetailUrl),
        bark,
        moss,
        rootGlow: load(rootGlowUrl),
      };
    }

    _build() {
      // Atmospheric fog matching the sunset horizon to create massive depth
      this.scene.fog = new THREE.FogExp2(0xf5edd6, 0.00018);

      // Create gradient map for stylized hand-painted toon shading
      const format = (THREE.RedFormat !== undefined) ? THREE.RedFormat : 1021; // fallback to old LuminanceFormat constant
      const colors = new Uint8Array([80, 160, 255]);
      this.toonGradient = new THREE.DataTexture(colors, 3, 1, format);
      this.toonGradient.needsUpdate = true;
      this.toonGradient.minFilter = THREE.NearestFilter;
      this.toonGradient.magFilter = THREE.NearestFilter;

      this._sky();
      this._ground();
      this._trunk();
      this._canopy();
      this._aerials();
      this._backgroundAerials();
      this._rocks();
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
        topColor: { value: new THREE.Color(0xbfd8e8) },
        bottomColor: { value: new THREE.Color(0xf2e3bf) }
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

      const mat = new THREE.MeshStandardMaterial({
        color: C.ground,
        map: this.textures.moss,
        roughness: 0.9,
        metalness: 0.0,
        side: THREE.DoubleSide
      });
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      m.position.y = -5; // Meet the trunk base perfectly
      m.receiveShadow = true;
      this.scene.add(m);

      // Fake shadow disk removed for better realism and to rely on actual shadow map
    }

    _trunk() {
      const H = 240, W_base = 48;
      const tGeo = new THREE.CylinderGeometry(W_base * 0.65, W_base, H, 24, 60);
      tGeo.translate(0, H / 2, 0);
      
      const pos = tGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
        const y = vy;
        const t = THREE.MathUtils.clamp(y / H, 0, 1);
        const angle = Math.atan2(vz, vx);
        const flare = 32 * Math.pow(1 - t, 3.5); // increased base flare
        // Soft, classic procedural noise for the bark
        const noise = Math.sin(y * 0.4) * Math.sin(angle * 8) * 0.5;
        const r = Math.sqrt(vx * vx + vz * vz);
        if (r > 0) {
          const nr = r + flare + noise;
          pos.setX(i, (vx / r) * nr);
          pos.setZ(i, (vz / r) * nr);
        }
      }
      tGeo.computeVertexNormals();

      // Revert to Standard material for bright, realistic lighting
      const tMat = new THREE.MeshStandardMaterial({
        color: C.bark,
        map: this.textures.bark,
        roughness: 0.95,
        metalness: 0.0
      });
      applyBarkShader(tMat, this.scene);
      if (!this.trunkMats) this.trunkMats = [];
      this.trunkMats.push({ mat: tMat, color: C.bark });

      const trunkMesh = new THREE.Mesh(tGeo, tMat);
      trunkMesh.castShadow = true; trunkMesh.receiveShadow = true;
      this.scene.add(trunkMesh);

      // Major structural columns merging into trunk (Strangler roots) - 8 columns winding tightly
      for (let i = 0; i < 8; i++) {
        const theta0 = (i / 8) * Math.PI * 2 + this.rand() * 0.2;
        const pts = [];
        for (let k = 0; k <= 8; k++) {
          const yVal = -5 + (H + 5) * (k / 8);
          const tVal = (yVal + 5) / (H + 5);
          // Twist them tightly around the trunk
          const theta = theta0 + tVal * Math.PI * 0.8 + Math.sin(tVal * Math.PI * 1.5) * 0.15;
          
          // Calculate the trunk radius at this height yVal
          const flare = 32 * Math.pow(1 - tVal, 3.5);
          const trunkR = W_base * (0.65 + (1.0 - 0.65) * (1.0 - tVal)) + flare;
          
          // Place columns slightly outside the trunk surface (seamless blend)
          const R = trunkR - 1.5;
          
          pts.push(new THREE.Vector3(
            Math.cos(theta) * R,
            yVal,
            Math.sin(theta) * R
          ));
        }
        const colCurve = new THREE.CatmullRomCurve3(pts);
        // Tube radius is much thinner to look like realistic wrapping strands
        const tubeRad = Math.max(2.2, W_base * 0.10 * (1.0 - tValFallback(i) * 0.40));
        const colGeo = new THREE.TubeGeometry(colCurve, 24, tubeRad, 8, false);
        const colMesh = new THREE.Mesh(colGeo, tMat);
        colMesh.castShadow = true; colMesh.receiveShadow = true;
        this.scene.add(colMesh);
      }
      
      function tValFallback(i) {
        return (i % 3 === 0 ? 0.3 : 0.0);
      }
    }

    /* ── Canopy — 12 category branches ─────────────────────────────────── */
    _canopy() {
      const H = 155; // trunk top

      const getSubCurve = (curve, tStart, tEnd) => {
        const pts = [];
        const steps = 6;
        for (let s = 0; s <= steps; s++) {
          const t = tStart + (tEnd - tStart) * (s / steps);
          pts.push(curve.getPoint(t));
        }
        return new THREE.CatmullRomCurve3(pts);
      };

      /* Each limb has:
           angle   — final arch direction from vertical (rad). Max ±0.88 (≈50°).
                     Primary branches RISE FIRST then arch out — see _makeLimbCurve.
           startY  — attachment height on trunk
           len     — length of the primary scaffold limb
           droop   — droop per recursion level for outer sub-branches
           z       — primary Z-direction multiplier (alternates for 3D depth)
           W       — primary tube radius — thick like a real scaffold limb */
      // Lower the canopy so it doesn't clip the top, keep organic spread
      const LIMBS = [
        { angle: -1.30 + this.rand()*0.1, startY: 100 + this.rand()*10, len: 380 + this.rand()*40, droop: 0.08 + this.rand()*0.02, z:  0.85, W: 26 },
        { angle: -1.10 + this.rand()*0.1, startY: 110 + this.rand()*10, len: 360 + this.rand()*30, droop: 0.06 + this.rand()*0.02, z: -0.65, W: 25 },
        { angle: -0.85 + this.rand()*0.1, startY: 120 + this.rand()*15, len: 340 + this.rand()*40, droop: 0.05 + this.rand()*0.02, z:  0.75, W: 24 },
        { angle: -0.60 + this.rand()*0.1, startY: 130 + this.rand()*15, len: 320 + this.rand()*30, droop: 0.03 + this.rand()*0.01, z: -0.45, W: 23 },
        { angle: -0.35 + this.rand()*0.1, startY: 140 + this.rand()*20, len: 290 + this.rand()*30, droop: 0.02 + this.rand()*0.01, z:  0.55, W: 22 },
        { angle: -0.12 + this.rand()*0.05, startY: 150 + this.rand()*20, len: 260 + this.rand()*30, droop: 0.01 + this.rand()*0.01, z: -0.25, W: 20 },
        { angle:  0.12 + this.rand()*0.05, startY: 150 + this.rand()*20, len: 260 + this.rand()*30, droop: 0.01 + this.rand()*0.01, z:  0.25, W: 20 },
        { angle:  0.35 + this.rand()*0.1, startY: 140 + this.rand()*20, len: 290 + this.rand()*30, droop: 0.02 + this.rand()*0.01, z: -0.55, W: 22 },
        { angle:  0.60 + this.rand()*0.1, startY: 130 + this.rand()*15, len: 320 + this.rand()*30, droop: 0.03 + this.rand()*0.01, z:  0.45, W: 23 },
        { angle:  0.85 + this.rand()*0.1, startY: 120 + this.rand()*15, len: 340 + this.rand()*40, droop: 0.05 + this.rand()*0.02, z: -0.75, W: 24 },
        { angle:  1.10 + this.rand()*0.1, startY: 110 + this.rand()*10, len: 360 + this.rand()*30, droop: 0.06 + this.rand()*0.02, z:  0.65, W: 25 },
        { angle:  1.30 + this.rand()*0.1, startY: 100 + this.rand()*10, len: 380 + this.rand()*40, droop: 0.08 + this.rand()*0.02, z: -0.85, W: 26 },
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

        // Segment the primary limb curve into 4 segments and taper them using TubeGeometry
        const joints = [0, 0.45, 0.65, 0.80, 1.0];
        const radii = [
          sp.W / 2,
          sp.W / 2 * 0.82,
          sp.W / 2 * 0.64,
          sp.W / 2 * 0.48,
          sp.W / 2 * 0.35
        ];

        // Draw segments with average radii of their endpoints
        for (let s = 0; s < 4; s++) {
          const tStart = joints[s];
          const tEnd = joints[s + 1];
          const avgRad = (radii[s] + radii[s + 1]) / 2;
          const subCurve = getSubCurve(primCurve, tStart, tEnd);
          geos.push(new THREE.TubeGeometry(subCurve, 6, avgRad, 10, false));
        }

        // Draw joint spheres to smooth the segment transitions and close ends
        joints.forEach((t, s) => {
          const pt = primCurve.getPoint(t);
          const rad = radii[s];
          const jointGeo = new THREE.SphereGeometry(rad, 8, 8);
          jointGeo.translate(pt.x, pt.y, pt.z);
          geos.push(jointGeo);
        });

        // Find the exact exit point on the trunk surface to place the branch collar
        let exitPt = null;
        for (let tVal = 0; tVal <= 1.0; tVal += 0.02) {
          const pt = primCurve.getPoint(tVal);
          const clampY = Math.max(0, Math.min(H, pt.y));
          const trunkR = 38 - (clampY / H) * 23 + 6; // average radius including minor buttress
          const distXZ = Math.sqrt(pt.x * pt.x + pt.z * pt.z);
          if (distXZ >= trunkR) {
            exitPt = pt.clone();
            break;
          }
        }
        if (!exitPt) {
          exitPt = primCurve.getPoint(0.3); // fallback
        }

        // Place the organic vertically flared collar at the surface exit point
        const collarR = sp.W * 0.75;
        const collarGeo = new THREE.SphereGeometry(collarR, 12, 12);
        collarGeo.scale(1.0, 1.25, 1.0); // vertical shoulder flare
        collarGeo.translate(exitPt.x, exitPt.y, exitPt.z);
        geos.push(collarGeo);

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
          const mat  = new THREE.MeshStandardMaterial({ color: C.bark, roughness: 0.9, metalness: 0.0 });
          applyBarkShader(mat, this.scene);
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
      // Scaffold arm droop: capped to prevent hitting the ground
      const fullDroop = sign * droop * 1.2;

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
      const effAngle  = angle + sign * droopAccum * 0.7;

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
      const spread = 0.52 + (4 - depth) * 0.24;
      for (let i = 0; i < splits; i++) {
        const t    = splits === 1 ? 0 : (i / (splits - 1)) - 0.5;
        const aOff = t * spread + (this.rand() - 0.5) * 0.24;
        const zOff = (this.rand() - 0.5) * 0.28;
        const nLen = len   * (0.56 + this.rand() * 0.24);
        // Aggressive taper — deep branches become hair-thin twigs
        const nW   = Math.max(0.55, width * (0.46 + this.rand() * 0.10));
        this._growBranch(
          end, angle + aOff, zAngle + zOff, nLen, nW,
          depth - 1, droopAccum + droopRate, droopRate,
          geos, tips, leafPts
        );
      }
    }

    /* ── Leaves — soft canopy masses plus restrained leaf detail ─────────── */
    _makeLeaves(catIdx, pts) {
      if (!pts.length) return;
      this._makeCanopyMass(catIdx, pts);
    }

    _makeCanopyMass(catIdx, pts) {
      const bounds = pts.reduce((acc, p) => {
        acc.minX = Math.min(acc.minX, p.x); acc.maxX = Math.max(acc.maxX, p.x);
        acc.minY = Math.min(acc.minY, p.y); acc.maxY = Math.max(acc.maxY, p.y);
        acc.minZ = Math.min(acc.minZ, p.z); acc.maxZ = Math.max(acc.maxZ, p.z);
        acc.sumX += p.x; acc.sumY += p.y; acc.sumZ += p.z;
        return acc;
      }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity, sumX: 0, sumY: 0, sumZ: 0 });
      const n = pts.length || 1;
      const center = new THREE.Vector3(bounds.sumX / n, bounds.sumY / n, bounds.sumZ / n);
      const width = Math.max(115, (bounds.maxX - bounds.minX) * 1.18);
      const height = Math.max(105, (bounds.maxY - bounds.minY) * 1.28);
      const zDepth = bounds.maxZ - bounds.minZ;

      const makeCard = (texture, opacity, scale, offset, tint, renderOrder) => {
        const geo = new THREE.PlaneGeometry(width * scale.x, height * scale.y, 1, 1);
        const mat = new THREE.MeshBasicMaterial({
          map: texture,
          color: tint,
          transparent: true,
          opacity,
          depthWrite: false,
          side: THREE.DoubleSide,
          alphaTest: 0.12,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
          center.x + offset.x + (this.rand() - 0.5) * 18,
          center.y + offset.y + (this.rand() - 0.5) * 14,
          center.z + offset.z + (this.rand() - 0.5) * 18
        );
        mesh.rotation.z = offset.r + (this.rand() - 0.5) * 0.09;
        mesh.renderOrder = renderOrder;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        this.scene.add(mesh);
        return { mesh, mat };
      };

      const xSign = Math.sign(center.x) || (catIdx < 6 ? -1 : 1);
      const back = [
        makeCard(this.textures.canopyBack, 0.96, { x: 0.72, y: 0.66 }, { x: -xSign * width * 0.05, y: 8, z: -44 - zDepth * 0.05, r: -0.03 }, 0xd7e0b2, -7),
        makeCard(this.textures.canopyBack, 0.90, { x: 0.54, y: 0.52 }, { x: xSign * width * 0.20, y: -2, z: -66 - zDepth * 0.04, r: 0.04 }, 0xc6d6a4, -7),
      ];
      const mid = [
        makeCard(this.textures.canopyMid, 0.98, { x: 0.62, y: 0.58 }, { x: 0, y: 0, z: -12, r: 0.0 }, 0xffffff, -5),
        makeCard(this.textures.canopyMid, 0.94, { x: 0.46, y: 0.44 }, { x: -xSign * width * 0.18, y: -8, z: 8, r: -0.05 }, 0xecf0c6, -5),
        makeCard(this.textures.canopyMid, 0.94, { x: 0.44, y: 0.42 }, { x: xSign * width * 0.22, y: -6, z: 10, r: 0.05 }, 0xe9edbf, -5),
      ];
      const front = [
        makeCard(this.textures.canopyDetail, 0.88, { x: 0.40, y: 0.38 }, { x: -xSign * width * 0.08, y: -12, z: 36 + zDepth * 0.04, r: -0.03 }, 0xf7efbd, -3),
        makeCard(this.textures.canopyDetail, 0.78, { x: 0.34, y: 0.32 }, { x: xSign * width * 0.12, y: -18, z: 54 + zDepth * 0.04, r: 0.04 }, 0xfff2bd, -3),
      ];

      this.leafGroups[catIdx] = { mass: null, back, mid, front };
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

          // Set tipPt hanging in the air dynamically based on category limb height
          const rootLength = 50 + (j % 4) * 22 + this.rand() * 12;
          const swayX   = (this.rand() - 0.5) * 20;
          const swayZ   = (this.rand() - 0.5) * 12;
          const tipPt = new THREE.Vector3(
            attachPt.x + swayX,
            attachPt.y - rootLength,
            attachPt.z + swayZ
          );

          const curvePts = [
            attachPt.clone(),
            new THREE.Vector3(
              attachPt.x + swayX * 0.4,
              attachPt.y - rootLength * 0.5,
              attachPt.z + swayZ * 0.4
            ),
            tipPt.clone()
          ];

          // Make the roots thicker and more real: 1.2 to 2.4 units (radius 0.6 to 1.2)
          const thick = 1.2 + this.rand() * 1.2;
          geos.push(new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(curvePts), 12, thick, 6, false
          ));
          anchors.push(tipPt);
        }

        if (geos.length) {
          const mat  = new THREE.MeshStandardMaterial({
            color: C.barkLight, roughness: 0.9, metalness: 0.02, transparent: true, opacity: 0.50
          });
          const mesh = new THREE.Mesh(mergeGeos(geos), mat);
          this.scene.add(mesh);
          this.catAerialMeshes[catIdx] = { mesh, mat };
        }
        this.catAerialAnchors[catIdx] = anchors;
      }
    }

    _backgroundAerials() {
      const clustersPerBranch = 3;
      const rootsPerCluster = 4;
      const totalRoots = 12 * clustersPerBranch * rootsPerCluster;
      const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 4, 1);
      cylGeo.translate(0, -0.5, 0); // Origin at top

      const mat = new THREE.MeshStandardMaterial({
        color: 0x4a321a, // warm earth tone
        roughness: 0.95,
        metalness: 0.0,
        transparent: true,
        opacity: 0.34,
        side: THREE.DoubleSide
      });

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
          // Very subtle sway for the hanging aerial roots
          float heightFactor = -position.y;
          float sway = sin(uTime * 0.4 + worldPos.x * 0.05) * 1.5 * heightFactor;
          float swayZ = cos(uTime * 0.3 + worldPos.z * 0.05) * 1.5 * heightFactor;
          transformed.x += sway;
          transformed.z += swayZ;
          `
        );
      };

      const mesh = new THREE.InstancedMesh(cylGeo, mat, totalRoots);
      mesh.castShadow = false; // Disable shadow casting for performance
      const dummy = new THREE.Object3D();
      let idx = 0;

      for (let catIdx = 0; catIdx < 12; catIdx++) {
        const bg = this.branchGroups[catIdx];
        if (!bg || !bg.primCurve) continue;

        for (let j = 0; j < clustersPerBranch; j++) {
          // Pick a random spot along the branch for the cluster
          const t = 0.15 + 0.80 * this.rand();
          const clusterCenter = bg.primCurve.getPoint(t);
          clusterCenter.y -= 2.0;
          
          for (let k = 0; k < rootsPerCluster; k++) {
            // Group roots tightly around this center
            const startPt = clusterCenter.clone();
            startPt.x += (this.rand() - 0.5) * 22;
            startPt.z += (this.rand() - 0.5) * 22;

            // Hanging length: reaching all the way to ground for most
            let rootLength = (startPt.y + 15 + this.rand() * 10) * (0.55 + this.rand() * 0.24);
            if (this.rand() < 0.45) {
              rootLength *= (0.35 + this.rand() * 0.35);
            }
            
            // Varied thicknesses for organic look
            const thickness = 0.12 + this.rand() * 0.28;

            dummy.position.copy(startPt);
            dummy.scale.set(thickness, rootLength, thickness);
            // Slight angle so they aren't perfectly straight wires
            dummy.rotation.set(
              (this.rand() - 0.5) * 0.05, 
              this.rand() * Math.PI, 
              (this.rand() - 0.5) * 0.05
            );
            dummy.updateMatrix();

            if (idx < totalRoots) {
              mesh.setMatrixAt(idx++, dummy.matrix);
            }
          }
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
      this.scene.add(mesh);
      this.bgAerialsMesh = mesh;
    }

    _rocks() {
      const rockMat = new THREE.MeshStandardMaterial({
        color: 0x484d3d, // mossy grey-green
        roughness: 0.95,
        metalness: 0.05,
      });

      // Perturb sphere vertices to create organic boulders
      const createRockGeometry = (radius, widthSeg, heightSeg) => {
        const geo = new THREE.SphereGeometry(radius, widthSeg, heightSeg);
        const pos = geo.attributes.position;
        const v = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i);
          const noise = Math.sin(v.x * 0.15) * Math.cos(v.y * 0.15) * Math.sin(v.z * 0.15) * (radius * 0.22) +
                        Math.sin(v.x * 0.4) * Math.cos(v.z * 0.4) * (radius * 0.08);
          v.addScaledVector(v.clone().normalize(), noise);
          pos.setXYZ(i, v.x, v.y, v.z);
        }
        geo.computeVertexNormals();
        return geo;
      };

      this.rocksData = [
        { radius: 28, pos: [-70, -2, 40], scale: [1.2, 0.9, 1.1] },
        { radius: 22, pos: [-45, -12, -40], scale: [1.0, 1.0, 1.0] },
        { radius: 25, pos: [65, -8, 15], scale: [1.1, 0.9, 1.0] },
        { radius: 16, pos: [-35, -14, 55], scale: [1.2, 0.8, 1.0] },
        { radius: 20, pos: [-90, -8, 10], scale: [1.0, 1.2, 0.9] },
        { radius: 18, pos: [40, -12, 45], scale: [1.1, 0.8, 1.1] },
      ];

      this.rocksData.forEach(data => {
        const geo = createRockGeometry(data.radius, 12, 12);
        const mesh = new THREE.Mesh(geo, rockMat);
        mesh.position.set(data.pos[0], data.pos[1], data.pos[2]);
        mesh.scale.set(data.scale[0], data.scale[1], data.scale[2]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
      });
    }

    _roots() {
      // Lateral root spread at base (wrapping over rocks)
      const sMat = new THREE.MeshStandardMaterial({ color: C.rootMid, roughness: 0.9, metalness: 0.05 });
      if (this.trunkMats) this.trunkMats.push({ mat: sMat, color: C.rootMid });

      const getRootPt = (angle, dist) => {
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        let y = -5; // default base level
        
        if (this.rocksData) {
          this.rocksData.forEach(rock => {
            const rx = rock.pos[0];
            const rz = rock.pos[2];
            const rRad = rock.radius;
            const dx = x - rx;
            const dz = z - rz;
            const d2 = dx*dx + dz*dz;
            if (d2 < rRad * rRad * 1.4) {
              const hFactor = 1.0 - Math.sqrt(d2) / (rRad * 1.2);
              y = Math.max(y, rock.pos[1] + rRad * 0.8 * hFactor);
            }
          });
        }
        return new THREE.Vector3(x, y, z);
      };

      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.2;
        const pts = [];
        const steps = 6;
        for (let s = 0; s <= steps; s++) {
          const dist = 10 + (s / steps) * 110;
          pts.push(getRootPt(a, dist));
        }
        
        // Add horizontal wiggle to make them twist sideways
        for (let s = 1; s < steps; s++) {
          const wiggle = (this.rand() - 0.5) * 12;
          const tang = new THREE.Vector3().subVectors(pts[s+1], pts[s-1]).normalize();
          const perp = new THREE.Vector3(-tang.z, 0, tang.x);
          pts[s].addScaledVector(perp, wiggle);
        }

        const curve = new THREE.CatmullRomCurve3(pts);
        const tubeGeo = new THREE.TubeGeometry(curve, 16, 7.5 * (1.0 - (i/8)*0.2), 8, false);
        const mesh = new THREE.Mesh(tubeGeo, sMat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
      }

      const ANGLES = [-1.28, -0.84, -0.44, 0, 0.44, 0.84, 1.28];
      ANGLES.forEach((a, i) => {
        const geos = [], tipH = { v: new THREE.Vector3(0, -220, 0) };
        const start = new THREE.Vector3(Math.cos(a)*10 + (this.rand()-0.5)*4, -5, Math.sin(a)*10 + (this.rand()-0.5)*4);
        this._growRoot(start, a, 128 + this.rand() * 28, 14.0, 4, geos, tipH);
        if (geos.length) {
          const mat  = new THREE.MeshStandardMaterial({ color: C.rootMid, roughness: 0.9, metalness: 0.05 });
          
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
              // Root veins
              float veinNoise = sin(vWorldPos.x * 0.1 + vWorldPos.y * 0.06) * 
                                cos(vWorldPos.z * 0.1 - vWorldPos.y * 0.04);
              float veinMask = smoothstep(0.92, 1.0, veinNoise);
              float wave = sin(vWorldPos.y * 0.03 - uTime * 1.5) * 0.5 + 0.5;
              vec3 goldVeinColor = vec3(1.0, 0.72, 0.25) * veinMask * wave;
              
              if (uIsLit > 0.5) {
                 float pulse = sin(vWorldPos.y * 0.055 + uTime * 1.8);
                 pulse = smoothstep(0.85, 1.0, pulse);
                 gl_FragColor.rgb += vec3(1.0, 0.72, 0.32) * pulse * 0.45 + goldVeinColor * 1.2;
              } else {
                 // Subtle background root veins
                 gl_FragColor.rgb += goldVeinColor * 0.25;
              }
              `
            );
          };

          const mesh = new THREE.Mesh(mergeGeos(geos), mat);
          this.scene.add(mesh);
          this.rootGroups[i] = { mesh, mat, tipPos: tipH.v };

          const glowMat = new THREE.SpriteMaterial({
            map: this.textures.rootGlow,
            color: 0xf6d687,
            transparent: true,
            opacity: 0.34,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          });
          const glow = new THREE.Sprite(glowMat);
          glow.position.copy(tipH.v);
          glow.scale.set(34, 34, 1);
          glow.renderOrder = 6;
          this.scene.add(glow);
          this.rootGlowSprites[i] = glow;
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
        bg.mat.color.setHex(isDim ? 0x7a664c : C.bark);
        bg.mat.transparent = isDim; bg.mat.opacity = isDim ? 0.34 : 1.0; bg.mat.needsUpdate = true;

        // Leaves
        if (lg) {
          [lg.mass, lg.back, lg.mid, lg.front].flat().filter(Boolean).forEach(l => {
            l.mat.color.setHex(isLit ? C.leafLit : isDim ? 0x6f7652 :
              l === lg.front ? C.leaf3 : l === lg.mid || l === lg.mass ? C.leaf1 : C.leaf0);
            l.mat.transparent = isDim || l.mat.opacity < 1;
            const isFront = Array.isArray(lg.front) ? lg.front.includes(l) : l === lg.front;
            const isMid = Array.isArray(lg.mid) ? lg.mid.includes(l) : l === lg.mid;
            l.mat.opacity = isDim ? 0.18 : isFront ? 0.86 : isMid ? 0.96 : 0.92;
            l.mat.needsUpdate = true;
          });
        }

        // Aerial roots — hide non-selected entirely (saves draw calls)
        if (am) {
          if (catIdx === null) {
            // Canopy: show all dimly
            am.mesh.visible = true;
            am.mat.color.setHex(C.barkLight);
            am.mat.opacity = 0.42;
          } else if (isLit) {
            // Category selected: highlight its roots
            am.mesh.visible = true;
            am.mat.color.setHex(C.barkMid);
            am.mat.opacity = 0.90;
          } else {
            // Dim: hide entirely for performance
            am.mesh.visible = false;
          }
          am.mat.needsUpdate = true;
        }
      }
      if (this.bgAerialsMesh && this.bgAerialsMesh.material) {
        const isDim = catIdx !== null;
        this.bgAerialsMesh.material.opacity = isDim ? 0.22 : 0.65;
        this.bgAerialsMesh.material.needsUpdate = true;
      }
    }

    setLitRoot(rootIdx) {
      for (let i = 0; i < 7; i++) {
        const rg = this.rootGroups[i]; if (!rg) continue;
        const isLit = rootIdx === i, isAmb = rootIdx < 0, isDim = rootIdx >= 0 && !isLit;
        rg.mat.color.setHex(isLit ? C.rootLit : isAmb ? C.rootAmbient : isDim ? 0x5a412a : C.rootDark);
        rg.mat.transparent = isDim; rg.mat.opacity = isDim ? 0.38 : 1.0; 
        if (rg.mat.userData.shader) {
          rg.mat.userData.shader.uniforms.uIsLit.value = isLit ? 1.0 : 0.0;
        }
        rg.mat.needsUpdate = true;
        const glow = this.rootGlowSprites[i];
        if (glow) {
          glow.material.opacity = isLit ? 0.72 : isAmb ? 0.34 : isDim ? 0.16 : 0.24;
          glow.scale.setScalar(isLit ? 42 : 34);
          glow.material.needsUpdate = true;
        }
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
     ImageParallaxTree (2.5D Engine)
   ═══════════════════════════════════════════════════════════════════════════ */
  class ImageParallaxTree {
    constructor(scene) {
      this.scene = scene;
      this.group = new THREE.Group();
      this.scene.add(this.group);

      // Generate placeholder textures for the 2.5D layers
      const bgTex = this._createCanvasTex('Background (Mist)', '#cdd8a9', '#f1e6d2');
      const midTex = this._createCanvasTex('Midground (Trunk & Main Roots)', '#5a412a', '#3b2918', true);
      const fgTex = this._createCanvasTex('Foreground (Front Leaves)', '#6aa84f', 'transparent');

      // Add planes at different Z-depths for parallax
      this.bgPlane = this._createPlane(bgTex, 0, 0, -800, 3600, 2400);
      this.midPlane = this._createPlane(midTex, 0, -50, 0, 1600, 1200);
      this.fgPlane = this._createPlane(fgTex, 0, 150, 400, 2400, 1600);

      // Mock coordinates for UI labels
      this.catTips = this._generateCatTips();
      this.rootTips = this._generateRootTips();
    }

    _createCanvasTex(text, c1, c2, isTrunk = false) {
      const canvas = document.createElement('canvas');
      canvas.width = 1024; canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      
      if (c2 !== 'transparent') {
        const grad = ctx.createLinearGradient(0, 0, 0, 1024);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 1024);
      } else {
        ctx.clearRect(0, 0, 1024, 1024);
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.arc(512, 512, 400, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = '40px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(text, 512, 512);

      if (isTrunk) {
        ctx.fillText('Replace with illustration.png', 512, 580);
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }

    _createPlane(tex, x, y, z, w, h) {
      const geo = new THREE.PlaneGeometry(w, h);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.group.add(mesh);
      return mesh;
    }

    _generateCatTips() {
      const tips = {};
      const radius = 400;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        // Map to midPlane coordinates
        tips[i] = [new THREE.Vector3(Math.cos(a) * radius, 300 + Math.sin(a) * 150, 0)];
      }
      return tips;
    }

    _generateRootTips() {
      const tips = {};
      for (let i = 0; i < 7; i++) {
        const x = -300 + (i * 100);
        tips[i] = new THREE.Vector3(x, -250 - Math.random() * 50, 0);
      }
      return tips;
    }

    setPhase(phase, catIdx) {
      const isDim = catIdx !== null;
      this.midPlane.material.opacity = isDim ? 0.3 : 1.0;
      this.fgPlane.material.opacity = isDim ? 0.1 : 1.0;
      this.midPlane.material.needsUpdate = true;
      this.fgPlane.material.needsUpdate = true;
    }

    setLitCategory(catIdx) {}
    setLitRoot(rootIdx) {}
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

      // Entry animation: camera starts far back and low, looking up
      this._camPos    = new THREE.Vector3(0, -250, 1800);
      this._camTarget = new THREE.Vector3(0, 250, 0);
      
      // Target resting positions for the canopy view
      this._tPos      = new THREE.Vector3(0, 260, 1050);
      this._tTarget   = new THREE.Vector3(0, 290, 0);
      
      this.camera.position.copy(this._camPos);
      this.camera.lookAt(this._camTarget);

      this.onTick = null; this._running = false; this._raf = null;

      this._mouseX = 0;
      this._mouseY = 0;
      this._scrollOffset = 0;
      this._phase = 'canopy';

      this._mouseOffset = new THREE.Vector3();
      this._projV = new THREE.Vector3();

      this._onMouseMove = (e) => {
        this._mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        this._mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      };
      this._onScroll = () => {
        this._scrollOffset = window.scrollY;
      };

      window.addEventListener('mousemove', this._onMouseMove);
      window.addEventListener('scroll', this._onScroll, { passive: true });
    }

    _initRenderer() {
      // Disable antialias on high DPI screens to massively improve performance
      const isHighDPI = window.devicePixelRatio > 1;
      const r = new THREE.WebGLRenderer({ antialias: !isHighDPI, alpha: true });
      // Clamp pixel ratio to 1.5 max (retina 2.0 is usually overkill and halves FPS)
      r.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      r.setSize(this.w, this.h);
      r.shadowMap.enabled   = true;
      r.shadowMap.type      = THREE.PCFShadowMap;
      r.toneMapping         = THREE.ACESFilmicToneMapping;
      r.toneMappingExposure = 1.22;
      r.outputColorSpace    = THREE.SRGBColorSpace;
      r.setClearColor(0x000000, 0);
      this.container.appendChild(r.domElement);
      this.renderer = r;
    }

    _initScene() {
      this.scene = new THREE.Scene();
      // Very light warm mist — only affects distant geometry, not the tree itself
      this.scene.fog = new THREE.FogExp2(0xf1e6d2, 0.00024);
      this.scene.background = null;
      this.scene.userData.uniforms = { uTime: { value: 0 } };
    }

    _initCamera() {
      this.camera = new THREE.PerspectiveCamera(58, this.w / this.h, 1, 9000);
      const aspect = this.w / this.h;
      this.camera.fov = aspect < 1.0 ? Math.min(85, 58 / aspect * 0.75) : 58;
      this.camera.updateProjectionMatrix();
    }

    _initLights() {
      // Soft warm ambient — morning light fill
      this.scene.add(new THREE.AmbientLight(0xfff4e1, 1.08));

      // Main sun — warm golden back-right angle for beautiful highlights
      const sun = new THREE.DirectionalLight(0xffd089, 1.45);
      sun.position.set(380, 460, 420);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.near = 10; sun.shadow.camera.far = 2800;
      sun.shadow.camera.left = sun.shadow.camera.bottom = -1000;
      sun.shadow.camera.right = sun.shadow.camera.top   =  1000;
      sun.shadow.bias = -0.001;
      this.scene.add(sun);

      // Hemisphere — warm golden-sky top, earthy bottom
      this.scene.add(new THREE.HemisphereLight(0xc8e3f2, 0xb7a06a, 1.0));

      // Warm fill from front-left — lifts shadowed faces gently
      const fill = new THREE.PointLight(0xf2cf92, 0.78, 2200);
      fill.position.set(0, 120, 640);
      this.scene.add(fill);

      // Strong Golden Backlight for the majestic silhouette rim halo
      const rim = new THREE.DirectionalLight(0xc1d9df, 0.45);
      rim.position.set(-300, 250, -500); // Back-left
      this.scene.add(rim);

      // Magical inner canopy glow PointLight
      const innerGlow = new THREE.PointLight(0xffd580, 0.35, 600, 1.2);
      innerGlow.position.set(0, 180, 0); // Inside the branch fork area
      this.scene.add(innerGlow);

      // Subtle warm bounce from ground
      const under = new THREE.PointLight(0xd29a53, 0.58, 1500);
      under.position.set(0, -230, 220);
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
      const pCount = 450;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(pCount * 3);
      const phases = new Float32Array(pCount);
      for (let i = 0; i < pCount; i++) {
        if (i < 250) {
          // Canopy cluster
          pos[i * 3 + 0] = (Math.random() - 0.5) * 800;
          pos[i * 3 + 1] = 120 + Math.random() * 220;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 600;
        } else if (i < 400) {
          // Lower trunk / rocks cluster
          pos[i * 3 + 0] = (Math.random() - 0.5) * 350;
          pos[i * 3 + 1] = -40 + Math.random() * 140;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 300;
        } else {
          // General ambient
          pos[i * 3 + 0] = (Math.random() - 0.5) * 1600;
          pos[i * 3 + 1] = -200 + Math.random() * 600;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 1600;
        }
        phases[i] = Math.random() * Math.PI * 2;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: this.scene.userData.uniforms.uTime,
          color: { value: new THREE.Color(0xffd089) } // warm gold color
        },
        vertexShader: `
          uniform float uTime;
          attribute float phase;
          varying float vAlpha;
          void main() {
            vec3 p = position;
            // Drifting motion
            p.x += sin(uTime * 0.15 + phase) * 32.0;
            p.y += cos(uTime * 0.12 + phase) * 20.0 + sin(uTime * 0.05 + phase * 0.5) * 10.0;
            p.z += sin(uTime * 0.08 + phase) * 24.0;
            
            vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            // Larger point size for high quality blur look
            gl_PointSize = clamp(2600.0 / -mvPosition.z, 1.5, 9.0);
            vAlpha = 0.12 + 0.38 * sin(uTime * 0.45 + phase * 2.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          varying float vAlpha;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            // Smooth Gaussian-like decay
            float a = smoothstep(0.5, 0.0, dist) * vAlpha;
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
        const aspect = this.w / this.h;
        this.camera.aspect = aspect;
        
        // Dynamically widen the field of view on narrow mobile screens so the wide tree fits
        this.camera.fov = aspect < 1.0 ? Math.min(85, 58 / aspect * 0.75) : 58;
        
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.w, this.h);
        if (this.composer) {
          this.composer.setSize(this.w, this.h);
          if (this.bokehPass) {
            const pr = this.renderer.getPixelRatio();
            this.bokehPass.renderTargetColor.setSize(this.w * pr, this.h * pr);
            this.bokehPass.renderTargetDepth.setSize(this.w * pr, this.h * pr);
          }
        }
      };
      window.addEventListener('resize', this._onResize);
    }

    start() { this._running = true; this._tick(); }

    stop() {
      this._running = false;
      if (this._raf) cancelAnimationFrame(this._raf);
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('scroll', this._onScroll);
      if (this.tree) {
        if (this.tree.leafGeo) this.tree.leafGeo.dispose();
        if (this.tree.bgAerialsMesh) {
          if (this.tree.bgAerialsMesh.geometry) this.tree.bgAerialsMesh.geometry.dispose();
          if (this.tree.bgAerialsMesh.material) this.tree.bgAerialsMesh.material.dispose();
        }
      }
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
      this._camPos.lerp(this._tPos, 0.030);
      this._camTarget.lerp(this._tTarget, 0.030);
      this.camera.position.copy(this._camPos);
      this.camera.lookAt(this._camTarget);

      // 1. Mouse Parallax (Drift) relative to camera's orientation
      this._mouseOffset.set(
        this._mouseX * 34,
        this._mouseY * 18,
        0
      );
      this._mouseOffset.applyQuaternion(this.camera.quaternion);
      this.camera.position.add(this._mouseOffset);

      // 2. Scroll Parallax - camera sinks down and pulls back on scroll (canopy & category only)
      if (this._phase === 'canopy' || this._phase === 'category') {
        const scrollFactor = Math.min(this._scrollOffset / window.innerHeight, 1.2);
        this.camera.position.y -= scrollFactor * 100;
        this.camera.position.z += scrollFactor * 60;
      }

      if (this.bokehPass) {
        // Calculate true focus distance to the current target
        const dist = this.camera.position.distanceTo(this._tTarget);
        this.bokehPass.uniforms['focus'].value = dist;
        this.bokehPass.uniforms['aperture'].value = 0.000005; 
        this.bokehPass.uniforms['maxblur'].value = 0.0015; 
      }

      if (this.composer) {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }
      if (this.onTick) this.onTick(this._projectCats(), this._projectRoots());
    }

    _project(v3) {
      this._projV.copy(v3).project(this.camera);
      return {
        x: (this._projV.x * 0.5 + 0.5) * this.w,
        y: (-this._projV.y * 0.5 + 0.5) * this.h,
        vis: this._projV.z < 1.0
      };
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
      this._phase = phase;
      if (phase === 'canopy') {
        this._tPos.set(0, 260, 1050);
        this._tTarget.set(0, 290, 0);
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
        
        // Keep category exploration as an atlas view: close enough to read the
        // system, far enough that foliage stays as a calm mass rather than a mesh.
        // We point the camera target lower (ty - 40) so the branch sits higher on screen,
        // leaving plenty of room below for long lists of conditions (like Gut Health).
        this._tPos.set(tx * 0.4, Math.max(ty, 100) + 140, 960);
        this._tTarget.set(tx * 0.5, Math.max(ty, 80), tz * 0.2);
        this.tree.setLitCategory(selectedCategory);
        this.tree.setLitRoot(-1);

      } else if (phase === 'roots' || phase === 'detail') {
        this._tPos.set(0, -94, 640);
        this._tTarget.set(0, -235, 0);
        this.tree.setLitCategory(null);
        const rootIdx = selectedRoot != null ? BanyanData.rootOrder.indexOf(selectedRoot) : -1;
        this.tree.setLitRoot(rootIdx);
      }
    }
  }

export default ThreeApp;
