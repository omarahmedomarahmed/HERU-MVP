import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Staff } from '@/api/heruClient'
import { Search, MessageSquare, Users, Building2, Trophy } from 'lucide-react'

const CHAT_TYPES = [
  { id: 'organizer_chat',  label: 'Organizer Chat',  icon: Building2, color: 'text-purple-400' },
  { id: 'general_chat',    label: 'General Chat',    icon: Users,     color: 'text-blue-400'   },
  { id: 'support_chat',    label: 'Support Chat',    icon: MessageSquare, color: 'text-amber-400' },
]

function ChatMsg({ msg }) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-zinc-800/30 last:border-0">
      <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-xs font-bold text-zinc-400">
        {(msg.sender_name||msg.author_name||'?')[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold text-zinc-300">{msg.sender_name||msg.author_name||'Unknown'}</span>
          {msg.role && <span className="text-[10px] text-zinc-600">{msg.role}</span>}
          <span className="text-[10px] text-zinc-600 ml-auto">
            {msg.created_at ? new Date(msg.created_at).toLocaleString() : msg.timestamp || ''}
          </span>
        </div>
        <p className="text-sm text-zinc-400 break-words">{msg.text||msg.message||msg.content||''}</p>
      </div>
    </div>
  )
}

export default function StaffMessages() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [chatType, setChatType] = useState('organizer_chat')

  const { data, isLoading } = useQuery({
    queryKey: ['staff-messages', search],
    queryFn: () => Staff.messages(search ? { q: search } : {}),
  })

  const tournaments = data?.tournaments || data || []

  const getMessages = (t) => {
    const msgs = t[chatType]
    if (!Array.isArray(msgs)) return []
    return msgs
  }

  const totalMsgs = tournaments.reduce((s,t) => s + (t[chatType]?.length||0), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Messages Monitor</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Read-only view of all platform chats</p>
        </div>
        <div className="flex items-center gap-2 bg-[#111] border border-zinc-800 rounded-lg px-3 py-1.5">
          <Search size={13} className="text-zinc-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search tournaments…" className="bg-transparent text-sm text-white placeholder-zinc-600 outline-none w-44"/>
        </div>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {CHAT_TYPES.map(ct => (
          <button key={ct.id} onClick={() => { setChatType(ct.id); setSelected(null) }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px
              ${chatType===ct.id ? 'border-red-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
            <ct.icon size={13} className={chatType===ct.id?ct.color:''}/>
            {ct.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4 min-h-[500px]">
        {/* Tournament list */}
        <div className="col-span-2 bg-[#0e0e0e] border border-zinc-800/50 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800/50">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Tournaments ({tournaments.length})
            </p>
          </div>
          {isLoading ? (
            <div className="p-4 text-center text-zinc-500 text-sm">Loading…</div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/30">
              {tournaments.map(t => {
                const msgs = getMessages(t)
                return (
                  <button key={t.id} onClick={() => setSelected(t)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors
                      ${selected?.id===t.id ? 'bg-red-500/10' : 'hover:bg-white/[0.02]'}`}>
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                      <Trophy size={12} className="text-zinc-500"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 font-medium truncate">{t.name}</p>
                      <p className="text-xs text-zinc-600">{msgs.length} messages</p>
                    </div>
                    {msgs.length > 0 && (
                      <span className="shrink-0 w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center justify-center">
                        {msgs.length > 99 ? '99+' : msgs.length}
                      </span>
                    )}
                  </button>
                )
              })}
              {tournaments.length === 0 && (
                <div className="p-6 text-center text-zinc-600 text-sm">No tournaments found</div>
              )}
            </div>
          )}
        </div>

        {/* Chat view */}
        <div className="col-span-3 bg-[#0e0e0e] border border-zinc-800/50 rounded-xl overflow-hidden flex flex-col">
          {selected ? (
            <>
              <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center gap-2">
                <Trophy size={14} className="text-zinc-500"/>
                <span className="text-sm font-semibold text-white truncate">{selected.name}</span>
                <span className="text-xs text-zinc-600 ml-auto">{getMessages(selected).length} msgs</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {getMessages(selected).length === 0 ? (
                  <div className="text-center text-zinc-600 text-sm py-8">No messages in this chat</div>
                ) : (
                  getMessages(selected).map((msg, i) => <ChatMsg key={i} msg={msg}/>)
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={32} className="text-zinc-700 mx-auto mb-2"/>
                <p className="text-zinc-600 text-sm">Select a tournament to view chats</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
