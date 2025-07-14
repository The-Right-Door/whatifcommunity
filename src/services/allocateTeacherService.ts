import { supabase } from '../lib/supabase';

export interface TeacherAllocation {
  classroom_id: number;
  teacher_id: string;
  subject_id: number;
}

export class TeacherAllocationError extends Error {
  constructor(message: string, public code?: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'TeacherAllocationError';
  }
}

/**
 * Allocates multiple teachers to multiple classrooms for specific subjects
 */
export async function allocateTeachersToClassrooms(
  teacherIds: string[],
  classroomIds: number[],
  subjectId: number
): Promise<void> {
  try {
    console.log('🔍 Starting teacher allocation process');
    console.log('👨‍🏫 Teachers:', teacherIds);
    console.log('🏫 Classrooms:', classroomIds);
    console.log('📚 Subject ID:', subjectId);

    if (!teacherIds.length || !classroomIds.length) {
      throw new TeacherAllocationError('Teachers and classrooms are required', 'VALIDATION_ERROR');
    }

    // Create allocation records for each teacher-classroom combination
    const allocations: TeacherAllocation[] = [];
    
    for (const teacherId of teacherIds) {
      for (const classroomId of classroomIds) {
        allocations.push({
          classroom_id: classroomId,
          teacher_id: teacherId,
          subject_id: subjectId
        });
      }
    }

    console.log(`📝 Creating ${allocations.length} teacher allocations`);

    // Use upsert to handle potential duplicates
    const { error } = await supabase
      .from('classroom_teacher_subject')
      .upsert(allocations, {
        onConflict: 'classroom_id,subject_id,teacher_id',
        ignoreDuplicates: true
      });

    if (error) {
      console.error('❌ Error allocating teachers:', error);
      throw new TeacherAllocationError(
        'Failed to allocate teachers to classrooms',
        error.code,
        error
      );
    }

    console.log('✅ Teachers successfully allocated to classrooms');
  } catch (error) {
    console.error('❌ Error in allocateTeachersToClassrooms:', error);
    if (error instanceof TeacherAllocationError) throw error;
    throw new TeacherAllocationError(
      'An unexpected error occurred during teacher allocation',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Gets all teacher allocations
 */
export async function getTeacherAllocations(): Promise<any[]> {
  try {
    console.log('🔍 Fetching all teacher allocations');
    
    const { data, error } = await supabase
      .from('classroom_teacher_subject')
      .select(`
        assignment_id,
        classroom_id,
        subject_id,
        teacher_id,
        classrooms:classroom_id(classroom_name, grade_id),
        subjects:subject_id(subjects_name),
        teachers:teacher_id(first_name, last_name)
      `);

    if (error) {
      console.error('❌ Error fetching teacher allocations:', error);
      throw new TeacherAllocationError(
        'Failed to fetch teacher allocations',
        error.code,
        error
      );
    }

    console.log(`✅ Found ${data.length} teacher allocations`);
    return data;
  } catch (error) {
    console.error('❌ Error in getTeacherAllocations:', error);
    if (error instanceof TeacherAllocationError) throw error;
    throw new TeacherAllocationError(
      'An unexpected error occurred while fetching teacher allocations',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Gets teacher allocations for a specific teacher
 */
export async function getTeacherAllocationsByTeacher(teacherId: string): Promise<any[]> {
  try {
    console.log(`🔍 Fetching allocations for teacher: ${teacherId}`);
    
    const { data, error } = await supabase
      .from('classroom_teacher_subject')
      .select(`
        assignment_id,
        classroom_id,
        subject_id,
        classrooms:classroom_id(classroom_name, grade_id),
        subjects:subject_id(subjects_name)
      `)
      .eq('teacher_id', teacherId);

    if (error) {
      console.error('❌ Error fetching teacher allocations:', error);
      throw new TeacherAllocationError(
        'Failed to fetch teacher allocations',
        error.code,
        error
      );
    }

    console.log(`✅ Found ${data.length} allocations for teacher ${teacherId}`);
    return data;
  } catch (error) {
    console.error(`❌ Error in getTeacherAllocationsByTeacher for ${teacherId}:`, error);
    if (error instanceof TeacherAllocationError) throw error;
    throw new TeacherAllocationError(
      'An unexpected error occurred while fetching teacher allocations',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Gets teacher allocations for a specific classroom
 */
export async function getTeacherAllocationsByClassroom(classroomId: number): Promise<any[]> {
  try {
    console.log(`🔍 Fetching allocations for classroom: ${classroomId}`);
    
    const { data, error } = await supabase
      .from('classroom_teacher_subject')
      .select(`
        assignment_id,
        subject_id,
        teacher_id,
        subjects:subject_id(subjects_name),
        teachers:teacher_id(first_name, last_name)
      `)
      .eq('classroom_id', classroomId);

    if (error) {
      console.error('❌ Error fetching classroom allocations:', error);
      throw new TeacherAllocationError(
        'Failed to fetch classroom allocations',
        error.code,
        error
      );
    }

    console.log(`✅ Found ${data.length} allocations for classroom ${classroomId}`);
    return data;
  } catch (error) {
    console.error(`❌ Error in getTeacherAllocationsByClassroom for ${classroomId}:`, error);
    if (error instanceof TeacherAllocationError) throw error;
    throw new TeacherAllocationError(
      'An unexpected error occurred while fetching classroom allocations',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Removes a teacher allocation
 */
export async function removeTeacherAllocation(assignmentId: string): Promise<void> {
  try {
    console.log(`🔍 Removing teacher allocation: ${assignmentId}`);
    
    const { error } = await supabase
      .from('classroom_teacher_subject')
      .delete()
      .eq('assignment_id', assignmentId);

    if (error) {
      console.error('❌ Error removing teacher allocation:', error);
      throw new TeacherAllocationError(
        'Failed to remove teacher allocation',
        error.code,
        error
      );
    }

    console.log(`✅ Successfully removed teacher allocation ${assignmentId}`);
  } catch (error) {
    console.error(`❌ Error in removeTeacherAllocation for ${assignmentId}:`, error);
    if (error instanceof TeacherAllocationError) throw error;
    throw new TeacherAllocationError(
      'An unexpected error occurred while removing teacher allocation',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}