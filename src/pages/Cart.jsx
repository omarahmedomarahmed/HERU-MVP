import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import CoinDisplay from '@/components/ui/CoinDisplay';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ShoppingCart, Trash2, ArrowLeft, Package, CreditCard,
  MapPin, Phone, User, Tag, Check, Coins
} from 'lucide-react';
import { awardCoins, spendCoins, COIN_REWARDS } from '@/components/utils/coinRewards';
import { AppSettings, Bill, GamerProfile, Order, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import PhoneInput from '@/components/ui/PhoneInput'
import { useToast } from '@/components/ui/use-toast'


export default function Cart() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [useCoins, setUseCoins] = useState(false);
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

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
      setShippingAddress(prev => ({ ...prev, name: userData.full_name }));
    } catch (e) {
      navigate('/gamer/home');
    }
  };

  const { data: profile } = useQuery({
    queryKey: ['gamer-profile', user?.id],
    queryFn: async () => {
      const profiles = await GamerProfile.list({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  const { data: coinData } = useQuery({
    queryKey: ['coins', user?.id],
    queryFn: async () => {
      const coins = await AppSettings.list({ user_id: user.id });
      return coins[0] || { balance: 0 };
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

  const { data: promoCodes = [] } = useQuery({
    queryKey: ['promo-codes'],
    queryFn: () => AppSettings.list(),
  });

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

  const applyPromoCode = () => {
    const code = promoCodes.find(c => 
      c.code === promoCode && 
      !c.used && 
      (c.is_generic || c.gamer_id === user?.id)
    );
    if (code) {
      setPromoApplied(code);
    } else {
      alert('Invalid or expired promo code');
    }
  };

  const COIN_VALUE = 0.01;
  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const discount = promoApplied ? (subtotal * promoApplied.discount_percent / 100) : 0;
  const afterDiscount = subtotal - discount;
  
  const maxCoinDiscount = Math.min(coinData?.balance * COIN_VALUE || 0, afterDiscount);
  const coinDiscount = useCoins ? maxCoinDiscount : 0;
  const coinsToSpend = useCoins ? Math.floor(maxCoinDiscount / COIN_VALUE) : 0;
  
  const total = afterDiscount - coinDiscount;

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
        discount_applied: discount + coinDiscount,
        promo_code_used: promoApplied?.code,
        status: 'pending',
        shipping_address: shippingAddress,
        support_chat: []
      });

      // Mark promo code as used
      try {
        if (promoApplied) {
          await AppSettings.update(promoApplied.id, { used: true });
        }
      } catch (e) { console.warn('Could not mark promo used:', e); }

      // Spend coins if used
      try {
        if (useCoins && coinsToSpend > 0) {
          await spendCoins(user.id, coinsToSpend, 'Purchase discount');
        }
      } catch (e) { console.warn('Could not spend coins:', e); }

      // Add to purchased items
      try {
        if (profile) {
          const purchasedItems = profile.purchased_items || [];
          cart.forEach(item => {
            purchasedItems.push({
              item_id: item.id,
              purchased_at: new Date().toISOString(),
              order_id: order.id
            });
          });
          await GamerProfile.updateMe({ purchased_items: purchasedItems });
        }
      } catch (e) { console.warn('Could not update purchased items:', e); }

      // Create a bill for this order
      try {
        await Bill.create({
          bill_type: 'gamer',
          payer_id: user.id,
          payer_type: 'gamer',
          payer_name: profile?.username || user?.full_name || user?.email,
          payer_email: user?.email,
          items: cart.map(item => ({ title: item.title, price: item.price, quantity: item.quantity || 1 })),
          subtotal: subtotal,
          platform_fee: 0,
          grand_total: total,
          payment_status: 'unpaid',
        });
      } catch (e) { console.warn('Could not create bill:', e); }

      // Award coins for purchase
      try {
        awardCoins(user.id, COIN_REWARDS.BUY_ITEM * cart.length, 'Made a purchase');
      } catch (e) { console.warn('Could not award coins:', e); }

      clearCart();
      return order;
    },
    onSuccess: (order) => {
      toast({ title: 'Order placed!', description: `Order #${order?.id?.slice(0, 8)} created. Check your billing for payment.` });
      setCheckoutModal(false);
      navigate('/gamer/billing');
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
                    placeholder="Enter code"
                    className="bg-zinc-800 border-zinc-700 text-white"
                    disabled={!!promoApplied}
                  />
                  <GlowButton 
                    variant="secondary" 
                    onClick={applyPromoCode}
                    disabled={!!promoApplied}
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

              {/* Use Coins */}
              {coinData?.balance > 0 && (
                <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 text-white">
                      <input
                        type="checkbox"
                        checked={useCoins}
                        onChange={(e) => setUseCoins(e.target.checked)}
                        className="rounded bg-zinc-700 border-zinc-600"
                      />
                      <Coins className="w-4 h-4 text-yellow-400" />
                      Use HERU Coins
                    </label>
                  </div>
                  <p className="text-gray-500 text-xs">
                    You have {coinData.balance} coins (EGP {(coinData.balance * COIN_VALUE).toFixed(2)} value)
                  </p>
                  {useCoins && (
                    <p className="text-yellow-400 text-sm mt-1">
                      Using {coinsToSpend} coins for -EGP {coinDiscount.toFixed(2)} discount
                    </p>
                  )}
                </div>
              )}

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
                {coinDiscount > 0 && (
                  <div className="flex justify-between text-yellow-400">
                    <span>Coin Discount</span>
                    <span>-EGP {coinDiscount.toFixed(2)}</span>
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