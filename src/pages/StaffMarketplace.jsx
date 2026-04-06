import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Edit2, X, Check, Package, Upload, Image as ImageIcon,
} from 'lucide-react';
import { MarketplaceItem } from '@/api/heruClient';
import { uploadFile } from '@/lib/uploadFile';
import { useAuth } from '@/lib/AuthContext';

const CATEGORIES = [
  'game_setup', 'teams', 'live_talent', 'production', 'branding', 'venue', 'prizepool',
];

const CATEGORY_COLORS = {
  game_setup:  'bg-green-500/20 text-green-400',
  teams:       'bg-blue-500/20 text-blue-400',
  live_talent: 'bg-pink-500/20 text-pink-400',
  production:  'bg-purple-500/20 text-purple-400',
  branding:    'bg-cyan-500/20 text-cyan-400',
  venue:       'bg-orange-500/20 text-orange-400',
  prizepool:   'bg-yellow-500/20 text-yellow-400',
};

const emptyForm = {
  title: '', description: '', category: 'branding', price: '', image: '', stock: '', is_active: true,
};

export default function StaffMarketplace() {
  const queryClient = useQueryClient();
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [uploading, setUploading] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['staff-marketplace-items'],
    queryFn: () => MarketplaceItem.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => MarketplaceItem.create({
      ...data,
      price: parseFloat(data.price) || 0,
      stock: data.stock ? parseInt(data.stock) : null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-marketplace-items'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => MarketplaceItem.update(id, {
      ...data,
      price: parseFloat(data.price) || 0,
      stock: data.stock ? parseInt(data.stock) : null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-marketplace-items'] });
      resetForm();
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => MarketplaceItem.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-marketplace-items'] }),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const openEdit = (item) => {
    setForm({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'branding',
      price: item.price?.toString() || '',
      image: item.image || '',
      stock: item.stock?.toString() || '',
      is_active: item.is_active ?? true,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await uploadFile(file);
      setForm(f => ({ ...f, image: file_url }));
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filtered = items.filter(i => {
    if (filterCategory !== 'all' && i.category !== filterCategory) return false;
    if (filterActive === 'active' && !i.is_active) return false;
    if (filterActive === 'inactive' && i.is_active) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          Marketplace <span className="text-blue-400">Items</span>
        </h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select
            value={filterActive}
            onChange={e => setFilterActive(e.target.value)}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <span className="text-gray-500 text-sm self-center ml-auto">{filtered.length} items</span>
        </div>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">
              {editingId ? 'Edit Item' : 'Add New Item'}
            </h2>
            <button onClick={resetForm} className="text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Title</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Item title"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Price (EGP)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                required
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Stock (optional)</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Unlimited"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 block mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Item description..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 block mb-1">Image</label>
              <div className="flex items-center gap-3">
                {form.image && (
                  <img src={form.image} alt="" className="w-16 h-16 rounded-lg object-cover border border-zinc-700" />
                )}
                <label className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-gray-300 hover:border-blue-500 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 bg-zinc-800 text-gray-300 rounded-lg text-sm hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {editingId ? 'Save Changes' : 'Create Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Card Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading marketplace items...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-gray-500">No items found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              {item.image ? (
                <div className="aspect-video bg-zinc-800 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video bg-zinc-800 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-zinc-700" />
                </div>
              )}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-white font-medium text-sm">{item.title}</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${CATEGORY_COLORS[item.category] || 'bg-zinc-700 text-gray-300'}`}>
                      {item.category?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-blue-400 font-bold text-sm whitespace-nowrap">EGP {(item.price || 0).toLocaleString()}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Stock: {item.stock != null ? item.stock : 'Unlimited'}</span>
                  <button
                    onClick={() => toggleActiveMutation.mutate({ id: item.id, is_active: !item.is_active })}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                      item.is_active
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    }`}
                  >
                    {item.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {item.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <button
                  onClick={() => openEdit(item)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-lg text-xs font-medium transition-colors"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
