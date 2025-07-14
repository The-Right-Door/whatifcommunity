import { fetchGrades } from './gradeService';
import { getAllActiveSubjects } from './subjectService';
import { supabase } from '../lib/supabase'; // or correct path

import { getScheduledAssessments as fetchAssessmentsFromAPI } from './assessmentService';

export interface ScheduledAssessment {
  id: number;
  title: string;
  subject: string;
  grade: string;
  scheduledFor: string;
  targetAudience: string;
  audienceDetails: string;
  status: string;
}

export interface ScheduledAssessmentFilters {
  subjects: string[];
  grades: string[];
}

export class ScheduledAssessmentError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ScheduledAssessmentError';
  }
}

/**
 * Fetches all filter options for scheduled assessments
 */
export async function getScheduledAssessmentFilters(): Promise<ScheduledAssessmentFilters> {
  try {
    console.log('🔍 Fetching filter options for scheduled assessments');
    
    // Fetch grades and subjects in parallel
    const [grades, subjects] = await Promise.all([
      fetchGrades(),
      getAllActiveSubjects()
    ]);
    
    console.log(`✅ Successfully fetched ${grades.length} grades and ${subjects.length} subjects`);
    
    // Format the filter options
    const formattedSubjects = ['All Subjects', ...subjects.map(subject => subject.subjects_name)];
    const formattedGrades = ['All Grades', ...grades.map(grade => grade.grade_name || `Grade ${grade.grade_no}`)];
    
    return {
      subjects: formattedSubjects,
      grades: formattedGrades
    };
  } catch (error) {
    console.error('❌ Error fetching scheduled assessment filters:', error);
    throw new ScheduledAssessmentError(
      'Failed to fetch filter options',
      'FILTERS_FETCH_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Fetches scheduled assessments with optional filtering
 */
export async function getScheduledAssessments(
  subjectFilter?: string,
  gradeFilter?: string,
  searchTerm?: string
): Promise<ScheduledAssessment[]> {
  try {
    console.log('🔍 Fetching scheduled assessments with filters:', { subjectFilter, gradeFilter, searchTerm });
    
    // Call the assessment service to get the actual data
    const assessments = await fetchAssessmentsFromAPI();
    
    // Map the assessments to the expected format
    const scheduledAssessments: ScheduledAssessment[] = assessments.map(assessment => {
      // Determine audience details based on the assessment data
      let audienceDetails = '';
      let targetAudience = 'Class';
      
      if (assessment.target_audience === 'individual') {
        const learnerCount = JSON.parse(assessment.selected_learners || '[]').length;
        audienceDetails = `Selected students (${learnerCount})`;
        targetAudience = 'Individual';
      } else if (assessment.target_audience === 'group') {
        const groupCount = JSON.parse(assessment.selected_groups || '[]').length;
        audienceDetails = `Selected groups (${groupCount})`;
        targetAudience = 'Group';
      } else if (assessment.target_audience === 'class') {
        const classCount = JSON.parse(assessment.selected_classes || '[]').length || 1;
        audienceDetails = `${assessment.subject} Class${classCount > 1 ? 'es' : ''}`;
      }
      
      return {
        id: assessment.assessment_id,
        title: assessment.title,
        subject: assessment.subject,
        grade: assessment.grade,
        scheduledFor: new Date(assessment.start_date).toLocaleDateString(),
        targetAudience,
        audienceDetails,
        status: 'Scheduled'
      };
    });
    
    // Apply filters
    let filteredAssessments = [...scheduledAssessments];
    
    if (subjectFilter && subjectFilter !== 'All Subjects') {
      filteredAssessments = filteredAssessments.filter(assessment => 
        assessment.subject === subjectFilter
      );
    }
    
    if (gradeFilter && gradeFilter !== 'All Grades') {
      filteredAssessments = filteredAssessments.filter(assessment => 
        assessment.grade === gradeFilter
      );
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredAssessments = filteredAssessments.filter(assessment => 
        assessment.title.toLowerCase().includes(term) ||
        assessment.subject.toLowerCase().includes(term) ||
        assessment.audienceDetails.toLowerCase().includes(term)
      );
    }
    
    console.log(`✅ Returning ${filteredAssessments.length} scheduled assessments`);
    return filteredAssessments;
  } catch (error) {
    console.error('❌ Error fetching scheduled assessments:', error);
    throw new ScheduledAssessmentError(
      'Failed to fetch scheduled assessments',
      'ASSESSMENTS_FETCH_ERROR',
      { originalError: error }
    );
  }
}

export async function markAssessmentAsActive(assessmentId: number): Promise<void> {
   console.log(`📤 Marking assessment ${assessmentId} as active`);
  const { error } = await supabase
    .from('assessments')
    .update({ status: 'active' })
    .eq('assessment_id', assessmentId);

  if (error) {
    throw new Error(error.message);
  }
console.log(`✅ Assessment ${assessmentId} marked as active`);
}


export async function cancelAssessment(id: number): Promise<void> {
  const { error } = await supabase
    .from('assessments') // Adjust table name if needed
    .update({ status: 'cancelled' })
    .eq('assessment_id', id);

  if (error) {
    throw new Error(`Failed to cancel assessment: ${error.message}`);
  }
}