import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleGuard.js';

const router = Router();

// ──────────────────────────────────────────────────────────────────────────────
// Helper: validate staff token from x-staff-token header
// ──────────────────────────────────────────────────────────────────────────────
async function validateStaffToken(req) {
  const staffToken = req.headers['x-staff-token'];
  if (!staffToken) return false;
  const { data: session } = await supabaseAdmin
    .from('staff_sessions')
    .select('id')
    .eq('session_token', staffToken)
    .eq('is_active', true)
    .single();
  return !!session;
}

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/cms — list all pages (staff only)
// ──────────────────────────────────────────────────────────────────────────────
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('cms_pages')
      .select('id,slug,title,is_published,updated_at')
      .order('slug');
    if (error) throw error;
    res.json({ pages: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/cms/seed — seed default CMS content for all public pages
// ──────────────────────────────────────────────────────────────────────────────
router.post('/seed', async (req, res) => {
  try {
    const isStaff = await validateStaffToken(req);
    if (!isStaff) return res.status(401).json({ error: 'Staff token required' });

    const pages = [
      {
        slug: 'home',
        title: 'Home Page',
        content: {
          hero_title: 'The Esports Operating System for MENA',
          hero_subtitle: 'Compete. Build. Sponsor. Get Paid.',
          cta1_text: 'Start Competing',
          cta2_text: 'Build a Tournament',
          hero_image: '',
          stat_tournaments: '500+',
          stat_gamers: '10,000+',
          stat_prizes: 'EGP 5M+',
          stat_countries: '3',
          arena_title: 'HERU ARENA',
          arena_subtitle: 'Compete in tournaments. Climb the leaderboard.',
          builder_title: 'HERU BUILDER',
          builder_subtitle: 'Build funded tournaments end-to-end.',
          radar_title: 'HERU RADAR',
          radar_subtitle: 'Sponsor esports. Measure every EGP.',
          gigs_title: 'HERU GIGs',
          gigs_subtitle: 'List services. Get booked. Earn via escrow.',
          footer_tagline: 'The Esports Operating System for MENA',
          footer_copyright: '© 2026 HERU.gg. All rights reserved.',
        },
      },
      {
        slug: 'for-gamers',
        title: 'For Gamers',
        content: {
          hero_title: 'Compete. Climb. Connect.',
          hero_subtitle: 'HERU ARENA — where MENA gamers compete, grow, and get recognized.',
          cta_primary: 'Create Your Profile',
          cta_secondary: 'Browse Tournaments',
          feature1_title: 'Compete in Tournaments',
          feature1_desc: 'Join ranked and community tournaments across all major titles.',
          feature2_title: 'Climb the Leaderboard',
          feature2_desc: 'Earn points, unlock badges, and rise to the top.',
          feature3_title: 'Book a Coach',
          feature3_desc: 'Train with verified MENA region coaches and level up faster.',
        },
      },
      {
        slug: 'for-organizers',
        title: 'For Organizers',
        content: {
          hero_title: 'Build Events That Get Funded.',
          hero_subtitle: 'HERU BUILDER — the complete tournament operating system.',
          cta_primary: 'Start Building',
          feature1_title: 'Tournament Builder',
          feature1_desc: 'Create professional brackets, manage teams, and run live events.',
          fee_description: 'HERU takes 15% on all service bookings and sponsorship packages. You keep 85%.',
        },
      },
      {
        slug: 'for-sponsors',
        title: 'For Sponsors',
        content: {
          hero_title: 'Sponsor Esports. Measure Everything.',
          hero_subtitle: 'HERU RADAR — reach gaming audiences with real ROI.',
          plan_free_title: 'Free',
          plan_free_desc: 'Browse sponsorship packages and explore the ecosystem.',
          plan_community_price: '150,000',
          plan_community_desc: 'Full access to radar, analytics, and package purchasing.',
          plan_premium_price: '300,000',
          plan_premium_desc: 'All Community features plus managed campaigns and priority support.',
        },
      },
      {
        slug: 'for-providers',
        title: 'For Providers',
        content: {
          hero_title: 'Get Paid to Power Esports.',
          hero_subtitle: 'HERU GIGs — list your services, get booked, earn via escrow.',
          categories_heading: '9 Service Categories',
          categories_subheading: 'From venues to coaching to production — every esports need covered.',
        },
      },
    ];

    for (const page of pages) {
      await supabaseAdmin
        .from('cms_pages')
        .upsert({ ...page, updated_at: new Date().toISOString() }, { onConflict: 'slug' });
    }

    res.json({ success: true, seeded: pages.map((p) => p.slug) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/cms/page/:slug — get full content for a page (staff)
// ──────────────────────────────────────────────────────────────────────────────
router.get('/page/:slug', async (req, res) => {
  try {
    const { data } = await supabaseAdmin
      .from('cms_pages')
      .select('slug, title, content, updated_at')
      .eq('slug', req.params.slug)
      .single();
    res.json(data || { slug: req.params.slug, content: {} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PUT /api/cms/page/:slug — update full content for a page (staff only)
// ──────────────────────────────────────────────────────────────────────────────
router.put('/page/:slug', async (req, res) => {
  try {
    const isStaff = await validateStaffToken(req);
    if (!isStaff) return res.status(401).json({ error: 'Staff token required' });

    const { content, title } = req.body;
    const { data, error } = await supabaseAdmin
      .from('cms_pages')
      .upsert(
        {
          slug: req.params.slug,
          title: title || req.params.slug,
          content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' }
      )
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/cms/section/:page/:section — get a specific section from a page
// ──────────────────────────────────────────────────────────────────────────────
router.get('/section/:page/:section', async (req, res) => {
  try {
    const { data } = await supabaseAdmin
      .from('cms_pages')
      .select('content')
      .eq('slug', req.params.page)
      .single();

    if (!data) return res.status(404).json({ error: 'Page not found' });

    const sectionData = data.content?.[req.params.section] ?? null;
    res.json({ section: req.params.section, data: sectionData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PUT /api/cms/section/:page/:section — update a specific section (staff only)
// ──────────────────────────────────────────────────────────────────────────────
router.put('/section/:page/:section', async (req, res) => {
  try {
    const isStaff = await validateStaffToken(req);
    if (!isStaff) return res.status(401).json({ error: 'Staff token required' });

    // First fetch the existing page content
    const { data: existing } = await supabaseAdmin
      .from('cms_pages')
      .select('content')
      .eq('slug', req.params.page)
      .single();

    const mergedContent = {
      ...(existing?.content || {}),
      [req.params.section]: req.body.data,
    };

    const { data, error } = await supabaseAdmin
      .from('cms_pages')
      .upsert(
        {
          slug: req.params.page,
          content: mergedContent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' }
      )
      .select()
      .single();

    if (error) throw error;
    res.json({ section: req.params.section, data: data.content?.[req.params.section] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/cms/:slug — public: get a published page by slug
// ──────────────────────────────────────────────────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('cms_pages')
      .select('slug,title,content')
      .eq('slug', req.params.slug)
      .single();
    if (error) return res.status(404).json({ error: 'Page not found' });
    res.json({ page: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PUT /api/cms/:slug — update page (legacy, uses requireAuth + requireAdmin)
// ──────────────────────────────────────────────────────────────────────────────
router.put('/:slug', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, content, is_published } = req.body;
    const updates = { updated_at: new Date().toISOString(), updated_by: req.user.id };
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (is_published !== undefined) updates.is_published = Boolean(is_published);
    const { data, error } = await supabaseAdmin
      .from('cms_pages')
      .update(updates)
      .eq('slug', req.params.slug)
      .select()
      .single();
    if (error) return res.status(404).json({ error: 'Page not found' });
    res.json({ page: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update page' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/cms — create page (legacy)
// ──────────────────────────────────────────────────────────────────────────────
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { slug, title, content, is_published = true } = req.body;
    if (!slug || !title) return res.status(400).json({ error: 'slug and title are required' });
    const { data, error } = await supabaseAdmin
      .from('cms_pages')
      .insert({ slug, title, content: content || {}, is_published: Boolean(is_published), updated_by: req.user.id })
      .select()
      .single();
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
