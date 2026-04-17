const RIOT_API_KEY = process.env.RIOT_API_KEY;
const USE_STUB = process.env.RIOT_USE_STUB === 'true';

if (!RIOT_API_KEY) console.warn('[riot] RIOT_API_KEY not set — Riot features disabled');

export const PLATFORM_TO_REGION = {
  br1: 'americas', lan: 'americas', las: 'americas', na1: 'americas',
  eun1: 'europe', euw1: 'europe', me1: 'europe', tr1: 'europe', ru: 'europe',
  jp1: 'asia', kr: 'asia',
  oc1: 'sea', sg2: 'sea', tw2: 'sea', vn2: 'sea', ph2: 'sea',
};

// Valorant platform slugs → routing values
export const VAL_PLATFORM_TO_ROUTING = {
  AP: 'ap', BR: 'br', EU: 'eu', KR: 'kr', LATAM: 'latam', NA: 'na',
  ap: 'ap', br: 'br', eu: 'eu', kr: 'kr', latam: 'latam', na: 'na',
};

function platformHost(platform) {
  return `https://${platform}.api.riotgames.com`;
}
function regionHost(platform) {
  const region = PLATFORM_TO_REGION[platform?.toLowerCase()] || 'europe';
  return `https://${region}.api.riotgames.com`;
}
function valHost(valPlatform) {
  const routing = VAL_PLATFORM_TO_ROUTING[valPlatform] || 'eu';
  return `https://${routing}.api.riotgames.com`;
}

async function riotFetch(url) {
  if (!RIOT_API_KEY) throw new Error('Riot API key not configured');
  const res = await fetch(url, { headers: { 'X-Riot-Token': RIOT_API_KEY } });
  if (res.status === 404) return null;
  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After') || 1;
    throw new Error(`Riot API rate limited. Retry after ${retryAfter}s`);
  }
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Riot API error ${res.status}: ${err}`);
  }
  return res.json();
}

// ============================================================================
// ACCOUNT-V1
// ============================================================================

export async function lookupByRiotId(gameName, tagLine, platform = 'euw1') {
  const encoded = `${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotFetch(`${regionHost(platform)}/riot/account/v1/accounts/by-riot-id/${encoded}`);
}

export async function getAccountByPuuid(puuid, platform = 'euw1') {
  return riotFetch(`${regionHost(platform)}/riot/account/v1/accounts/by-puuid/${puuid}`);
}

// Get active shard for val/lor/2xko
export async function getActiveShard(puuid, game = 'val', platform = 'euw1') {
  return riotFetch(`${regionHost(platform)}/riot/account/v1/active-shards/by-game/${game}/by-puuid/${puuid}`);
}

// Get active region for lol/tft
export async function getActiveRegion(puuid, game = 'lol', platform = 'euw1') {
  return riotFetch(`${regionHost(platform)}/riot/account/v1/region/by-game/${game}/by-puuid/${puuid}`);
}

// ============================================================================
// SUMMONER-V4 (LoL)
// ============================================================================

export async function getSummonerByPuuid(puuid, platform = 'euw1') {
  return riotFetch(`${platformHost(platform)}/lol/summoner/v4/summoners/by-puuid/${puuid}`);
}

// ============================================================================
// LEAGUE-V4 (LoL ranked)
// ============================================================================

export async function getLolRankedByPuuid(puuid, platform = 'euw1') {
  return riotFetch(`${platformHost(platform)}/lol/league/v4/entries/by-puuid/${puuid}`);
}

export async function getLolChallengerLeague(queue = 'RANKED_SOLO_5x5', platform = 'euw1') {
  return riotFetch(`${platformHost(platform)}/lol/league/v4/challengerleagues/by-queue/${queue}`);
}

export async function getLolGrandmasterLeague(queue = 'RANKED_SOLO_5x5', platform = 'euw1') {
  return riotFetch(`${platformHost(platform)}/lol/league/v4/grandmasterleagues/by-queue/${queue}`);
}

export async function getLolMasterLeague(queue = 'RANKED_SOLO_5x5', platform = 'euw1') {
  return riotFetch(`${platformHost(platform)}/lol/league/v4/masterleagues/by-queue/${queue}`);
}

