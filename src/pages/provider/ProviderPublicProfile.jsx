// reviewed 2026-04-25
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/api/heruClient';
import {
  Star, Package, ExternalLink, Loader2, CheckCircle,
  Briefcase, Play, Image, Globe, Mail, ArrowLeft,
  Users, Award, Clock, DollarSign, ChevronRight,
} from 'lucide-react';

const CATEGORY_COLORS = {
  Production:  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Branding:    'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Talent:      'bg-red-500/20 text-red-300 border-red-500/30',
  Venue:       'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Marketing:   'bg-green-500/20 text-green-300 border-green-500/30',
  Coaching:    'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
};

function StarRow({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-4 h-4 ${s <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} />
      ))}
      <span className="text-white font-bold text-sm ml-1">{Number(value).toFixed(1)}</span>
    </div>
  );
}

function ServiceCard({ service }) {
  const colorClass = CATEGORY_COLORS[service.category] || 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-red-500/30 transition-all">
      {service.portfolio_images?.[0] && (
        <div className="h-40 overflow-hidden">
          <img src={service.portfolio_images[0]} alt={service.title} className="w-full h-full object-cover" />
        </div>
      )}
      {!service.portfolio_images?.[0] && (
        <div className="h-40 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
          <Package className="w-12 h-12 text-zinc-700" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${colorClass}`}>{service.category}</span>
          {service.rating > 0 && (
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-xs font-bold">{Number(service.rating).toFixed(1)}</span>
            </div>
          )}
        </div>
        <h3 className="text-white font-bold mb-1">{service.title}</h3>
        {service.description && (
          <p className="text-gray-400 text-xs mb-3 line-clamp-2">{service.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-white font-black">EGP {(service.price || 0).toLocaleString()}</span>
          {service.deliverables?.length > 0 && (
            <span className="text-gray-500 text-xs">{service.deliverables.length} deliverables</span>
          )}
        </div>
      </div>
    </div>
  );
}

function PortfolioCard({ item }) {
  const [showVideo, setShowVideo] = useState(false);
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden group">
      <div className="relative aspect-video bg-zinc-800">
        {item.video_url && !showVideo ? (
          <div className="w-full h-full flex items-center justify-center cursor-pointer" onClick={() => setShowVideo(true)}>
            {item.thumbnail_url ? (
              <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <Play className="w-10 h-10 text-zinc-600" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
            </div>
          </div>
        ) : item.video_url && showVideo ? (
          <iframe src={item.video_url} className="w-full h-full" allow="autoplay" allowFullScreen title={item.title} />
        ) : item.image_url ? (
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-10 h-10 text-zinc-700" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-white font-bold text-sm">{item.title}</p>
        {item.tournament_name && (
          <p className="text-gray-500 text-xs mt-0.5">@ {item.tournament_name}</p>
        )}
        {item.description && (
          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{item.description}</p>
        )}
      </div>
    </div>
  );
}

export default function ProviderPublicProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('services');

  const { data, isLoading } = useQuery({
    queryKey: ['provider-public', id],
    queryFn: () => apiCall(`/providers/${id}`),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-center">
        <div>
          <p className="text-white font-bold text-xl mb-2">Provider not found</p>
          <Link to="/coaches" className="text-red-400 text-sm hover:underline">Browse Service Providers</Link>
        </div>
      </div>
    );
  }

  const { profile, services = [], reviews = [], portfolio_items = [], past_projects = [] } = data;
  const tabs = [
    { key: 'services', label: 'Services', count: services.length },
    { key: 'portfolio', label: 'Portfolio', count: portfolio_items.length + past_projects.length },
    { key: 'reviews', label: 'Reviews', count: reviews.length },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Hero / Profile Header */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-br from-red-950/50 via-zinc-900 to-zinc-950" />
          <div className="px-6 pb-6 -mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-zinc-800 border-4 border-zinc-900 overflow-hidden flex-shrink-0 shadow-xl">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.display_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-red-700 text-white font-black text-3xl">
                    {(profile.display_name || 'P')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black text-white">{profile.display_name}</h1>
                  {profile.is_approved && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> HERU Verified
                    </span>
                  )}
                  {profile.provider_type && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${CATEGORY_COLORS[profile.provider_type] || 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30'}`}>
                      {profile.provider_type}
                    </span>
                  )}
                </div>
                {profile.rating > 0 && <StarRow value={profile.rating} />}
              </div>
            </div>

            {profile.bio && (
              <p className="text-gray-300 leading-relaxed mb-4 max-w-2xl">{profile.bio}</p>
            )}

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 mb-4">
              {profile.total_bookings > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Briefcase className="w-4 h-4 text-red-400" />
                  <span>{profile.total_bookings} bookings</span>
                </div>
              )}
              {profile.review_count > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>{profile.review_count} reviews</span>
                </div>
              )}
              {services.length > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Package className="w-4 h-4 text-blue-400" />
                  <span>{services.length} services</span>
                </div>
              )}
            </div>

            {/* Category badges */}
            {profile.categories?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.categories.map(cat => (
                  <span key={cat} className={`text-xs px-3 py-1 rounded-full border font-medium capitalize ${CATEGORY_COLORS[cat] || 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30'}`}>
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* Contact links */}
            <div className="flex flex-wrap gap-3">
              {profile.portfolio_url && (
                <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  <Globe className="w-4 h-4" /> Website
                </a>
              )}
              <a href={`mailto:heru@heru.gg?subject=Booking Inquiry — ${profile.display_name}`}
                className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors">
                <Mail className="w-4 h-4" /> Inquire to Book
              </a>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-zinc-900/50 rounded-xl p-1 border border-zinc-800">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === tab.key ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {tab.label} {tab.count > 0 && <span className="opacity-70">({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            {services.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
                <p>No services listed yet</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map(s => <ServiceCard key={s.id} service={s} />)}
              </div>
            )}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-8">
            {/* Portfolio items (videos/images) */}
            {portfolio_items.length > 0 && (
              <div>
                <h2 className="text-white font-black text-lg mb-4">Work Samples</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolio_items.map(item => <PortfolioCard key={item.id} item={item} />)}
                </div>
              </div>
            )}

            {/* Past tournaments / projects */}
            {past_projects.length > 0 && (
              <div>
                <h2 className="text-white font-black text-lg mb-4">Past Events</h2>
                <div className="space-y-3">
                  {past_projects.map(proj => (
                    <div key={proj.id} className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 flex items-center gap-4">
                      {proj.image_url && (
                        <img src={proj.image_url} alt={proj.event_name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold">{proj.event_name}</p>
                        {proj.organizer_name && <p className="text-gray-400 text-sm">by {proj.organizer_name}</p>}
                        {proj.role && <p className="text-red-400 text-sm font-medium capitalize">{proj.role}</p>}
                        {proj.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{proj.description}</p>}
                      </div>
                      {proj.date && (
                        <span className="text-gray-600 text-xs flex-shrink-0">{new Date(proj.date).toLocaleDateString()}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {portfolio_items.length === 0 && past_projects.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <Image className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
                <p>No portfolio items yet</p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            {reviews.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
                <p>No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev, i) => (
                  <div key={rev.id || i} className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-white font-bold">{rev.reviewer_name || 'Organizer'}</p>
                        {rev.event_name && <p className="text-gray-500 text-sm">{rev.event_name}</p>}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`} />
                        ))}
                      </div>
                    </div>
                    {rev.comment && <p className="text-gray-300 text-sm leading-relaxed">{rev.comment}</p>}
                    {rev.created_at && (
                      <p className="text-gray-600 text-xs mt-2">{new Date(rev.created_at).toLocaleDateString()}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
