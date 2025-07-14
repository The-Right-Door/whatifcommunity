import { supabase } from '../lib/supabase';

export interface Topic {
  topics_id: number;
  topic: string;
  description?: string;
  topics_status: 'draft' | 'published';
  start_date: string;
  end_date: string;
  period_id: number;
  subject_id: number;
  grade_id: number;
}

export class TopicError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'TopicError';
  }
}

export async function addTopic(topicData: Omit<Topic, 'topics_id'>): Promise<Topic> {
  try {
    const { data, error } = await supabase
      .from('topics')
      .insert([topicData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new TopicError('Failed to add topic', error.code, error);
    }

    return data as Topic;
  } catch (error) {
    if (error instanceof TopicError) throw error;

    throw new TopicError(
      'An unexpected error occurred while adding topic',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

export async function isTeacher(): Promise<boolean> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error || !data) return false;
    return data.role === 'teacher';
  } catch (error) {
    console.error('Error checking teacher status:', error);
    return false;
  }
}

