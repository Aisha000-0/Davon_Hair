// Generates the local editorial artwork used across the store.
// These are deliberately abstract "hair studio" placeholders — not stock photos.
// Replace them with real photography from the admin product editor at any time.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = join(process.cwd(), 'client', 'public', 'images')
for (const dir of ['', 'categories', 'products', 'social']) mkdirSync(join(OUT, dir), { recursive: true })

function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const PALETTES = {
  jet: { a: '#0f0b07', b: '#2a2015', c: '#5a4326', gold: '#D4AF37', light: '#F1D78A' },
  espresso: { a: '#100b08', b: '#33200f', c: '#6b4322', gold: '#C9963F', light: '#F0D49A' },
  honey: { a: '#120e08', b: '#3d2e17', c: '#8a6a35', gold: '#E0B85C', light: '#F8E9C0' },
  auburn: { a: '#100a08', b: '#37170f', c: '#6e2f1c', gold: '#C9854A', light: '#F0C79A' },
  platinum: { a: '#0d0c0a', b: '#302c24', c: '#7d7361', gold: '#D8C9A3', light: '#F5EFDF' },
}

const STYLES = ['straight', 'body', 'water', 'curly', 'bob', 'closure']

function strand(rand, style, cx, spread, top, height, width) {
  const x0 = cx + (rand() - 0.5) * spread
  const drift = (rand() - 0.5) * spread * 0.9
  const y0 = top - height * 0.15
  const y1 = top + height * (style === 'bob' ? 0.62 + rand() * 0.12 : 0.92 + rand() * 0.2)
  const x1 = x0 + drift
  let d = ''
  if (style === 'curly') {
    const coils = 26 + Math.floor(rand() * 10)
    d = `M ${x0.toFixed(1)} ${y0.toFixed(1)}`
    for (let i = 1; i <= coils; i++) {
      const t = i / coils
      const y = y0 + (y1 - y0) * t
      const x = x0 + drift * t + Math.sin(t * Math.PI * 2 * 7 + rand() * 6) * (10 + width * 1.6)
      d += ` Q ${(x + (rand() - 0.5) * 26).toFixed(1)} ${(y - 10).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`
    }
  } else if (style === 'water') {
    const cycles = 3 + rand() * 2
    d = `M ${x0} ${y0} C ${x0 + 50} ${y0 + (y1 - y0) * 0.25}, ${x0 - 50} ${y0 + (y1 - y0) * 0.4}, ${x1} ${y1}`
    d += ''
    const mid = (y0 + y1) / 2
    d = `M ${x0} ${y0} C ${x0 + width * 2 + 40} ${mid - (y1 - y0) * 0.22}, ${x0 - width * 2 - 40} ${mid + (y1 - y0) * 0.22}, ${x1} ${y1}`
    void cycles
  } else if (style === 'body') {
    d = `M ${x0} ${y0} C ${x0 + spread * 0.16} ${y0 + (y1 - y0) * 0.28}, ${x1 - spread * 0.16} ${y0 + (y1 - y0) * 0.56}, ${x1} ${y1}`
  } else {
    // straight / bob / closure — long, calm lines with a gentle fall
    d = `M ${x0} ${y0} C ${x0 + drift * 0.25} ${y0 + (y1 - y0) * 0.35}, ${x1 - drift * 0.2} ${y0 + (y1 - y0) * 0.7}, ${x1} ${y1}`
  }
  return d
}

