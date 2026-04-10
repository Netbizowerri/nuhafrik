import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Product, ProductImage, ProductColor } from '../../types';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cn } from '../../lib/utils';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  product 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    description: '',
    category_id: 'Clothing',
    subcategory_id: '',
    pricing: {
      original_price: 0,
      selling_price: 0,
      is_on_sale: false,
    },
variants: {
       sizes: ['S', 'M', 'L', 'XL', '38', '39', '40', '41', '42'],
       colors: [],
     },
    metadata: {
      is_featured: false,
      is_new_arrival: true,
      is_best_seller: false,
    },
    inventory: 0,
    tags: [],
    images: [],
    published: true,
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newColor, setNewColor] = useState({ name: '', hex: '#000000' });
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (product) {
      setFormData(product);
      setTagsInput(product.tags?.join(', ') || '');
    } else {
      setFormData({
        name: '',
        sku: '',
        description: '',
        category_id: 'Clothing',
        subcategory_id: '',
        pricing: {
          original_price: 0,
          selling_price: 0,
          is_on_sale: false,
        },
        variants: {
          sizes: ['S', 'M', 'L', 'XL'],
          colors: [],
        },
        metadata: {
          is_featured: false,
          is_new_arrival: true,
          is_best_seller: false,
        },
        inventory: 0,
        tags: [],
        images: [],
        published: true,
      });
      setTagsInput('');
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      const data = {
        ...formData,
        tags,
        slug: formData.name?.toLowerCase().replace(/\s+/g, '-'),
        updated_at: serverTimestamp(),
      };

      if (product?.id) {
        await updateDoc(doc(db, 'products', product.id), data);
      } else {
        await addDoc(collection(db, 'products'), {
          ...data,
          created_at: serverTimestamp(),
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please check your permissions.');
    } finally {
      setLoading(false);
    }
  };

  const addImage = () => {
    if (!newImageUrl) return;
    if (formData.images && formData.images.length >= 3) {
      alert('Maximum 3 images allowed.');
      return;
    }
    const newImg: ProductImage = {
      url: newImageUrl,
      alt: formData.name || 'Product Image',
      is_primary: formData.images?.length === 0,
    };
    setFormData({
      ...formData,
      images: [...(formData.images || []), newImg],
    });
    setNewImageUrl('');
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const addColor = () => {
    if (!newColor.name) return;
    const color: ProductColor = {
      id: Date.now().toString(),
      ...newColor,
    };
    setFormData({
      ...formData,
      variants: {
        ...formData.variants!,
        colors: [...(formData.variants?.colors || []), color],
      },
    });
    setNewColor({ name: '', hex: '#000000' });
  };

  const removeColor = (id: string) => {
    setFormData({
      ...formData,
      variants: {
        ...formData.variants!,
        colors: formData.variants?.colors.filter(c => c.id !== id) || [],
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-4">
      <div className="relative mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full max-w-4xl min-w-0 flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:min-h-0 sm:max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-8 sm:py-6">
          <h2 className="min-w-0 text-xl font-black tracking-tight text-primary sm:text-2xl">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button 
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-primary"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-8 overflow-y-auto px-4 py-5 sm:p-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Product Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  placeholder="e.g. Premium Cotton Tee"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">SKU (Optional)</label>
                <input 
                  type="text" 
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  placeholder="e.g. NUH-TEE-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Description</label>
              <textarea 
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                rows={4}
                placeholder="Detailed product information..."
              />
            </div>

            {/* Pricing & Category */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</label>
                <select 
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="Clothing">Clothing</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Footwear">Footwear</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Selling Price (NGN)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  value={formData.pricing?.selling_price}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    pricing: { ...formData.pricing!, selling_price: parseFloat(e.target.value) } 
                  })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Original Price (NGN)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={formData.pricing?.original_price}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    pricing: { ...formData.pricing!, original_price: parseFloat(e.target.value) } 
                  })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Inventory (Stock)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={formData.inventory}
                  onChange={(e) => setFormData({ ...formData, inventory: parseInt(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Product Tags (comma separated)</label>
              <input 
                type="text" 
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                placeholder="e.g. summer, cotton, essential"
              />
            </div>

            {/* Images */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Product Images (Max 3)</label>
                <span className="text-[10px] font-bold text-gray-400">{formData.images?.length || 0}/3</span>
              </div>
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
                <input 
                  type="text" 
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  placeholder="Paste image URL here..."
                />
                <Button type="button" onClick={addImage} className="w-full rounded-xl bg-secondary px-6 py-3 sm:w-auto">
                  Add Image
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {formData.images?.map((img, idx) => (
                  <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                    <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                    {img.is_primary && (
                      <div className="absolute bottom-2 left-2 rounded-lg bg-primary px-2 py-0.5 text-[8px] font-bold uppercase text-white">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Variants */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '48', '50', 'Free Size'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        const currentSizes = formData.variants?.sizes || [];
                        const newSizes = currentSizes.includes(size)
                          ? currentSizes.filter(s => s !== size)
                          : [...currentSizes, size];
                        setFormData({
                          ...formData,
                          variants: { ...formData.variants!, sizes: newSizes }
                        });
                      }}
                      className={cn(
                        "rounded-xl border px-4 py-2 text-xs font-bold transition-all",
                        formData.variants?.sizes.includes(size)
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 bg-white text-gray-500 hover:border-primary hover:text-primary"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Colors</label>
                <div className="flex min-w-0 flex-wrap gap-2">
                  <input 
                    type="text" 
                    placeholder="Color Name"
                    value={newColor.name}
                    onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                    className="min-w-0 flex-[1_1_12rem] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                  <input 
                    type="color" 
                    value={newColor.hex}
                    onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                    className="h-12 w-12 shrink-0 rounded-xl border border-gray-200 bg-gray-50 p-1 focus:outline-none"
                  />
                  <Button type="button" onClick={addColor} className="min-h-12 w-full rounded-xl bg-secondary px-4 sm:w-auto">
                    <Plus size={18} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.variants?.colors.map((color) => (
                    <div key={color.id} className="flex items-center gap-2 rounded-full border border-gray-100 bg-white py-1.5 pl-2 pr-3 shadow-sm">
                      <div className="h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: color.hex }} />
                      <span className="text-xs font-bold text-gray-700">{color.name}</span>
                      <button type="button" onClick={() => removeColor(color.id)} className="text-gray-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Settings</label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.metadata?.is_featured}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      metadata: { ...formData.metadata!, is_featured: e.target.checked } 
                    })}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-bold text-gray-700">Featured</span>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-bold text-gray-700">Published</span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-4 sm:px-8 sm:py-6">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="w-full rounded-xl px-6 font-bold text-gray-500 sm:w-auto sm:px-8"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-xl bg-primary px-8 font-bold text-white shadow-lg shadow-primary/20 sm:w-auto sm:px-12"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  Saving...
                </div>
              ) : (
                product ? 'Update Product' : 'Create Product'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
