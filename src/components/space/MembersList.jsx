import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import { Users, User, Crown } from 'lucide-react';
import { GamerProfile } from '@/api/heruClient'


export default function MembersList({ space, userId }) {
  const { data: memberProfiles = [] } = useQuery({
    queryKey: ['space-members', space?.id, space?.members],
    queryFn: async () => {
      if (!space?.members?.length) return [];
      const profiles = await GamerProfile.list();
      return profiles.filter(p => space.members.includes(p.user_id));
    },
    enabled: !!space?.members?.length,
  });

  const admins = space?.admins || [space?.creator_id];

  return (
    <FloatingPanel className="p-6">
      <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <Users className="w-5 h-5 text-red-500" />
        Members ({space?.members?.length || 0})
      </h2>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {memberProfiles.map((member) => {
          const isAdmin = admins.includes(member.user_id);
          const isCreator = member.user_id === space?.creator_id;
          
          return (
            <Link key={member.id} to={`/gamer/${member.user_id}`}>
              <div className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
                  {member.avatar ? (
                    <img src={member.avatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium truncate">{member.username}</p>
                    {isCreator && (
                      <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" title="Creator" />
                    )}
                    {isAdmin && !isCreator && (
                      <Crown className="w-3 h-3 text-red-400 flex-shrink-0" title="Admin" />
                    )}
                  </div>
                  {member.games?.[0] && (
                    <p className="text-gray-500 text-xs truncate">{member.games[0].game_name}</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
        {memberProfiles.length === 0 && space?.members?.length > 0 && (
          <div className="space-y-2">
            {space.members.slice(0, 10).map((memberId) => (
              <Link key={memberId} to={`/gamer/${memberId}`}>
                <div className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-gray-300 text-sm truncate">{memberId.slice(0, 12)}...</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </FloatingPanel>
  );
}