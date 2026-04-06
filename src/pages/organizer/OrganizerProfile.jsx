import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { OrganizerProfile as OrganizerProfileAPI, apiCall } from '@/api/heruClient'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import {
  User, Save, Shield, CheckCircle, Clock, AlertTriangle,
  Loader2, Image, MapPin, Palette, Globe, Gamepad2, X, Plus,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SOCIAL_PLATFORMS = [
  { key: 'discord', label: 'Discord', placeholder: 'https://discord.gg/...' },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/...' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
]

const POPULAR_GAMES = [
  'Valorant', 'League of Legends', 'CS2', 'Fortnite', 'Rocket League',
  'PUBG Mobile', 'FIFA', 'Call of Duty', 'Apex Legends', 'Overwatch 2',
  'Dota 2', 'Rainbow Six Siege', 'Street Fighter 6', 'Tekken 8',
]

function VerificationBadge({ status }) {
  if (status === true || status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 border border-green-500/40 px-3 py-1 text-sm font-medium text-green-400">
        <CheckCircle className="w-4 h-4" />
        Verified Organizer
      </span>
    )
  }

  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 px-3 py-1 text-sm font-medium text-yellow-400">
        <Clock className="w-4 h-4" />
        Verification Pending
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-600/30 border border-gray-500/40 px-3 py-1 text-sm font-medium text-gray-400">
      <Shield className="w-4 h-4" />
      Unverified
    </span>
  )
}

