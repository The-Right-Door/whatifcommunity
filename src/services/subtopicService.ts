import { supabase } from '../lib/supabase';

export interface Subtopic {
  subtopic_id: number;
  topic_id: number;
  subtopic_title: string;
  small_description?: string;
  full_explanation: string;
  start_date: string;
  end_date: string;
  status: string;
  resources?: any;
  must_complete_assessment?: boolean;
  required_assessment_id?: string | null;
}

export class SubtopicError extends Error {
  constructor(message: string, public code?: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'SubtopicError';
  }
}

// 1. Add a new subtopic
export async function addSubtopic(subtopicData: Omit<Subtopic, 'subtopic_id'>): Promise<Subtopic> {
  try {
    const { data, error } = await supabase
      .from('subtopics')
      .insert([subtopicData])
      .select()
      .single();

    if (error) throw new SubtopicError('Failed to insert subtopic', error.code, error.details);
    return data as Subtopic;
  } catch (error: any) {
    console.error('Subtopic insertion error:', error);
    throw new SubtopicError(error.message, error.code, error.details);
  }
}

// 2. Fetch subtopics for a given topic
export async function fetchSubtopicsByTopic(topicId: number): Promise<Subtopic[]> {
  try {
    const { data, error } = await supabase
      .from('subtopics')
      .select('*')
      .eq('topic_id', topicId)
      .order('subtopic_id', { ascending: true });

    if (error) throw new SubtopicError('Failed to fetch subtopics', error.code, error.details);
    return data as Subtopic[];
  } catch (error: any) {
    console.error('Subtopic fetch error:', error);
    throw new SubtopicError(error.message, error.code, error.details);
  }
}

// 3. Update subtopic by ID
export async function updateSubtopic(subtopicId: number, updates: Partial<Subtopic>): Promise<Subtopic> {
  try {
    const { data, error } = await supabase
      .from('subtopics')
      .update(updates)
      .eq('subtopic_id', subtopicId)
      .select()
      .single();

    if (error) throw new SubtopicError('Failed to update subtopic', error.code, error.details);
    return data as Subtopic;
  } catch (error: any) {
    console.error('Subtopic update error:', error);
    throw new SubtopicError(error.message, error.code, error.details);
  }
}

// 4. Delete subtopic
export async function deleteSubtopic(subtopicId: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('subtopics')
      .delete()
      .eq('subtopic_id', subtopicId);

    if (error) throw new SubtopicError('Failed to delete subtopic', error.code, error.details);
  } catch (error: any) {
    console.error('Subtopic deletion error:', error);
    throw new SubtopicError(error.message, error.code, error.details);
  }
}
//. fetch subtopic by id
export async function fetchSubtopicById(subtopicId: number): Promise<Subtopic> {
  try {
    const { data, error } = await supabase
      .from('subtopics')
      .select(`
        *,
        topics ( topic )  -- optional: fetch topic name
      `)
      .eq('subtopic_id', subtopicId)
      .single();

    if (error) throw new SubtopicError('Failed to fetch subtopic details', error.code, error.details);
    return data as Subtopic;
  } catch (error: any) {
    console.error('Subtopic fetch by ID error:', error);
    throw new SubtopicError(error.message, error.code, error.details);
  }
}

// 5. Update mandatory assessment settings
export async function updateMandatoryAssessment(
  subtopicId: number, 
  isMandatory: boolean, 
  assessmentId: string | null
): Promise<void> {
  try {
    const { error } = await supabase
      .from('subtopics')
      .update({
        must_complete_assessment: isMandatory,
        required_assessment_id: assessmentId
      })
      .eq('subtopic_id', subtopicId);

    if (error) throw new SubtopicError('Failed to update mandatory assessment', error.code, error.details);
  } catch (error: any) {
    console.error('Mandatory assessment update error:', error);
    throw new SubtopicError(error.message, error.code, error.details);
  }
}