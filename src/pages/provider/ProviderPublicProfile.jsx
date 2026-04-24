import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Package, ExternalLink, MessageSquare, Loader2, CheckCircle } from 'lucide-react';

export default function ProviderPublicProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/providers/${id}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>;
  if (!data?.profile) return <div className="text-center py-16 text-gray-500"><p>Provider not found</p></div>;

  const { profile, services = [], reviews = [], past_projects = [] } = data;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 flex items-start gap-5">
        {profile.avatar ? (
          <img src={profile.avatar} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-emerald-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-bold">{(profile.display_name || 'P')[0]}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white">{profile.display_name}</h1>
          <div className="flex items-center gap-3 mt-1">
            {profile.rating > 0 && (
              <span className="flex items-center gap-1 text-yellow-400 text-sm">
                <Star className="w-4 h-4 fill-yellow-400" /> {Number(profile.rating).toFixed(1)}
              </span>
            )}
            <span className="text-gray-500 text-sm">{profile.total_bookings || 0} bookings</span>
            {profile.categories?.map(c => (
              <span key={c} className="bg-white/10 text-gray-300 px-2 py-0.5 rounded text-xs capitalize">{c}</span>
            ))}
          </div>
          {profile.bio && <p className="text-gray-400 text-sm mt-2 leading-relaxed">{profile.bio}</p>}
          <div className="flex items-center gap-3 mt-3">
            {profile.portfolio_url && (
              <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Portfolio
              </a>
            )}
            {Object.entries(profile.social_links || {}).filter(([,v]) => v).map(([k, v]) => (
              <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300 text-xs capitalize transition-colors">{k}</a>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Services */}
          {services.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" /> Services
              </h2>
              <div className="space-y-3">
                {services.map(svc => (
                  <div key={svc.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white text-sm font-medium">{svc.title}</p>
                      <p className="text-gray-500 text-xs capitalize">{svc.category} · {svc.price_type?.replace('_', ' ')}</p>
                    </div>
                    <p className="text-white font-bold text-sm">EGP {Number(svc.price).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" /> Reviews
              </h2>
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString('en-EG', { month: 'short', year: 'numeric' })}</span>
                    </div>
                    {r.comment && <p className="text-gray-300 text-sm">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past projects */}
          {past_projects.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-bold mb-4">Past Projects</h2>
              <div className="space-y-2">
                {past_projects.map(p => (
                  <div key={p.id} className="flex items-start gap-2 p-3 bg-white/5 rounded-lg text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">{p.tournament_name || 'Tournament'}</p>
                      {p.role && <p className="text-gray-400 text-xs">{p.role} · {p.organizer_name}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {profile.is_discord_server && (
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
              <h3 className="text-white font-semibold text-sm mb-2">Discord Server</h3>
              <p className="text-gray-400 text-xs mb-2">{Number(profile.discord_server_member_count || 0).toLocaleString()} members</p>
              {profile.discord_server_invite && (
                <a href={`https://${profile.discord_server_invite.replace('https://', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-indigo-300 hover:text-indigo-200 text-xs transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Join Server
                </a>
              )}
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-white font-semibold text-sm mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Rating</span>
                <span className="text-white">{profile.rating > 0 ? `${Number(profile.rating).toFixed(1)} / 5` : 'No ratings yet'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bookings</span>
                <span className="text-white">{profile.total_bookings || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Reviews</span>
                <span className="text-white">{reviews.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
