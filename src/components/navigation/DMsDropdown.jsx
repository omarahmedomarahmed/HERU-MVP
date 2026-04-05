import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, User, ChevronRight, Users, Trophy, Package } from 'lucide-react';

export default function DMsDropdown({ isOpen, onClose, conversations = [], profiles = [], userId }) {
  const getOtherParticipant = (conv) => {
    const otherId = conv.participants?.find(p => p !== userId);
    return profiles.find(p => p.user_id === otherId);
  };

  const getChatIcon = (chatType) => {
    switch (chatType) {
      case 'team': return <Users className="w-5 h-5 text-blue-400" />;
      case 'tournament': return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'order_support': return <Package className="w-5 h-5 text-green-400" />;
      default: return null;
    }
  };

  const getChatDisplay = (conv) => {
    const chatType = conv.chat_type || 'gamer';
    
    if (chatType === 'gamer') {
      const other = getOtherParticipant(conv);
      return {
        name: other?.username || 'Unknown User',
        avatar: other?.avatar,
        icon: null,
        label: null
      };
    }
    
    return {
      name: conv.chat_name || 'Chat',
      avatar: null,
      icon: getChatIcon(chatType),
      label: chatType === 'team' ? 'Team Chat' : 
             chatType === 'tournament' ? 'Tournament Chat' : 
             chatType === 'order_support' ? 'Support Chat' : null
    };
  };

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
                <MessageCircle className="w-4 h-4 text-red-500" />
                Messages
              </h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {conversations.slice(0, 8).map((conv) => {
                const display = getChatDisplay(conv);
                const lastMsg = conv.messages?.[conv.messages.length - 1];
                
                return (
                  <Link
                    key={conv.id}
                    to={`/gamer/notifications/${conv.id}`}
                    onClick={onClose}
                    className="block p-4 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                        {display.icon ? (
                          display.icon
                        ) : display.avatar ? (
                          <img src={display.avatar} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium truncate">{display.name}</p>
                          {display.label && (
                            <span className="text-xs text-gray-500 bg-zinc-800 px-1.5 py-0.5 rounded">{display.label}</span>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm truncate">
                          {lastMsg?.content || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {conversations.length === 0 && (
                <div className="p-8 text-center">
                  <MessageCircle className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No conversations yet</p>
                </div>
              )}
            </div>
            {conversations.length > 0 && (
              <Link
                to={'/direct-messages'}
                onClick={onClose}
                className="block p-3 text-center text-red-400 hover:text-red-300 text-sm font-medium border-t border-zinc-800"
              >
                View All Messages <ChevronRight className="w-4 h-4 inline" />
              </Link>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}