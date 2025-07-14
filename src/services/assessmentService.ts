import { supabase } from '../lib/supabase';

export interface AssessmentData {
  reviewId: string;
  title: string;
  description?: string;
  subject: string;
  grade: string;
  startDate: string;
  endDate: string;
//  difficultyLevel: string;
  questionCount: number;
  timeLimit?: string;
  targetAudience: 'class' | 'group' | 'individual';
  selectedLearners?: number[];
  selectedGroups?: number[];
  selectedClasses?: number[];
}

export class AssessmentServiceError extends Error {
  constructor(message: string, public code?: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'AssessmentServiceError';
  }
}

/**
 * Creates an assessment linked to a review
 */
export async function createAssessment(assessmentData: AssessmentData): Promise<string> {
  try {

    console.log('📦 Assessment Data received:', assessmentData);
    // Validate required fields
    if (!assessmentData.reviewId) {
      throw new AssessmentServiceError('Review ID is required', 'VALIDATION_ERROR');
    }
    
    if (!assessmentData.title) {
      throw new AssessmentServiceError('Title is required', 'VALIDATION_ERROR');
    }
    
    if (!assessmentData.subject) {
      throw new AssessmentServiceError('Subject is required', 'VALIDATION_ERROR');
    }
    
    if (!assessmentData.grade) {
      throw new AssessmentServiceError('Grade is required', 'VALIDATION_ERROR');
    }
    
    if (!assessmentData.startDate) {
      throw new AssessmentServiceError('Start date is required', 'VALIDATION_ERROR');
    }
    
    if (!assessmentData.endDate) {
      throw new AssessmentServiceError('End date is required', 'VALIDATION_ERROR');
    }

    // Check if review exists
    const { data: reviewCheck, error: reviewCheckError } = await supabase
      .from('reviews')
      .select('review_id')
      .eq('review_id', assessmentData.reviewId)
      .single();

    if (reviewCheckError) {
      console.error('❌ Review check failed:', reviewCheckError);
      throw new AssessmentServiceError('Review not found', 'REVIEW_NOT_FOUND', reviewCheckError);
    }

    const assessmentPayload = {
      review_id: assessmentData.reviewId,
      title: assessmentData.title,
      description: assessmentData.description || null,
      subject: assessmentData.subject,
      grade: assessmentData.grade,
      start_date: assessmentData.startDate,
      end_date: assessmentData.endDate,
      status: 'scheduled',
    //  difficulty_level: assessmentData.difficultyLevel,
      question_count: assessmentData.questionCount,
      target_audience: assessmentData.targetAudience,
      selected_learners: JSON.stringify(assessmentData.selectedLearners || []),
      selected_groups: JSON.stringify(assessmentData.selectedGroups || []),
      selected_classes: JSON.stringify(assessmentData.selectedClasses || [])
      
    };

    console.log('📝 Payload to be inserted into assessments:', assessmentPayload);
    // Insert assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert([assessmentPayload])
      .select()
      .single();

    if (assessmentError) {
      console.error('❌ Assessment insert failed:', assessmentError);
      throw new AssessmentServiceError('Failed to create assessment', assessmentError.code, assessmentError);
    }

    console.log('✅ Assessment created successfully:', assessment);
    return assessment.assessment_id;
  } catch (error) {
    console.error('Error creating assessment:', error);
    if (error instanceof AssessmentServiceError) throw error;
    throw new AssessmentServiceError('Failed to create assessment', undefined, { originalError: error });
  }
}

/**
 * Gets an assessment by ID
 */
export async function getAssessment(assessmentId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        review:review_id(*)
      `)
      .eq('assessment_id', assessmentId)
      .single();

    if (error) {
      throw new AssessmentServiceError('Failed to fetch assessment', error.code, error);
    }

    return data;
  } catch (error) {
    console.error('Error fetching assessment:', error);
    if (error instanceof AssessmentServiceError) throw error;
    throw new AssessmentServiceError('Failed to fetch assessment', undefined, { originalError: error });
  }
}

/**
 * Gets all assessments for a teacher
 */
export async function getTeacherAssessments(): Promise<any[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new AssessmentServiceError('Authentication required', 'AUTH_REQUIRED');
    }

    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        review:review_id(teacher_id)
      `)
      .eq('review.teacher_id', user.id)
      .order('start_date', { ascending: false });

    if (error) {
      throw new AssessmentServiceError('Failed to fetch assessments', error.code, error);
    }

    return data;
  } catch (error) {
    console.error('Error fetching teacher assessments:', error);
    if (error instanceof AssessmentServiceError) throw error;
    throw new AssessmentServiceError('Failed to fetch assessments', undefined, { originalError: error });
  }
}

/**
 * Gets all assessments for a learner
 */
export async function getLearnerAssessments(): Promise<any[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new AssessmentServiceError('Authentication required', 'AUTH_REQUIRED');
    }

    // Get learner's grade
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .select('grade_id')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      throw new AssessmentServiceError('Failed to fetch user profile', profileError.code, profileError);
    }

    // Get assessments for the learner's grade
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('grade', `Grade ${userData.grade_id}`)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true });

    if (error) {
      throw new AssessmentServiceError('Failed to fetch assessments', error.code, error);
    }

    return data;
  } catch (error) {
    console.error('Error fetching learner assessments:', error);
    if (error instanceof AssessmentServiceError) throw error;
    throw new AssessmentServiceError('Failed to fetch assessments', undefined, { originalError: error });
  }
}

/**
 * Updates an assessment
 */
export async function updateAssessment(
  assessmentId: string, 
  updates: Partial<AssessmentData>
): Promise<void> {
  try {
    const updateData: Record<string, any> = {};
    
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.subject) updateData.subject = updates.subject;
    if (updates.grade) updateData.grade = updates.grade;
    if (updates.startDate) updateData.start_date = updates.startDate;
    if (updates.endDate) updateData.end_date = updates.endDate;
    if (updates.questionCount) updateData.question_count = updates.questionCount;

    const { error } = await supabase
      .from('assessments')
      .update(updateData)
      .eq('assessment_id', assessmentId);

    if (error) {
      throw new AssessmentServiceError('Failed to update assessment', error.code, error);
    }
  } catch (error) {
    console.error('Error updating assessment:', error);
    if (error instanceof AssessmentServiceError) throw error;
    throw new AssessmentServiceError('Failed to update assessment', undefined, { originalError: error });
  }
}

/**
 * Deletes an assessment
 */
export async function deleteAssessment(assessmentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('assessments')
      .delete()
      .eq('assessment_id', assessmentId);

    if (error) {
      throw new AssessmentServiceError('Failed to delete assessment', error.code, error);
    }
  } catch (error) {
    console.error('Error deleting assessment:', error);
    if (error instanceof AssessmentServiceError) throw error;
    throw new AssessmentServiceError('Failed to delete assessment', undefined, { originalError: error });
  }
}

/**
 * Gets all scheduled assessments for the logged-in teacher
 */
export async function getScheduledAssessments(): Promise<any[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new AssessmentServiceError('Authentication required', 'AUTH_REQUIRED');
    }

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('status', 'scheduled')
      .order('start_date', { ascending: true });

    if (error) {
      throw new AssessmentServiceError('Failed to fetch scheduled assessments', error.code, error);
    }

    return data;
  } catch (error) {
    console.error('Error fetching scheduled assessments:', error);
    if (error instanceof AssessmentServiceError) throw error;
    throw new AssessmentServiceError('Failed to fetch scheduled assessments', undefined, { originalError: error });
  }
}
