import { supabase } from '../lib/supabase';

export interface Submission {
  id: number;
  learner_id: string;
  assessment_id: number;
  status: 'submitted' | 'pending' | 'missed';
  score: number | null;
  submitted_at: string | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionWithDetails {
  id: number;
  learnerName: string;
  assessmentTitle: string;
  status: 'submitted' | 'pending' | 'missed';
  score: number | null;
  submittedDate: string | null;
  feedback: string | null;
}

export class SubmissionError extends Error {
  constructor(message: string, public code?: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'SubmissionError';
  }
}

/**
 * Fetches submissions for a specific classroom and subject
 */
export async function getSubmissionsForClassroomAndSubject(
  classroomId: number,
  subjectId: number
): Promise<SubmissionWithDetails[]> {
  try {
    console.log('🔍 Fetching submissions for classroom:', classroomId, 'subject:', subjectId);

    // 1. Get subject name
    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .select('subjects_name')
      .eq('subjects_id', subjectId)
      .single();
      
    if (subjectError) throw subjectError;
    const subjectName = subjectData.subjects_name;
    console.log('📚 Subject name:', subjectName);

    // 2. Get learners in classroom
    const { data: learners, error: learnersError } = await supabase
      .from('classroom_learners')
      .select(`
        learner_id,
        learners:learner_id(
          user_id,
          first_name,
          last_name
        )
      `)
      .eq('classroom_id', classroomId);

    if (learnersError) throw learnersError;
    console.log('👨‍🎓 Learners:', learners?.length);

    // 3. Get assessments for the subject
    const { data: assessments, error: assessmentsError } = await supabase
      .from('assessments')
      .select('assessment_id, title, review_id, start_date, end_date')
      .eq('subject', subjectName);

    if (assessmentsError) throw assessmentsError;
    console.log('📝 Assessments for subject:', assessments?.length);

    // 4. Get learner responses
    const learnerIds = learners.map(l => l.learner_id);
    const reviewIds = assessments.map(a => a.review_id);
    
    const { data: responses, error: responsesError } = await supabase
      .from('learner_responses')
      .select('*')
      .in('user_id', learnerIds)
      .in('review_id', reviewIds);

    if (responsesError) throw responsesError;
    console.log('📥 Learner Responses:', responses?.length);

    // 5. Compose full report
    const submissions: SubmissionWithDetails[] = [];
    const now = new Date();

    for (const learner of learners) {
      const learnerName = `${learner.learners.first_name} ${learner.learners.last_name}`;
      
      for (const assessment of assessments) {
        const response = responses?.find(
          r => r.user_id === learner.learner_id && r.review_id === assessment.review_id
        );

        let status: 'submitted' | 'pending' | 'missed' = 'pending';
        let submittedDate = null;
        let score = null;
        let feedback = null;

        const endDate = new Date(assessment.end_date);

        if (response) {
          if (response.submission_status === 'completed') {
            status = 'submitted';
            submittedDate = response.submitted_at?.substring(0, 16).replace('T', ' ');
            score = response.score;
            feedback = response.feedback;
          } else {
            status = now > endDate ? 'missed' : 'pending';
          }
        } else {
          status = now > endDate ? 'missed' : 'pending';
        }

        submissions.push({
          id: submissions.length + 1,
          learnerName,
          assessmentTitle: assessment.title,
          status,
          score,
          submittedDate,
          feedback
        });
      }
    }

    console.log('✅ Final compiled submissions:', submissions.length);
    return submissions;
  } catch (error) {
    console.error('❌ Error in getSubmissionsForClassroomAndSubject:', error);
    throw new SubmissionError('Failed to fetch submissions', 'FETCH_ERROR', { originalError: error });
  }
}

/**
 * Sends a reminder to a learner about a pending submission
 */
export async function sendSubmissionReminder(
  learnerIds: string[],
  assessmentId: number,
  message?: string
): Promise<void> {
  try {
    console.log('📧 Sending reminder for assessment:', assessmentId, 'to learners:', learnerIds);
    
    // In a real app, this would send a notification to the learners
    // For now, we'll just simulate success
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Reminder sent successfully to', learnerIds.length, 'learners');
  } catch (error) {
    console.error('Error sending reminder:', error);
    throw new SubmissionError(
      'Failed to send reminder',
      'SEND_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Grades a submission and provides feedback
 */
export async function gradeSubmission(
  userId: string,
  reviewId: number,
  score: number,
  feedback: string
): Promise<void> {
  try {
    console.log('📝 Grading submission for user:', userId, 'review:', reviewId);
    
    // Validate score
    if (score < 0 || score > 100) {
      throw new SubmissionError('Score must be between 0 and 100', 'VALIDATION_ERROR');
    }
    
    // Check if response exists
    const { data: existingResponse, error: checkError } = await supabase
      .from('learner_responses')
      .select('response_id')
      .eq('user_id', userId)
      .eq('review_id', reviewId)
      .maybeSingle();
      
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingResponse) {
      // Update existing response
      const { error: updateError } = await supabase
        .from('learner_responses')
        .update({
          score,
          feedback,
          graded_at: new Date().toISOString()
        })
        .eq('response_id', existingResponse.response_id);
        
      if (updateError) throw updateError;
    } else {
      // Create a new response record (this would be unusual but possible)
      const { error: insertError } = await supabase
        .from('learner_responses')
        .insert([{
          user_id: userId,
          review_id: reviewId,
          score,
          feedback,
          submission_status: 'completed',
          graded_at: new Date().toISOString()
        }]);
        
      if (insertError) throw insertError;
    }
    
    console.log('✅ Submission graded successfully');
  } catch (error) {
    console.error('Error grading submission:', error);
    throw new SubmissionError(
      'Failed to grade submission',
      'GRADE_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Gets submission details for a specific learner and assessment
 */
export async function getSubmissionDetails(
  userId: string,
  reviewId: number
): Promise<SubmissionWithDetails | null> {
  try {
    console.log('🔍 Fetching submission details for user:', userId, 'review:', reviewId);
    
    // Get the response
    const { data: response, error: responseError } = await supabase
      .from('learner_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('review_id', reviewId)
      .maybeSingle();
      
    if (responseError && responseError.code !== 'PGRST116') {
      throw responseError;
    }
    
    if (!response) {
      return null;
    }
    
    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('user_id', userId)
      .single();
      
    if (userError) throw userError;
    
    // Get assessment details
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('title')
      .eq('review_id', reviewId)
      .single();
      
    if (assessmentError) throw assessmentError;
    
    return {
      id: response.response_id,
      learnerName: `${user.first_name} ${user.last_name}`,
      assessmentTitle: assessment.title,
      status: response.submission_status === 'completed' ? 'submitted' : 'pending',
      score: response.score,
      submittedDate: response.submitted_at?.substring(0, 16).replace('T', ' ') || null,
      feedback: response.feedback
    };
  } catch (error) {
    console.error('Error fetching submission details:', error);
    throw new SubmissionError(
      'Failed to fetch submission details',
      'FETCH_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Gets submission statistics for a classroom and subject
 */
export async function getSubmissionStatistics(
  classroomId: number,
  subjectId: number
): Promise<{
  total: number;
  submitted: number;
  pending: number;
  missed: number;
  averageScore: number | null;
}> {
  try {
    const submissions = await getSubmissionsForClassroomAndSubject(classroomId, subjectId);
    
    const total = submissions.length;
    const submitted = submissions.filter(s => s.status === 'submitted').length;
    const pending = submissions.filter(s => s.status === 'pending').length;
    const missed = submissions.filter(s => s.status === 'missed').length;
    
    const scores = submissions
      .filter(s => s.status === 'submitted' && s.score !== null)
      .map(s => s.score as number);
      
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;
    
    return {
      total,
      submitted,
      pending,
      missed,
      averageScore
    };
  } catch (error) {
    console.error('Error getting submission statistics:', error);
    throw new SubmissionError(
      'Failed to get submission statistics',
      'STATS_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Exports submissions data to CSV format
 */
export function exportSubmissionsToCSV(submissions: SubmissionWithDetails[]): string {
  try {
    // Create CSV header
    const headers = ['Learner Name', 'Assessment Title', 'Status', 'Score', 'Submitted Date', 'Feedback'];
    
    // Create CSV rows
    const rows = submissions.map(submission => [
      submission.learnerName,
      submission.assessmentTitle,
      submission.status,
      submission.score !== null ? submission.score : '',
      submission.submittedDate || '',
      submission.feedback || ''
    ]);
    
    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    return csvContent;
  } catch (error) {
    console.error('Error exporting submissions to CSV:', error);
    throw new SubmissionError(
      'Failed to export submissions to CSV',
      'EXPORT_ERROR',
      { originalError: error }
    );
  }
}