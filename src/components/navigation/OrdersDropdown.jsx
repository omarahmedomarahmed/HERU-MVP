import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import HexBadge from '@/components/ui/HexBadge';

export default function OrdersDropdown({ isOpen, onClose, orders = [] }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-zinc-800">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Package className="w-4 h-4 text-red-500" />
                My Orders
              </h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {orders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  to={`/gamer/orders/${order.id}`}
                  onClick={onClose}
                  className="block p-4 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">
                      Order #{order.id?.slice(0, 8)}
                    </span>
                    <HexBadge className={`text-xs ${
                      order.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                      order.status === 'processing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                      order.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                    }`}>
                      {order.status}
                    </HexBadge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{order.items?.length || 0} items</span>
                    <span className="text-white font-bold">EGP {(order.total || 0).toLocaleString()}</span>
                  </div>
                </Link>
              ))}
              {orders.length === 0 && (
                <div className="p-8 text-center">
                  <ShoppingBag className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No orders yet</p>
                </div>
              )}
            </div>
            {orders.length > 0 && (
              <Link
                to={'/gamer/orders'}
                onClick={onClose}
                className="block p-3 text-center text-red-400 hover:text-red-300 text-sm font-medium border-t border-zinc-800"
              >
                View All Orders <ChevronRight className="w-4 h-4 inline" />
              </Link>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}