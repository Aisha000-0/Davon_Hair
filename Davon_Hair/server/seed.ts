import bcrypt from 'bcryptjs'
import { db } from './db'
import { ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD } from './env'
import { DEFAULT_SETTINGS, setSetting, slugify } from './helpers'

const pImg = (style: string, palette: string, n: number) => `/images/products/${style}-${palette}-${n}.svg`
const cImg = (slug: string) => `/images/categories/${slug}.svg`

const CATEGORIES = [
  ['Human Hair Wigs', 'human-hair-wigs', 'Our finest 100% raw donor hair, hand-selected for cuticle alignment, softness and lasting density.'],
  ['Bone Straight', 'bone-straight', 'Mirror-smooth, razor-straight textures with a luxuriously natural fall.'],
  ['Burmese Curly', 'burmese-curly', 'Springy, defined curls with enviable volume and bounce.'],
  ['Water Wave', 'water-wave', 'Soft, fluid waves that move beautifully with every step.'],
  ['Body Wave', 'body-wave', 'Loose, glamorous waves — the signature luxury blowout.'],
  ['Closure Wigs', 'closure-wigs', 'Seamless closures for a natural parting and effortless finish.'],
  ['Frontal Wigs', 'frontal-wigs', 'Ear-to-ear HD lace frontals for undetectable hairlines.'],
  ['Bob Wigs', 'bob-wigs', 'Sharp, chic and timeless — the bob, elevated.'],
  ['Ready-to-Wear Wigs', 'ready-to-wear-wigs', 'Wigged, styled and glueless. Ready the moment it arrives.'],
  ['Hair Extensions', 'hair-extensions', 'Luxury bundles and extensions to complete every look.'],
] as const

interface SeedProduct {
  name: string
  category: string
  description: string
  hairType: string
  texture: string
  density: string
  lace: string
  color: string
  cap: string
  price: number
  compare?: number
  style: string
  palette: string
  featured?: boolean
  isNew?: boolean
  best?: boolean
  lengths: [string, number, number][] // length, price, stock
}

