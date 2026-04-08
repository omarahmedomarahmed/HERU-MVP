import { supabase } from '@/lib/supabase';

/**
 * Upload a file to Supabase Storage (heru-uploads bucket).
 * Returns { file_url } for use in profile images, tournament assets, etc.
 */
export async function uploadFile(file) {
  if (!file) throw new Error('No file provided');

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
