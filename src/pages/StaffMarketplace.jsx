import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StaffLayout from '@/components/layouts/StaffLayout';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Plus, Edit2 } from 'lucide-react';
import { MarketplaceItem } from '@/api/heruClient'


export default function StaffMarketplace() {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const { data: items = [] } = useQuery({
    queryKey: ['staff-marketplace'],
    queryFn: () => MarketplaceItem.list('-created_date'),
  });

  const filtered = items.filter(i => {
    if (filterCategory !== 'all' && i.category !== filterCategory) return false;
    if (filterActive === 'active' && !i.is_active) return false;
    if (filterActive === 'inactive' && i.is_active) return false;
    return true;
  });

  const categories = ['game_setup', 'teams', 'live_talent', 'production', 'branding', 'venue', 'prizepool'];

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-white">MARKETPLACE <span className="text-red-500">ITEMS</span></h1>
          <GlowButton onClick={() => {}} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Item
          </GlowButton>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <FloatingPanel key={item.id} className="p-4">
              {item.image && (
                <div className="aspect-video bg-zinc-800 rounded-lg mb-3 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}
              <p className="text-white font-bold text-sm">{item.title}</p>
              <p className="text-gray-400 text-xs mt-1">{item.category}</p>
              <p className="text-red-400 font-bold text-sm mt-2">EGP {item.price?.toLocaleString()}</p>
              <div className="flex gap-2 mt-3">
                <span className={`text-xs px-2 py-1 rounded ${item.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <GlowButton variant="ghost" size="sm" className="w-full mt-3">
                <Edit2 className="w-3 h-3" /> Edit
              </GlowButton>
            </FloatingPanel>
          ))}
        </div>
      </div>
    </StaffLayout>
  );
}