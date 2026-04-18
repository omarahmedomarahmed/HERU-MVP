import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { logAudit } from './audit.js';

const router = Router();

// GET / - list teams
router.get('/', async (req, res) => {
  try {
    const { game, is_recruiting, limit = 50, offset = 0 } = req.query;
    let query = supabaseAdmin.from('teams').select('*');
    if (game) query = query.contains('games', [game]);
    if (is_recruiting) query = query.eq('is_recruiting', is_recruiting === 'true');
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('teams').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Team not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create team
router.post('/', requireAuth, async (req, res) => {
  try {
    const team = {
      ...req.body,
      leader_id: req.user.id,
      members: [req.user.id],
    };
    const { data, error } = await supabaseAdmin.from('teams').insert(team).select().single();
    if (error) throw error;
    // Add team to gamer profile (direct update, no RPC needed)
    try {
      const { data: gp } = await supabaseAdmin
        .from('gamer_profiles')
        .select('team_ids')
        .eq('user_id', req.user.id)
        .single();
      if (gp) {
        const ids = Array.isArray(gp.team_ids) ? gp.team_ids : [];
        if (!ids.includes(data.id)) {
          await supabaseAdmin
            .from('gamer_profiles')
            .update({ team_ids: [...ids, data.id], updated_at: new Date().toISOString() })
            .eq('user_id', req.user.id);
        }
      }
    } catch (_) { /* profile update is best-effort */ }
    logAudit({ actor_id: req.user.id, actor_role: 'gamer', action: 'team_created', entity_type: 'team', entity_id: data.id, details: { team_name: data.name } });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update team
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { data: existing } = await supabaseAdmin.from('teams').select('leader_id').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ error: 'Team not found' });
    if (existing.leader_id !== req.user.id) return res.status(403).json({ error: 'Only team leader can update' });
    // Blacklist sensitive fields that shouldn't be changed via generic update
    const { leader_id: _l, members: _m, join_requests: _j, tournament_invites: _t, ...safeUpdates } = req.body;
    const { data, error } = await supabaseAdmin.from('teams').update({ ...safeUpdates, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { data: existing } = await supabaseAdmin.from('teams').select('leader_id').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ error: 'Team not found' });
    if (existing.leader_id !== req.user.id) return res.status(403).json({ error: 'Only team leader can delete' });
    const { error } = await supabaseAdmin.from('teams').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/join-request
router.post('/:id/join-request', requireAuth, async (req, res) => {
  try {
    const { data: team } = await supabaseAdmin.from('teams').select('join_requests, members').eq('id', req.params.id).single();
    if (team.members?.includes(req.user.id)) return res.status(400).json({ error: 'Already a member' });
    const existing = (team.join_requests || []).find(r => r.user_id === req.user.id && r.status === 'pending');
    if (existing) return res.status(400).json({ error: 'You already have a pending join request for this team' });
    const requests = [...(team.join_requests || []), { id: crypto.randomUUID(), user_id: req.user.id, username: req.body.username, message: req.body.message, status: 'pending', created_at: new Date().toISOString() }];
    const { data, error } = await supabaseAdmin.from('teams').update({ join_requests: requests }).eq('id', req.params.id).select().single();
    if (error) throw error;
    logAudit({ actor_id: req.user.id, actor_role: 'gamer', action: 'team_join_requested', entity_type: 'team', entity_id: req.params.id, details: { username: req.body.username } });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/join-request/:requestId
router.put('/:id/join-request/:requestId', requireAuth, async (req, res) => {
  try {
    const { data: team } = await supabaseAdmin.from('teams').select('leader_id, join_requests, members').eq('id', req.params.id).single();
    if (team.leader_id !== req.user.id) return res.status(403).json({ error: 'Only leader can manage requests' });
    const requests = (team.join_requests || []).map(r => r.id === req.params.requestId ? { ...r, status: req.body.status } : r);
    const updates = { join_requests: requests, updated_at: new Date().toISOString() };
    if (req.body.status === 'approved') {
      const request = team.join_requests.find(r => r.id === req.params.requestId);
      if (request) updates.members = [...(team.members || []), request.user_id];
    }
    const { data, error } = await supabaseAdmin.from('teams').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/members - add member directly
router.post('/:id/members', requireAuth, async (req, res) => {
  try {
    const { data: team } = await supabaseAdmin.from('teams').select('leader_id, members').eq('id', req.params.id).single();
    if (team.leader_id !== req.user.id) return res.status(403).json({ error: 'Only leader can add members' });
    const members = [...(team.members || []), req.body.user_id];
    const { data, error } = await supabaseAdmin.from('teams').update({ members, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id/members/:memberId
router.delete('/:id/members/:memberId', requireAuth, async (req, res) => {
  try {
    const { data: team } = await supabaseAdmin.from('teams').select('leader_id, members').eq('id', req.params.id).single();
    if (team.leader_id !== req.user.id) return res.status(403).json({ error: 'Only leader can remove members' });
    const members = (team.members || []).filter(m => m !== req.params.memberId);
    const { data, error } = await supabaseAdmin.from('teams').update({ members, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    // Also remove from team_members table
    await supabaseAdmin.from('team_members').delete().eq('team_id', req.params.id).eq('user_id', req.params.memberId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id/members - list team members with roles + gamer profile data
router.get('/:id/members', async (req, res) => {
  try {
    // Always use teams.members array as source of truth, then enrich with profiles
    const { data: team, error: teamErr } = await supabaseAdmin
      .from('teams')
      .select('members, leader_id')
      .eq('id', req.params.id)
      .single();
    if (teamErr || !team) return res.json([]);

    const memberIds = team.members || [];
    if (memberIds.length === 0) return res.json([]);

    // Fetch gamer profiles for all member IDs
    const { data: profiles } = await supabaseAdmin
      .from('gamer_profiles')
      .select('user_id, username, avatar, bio, games, is_talent, talent_type')
      .in('user_id', memberIds);

    // Fetch roles from team_members table (best effort)
    const { data: roleRows } = await supabaseAdmin
      .from('team_members')
      .select('user_id, role, custom_role')
      .eq('team_id', req.params.id)
      .in('user_id', memberIds)
      .catch(() => ({ data: [] }));

    const roleMap = {};
    for (const r of (roleRows || [])) roleMap[r.user_id] = r;

    const members = memberIds.map(uid => {
      const profile = profiles?.find(p => p.user_id === uid) || {};
      const roleRow = roleMap[uid];
      return {
        user_id: uid,
        username: profile.username || null,
        avatar: profile.avatar || null,
        bio: profile.bio || null,
        games: profile.games || [],
        is_talent: profile.is_talent || false,
        talent_type: profile.talent_type || null,
        role: roleRow?.role || (uid === team.leader_id ? 'leader' : 'player'),
        custom_role: roleRow?.custom_role || null,
        is_leader: uid === team.leader_id,
      };
    });

    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/members/:userId/role - update member role (leader only)
router.put('/:id/members/:userId/role', requireAuth, async (req, res) => {
  try {
    const { data: team } = await supabaseAdmin.from('teams').select('leader_id').eq('id', req.params.id).single();
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.leader_id !== req.user.id) return res.status(403).json({ error: 'Only team leader can change roles' });

    const { role, custom_role } = req.body;
    const validRoles = ['player', 'coach', 'manager', 'analyst', 'substitute', 'sub', 'content creator', 'custom'];
    const normalizedRole = (role || '').toLowerCase();
    if (!validRoles.includes(normalizedRole)) return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });

    // Upsert the team_members record
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .upsert({
        team_id: req.params.id,
        user_id: req.params.userId,
        role: normalizedRole,
        custom_role: normalizedRole === 'custom' ? custom_role : null,
      }, { onConflict: 'team_id,user_id' })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/chat - team chat (any team member)
router.post('/:id/chat', requireAuth, async (req, res) => {
  try {
    const { data: team } = await supabaseAdmin.from('teams').select('members, chat_messages').eq('id', req.params.id).single();
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (!team.members?.includes(req.user.id)) return res.status(403).json({ error: 'Only team members can chat' });
    const chat = [...(team.chat_messages || []), { ...req.body, user_id: req.user.id, timestamp: new Date().toISOString() }];
    const { data, error } = await supabaseAdmin.from('teams').update({ chat_messages: chat }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
