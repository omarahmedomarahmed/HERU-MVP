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

export default router;
