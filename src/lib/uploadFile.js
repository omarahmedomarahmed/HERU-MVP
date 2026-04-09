import { supabase } from '@/lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Upload a file via the backend proxy (uses service role, bypasses Storage RLS).
 * Falls back to direct Supabase upload if the backend endpoint is unavailable.
 * Returns { file_url } matching the old Base44 UploadFile API shape.
 */
export async function uploadFile(file) {
  if (!file) throw new Error('No file provided');

  // Try backend upload first (bypasses RLS)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = {};
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      return { file_url: data.file_url };
    }

    // If backend fails, fall through to direct upload
    console.warn('Backend upload failed, falling back to direct Supabase upload');
  } catch (e) {
    console.warn('Backend upload unavailable, falling back to direct Supabase upload:', e.message);
  }

  // Fallback: direct Supabase upload (may fail with RLS)
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('heru-uploads')
    .upload(filePath, file, { cacheControl: '3600', upsert: true });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error(uploadError.message || 'File upload failed');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('heru-uploads')
    .getPublicUrl(filePath);

  return { file_url: publicUrl };
}
