import React from 'react';
import { Link } from 'react-router-dom';
import GlowButton from '@/components/ui/GlowButton';
import FloatingPanel from '@/components/ui/FloatingPanel';
import { Settings, Eye, Building2 } from 'lucide-react';

export default function OrganizerProfileTab({ session, profile }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-black text-white">MY <span className="text-red-500">PROFILE</span></h1>

      <div className="flex gap-4 flex-wrap">
        <Link to={'/organizer-settings'}>
          <GlowButton><Settings className="w-4 h-4" /> Edit Settings</GlowButton>
        </Link>
        {profile?.id && (
          <Link to={`/organizer/${profile.id}`}>
            <GlowButton variant="ghost"><Eye className="w-4 h-4" /> View Public Profile</GlowButton>
          </Link>
        )}
      </div>

      {profile && (
        <FloatingPanel className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-xl bg-zinc-800 overflow-hidden flex items-center justify-center">
              {profile.brand_logo ? (
                <img src={profile.brand_logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-10 h-10 text-red-500" />
              )}
            </div>
            <div>
              <p className="text-white font-bold text-2xl">{profile.brand_name}</p>
              <p className="text-gray-400">{session?.email}</p>
              {profile.is_verified && (
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded inline-block mt-2">Verified</span>
              )}
            </div>
          </div>

          {profile.bio && (
            <div className="mb-4 pb-4 border-b border-zinc-800">
              <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          <div className="space-y-3 text-sm">
            {profile.location && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Location</p>
                <p className="text-white font-medium">{profile.location}</p>
              </div>
            )}

            {profile.total_tournaments_organized !== undefined && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Tournaments Organized</p>
                <p className="text-white font-medium">{profile.total_tournaments_organized}</p>
              </div>
            )}

            {profile.rating !== undefined && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Rating</p>
                <p className="text-white font-medium">★ {profile.rating || 'New'}</p>
              </div>
            )}
          </div>

          {profile.social_links && (
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Social</p>
              <div className="flex gap-3">
                {profile.social_links.twitter && (
                  <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 text-sm">
                    Twitter
                  </a>
                )}
                {profile.social_links.instagram && (
                  <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 text-sm">
                    Instagram
                  </a>
                )}
                {profile.social_links.website && (
                  <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 text-sm">
                    Website
                  </a>
                )}
              </div>
            </div>
          )}
        </FloatingPanel>
      )}
    </div>
  );
}