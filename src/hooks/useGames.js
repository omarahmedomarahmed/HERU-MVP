import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/api/heruClient';

const FALLBACK_GAMES = [
  'Valorant', 'CS2', 'League of Legends', 'Dota 2', 'Rocket League',
  'Apex Legends', 'Fortnite', 'Call of Duty', 'Rainbow Six Siege',
  'Overwatch 2', 'FIFA / EA FC', 'PUBG', 'Mobile Legends', 'Free Fire',
];

export function useGames() {
  const { data: games = [] } = useQuery({
    queryKey: ['games-list'],
    queryFn: async () => {
      try {
        const data = await apiCall('/games');
        return data.map(g => g.name);
      } catch {
        return FALLBACK_GAMES;
      }
    },
    staleTime: 10 * 60 * 1000, // cache for 10 minutes
  });

  return games.length > 0 ? games : FALLBACK_GAMES;
}
