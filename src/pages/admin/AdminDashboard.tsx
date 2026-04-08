import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { generatePlaceholderProducts } from '../../lib/gemini';
import { 
  Sparkles, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MoreVertical
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { Product, Order } from '../../types';

export const AdminDashboard = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Stats
        const productsSnap = await getDocs(collection(db, 'products'));
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const usersSnap = await getDocs(collection(db, 'users'));

        const totalSales = ordersSnap.docs.reduce((acc, doc) => acc + (doc.data().pricing?.total || 0), 0);

        setStats({
          totalSales,
          totalOrders: ordersSnap.size,
          totalProducts: productsSnap.size,
          totalCustomers: usersSnap.size
        });

        // Fetch Recent Orders
        const recentOrdersQuery = query(collection(db, 'orders'), orderBy('created_at', 'desc'), limit(5));
        const recentOrdersSnap = await getDocs(recentOrdersQuery);
        setRecentOrders(recentOrdersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));

        // Fetch Top Products (just using first 5 for now)
        const topProductsQuery = query(collection(db, 'products'), limit(5));
        const topProductsSnap = await getDocs(topProductsQuery);
        setTopProducts(topProductsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const seedFromCatalogue = async () => {
    setIsSeeding(true);
    setStatus('loading');
    setMessage('Seeding products from official catalogue...');
    
    const catalogueProducts = [
      {
        name: 'Ankara Print Short-Sleeve Top',
        short_description: 'Vibrant Ankara-print short-sleeve top with botanical motifs.',
        description: 'A vibrant Ankara-print short-sleeve top featuring a classic round neckline and relaxed fit. Hand-cut from 100% woven cotton with authentic African botanical dot motifs in burnt orange. Versatile enough for casual outings or styled up for social events.',
        category: 'Clothing',
        subcategory: 'Tops',
        pricing: { original_price: 15000, selling_price: 12000, is_on_sale: true, discount_percentage: 20 },
        variants: { colors: [{ name: 'Burnt Orange', hex: '#B5451B' }], sizes: ['S', 'M', 'L', 'XL'] },
        images: [{ url: 'https://picsum.photos/seed/nuhafrik-top/800/1000', is_primary: true }],
        metadata: { is_new_arrival: true, is_featured: false },
        published: true
      },
      {
        name: 'Kente-Inspired Wide-Leg Trousers',
        short_description: 'Wide-leg trousers in deep indigo with Kente-inspired panels.',
        description: 'Wide-leg trousers in deep indigo cotton blend featuring woven Kente-inspired gold and rust stripe panels. High-rise waistband with a comfortable elastic back. A bold statement bottom that honours West African weaving tradition in a modern silhouette.',
        category: 'Clothing',
        subcategory: 'Pants',
        pricing: { original_price: 18500, selling_price: 18500, is_on_sale: false },
        variants: { colors: [{ name: 'Indigo/Gold', hex: '#3D2E5C' }], sizes: ['M', 'L', 'XL'] },
        images: [{ url: 'https://picsum.photos/seed/nuhafrik-pants/800/1000', is_primary: true }],
        metadata: { is_new_arrival: false, is_featured: true },
        published: true
      },
      {
        name: 'Botanical Wrap Midi Dress',
        short_description: 'Midi-length wrap dress in sage green with terracotta motifs.',
        description: 'A midi-length wrap dress cut from vibrant Ankara print cotton in sage green with scattered terracotta botanical motifs. Features a deep V-neckline, a self-tie waist sash, and a graceful A-line skirt with natural movement. From daytime to celebration.',
        category: 'Clothing',
        subcategory: 'Dresses',
        pricing: { original_price: 28000, selling_price: 28000, is_on_sale: false },
        variants: { colors: [{ name: 'Sage Green', hex: '#5C6B45' }], sizes: ['S', 'M', 'L'] },
        images: [{ url: 'https://picsum.photos/seed/nuhafrik-dress/800/1000', is_primary: true }],
        metadata: { is_new_arrival: false, is_featured: true },
        published: true
      },
      {
        name: 'Aso-Oke Two-Piece Set',
        short_description: 'Coordinated buba top and wrapper skirt in metallic gold.',
        description: 'A coordinated Aso-Oke two-piece set comprising a square-neck buba top with rich gold metallic threading and a matching wrapper skirt. Woven in warm amber tones with burgundy warp accents. Tailored for ceremonies, weddings, and cultural celebrations.',
        category: 'Clothing',
        subcategory: 'Two Pieces',
        pricing: { original_price: 55000, selling_price: 45000, is_on_sale: true, discount_percentage: 18 },
        variants: { colors: [{ name: 'Amber Gold', hex: '#C8893A' }], sizes: ['Custom'] },
        images: [{ url: 'https://picsum.photos/seed/nuhafrik-twopiece/800/1000', is_primary: true }],
        metadata: { is_new_arrival: true, is_featured: true },
        published: true
      },
      {
        name: 'Tailored Wide-Leg Jumpsuit',
        short_description: 'Hunter green cotton twill jumpsuit with Aso-Oke belt.',
        description: 'A tailored wide-leg jumpsuit in hunter green cotton twill with a plunging V-neckline and a statement Aso-Oke woven gold waist belt. Five gold button front closure with concealed side pockets. Structured shoulders, relaxed legs — powerful and refined in equal measure.',
        category: 'Clothing',
        subcategory: 'Jumpsuits',
        pricing: { original_price: 38000, selling_price: 38000, is_on_sale: false },
        variants: { colors: [{ name: 'Hunter Green', hex: '#2C3E2F' }], sizes: ['S', 'M', 'L'] },
        images: [{ url: 'https://picsum.photos/seed/nuhafrik-jumpsuit/800/1000', is_primary: true }],
        metadata: { is_new_arrival: false, is_featured: false },
        published: true
      }
    ];

    try {
      for (const product of catalogueProducts) {
        await addDoc(collection(db, 'products'), {
          ...product,
          created_at: serverTimestamp()
        });
      }

      setMessage(`Successfully seeded ${catalogueProducts.length} products from the catalogue!`);
      setStatus('success');
    } catch (error) {
      console.error('Error seeding from catalogue:', error);
      setMessage('Error seeding products. Check console.');
      setStatus('error');
    } finally {
      setIsSeeding(false);
    }
  };

  const seedWithAI = async () => {
    setIsSeeding(true);
    setStatus('loading');
    setMessage('Generating premium products with Gemini AI...');
    
    try {
      const products = await generatePlaceholderProducts();
      
      if (!products || products.length === 0) {
        throw new Error('No products generated');
      }

      setMessage(`Generated ${products.length} products. Now seeding to Firestore...`);
      
      for (const product of products) {
        await addDoc(collection(db, 'products'), {
          ...product,
          created_at: serverTimestamp()
        });
      }

      setMessage(`Successfully seeded ${products.length} AI-generated products!`);
      setStatus('success');
    } catch (error) {
      console.error('Error seeding database:', error);
      setMessage('Error generating or seeding products. Check console.');
      setStatus('error');
    } finally {
      setIsSeeding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(stats.totalSales), icon: TrendingUp, trend: '+12.5%', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, trend: '+8.2%', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Products', value: stats.totalProducts, icon: Package, trend: '+4.1%', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Customers', value: stats.totalCustomers, icon: Users, trend: '+2.4%', color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className={cn("rounded-xl p-2.5", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                <ArrowUpRight size={14} />
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              <p className="text-2xl font-black tracking-tight text-[#1A1A1A]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2 flex flex-col rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <h3 className="text-lg font-bold">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary">#{order.order_number}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{order.customer.name}</span>
                        <span className="text-xs text-gray-500">{order.customer.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        order.status === 'delivered' ? "bg-green-100 text-green-700" :
                        order.status === 'cancelled' ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">{formatCurrency(order.pricing.total)}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="rounded-lg p-1.5 hover:bg-gray-100 text-gray-400">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No orders found yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="flex flex-col rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <h3 className="text-lg font-bold">Top Products</h3>
            <Link to="/admin/products" className="text-sm font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="flex flex-col divide-y divide-gray-100">
            {topProducts.length > 0 ? topProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100">
                  <img src={product.images[0]?.url} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-sm font-bold text-gray-900">{product.name}</h4>
                  <p className="text-xs text-gray-500">{product.category_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{formatCurrency(product.pricing.selling_price)}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">12 Sales</p>
                </div>
              </div>
            )) : (
              <div className="px-6 py-12 text-center text-gray-400 italic">No products found yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9A84C]/10 text-[#C9A84C]">
            <Sparkles size={24} />
          </div>
          <h2 className="mt-6 text-xl font-bold text-[#1A3C2E]">AI Product Generator</h2>
          <p className="mt-2 text-sm text-gray-500">
            Use Gemini AI to generate 20+ premium, African-inspired placeholder products across all store categories.
          </p>
          
          <div className="mt-8 flex flex-col gap-4">
            <Button 
              onClick={seedWithAI} 
              disabled={isSeeding}
              className="w-full rounded-xl bg-secondary py-6 text-xs font-bold uppercase tracking-widest text-white hover:bg-primary"
            >
              {isSeeding ? 'Generating...' : 'Generate with Gemini AI'}
            </Button>
            
            {status !== 'idle' && (
              <div className={cn(
                "flex items-start gap-3 rounded-xl p-4 text-sm",
                status === 'loading' && "bg-blue-50 text-blue-700",
                status === 'success' && "bg-green-50 text-green-700",
                status === 'error' && "bg-red-50 text-red-700"
              )}>
                {status === 'loading' && <div className="mt-0.5 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                {status === 'success' && <CheckCircle2 size={18} className="mt-0.5" />}
                {status === 'error' && <AlertCircle size={18} className="mt-0.5" />}
                <p>{message}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Database size={24} />
          </div>
          <h2 className="mt-6 text-xl font-bold text-[#1A3C2E]">Catalogue Seeding</h2>
          <p className="mt-2 text-sm text-gray-500">
            Seed the store with the official Nuhafrik catalogue products (Ankara, Kente, Aso-Oke collections).
          </p>
          <div className="mt-8">
            <Button 
              onClick={seedFromCatalogue} 
              disabled={isSeeding}
              variant="outline"
              className="w-full rounded-xl border-gray-200 py-6 text-xs font-bold uppercase tracking-widest text-secondary hover:bg-gray-50"
            >
              {isSeeding ? 'Seeding...' : 'Seed Official Catalogue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
