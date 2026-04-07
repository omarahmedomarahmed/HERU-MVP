import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { requireStaff } from '../middleware/staffGuard.js';
import { calculateTournamentCost, generateBrackets } from '../logic/tournament.js';
import { generateBillNumber, createBill } from '../logic/billing.js';

const router = Router();

// Valid columns for the tournaments table — used to strip unknown fields on insert/update
const TOURNAMENT_COLUMNS = new Set([
  'name','game','tournament_image','organizer_id','main_organizer_id','organizer_brand',
  'tournament_type','status','format','max_teams','schedule','description','is_offline','venue',
  'teams','invited_teams','join_requests','talents','branding_items','production_items',
  'prizepool_items','venue_items','total_cost','prizepool_total','platform_fee',
  'platform_fee_percent','prizepool_in_total_cost','on_radar','sponsorship_radar_id',
  'radar_funding_percent','required_branding_committed','co_organizers','organizer_chat',
  'brackets','support_chat','general_chat','stream_link','tournament_log',
  'signup_banner','signup_description','signup_rules','signup_custom_fields','stream_embed_url',
]);

function sanitizeTournamentData(data) {
  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (TOURNAMENT_COLUMNS.has(key) && value !== undefined) {
      // Convert empty strings to null for timestamp/numeric fields
      if ((key === 'schedule' || key === 'total_cost' || key === 'platform_fee' || key === 'prizepool_total') && value === '') {
        clean[key] = null;
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
}

// GET / - list tournaments (public, or organizer's own including drafts)
router.get('/', async (req, res) => {
  try {
    const { status, game, organizer_id, include_drafts, limit = 50, offset = 0 } = req.query;
    let query = supabaseAdmin.from('tournaments').select('*');

    if (status) {
      query = query.eq('status', status);
    } else if (organizer_id || include_drafts === 'true') {
      // When fetching for a specific organizer, include all statuses (drafts too)
    } else {
      query = query.in('status', ['published', 'live', 'completed']);
    }

    if (game) query = query.eq('game', game);
    if (organizer_id) query = query.eq('organizer_id', organizer_id);

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get tournament
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('tournaments').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Tournament not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create tournament
router.post('/', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  try {
    const tournament = {
      ...sanitizeTournamentData(req.body),
      organizer_id: req.user.id,
      main_organizer_id: req.user.id,
      status: 'draft',
    };
    const { data, error } = await supabaseAdmin.from('tournaments').insert(tournament).select().single();
    if (error) {
      console.error('[tournament create] Supabase error:', error);
      throw error;
    }
    res.status(201).json(data);
  } catch (err) {
    console.error('[tournament create] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update tournament
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { data: existing } = await supabaseAdmin.from('tournaments').select('organizer_id, main_organizer_id').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ error: 'Tournament not found' });
    if (existing.organizer_id !== req.user.id && existing.main_organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const updates = { ...sanitizeTournamentData(req.body), updated_at: new Date().toISOString() };
    const { data, error } = await supabaseAdmin.from('tournaments').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete draft tournament
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { data: existing } = await supabaseAdmin.from('tournaments').select('organizer_id, status').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ error: 'Tournament not found' });
    if (existing.organizer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (existing.status !== 'draft') return res.status(400).json({ error: 'Can only delete draft tournaments' });
    const { error } = await supabaseAdmin.from('tournaments').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/publish - publish tournament
router.post('/:id/publish', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('*').eq('id', req.params.id).single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.organizer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    // Resolve marketplace item IDs to full objects with prices
    const allItemIds = [
      ...(tournament.branding_items || []),
      ...(tournament.production_items || []),
      ...(tournament.venue_items || []),
      ...(tournament.prizepool_items || []),
    ].filter(id => typeof id === 'string');

    let resolvedItemsMap = {};
    if (allItemIds.length > 0) {
      const { data: mpItems } = await supabaseAdmin.from('marketplace_items').select('*').in('id', allItemIds);
      (mpItems || []).forEach(item => { resolvedItemsMap[item.id] = item; });
    }

    // Build resolved tournament for cost calculation
    const resolvedTournament = {
      ...tournament,
      branding_items: (tournament.branding_items || []).map(id => resolvedItemsMap[id]).filter(Boolean),
      production_items: (tournament.production_items || []).map(id => resolvedItemsMap[id]).filter(Boolean),
      venue_items: (tournament.venue_items || []).map(id => resolvedItemsMap[id]).filter(Boolean),
      prizepool_items: (tournament.prizepool_items || []).map(id => resolvedItemsMap[id]).filter(Boolean),
    };

    const costs = calculateTournamentCost(resolvedTournament);
    const brackets = tournament.teams?.length ? generateBrackets(tournament.teams, tournament.format || 'single_elimination') : [];

    // Build order items from resolved marketplace objects
    const orderItems = [];
    resolvedTournament.branding_items.forEach(item => {
      orderItems.push({ item_id: item.id, title: item.title, price: item.price, quantity: 1, category: 'branding', status: 'pending' });
    });
    resolvedTournament.production_items.forEach(item => {
      orderItems.push({ item_id: item.id, title: item.title, price: item.price, quantity: 1, category: 'production', status: 'pending' });
    });
    resolvedTournament.venue_items.forEach(item => {
      orderItems.push({ item_id: item.id, title: item.title, price: item.price, quantity: 1, category: 'venue', status: 'pending' });
    });
    resolvedTournament.prizepool_items.forEach(item => {
      orderItems.push({ item_id: item.id, title: item.title, price: item.price, quantity: 1, category: 'prizepool', status: 'pending' });
    });
    // Add talent items
    (tournament.talents || []).forEach(t => {
      orderItems.push({ item_id: t.user_id, title: `Talent: ${t.talent_type}`, price: t.price, quantity: 1, category: 'talent', status: 'pending' });
    });

    // Create tournament order
    const { data: order } = await supabaseAdmin.from('tournament_orders').insert({
      tournament_id: tournament.id,
      tournament_name: tournament.name,
      tournament_type: tournament.tournament_type,
      main_organizer_id: tournament.organizer_id,
      main_organizer_brand: tournament.organizer_brand?.brand_name || '',
      items: orderItems,
      subtotal_items: costs.subtotal - (tournament.prizepool_total || 0),
      prizepool_amount: tournament.prizepool_total || 0,
      platform_fee: costs.platformFee,
      grand_total: costs.total,
      main_organizer_owes: tournament.tournament_type === 'solo' ? costs.total : costs.total * ((tournament.radar_funding_percent || 33) / 100),
      fulfillment_status: 'pending_payment',
    }).select().single();

    const updateData = {
      status: tournament.tournament_type === 'shared' ? 'draft' : 'published',
      total_cost: costs.total,
      platform_fee: costs.platformFee,
      platform_fee_percent: costs.platformFeePercent,
      brackets,
      updated_at: new Date().toISOString(),
    };

    // If solo, create bill directly
    if (tournament.tournament_type === 'solo') {
      const billNumber = await generateBillNumber(supabaseAdmin);
      await supabaseAdmin.from('bills').insert({
        bill_number: billNumber,
        bill_type: 'organizer',
        tournament_id: tournament.id,
        tournament_name: tournament.name,
        tournament_order_id: order.id,
        payer_id: tournament.organizer_id,
        payer_type: 'organizer',
        payer_name: tournament.organizer_brand?.brand_name || '',
        items: order.items,
        subtotal: costs.subtotal,
        platform_fee: costs.platformFee,
        grand_total: costs.total,
        payment_status: 'unpaid',
        total_tournament_cost: costs.total,
      });
    } else {
      // Shared: put on radar
      const radarPercent = tournament.radar_funding_percent || 33;
      const contribution = costs.total * (radarPercent / 100);
      const { data: radar } = await supabaseAdmin.from('sponsorship_radar').insert({
        tournament_id: tournament.id,
        tournament_name: tournament.name,
        main_organizer_id: tournament.organizer_id,
        main_organizer_brand: tournament.organizer_brand,
        game: tournament.game,
        schedule: tournament.schedule,
        description: tournament.description,
        total_cost: costs.total,
        prizepool_amount: tournament.prizepool_total || 0,
        main_organizer_contribution: contribution,
        main_organizer_percent: radarPercent,
        amount_still_needed: costs.total - contribution,
        funding_percent: radarPercent,
        max_co_organizers: radarPercent <= 34 ? 2 : 1,
        status: 'open',
      }).select().single();

      updateData.on_radar = true;
      updateData.sponsorship_radar_id = radar.id;

      // Create bill for main organizer's share
      const billNumber = await generateBillNumber(supabaseAdmin);
      await supabaseAdmin.from('bills').insert({
        bill_number: billNumber,
        bill_type: 'organizer',
        tournament_id: tournament.id,
        tournament_name: tournament.name,
        tournament_order_id: order.id,
        payer_id: tournament.organizer_id,
        payer_type: 'organizer',
        payer_name: tournament.organizer_brand?.brand_name || '',
        subtotal: costs.subtotal * (radarPercent / 100),
        platform_fee: costs.platformFee * (radarPercent / 100),
        grand_total: contribution,
        payment_status: 'unpaid',
        shared_tournament: true,
        total_tournament_cost: costs.total,
      });
    }

    const { data: updated, error } = await supabaseAdmin.from('tournaments').update(updateData).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/brackets - update brackets
router.put('/:id/brackets', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('tournaments').update({ brackets: req.body.brackets, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/chat - organizer chat
router.post('/:id/chat', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('organizer_chat').eq('id', req.params.id).single();
    const chat = [...(tournament.organizer_chat || []), { ...req.body, user_id: req.user.id, timestamp: new Date().toISOString() }];
    const { data, error } = await supabaseAdmin.from('tournaments').update({ organizer_chat: chat }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/general-chat - public chat
router.post('/:id/general-chat', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('general_chat').eq('id', req.params.id).single();
    const chat = [...(tournament.general_chat || []), { ...req.body, user_id: req.user.id, timestamp: new Date().toISOString() }];
    const { data, error } = await supabaseAdmin.from('tournaments').update({ general_chat: chat }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/join-request - team join request
router.post('/:id/join-request', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('join_requests, max_teams, teams').eq('id', req.params.id).single();
    if ((tournament.teams?.length || 0) >= (tournament.max_teams || 999)) {
      return res.status(400).json({ error: 'Tournament is full' });
    }
    const requests = [...(tournament.join_requests || []), { ...req.body, id: crypto.randomUUID(), user_id: req.user.id, status: 'pending', created_at: new Date().toISOString() }];
    const { data, error } = await supabaseAdmin.from('tournaments').update({ join_requests: requests }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/join-request/:requestId - approve/reject
router.put('/:id/join-request/:requestId', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('join_requests, teams, organizer_id').eq('id', req.params.id).single();
    if (tournament.organizer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const requests = (tournament.join_requests || []).map(r =>
      r.id === req.params.requestId ? { ...r, status: req.body.status } : r
    );
    const updates = { join_requests: requests, updated_at: new Date().toISOString() };

    if (req.body.status === 'approved') {
      const request = tournament.join_requests.find(r => r.id === req.params.requestId);
      if (request?.team_id) {
        updates.teams = [...(tournament.teams || []), request.team_id];
      }
    }

    const { data, error } = await supabaseAdmin.from('tournaments').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/support-chat - support chat (organizer ↔ staff)
router.post('/:id/support-chat', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('support_chat').eq('id', req.params.id).single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    const chat = [...(tournament.support_chat || []), { ...req.body, user_id: req.user.id, timestamp: new Date().toISOString() }];
    const { data, error } = await supabaseAdmin.from('tournaments').update({ support_chat: chat }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id/team-chat/:teamId - get per-team organizer chat
router.get('/:id/team-chat/:teamId', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('team_chats, organizer_id, teams').eq('id', req.params.id).single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

    // Only organizer or team leader can view
    const { data: team } = await supabaseAdmin.from('teams').select('leader_id').eq('id', req.params.teamId).single();
    const isOrganizer = tournament.organizer_id === req.user.id;
    const isTeamLeader = team?.leader_id === req.user.id;
    if (!isOrganizer && !isTeamLeader) return res.status(403).json({ error: 'Only organizer or team leader can view this chat' });

    const messages = (tournament.team_chats || {})[req.params.teamId] || [];
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/team-chat/:teamId - send message in per-team chat
router.post('/:id/team-chat/:teamId', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('team_chats, organizer_id').eq('id', req.params.id).single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

    const { data: team } = await supabaseAdmin.from('teams').select('leader_id').eq('id', req.params.teamId).single();
    const isOrganizer = tournament.organizer_id === req.user.id;
    const isTeamLeader = team?.leader_id === req.user.id;
    if (!isOrganizer && !isTeamLeader) return res.status(403).json({ error: 'Only organizer or team leader can send messages' });

    const teamChats = tournament.team_chats || {};
    const messages = teamChats[req.params.teamId] || [];
    messages.push({
      ...req.body,
      user_id: req.user.id,
      sender_type: isOrganizer ? 'organizer' : 'team_leader',
      timestamp: new Date().toISOString(),
    });
    teamChats[req.params.teamId] = messages;

    const { data, error } = await supabaseAdmin.from('tournaments').update({ team_chats: teamChats }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/invite-team - invite a team to tournament
router.post('/:id/invite-team', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('organizer_id, invited_teams, teams, max_teams').eq('id', req.params.id).single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.organizer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { team_id } = req.body;
    if (!team_id) return res.status(400).json({ error: 'team_id required' });
    if ((tournament.teams || []).includes(team_id)) return res.status(400).json({ error: 'Team already in tournament' });
    if ((tournament.invited_teams || []).includes(team_id)) return res.status(400).json({ error: 'Team already invited' });

    const invited = [...(tournament.invited_teams || []), team_id];
    const { data, error } = await supabaseAdmin.from('tournaments').update({ invited_teams: invited, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;

    // Also add invite to the team's tournament_invites
    const { data: team } = await supabaseAdmin.from('teams').select('tournament_invites').eq('id', team_id).single();
    if (team) {
      const invites = [...(team.tournament_invites || []), { tournament_id: req.params.id, invited_at: new Date().toISOString(), status: 'pending' }];
      await supabaseAdmin.from('teams').update({ tournament_invites: invites }).eq('id', team_id);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/brackets/:matchId - update individual match score
router.put('/:id/brackets/:matchId', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('brackets, organizer_id').eq('id', req.params.id).single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.organizer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { winner_id, score1, score2 } = req.body;
    const matchId = req.params.matchId;
    let brackets = tournament.brackets || [];
    let matchFound = false;

    brackets = brackets.map(round => ({
      ...round,
      matches: (round.matches || []).map(match => {
        if (match.id === matchId) {
          matchFound = true;
          return { ...match, winner_id, score1, score2, status: winner_id ? 'completed' : match.status };
        }
        return match;
      }),
    }));

    if (!matchFound) return res.status(404).json({ error: 'Match not found' });

    // Advance winner to next round if applicable
    if (winner_id) {
      for (let i = 0; i < brackets.length - 1; i++) {
        const currentRound = brackets[i];
        const nextRound = brackets[i + 1];
        const matchIndex = (currentRound.matches || []).findIndex(m => m.id === matchId);
        if (matchIndex !== -1) {
          const nextMatchIndex = Math.floor(matchIndex / 2);
          if (nextRound.matches && nextRound.matches[nextMatchIndex]) {
            const slot = matchIndex % 2 === 0 ? 'team1' : 'team2';
            nextRound.matches[nextMatchIndex][slot] = winner_id;
          }
          break;
        }
      }
    }

    const { data, error } = await supabaseAdmin.from('tournaments').update({ brackets, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;

    // Sync this bracket match update to match_records table
    try {
      const { data: existingRecord } = await supabaseAdmin.from('match_records')
        .select('id')
        .eq('tournament_id', req.params.id)
        .eq('bracket_match_id', matchId)
        .single();

      const matchRecordUpdate = {
        participant1_score: score1 ?? null,
        participant2_score: score2 ?? null,
        winner_id: winner_id || null,
        status: winner_id ? 'completed' : 'in_progress',
        updated_at: new Date().toISOString(),
      };

      if (existingRecord) {
        await supabaseAdmin.from('match_records').update(matchRecordUpdate).eq('id', existingRecord.id);
      } else {
        // Find the match in brackets to get participant info
        let bracketMatch = null;
        let roundNum = 1;
        let matchNum = 1;
        for (const round of brackets) {
          for (let i = 0; i < (round.matches || []).length; i++) {
            if (round.matches[i].id === matchId) {
              bracketMatch = round.matches[i];
              roundNum = round.round || round.round_number || 1;
              matchNum = i + 1;
              break;
            }
          }
          if (bracketMatch) break;
        }
        if (bracketMatch) {
          await supabaseAdmin.from('match_records').insert({
            tournament_id: req.params.id,
            bracket_match_id: matchId,
            round_number: roundNum,
            match_number: matchNum,
            participant1_id: bracketMatch.team1 || null,
            participant2_id: bracketMatch.team2 || null,
            ...matchRecordUpdate,
          });
        }
      }
    } catch (syncErr) {
      // Log but don't fail the main request if match_records sync fails
      console.error('[bracket score sync] match_records sync error:', syncErr.message);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/announce-winner - set tournament results
router.post('/:id/announce-winner', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('organizer_id').eq('id', req.params.id).single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.organizer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { winner_team_id, results } = req.body;
    const { data, error } = await supabaseAdmin.from('tournaments').update({
      status: 'completed',
      winner_team_id,
      results: results || {},
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/signup-page - update custom signup page settings
router.put('/:id/signup-page', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('organizer_id').eq('id', req.params.id).single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.organizer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { signup_banner, signup_description, signup_rules, signup_custom_fields, stream_embed_url } = req.body;
    const { data, error } = await supabaseAdmin.from('tournaments').update({
      signup_banner, signup_description, signup_rules, signup_custom_fields, stream_embed_url,
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== 1v1 PLAYER INVITE / JOIN ROUTES =====

// POST /:id/invite-player - organizer invites a player to a 1v1 tournament
router.post('/:id/invite-player', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  try {
    const { player_id, player_name, game } = req.body;
    if (!player_id) return res.status(400).json({ error: 'player_id is required' });

    const { data: tournament } = await supabaseAdmin.from('tournaments').select('organizer_id, player_invites, name').eq('id', req.params.id).single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.organizer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const invite = {
      id: crypto.randomUUID(),
      player_id,
      player_name: player_name || null,
      game: game || null,
      invited_by: req.user.id,
      status: 'pending',
      invited_at: new Date().toISOString(),
    };

    const playerInvites = [...(tournament.player_invites || []), invite];
    const { data, error } = await supabaseAdmin.from('tournaments').update({
      player_invites: playerInvites,
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id).select().single();
    if (error) throw error;

    // Also add invite to the gamer's tournament_invites in gamer_profiles
    const { data: gamerProfile } = await supabaseAdmin.from('gamer_profiles').select('tournament_invites').eq('user_id', player_id).single();
    if (gamerProfile) {
      const gamerInvites = [...(gamerProfile.tournament_invites || []), {
        tournament_id: req.params.id,
        tournament_name: tournament.name,
        invited_by: req.user.id,
        status: 'pending',
        invited_at: new Date().toISOString(),
      }];
      await supabaseAdmin.from('gamer_profiles').update({ tournament_invites: gamerInvites }).eq('user_id', player_id);
    }

    // Audit log
    await supabaseAdmin.from('audit_log').insert({
      action: 'player_invited',
      entity_type: 'tournament',
      entity_id: req.params.id,
      actor_id: req.user.id,
      details: { player_id, player_name, game, invite_id: invite.id },
      created_at: new Date().toISOString(),
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/join-player - gamer joins a 1v1 tournament as a player
router.post('/:id/join-player', requireAuth, async (req, res) => {
  try {
    const { game_id, rank } = req.body;

    const { data: tournament } = await supabaseAdmin.from('tournaments').select('participant_type, player_participants, status, name').eq('id', req.params.id).single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.participant_type !== 'player') {
      return res.status(400).json({ error: 'This tournament does not accept individual player signups' });
    }
    if (!['published', 'live'].includes(tournament.status)) {
      return res.status(400).json({ error: 'Tournament is not open for registration' });
    }

    const existingParticipants = tournament.player_participants || [];
    if (existingParticipants.some(p => p.user_id === req.user.id)) {
      return res.status(400).json({ error: 'You have already joined this tournament' });
    }

    // Get gamer username
    const { data: gamerProfile } = await supabaseAdmin.from('gamer_profiles').select('username').eq('user_id', req.user.id).single();

    const participant = {
      user_id: req.user.id,
      username: gamerProfile?.username || null,
      game_id: game_id || null,
      rank: rank || null,
      joined_at: new Date().toISOString(),
    };

    const updatedParticipants = [...existingParticipants, participant];
    const { data, error } = await supabaseAdmin.from('tournaments').update({
      player_participants: updatedParticipants,
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id).select().single();
    if (error) throw error;

    // Audit log
    await supabaseAdmin.from('audit_log').insert({
      action: 'player_joined',
      entity_type: 'tournament',
      entity_id: req.params.id,
      actor_id: req.user.id,
      details: { game_id, rank, username: gamerProfile?.username },
      created_at: new Date().toISOString(),
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== MATCH RECORD ROUTES =====

// GET /:id/matches - list all match records for a tournament
router.get('/:id/matches', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('match_records')
      .select('*')
      .eq('tournament_id', req.params.id)
      .order('round_number', { ascending: true })
      .order('match_number', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id/matches/:matchId - get a single match record
router.get('/:id/matches/:matchId', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('match_records')
      .select('*')
      .eq('id', req.params.matchId)
      .eq('tournament_id', req.params.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Match record not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/matches - create a match record (organizer only)
router.post('/:id/matches', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('organizer_id, name').eq('id', req.params.id).single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.organizer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const matchRecord = {
      tournament_id: req.params.id,
      round_number: req.body.round_number || 1,
      match_number: req.body.match_number || 1,
      bracket_match_id: req.body.bracket_match_id || null,
      participant1_id: req.body.participant1_id || null,
      participant1_name: req.body.participant1_name || null,
      participant2_id: req.body.participant2_id || null,
      participant2_name: req.body.participant2_name || null,
      participant1_score: req.body.participant1_score || null,
      participant2_score: req.body.participant2_score || null,
      winner_id: req.body.winner_id || null,
      status: req.body.status || 'pending',
      scheduled_at: req.body.scheduled_at || null,
      screenshots: req.body.screenshots || [],
      player_submissions: req.body.player_submissions || [],
      abuse_reports: [],
      notes: req.body.notes || null,
    };

    const { data, error } = await supabaseAdmin.from('match_records').insert(matchRecord).select().single();
    if (error) throw error;

    // Audit log
    await supabaseAdmin.from('audit_log').insert({
      action: 'match_created',
      entity_type: 'match_record',
      entity_id: data.id,
      actor_id: req.user.id,
      details: { tournament_id: req.params.id, round_number: matchRecord.round_number, match_number: matchRecord.match_number },
      created_at: new Date().toISOString(),
    });

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/matches/:matchId - update a match record
// Organizers can update all fields; players can only submit results/screenshots via this route
router.put('/:id/matches/:matchId', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('organizer_id').eq('id', req.params.id).single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

    const { data: matchRecord } = await supabaseAdmin.from('match_records')
      .select('*')
      .eq('id', req.params.matchId)
      .eq('tournament_id', req.params.id)
      .single();
    if (!matchRecord) return res.status(404).json({ error: 'Match record not found' });

    const isOrganizer = tournament.organizer_id === req.user.id;
    const isParticipant = matchRecord.participant1_id === req.user.id || matchRecord.participant2_id === req.user.id;

    if (!isOrganizer && !isParticipant) {
      return res.status(403).json({ error: 'Not authorized to update this match' });
    }

    let updates;
    if (isOrganizer) {
      // Organizer can update any field
      updates = {
        ...(req.body.round_number !== undefined && { round_number: req.body.round_number }),
        ...(req.body.match_number !== undefined && { match_number: req.body.match_number }),
        ...(req.body.participant1_id !== undefined && { participant1_id: req.body.participant1_id }),
        ...(req.body.participant1_name !== undefined && { participant1_name: req.body.participant1_name }),
        ...(req.body.participant2_id !== undefined && { participant2_id: req.body.participant2_id }),
        ...(req.body.participant2_name !== undefined && { participant2_name: req.body.participant2_name }),
        ...(req.body.participant1_score !== undefined && { participant1_score: req.body.participant1_score }),
        ...(req.body.participant2_score !== undefined && { participant2_score: req.body.participant2_score }),
        ...(req.body.winner_id !== undefined && { winner_id: req.body.winner_id }),
        ...(req.body.status !== undefined && { status: req.body.status }),
        ...(req.body.scheduled_at !== undefined && { scheduled_at: req.body.scheduled_at }),
        ...(req.body.screenshots !== undefined && { screenshots: req.body.screenshots }),
        ...(req.body.notes !== undefined && { notes: req.body.notes }),
        updated_at: new Date().toISOString(),
      };
    } else {
      // Player can only submit scores and screenshots
      updates = {
        ...(req.body.screenshots !== undefined && { screenshots: req.body.screenshots }),
        ...(req.body.notes !== undefined && { notes: req.body.notes }),
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabaseAdmin.from('match_records').update(updates).eq('id', req.params.matchId).select().single();
    if (error) throw error;

    // Audit log
    await supabaseAdmin.from('audit_log').insert({
      action: 'match_updated',
      entity_type: 'match_record',
      entity_id: req.params.matchId,
      actor_id: req.user.id,
      details: { tournament_id: req.params.id, is_organizer: isOrganizer, fields_updated: Object.keys(updates) },
      created_at: new Date().toISOString(),
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/matches/:matchId/submit - player submits match results
router.post('/:id/matches/:matchId/submit', requireAuth, async (req, res) => {
  try {
    const { score, screenshots, notes } = req.body;

    const { data: matchRecord } = await supabaseAdmin.from('match_records')
      .select('*')
      .eq('id', req.params.matchId)
      .eq('tournament_id', req.params.id)
      .single();
    if (!matchRecord) return res.status(404).json({ error: 'Match record not found' });

    const isParticipant = matchRecord.participant1_id === req.user.id || matchRecord.participant2_id === req.user.id;
    if (!isParticipant) return res.status(403).json({ error: 'You are not a participant in this match' });

    const submission = {
      id: crypto.randomUUID(),
      user_id: req.user.id,
      score: score || null,
      screenshots: screenshots || [],
      notes: notes || null,
      submitted_at: new Date().toISOString(),
    };

    const playerSubmissions = [...(matchRecord.player_submissions || [])];
    // Replace existing submission from same user, or add new
    const existingIdx = playerSubmissions.findIndex(s => s.user_id === req.user.id);
    if (existingIdx !== -1) {
      playerSubmissions[existingIdx] = submission;
    } else {
      playerSubmissions.push(submission);
    }

    const { data, error } = await supabaseAdmin.from('match_records').update({
      player_submissions: playerSubmissions,
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.matchId).select().single();
    if (error) throw error;

    // Audit log
    await supabaseAdmin.from('audit_log').insert({
      action: 'match_result_submitted',
      entity_type: 'match_record',
      entity_id: req.params.matchId,
      actor_id: req.user.id,
      details: { tournament_id: req.params.id, score, has_screenshots: (screenshots || []).length > 0 },
      created_at: new Date().toISOString(),
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/matches/:matchId/report-abuse - report abuse on a match
router.post('/:id/matches/:matchId/report-abuse', requireAuth, async (req, res) => {
  try {
    const { reason, proof_urls } = req.body;
    if (!reason) return res.status(400).json({ error: 'reason is required' });

    const { data: matchRecord } = await supabaseAdmin.from('match_records')
      .select('*')
      .eq('id', req.params.matchId)
      .eq('tournament_id', req.params.id)
      .single();
    if (!matchRecord) return res.status(404).json({ error: 'Match record not found' });

    const report = {
      id: crypto.randomUUID(),
      reporter_id: req.user.id,
      reason,
      proof_urls: proof_urls || [],
      status: 'pending',
      reported_at: new Date().toISOString(),
    };

    const abuseReports = [...(matchRecord.abuse_reports || []), report];
    const { data, error } = await supabaseAdmin.from('match_records').update({
      abuse_reports: abuseReports,
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.matchId).select().single();
    if (error) throw error;

    // Audit log
    await supabaseAdmin.from('audit_log').insert({
      action: 'match_abuse_reported',
      entity_type: 'match_record',
      entity_id: req.params.matchId,
      actor_id: req.user.id,
      details: { tournament_id: req.params.id, reason, proof_count: (proof_urls || []).length, report_id: report.id },
      created_at: new Date().toISOString(),
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== FIX: Sync bracket updates with match_records =====

// PUT /:id/brackets-with-records - update brackets AND sync match_records
// This supplements the existing PUT /:id/brackets route for cases where
// callers want bracket changes reflected in the match_records table too.
router.put('/:id/brackets-with-records', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('brackets, organizer_id, name').eq('id', req.params.id).single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.organizer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const newBrackets = req.body.brackets;
    if (!Array.isArray(newBrackets)) return res.status(400).json({ error: 'brackets must be an array' });

    // Update the tournament brackets
    const { data, error } = await supabaseAdmin.from('tournaments').update({
      brackets: newBrackets,
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id).select().single();
    if (error) throw error;

    // Sync each bracket match to match_records via upsert
    for (const round of newBrackets) {
      const roundNumber = round.round || round.round_number || 1;
      for (let i = 0; i < (round.matches || []).length; i++) {
        const match = round.matches[i];
        const matchRecordData = {
          tournament_id: req.params.id,
          bracket_match_id: match.id,
          round_number: roundNumber,
          match_number: i + 1,
          participant1_id: match.team1 || match.participant1_id || null,
          participant1_name: match.team1_name || match.participant1_name || null,
          participant2_id: match.team2 || match.participant2_id || null,
          participant2_name: match.team2_name || match.participant2_name || null,
          participant1_score: match.score1 ?? match.participant1_score ?? null,
          participant2_score: match.score2 ?? match.participant2_score ?? null,
          winner_id: match.winner_id || null,
          status: match.winner_id ? 'completed' : (match.team1 && match.team2 ? 'in_progress' : 'pending'),
          updated_at: new Date().toISOString(),
        };

        if (match.id) {
          // Check if a match_record already exists for this bracket_match_id
          const { data: existing } = await supabaseAdmin.from('match_records')
            .select('id')
            .eq('tournament_id', req.params.id)
            .eq('bracket_match_id', match.id)
            .single();

          if (existing) {
            await supabaseAdmin.from('match_records').update(matchRecordData).eq('id', existing.id);
          } else {
            await supabaseAdmin.from('match_records').insert(matchRecordData);
          }
        }
      }
    }

    // Audit log
    await supabaseAdmin.from('audit_log').insert({
      action: 'brackets_synced_with_records',
      entity_type: 'tournament',
      entity_id: req.params.id,
      actor_id: req.user.id,
      details: { round_count: newBrackets.length },
      created_at: new Date().toISOString(),
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
