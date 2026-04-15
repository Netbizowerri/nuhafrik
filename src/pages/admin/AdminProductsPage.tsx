import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
  CheckCircle2,
  XCircle,
  Package
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn, formatCurrency } from '../../lib/utils';
import { Product } from '../../types';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { isPermissionDeniedError } from '../../lib/firebaseErrors';
import { ProductFormModal } from '../../components/admin/ProductFormModal';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      setError(null);
      // Fetch without orderBy to avoid index issues with mixed date types
      const q = query(collection(db, 'products'));
      const snap = await getDocs(q);
      const productsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      // Sort in memory for robustness
      const sorted = [...productsData].sort((a, b) => {
        const getTime = (val: any) => {
          if (!val) return 0;
          if (val.seconds) return val.seconds * 1000;
          if (val instanceof Date) return val.getTime();
          if (typeof val === 'string') return new Date(val).getTime();
          return 0;
        };
        return getTime(b.created_at) - getTime(a.created_at);
      });
      
      setProducts(sorted);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(
        isPermissionDeniedError(error)
          ? 'Firebase denied product access for this admin session. Deploy the live Firestore rules before managing inventory here.'
          : 'Unable to load products right now.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const togglePublish = async (product: Product) => {
    try {
      await updateDoc(doc(db, 'products', product.id), {
        published: !product.published
      });
      setProducts(products.map(p => p.id === product.id ? { ...p, published: !p.published } : p));
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-bold">Product access is blocked by Firestore permissions.</p>
        <p className="mt-2 leading-7">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#1A1A1A]">Products</h1>
          <p className="text-sm text-gray-500">Manage your store inventory and catalog.</p>
        </div>
        <Button 
          onClick={handleAddNew}
          className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:scale-105"
        >
          <Plus size={18} />
          Add New Product
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or SKU..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-3">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Clothing">Clothing</option>
            <option value="Accessories">Accessories</option>
            <option value="Footwear">Footwear</option>
          </select>
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Filter size={18} />
            More Filters
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="flex flex-col rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-8">
                      <div className="h-12 w-full rounded-lg bg-gray-100"></div>
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                          <img 
                            src={product.images[0]?.url || 'https://picsum.photos/seed/placeholder/100/100'} 
                            alt={product.name} 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">{product.name}</span>
                          <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">SKU: {product.sku || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                        {product.category_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{formatCurrency(product.pricing.selling_price)}</span>
                        {product.pricing.is_on_sale && (
                          <span className="text-[10px] text-red-500 line-through">{formatCurrency(product.pricing.original_price)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "font-bold text-xs",
                        product.inventory <= 5 ? "text-red-500" : "text-gray-600"
                      )}>
                        {product.inventory}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => togglePublish(product)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                          product.published 
                            ? "bg-green-100 text-green-700 hover:bg-green-200" 
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        )}
                      >
                        {product.published ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {product.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {product.created_at?.toDate ? product.created_at.toDate().toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-primary transition-all">
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(product)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-primary transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="rounded-full bg-gray-50 p-6 text-gray-300">
                        <Package size={48} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-bold text-gray-900">No products found</h3>
                        <p className="text-sm text-gray-500">Try adjusting your search or filters, or add a new product.</p>
                      </div>
                      <Button 
                        onClick={() => {
                          setSearchQuery('');
                          setFilterCategory('All');
                        }}
                        className="mt-4 rounded-xl bg-primary px-8 py-3 text-xs font-bold uppercase tracking-widest text-white"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <span className="text-xs font-medium text-gray-500">Showing {filteredProducts.length} of {products.length} products</span>
          <div className="flex gap-2">
            <button disabled className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-400 disabled:opacity-50">Previous</button>
            <button disabled className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-400 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProducts}
        product={editingProduct}
      />
    </div>
  );
};
