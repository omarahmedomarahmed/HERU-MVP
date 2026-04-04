import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';

export default function CoinsDropdown({ isOpen, onClose, balance = 0, transactions = [] }) {
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
            <div className="p-4 border-b border-zinc-800 bg-gradient-to-r from-yellow-500/10 to-zinc-900">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold">HERU Coins</h3>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-2xl font-bold text-yellow-400">{balance}</span>
                </div>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {transactions?.slice(0, 10).reverse().map((tx, idx) => (
                <div
                  key={idx}
                  className="p-3 border-b border-zinc-800/50 hover:bg-zinc-800/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${tx.type === 'earn' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {tx.type === 'earn' ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">{tx.reason}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.type === 'earn' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                  </span>
                </div>
              ))}
              {(!transactions || transactions.length === 0) && (
                <div className="p-8 text-center">
                  <Coins className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No transactions yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}