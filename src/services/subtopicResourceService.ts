import { supabase } from '../lib/supabase';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'file' | 'video' | 'image' | 'link';
  url: string;
  created_at: string;
}

export interface SubtopicWithResources {
  subtopic_id: number;
  subtopic_title: string;
  topic_id: number;
  resources: Resource[] | null;
  topics: {
    topic: string;
  };
}

export class ResourceError extends Error {
  constructor(message: string, public code?: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'ResourceError';
  }
}

// Fetch subtopic with resources
export async function fetchSubtopicWithResources(subtopicId: number): Promise<SubtopicWithResources> {
  try {
    const { data, error } = await supabase
      .from('subtopics')
      .select(`
        *,
        topics ( topic )
      `)
      .eq('subtopic_id', subtopicId)
      .single();

    if (error) throw new ResourceError('Failed to fetch subtopic details', error.code, error.details);
    return data as SubtopicWithResources;
  } catch (error: any) {
    console.error('Error fetching subtopic with resources:', error);
    throw new ResourceError(error.message, error.code, error.details);
  }
}

// Add a resource to a subtopic
export async function addResource(
  subtopicId: number, 
  resource: Omit<Resource, 'id' | 'created_at'>
): Promise<Resource> {
  try {
    // Get current resources
    const { data: subtopic, error: fetchError } = await supabase
      .from('subtopics')
      .select('resources')
      .eq('subtopic_id', subtopicId)
      .single();

    if (fetchError) throw new ResourceError('Failed to fetch current resources', fetchError.code, fetchError.details);

    // Create new resource
    const newResource: Resource = {
      id: Date.now().toString(),
      ...resource,
      created_at: new Date().toISOString()
    };

    // Update resources array
    const currentResources = subtopic.resources || [];
    const updatedResources = [...currentResources, newResource];

    // Update subtopic
    const { error: updateError } = await supabase
      .from('subtopics')
      .update({ resources: updatedResources })
      .eq('subtopic_id', subtopicId);

    if (updateError) throw new ResourceError('Failed to add resource', updateError.code, updateError.details);

    return newResource;
  } catch (error: any) {
    console.error('Error adding resource:', error);
    throw new ResourceError(error.message, error.code, error.details);
  }
}

// Delete a resource
export async function deleteResource(subtopicId: number, resourceId: string): Promise<void> {
  try {
    // Get current resources
    const { data: subtopic, error: fetchError } = await supabase
      .from('subtopics')
      .select('resources')
      .eq('subtopic_id', subtopicId)
      .single();

    if (fetchError) throw new ResourceError('Failed to fetch current resources', fetchError.code, fetchError.details);

    // Filter out the resource to delete
    const currentResources = subtopic.resources || [];
    const updatedResources = currentResources.filter((r: Resource) => r.id !== resourceId);

    // Update subtopic
    const { error: updateError } = await supabase
      .from('subtopics')
      .update({ resources: updatedResources })
      .eq('subtopic_id', subtopicId);

    if (updateError) throw new ResourceError('Failed to delete resource', updateError.code, updateError.details);
  } catch (error: any) {
    console.error('Error deleting resource:', error);
    throw new ResourceError(error.message, error.code, error.details);
  }
}

// Upload a file to storage and return the URL
export async function uploadFile(
  subtopicId: number, 
  file: File
): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `subtopics/${subtopicId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('resources')
      .upload(filePath, file);
      
    if (uploadError) throw new ResourceError('Failed to upload file', uploadError.code, uploadError.details);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading file:', error);
    throw new ResourceError(error.message, error.code, error.details);
  }
}

// Delete a file from storage
export async function deleteFileFromStorage(fileUrl: string): Promise<void> {
  try {
    // Extract the path from the URL
    const urlParts = fileUrl.split('/');
    const filePath = urlParts.slice(urlParts.indexOf('resources') + 1).join('/');
    
    const { error } = await supabase.storage
      .from('resources')
      .remove([filePath]);
      
    if (error) throw new ResourceError('Failed to delete file from storage', error.code, error.details);
  } catch (error: any) {
    console.error('Error deleting file from storage:', error);
    throw new ResourceError(error.message, error.code, error.details);
  }
}