import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /match-records?tournament_id=xxx
router.get('/', async (req, res) => {
  try {
    const { tournament_id, match_id } = req.query;
    let q = supabaseAdmin.from('match_records').select('*');
    if (tournament_id) q = q.eq('tournament_id', tournament_id);
    if (match_id) q = q.eq('match_id', match_id);
    q = q.order('created_at', { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /match-records/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('match_records').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create match record (organizer/staff only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('match_records').insert({
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update match record (team leader submits results)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('match_records')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/submit - team leader submits match result
router.post('/:id/submit', requireAuth, async (req, res) => {
  try {
    const { data: record } = await supabaseAdmin.from('match_records').select('*').eq('id', req.params.id).single();
    if (!record) return res.status(404).json({ error: 'Match record not found' });

    const { team_side, score, screenshot_url, notes } = req.body;
    const submission = { user_id: req.user.id, score, screenshot_url, notes, submitted_at: new Date().toISOString() };

    const updates = {
      updated_at: new Date().toISOString(),
      ...(team_side === 'team1' ? { team1_submission: submission, team1_score: score } : { team2_submission: submission, team2_score: score }),
    };

    // If both teams submitted, mark as completed
    const t1 = team_side === 'team1' ? submission : record.team1_submission;
    const t2 = team_side === 'team2' ? submission : record.team2_submission;
    if (t1?.submitted_at && t2?.submitted_at) {
      updates.status = 'completed';
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin.from('match_records').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/chat - send chat message in match
router.post('/:id/chat', requireAuth, async (req, res) => {
  try {
    const { data: record } = await supabaseAdmin.from('match_records').select('chat').eq('id', req.params.id).single();
    if (!record) return res.status(404).json({ error: 'Match record not found' });
    const messages = [...(record.chat || []), {
      id: crypto.randomUUID(),
      user_id: req.user.id,
      sender_name: req.body.sender_name || 'Player',
      message: req.body.message,
      timestamp: new Date().toISOString(),
    }];
    const { data, error } = await supabaseAdmin.from('match_records').update({ chat: messages, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/report - report abuse
router.post('/:id/report', requireAuth, async (req, res) => {
  try {
    const { data: record } = await supabaseAdmin.from('match_records').select('abuse_reports').eq('id', req.params.id).single();
    if (!record) return res.status(404).json({ error: 'Match record not found' });
    const reports = [...(record.abuse_reports || []), {
      id: crypto.randomUUID(),
      reporter_id: req.user.id,
      reason: req.body.reason,
      screenshot_url: req.body.screenshot_url,
      reported_at: new Date().toISOString(),
    }];
    const { data, error } = await supabaseAdmin.from('match_records')
      .update({ abuse_reports: reports, status: 'disputed', updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
