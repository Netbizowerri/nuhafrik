
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const catalogueProducts = [
  {
    sku: 'NH-CL-TOP-001',
    name: 'Ankara Print Short-Sleeve Top',
    slug: 'ankara-print-short-sleeve-top',
    short_description: 'Vibrant Ankara-print short-sleeve top with botanical motifs.',
    description: 'A vibrant Ankara-print short-sleeve top featuring a classic round neckline and relaxed fit. Hand-cut from 100% woven cotton with authentic African botanical dot motifs in burnt orange. Versatile enough for casual outings or styled up for social events.',
    category_id: 'clothing',
    subcategory_id: 'tops',
    tags: ['ankara', 'top', 'cotton', 'orange'],
    pricing: { original_price: 15000, selling_price: 12000, is_on_sale: true, discount_percentage: 20 },
    variants: { colors: [{ id: 'orange', name: 'Burnt Orange', hex: '#B5451B' }], sizes: ['S', 'M', 'L', 'XL'] },
    images: [{ url: 'https://picsum.photos/seed/nuhafrik-top/800/1000', alt: 'Ankara Top', is_primary: true }],
    metadata: { is_new_arrival: true, is_featured: false, is_best_seller: true },
    published: true
  },
  {
    sku: 'NH-CL-PNT-002',
    name: 'Kente-Inspired Wide-Leg Trousers',
    slug: 'kente-inspired-wide-leg-trousers',
    short_description: 'Wide-leg trousers in deep indigo with Kente-inspired panels.',
    description: 'Wide-leg trousers in deep indigo cotton blend featuring woven Kente-inspired gold and rust stripe panels. High-rise waistband with a comfortable elastic back. A bold statement bottom that honours West African weaving tradition in a modern silhouette.',
    category_id: 'clothing',
    subcategory_id: 'pants',
    tags: ['kente', 'pants', 'indigo', 'gold'],
    pricing: { original_price: 18500, selling_price: 18500, is_on_sale: false },
    variants: { colors: [{ id: 'indigo', name: 'Indigo/Gold', hex: '#3D2E5C' }], sizes: ['M', 'L', 'XL'] },
    images: [{ url: 'https://picsum.photos/seed/nuhafrik-pants/800/1000', alt: 'Kente Pants', is_primary: true }],
    metadata: { is_new_arrival: false, is_featured: true, is_best_seller: false },
    published: true
  },
  {
    sku: 'NH-CL-DRS-003',
    name: 'Botanical Wrap Midi Dress',
    slug: 'botanical-wrap-midi-dress',
    short_description: 'Midi-length wrap dress in sage green with terracotta motifs.',
    description: 'A midi-length wrap dress cut from vibrant Ankara print cotton in sage green with scattered terracotta botanical motifs. Features a deep V-neckline, a self-tie waist sash, and a graceful A-line skirt with natural movement. From daytime to celebration.',
    category_id: 'clothing',
    subcategory_id: 'dresses',
    tags: ['dress', 'wrap', 'sage', 'terracotta'],
    pricing: { original_price: 28000, selling_price: 28000, is_on_sale: false },
    variants: { colors: [{ id: 'sage', name: 'Sage Green', hex: '#5C6B45' }], sizes: ['S', 'M', 'L'] },
    images: [{ url: 'https://picsum.photos/seed/nuhafrik-dress/800/1000', alt: 'Wrap Dress', is_primary: true }],
    metadata: { is_new_arrival: false, is_featured: true, is_best_seller: true },
    published: true
  },
  {
    sku: 'NH-CL-2PC-004',
    name: 'Aso-Oke Two-Piece Set',
    slug: 'aso-oke-two-piece-set',
    short_description: 'Coordinated buba top and wrapper skirt in metallic gold.',
    description: 'A coordinated Aso-Oke two-piece set comprising a square-neck buba top with rich gold metallic threading and a matching wrapper skirt. Woven in warm amber tones with burgundy warp accents. Tailored for ceremonies, weddings, and cultural celebrations.',
    category_id: 'clothing',
    subcategory_id: 'two-pieces',
    tags: ['aso-oke', 'ceremonial', 'gold', 'amber'],
    pricing: { original_price: 55000, selling_price: 45000, is_on_sale: true, discount_percentage: 18 },
    variants: { colors: [{ id: 'amber', name: 'Amber Gold', hex: '#C8893A' }], sizes: ['Custom'] },
    images: [{ url: 'https://picsum.photos/seed/nuhafrik-twopiece/800/1000', alt: 'Aso-Oke Set', is_primary: true }],
    metadata: { is_new_arrival: true, is_featured: true, is_best_seller: false },
    published: true
  },
  {
    sku: 'NH-CL-JMP-005',
    name: 'Tailored Wide-Leg Jumpsuit',
    slug: 'tailored-wide-leg-jumpsuit',
    short_description: 'Hunter green cotton twill jumpsuit with Aso-Oke belt.',
    description: 'A tailored wide-leg jumpsuit in hunter green cotton twill with a plunging V-neckline and a statement Aso-Oke woven gold waist belt. Five gold button front closure with concealed side pockets. Structured shoulders, relaxed legs — powerful and refined in equal measure.',
    category_id: 'clothing',
    subcategory_id: 'jumpsuits',
    tags: ['jumpsuit', 'green', 'tailored', 'aso-oke'],
    pricing: { original_price: 38000, selling_price: 38000, is_on_sale: false },
    variants: { colors: [{ id: 'green', name: 'Hunter Green', hex: '#2C3E2F' }], sizes: ['S', 'M', 'L'] },
    images: [{ url: 'https://picsum.photos/seed/nuhafrik-jumpsuit/800/1000', alt: 'Jumpsuit', is_primary: true }],
    metadata: { is_new_arrival: false, is_featured: false, is_best_seller: false },
    published: true
  },
  {
    sku: 'NH-CL-LNG-006',
    name: 'Satin & Lace Lingerie Set',
    slug: 'satin-and-lace-lingerie-set',
    short_description: 'Blush pink satin bralette and high-waist brief set.',
    description: 'A delicate bralette and high-waist brief set in blush pink satin with fine Chantilly lace scallop trim. Adjustable straps, underwire-free bralette, and a satin bow at the centre front. Breathable, soft, and designed to make you feel beautiful every day.',
    category_id: 'clothing',
    subcategory_id: 'lingerie',
    tags: ['lingerie', 'satin', 'lace', 'pink'],
    pricing: { original_price: 14500, selling_price: 14500, is_on_sale: false },
    variants: { colors: [{ id: 'pink', name: 'Blush Pink', hex: '#E8A8B8' }], sizes: ['S', 'M', 'L'] },
    images: [{ url: 'https://picsum.photos/seed/nuhafrik-lingerie/800/1000', alt: 'Lingerie Set', is_primary: true }],
    metadata: { is_new_arrival: false, is_featured: false, is_best_seller: false },
    published: true
  },
  {
    sku: 'NH-CL-UND-007',
    name: 'Premium Combed Cotton Briefs (3-Pack)',
    slug: 'premium-combed-cotton-briefs-3-pack',
    short_description: 'Assorted everyday briefs in soft combed cotton.',
    description: 'Premium everyday briefs in 95% combed cotton with a 5% elastane no-roll waistband. Mid-rise cut with full rear coverage and a flat front panel. Dermatologically tested and skin-kind. Comes as a 3-pack in assorted colours — navy, grey, and cobalt blue.',
    category_id: 'clothing',
    subcategory_id: 'underwear',
    tags: ['underwear', 'cotton', 'briefs', 'essentials'],
    pricing: { original_price: 7500, selling_price: 7500, is_on_sale: false },
    variants: { colors: [{ id: 'assorted', name: 'Assorted', hex: '#3D5E9A' }], sizes: ['M', 'L', 'XL', 'XXL'] },
    images: [{ url: 'https://picsum.photos/seed/nuhafrik-underwear/800/1000', alt: 'Cotton Briefs', is_primary: true }],
    metadata: { is_new_arrival: false, is_featured: false, is_best_seller: true },
    published: true
  },
  {
    sku: 'NH-AC-BAG-001',
    name: 'Hand-Woven Raffia Tote Bag',
    slug: 'hand-woven-raffia-tote-bag',
    short_description: 'Structured tote bag with leather trim and carry handles.',
    description: 'A structured tote bag hand-woven from natural raffia with a rich brown leather trim, base, and carry handles. Spacious interior with a magnetic clasp and a zip-lined inner pocket. Roomy enough for market runs, work, or a weekend outing — crafted with Nigerian artisanal pride.',
    category_id: 'accessories',
    subcategory_id: 'bags',
    tags: ['bag', 'raffia', 'woven', 'leather'],
    pricing: { original_price: 22000, selling_price: 22000, is_on_sale: false },
    variants: { colors: [{ id: 'natural', name: 'Natural/Brown', hex: '#6B4C2A' }], sizes: ['One Size'] },
    images: [{ url: 'https://picsum.photos/seed/nuhafrik-bag/800/1000', alt: 'Raffia Bag', is_primary: true }],
    metadata: { is_new_arrival: false, is_featured: true, is_best_seller: true },
    published: true
  },
  {
    sku: 'NH-AC-SH-002',
    name: 'Terracotta Leather Block Mules',
    slug: 'terracotta-leather-block-mules',
    short_description: 'Handcrafted open-toe mules in full-grain leather.',
    description: 'Handcrafted open-toe mules in genuine terracotta-dyed full-grain leather with a 7cm solid block heel. Lightly cushioned leather insole and a non-slip rubber outsole. A sleek everyday shoe that carries the warmth of African earth tones from the ground up.',
    category_id: 'accessories',
    subcategory_id: 'shoes',
    tags: ['shoes', 'mules', 'leather', 'terracotta'],
    pricing: { original_price: 30000, selling_price: 30000, is_on_sale: false },
    variants: { colors: [{ id: 'terracotta', name: 'Terracotta', hex: '#B5451B' }], sizes: ['37', '38', '39', '40', '41'] },
    images: [{ url: 'https://picsum.photos/seed/nuhafrik-shoes/800/1000', alt: 'Leather Mules', is_primary: true }],
    metadata: { is_new_arrival: true, is_featured: true, is_best_seller: false },
    published: true
  },
  {
    sku: 'NH-AC-PRS-003',
    name: 'Velvet Evening Clutch',
    slug: 'velvet-evening-clutch',
    short_description: 'Compact evening clutch with gold turn-lock clasp.',
    description: 'A compact evening clutch in deep aubergine velvet with a gold-toned turn-lock clasp and a detachable chunky chain strap. Interior fitted with a card slot, mirror pocket, and a lipstick loop. The perfect finishing touch for owambe events, dinners, and night outs.',
    category_id: 'accessories',
    subcategory_id: 'purse',
    tags: ['clutch', 'velvet', 'evening', 'gold'],
    pricing: { original_price: 16500, selling_price: 16500, is_on_sale: false },
    variants: { colors: [{ id: 'aubergine', name: 'Aubergine', hex: '#3D2C5A' }], sizes: ['One Size'] },
    images: [{ url: 'https://picsum.photos/seed/nuhafrik-purse/800/1000', alt: 'Velvet Clutch', is_primary: true }],
    metadata: { is_new_arrival: false, is_featured: false, is_best_seller: false },
    published: true
  },
  {
    sku: 'NH-AC-HW-004',
    name: 'Pre-Tied Aso-Oke Gele',
    slug: 'pre-tied-aso-oke-gele',
    short_description: 'Terracotta Gele with gold metallic threading.',
    description: 'A pre-tied and pre-shaped Aso-Oke Gele in terracotta with subtle gold metallic threading. Fits head circumferences 54–60cm with a hidden elastic inner band for a secure, comfortable hold. No tying skill required — ceremonial elegance made instantly accessible for every occasion.',
    category_id: 'accessories',
    subcategory_id: 'headwear',
    tags: ['gele', 'aso-oke', 'terracotta', 'ceremonial'],
    pricing: { original_price: 10000, selling_price: 10000, is_on_sale: false },
    variants: { colors: [{ id: 'terracotta-gold', name: 'Terracotta Gold', hex: '#B5451B' }], sizes: ['Adjustable'] },
    images: [{ url: 'https://picsum.photos/seed/nuhafrik-gele/800/1000', alt: 'Pre-Tied Gele', is_primary: true }],
    metadata: { is_new_arrival: false, is_featured: false, is_best_seller: false },
    published: true
  },
  {
    sku: 'NH-AC-BLT-005',
    name: 'Kente Inlay Leather Belt',
    slug: 'kente-inlay-leather-belt',
    short_description: 'Full-grain leather belt with brass buckle.',
    description: 'A 3.5cm wide full-grain dark brown leather belt with Kente cloth inlay panels in burnt orange and gold, and a solid brass rectangular buckle. Five adjustable sizing holes. Equally at home cinching a casual outfit or finishing a formal agbada ensemble — a defining accessory.',
    category_id: 'accessories',
    subcategory_id: 'belts',
    tags: ['belt', 'leather', 'kente', 'brass'],
    pricing: { original_price: 13500, selling_price: 13500, is_on_sale: false },
    variants: { colors: [{ id: 'brown', name: 'Dark Brown', hex: '#3D2B1A' }], sizes: ['S', 'M', 'L', 'XL'] },
    images: [{ url: 'https://picsum.photos/seed/nuhafrik-belt/800/1000', alt: 'Leather Belt', is_primary: true }],
    metadata: { is_new_arrival: false, is_featured: false, is_best_seller: false },
    published: true
  },
  {
    sku: 'NH-AC-SG-006',
    name: 'Forest Green Polarised Sunglasses',
    slug: 'forest-green-polarised-sunglasses',
    short_description: 'Bold square-frame sunglasses with 100% UV protection.',
    description: 'Bold square-frame sunglasses in deep forest green acetate with polarised green-tinted lenses delivering 100% UV400 protection. Lightweight spring-hinge temples ensure a comfortable all-day fit. Arrives in a branded microfibre pouch and a rigid hard case.',
    category_id: 'accessories',
    subcategory_id: 'sunglasses',
    tags: ['sunglasses', 'green', 'polarised', 'uv-protection'],
    pricing: { original_price: 15000, selling_price: 15000, is_on_sale: false },
    variants: { colors: [{ id: 'forest-green', name: 'Forest Green', hex: '#1E2E22' }], sizes: ['One Size'] },
    images: [{ url: 'https://picsum.photos/seed/nuhafrik-sunglasses/800/1000', alt: 'Sunglasses', is_primary: true }],
    metadata: { is_new_arrival: true, is_featured: false, is_best_seller: false },
    published: true
  },
  {
    sku: 'NH-AC-JW-007',
    name: 'Gye Nyame Gold Jewelry Set',
    slug: 'gye-nyame-gold-jewelry-set',
    short_description: '18k gold-plated necklace and earring set.',
    description: 'A matching necklace and earring set in 18k gold-plated brass. The oval pendant features the Gye Nyame Adinkra symbol — a powerful West African emblem of divine supremacy — on a 45cm adjustable chain. Hypoallergenic posts. Presented in a signature Nuhafrik gift box.',
    category_id: 'accessories',
    subcategory_id: 'jewelry',
    tags: ['jewelry', 'gold', 'necklace', 'earrings', 'adinkra'],
    pricing: { original_price: 25000, selling_price: 25000, is_on_sale: false },
    variants: { colors: [{ id: 'gold', name: 'Gold', hex: '#C8893A' }], sizes: ['One Size'] },
    images: [{ url: 'https://picsum.photos/seed/nuhafrik-jewelry/800/1000', alt: 'Jewelry Set', is_primary: true }],
    metadata: { is_new_arrival: true, is_featured: true, is_best_seller: true },
    published: true
  }
];

async function seed() {
  console.log('Starting seeding process...');
  
  // Clear existing products
  const snap = await getDocs(collection(db, 'products'));
  console.log(`Found ${snap.size} existing products. Deleting...`);
  for (const sdoc of snap.docs) {
    await deleteDoc(doc(db, 'products', sdoc.id));
  }
  console.log('Existing products deleted.');

  for (const product of catalogueProducts) {
    try {
      await addDoc(collection(db, 'products'), {
        ...product,
        created_at: serverTimestamp()
      });
      console.log(`Seeded: ${product.name}`);
    } catch (e) {
      console.error(`Error seeding ${product.name}:`, e);
    }
  }
  console.log('Seeding complete!');
  process.exit(0);
}

seed();