const PRODUCTS: SeedProduct[] = [
  {
    name: 'Adunni Bone Straight',
    category: 'bone-straight',
    description: 'Our signature bone straight, crafted from single-donor Vietnamese hair. Razor-sharp, weightless and finished on a 13x4 HD lace frontal for an undetectable hairline.',
    hairType: '100% Human Hair',
    texture: 'Bone Straight',
    density: '180%',
    lace: '13x4 HD Lace Frontal',
    color: 'Natural Black (1B)',
    cap: 'Medium 22"',
    price: 520000,
    compare: 620000,
    style: 'straight',
    palette: 'jet',
    featured: true,
    best: true,
    lengths: [['18"', 480000, 6], ['20"', 520000, 4], ['22"', 570000, 2], ['24"', 640000, 0]],
  },
  {
    name: 'Ifeoma Body Wave',
    category: 'body-wave',
    description: 'A soft, romantic body wave with generous movement. Cuticle-aligned and double-stitched on a breathable 13x4 frontal for all-day comfort.',
    hairType: '100% Human Hair',
    texture: 'Body Wave',
    density: '200%',
    lace: '13x4 Transparent Lace',
    color: 'Natural Black (1B)',
    cap: 'Medium 22"',
    price: 610000,
    compare: 690000,
    style: 'body',
    palette: 'espresso',
    featured: true,
    lengths: [['20"', 560000, 5], ['22"', 610000, 3], ['24"', 665000, 2], ['26"', 720000, 1]],
  },
  {
    name: 'Ngozi Burmese Curly',
    category: 'burmese-curly',
    description: 'Defined, springy Burmese curls with a luxurious density. Handmade on a 5x5 closure for a natural parting and a flawless, full silhouette.',
    hairType: '100% Human Hair',
    texture: 'Burmese Curly',
    density: '180%',
    lace: '5x5 HD Closure',
    color: 'Natural Black (1B)',
    cap: 'Medium 22"',
    price: 480000,
    style: 'curly',
    palette: 'jet',
    isNew: true,
    lengths: [['16"', 445000, 7], ['18"', 480000, 4], ['20"', 525000, 2], ['22"', 580000, 0]],
  },
  {
    name: 'Zara Water Wave',
    category: 'water-wave',
    description: 'Fluid, beach-kissed water waves with a glossy finish. A full 5x5 closure and adjustable straps make this an effortless everyday luxury.',
    hairType: '100% Human Hair',
    texture: 'Water Wave',
    density: '200%',
    lace: '5x5 HD Closure',
    color: 'Natural Black (1B)',
    cap: 'Medium 22"',
    price: 690000,
    style: 'water',
    palette: 'espresso',
    lengths: [['20"', 620000, 4], ['22"', 690000, 3], ['24"', 745000, 1], ['26"', 810000, 0]],
  },
  {
    name: 'Temi Sleek Bob',
    category: 'bob-wigs',
    description: 'A razor-cut, collarbone bob in bone straight. Precision finished with a 4x4 closure and a comfortable, breathable cap.',
    hairType: '100% Human Hair',
    texture: 'Bone Straight',
    density: '180%',
    lace: '4x4 Closure',
    color: 'Natural Black (1B)',
    cap: 'Medium 22"',
    price: 350000,
    compare: 420000,
    style: 'bob',
    palette: 'jet',
    best: true,
    lengths: [['10"', 315000, 6], ['12"', 350000, 3], ['14"', 385000, 2]],
  },
  {
    name: 'Amara Glueless Bob',
    category: 'ready-to-wear-wigs',
    description: 'Wigged, styled and ready to wear in minutes. A soft body wave bob with an adjustable glueless cap for a secure, comfortable fit.',
    hairType: 'Human Hair Blend',
    texture: 'Body Wave',
    density: '150%',
    lace: 'Glueless Cap',
    color: 'Natural Black (1B)',
    cap: 'Adjustable Average',
    price: 295000,
    style: 'body',
    palette: 'auburn',
    isNew: true,
    best: true,
    lengths: [['12"', 265000, 8], ['14"', 295000, 5], ['16"', 325000, 3]],
  },
  {
    name: 'Sade HD Frontal',
    category: 'frontal-wigs',
    description: 'Ear-to-ear 13x6 HD lace, hand-tinted and plucked. A sleek, long straight silhouette with a barely-there hairline.',
    hairType: '100% Human Hair',
    texture: 'Straight',
    density: '180%',
    lace: '13x6 HD Lace Frontal',
    color: 'Natural Black (1B)',
    cap: 'Medium 22"',
    price: 780000,
    style: 'closure',
    palette: 'espresso',
    featured: true,
    lengths: [['20"', 720000, 4], ['22"', 780000, 2], ['24"', 850000, 1]],
  },
  {
    name: 'Chidinma Deep Curl',
    category: 'burmese-curly',
    description: 'Opulent deep curls with incredible bounce and shine. Cuticle-aligned raw hair that holds its pattern wash after wash.',
    hairType: '100% Human Hair',
    texture: 'Deep Curly',
    density: '200%',
    lace: '13x4 HD Lace',
    color: 'Natural Black (1B)',
    cap: 'Medium 22"',
    price: 640000,
    style: 'curly',
    palette: 'honey',
    isNew: true,
    lengths: [['18"', 585000, 3], ['20"', 640000, 2], ['22"', 700000, 1]],
  },
  {
    name: 'Kemi Closure Straight',
    category: 'closure-wigs',
    description: 'A polished, everyday straight unit on a 5x5 HD closure. Lightweight, comfortable and beautifully natural at the part.',
    hairType: '100% Human Hair',
    texture: 'Bone Straight',
    density: '180%',
    lace: '5x5 HD Closure',
    color: 'Natural Black (1B)',
    cap: 'Medium 22"',
    price: 430000,
    style: 'straight',
    palette: 'espresso',
    lengths: [['16"', 395000, 5], ['18"', 430000, 3], ['20"', 465000, 2]],
  },
  {
    name: 'Bisi Body Wave Bundle',
    category: 'hair-extensions',
    description: 'Three luxurious body wave bundles, cuticle-aligned for a seamless blend. 100g per bundle, true to length.',
    hairType: '100% Human Hair',
    texture: 'Body Wave',
    density: 'Bundle',
    lace: '—',
    color: 'Natural Black (1B)',
    cap: '—',
    price: 300000,
    style: 'body',
    palette: 'jet',
    best: true,
    lengths: [['18"', 270000, 9], ['20"', 300000, 6], ['22"', 330000, 4]],
  },
  {
    name: 'Halima Water Wave Frontal',
    category: 'water-wave',
    description: 'A dramatic, 26-inch water wave on a 13x4 frontal. Softer, fuller and endlessly photographable.',
    hairType: '100% Human Hair',
    texture: 'Water Wave',
    density: '200%',
    lace: '13x4 HD Frontal',
    color: 'Natural Black (1B)',
    cap: 'Medium 22"',
    price: 880000,
    style: 'water',
    palette: 'jet',
    featured: true,
    lengths: [['24"', 820000, 2], ['26"', 880000, 1]],
  },
  {
    name: 'Ada Platinum Bob',
    category: 'bob-wigs',
    description: 'A cool platinum bob with a precise blunt finish. Professionally coloured, toned and sealed for lasting shine.',
    hairType: '100% Human Hair',
    texture: 'Bone Straight',
    density: '180%',
    lace: '4x4 Closure',
    color: 'Platinum Blonde',
    cap: 'Medium 22"',
    price: 390000,
    compare: 460000,
    style: 'bob',
    palette: 'platinum',
    lengths: [['10"', 355000, 3], ['12"', 390000, 2]],
  },
  {
    name: 'Yewande Honey Body Wave',
    category: 'body-wave',
    description: 'A warm honey-blonde body wave, custom coloured in-house. Glossy, dimensional and impossibly soft.',
    hairType: '100% Human Hair',
    texture: 'Body Wave',
    density: '200%',
    lace: '13x4 HD Lace',
    color: 'Honey Blonde',
    cap: 'Medium 22"',
    price: 720000,
    style: 'body',
    palette: 'honey',
    isNew: true,
    featured: true,
    lengths: [['20"', 665000, 2], ['22"', 720000, 2], ['24"', 785000, 1]],
  },
  {
    name: 'Oluwaseun 30" Straight',
    category: 'human-hair-wigs',
    description: 'Our longest, most indulgent straight unit. 30 inches of glossy, single-donor hair on an HD frontal.',
    hairType: '100% Human Hair',
    texture: 'Bone Straight',
    density: '200%',
    lace: '13x4 HD Frontal',
    color: 'Natural Black (1B)',
    cap: 'Medium 22"',
    price: 980000,
    style: 'straight',
    palette: 'jet',
    featured: true,
    lengths: [['28"', 920000, 2], ['30"', 980000, 1]],
  },
  {
    name: 'Ekene Kinky Straight',
    category: 'human-hair-wigs',
    description: 'A textured kinky straight that mimics natural relaxed hair. Full, airy and finished on a 13x4 frontal.',
    hairType: '100% Human Hair',
    texture: 'Kinky Straight',
    density: '180%',
    lace: '13x4 Lace Frontal',
    color: 'Natural Black (1B)',
    cap: 'Medium 22"',
    price: 560000,
    style: 'straight',
    palette: 'auburn',
    lengths: [['18"', 510000, 4], ['20"', 560000, 3], ['22"', 610000, 1]],
  },
  {
    name: 'Muna Loose Deep',
    category: 'burmese-curly',
    description: 'Loose, romantic deep waves with a natural sheen. Hand-tied on a 5x5 closure and ready to be styled your way.',
    hairType: '100% Human Hair',
    texture: 'Loose Deep',
    density: '190%',
    lace: '5x5 HD Closure',
    color: 'Natural Black (1B)',
    cap: 'Medium 22"',
    price: 590000,
    style: 'curly',
    palette: 'espresso',
    isNew: true,
    lengths: [['18"', 535000, 4], ['20"', 590000, 3], ['22"', 645000, 2]],
  },
  {
    name: 'Aisha Glueless Ready-to-Wear',
    category: 'ready-to-wear-wigs',
    description: 'Pre-styled and pre-plucked. A glueless straight unit that goes on in under sixty seconds — no glue, no fuss.',
    hairType: 'Human Hair Blend',
    texture: 'Straight',
    density: '160%',
    lace: 'Glueless Cap',
    color: 'Natural Black (1B)',
    cap: 'Adjustable Average',
    price: 340000,
    compare: 390000,
    style: 'straight',
    palette: 'honey',
    best: true,
    lengths: [['14"', 310000, 7], ['16"', 340000, 4], ['18"', 370000, 2]],
  },
  {
    name: 'Nneka Luxe Closure Bob',
    category: 'closure-wigs',
    description: 'A luxe, chin-grazing bob with a silk-straight finish and a 5x5 closure. Understated, expensive and endlessly wearable.',
    hairType: '100% Human Hair',
    texture: 'Bone Straight',
    density: '180%',
    lace: '5x5 HD Closure',
    color: 'Natural Black (1B)',
    cap: 'Medium 22"',
    price: 410000,
    style: 'bob',
    palette: 'honey',
    isNew: true,
    lengths: [['10"', 375000, 4], ['12"', 410000, 3], ['14"', 445000, 2]],
  },
]

