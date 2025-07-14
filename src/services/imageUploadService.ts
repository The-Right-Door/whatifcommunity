import { supabase } from '../lib/supabase';

const SUPABASE_URL = 'https://kfqpexcrslxxroovxubq.supabase.co';

export class ImageUploadError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

export async function uploadProfileImage(file: File): Promise<string> {
  try {
    // Validate file
    if (!file) {
      throw new ImageUploadError('No file provided', 'FILE_REQUIRED');
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new ImageUploadError(
        'Invalid file type. Please upload a JPEG, PNG, or GIF image.',
        'INVALID_FILE_TYPE'
      );
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new ImageUploadError(
        'File size too large. Maximum size is 5MB.',
        'FILE_TOO_LARGE'
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new ImageUploadError(
        'Authentication required',
        'AUTH_REQUIRED',
        { originalError: authError }
      );
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase
      .storage
      .from('profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new ImageUploadError(
        'Failed to upload image',
        uploadError.message,
        { originalError: uploadError }
      );
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/profile-images/${filePath}`;

    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_image_url: publicUrl })
      .eq('user_id', user.id);

    if (updateError) {
      throw new ImageUploadError(
        'Failed to update profile with new image',
        updateError.message,
        { originalError: updateError }
      );
    }

    return publicUrl;
  } catch (error) {
    if (error instanceof ImageUploadError) throw error;
    throw new ImageUploadError(
      'An unexpected error occurred while uploading image',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}