function hairArt({ w, h, style, paletteName, seed, density = 46, focal = 0.58, glow = 0.5, labelSpace = 0 }) {
  const rand = mulberry32(seed)
  const p = PALETTES[paletteName]
  const cx = w * (focal + labelSpace)
  const spread = w * 0.42
  const strands = []
  for (let i = 0; i < density; i++) {
    const width = 1 + rand() * 5.5
    const op = 0.12 + rand() * 0.55
    const tone = rand()
    const color = tone > 0.86 ? p.light : tone > 0.55 ? p.gold : tone > 0.25 ? p.c : p.a
    strands.push(
      `<path d="${strand(rand, style, cx, spread, h * 0.06, h * 0.94, width)}" fill="none" stroke="${color}" stroke-width="${width.toFixed(1)}" stroke-linecap="round" opacity="${op.toFixed(2)}"/>`,
    )
  }
  // soft, out-of-focus volume behind the crisp strands
  const masses = []
  for (let i = 0; i < 16; i++) {
    const mw = 12 + rand() * 38
    masses.push(
      `<path d="${strand(rand, style, cx, spread * 0.92, h * 0.04, h * 0.96, mw)}" fill="none" stroke="${rand() > 0.5 ? p.c : p.b}" stroke-width="${mw.toFixed(0)}" stroke-linecap="round" opacity="0.5"/>`,
    )
  }
  const flyaways = []
  for (let i = 0; i < 22; i++) {
    const fx = cx + (rand() - 0.5) * spread * 1.25
    const fy = h * (0.1 + rand() * 0.75)
    flyaways.push(
      `<path d="M ${fx.toFixed(0)} ${fy.toFixed(0)} q ${((rand() - 0.5) * 90).toFixed(0)} ${(-30 - rand() * 90).toFixed(0)} ${((rand() - 0.5) * 150).toFixed(0)} ${(-60 - rand() * 120).toFixed(0)}" fill="none" stroke="${p.light}" stroke-width="${(0.5 + rand() * 1.2).toFixed(1)}" opacity="${(0.1 + rand() * 0.3).toFixed(2)}" stroke-linecap="round"/>`,
    )
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#0b0906"/><stop offset="0.55" stop-color="${p.a}"/><stop offset="1" stop-color="#050403"/>
  </linearGradient>
  <radialGradient id="halo" cx="50%" cy="34%" r="62%">
    <stop offset="0" stop-color="${p.gold}" stop-opacity="${glow}"/>
    <stop offset="0.55" stop-color="${p.c}" stop-opacity="${(glow * 0.22).toFixed(2)}"/>
    <stop offset="1" stop-color="#000" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0.8">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/>
    <stop offset="0.5" stop-color="${p.light}" stop-opacity="0.22"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="vignette" cx="50%" cy="45%" r="72%">
    <stop offset="0.45" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.78"/>
  </radialGradient>
  <filter id="blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${Math.round(w * 0.022)}"/></filter>
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.05"/></feComponentTransfer>
  </filter>
</defs>
<rect width="${w}" height="${h}" fill="url(#bg)"/>
<ellipse cx="${cx}" cy="${h * 0.33}" rx="${w * 0.5}" ry="${h * 0.55}" fill="url(#halo)"/>
<g filter="url(#blur)" opacity="0.55">${masses.join('')}</g>
<g>${strands.join('')}</g>
<g>${flyaways.join('')}</g>
<rect width="${w}" height="${h}" fill="url(#sheen)" opacity="0.35"/>
<rect width="${w}" height="${h}" fill="url(#vignette)"/>
<rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.6"/>
<rect x="${w * 0.03}" y="${h * 0.03}" width="${w * 0.94}" height="${h * 0.94}" fill="none" stroke="${p.gold}" stroke-opacity="0.16"/>
</svg>`
}

function save(path, svg) {
  writeFileSync(join(OUT, path), svg)
}

// Hero and editorial banners
save('hero.svg', hairArt({ w: 1600, h: 1100, style: 'body', paletteName: 'jet', seed: 11, density: 64, focal: 0.66, glow: 0.55 }))
save('hero-2.svg', hairArt({ w: 1400, h: 1000, style: 'water', paletteName: 'espresso', seed: 23, density: 54, focal: 0.6 }))
save('editorial.svg', hairArt({ w: 1100, h: 1300, style: 'curly', paletteName: 'jet', seed: 47, density: 52, focal: 0.55 }))
save('promo.svg', hairArt({ w: 1600, h: 700, style: 'straight', paletteName: 'honey', seed: 31, density: 40, focal: 0.72, glow: 0.4 }))
save('about.svg', hairArt({ w: 1100, h: 1200, style: 'curly', paletteName: 'auburn', seed: 73, density: 46 }))

// Category portraits (4:5)
const categories = [
  'human-hair-wigs',
  'bone-straight',
  'burmese-curly',
  'water-wave',
  'body-wave',
  'closure-wigs',
  'frontal-wigs',
  'bob-wigs',
  'ready-to-wear-wigs',
  'hair-extensions',
]
const catStyle = {
  'human-hair-wigs': ['body', 'jet'],
  'bone-straight': ['straight', 'jet'],
  'burmese-curly': ['curly', 'jet'],
  'water-wave': ['water', 'espresso'],
  'body-wave': ['body', 'auburn'],
  'closure-wigs': ['closure', 'jet'],
  'frontal-wigs': ['straight', 'espresso'],
  'bob-wigs': ['bob', 'jet'],
  'ready-to-wear-wigs': ['body', 'honey'],
  'hair-extensions': ['straight', 'auburn'],
}
categories.forEach((slug, i) => {
  const [style, palette] = catStyle[slug]
  save(`categories/${slug}.svg`, hairArt({ w: 900, h: 1125, style, paletteName: palette, seed: 100 + i * 7, density: 40 }))
})

// Product imagery: style × palette × 2 angles
const productStyles = ['straight', 'body', 'water', 'curly', 'bob', 'closure']
const productPalettes = ['jet', 'espresso', 'honey', 'auburn']
let seed = 500
for (const style of productStyles) {
  for (const palette of productPalettes) {
    for (let variant = 1; variant <= 2; variant++) {
      save(
        `products/${style}-${palette}-${variant}.svg`,
        hairArt({
          w: 900,
          h: 1125,
          style,
          paletteName: palette,
          seed: seed++,
          density: 44,
          focal: variant === 1 ? 0.57 : 0.5,
          glow: variant === 1 ? 0.47 : 0.34,
        }),
      )
    }
  }
}

// Social gallery squares
const social = [
  ['curly', 'jet'], ['straight', 'honey'], ['water', 'espresso'],
  ['body', 'auburn'], ['bob', 'jet'], ['curly', 'platinum'],
]
social.forEach(([style, palette], i) => {
  save(`social/${i + 1}.svg`, hairArt({ w: 700, h: 700, style, paletteName: palette, seed: 900 + i * 13, density: 34, focal: 0.5 }))
})

console.log('Generated', categories.length + productStyles.length * productPalettes.length * 2 + social.length + 5, 'artwork files in', OUT)