// ============================================================================
// CHAMPION-MASTERY-V4 (LoL)
// ============================================================================

export async function getTopMasteries(puuid, platform = 'euw1', count = 5) {
  const data = await riotFetch(
    `${platformHost(platform)}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=${count}`
  );
  return data || [];
}

export async function getAllMasteries(puuid, platform = 'euw1') {
  const data = await riotFetch(
    `${platformHost(platform)}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`
  );
  return data || [];
}

export async function getMasteryTotal(puuid, platform = 'euw1') {
  return riotFetch(
    `${platformHost(platform)}/lol/champion-mastery/v4/champion-mastery-scores/by-puuid/${puuid}`
  );
}

// ============================================================================
// CHAMPION-V3 (LoL free rotation)
// ============================================================================

export async function getChampionRotation(platform = 'euw1') {
  return riotFetch(`${platformHost(platform)}/lol/platform/v3/champion-rotations`);
}

// ============================================================================
// MATCH-V5 (LoL match history)
// ============================================================================

export async function getMatchIds(puuid, platform = 'euw1', options = {}) {
  const { count = 20, queue, type, start = 0 } = options;
  const params = new URLSearchParams({ count, start });
  if (queue) params.set('queue', queue);
  if (type) params.set('type', type); // 'tourney' | 'ranked' | 'normal' | 'tutorial'
  return riotFetch(`${regionHost(platform)}/lol/match/v5/matches/by-puuid/${puuid}/ids?${params}`);
}

export async function getTournamentMatchIds(puuid, platform = 'euw1', count = 20) {
  return getMatchIds(puuid, platform, { count, type: 'tourney' });
}

export async function getMatch(matchId, platform = 'euw1') {
  return riotFetch(`${regionHost(platform)}/lol/match/v5/matches/${matchId}`);
}

export async function getMatchTimeline(matchId, platform = 'euw1') {
  return riotFetch(`${regionHost(platform)}/lol/match/v5/matches/${matchId}/timeline`);
}

// ============================================================================
// SPECTATOR-V5 (LoL live game)
// ============================================================================

export async function getSpectatorGame(puuid, platform = 'euw1') {
  return riotFetch(`${platformHost(platform)}/lol/spectator/v5/active-games/by-summoner/${puuid}`);
}

export async function getFeaturedGames(platform = 'euw1') {
  return riotFetch(`${platformHost(platform)}/lol/spectator/v5/featured-games`);
}

// ============================================================================
// LOL-STATUS-V4
// ============================================================================

export async function getLolStatus(platform = 'euw1') {
  return riotFetch(`${platformHost(platform)}/lol/status/v4/platform-data`);
}

// ============================================================================
// TOURNAMENT-V5 / TOURNAMENT-STUB-V5 (tournament API key required)
// ============================================================================

function tournamentBase(platform = 'euw1') {
  const prefix = USE_STUB ? 'tournament-stub' : 'tournament';
  return `${platformHost(platform)}/lol/${prefix}/v5`;
}

export async function registerProvider(callbackUrl, region = 'EUW', platform = 'euw1') {
  if (!RIOT_API_KEY) throw new Error('Riot API key not configured');
  const res = await fetch(`${tournamentBase(platform)}/providers`, {
    method: 'POST',
    headers: { 'X-Riot-Token': RIOT_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: callbackUrl, region }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`registerProvider error ${res.status}: ${err}`);
  }
  return res.json(); // returns providerId (integer)
}

export async function createTournament(providerId, name, platform = 'euw1') {
  if (!RIOT_API_KEY) throw new Error('Riot API key not configured');
  const res = await fetch(`${tournamentBase(platform)}/tournaments`, {
    method: 'POST',
    headers: { 'X-Riot-Token': RIOT_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ providerId, name }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`createTournament error ${res.status}: ${err}`);
  }
  return res.json(); // returns tournamentId (integer)
}

