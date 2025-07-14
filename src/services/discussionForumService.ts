import { supabase } from '../lib/supabase';

export interface DiscussionForum {
  id: number;
  name: string;
  description: string;
  subjectId: number;
  gradeIds: number[];
  createdAt: string;
  createdBy: string;
  learnersAsking: string[];
  learnersHelping: string[];
}

export interface ForumLearner {
  id: string;
  name: string;
  role: 'asking' | 'helping';
}

export class DiscussionForumError extends Error {
  constructor(message: string, public code?: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'DiscussionForumError';
  }
}

/**
 * Gets all discussion forums created by the current teacher
 */
export async function getTeacherDiscussionForums(): Promise<DiscussionForum[]> {
  try {
    console.log('🔍 Fetching teacher discussion forums');
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new DiscussionForumError('Authentication required', 'AUTH_REQUIRED');
    }
    
    // Get forums created by this teacher
    const { data, error } = await supabase
      .from('discussion_forums')
      .select(`
        forum_id,
        forum_name,
        description,
        subject_id,
        grade_ids,
        created_at,
        created_by
      `)
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new DiscussionForumError('Failed to fetch forums', error.code, error);
    }
    
    // Get learners for each forum
    const forumsWithLearners = await Promise.all(
      data.map(async (forum) => {
        // Get learners asking for help
        const { data: askingLearners, error: askingError } = await supabase
          .from('forum_learners')
          .select(`
            learner_id,
            learners:learner_id(
              user_id,
              first_name,
              last_name
            )
          `)
          .eq('forum_id', forum.forum_id)
          .eq('role', 'asking');
        
        if (askingError) throw askingError;
        
        // Get learners helping
        const { data: helpingLearners, error: helpingError } = await supabase
          .from('forum_learners')
          .select(`
            learner_id,
            learners:learner_id(
              user_id,
              first_name,
              last_name
            )
          `)
          .eq('forum_id', forum.forum_id)
          .eq('role', 'helping');
        
        if (helpingError) throw helpingError;
        
        return {
          id: forum.forum_id,
          name: forum.forum_name,
          description: forum.description || '',
          subjectId: forum.subject_id,
          gradeIds: forum.grade_ids || [],
          createdAt: forum.created_at,
          createdBy: forum.created_by,
          learnersAsking: askingLearners.map(l => `${l.learners.first_name} ${l.learners.last_name}`),
          learnersHelping: helpingLearners.map(l => `${l.learners.first_name} ${l.learners.last_name}`)
        };
      })
    );
    
    console.log(`✅ Found ${forumsWithLearners.length} forums`);
    return forumsWithLearners;
  } catch (error) {
    console.error('❌ Error fetching teacher discussion forums:', error);
    if (error instanceof DiscussionForumError) throw error;
    throw new DiscussionForumError(
      'An unexpected error occurred while fetching forums',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Gets topics/subtopics where learners requested help
 */
export async function getTopicsWithHelpRequests(
  subjectId: number,
  gradeIds: number[]
): Promise<any[]> {
  try {
    console.log('🔍 Fetching topics with help requests:', { subjectId, gradeIds });
    
    // In a real implementation, this would query a help_requests table
    // For now, we'll return mock data
    return [
      {
        topicId: 1,
        topicName: 'Algebra',
        subtopics: [
          { id: 1, name: 'Linear Equations', requestCount: 5 },
          { id: 2, name: 'Quadratic Equations', requestCount: 3 }
        ]
      },
      {
        topicId: 2,
        topicName: 'Geometry',
        subtopics: [
          { id: 3, name: 'Circles', requestCount: 2 },
          { id: 4, name: 'Triangles', requestCount: 4 }
        ]
      }
    ];
  } catch (error) {
    console.error('❌ Error fetching topics with help requests:', error);
    if (error instanceof DiscussionForumError) throw error;
    throw new DiscussionForumError(
      'An unexpected error occurred while fetching topics',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Gets top performing learners for a subject and grades
 */
export async function getTopPerformingLearners(
  subjectId: number,
  gradeIds: number[]
): Promise<ForumLearner[]> {
  try {
    console.log('🔍 Fetching top performing learners:', { subjectId, gradeIds });
    
    // In a real implementation, this would query assessment results
    // For now, we'll return mock data
    return [
      { id: '1', name: 'Sarah Johnson', role: 'helping' },
      { id: '2', name: 'Michael Chen', role: 'helping' },
      { id: '3', name: 'Emily Brown', role: 'helping' },
      { id: '4', name: 'David Wilson', role: 'helping' },
      { id: '5', name: 'Lisa Anderson', role: 'helping' }
    ];
  } catch (error) {
    console.error('❌ Error fetching top performing learners:', error);
    if (error instanceof DiscussionForumError) throw error;
    throw new DiscussionForumError(
      'An unexpected error occurred while fetching learners',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Gets learners who requested help for a subject and grades
 */
export async function getLearnersRequestingHelp(
  subjectId: number,
  gradeIds: number[]
): Promise<ForumLearner[]> {
  try {
    console.log('🔍 Fetching learners requesting help:', { subjectId, gradeIds });
    
    // In a real implementation, this would query help_requests table
    // For now, we'll return mock data
    return [
      { id: '6', name: 'John Smith', role: 'asking' },
      { id: '7', name: 'Jessica Lee', role: 'asking' },
      { id: '8', name: 'Robert Taylor', role: 'asking' },
      { id: '9', name: 'Amanda Garcia', role: 'asking' },
      { id: '10', name: 'Thomas White', role: 'asking' }
    ];
  } catch (error) {
    console.error('❌ Error fetching learners requesting help:', error);
    if (error instanceof DiscussionForumError) throw error;
    throw new DiscussionForumError(
      'An unexpected error occurred while fetching learners',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Creates a new discussion forum
 */
export async function createDiscussionForum(
  name: string,
  description: string,
  subjectId: number,
  gradeIds: number[],
  classroomIds: number[],
  learnersAsking: string[],
  learnersHelping: string[],
  message: string
): Promise<number> {
  try {
    console.log('🔍 Creating discussion forum:', { name, subjectId, gradeIds });
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new DiscussionForumError('Authentication required', 'AUTH_REQUIRED');
    }
    
    // Create forum
    const { data: forum, error: forumError } = await supabase
      .from('discussion_forums')
      .insert([{
        forum_name: name,
        description: description || null,
        subject_id: subjectId,
        grade_ids: gradeIds,
        classroom_ids: classroomIds,
        welcome_message: message || null,
        created_by: user.id
      }])
      .select()
      .single();
    
    if (forumError) {
      throw new DiscussionForumError('Failed to create forum', forumError.code, forumError);
    }
    
    // Add learners to forum
    const forumLearners = [
      ...learnersAsking.map(learnerId => ({
        forum_id: forum.forum_id,
        learner_id: learnerId,
        role: 'asking'
      })),
      ...learnersHelping.map(learnerId => ({
        forum_id: forum.forum_id,
        learner_id: learnerId,
        role: 'helping'
      }))
    ];
    
    if (forumLearners.length > 0) {
      const { error: learnersError } = await supabase
        .from('forum_learners')
        .insert(forumLearners);
      
      if (learnersError) {
        // If adding learners fails, delete the forum to avoid orphaned forums
        await supabase
          .from('discussion_forums')
          .delete()
          .eq('forum_id', forum.forum_id);
        
        throw new DiscussionForumError('Failed to add learners to forum', learnersError.code, learnersError);
      }
    }
    
    console.log('✅ Forum created successfully:', forum.forum_id);
    return forum.forum_id;
  } catch (error) {
    console.error('❌ Error creating discussion forum:', error);
    if (error instanceof DiscussionForumError) throw error;
    throw new DiscussionForumError(
      'An unexpected error occurred while creating the forum',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Deletes a discussion forum
 */
export async function deleteDiscussionForum(forumId: number): Promise<void> {
  try {
    console.log('🔍 Deleting discussion forum:', forumId);
    
    // Delete forum (this will cascade delete forum_learners entries)
    const { error } = await supabase
      .from('discussion_forums')
      .delete()
      .eq('forum_id', forumId);
    
    if (error) {
      throw new DiscussionForumError('Failed to delete forum', error.code, error);
    }
    
    console.log('✅ Forum deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting discussion forum:', error);
    if (error instanceof DiscussionForumError) throw error;
    throw new DiscussionForumError(
      'An unexpected error occurred while deleting the forum',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}