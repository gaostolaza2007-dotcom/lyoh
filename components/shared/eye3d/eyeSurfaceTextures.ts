import * as THREE from "three";

// Original, deterministic surface illustrations; no external images or patient data.
function random(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}

function texture(canvas: HTMLCanvasElement) {
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

export function createIrisTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;
  const rand = random(1089);
  const image = ctx.createImageData(1024, 1024);
  const phases = Array.from({ length: 12 }, () => rand() * Math.PI * 2);
  for (let y = 0; y < 1024; y++) {
    for (let x = 0; x < 1024; x++) {
      const dx = (x - 512) / 512, dy = (y - 512) / 512;
      const r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
      const fiber = Math.sin(a * 173 + Math.sin(r * 19 + a * 7) * 1.8)
        + .55 * Math.sin(a * 337 + r * 9 + phases[1])
        + .35 * Math.sin(a * 571 - r * 13 + phases[2]);
      const broad = Math.sin(a * 39 + Math.sin(r * 12) * 2) * 2 + Math.sin(a * 87 + r * 8) * 3;
      const collarette = Math.exp(-Math.pow((r - .48 - .018 * Math.sin(a * 19)) / .075, 2));
      const limbal = 1 - .72 * THREE.MathUtils.smoothstep(r, .86, 1);
      const pupilRim = .45 + .55 * THREE.MathUtils.smoothstep(r, .30, .37);
      const fleck = (rand() - .5) * 13;
      const light = fiber * 11 + broad + fleck;
      const k = (y * 1024 + x) * 4;
      image.data[k] = (98 + light + collarette * 31) * limbal * pupilRim;
      image.data[k + 1] = (62 + light * .70 + collarette * 23) * limbal * pupilRim;
      image.data[k + 2] = (31 + light * .32 + collarette * 8) * limbal * pupilRim;
      image.data[k + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  // Broken, irregular stromal crypts, rather than concentric mechanical rings.
  for (let i = 0; i < 180; i++) {
    const a = rand() * Math.PI * 2;
    const r = 195 + rand() * 210;
    ctx.save(); ctx.translate(512, 512); ctx.rotate(a);
    ctx.fillStyle = `rgba(28,18,12,${.12 + rand() * .23})`;
    ctx.beginPath(); ctx.ellipse(r, 0, 4 + rand() * 15, .8 + rand() * 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  return texture(canvas);
}

export function createScleraTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048; canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;
  const rand = random(437);
  const image = ctx.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) {
    // UV v = polar angle / PI. CanvasTexture flips its vertical axis on upload.
    const polar = 1 - y / canvas.height;
    const warmth = 7 * Math.exp(-Math.pow((polar - .19) / .07, 2));
    for (let x = 0; x < canvas.width; x++) {
      const n = (rand() - .5) * 5 + Math.sin(x * .021 + y * .014) * 1.5;
      const k = (y * canvas.width + x) * 4;
      image.data[k] = 236 + n;
      image.data[k + 1] = 229 + n - warmth;
      image.data[k + 2] = 219 + n - warmth;
      image.data[k + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  // Superficial vessels represented subtly; the corneal optical zone stays clear.
  function vessel(x: number, y: number, len: number, width: number, depth: number) {
    const drift = (rand() - .5) * 90;
    const endX = x + drift, endY = Math.min(857, y + len);
    ctx.strokeStyle = `rgba(173,91,91,${depth === 0 ? .36 : .24})`;
    ctx.lineWidth = width; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + drift * .2 + 13, y + len * .3, endX - 17, y + len * .65, endX, endY);
    ctx.stroke();
    if (depth < 2 && len > 35) {
      vessel(x + drift * .5, y + len * .5, len * .45, width * .55, depth + 1);
    }
  }
  for (let i = 0; i < 70; i++) {
    vessel(rand() * 2048, 390 + rand() * 270, 90 + rand() * 220, .6 + rand() * 1.7, 0);
  }
  const map = texture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  return map;
}
