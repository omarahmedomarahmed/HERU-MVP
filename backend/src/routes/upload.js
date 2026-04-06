import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const ALLOWED_MIMES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf', 'video/mp4', 'video/webm',
]);
const ALLOWED_EXTS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'mp4', 'webm',
]);

router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file provided' });
    const ext = (file.originalname.split('.').pop() || '').toLowerCase();

    if (!ALLOWED_MIMES.has(file.mimetype)) {
      return res.status(400).json({ error: `File type not allowed: ${file.mimetype}` });
    }
    if (!ALLOWED_EXTS.has(ext)) {
      return res.status(400).json({ error: `File extension not allowed: .${ext}` });
    }
    const path = `uploads/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const { error } = await supabaseAdmin.storage.from('heru-uploads').upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
    if (error) throw error;
    const { data: { publicUrl } } = supabaseAdmin.storage.from('heru-uploads').getPublicUrl(path);
    res.json({ file_url: publicUrl, path });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
