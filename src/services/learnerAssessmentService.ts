import { supabase } from '../lib/supabase';
import { getAssessmentsForLearnerByDateRange } from './learnerAssessmentFilters';

export interface LearnerAssignment {
  classroom_id: number;
  learner_id: string;
  created_at?: string;
}

export class LearnerAssignmentError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'LearnerAssignmentError';
  }
}

// Assign a single learner to a classroom
export async function assignLearnerToClassroom(
  assignment: Omit<LearnerAssignment, 'created_at'>
): Promise<LearnerAssignment> {
  try {
    console.log('🔍 assignLearnerToClassroom called');
    console.log('📦 classroom_id:', assignment.classroom_id);
    console.log('👨‍🎓 learner_id:', assignment.learner_id);

    const { data: existingAssignment, error: checkError } = await supabase
      .from('classroom_learners')
      .select('*')
      .eq('classroom_id', assignment.classroom_id)
      .eq('learner_id', assignment.learner_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing assignment:', checkError);
      throw new LearnerAssignmentError('Failed to check existing assignment', checkError.code, checkError);
    }

    if (existingAssignment) {
      console.log('⚠️ Learner already assigned to this classroom');
      throw new LearnerAssignmentError('Learner is already assigned to this classroom', 'DUPLICATE_ASSIGNMENT');
    }

    console.log('📝 Inserting new learner assignment');
    const { data, error } = await supabase
      .from('classroom_learners')
      .insert([assignment])
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting learner assignment:', error);
      throw new LearnerAssignmentError('Failed to assign learner to classroom', error.code, error);
    }

    console.log('✅ Learner assignment created successfully');
    return data as LearnerAssignment;
  } catch (error) {
    console.error('❌ Error in assignLearnerToClassroom:', error);
    if (error instanceof LearnerAssignmentError) throw error;
    throw new LearnerAssignmentError(
      'An unexpected error occurred while assigning learner',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

// Assign multiple learners to a classroom
export async function assignLearnersToClassroom(
  classroomId: number,
  learnerIds: string[]
): Promise<void> {
  try {
    console.log('🔍 assignLearnersToClassroom called');
    console.log('📦 classroomId:', classroomId);
    console.log('👨‍🎓 learnerIds:', learnerIds);

    const assignments = learnerIds.map(learnerId => ({
      classroom_id: classroomId,
      learner_id: learnerId
    }));

    console.log('📝 Inserting batch learner assignments');
    const { error } = await supabase
      .from('classroom_learners')
      .upsert(assignments, { 
        onConflict: 'classroom_id,learner_id',
        ignoreDuplicates: true 
      });

    if (error) {
      console.error('❌ Error inserting batch learner assignments:', error);
      throw new LearnerAssignmentError('Failed to assign learners to classroom', error.code, error);
    }

    console.log('✅ Batch learner assignments created successfully');
  } catch (error) {
    console.error('❌ Error in assignLearnersToClassroom:', error);
    if (error instanceof LearnerAssignmentError) throw error;
    throw new LearnerAssignmentError(
      'An unexpected error occurred while assigning learners',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

// Remove a learner from a classroom
export async function removeLearnerFromClassroom(
  classroomId: number,
  learnerId: string
): Promise<void> {
  try {
    console.log('🔍 removeLearnerFromClassroom - Starting removal');
    console.log('📦 classroom_id:', classroomId);
    console.log('👨‍🎓 learner_id:', learnerId);

    const { error } = await supabase
      .from('classroom_learners')
      .delete()
      .eq('classroom_id', classroomId)
      .eq('learner_id', learnerId);

    if (error) {
      console.error('❌ Error removing learner from classroom:', error);
      throw new LearnerAssignmentError('Failed to remove learner from classroom', error.code, error);
    }

    console.log('✅ Learner removed successfully');
  } catch (error) {
    console.error('❌ Error in removeLearnerFromClassroom:', error);
    if (error instanceof LearnerAssignmentError) throw error;
    throw new LearnerAssignmentError(
      'An unexpected error occurred while removing learner',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

// Get all learners for a classroom
export async function getLearnersForClassroom(classroomId: number): Promise<any[]> {
  try {
    console.log('🔍 getLearnersForClassroom - Fetching learners');
    console.log('📦 classroom_id:', classroomId);

    const { data, error } = await supabase
      .from('classroom_learners')
      .select(`
        *,
        learner:learner_id(
          user_id,
          first_name,
          last_name,
          grade_id
        )
      `)
      .eq('classroom_id', classroomId);

    if (error) {
      console.error('❌ Error fetching learners for classroom:', error);
      throw new LearnerAssignmentError('Failed to fetch learners for classroom', error.code, error);
    }

    console.log(`✅ Found ${data.length} learners for classroom`);
    return data;
  } catch (error) {
    console.error('❌ Error in getLearnersForClassroom:', error);
    if (error instanceof LearnerAssignmentError) throw error;
    throw new LearnerAssignmentError(
      'An unexpected error occurred while fetching learners',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

export async function assignLearnerAutomaticallyIfClassroomExists(
  gradeId: number,
  streamId: number,
  subjectId: number,
  learnerId: string
): Promise<void> {
  try {
    console.log('🔎 Searching for classroom with:', { gradeId, streamId, subjectId });

    // Step 1: Get all classroom IDs that offer the subject
    const { data: subjectClassrooms, error: subjectError } = await supabase
      .from('classroom_subject')
      .select('classroom_id')
      .eq('subject_id', subjectId);

    if (subjectError) throw subjectError;

    if (!subjectClassrooms || subjectClassrooms.length === 0) {
      console.warn('⚠️ No classrooms teach this subject');
      return;
    }

    const classroomIds = subjectClassrooms.map(c => c.classroom_id);

    // Step 2: Find a classroom that also matches grade and stream
    const { data: classroomMatch, error: classroomError } = await supabase
      .from('classrooms')
      .select('classroom_id')
      .eq('grade_id', gradeId)
      .eq('stream_id', streamId)
      .in('classroom_id', classroomIds)
      .maybeSingle();

    if (classroomError) throw classroomError;

    if (!classroomMatch) {
      console.warn('⚠️ No matching classroom found for grade and stream');
      return;
    }

    // Step 3: Enroll the learner in the classroom
    const { error: enrollmentError } = await supabase
      .from('classroom_learners')
      .insert({
        classroom_id: classroomMatch.classroom_id,
        learner_id: learnerId
      });

    if (enrollmentError) throw enrollmentError;

    console.log('✅ Learner successfully auto-enrolled in classroom:', classroomMatch.classroom_id);

  } catch (error) {
    console.error('❌ Error during auto-enrollment:', error);
    throw new Error('Failed to auto-assign learner to classroom');
  }
}

export interface UpcomingAssessment {
  id: number;
  title: string;
  type: string;
  startDate: string;
  dueDate: string;
  timeRemaining: string;
  subject: string;
  duration: string;
  submissionStatus?: string;
  result?: string;
  score?: number;
  feedback?: string;
}

export async function getUpcomingAssessmentsForLearner() {
  return getAssessmentsForLearnerByDateRange(today => ({
    start_op: '>', // start_date > today
    end_op: '>='  // optional
  }));
}

export async function getInProgressAssessmentsForLearner() {
  try {
    console.log('🔍 Fetching in-progress assessments for learner');
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new LearnerAssignmentError('Authentication required', 'AUTH_REQUIRED');
    }

    console.log('📌 Learner ID:', user.id);
    
    // Get learner's classrooms
    const { data: classrooms, error: classroomsError } = await supabase
      .from('classroom_learners')
      .select('classroom_id')
      .eq('learner_id', user.id);
      
    if (classroomsError) {
      throw new LearnerAssignmentError('Failed to fetch learner classrooms', classroomsError.code, classroomsError);
    }
    
    const classroomIds = classrooms?.map(c => c.classroom_id) || [];
    console.log('🏫 Learner classroom IDs:', classroomIds);
    
    // Get learner's groups (placeholder - would need a groups table)
    const groupIds: number[] = []; // In a real app, fetch from groups table
    
    // Get current date
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    console.log('📅 Today:', formattedToday);

    // Get completed assessments
    const { data: completedAssessments, error: completedError } = await supabase
      .from('learner_responses')
      .select('review_id')
      .eq('user_id', user.id)
      .eq('submission_status', 'completed');
      
    if (completedError) {
      throw new LearnerAssignmentError('Failed to fetch completed assessments', completedError.code, completedError);
    }
    
    const completedReviewIds = completedAssessments?.map(a => a.review_id) || [];
    console.log('✅ Completed review IDs:', completedReviewIds);
    
    // Fetch assessments that are currently active (started but not ended)
    // AND not already completed by the learner
    const { data: assessments, error: assessmentsError } = await supabase
      .from('assessments')
      .select('*')
      .eq('status', 'active')
      .lte('start_date', formattedToday)
      .gte('end_date', formattedToday)
      .order('end_date', { ascending: true });
      
    if (assessmentsError) {
      throw new LearnerAssignmentError('Failed to fetch assessments', assessmentsError.code, assessmentsError);
    }
    
    console.log('📦 Raw in-progress assessments:', assessments);

    // Filter assessments based on target audience and completion status
    const filteredAssessments = assessments?.filter(assessment => {
      // Skip if already completed
      if (completedReviewIds.includes(assessment.review_id)) {
        return false;
      }
      
      // Check if assigned to this learner
      if (assessment.target_audience === 'class') {
        const selectedClasses = JSON.parse(assessment.selected_classes || '[]');
        return selectedClasses.some((id: number) => classroomIds.includes(id));
      } else if (assessment.target_audience === 'group') {
        const selectedGroups = JSON.parse(assessment.selected_groups || '[]');
        return selectedGroups.some((id: number) => groupIds.includes(id));
      } else if (assessment.target_audience === 'individual') {
        const selectedLearners = JSON.parse(assessment.selected_learners || '[]');
        return selectedLearners.includes(user.id);
      }
      return false;
    }) || [];
    
    console.log('🔍 Filtered in-progress assessments:', filteredAssessments);

    // Get in-progress submissions (started but not completed)
    const { data: inProgressSubmissions, error: inProgressError } = await supabase
      .from('learner_responses')
      .select('review_id, responses')
      .eq('user_id', user.id)
      .eq('submission_status', 'incomplete');
      
    if (inProgressError) {
      throw new LearnerAssignmentError('Failed to fetch in-progress submissions', inProgressError.code, inProgressError);
    }
    
    console.log('🔄 In-progress submissions:', inProgressSubmissions);

    // Format the in-progress assessments
    const inProgressAssessments: UpcomingAssessment[] = filteredAssessments.map(assessment => {
      const dueDate = new Date(assessment.end_date);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if this assessment has been started
      const inProgressSubmission = inProgressSubmissions?.find(s => s.review_id === assessment.review_id);
      const progress = inProgressSubmission 
        ? Math.floor(Math.random() * 85) + 15 // Random progress between 15-99%
        : 0;
      
      return {
        id: assessment.assessment_id,
        title: assessment.title,
        type: assessment.target_audience === 'class' ? 'Class' : 
              assessment.target_audience === 'group' ? 'Group' : 'Individual',
        startDate: assessment.start_date,
        dueDate: assessment.end_date,
        timeRemaining: `${diffDays} day${diffDays !== 1 ? 's' : ''}`,
        subject: assessment.subject,
        duration: '60 minutes',
        progress: progress
      };
    });
    
    console.log(`✅ Found ${inProgressAssessments.length} in-progress assessments for learner`);
    return inProgressAssessments;
  } catch (error) {
    console.error('❌ Error fetching in-progress assessments for learner:', error);
    if (error instanceof LearnerAssignmentError) throw error;
    throw new LearnerAssignmentError(
      'Failed to fetch in-progress assessments',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

export async function getPastAssessmentsForLearner() {
  try {
    console.log('🔍 Fetching completed assessments for learner');
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new LearnerAssignmentError('Authentication required', 'AUTH_REQUIRED');
    }

    console.log('📌 Learner ID:', user.id);
    
    // Get learner's classrooms
    const { data: classrooms, error: classroomsError } = await supabase
      .from('classroom_learners')
      .select('classroom_id')
      .eq('learner_id', user.id);
      
    if (classroomsError) {
      throw new LearnerAssignmentError('Failed to fetch learner classrooms', classroomsError.code, classroomsError);
    }
    
    const classroomIds = classrooms?.map(c => c.classroom_id) || [];
    console.log('🏫 Learner classroom IDs:', classroomIds);
    
    // Get learner's groups (placeholder - would need a groups table)
    const groupIds: number[] = []; // In a real app, fetch from groups table
    
    // Get current date
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    console.log('📅 Today:', formattedToday);

    // Fetch completed assessments for this user
    const { data: completedAssessments, error: completedError } = await supabase
      .from('learner_responses')
      .select('review_id, submission_status, score, submitted_at')
      .eq('user_id', user.id)
      .eq('submission_status', 'completed');
      
    if (completedError) {
      throw new LearnerAssignmentError('Failed to fetch completed assessments', completedError.code, completedError);
    }
    
    console.log('✅ Completed assessments:', completedAssessments);
    
    // Get review IDs from completed assessments
    const completedReviewIds = completedAssessments?.map(a => a.review_id) || [];
    console.log('📝 Completed review IDs:', completedReviewIds);
    
    if (completedReviewIds.length === 0) {
      console.log('⚠️ No completed assessments found');
      return [];
    }
    
    // Fetch assessment details for completed assessments
    const { data: assessments, error: assessmentsError } = await supabase
      .from('assessments')
      .select('*')
      .in('review_id', completedReviewIds)
      .order('end_date', { ascending: false });
      
    if (assessmentsError) {
      throw new LearnerAssignmentError('Failed to fetch assessments', assessmentsError.code, assessmentsError);
    }
    
    console.log('📦 Raw completed assessments:', assessments);

    // Filter assessments based on target audience
    const filteredAssessments = assessments?.filter(assessment => {
      if (assessment.target_audience === 'class') {
        const selectedClasses = JSON.parse(assessment.selected_classes || '[]');
        return selectedClasses.some((id: number) => classroomIds.includes(id));
      } else if (assessment.target_audience === 'group') {
        const selectedGroups = JSON.parse(assessment.selected_groups || '[]');
        return selectedGroups.some((id: number) => groupIds.includes(id));
      } else if (assessment.target_audience === 'individual') {
        const selectedLearners = JSON.parse(assessment.selected_learners || '[]');
        return selectedLearners.includes(user.id);
      }
      return false;
    }) || [];
    
    console.log('🔍 Filtered completed assessments:', filteredAssessments);

    // Map completed status and scores to assessments
    const completedAssessmentsWithDetails: UpcomingAssessment[] = filteredAssessments.map(assessment => {
      const completedAssessment = completedAssessments?.find(ca => ca.review_id === assessment.review_id);
      const dueDate = new Date(assessment.end_date);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: assessment.assessment_id,
        title: assessment.title,
        type: assessment.target_audience === 'class' ? 'Class' : 
              assessment.target_audience === 'group' ? 'Group' : 'Individual',
        startDate: assessment.start_date,
        dueDate: assessment.end_date,
        timeRemaining: diffDays > 0 ? `${diffDays} day${diffDays !== 1 ? 's' : ''}` : 'Past due',
        subject: assessment.subject,
        duration: '60 minutes',
        submissionStatus: 'Submitted',
        submittedAt: completedAssessment?.submitted_at || null,
        score: completedAssessment?.score || 0,
        feedback: "Good work overall. Pay attention to the concepts covered in class."
      };
    });
    
    console.log(`✅ Found ${completedAssessmentsWithDetails.length} completed assessments for learner`);
    return completedAssessmentsWithDetails;
  } catch (error) {
    console.error('❌ Error fetching completed assessments for learner:', error);
    if (error instanceof LearnerAssignmentError) throw error;
    throw new LearnerAssignmentError(
      'Failed to fetch completed assessments',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

export async function getMissedAssessmentsForLearner(): Promise<UpcomingAssessment[]> {
  try {
    console.log('🔍 Fetching missed assessments for learner');
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new LearnerAssignmentError('Authentication required', 'AUTH_REQUIRED');
    }

    console.log('📌 Learner ID:', user.id);
    
    // Get learner's classrooms
    const { data: classrooms, error: classroomsError } = await supabase
      .from('classroom_learners')
      .select('classroom_id')
      .eq('learner_id', user.id);
      
    if (classroomsError) {
      throw new LearnerAssignmentError('Failed to fetch learner classrooms', classroomsError.code, classroomsError);
    }
    
    const classroomIds = classrooms?.map(c => c.classroom_id) || [];
    console.log('🏫 Learner classroom IDs:', classroomIds);
    
    // Get learner's groups (placeholder - would need a groups table)
    const groupIds: number[] = []; // In a real app, fetch from groups table
    
    // Get current date
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    console.log('📅 Today:', formattedToday);

    // Get all assessments that are past due
    const { data: pastDueAssessments, error: pastDueError } = await supabase
      .from('assessments')
      .select('*')
      .lt('end_date', formattedToday)
      .order('end_date', { ascending: false });
      
    if (pastDueError) {
      throw new LearnerAssignmentError('Failed to fetch past due assessments', pastDueError.code, pastDueError);
    }
    
    console.log('📦 Raw past due assessments:', pastDueAssessments);

    // Get all completed assessments for this user
    const { data: completedAssessments, error: completedError } = await supabase
      .from('learner_responses')
      .select('review_id')
      .eq('user_id', user.id)
      .eq('submission_status', 'completed');
      
    if (completedError) {
      throw new LearnerAssignmentError('Failed to fetch completed assessments', completedError.code, completedError);
    }
    
    const completedReviewIds = completedAssessments?.map(a => a.review_id) || [];
    console.log('✅ Completed review IDs:', completedReviewIds);

    // Filter assessments that are past due AND not completed AND assigned to this learner
    const filteredAssessments = pastDueAssessments?.filter(assessment => {
      // Skip if already completed
      if (completedReviewIds.includes(assessment.review_id)) {
        return false;
      }
      
      // Check if assigned to this learner
      if (assessment.target_audience === 'class') {
        const selectedClasses = JSON.parse(assessment.selected_classes || '[]');
        return selectedClasses.some((id: number) => classroomIds.includes(id));
      } else if (assessment.target_audience === 'group') {
        const selectedGroups = JSON.parse(assessment.selected_groups || '[]');
        return selectedGroups.some((id: number) => groupIds.includes(id));
      } else if (assessment.target_audience === 'individual') {
        const selectedLearners = JSON.parse(assessment.selected_learners || '[]');
        return selectedLearners.includes(user.id);
      }
      return false;
    }) || [];
    
    console.log('🔍 Filtered missed assessments:', filteredAssessments);

    // Format the missed assessments
    const missedAssessments: UpcomingAssessment[] = filteredAssessments.map(assessment => {
      const dueDate = new Date(assessment.end_date);
      const diffDays = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: assessment.assessment_id,
        title: assessment.title,
        type: assessment.target_audience === 'class' ? 'Class' : 
              assessment.target_audience === 'group' ? 'Group' : 'Individual',
        startDate: assessment.start_date,
        dueDate: assessment.end_date,
        timeRemaining: `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`,
        subject: assessment.subject,
        duration: '60 minutes',
        submissionStatus: 'Missed'
      };
    });
    
    console.log(`✅ Found ${missedAssessments.length} missed assessments for learner`);
    return missedAssessments;
  } catch (error) {
    console.error('❌ Error fetching missed assessments for learner:', error);
    if (error instanceof LearnerAssignmentError) throw error;
    throw new LearnerAssignmentError(
      'Failed to fetch missed assessments',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Get assessment by ID for a learner to attempt
 */
export async function getAssessmentById(assessmentId: number) {
  try {
    console.log(`🔍 Fetching assessment with ID: ${assessmentId}`);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new LearnerAssignmentError('Authentication required', 'AUTH_REQUIRED');
    }
    
    // Get assessment details
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select(`
        assessment_id,
        title,
        description,
        subject,
        grade,
        start_date,
        end_date,
        status,
        review_id
      `)
      .eq('assessment_id', assessmentId)
      .eq('status', 'active')
      .single();
      
    if (assessmentError) {
      throw new LearnerAssignmentError('Failed to fetch assessment', assessmentError.code, assessmentError);
    }

    console.log('🧾 Review ID used for fetching questions:', assessment.review_id);
    // Get questions from the review
    const { data: questions, error: questionsError } = await supabase
      .from('review_questions')
      .select(`
        question_id,
        question_text,
        options,
        correct_answer,
        explanation,
        hint
      `)
      .eq('review_id', assessment.review_id)
      .order('question_number', { ascending: true });
      
    if (questionsError) {
      throw new LearnerAssignmentError('Failed to fetch questions', questionsError.code, questionsError);
    }
    
    // Get time limit from the review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('*')
      .eq('review_id', assessment.review_id)
      .single();
      
    if (reviewError) {
      throw new LearnerAssignmentError('Failed to fetch review details', reviewError.code, reviewError);
    }
    
    // Format the questions
    const formattedQuestions = questions.map(q => ({
      id: q.question_id,
      questionText: q.question_text,
      options: q.options,
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
      hint: q.hint
    }));
    
    // Return the assessment with questions
    return {
      id: assessment.assessment_id,
      review_id: assessment.review_id,
      title: assessment.title,
      description: assessment.description || '',
      subject: assessment.subject,
      grade: assessment.grade,
      startDate: assessment.start_date,
      endDate: assessment.end_date,
      timeLimit: review.time_limit || '01:00', // Default to 1 hour if not specified
      questions: formattedQuestions
    };
  } catch (error) {
    console.error('Error fetching assessment:', error);
    if (error instanceof LearnerAssignmentError) throw error;
    throw new LearnerAssignmentError(
      'Failed to fetch assessment',
      'FETCH_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Submit assessment answers
 */
export async function submitAssessmentAnswers(
  assessmentId: number,
  reviewId: number,
  answers: Record<string, string>,
  questions: any[],
  isComplete: boolean
): Promise<void> {
  try {
    console.log(`🔍 Submitting answers for assessment: ${assessmentId}`);
    console.log(`📩 Submitted Answers:`, answers);
    console.log(`🔍 Is complete submission: ${isComplete}`);
    console.log (`since i have assessment what is the id of review:`,reviewId);
    console.log(`checking what questions have :`, questions);
    
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new LearnerAssignmentError('Authentication required', 'AUTH_REQUIRED');
    }
    
    console.log('👤 Current user ID:', user.id);
    // Check if a submission already exists
    const { data: existingSubmission, error: checkError } = await supabase
     .from('learner_responses')
     .select('response_id, submission_status')
     .eq('review_id', reviewId)
     .eq('user_id', user.id)
     .maybeSingle();
    
    console.log('📂 Existing submission found?', !!existingSubmission);
       
    if (checkError && checkError.code !== 'PGRST116') {
      throw new LearnerAssignmentError('Failed to check existing submission', checkError.code, checkError);
    }
  

    console.log('going to check correct answers');
    // Step 1: Get correct answers for this review
  const { data: correctQuestions, error: correctError } = await supabase
     .from('review_questions')
     .select('question_id, correct_answer')
     .eq('review_id', reviewId);

    console.log('✅ Loaded correct questions:', correctQuestions);

    const questionArray = Array.isArray(questions)
  ? questions
  : Object.values(questions)
    console.log('✅ Questions received for scoring:', questionArray);


  if (correctError || !correctQuestions) {
   throw new LearnerAssignmentError('Failed to fetch correct answers',        correctError?.code, correctError);
    }

 
    console.log('going to check score');
   let score = 0;
   
    correctQuestions.forEach((question) => {
  const submittedLetter = answers[question.question_id];
  const correctAnswer = question.correct_answer;

      console.log('🧪 Type of questions:', typeof questions);
console.log('🔍 questions value:', questions);

 const fullQuestion = questions.find(q => q.id === question.question_id);
  const options = fullQuestion?.options || [];

  // Convert submitted letter (like "C") to actual answer value
  const submittedAnswerValue = submittedLetter
    ? options[String.prototype.charCodeAt.call(submittedLetter, 0) - 65] // A = 0, B = 1, etc.
    : null;

  console.log('🔍 Comparing question:', question.question_id);
  console.log('👉 Selected letter:', submittedLetter);
  console.log('👉 Mapped value:', submittedAnswerValue);
  console.log('✅ Correct answer:', correctAnswer);

  if (submittedAnswerValue === correctAnswer) {
    score += 1;
    console.log('🎯 Correct! Score is now:', score);
  } else {
    console.log('❌ Incorrect or not submitted');
  }
});


    console.log('🏁 Final score:', score);
    const totalQuestions = correctQuestions.length;
const scorePercent = Math.round((score / totalQuestions) * 100);
console.log(`📊 Score Percentage: ${scorePercent}%`);

    
    const submissionData = {
      review_id: reviewId, // matches your foreign key
      user_id: user.id,        // renamed to match your schema
      responses: answers,      // renamed from 'answers'
      score: scorePercent,
      submission_status: isComplete ? 'completed' : 'incomplete',
      submitted_at: isComplete ? new Date().toISOString() : null
    };
    
    if (existingSubmission) {
      // Update existing submission
      const { error: updateError } = await supabase
        .from('learner_responses')
        .update(submissionData)
        .eq('response_id', existingSubmission.response_id);
        
      if (updateError) {
        throw new LearnerAssignmentError('Failed to update submission', updateError.code, updateError);
      }
    } else {
      // Create new submission
      const { error: insertError } = await supabase
        .from('learner_responses')
        .insert([submissionData]);
        
      if (insertError) {
        throw new LearnerAssignmentError('Failed to create submission', insertError.code, insertError);
      }
    }
    
    console.log('✅ Assessment answers submitted successfully');
  } catch (error) {
    console.error('Error submitting assessment answers:', error);
    if (error instanceof LearnerAssignmentError) throw error;
    throw new LearnerAssignmentError(
      'Failed to submit assessment answers',
      'SUBMISSION_ERROR',
      { originalError: error }
    );
  }
}

async function getAssessmentsForLearner(audienceType: 'class' | 'group' | 'individual', learnerId: string, classIds: number[], groupIds: number[]) {
  const today = new Date().toISOString().split('T')[0];

  const filters = {
    individual: {
      column: 'selected_learners',
      value: learnerId,
    },
    class: {
      column: 'selected_classes',
      value: classIds,
    },
    group: {
      column: 'selected_groups',
      value: groupIds,
    },
  };

  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('target_audience', audienceType)
    .eq('status', 'active')
    .lte('start_date', today)
    .gte('end_date', today)
    .filter(filters[audienceType].column, 'cs', `{${filters[audienceType].value}}`);

  return data || [];
}