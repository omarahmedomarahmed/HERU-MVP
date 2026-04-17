const RIOT_API_KEY = process.env.RIOT_API_KEY;

if (!RIOT_API_KEY) console.warn('[riot] RIOT_API_KEY not set — Riot features disabled');

const PLATFORM_TO_REGION = {
  br1: 'americas', lan: 'americas', las: 'americas', na1: 'americas',
  eun1: 'europe', euw1: 'europe', me1: 'europe', tr1: 'europe', ru: 'europe',
  jp1: 'asia', kr: 'asia',
  oc1: 'sea', sg2: 'sea', tw2: 'sea', vn2: 'sea', ph2: 'sea',
};

function platformHost(platform) {
  return `https://${platform}.api.riotgames.com`;
}
function regionHost(platform) {
  const region = PLATFORM_TO_REGION[platform] || 'europe';
  return `https://${region}.api.riotgames.com`;
}

async function riotFetch(url) {
  if (!RIOT_API_KEY) throw new Error('Riot API key not configured');
  const res = await fetch(url, { headers: { 'X-Riot-Token': RIOT_API_KEY } });
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Riot API error ${res.status}: ${err}`);
  }
  return res.json();
}

export async function lookupByRiotId(gameName, tagLine, platform = 'euw1') {
  const host = regionHost(platform);
  const encoded = `${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotFetch(`${host}/riot/account/v1/accounts/by-riot-id/${encoded}`);
}

export async function getAccountByPuuid(puuid, platform = 'euw1') {
  return riotFetch(`${regionHost(platform)}/riot/account/v1/accounts/by-puuid/${puuid}`);
}

export async function getSummonerByPuuid(puuid, platform = 'euw1') {
  return riotFetch(`${platformHost(platform)}/lol/summoner/v4/summoners/by-puuid/${puuid}`);
}

export async function getLolRankedByPuuid(puuid, platform = 'euw1') {
  return riotFetch(`${platformHost(platform)}/lol/league/v4/entries/by-puuid/${puuid}`);
}

export async function getTopMasteries(puuid, platform = 'euw1', count = 5) {
  const all = await riotFetch(`${platformHost(platform)}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`);
  return all ? all.slice(0, count) : [];
}

export async function getValorantAccountInfo(puuid, platform = 'euw1') {
  return riotFetch(`${regionHost(platform)}/riot/account/v1/accounts/by-puuid/${puuid}`);
}

export async function syncLolStats(puuid, platform) {
  const [summoner, ranked, masteries] = await Promise.all([
    getSummonerByPuuid(puuid, platform),
    getLolRankedByPuuid(puuid, platform),
    getTopMasteries(puuid, platform),
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
    raw_rank_data: { solo: soloEntry, flex: flexEntry, masteries },
  };
}

export async function syncValorantStats(puuid, platform) {
  const account = await getValorantAccountInfo(puuid, platform);
  return {
    summoner_id: null,
    summoner_level: null,
    profile_icon_id: null,
    rank_tier: null,
    rank_division: null,
    rank_lp: 0,
    wins: 0,
    losses: 0,
    raw_rank_data: { account, note: 'Full match/rank stats require Production API key with RSO' },
  };
}

export { PLATFORM_TO_REGION };
