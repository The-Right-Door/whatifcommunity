import { supabase } from '../lib/supabase';

export interface Topic {
  topics_id: number;
  topic: string;
  description: string | null;
  start_date: string;
  end_date: string;
  topics_status: string;
  subtopics?: Subtopic[];
}

export interface Subtopic {
  subtopic_id: number;
  subtopic_title: string;
  small_description: string | null;
  status: string;
}

export interface LearningProgress {
  understood: boolean;
  unclear: boolean;
  viewed: boolean;
}

export class StartLearningError extends Error {
  constructor(message: string, public code?: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'StartLearningError';
  }
}

/**
 * Fetches subject details by ID
 */
export async function getSubjectDetails(subjectId: string | number): Promise<{ id: number; name: string }> {
  try {
    console.log('🔍 Fetching subject details for ID:', subjectId);
    
    const { data, error } = await supabase
      .from('subjects')
      .select('subjects_id, subjects_name')
      .eq('subjects_id', subjectId)
      .single();

    if (error) {
      throw new StartLearningError('Failed to fetch subject details', error.code, error);
    }
    
    return {
      id: data.subjects_id,
      name: data.subjects_name
    };
  } catch (error) {
    console.error('Error fetching subject details:', error);
    throw new StartLearningError(
      'Failed to load subject details',
      error instanceof StartLearningError ? error.code : 'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Fetches topics and subtopics for a subject and grade
 */
export async function getTopicsAndSubtopics(subjectId: string | number, gradeId: number): Promise<Topic[]> {
  try {
    console.log('🔍 Fetching topics and subtopics for subject:', subjectId, 'grade:', gradeId);
    
    // Fetch topics for this subject and grade
    const { data: topicsData, error: topicsError } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('grade_id', gradeId)
      .order('start_date', { ascending: true });

    if (topicsError) {
      throw new StartLearningError('Failed to fetch topics', topicsError.code, topicsError);
    }

    // For each topic, fetch its subtopics
    const topicsWithSubtopics = await Promise.all(
      topicsData.map(async (topic) => {
        const { data: subtopicsData, error: subtopicsError } = await supabase
          .from('subtopics')
          .select('subtopic_id, subtopic_title, small_description, status')
          .eq('topic_id', topic.topics_id)
          .order('subtopic_id', { ascending: true });

        if (subtopicsError) {
          throw new StartLearningError('Failed to fetch subtopics', subtopicsError.code, subtopicsError);
        }

        return {
          ...topic,
          subtopics: subtopicsData
        };
      })
    );

    return topicsWithSubtopics;
  } catch (error) {
    console.error('Error fetching topics and subtopics:', error);
    throw new StartLearningError(
      'Failed to load learning content',
      error instanceof StartLearningError ? error.code : 'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Fetches learning progress for a user and subject
 */
export async function getLearningProgress(subjectId: string | number): Promise<Record<number, LearningProgress>> {
  try {
    console.log('🔍 Fetching learning progress for subject:', subjectId);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new StartLearningError('User not authenticated', 'AUTH_REQUIRED');
    }

    // Fetch learning progress for this user and subject
    const { data, error } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('subject_id', subjectId);

    if (error) {
      throw new StartLearningError('Failed to fetch learning progress', error.code, error);
    }

    // Transform into a lookup object by subtopic_id
    const progressMap: Record<number, LearningProgress> = {};
    
    if (data) {
      data.forEach(item => {
        progressMap[item.subtopic_id] = {
          understood: item.understood || false,
          unclear: item.unclear || false,
          viewed: item.viewed || false
        };
      });
    }

    return progressMap;
  } catch (error) {
    console.error('Error fetching learning progress:', error);
    throw new StartLearningError(
      'Failed to load learning progress',
      error instanceof StartLearningError ? error.code : 'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Updates learning progress for a subtopic
 */
export async function updateLearningProgress(
  subjectId: string | number,
  subtopicId: number,
  field: 'understood' | 'unclear' | 'viewed',
  value: boolean
): Promise<void> {
  try {
    console.log('🔍 Updating learning progress for subtopic:', subtopicId, field, value);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new StartLearningError('User not authenticated', 'AUTH_REQUIRED');
    }

    // Check if a record already exists
    const { data: existingData, error: fetchError } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('subtopic_id', subtopicId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new StartLearningError('Failed to check existing progress', fetchError.code, fetchError);
    }

    if (existingData) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('learning_progress')
        .update({ [field]: value })
        .eq('user_id', user.id)
        .eq('subtopic_id', subtopicId);

      if (updateError) {
        throw new StartLearningError('Failed to update progress', updateError.code, updateError);
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('learning_progress')
        .insert([{
          user_id: user.id,
          subject_id: subjectId,
          subtopic_id: subtopicId,
          [field]: value
        }]);

      if (insertError) {
        throw new StartLearningError('Failed to save progress', insertError.code, insertError);
      }
    }
  } catch (error) {
    console.error('Error updating learning progress:', error);
    throw new StartLearningError(
      'Failed to update progress',
      error instanceof StartLearningError ? error.code : 'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Gets learning progress statistics for a subject
 */
export async function getLearningStats(subjectId: string | number): Promise<{
  totalSubtopics: number;
  viewed: number;
  understood: number;
  unclear: number;
}> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new StartLearningError('User not authenticated', 'AUTH_REQUIRED');
    }

    // Get all subtopics for this subject
    const { data: subtopics, error: subtopicsError } = await supabase
      .from('subtopics')
      .select('subtopic_id, topic_id, topics!inner(subject_id)')
      .eq('topics.subject_id', subjectId);

    if (subtopicsError) {
      throw new StartLearningError('Failed to fetch subtopics', subtopicsError.code, subtopicsError);
    }

    // Get progress for this user
    const { data: progress, error: progressError } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('subject_id', subjectId);

    if (progressError) {
      throw new StartLearningError('Failed to fetch progress', progressError.code, progressError);
    }

    // Calculate statistics
    const totalSubtopics = subtopics?.length || 0;
    const progressMap = progress?.reduce((acc, item) => {
      acc[item.subtopic_id] = item;
      return acc;
    }, {} as Record<number, any>) || {};

    const viewed = progress?.filter(p => p.viewed).length || 0;
    const understood = progress?.filter(p => p.understood).length || 0;
    const unclear = progress?.filter(p => p.unclear).length || 0;

    return {
      totalSubtopics,
      viewed,
      understood,
      unclear
    };
  } catch (error) {
    console.error('Error fetching learning stats:', error);
    throw new StartLearningError(
      'Failed to load learning statistics',
      error instanceof StartLearningError ? error.code : 'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}