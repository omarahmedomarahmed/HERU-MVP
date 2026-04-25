export function tournamentEmbed(t, frontendUrl) {
  const status = t.status === 'live' ? '🔴 LIVE' : t.status === 'published' ? '🟢 Open' : t.status;
  const date = t.start_date ? new Date(t.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA';
  return {
    title: t.name,
    color: 0xff1a1a,
    fields: [
      { name: 'Game', value: t.game || 'N/A', inline: true },
      { name: 'Format', value: t.format || 'N/A', inline: true },
      { name: 'Teams', value: `${(t.teams?.length || 0)}/${t.max_teams || '?'}`, inline: true },
      { name: 'Date', value: date, inline: true },
      { name: 'Prize Pool', value: t.prizepool_total ? `EGP ${Number(t.prizepool_total).toLocaleString()}` : 'TBA', inline: true },
      { name: 'Status', value: status, inline: true },
    ],
    thumbnail: t.tournament_image ? { url: t.tournament_image } : undefined,
    footer: { text: 'HERU.gg — MENA Esports Platform' },
    url: `${frontendUrl}/tournaments/${t.id}`,
  };
}

export function profileEmbed(profile, riotAccounts, frontendUrl) {
  const games = profile?.games?.join(', ') || 'None listed';
  const riotLines = riotAccounts?.map(a => {
    const rank = a.rank_tier ? `${a.rank_tier} ${a.rank_division || ''}`.trim() : 'Unranked';
    return `**${a.game_key === 'lol' ? 'LoL' : 'Valorant'}**: ${a.game_name}#${a.tag_line} — ${rank}`;
  }).join('\n') || 'No Riot accounts linked';

  return {
    title: profile?.username || 'HERU Gamer',
    color: 0x7c3aed,
    fields: [
      { name: 'Games', value: games, inline: false },
      { name: 'Riot Accounts', value: riotLines, inline: false },
    ],
    footer: { text: 'HERU.gg Profile' },
    url: profile ? `${frontendUrl}/gamers/${profile.id}` : frontendUrl,
  };
}

export function confirmEmbed(title, description, sessionId) {
  return {
    embeds: [{
      title: `⚡ ${title}`,
      description,
      color: 0xf59e0b,
      footer: { text: 'Reply YES to confirm or NO to cancel' },
    }],
    components: [{
      type: 1,
      components: [
        { type: 2, style: 3, label: '✅ Confirm', custom_id: `confirm_${sessionId}` },
        { type: 2, style: 4, label: '❌ Cancel', custom_id: `cancel_${sessionId}` },
      ],
    }],
  };
}
