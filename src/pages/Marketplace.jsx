import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GamerProfile, MarketplaceItem, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

import {
  ShoppingBag, Search, ShoppingCart, Award, Package, 
  Gamepad2, Monitor, Headphones, Gift, Star, Video, MapPin, Eye
} from 'lucide-react';

export default function Marketplace() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [gameTag, setGameTag] = useState('');
  const [activeTab, setActiveTab] = useState('prizepool');
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

  const categories = [
    { id: 'prizepool', label: 'Featured Items', icon: Award },
  ];

  const filterItems = (category) => {
    let filtered = items.filter(i => i.category === category);
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
    setSelectedItem(null);
    setGameTag('');
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat?.icon || Gift;
  };

  const isPurchasable = activeTab === 'prizepool';

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <HexBadge className="mb-3">
            <ShoppingBag className="w-3 h-3 mr-1" /> MARKETPLACE
          </HexBadge>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            GAMER <span className="text-red-500">SHOP</span>
          </h1>
          <p className="text-gray-400 mt-2">Browse featured items and prizes</p>
        </div>
        <Link to={'/gamer/cart'}>
          <GlowButton variant="secondary">
            <ShoppingCart className="w-4 h-4" />
            Cart ({cart.length})
          </GlowButton>
        </Link>
      </div>

      {/* Search */}
      <FloatingPanel className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="pl-10 bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
      </FloatingPanel>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-zinc-900 border-zinc-800 mb-6 flex-wrap h-auto gap-1 p-1">
          {categories.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id} className="data-[state=active]:bg-red-600 flex items-center gap-2">
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(cat => (
          <TabsContent key={cat.id} value={cat.id}>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="aspect-square bg-zinc-900/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filterItems(cat.id).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filterItems(cat.id).map((item) => {
                  const Icon = getCategoryIcon(item.category);
                  return (
                    <GameCard 
                      key={item.id} 
                      className="h-full cursor-pointer" 
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-900/20 to-zinc-900">
                            <Icon className="w-16 h-16 text-zinc-600" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                          EGP {item.price}
                          </span>
                        </div>
                        {item.stock !== undefined && item.stock <= 5 && (
                          <div className="absolute bottom-2 left-2">
                            <span className="bg-yellow-500/90 text-black text-xs font-bold px-2 py-0.5 rounded">
                              Only {item.stock} left!
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-bold text-sm truncate">{item.title}</h3>
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>
                        {item.type && (
                          <span className="inline-block mt-2 text-xs bg-zinc-800 text-gray-400 px-2 py-0.5 rounded">
                            {item.type.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </GameCard>
                  );
                })}
              </div>
            ) : (
              <FloatingPanel className="p-12 text-center">
                <Package className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-xl text-white font-bold mb-2">No Items Found</h3>
                <p className="text-gray-400">Try adjusting your search or check back later</p>
              </FloatingPanel>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Item Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="py-4">
              <div className="aspect-video bg-zinc-800 rounded-lg mb-4 overflow-hidden">
                {selectedItem.image ? (
                  <img src={selectedItem.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Award className="w-16 h-16 text-zinc-600" />
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-4">{selectedItem.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-red-400">EGP {selectedItem.price}</span>
                {selectedItem.stock !== undefined && (
                  <span className="text-gray-500 text-sm">{selectedItem.stock} in stock</span>
                )}
              </div>
              
              {selectedItem.category === 'prizepool' && (
                <>
                  {selectedItem.type === 'gaming_currency' && (
                    <div className="mb-4">
                      <label className="text-sm text-gray-400 block mb-2">Your Game Tag/Username *</label>
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
                    Add to Cart
                  </GlowButton>
                </>
              )}

              {selectedItem.category !== 'prizepool' && (
                <div className="p-4 bg-zinc-800/50 rounded-lg text-center">
                  <Eye className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">This item is available for organizers building tournaments</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </GamerLayout>
  );
}