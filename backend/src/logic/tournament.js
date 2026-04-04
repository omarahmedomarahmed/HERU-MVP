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

/**
 * Generate single-elimination brackets for N teams.
 * Returns an array of rounds, each containing match objects.
 */
export function generateBrackets(teams = []) {
  const n = teams.length;
  if (n < 2) return [];

  // Pad to next power of 2
  const size = Math.pow(2, Math.ceil(Math.log2(n)));
  const padded = [...teams];
  while (padded.length < size) padded.push(null); // BYE slots

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

    // Advance winners (or placeholders) to next round
    currentTeams = matches.map((m) => m.winner || null);
    roundNum++;
  }

  return rounds;
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
