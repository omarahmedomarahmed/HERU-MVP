import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleGuard.js';

const router = Router();

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('cms_pages').select('id,slug,title,is_published,updated_at').order('slug');
    if (error) throw error;
    res.json({ pages: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('cms_pages').select('slug,title,content').eq('slug', req.params.slug).eq('is_published', true).single();
    if (error) return res.status(404).json({ error: 'Page not found' });
    res.json({ page: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

router.put('/:slug', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, content, is_published } = req.body;
    const updates = { updated_at: new Date().toISOString(), updated_by: req.user.id };
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (is_published !== undefined) updates.is_published = Boolean(is_published);
    const { data, error } = await supabaseAdmin.from('cms_pages').update(updates).eq('slug', req.params.slug).select().single();
    if (error) return res.status(404).json({ error: 'Page not found' });
    res.json({ page: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update page' });
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { slug, title, content, is_published = true } = req.body;
    if (!slug || !title) return res.status(400).json({ error: 'slug and title are required' });
    const { data, error } = await supabaseAdmin.from('cms_pages').insert({ slug, title, content: content || {}, is_published: Boolean(is_published), updated_by: req.user.id }).select().single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Slug already exists' });
      throw error;
    }
    res.status(201).json({ page: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create page' });
  }
});

export default router;