export async function generateTournamentCodes(tournamentId, count, params, platform = 'euw1') {
  if (!RIOT_API_KEY) throw new Error('Riot API key not configured');
  const url = `${tournamentBase(platform)}/codes?count=${count}&tournamentId=${tournamentId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'X-Riot-Token': RIOT_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    // params shape: { mapType, pickType, spectatorType, teamSize, allowedSummonerIds?, metadata? }
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`generateTournamentCodes error ${res.status}: ${err}`);
  }
  return res.json(); // returns array of tournament codes
}

export async function getTournamentCode(code, platform = 'euw1') {
  return riotFetch(`${tournamentBase(platform)}/codes/${code}`);
}

export async function getLobbyEvents(code, platform = 'euw1') {
  return riotFetch(`${tournamentBase(platform)}/lobby-events/by-code/${code}`);
}

export async function getTournamentGames(tournamentId, platform = 'euw1') {
  return riotFetch(`${tournamentBase(platform)}/games/by-tournament/${tournamentId}`);
}

// ============================================================================
// VAL-CONTENT-V1 (Valorant agents, maps, acts)
// ============================================================================

export async function getValContent(valPlatform = 'eu', locale = null) {
  const params = locale ? `?locale=${locale}` : '';
  return riotFetch(`${valHost(valPlatform)}/val/content/v1/contents${params}`);
}

// ============================================================================
// VAL-MATCH-V1 (Valorant match data — production key required for matchlist)
// ============================================================================

export async function getValMatch(matchId, valPlatform = 'eu') {
  return riotFetch(`${valHost(valPlatform)}/val/match/v1/matches/${matchId}`);
}

export async function getValMatchlist(puuid, valPlatform = 'eu') {
  return riotFetch(`${valHost(valPlatform)}/val/match/v1/matchlists/by-puuid/${puuid}`);
}

export async function getValRecentMatches(queue, valPlatform = 'eu') {
  return riotFetch(`${valHost(valPlatform)}/val/match/v1/recent-matches/by-queue/${queue}`);
}

// ============================================================================
// VAL-RANKED-V1 (Valorant leaderboards)
// ============================================================================

export async function getValLeaderboard(actId, valPlatform = 'eu', size = 200, startIndex = 0) {
  return riotFetch(
    `${valHost(valPlatform)}/val/ranked/v1/leaderboards/by-act/${actId}?size=${size}&startIndex=${startIndex}`
  );
}

// ============================================================================
// VAL-STATUS-V1
// ============================================================================

export async function getValStatus(valPlatform = 'eu') {
  return riotFetch(`${valHost(valPlatform)}/val/status/v1/platform-data`);
}

// ============================================================================
// Composite sync functions (used by connect routes)
// ============================================================================

export async function syncLolStats(puuid, platform) {
  const [summoner, ranked, masteries] = await Promise.all([
    getSummonerByPuuid(puuid, platform),
    getLolRankedByPuuid(puuid, platform),
    getTopMasteries(puuid, platform, 5),
  ]);
  const soloEntry = ranked?.find(e => e.queueType === 'RANKED_SOLO_5x5') || null;
  const flexEntry = ranked?.find(e => e.queueType === 'RANKED_FLEX_SR') || null;
  return {
    summoner_id: summoner?.id || null,
    summoner_level: summoner?.summonerLevel || null,
    profile_icon_id: summoner?.profileIconId || null,
    rank_tier: soloEntry?.tier || null,
    rank_division: soloEntry?.rank || null,
    rank_lp: soloEntry?.leaguePoints || 0,
    wins: soloEntry?.wins || 0,
    losses: soloEntry?.losses || 0,
    champion_masteries: masteries,
    raw_rank_data: { solo: soloEntry, flex: flexEntry },
  };
}

export async function syncValorantStats(puuid, platform) {
  // Try to get active shard to determine actual Valorant routing
  let valPlatform = 'eu';
  try {
    const shard = await getActiveShard(puuid, 'val', platform);
    if (shard?.activeShard) valPlatform = shard.activeShard.toLowerCase();
  } catch { /* fallback to eu */ }

  const account = await getAccountByPuuid(puuid, platform).catch(() => null);
  // VAL-MATCH and VAL-RANKED require production API key with RSO
  return {
    summoner_id: null,
    summoner_level: null,
    profile_icon_id: null,
    rank_tier: null,
    rank_division: null,
    rank_lp: 0,
    wins: 0,
    losses: 0,
    active_shard: valPlatform,
    raw_rank_data: { account, note: 'Full Valorant rank/match stats require Production API key' },
  };
}
