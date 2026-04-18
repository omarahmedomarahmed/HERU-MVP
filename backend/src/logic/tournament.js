/**
 * Tournament business logic helpers.
 */

const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || '15');

/**
 * Sum the prices of all item arrays on a tournament record.
 * Each item category stores an array of marketplace item IDs or objects.
 * When items are stored as objects with a `price` field we sum directly;
 * otherwise the caller should resolve IDs before calling this.
 */
export function sumItemPrices(items = []) {
  return items.reduce((total, item) => total + (parseFloat(item.price) || 0), 0);
}

/**
 * Calculate the full cost breakdown for a tournament.
 */
export function calculateTournamentCost(tournament) {
  const allItems = [
    ...(tournament.branding_items || []),
    ...(tournament.production_items || []),
    ...(tournament.prizepool_items || []),
    ...(tournament.venue_items || []),
  ];

  const itemsSubtotal = sumItemPrices(allItems);
  const prizepool = parseFloat(tournament.prizepool_total) || 0;
  const subtotal = itemsSubtotal + prizepool;
  const platformFee = Math.round(subtotal * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
  const total = subtotal + platformFee;

  return {
    itemsSubtotal,
    prizepool,
    subtotal,
    platformFee,
    platformFeePercent: PLATFORM_FEE_PERCENT,
    total,
  };
}

function makeSingleElimination(teams) {
  const n = teams.length;
  if (n < 2) return [];
  const size = Math.pow(2, Math.ceil(Math.log2(n)));
  const padded = [...teams];
  while (padded.length < size) padded.push(null);
  const rounds = [];
  let currentTeams = padded;
  let roundNum = 1;
  while (currentTeams.length > 1) {
    const matches = [];
    for (let i = 0; i < currentTeams.length; i += 2) {
      const team1 = currentTeams[i];
      const team2 = currentTeams[i + 1];
      const isBye = !team1 || !team2;
      matches.push({
        id: `R${roundNum}-M${Math.floor(i / 2) + 1}`,
        round: roundNum,
        match_number: Math.floor(i / 2) + 1,
        team1: team1 || null,
        team2: team2 || null,
        score1: isBye ? (team1 ? 1 : 0) : null,
        score2: isBye ? (team2 ? 1 : 0) : null,
        winner: isBye ? (team1 || team2) : null,
        status: isBye ? 'completed' : 'pending',
      });
    }
    rounds.push({ round: roundNum, matches });
    currentTeams = matches.map((m) => m.winner || null);
    roundNum++;
  }
  return rounds;
}

function makeRoundRobin(teams) {
  const n = teams.length;
  if (n < 2) return [];
  const list = n % 2 === 0 ? [...teams] : [...teams, null]; // null = bye
  const numRounds = list.length - 1;
  const half = list.length / 2;
  const rounds = [];
  const rotation = list.slice(1);
  for (let r = 0; r < numRounds; r++) {
    const current = [list[0], ...rotation];
    const matches = [];
    for (let i = 0; i < half; i++) {
      const team1 = current[i];
      const team2 = current[list.length - 1 - i];
      if (!team1 && !team2) continue;
      matches.push({
        id: `R${r + 1}-M${i + 1}`,
        round: r + 1,
        match_number: i + 1,
        team1: team1 || null,
        team2: team2 || null,
        score1: null,
        score2: null,
        winner: null,
        status: (!team1 || !team2) ? 'bye' : 'pending',
      });
    }
    rounds.push({ round: r + 1, label: `Round ${r + 1}`, matches });
    rotation.push(rotation.shift()); // rotate
  }
  return rounds;
}

function makeSwiss(teams) {
  const n = teams.length;
  if (n < 2) return [];
  // Swiss: ceil(log2(n)) rounds, first round random pairing
  const numRounds = Math.ceil(Math.log2(n));
  const rounds = [];
  // Round 1: sequential pairing
  const r1matches = [];
  for (let i = 0; i < n; i += 2) {
    r1matches.push({
      id: `R1-M${Math.floor(i / 2) + 1}`,
      round: 1,
      match_number: Math.floor(i / 2) + 1,
      team1: teams[i] || null,
      team2: teams[i + 1] || null,
      score1: null, score2: null, winner: null,
      status: teams[i + 1] ? 'pending' : 'bye',
    });
  }
  rounds.push({ round: 1, label: 'Swiss Round 1', matches: r1matches });
  // Subsequent rounds are TBD until results are entered
  for (let r = 2; r <= numRounds; r++) {
    const count = Math.floor(n / 2);
    const matches = Array.from({ length: count }, (_, i) => ({
      id: `R${r}-M${i + 1}`,
      round: r,
      match_number: i + 1,
      team1: null, team2: null,
      score1: null, score2: null, winner: null,
      status: 'tbd',
    }));
    rounds.push({ round: r, label: `Swiss Round ${r}`, matches });
  }
  return rounds;
}

function makeDoubleElimination(teams) {
  // Winners bracket (same as SE) + skeleton losers bracket
  const wb = makeSingleElimination(teams).map(r => ({ ...r, label: `Winners R${r.round}`, bracket: 'winners' }));
  const losersRounds = wb.length - 1;
  const lb = [];
  for (let r = 1; r <= losersRounds; r++) {
    const matchCount = Math.max(1, Math.floor(teams.length / Math.pow(2, r + 1)));
    lb.push({
      round: wb.length + r,
      label: `Losers R${r}`,
      bracket: 'losers',
      matches: Array.from({ length: matchCount }, (_, i) => ({
        id: `LB-R${r}-M${i + 1}`,
        round: wb.length + r,
        match_number: i + 1,
        team1: null, team2: null,
        score1: null, score2: null, winner: null,
        status: 'tbd',
      })),
    });
  }
  // Grand Final
  lb.push({
    round: wb.length + losersRounds + 1,
    label: 'Grand Final',
    bracket: 'grand_final',
    matches: [{
      id: 'GF-M1', round: wb.length + losersRounds + 1, match_number: 1,
      team1: null, team2: null, score1: null, score2: null, winner: null, status: 'tbd',
    }],
  });
  return [...wb, ...lb];
}

/**
 * Generate brackets for any supported format.
 * format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss' | 'points'
 */
export function generateBrackets(teams = [], format = 'single_elimination') {
  const n = teams.length;
  if (n < 2) return [];
  switch (format) {
    case 'double_elimination': return makeDoubleElimination(teams);
    case 'round_robin':
    case 'points': return makeRoundRobin(teams);
    case 'swiss': return makeSwiss(teams);
    case 'single_elimination':
    default: return makeSingleElimination(teams);
  }
}

/**
 * Set the winner of a specific match and advance them in the brackets.
 */
export function setMatchWinner(brackets, matchId, winnerId, score1, score2) {
  let advanced = false;

  for (let r = 0; r < brackets.length; r++) {
    const round = brackets[r];
    for (let m = 0; m < round.matches.length; m++) {
      if (round.matches[m].id === matchId) {
        round.matches[m].winner = winnerId;
        round.matches[m].score1 = score1;
        round.matches[m].score2 = score2;
        round.matches[m].status = 'completed';

        // Advance winner to next round
        if (r + 1 < brackets.length) {
          const nextMatchIndex = Math.floor(m / 2);
          const nextMatch = brackets[r + 1].matches[nextMatchIndex];
          if (nextMatch) {
            if (m % 2 === 0) {
              nextMatch.team1 = winnerId;
            } else {
              nextMatch.team2 = winnerId;
            }
          }
        }
        advanced = true;
        break;
      }
    }
    if (advanced) break;
  }

  return brackets;
}