function SectionHeading({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-red-400" />
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

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function OrganizerProfilePage() {
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // ---- Form state ----
  const [brandName, setBrandName] = useState('')
  const [brandLogo, setBrandLogo] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#ff1a1a')
  const [secondaryColor, setSecondaryColor] = useState('#0a0a0a')
  const [description, setDescription] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [socialLinks, setSocialLinks] = useState({ discord: '', twitter: '', instagram: '', youtube: '' })
  const [featuredGames, setFeaturedGames] = useState([])
  const [gameInput, setGameInput] = useState('')

  // ---- Fetch organizer profile ----
  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['organizer-profile-me'],
    queryFn: () => OrganizerProfileAPI.me(),
    enabled: !!user,
    staleTime: 60_000,
  })

  // ---- Populate form when profile loads ----
  useEffect(() => {
    if (!profile) return
    setBrandName(profile.brand_name || '')
    setBrandLogo(profile.brand_logo || '')
    setPrimaryColor(profile.primary_color || '#ff1a1a')
    setSecondaryColor(profile.secondary_color || '#0a0a0a')
    setDescription(profile.description || '')
    setBio(profile.bio || '')
    setLocation(profile.location || '')
    setSocialLinks({
      discord: profile.social_links?.discord || '',
      twitter: profile.social_links?.twitter || '',
      instagram: profile.social_links?.instagram || '',
      youtube: profile.social_links?.youtube || '',
    })
    setFeaturedGames(profile.featured_games || [])
  }, [profile])

  // ---- Save mutation ----
  const saveMutation = useMutation({
    mutationFn: (formData) => OrganizerProfileAPI.updateMe(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-profile-me'] })
      toast({
        title: 'Profile updated',
        description: 'Your organizer profile has been saved successfully.',
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
      brand_name: brandName,
      brand_logo: brandLogo,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      description,
      bio,
      location,
      social_links: socialLinks,
      featured_games: featuredGames,
    })
  }

  // ---- Game chips logic ----
  const addGame = (game) => {
    const trimmed = game.trim()
    if (!trimmed) return
    if (featuredGames.includes(trimmed)) return
    setFeaturedGames((prev) => [...prev, trimmed])
    setGameInput('')
  }

  const removeGame = (game) => {
    setFeaturedGames((prev) => prev.filter((g) => g !== game))
  }

  const handleGameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addGame(gameInput)
    }
  }

  // ---- Derived ----
  const verificationStatus = profile?.is_verified
    ? true
    : profile?.verification_status || false

  // ---- Loading / Error states ----
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-400" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 max-w-md text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-300 text-sm">
            Failed to load profile: {error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => navigate('/organizer/dashboard')}
            className="mt-4 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* ------ Page Header ------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your brand identity and public organizer profile
          </p>
        </div>
        <VerificationBadge status={verificationStatus} />
      </div>

      <form onSubmit={handleSave} className="space-y-10">
        {/* ================================================================= */}
        {/* Brand Identity                                                     */}
        {/* ================================================================= */}
        <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
          <SectionHeading icon={User}>Brand Identity</SectionHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Brand Name */}
            <div>
              <FieldLabel htmlFor="brandName">Brand Name</FieldLabel>
              <Input
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Nexus Esports"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-red-500"
              />
            </div>

            {/* Location */}
            <div>
              <FieldLabel htmlFor="location">Location</FieldLabel>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Cairo, Egypt"
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-red-500"
                />
              </div>
            </div>

            {/* Brand Logo URL */}
            <div className="md:col-span-2">
              <FieldLabel htmlFor="brandLogo">Brand Logo URL</FieldLabel>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="brandLogo"
                    value={brandLogo}
                    onChange={(e) => setBrandLogo(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-red-500"
                  />
                </div>
                {brandLogo && (
                  <img
                    src={brandLogo}
                    alt="Logo preview"
                    className="w-10 h-10 rounded-lg object-cover border border-white/10"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                )}
              </div>
            </div>

            {/* Primary Color */}
            <div>
              <FieldLabel htmlFor="primaryColor">Primary Color</FieldLabel>
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type="color"
                  id="primaryColor"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 bg-white/5 border-white/10 text-white font-mono text-sm focus-visible:ring-red-500"
                  maxLength={7}
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div>
              <FieldLabel htmlFor="secondaryColor">Secondary Color</FieldLabel>
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type="color"
                  id="secondaryColor"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 bg-white/5 border-white/10 text-white font-mono text-sm focus-visible:ring-red-500"
                  maxLength={7}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* About                                                              */}
        {/* ================================================================= */}
        <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
          <SectionHeading icon={Globe}>About</SectionHeading>

          <div className="space-y-5">
            <div>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell the community about your organization..."
                rows={4}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-red-500"
              />
            </div>

            <div>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short bio for your public profile..."
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-red-500"
              />
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* Featured Games                                                     */}
        {/* ================================================================= */}
        <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
          <SectionHeading icon={Gamepad2}>Featured Games</SectionHeading>

          {/* Current chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {featuredGames.map((game) => (
              <span
                key={game}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-600/20 border border-red-500/30 px-3 py-1 text-sm text-red-300"
              >
                {game}
                <button
                  type="button"
                  onClick={() => removeGame(game)}
                  className="hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {featuredGames.length === 0 && (
              <span className="text-sm text-gray-500">No games added yet</span>
            )}
          </div>

          {/* Add game input */}
          <div className="flex items-center gap-2 mb-4">
            <Input
              value={gameInput}
              onChange={(e) => setGameInput(e.target.value)}
              onKeyDown={handleGameKeyDown}
              placeholder="Type a game name and press Enter"
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-red-500"
            />
            <button
              type="button"
              onClick={() => addGame(gameInput)}
              className="inline-flex items-center gap-1 rounded-lg bg-red-600/20 border border-red-500/30 px-3 py-2 text-sm text-red-300 hover:bg-red-600/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Quick-add suggestions */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Popular games:</p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_GAMES.filter((g) => !featuredGames.includes(g)).slice(0, 8).map((game) => (
                <button
                  type="button"
                  key={game}
                  onClick={() => addGame(game)}
                  className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-gray-400 hover:bg-white/10 hover:text-gray-200 transition-colors"
                >
                  + {game}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* Social Links                                                       */}
        {/* ================================================================= */}
        <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
          <SectionHeading icon={Globe}>Social Links</SectionHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <FieldLabel htmlFor={`social-${key}`}>{label}</FieldLabel>
                <Input
                  id={`social-${key}`}
                  value={socialLinks[key] || ''}
                  onChange={(e) =>
                    setSocialLinks((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  placeholder={placeholder}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-red-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* Verification                                                       */}
        {/* ================================================================= */}
        <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
          <SectionHeading icon={Shield}>Verification</SectionHeading>

          <div className="flex items-start gap-4">
            <div className="flex-1">
              {verificationStatus === true || verificationStatus === 'verified' ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Verified Organizer</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Your organizer profile is verified. You have full access to all platform features
                      including the Sponsorship Radar.
                    </p>
                  </div>
                </div>
              ) : verificationStatus === 'pending' ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Verification Pending</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Your verification request is being reviewed by the HERU staff team.
                      You will be notified once a decision has been made.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-600/20 shrink-0">
                    <Shield className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Not Yet Verified</p>
                    <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">
                      Complete 3 solo tournaments and share on social media to get verified.
                      Then reach out to staff via the support chat or contact us at{' '}
                      <span className="text-red-400">support@heru.gg</span>.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-2 h-2 rounded-full bg-gray-600" />
                      <span>
                        Tournaments completed: {profile?.total_tournaments_organized || 0} / 3
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* Save Button                                                        */}
        {/* ================================================================= */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate('/organizer/dashboard')}
            className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-600 px-6 py-2.5 text-sm font-medium text-white hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
