import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET / - list all achievement definitions
router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('category');
    if (error) {
      // Table may not exist yet — return empty array instead of 500
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return res.json([]);
      }
      throw error;
    }
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /user/:userId - list a user's earned achievements
router.get('/user/:userId', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('gamer_achievements')
      .select('*, achievements(*)')
      .eq('user_id', req.params.userId)
      .order('earned_at', { ascending: false });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return res.json([]);
      }
      throw error;
    }
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /grant - grant achievement to user (staff or system)
router.post('/grant', requireAuth, async (req, res) => {
  try {
    const { user_id, achievement_id, tournament_id } = req.body;
    if (!user_id || !achievement_id) {
      return res.status(400).json({ error: 'user_id and achievement_id required' });
    }
    const { data, error } = await supabaseAdmin
      .from('gamer_achievements')
      .upsert({ user_id, achievement_id, tournament_id, earned_at: new Date().toISOString() }, { onConflict: 'user_id,achievement_id' })
      .select('*, achievements(*)')
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /check/:userId - auto-check and grant eligible achievements
router.post('/check/:userId', requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get gamer stats
    const { data: profile } = await supabaseAdmin
      .from('gamer_profiles')
      .select('total_matches, total_wins, tournaments_played, tournaments_won, team_ids')
      .eq('user_id', userId)
      .single();

    if (!profile) return res.status(404).json({ error: 'Gamer profile not found' });

    // Get all achievements
    const { data: allAchievements } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .eq('is_active', true);

    // Get already earned
    const { data: earned } = await supabaseAdmin
      .from('gamer_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const earnedIds = new Set((earned || []).map(e => e.achievement_id));

    // Check teams created (leader of)
    const { count: teamsCreated } = await supabaseAdmin
      .from('teams')
      .select('id', { count: 'exact', head: true })
      .eq('leader_id', userId);

    const stats = {
      wins: profile.total_wins || 0,
      tournaments_played: profile.tournaments_played || 0,
      tournaments_won: profile.tournaments_won || 0,
      teams_created: teamsCreated || 0,
      teams_joined: (profile.team_ids || []).length,
    };

    const newlyGranted = [];

    for (const achievement of (allAchievements || [])) {
      if (earnedIds.has(achievement.id)) continue;
      const criteria = achievement.criteria || {};
      if (!criteria.type || !criteria.count) continue;

      const currentValue = stats[criteria.type] || 0;
      if (currentValue >= criteria.count) {
        const { data: granted } = await supabaseAdmin
          .from('gamer_achievements')
          .upsert({ user_id: userId, achievement_id: achievement.id, earned_at: new Date().toISOString() }, { onConflict: 'user_id,achievement_id' })
          .select('*, achievements(*)')
          .single();
        if (granted) newlyGranted.push(granted);
      }
    }

    res.json({ checked: (allAchievements || []).length, newly_granted: newlyGranted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
