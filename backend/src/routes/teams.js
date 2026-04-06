import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

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
    // Add team to gamer profile
    await supabaseAdmin.rpc('array_append_unique', { table_name: 'gamer_profiles', column_name: 'team_ids', value: data.id, user_id_val: req.user.id }).catch(() => {});
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
    const requests = [...(team.join_requests || []), { id: crypto.randomUUID(), user_id: req.user.id, username: req.body.username, message: req.body.message, status: 'pending', created_at: new Date().toISOString() }];
    const { data, error } = await supabaseAdmin.from('teams').update({ join_requests: requests }).eq('id', req.params.id).select().single();
    if (error) throw error;
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

// GET /:id/members - list team members with roles
router.get('/:id/members', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('team_id', req.params.id)
      .order('joined_at');
    if (error) throw error;
    res.json(data || []);
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
    const validRoles = ['player', 'coach', 'manager', 'analyst', 'substitute', 'custom'];
    if (!validRoles.includes(role)) return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });

    // Upsert the team_members record
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .upsert({
        team_id: req.params.id,
        user_id: req.params.userId,
        role,
        custom_role: role === 'custom' ? custom_role : null,
      }, { onConflict: 'team_id,user_id' })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
