import { supabase } from '@/lib/supabase';

/**
 * Upload a file to Supabase Storage (heru-uploads bucket).
 * Returns { file_url } matching the old Base44 UploadFile API shape.
 */
export async function uploadFile(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('heru-uploads')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('heru-uploads')
    .getPublicUrl(filePath);

  return { file_url: publicUrl };
}
