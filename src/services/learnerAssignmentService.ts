import { supabase } from '../lib/supabase';

export interface LearnerAssignment {
  classroom_id: number;
  learner_id: string;
//  assigned_by?: string;
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
//    console.log('👤 assigned_by:', assignment.assigned_by);

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
 // assignedBy?: string
): Promise<void> {
  try {
    console.log('🔍 assignLearnersToClassroom called');
    console.log('📦 classroomId:', classroomId);
    console.log('👨‍🎓 learnerIds:', learnerIds);
  //  console.log('👤 assignedBy:', assignedBy);

    const assignments = learnerIds.map(learnerId => ({
      classroom_id: classroomId,
      learner_id: learnerId
   //   assigned_by: assignedBy
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

/**
 * Automatically assigns a learner to an existing classroom based on grade, stream, and subject
 */

/*
export async function assignLearnerAutomaticallyIfClassroomExists(
  gradeId: number,
  streamId: number,
  subjectId: number,
  learnerId: string
): Promise<void> {
  try {
    console.log('🔎 Searching for classroom with:', { gradeId, streamId, subjectId });

    // 1. Search for matching classroom
    const { data: classroom, error: classroomError } = await supabase
      .from('classrooms')
      .select('classroom_id')
      .eq('grade_id', gradeId)
      .eq('stream_id', streamId)
      .eq('subject_id', subjectId)
      .maybeSingle();

    if (classroomError && classroomError.code !== 'PGRST116') {
      console.error('❌ Error fetching classroom:', classroomError);
      throw new LearnerAssignmentError('Failed to search for classroom', classroomError.code, classroomError);
    }

    if (!classroom) {
      console.log('⚠️ No matching classroom found, skipping assignment');
      return;
    }

    console.log('classroom.id checking firstly ', classroom.classroom_id);
  
    const classroomId = classroom.classroom_id;
    
    console.log('✅ Classroom found:', classroomId);

    // 2. Check if learner already assigned
    const { data: existingAssignment, error: checkError } = await supabase
      .from('classroom_learners')
      .select('id')
      .eq('classroom_id', classroomId)
      .eq('learner_id', learnerId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing learner assignment:', checkError);
      throw new LearnerAssignmentError('Failed to check assignment', checkError.code, checkError);
    }

    if (existingAssignment) {
      console.log('🔁 Learner already assigned to classroom');
      return;
    }

    console.log('no learner found, will insert then');
    // 3. Insert new learner assignment
    const { error: insertError } = await supabase
      .from('classroom_learners')
      .insert([{ classroom_id: classroomId, learner_id: learnerId }]);

    if (insertError) {
      console.error('❌ Failed to assign learner:', insertError);
      throw new LearnerAssignmentError('Failed to insert assignment', insertError.code, insertError);
    }

    console.log('🎉 Learner assigned to classroom automatically!');
  } catch (error) {
    console.error('❌ Error in automatic learner assignment:', error);
    if (error instanceof LearnerAssignmentError) throw error;
    throw new LearnerAssignmentError(
      'Unexpected error in automatic assignment',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}
*/

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
