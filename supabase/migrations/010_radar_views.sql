CREATE TABLE IF NOT EXISTS radar_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  radar_id UUID REFERENCES sponsorship_radar(id),
  viewer_id UUID REFERENCES auth.users(id),
  viewer_brand_name TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_radar_views_radar ON radar_views(radar_id);
CREATE INDEX IF NOT EXISTS idx_radar_views_viewer ON radar_views(viewer_id);
