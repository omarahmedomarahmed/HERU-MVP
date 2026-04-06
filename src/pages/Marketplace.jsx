import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import HexBadge from '@/components/ui/HexBadge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GamerProfile, MarketplaceItem, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

import {
  ShoppingBag, Search, ShoppingCart, Award, Package,
  Gamepad2, Monitor, Headphones, Gift, Star, Video, MapPin, Eye,
  Tag, Check, Zap, Sparkles
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: ShoppingBag },
  { id: 'prizepool', label: 'Prizes', icon: Award },
  { id: 'branding', label: 'Merch', icon: Star },
  { id: 'game_setup', label: 'Gaming', icon: Gamepad2 },
  { id: 'production', label: 'Production', icon: Monitor },
  { id: 'venue', label: 'Venue', icon: MapPin },
];

const CATEGORY_COLORS = {
  prizepool: 'from-orange-500 to-red-600',
  branding: 'from-pink-500 to-purple-600',
  game_setup: 'from-blue-500 to-cyan-600',
  production: 'from-green-500 to-emerald-600',
  venue: 'from-violet-500 to-indigo-600',
  teams: 'from-yellow-500 to-amber-600',
  live_talent: 'from-rose-500 to-red-600',
};

export default function Marketplace() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [gameTag, setGameTag] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [addedItems, setAddedItems] = useState({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
    } catch (e) {}
  };

  const { data: profile } = useQuery({
    queryKey: ['gamer-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await GamerProfile.list({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['marketplace-all-items'],
    queryFn: () => MarketplaceItem.list({ is_active: true }, '-created_date'),
  });

  const filterItems = () => {
    let filtered = items;
    if (activeTab !== 'all') {
      filtered = filtered.filter(i => i.category === activeTab);
    }
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const { data: cart = [] } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => {
      const savedCart = localStorage.getItem(`cart_${user?.id}`);
      return savedCart ? JSON.parse(savedCart) : [];
    },
    enabled: !!user?.id,
  });

  const addToCart = (item, tag = '') => {
    const newCart = [...cart, { ...item, cartId: Date.now(), gameTag: tag }];
    localStorage.setItem(`cart_${user?.id}`, JSON.stringify(newCart));
    queryClient.invalidateQueries(['cart', user?.id]);
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => setAddedItems(prev => ({ ...prev, [item.id]: false })), 2000);
    setSelectedItem(null);
    setGameTag('');
  };

  const quickAddToCart = (e, item) => {
    e.stopPropagation();
    if (item.type === 'gaming_currency') {
      setSelectedItem(item);
      return;
    }
    addToCart(item);
  };

  const gradient = (cat) => CATEGORY_COLORS[cat] || 'from-gray-500 to-gray-600';

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length}>
      {/* Hero Header */}
      <div className="relative mb-8 p-6 md:p-8 rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-red-950/30 border border-zinc-800/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px]" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <HexBadge className="mb-3">
              <Sparkles className="w-3 h-3 mr-1" /> MARKETPLACE
            </HexBadge>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              GAMER <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">SHOP</span>
            </h1>
            <p className="text-gray-400 mt-2 max-w-md">Browse items, gear, and prizes. Add to cart and checkout with EGP.</p>
          </div>
          <Link to={'/gamer/cart'}>
            <GlowButton>
              <ShoppingCart className="w-4 h-4" />
              Cart ({cart.length})
            </GlowButton>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items, prizes, gear..."
          className="pl-12 h-12 bg-zinc-900/80 border-zinc-800 text-white rounded-xl text-base"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2 mb-6 -mx-1">
          <TabsList className="bg-zinc-900/50 border-zinc-800 h-auto gap-1 p-1 inline-flex min-w-max">
            {CATEGORIES.map(cat => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="aspect-[3/4] bg-zinc-900/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filterItems().length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filterItems().map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative bg-zinc-900/80 border border-zinc-800/50 rounded-2xl overflow-hidden cursor-pointer hover:border-zinc-700 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="aspect-square relative overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradient(item.category)} opacity-20`}>
                      <Package className="w-20 h-20 text-white/30" />
                    </div>
                  )}
                  {/* Price tag */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-black/80 backdrop-blur-sm border border-white/10 text-white text-sm font-black px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <Tag className="w-3 h-3 text-red-400" />
                      EGP {(item.price || 0).toLocaleString()}
                    </div>
                  </div>
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <div className={`bg-gradient-to-r ${gradient(item.category)} text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider`}>
                      {(item.category || '').replace(/_/g, ' ')}
                    </div>
                  </div>
                  {/* Stock warning */}
                  {item.stock !== undefined && item.stock !== null && item.stock <= 5 && (
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-yellow-500/90 text-black text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Only {item.stock} left!
                      </span>
                    </div>
                  )}
                  {/* Quick add overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => quickAddToCart(e, item)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all transform scale-90 group-hover:scale-100 ${
                        addedItems[item.id]
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-black hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      {addedItems[item.id] ? (
                        <><Check className="w-4 h-4" /> Added!</>
                      ) : (
                        <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-sm truncate mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{item.description}</p>
                  {item.type && (
                    <span className="inline-block mt-2 text-[10px] bg-zinc-800 text-gray-400 px-2 py-0.5 rounded-md font-medium uppercase tracking-wider">
                      {item.type.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <FloatingPanel className="p-12 text-center">
            <Package className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl text-white font-bold mb-2">No Items Found</h3>
            <p className="text-gray-400">Try a different category or search term</p>
          </FloatingPanel>
        )}
      </Tabs>

      {/* Item Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedItem?.title}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="py-2">
              <div className="aspect-video bg-zinc-800 rounded-xl mb-4 overflow-hidden">
                {selectedItem.image ? (
                  <img src={selectedItem.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradient(selectedItem.category)} opacity-30`}>
                    <Package className="w-16 h-16 text-white/40" />
                  </div>
                )}
              </div>

              {/* Category + type */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`bg-gradient-to-r ${gradient(selectedItem.category)} text-white text-xs font-bold px-2.5 py-1 rounded-lg uppercase`}>
                  {(selectedItem.category || '').replace(/_/g, ' ')}
                </span>
                {selectedItem.type && (
                  <span className="text-xs text-gray-500 bg-zinc-800 px-2 py-1 rounded-lg">
                    {selectedItem.type.replace(/_/g, ' ')}
                  </span>
                )}
              </div>

              <p className="text-gray-400 text-sm mb-4 leading-relaxed">{selectedItem.description}</p>

              <div className="flex items-center justify-between mb-4 p-3 bg-zinc-800/50 rounded-xl">
                <span className="text-2xl font-black bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  EGP {(selectedItem.price || 0).toLocaleString()}
                </span>
                {selectedItem.stock !== undefined && selectedItem.stock !== null && (
                  <span className="text-gray-500 text-sm">{selectedItem.stock} in stock</span>
                )}
              </div>

              {/* Game tag input for digital items */}
              {selectedItem.type === 'gaming_currency' && (
                <div className="mb-4">
                  <label className="text-sm text-gray-400 block mb-2 flex items-center gap-1">
                    <Gamepad2 className="w-4 h-4" /> Your Game Tag / Username *
                  </label>
                  <Input
                    value={gameTag}
                    onChange={(e) => setGameTag(e.target.value)}
                    placeholder="Enter your in-game username"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              )}

              <GlowButton
                className="w-full"
                onClick={() => addToCart(selectedItem, gameTag)}
                disabled={selectedItem.type === 'gaming_currency' && !gameTag}
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart — EGP {(selectedItem.price || 0).toLocaleString()}
              </GlowButton>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </GamerLayout>
  );
}
