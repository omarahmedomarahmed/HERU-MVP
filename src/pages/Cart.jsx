import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ShoppingCart, Trash2, ArrowLeft, Package, CreditCard,
  MapPin, User, Tag, Check, Trophy, Zap
} from 'lucide-react';
import { Bill, GamerProfile, Order, Tournament, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import PhoneInput from '@/components/ui/PhoneInput'
import { useToast } from '@/components/ui/use-toast'


export default function Cart() {
  const { toast } = useToast();
  // Use the global auth context — gives correct user.id (Supabase UUID)
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  // (coins feature reserved for future — no backend yet)
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    country: '',
    postal_code: '',
    phone: ''
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Pre-fill name from auth user
  useEffect(() => {
    if (user && !shippingAddress.name) {
      setShippingAddress(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
      }));
    }
  }, [user]);

  // Redirect if not authenticated after loading
  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/auth/gamer/login');
  }, [authLoading, isAuthenticated]);

  const { data: profile } = useQuery({
    queryKey: ['gamer-profile', user?.id],
    queryFn: async () => {
      const profiles = await GamerProfile.list({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  const { data: cart = [] } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => {
      const savedCart = localStorage.getItem(`cart_${user?.id}`);
      return savedCart ? JSON.parse(savedCart) : [];
    },
    enabled: !!user?.id,
  });

  // Fetch live/published tournaments to cross-reference cart items with prize pools
  const { data: activeTournaments = [] } = useQuery({
    queryKey: ['active-tournaments-for-cart'],
    queryFn: () => Tournament.list({ status: 'live' }),
    staleTime: 60000,
  });

  // Build a map: marketplace item ID → list of tournaments offering it as prize
  const prizeItemTournamentMap = React.useMemo(() => {
    const map = {};
    activeTournaments.forEach((t) => {
      const breakdown = t.prize_breakdown || [];
      breakdown.forEach((place) => {
        (place.items || []).forEach((itemId) => {
          if (!map[itemId]) map[itemId] = [];
          map[itemId].push(t);
        });
      });
    });
    return map;
  }, [activeTournaments]);

  // Which cart items are also tournament prizes?
  const cartItemsWithPrize = React.useMemo(
    () => cart.filter((ci) => prizeItemTournamentMap[ci.id]?.length > 0),
    [cart, prizeItemTournamentMap]
  );

  const removeFromCart = (cartId) => {
    const newCart = cart.filter(item => item.cartId !== cartId);
    localStorage.setItem(`cart_${user?.id}`, JSON.stringify(newCart));
    queryClient.setQueryData(['cart', user?.id], newCart);
  };

  const updateQuantity = (cartId, delta) => {
    const newCart = cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    localStorage.setItem(`cart_${user?.id}`, JSON.stringify(newCart));
    queryClient.setQueryData(['cart', user?.id], newCart);
  };

  const clearCart = () => {
    localStorage.setItem(`cart_${user?.id}`, JSON.stringify([]));
    queryClient.setQueryData(['cart', user?.id], []);
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const result = await apiCall('/promos/validate', {
        method: 'POST',
        body: { code: promoCode.trim(), gamer_id: user?.id },
      });
      setPromoApplied(result);
      toast({ title: `${result.discount_percent}% discount applied!` });
    } catch {
      toast({ title: 'Invalid or expired promo code', variant: 'destructive' });
    } finally {
      setPromoLoading(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const discount = promoApplied ? (subtotal * promoApplied.discount_percent / 100) : 0;
  const total = subtotal - discount;

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const order = await Order.create({
        gamer_id: user?.id,
        items: cart.map(item => ({
          item_id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity || 1,
          gameTag: item.gameTag
        })),
        total,
        promo_code_used: promoApplied?.code || null,
        status: 'pending',
        shipping_address: shippingAddress,
        support_chat: []
      });

      // Create a bill for this order
      try {
        await Bill.create({
          bill_type: 'gamer',
          payer_id: user.id,
          payer_type: 'gamer',
          payer_name: profile?.username || user?.user_metadata?.full_name || user?.email,
          payer_email: user?.email,
          items: cart.map(item => ({ title: item.title, price: item.price, quantity: item.quantity || 1 })),
          subtotal,
          platform_fee: 0,
          grand_total: total,
          payment_status: 'unpaid',
        });
      } catch (e) { console.warn('Could not create bill:', e); }

      clearCart();
      return order;
    },
    onSuccess: (order) => {
      toast({ title: 'Order placed!', description: `Order #${order?.id?.slice(0, 8)} created. Check your orders for details.` });
      setCheckoutModal(false);
      navigate('/gamer/orders');
    },
    onError: (err) => {
      toast({ title: 'Order failed', description: err.message || 'Please try again.', variant: 'destructive' });
    }
  });

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length}>
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link to={'/gamer/marketplace'} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            YOUR <span className="text-red-500">CART</span>
          </h1>
        </div>
        {cart.length > 0 && (
          <GlowButton variant="ghost" onClick={clearCart}>
            <Trash2 className="w-4 h-4" />
            Clear Cart
          </GlowButton>
        )}
      </div>

      {/* Prize-win notification banner */}
      {cartItemsWithPrize.length > 0 && (
        <div className="mb-6 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 flex items-start gap-3">
          <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-300 font-bold text-sm">
              You can WIN {cartItemsWithPrize.length === 1 ? 'an item' : 'items'} in your cart for FREE!
            </p>
            <p className="text-yellow-400/80 text-xs mt-1">
              {cartItemsWithPrize.map((ci) => `"${ci.title}"`).join(', ')} {cartItemsWithPrize.length === 1 ? 'is' : 'are'} being offered as prize{cartItemsWithPrize.length > 1 ? 's' : ''} in active tournaments.
              Join a tournament to win it instead of buying it!
            </p>
            <Link to="/gamer/tournaments" className="inline-flex items-center gap-1 text-yellow-400 text-xs font-bold mt-2 hover:text-yellow-300 underline underline-offset-2">
              <Zap className="w-3 h-3" />
              Browse Tournaments
            </Link>
          </div>
        </div>
      )}

      {cart.length === 0 ? (
        <FloatingPanel className="p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl text-white font-bold mb-2">Your Cart is Empty</h3>
          <p className="text-gray-400 mb-6">Add some awesome items from the prizepool store!</p>
          <Link to={'/gamer/marketplace'}>
            <GlowButton>
              <Package className="w-4 h-4" />
              Browse Shop
            </GlowButton>
          </Link>
        </FloatingPanel>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FloatingPanel className="p-6">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.cartId} className="flex gap-4 p-4 bg-zinc-800/50 rounded-lg">
                    <div className="w-20 h-20 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-zinc-600 m-auto mt-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold truncate">{item.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-1">{item.description}</p>
                      {item.gameTag && (
                        <p className="text-yellow-400 text-xs mt-1">Game ID: {item.gameTag}</p>
                      )}
                      {prizeItemTournamentMap[item.id]?.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Trophy className="w-3 h-3 text-yellow-400" />
                          <span className="text-yellow-400 text-xs font-semibold">
                            Win this FREE in "{prizeItemTournamentMap[item.id][0].name}"
                            {prizeItemTournamentMap[item.id].length > 1 && ` + ${prizeItemTournamentMap[item.id].length - 1} more`}
                          </span>
                          <Link to="/gamer/tournaments" className="text-yellow-400/70 text-xs underline ml-1 hover:text-yellow-300">
                            Join
                          </Link>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-red-400 font-bold">EGP {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                        <div className="flex items-center gap-1 ml-auto mr-2">
                          <button
                            onClick={() => updateQuantity(item.cartId, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-zinc-700 text-white hover:bg-zinc-600 text-sm font-bold"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-white font-medium text-sm">{item.quantity || 1}</span>
                          <button
                            onClick={() => updateQuantity(item.cartId, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-zinc-700 text-white hover:bg-zinc-600 text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="p-2 text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </FloatingPanel>
          </div>

          <div>
            <FloatingPanel className="p-6" glowBorder>
              <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>

              {/* Promo Code */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 block mb-2">Promo Code</label>
                <div className="flex gap-2">
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="bg-zinc-800 border-zinc-700 text-white"
                    disabled={!!promoApplied || promoLoading}
                    onKeyDown={(e) => e.key === 'Enter' && !promoApplied && applyPromoCode()}
                  />
                  <GlowButton
                    variant="secondary"
                    onClick={applyPromoCode}
                    disabled={!!promoApplied || promoLoading || !promoCode.trim()}
                  >
                    {promoApplied ? <Check className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                  </GlowButton>
                </div>
                {promoApplied && (
                  <p className="text-green-400 text-sm mt-2">
                    ✓ {promoApplied.discount_percent}% discount applied!
                  </p>
                )}
              </div>

              <div className="space-y-3 border-t border-zinc-800 pt-4">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>EGP {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Promo Discount</span>
                    <span>-EGP {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-white pt-3 border-t border-zinc-800">
                  <span>Total</span>
                  <span>EGP {total.toFixed(2)}</span>
                </div>
              </div>

              <GlowButton 
                className="w-full mt-6" 
                size="lg"
                onClick={() => setCheckoutModal(true)}
              >
                <CreditCard className="w-5 h-5" />
                Checkout
              </GlowButton>
            </FloatingPanel>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <Dialog open={checkoutModal} onOpenChange={setCheckoutModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Shipping Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Street Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">City</label>
                <Input
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Postal Code</label>
                <Input
                  value={shippingAddress.postal_code}
                  onChange={(e) => setShippingAddress({...shippingAddress, postal_code: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Country</label>
              <Input
                value={shippingAddress.country}
                onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Phone</label>
              <PhoneInput
                value={shippingAddress.phone}
                onChange={(v) => setShippingAddress({...shippingAddress, phone: v})}
              />
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <div className="flex justify-between text-xl font-bold text-white">
                <span>Total</span>
                <span>EGP {total.toFixed(2)}</span>
                </div>
                </div>

                <GlowButton 
                className="w-full"
                onClick={() => placeOrderMutation.mutate()}
              disabled={!shippingAddress.name || !shippingAddress.street || !shippingAddress.city}
            >
              <CreditCard className="w-4 h-4" />
              Place Order
            </GlowButton>
          </div>
        </DialogContent>
      </Dialog>
    </GamerLayout>
  );
}