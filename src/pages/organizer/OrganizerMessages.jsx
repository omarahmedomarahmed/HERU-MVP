import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/AuthContext'
import { Tournament } from '@/api/heruClient'
import {
  MessageSquare, Loader2, ChevronRight, Gamepad2, Clock,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(timestamp) {
  if (!timestamp) return ''
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short',
  })
}

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Thread Card
// ---------------------------------------------------------------------------

function ThreadCard({ tournament, lastMessage, onClick }) {
  const preview = lastMessage?.message || lastMessage?.text || ''
  const senderName = lastMessage?.sender_name || 'Unknown'
  const timestamp = lastMessage?.timestamp || lastMessage?.created_at

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-white/10 bg-[#1a1a2e] p-4 hover:border-violet-500/40 transition-all group"
    >
      <div className="flex items-start gap-3">
        {/* Tournament icon */}
        <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
          {tournament.tournament_image ? (
            <img
              src={tournament.tournament_image}
              alt=""
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <Gamepad2 className="w-5 h-5 text-violet-400" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-white font-semibold text-sm truncate group-hover:text-violet-300 transition-colors">
              {tournament.name}
            </h3>
            {timestamp && (
              <span className="text-[10px] text-gray-600 whitespace-nowrap flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(timestamp)}
              </span>
            )}
          </div>

          {tournament.game && (
            <p className="text-xs text-gray-500 mt-0.5">{tournament.game}</p>
          )}

          {/* Message preview */}
          {preview ? (
            <p className="text-sm text-gray-400 mt-1.5 truncate">
              <span className="text-gray-500">{senderName}:</span>{' '}
              {preview}
            </p>
          ) : (
            <p className="text-sm text-gray-600 mt-1.5 italic">No messages yet</p>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors shrink-0 mt-1" />
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function OrganizerMessages() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Fetch all tournaments for this organizer (they all potentially have chats)
  const {
    data: tournamentsData,
    isLoading,
  } = useQuery({
    queryKey: ['organizer-tournaments-messages', user?.id],
    queryFn: () => Tournament.list({ organizer_id: user?.id }),
    enabled: !!user?.id,
    staleTime: 30_000,
  })

  // Normalize and filter to tournaments that have chat activity
  const rawTournaments = Array.isArray(tournamentsData) ? tournamentsData : tournamentsData?.data || []

  // Build thread list: tournament + last message, sorted by most recent message
  const threads = rawTournaments
    .map((t) => {
      const chat = t.organizer_chat || []
      const lastMessage = chat.length > 0 ? chat[chat.length - 1] : null
      return { tournament: t, lastMessage, lastTimestamp: lastMessage?.timestamp || lastMessage?.created_at || null }
    })
    .filter((t) => t.lastMessage !== null || t.tournament.status === 'live')
    .sort((a, b) => {
      // Threads with messages first, sorted by most recent
      if (a.lastTimestamp && b.lastTimestamp) {
        return new Date(b.lastTimestamp) - new Date(a.lastTimestamp)
      }
      if (a.lastTimestamp) return -1
      if (b.lastTimestamp) return 1
      return 0
    })

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ----------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ----------------------------------------------------------------- */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-violet-400" />
            Messages
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Organizer chat threads from your tournaments.
          </p>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Threads List                                                      */}
        {/* ----------------------------------------------------------------- */}
        {isLoading ? (
          <SectionLoader />
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <MessageSquare className="w-14 h-14 mb-4 opacity-20" />
            <p className="text-base font-medium text-gray-400">No messages yet</p>
            <p className="text-sm text-gray-600 mt-1">
              Chat threads appear here when you or co-organizers send messages in a tournament.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map(({ tournament, lastMessage }) => (
              <ThreadCard
                key={tournament.id}
                tournament={tournament}
                lastMessage={lastMessage}
                onClick={() => navigate(`/organizer/tournaments/${tournament.id}/manage`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
