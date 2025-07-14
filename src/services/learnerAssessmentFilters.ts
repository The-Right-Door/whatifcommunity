import { supabase } from '../lib/supabase';
import { UpcomingAssessment } from './learnerAssessmentService';

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

export async function getAssessmentsForLearnerByDateRange(
  dateCondition: (today: string) => Record<string, string>
): Promise<UpcomingAssessment[]> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new LearnerAssignmentError('Authentication required', 'AUTH_REQUIRED');

  const { data: classrooms } = await supabase
    .from('classroom_learners')
    .select('classroom_id')
    .eq('learner_id', user.id);
  const classroomIds = classrooms?.map(c => c.classroom_id) || [];
  const groupIds: number[] = [];

  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  const filterRange = dateCondition(formattedToday);

  const { data: assessments, error: assessmentsError } = await supabase
    .from('assessments')
    .select('*')
    .eq('status', 'active')
    .order('start_date', { ascending: true });

  if (assessmentsError) {
    throw new LearnerAssignmentError('Failed to fetch assessments', assessmentsError.code);
  }

  const filtered = assessments?.filter(assessment => {
    const startMatch = filterRange.start_op === '>' ? assessment.start_date > formattedToday :
                       filterRange.start_op === '<=' ? assessment.start_date <= formattedToday : true;
    const endMatch = filterRange.end_op === '<' ? assessment.end_date < formattedToday :
                     filterRange.end_op === '>=' ? assessment.end_date >= formattedToday : true;

    const matchesDate = startMatch && endMatch;

    if (!matchesDate) return false;

    if (assessment.target_audience === 'class') {
      const selected = JSON.parse(assessment.selected_classes || '[]');
      return selected.some((id: number) => classroomIds.includes(id));
    } else if (assessment.target_audience === 'group') {
      const selected = JSON.parse(assessment.selected_groups || '[]');
      return selected.some((id: number) => groupIds.includes(id));
    } else if (assessment.target_audience === 'individual') {
      const selected = JSON.parse(assessment.selected_learners || '[]');
      return selected.includes(user.id);
    }
    return false;
  }) || [];

  return filtered.map(assessment => {
    const dueDate = new Date(assessment.end_date);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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
      review_id: assessment.review_id // ✅ add this line
    };
  });
}