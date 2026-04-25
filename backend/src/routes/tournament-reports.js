import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOrganizer } from '../middleware/roleGuard.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const { tournament_id } = req.query;
    if (!tournament_id) return res.status(400).json({ error: 'tournament_id is required' });
    const { data, error } = await supabaseAdmin.from('tournament_reports').select('*').eq('tournament_id', tournament_id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ reports: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { data: report, error } = await supabaseAdmin.from('tournament_reports').select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'Report not found' });
    if (report.organizer_id !== req.user.id) {
      const { data: sponsorship } = await supabaseAdmin.from('sponsorships').select('id').eq('tournament_id', report.tournament_id).eq('sponsor_id', req.user.id).in('status', ['paid','active','completed']).limit(1).single();
      if (!sponsorship) return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, requireOrganizer, async (req, res) => {
  try {
    const { tournament_id, total_views, unique_viewers, engagement_rate, clicks, conversions, report_file_url, notes } = req.body;
    if (!tournament_id) return res.status(400).json({ error: 'tournament_id is required' });
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('organizer_id').eq('id', tournament_id).single();
    if (!tournament || tournament.organizer_id !== req.user.id) return res.status(403).json({ error: 'You do not own this tournament' });
    const { data, error } = await supabaseAdmin.from('tournament_reports').insert({ tournament_id, organizer_id: req.user.id, total_views: total_views || 0, unique_viewers: unique_viewers || 0, engagement_rate: engagement_rate || 0, clicks: clicks || 0, conversions: conversions || 0, report_file_url: report_file_url || null, notes: notes || '' }).select().single();
    if (error) throw error;
    res.status(201).json({ report: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