function moneyRound(n: number) {
  return Math.round(n / 1000) * 1000
}

export function seedDatabase(log = true) {
  const adminExists = db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number }

  if (adminExists.c === 0) {
    const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10)
    db.prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
    ).run(ADMIN_NAME, ADMIN_EMAIL, hash)
    if (log) console.log(`✓ Admin account created: ${ADMIN_EMAIL}`)
  }

  // Settings — only insert defaults that do not exist yet.
  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)')
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    insertSetting.run(key, JSON.stringify(value))
  }
  // Demonstration bank details; the administrator should replace these.
  const bankSeeded = db.prepare("SELECT value FROM settings WHERE key = 'bank_name'").get() as
    | { value: string }
    | undefined
  if (!bankSeeded || JSON.parse(bankSeeded.value) === '') {
    setSetting('bank_name', 'Guaranty Trust Bank (GTBank)')
    setSetting('bank_account_name', 'DEVON KUXURY WIGS LTD')
    setSetting('bank_account_number', '0123456789')
  }

  const catCount = db.prepare('SELECT COUNT(*) AS c FROM categories').get() as { c: number }
  if (catCount.c === 0) {
    const insertCat = db.prepare(
      'INSERT INTO categories (name, slug, description, image, visible, sort_order) VALUES (?, ?, ?, ?, 1, ?)',
    )
    CATEGORIES.forEach(([name, slug, description], i) => {
      insertCat.run(name, slug, description, cImg(slug), i)
    })
    if (log) console.log(`✓ ${CATEGORIES.length} categories created`)
  }

  const prodCount = db.prepare('SELECT COUNT(*) AS c FROM products').get() as { c: number }
  if (prodCount.c === 0) {
    const catId = db.prepare('SELECT id FROM categories WHERE slug = ?')
    const insertProduct = db.prepare(`
      INSERT INTO products
        (name, slug, description, category_id, hair_type, texture, length, density, lace_type, color, cap_size,
         base_price, compare_at_price, images, is_featured, is_new, is_best_seller, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `)
    const insertVariant = db.prepare(`
      INSERT INTO product_variants (product_id, sku, length, density, lace_type, color, price, compare_at_price, stock, image, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const seedAll = db.transaction(() => {
      PRODUCTS.forEach((p, index) => {
        const category = catId.get(p.category) as { id: number } | undefined
        const lengths = p.lengths.map((l) => l[0])
        const images = [pImg(p.style, p.palette, 1), pImg(p.style, p.palette, 2)]
        const mainLength = p.lengths[Math.floor(p.lengths.length / 2)][0]
        const info = insertProduct.run(
          p.name,
          slugify(p.name),
          p.description,
          category?.id ?? null,
          p.hairType,
          p.texture,
          p.lengths[0][0] + ' – ' + lengths[lengths.length - 1],
          p.density,
          p.lace,
          p.color,
          p.cap,
          p.price,
          p.compare ?? null,
          JSON.stringify(images),
          p.featured ? 1 : 0,
          p.isNew ? 1 : 0,
          p.best ? 1 : 0,
        )
        const productId = Number(info.lastInsertRowid)
        p.lengths.forEach(([length, price, stock], vi) => {
          const sku = `DK-${String(index + 1).padStart(2, '0')}-${length.replace('"', '')}-${p.palette.slice(0, 3).toUpperCase()}`
          insertVariant.run(
            productId,
            sku,
            length,
            p.density,
            p.lace,
            p.color,
            price,
            p.compare ? moneyRound(price * 1.18) : null,
            stock,
            vi === 0 ? images[0] : null,
            vi,
          )
        })
        void mainLength
      })
    })
    seedAll()
    if (log) console.log(`✓ ${PRODUCTS.length} products with variations created`)
  }

  if (log) {
    console.log('')
    console.log('  DEVON KUXURY WIGS — database ready')
    console.log(`  Admin login: ${ADMIN_EMAIL}`)
    console.log(`  Admin password: ${ADMIN_PASSWORD}`)
    console.log('')
  }
}

const isDirectRun = process.argv[1]?.includes('seed')
if (isDirectRun) {
  seedDatabase(true)
}
