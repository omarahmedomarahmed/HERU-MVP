import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiCall } from '@/api/heruClient'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import {
  BarChart3, Save, Eye, EyeOff, Image, Link2, Plus, X,
  Loader2, AlertTriangle, ArrowLeft, Trophy, Users, Monitor,
  Hash, TrendingUp, Clock, Camera, Share2, ChevronDown,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SCREENSHOT_CATEGORIES = [
  'Facebook Analytics',
  'Twitch Stats',
  'Discord Engagement',
  'Social Media Posts',
  'Other',
]

const SOCIAL_POST_PLATFORMS = [
  'Facebook',
  'Twitter',
  'Instagram',
  'TikTok',
  'YouTube',
]

const formatEGP = (n) => 'EGP ' + (n || 0).toLocaleString()

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeading({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-violet-400" />
      <h2 className="text-lg font-semibold text-white">{children}</h2>
    </div>
  )
}

function FieldLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-300 mb-1.5">
      {children}
    </label>
  )
}

function KpiField({ label, htmlFor, icon: Icon, value, onChange, placeholder, type = 'number' }) {
  return (
    <div>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          id={htmlFor}
          type={type}
          min={type === 'number' ? 0 : undefined}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-violet-500"
        />
      </div>
    </div>
  )
}

function ScreenshotEntry({ item, index, onUpdate, onRemove }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">Screenshot #{index + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <FieldLabel htmlFor={`ss-cat-${index}`}>Category</FieldLabel>
        <div className="relative">
          <select
            id={`ss-cat-${index}`}
            value={item.category || ''}
            onChange={(e) => onUpdate(index, 'category', e.target.value)}
            className="w-full rounded-md bg-white/5 border border-white/10 text-white text-sm px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="" className="bg-[#1a1a2e]">Select category...</option>
            {SCREENSHOT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[#1a1a2e]">{cat}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div>
        <FieldLabel htmlFor={`ss-url-${index}`}>Screenshot URL</FieldLabel>
        <div className="relative">
          <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            id={`ss-url-${index}`}
            value={item.url || ''}
            onChange={(e) => onUpdate(index, 'url', e.target.value)}
            placeholder="https://example.com/screenshot.png"
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-violet-500"
          />
        </div>
      </div>

      <div>
        <FieldLabel htmlFor={`ss-cap-${index}`}>Caption</FieldLabel>
        <Input
          id={`ss-cap-${index}`}
          value={item.caption || ''}
          onChange={(e) => onUpdate(index, 'caption', e.target.value)}
          placeholder="Brief description of this screenshot"
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-violet-500"
        />
      </div>

      {item.url && (
        <div className="pt-1">
          <img
            src={item.url}
            alt={item.caption || 'Screenshot preview'}
            className="max-h-32 rounded-lg border border-white/10 object-contain"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>
      )}
    </div>
  )
}

function SocialPostEntry({ item, index, onUpdate, onRemove }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">Post #{index + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <FieldLabel htmlFor={`sp-plat-${index}`}>Platform</FieldLabel>
        <div className="relative">
          <select
            id={`sp-plat-${index}`}
            value={item.platform || ''}
            onChange={(e) => onUpdate(index, 'platform', e.target.value)}
            className="w-full rounded-md bg-white/5 border border-white/10 text-white text-sm px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="" className="bg-[#1a1a2e]">Select platform...</option>
            {SOCIAL_POST_PLATFORMS.map((p) => (
              <option key={p} value={p} className="bg-[#1a1a2e]">{p}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div>
        <FieldLabel htmlFor={`sp-url-${index}`}>Post URL</FieldLabel>
        <div className="relative">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            id={`sp-url-${index}`}
            value={item.url || ''}
            onChange={(e) => onUpdate(index, 'url', e.target.value)}
            placeholder="https://twitter.com/..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-violet-500"
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function TournamentReport() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // ---- Form state ----
  const [summary, setSummary] = useState('')
  const [highlights, setHighlights] = useState('')
  const [totalViewers, setTotalViewers] = useState('')
  const [peakViewers, setPeakViewers] = useState('')
  const [socialReach, setSocialReach] = useState('')
  const [discordMembers, setDiscordMembers] = useState('')
  const [platformSignups, setPlatformSignups] = useState('')
  const [streamHours, setStreamHours] = useState('')
  const [screenshots, setScreenshots] = useState([])
  const [socialPosts, setSocialPosts] = useState([])
  const [isPublic, setIsPublic] = useState(false)
  const [existingReportId, setExistingReportId] = useState(null)

  // ---- Fetch tournament ----
  const {
    data: tournament,
    isLoading: tournamentLoading,
    isError: tournamentError,
    error: tournamentErr,
  } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => apiCall(`/tournaments/${id}`),
    enabled: !!id,
    staleTime: 60_000,
  })

  // ---- Fetch existing report ----
  const {
    data: reportData,
    isLoading: reportLoading,
  } = useQuery({
    queryKey: ['tournament-report', id],
    queryFn: () => apiCall(`/tournament-reports?tournament_id=${id}`),
    enabled: !!id,
    staleTime: 60_000,
  })

  // ---- Populate form when report loads ----
  useEffect(() => {
    const report = Array.isArray(reportData) ? reportData[0] : reportData?.data?.[0] || reportData
    if (!report || !report.id) return
    setExistingReportId(report.id)
    setSummary(report.summary || '')
    setHighlights(report.highlights || '')
    setTotalViewers(report.total_viewers ?? '')
    setPeakViewers(report.peak_viewers ?? '')
    setSocialReach(report.social_media_reach ?? '')
    setDiscordMembers(report.discord_members ?? '')
    setPlatformSignups(report.platform_signups ?? '')
    setStreamHours(report.stream_hours ?? '')
    setScreenshots(report.screenshots || [])
    setSocialPosts(report.social_posts || [])
    setIsPublic(report.is_public || false)
  }, [reportData])

  // ---- Save mutation ----
  const saveMutation = useMutation({
    mutationFn: (payload) => {
      if (existingReportId) {
        return apiCall(`/tournament-reports/${existingReportId}`, {
          method: 'PUT',
          body: payload,
        })
      }
      return apiCall('/tournament-reports', {
        method: 'POST',
        body: payload,
      })
    },
    onSuccess: (data) => {
      if (!existingReportId && data?.id) {
        setExistingReportId(data.id)
      }
      queryClient.invalidateQueries({ queryKey: ['tournament-report', id] })
      toast({
        title: existingReportId ? 'Report updated' : 'Report created',
        description: 'Your tournament report has been saved successfully.',
      })
    },
    onError: (err) => {
      toast({
        title: 'Save failed',
        description: err.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const handleSave = (e) => {
    e.preventDefault()
    saveMutation.mutate({
      tournament_id: id,
      tournament_name: tournament?.name || '',
      summary,
      highlights,
      total_viewers: totalViewers ? Number(totalViewers) : null,
      peak_viewers: peakViewers ? Number(peakViewers) : null,
      social_media_reach: socialReach ? Number(socialReach) : null,
      discord_members: discordMembers ? Number(discordMembers) : null,
      platform_signups: platformSignups ? Number(platformSignups) : null,
      stream_hours: streamHours ? Number(streamHours) : null,
      screenshots,
      social_posts: socialPosts,
      is_public: isPublic,
    })
  }

  // ---- Screenshot helpers ----
  const addScreenshot = () => {
    setScreenshots((prev) => [...prev, { category: '', url: '', caption: '' }])
  }

  const updateScreenshot = (index, field, value) => {
    setScreenshots((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const removeScreenshot = (index) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index))
  }

  // ---- Social post helpers ----
  const addSocialPost = () => {
    setSocialPosts((prev) => [...prev, { platform: '', url: '' }])
  }

  const updateSocialPost = (index, field, value) => {
    setSocialPosts((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const removeSocialPost = (index) => {
    setSocialPosts((prev) => prev.filter((_, i) => i !== index))
  }

  // ---- Loading / Error ----
  const isLoading = tournamentLoading || reportLoading

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    )
  }

  if (tournamentError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 max-w-md text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-300 text-sm">
            Failed to load tournament: {tournamentErr?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => navigate('/organizer/tournaments')}
            className="mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Back to Tournaments
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* ------ Back link ------ */}
      <button
        onClick={() => navigate(`/organizer/tournaments/${id}/manage`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-violet-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tournament
      </button>

      {/* ------ Page Header ------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {existingReportId ? 'Edit Report' : 'Create Report'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Post-tournament KPI report for{' '}
            <span className="text-violet-400">{tournament?.name || 'Unknown Tournament'}</span>
          </p>
        </div>
        {tournament && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Trophy className="w-4 h-4 text-violet-400" />
            <span>{tournament.game || 'No game'}</span>
            <span className="text-gray-600">|</span>
            <span>{formatEGP(tournament.total_cost)}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* ================================================================= */}
        {/* Summary and Highlights                                             */}
        {/* ================================================================= */}
        <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
          <SectionHeading icon={BarChart3}>Summary</SectionHeading>

          <div className="space-y-5">
            <div>
              <FieldLabel htmlFor="summary">Tournament Summary</FieldLabel>
              <Textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Overall summary of the tournament: how it went, key outcomes, audience reception..."
                rows={4}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-violet-500"
              />
            </div>

            <div>
              <FieldLabel htmlFor="highlights">Highlights</FieldLabel>
              <Textarea
                id="highlights"
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder="Key highlights: standout matches, memorable moments, player achievements..."
                rows={4}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-violet-500"
              />
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* KPI Metrics                                                        */}
        {/* ================================================================= */}
        <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
          <SectionHeading icon={TrendingUp}>Performance Metrics</SectionHeading>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiField
              label="Total Viewers"
              htmlFor="totalViewers"
              icon={Users}
              value={totalViewers}
              onChange={(e) => setTotalViewers(e.target.value)}
              placeholder="0"
            />
            <KpiField
              label="Peak Viewers"
              htmlFor="peakViewers"
              icon={TrendingUp}
              value={peakViewers}
              onChange={(e) => setPeakViewers(e.target.value)}
              placeholder="0"
            />
            <KpiField
              label="Social Media Reach"
              htmlFor="socialReach"
              icon={Share2}
              value={socialReach}
              onChange={(e) => setSocialReach(e.target.value)}
              placeholder="0"
            />
            <KpiField
              label="Discord Members"
              htmlFor="discordMembers"
              icon={Hash}
              value={discordMembers}
              onChange={(e) => setDiscordMembers(e.target.value)}
              placeholder="0"
            />
            <KpiField
              label="HERU Platform Signups"
              htmlFor="platformSignups"
              icon={Users}
              value={platformSignups}
              onChange={(e) => setPlatformSignups(e.target.value)}
              placeholder="0"
            />
            <KpiField
              label="Stream Hours"
              htmlFor="streamHours"
              icon={Monitor}
              value={streamHours}
              onChange={(e) => setStreamHours(e.target.value)}
              placeholder="0"
            />
          </div>
        </section>

        {/* ================================================================= */}
        {/* Screenshots                                                        */}
        {/* ================================================================= */}
        <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
          <SectionHeading icon={Camera}>Screenshots</SectionHeading>
          <p className="text-sm text-gray-500 mb-4">
            Upload analytics screenshots to back up your KPI numbers.
          </p>

          <div className="space-y-4">
            {screenshots.map((item, index) => (
              <ScreenshotEntry
                key={index}
                item={item}
                index={index}
                onUpdate={updateScreenshot}
                onRemove={removeScreenshot}
              />
            ))}

            {screenshots.length === 0 && (
              <div className="text-center py-6 text-gray-500 text-sm">
                No screenshots added yet. Click below to add one.
              </div>
            )}

            <button
              type="button"
              onClick={addScreenshot}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-violet-500/30 bg-violet-600/10 px-4 py-2.5 text-sm text-violet-300 hover:bg-violet-600/20 transition-colors w-full justify-center"
            >
              <Plus className="w-4 h-4" />
              Add Screenshot
            </button>
          </div>
        </section>

        {/* ================================================================= */}
        {/* Social Posts                                                        */}
        {/* ================================================================= */}
        <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
          <SectionHeading icon={Share2}>Social Media Posts</SectionHeading>
          <p className="text-sm text-gray-500 mb-4">
            Link to social media posts related to this tournament.
          </p>

          <div className="space-y-4">
            {socialPosts.map((item, index) => (
              <SocialPostEntry
                key={index}
                item={item}
                index={index}
                onUpdate={updateSocialPost}
                onRemove={removeSocialPost}
              />
            ))}

            {socialPosts.length === 0 && (
              <div className="text-center py-6 text-gray-500 text-sm">
                No social posts added yet. Click below to add one.
              </div>
            )}

            <button
              type="button"
              onClick={addSocialPost}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-red-500/30 bg-red-600/10 px-4 py-2.5 text-sm text-red-300 hover:bg-red-600/20 transition-colors w-full justify-center"
            >
              <Plus className="w-4 h-4" />
              Add Social Post
            </button>
          </div>
        </section>

        {/* ================================================================= */}
        {/* Publish Toggle                                                     */}
        {/* ================================================================= */}
        <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Eye className="w-5 h-5 text-green-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <p className="text-white font-medium">Public Report</p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {isPublic
                    ? 'This report is visible on your public organizer profile.'
                    : 'This report is private. Only you and staff can see it.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#0f0f1a] ${
                isPublic ? 'bg-violet-600' : 'bg-gray-600'
              }`}
              role="switch"
              aria-checked={isPublic}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ${
                  isPublic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* ================================================================= */}
        {/* Actions                                                            */}
        {/* ================================================================= */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate(`/organizer/tournaments/${id}/manage`)}
            className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-red-600 px-6 py-2.5 text-sm font-medium text-white hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveMutation.isPending ? 'Saving...' : existingReportId ? 'Update Report' : 'Create Report'}
          </button>
        </div>
      </form>
    </div>
  )
}
