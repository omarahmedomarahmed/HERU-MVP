import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiCall, Tournament } from '@/api/heruClient'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { uploadFile } from '@/lib/uploadFile'
import {
  Save, ArrowLeft, Trophy, Users, Monitor, Hash, TrendingUp,
  Camera, Share2, Plus, X, Upload, Eye, EyeOff, BarChart3,
  Video, Image, Loader2, Check, Star, Globe,
} from 'lucide-react'

const SOCIAL_PLATFORMS = ['Facebook', 'Instagram', 'Twitter/X', 'TikTok', 'YouTube', 'Twitch', 'LinkedIn']

function SectionCard({ icon: Icon, title, color = 'violet', children }) {
  const colors = {
    violet: 'border-violet-500/30 bg-violet-900/10',
    green: 'border-green-500/30 bg-green-900/10',
    blue: 'border-blue-500/30 bg-blue-900/10',
    yellow: 'border-yellow-500/30 bg-yellow-900/10',
    red: 'border-red-500/30 bg-red-900/10',
    cyan: 'border-cyan-500/30 bg-cyan-900/10',
  }
  const iconColors = { violet: 'text-violet-400', green: 'text-green-400', blue: 'text-blue-400', yellow: 'text-yellow-400', red: 'text-red-400', cyan: 'text-cyan-400' }
  return (
    <div className={`rounded-xl border p-6 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-5">
        <Icon className={`w-5 h-5 ${iconColors[color]}`} />
        <h2 className="text-white font-bold text-lg">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function ImageUploadField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false)
  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { file_url } = await uploadFile(file)
      onChange(file_url)
    } catch (err) { console.error(err) }
    finally { setUploading(false) }
  }
  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <div className="flex items-center gap-3">
        <label className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg cursor-pointer border transition-colors ${value ? 'border-green-500/40 bg-green-500/10 text-green-400' : 'border-zinc-700 bg-zinc-800 text-gray-400 hover:bg-zinc-700'}`}>
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          {uploading ? 'Uploading...' : value ? 'Replace Image' : 'Upload Proof Image'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
        <Input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="or paste image URL" className="bg-zinc-800 border-zinc-700 text-white text-xs flex-1" />
      </div>
      {value && <img src={value} alt="" className="mt-2 max-h-40 rounded-lg border border-white/10 object-cover" onError={e => e.target.style.display='none'} />}
    </div>
  )
}

export default function TournamentReportBuilder() {
  const { id: tournamentId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [form, setForm] = useState({
    summary: '',
    key_highlights: '',
    is_public: false,
    // Brand Awareness
    total_reach: 0,
    impressions: 0,
    brand_awareness_image: '',
    brand_awareness_notes: '',
    // Engagement
    total_engagement: 0,
    engagement_rate: '',
    engagement_image: '',
    engagement_notes: '',
    // Live Stream
    total_viewers: 0,
    peak_viewers: 0,
    stream_hours: 0,
    stream_image: '',
    stream_link: '',
    // Social Media
    social_posts_count: 0,
    social_media_reach: 0,
    discord_members: 0,
    social_image: '',
    social_links: [],
    // Deliverables
    photos_delivered: 0,
    videos_delivered: 0,
    deliverables_image: '',
    deliverables_notes: '',
    // Platform
    platform_signups: 0,
    platform_image: '',
    // Screenshots
    screenshots: [],
  })

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const { data: tournament } = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => Tournament.get(tournamentId),
    enabled: !!tournamentId,
  })

  // Load existing report
  const { data: existingReport } = useQuery({
    queryKey: ['report', tournamentId],
    queryFn: () => apiCall(`/tournament-reports?tournament_id=${tournamentId}`).then(r => r?.[0]),
    enabled: !!tournamentId,
  })

  useEffect(() => {
    if (existingReport) {
      setForm(prev => ({ ...prev, ...existingReport }))
    }
  }, [existingReport])

  const saveMutation = useMutation({
    mutationFn: () => {
      const data = { ...form, tournament_id: tournamentId, tournament_name: tournament?.name }
      if (existingReport?.id) return apiCall(`/tournament-reports/${existingReport.id}`, { method: 'PUT', body: data })
      return apiCall('/tournament-reports', { method: 'POST', body: data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['report', tournamentId])
      toast({ title: 'Report saved!', description: 'Your brand impact report has been saved.', duration: 5000 })
    },
    onError: (err) => {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive', duration: 5000 })
    }
  })

  const addSocialLink = () => set('social_links', [...(form.social_links || []), { platform: 'Facebook', url: '', description: '' }])
  const updateSocialLink = (i, field, val) => {
    const links = [...(form.social_links || [])]
    links[i] = { ...links[i], [field]: val }
    set('social_links', links)
  }
  const removeSocialLink = (i) => set('social_links', (form.social_links || []).filter((_, j) => j !== i))

  const addScreenshot = () => set('screenshots', [...(form.screenshots || []), { category: 'Social Media Posts', url: '', caption: '' }])
  const updateScreenshot = (i, field, val) => {
    const ss = [...(form.screenshots || [])]
    ss[i] = { ...ss[i], [field]: val }
    set('screenshots', ss)
  }
  const removeScreenshot = (i) => set('screenshots', (form.screenshots || []).filter((_, j) => j !== i))

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white">Brand Impact Report</h1>
            <p className="text-gray-400 text-sm">{tournament?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => set('is_public', !form.is_public)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.is_public ? 'border-green-500/40 bg-green-500/10 text-green-400' : 'border-zinc-700 bg-zinc-800 text-gray-400'}`}
          >
            {form.is_public ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {form.is_public ? 'Public' : 'Private'}
          </button>
          <button
            onClick={() => navigate(`/organizer/tournaments/${tournamentId}/report`)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-700 bg-zinc-800 text-gray-300 hover:bg-zinc-700 transition-colors"
          >
            <Eye className="w-3 h-3" /> Preview
          </button>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-bold transition-colors"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Report
          </button>
        </div>
      </div>

      {/* Executive Summary */}
      <SectionCard icon={Star} title="Executive Summary" color="violet">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1.5">Tournament Overview</label>
            <Textarea value={form.summary} onChange={e => set('summary', e.target.value)} placeholder="Write a high-level summary of how the tournament went, key achievements, audience growth..." className="bg-zinc-800 border-zinc-700 text-white" rows={4} />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1.5">Key Highlights</label>
            <Textarea value={form.key_highlights} onChange={e => set('key_highlights', e.target.value)} placeholder="e.g. Highest viewership to date, trending on Twitter, 3x brand mentions vs last tournament..." className="bg-zinc-800 border-zinc-700 text-white" rows={3} />
          </div>
        </div>
      </SectionCard>

      {/* Brand Awareness */}
      <SectionCard icon={TrendingUp} title="Brand Awareness & Reach" color="blue">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Total Social Media Reach</label>
            <Input type="number" value={form.total_reach || ''} onChange={e => set('total_reach', +e.target.value)} placeholder="0" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Total Impressions</label>
            <Input type="number" value={form.impressions || ''} onChange={e => set('impressions', +e.target.value)} placeholder="0" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
        </div>
        <div className="mb-4">
          <label className="text-xs text-gray-400 block mb-1.5">Notes</label>
          <Input value={form.brand_awareness_notes} onChange={e => set('brand_awareness_notes', e.target.value)} placeholder="Key notes about brand awareness results" className="bg-zinc-800 border-zinc-700 text-white" />
        </div>
        <ImageUploadField label="Proof Image (analytics screenshot)" value={form.brand_awareness_image} onChange={v => set('brand_awareness_image', v)} />
      </SectionCard>

      {/* Engagement */}
      <SectionCard icon={BarChart3} title="Audience Engagement" color="green">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Total Engagements (likes/comments/shares)</label>
            <Input type="number" value={form.total_engagement || ''} onChange={e => set('total_engagement', +e.target.value)} placeholder="0" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Engagement Rate</label>
            <Input value={form.engagement_rate} onChange={e => set('engagement_rate', e.target.value)} placeholder="e.g. 8.5%" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
        </div>
        <div className="mb-4">
          <label className="text-xs text-gray-400 block mb-1.5">Notes</label>
          <Input value={form.engagement_notes} onChange={e => set('engagement_notes', e.target.value)} placeholder="Engagement highlights" className="bg-zinc-800 border-zinc-700 text-white" />
        </div>
        <ImageUploadField label="Proof Image" value={form.engagement_image} onChange={v => set('engagement_image', v)} />
      </SectionCard>

      {/* Live Stream */}
      <SectionCard icon={Monitor} title="Live Stream Performance" color="red">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Total Viewers</label>
            <Input type="number" value={form.total_viewers || ''} onChange={e => set('total_viewers', +e.target.value)} placeholder="0" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Peak Concurrent Viewers</label>
            <Input type="number" value={form.peak_viewers || ''} onChange={e => set('peak_viewers', +e.target.value)} placeholder="0" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Stream Hours</label>
            <Input type="number" value={form.stream_hours || ''} onChange={e => set('stream_hours', +e.target.value)} placeholder="0" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
        </div>
        <div className="mb-4">
          <label className="text-xs text-gray-400 block mb-1.5">Stream VOD / Archive Link</label>
          <Input value={form.stream_link} onChange={e => set('stream_link', e.target.value)} placeholder="https://twitch.tv/..." className="bg-zinc-800 border-zinc-700 text-white" />
        </div>
        <ImageUploadField label="Proof Image (stream analytics)" value={form.stream_image} onChange={v => set('stream_image', v)} />
      </SectionCard>

      {/* Social Media */}
      <SectionCard icon={Share2} title="Social Media Performance" color="cyan">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Total Posts Published</label>
            <Input type="number" value={form.social_posts_count || ''} onChange={e => set('social_posts_count', +e.target.value)} placeholder="0" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Social Media Reach</label>
            <Input type="number" value={form.social_media_reach || ''} onChange={e => set('social_media_reach', +e.target.value)} placeholder="0" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Discord Members Gained</label>
            <Input type="number" value={form.discord_members || ''} onChange={e => set('discord_members', +e.target.value)} placeholder="0" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
        </div>
        <ImageUploadField label="Proof Image (social analytics)" value={form.social_image} onChange={v => set('social_image', v)} />

        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs text-gray-400 font-medium">Social Media Content Links</label>
            <button onClick={addSocialLink} className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              <Plus className="w-3 h-3" /> Add Link
            </button>
          </div>
          <div className="space-y-3">
            {(form.social_links || []).map((link, i) => (
              <div key={i} className="grid grid-cols-[120px_1fr_auto] gap-2 items-center">
                <select value={link.platform} onChange={e => updateSocialLink(i, 'platform', e.target.value)} className="bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-2 py-2">
                  {SOCIAL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <Input value={link.url} onChange={e => updateSocialLink(i, 'url', e.target.value)} placeholder="Post URL..." className="bg-zinc-800 border-zinc-700 text-white text-xs" />
                <button onClick={() => removeSocialLink(i)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
              </div>
            ))}
            {(form.social_links || []).length === 0 && <p className="text-gray-600 text-xs">No social media links added yet.</p>}
          </div>
        </div>
      </SectionCard>

      {/* Deliverables */}
      <SectionCard icon={Camera} title="Content Deliverables" color="yellow">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Total Photos Delivered</label>
            <Input type="number" value={form.photos_delivered || ''} onChange={e => set('photos_delivered', +e.target.value)} placeholder="0" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Total Videos Delivered</label>
            <Input type="number" value={form.videos_delivered || ''} onChange={e => set('videos_delivered', +e.target.value)} placeholder="0" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
        </div>
        <div className="mb-4">
          <label className="text-xs text-gray-400 block mb-1.5">Notes</label>
          <Input value={form.deliverables_notes} onChange={e => set('deliverables_notes', e.target.value)} placeholder="Description of content delivered" className="bg-zinc-800 border-zinc-700 text-white" />
        </div>
        <ImageUploadField label="Proof Image (sample deliverable)" value={form.deliverables_image} onChange={v => set('deliverables_image', v)} />
      </SectionCard>

      {/* HERU Platform */}
      <SectionCard icon={Globe} title="HERU Platform Growth" color="violet">
        <div className="mb-4">
          <label className="text-xs text-gray-400 block mb-1.5">New HERU Platform Signups from Tournament</label>
          <Input type="number" value={form.platform_signups || ''} onChange={e => set('platform_signups', +e.target.value)} placeholder="0" className="bg-zinc-800 border-zinc-700 text-white" />
        </div>
        <ImageUploadField label="Proof Image" value={form.platform_image} onChange={v => set('platform_image', v)} />
      </SectionCard>

      {/* Screenshots */}
      <SectionCard icon={Image} title="Supporting Screenshots" color="blue">
        <div className="space-y-4">
          {(form.screenshots || []).map((ss, i) => (
            <div key={i} className="border border-zinc-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">Screenshot #{i + 1}</span>
                <button onClick={() => removeScreenshot(i)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Category</label>
                  <select value={ss.category} onChange={e => updateScreenshot(i, 'category', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-3 py-2">
                    {['Facebook Analytics','Twitch Stats','Discord Engagement','Social Media Posts','Deliverables','Brand Mentions','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Caption</label>
                  <Input value={ss.caption} onChange={e => updateScreenshot(i, 'caption', e.target.value)} placeholder="Brief description" className="bg-zinc-800 border-zinc-700 text-white text-xs" />
                </div>
              </div>
              <ImageUploadField label="Image" value={ss.url} onChange={v => updateScreenshot(i, 'url', v)} />
            </div>
          ))}
          <button onClick={addScreenshot} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            <Plus className="w-4 h-4" /> Add Screenshot
          </button>
        </div>
      </SectionCard>

      {/* Save bar */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 text-white font-bold shadow-lg shadow-violet-900/30 transition"
        >
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Report
        </button>
      </div>
    </div>
  )
}
