import { supabase } from '../lib/supabase';

export interface TeacherAssignment {
  assignment_id?: string;
  classroom_id: number;
  teacher_id: string;
  subject_id: number;
  created_at?: string;
  updated_at?: string;
}

export class TeacherAssignmentError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'TeacherAssignmentError';
  }
}

// Assign a teacher to a classroom with a specific subject
export async function assignTeacherToClassroom(
  assignment: Omit<TeacherAssignment, 'assignment_id' | 'created_at' | 'updated_at'>
): Promise<TeacherAssignment> {
  try {
    // Check if the assignment already exists
    console.log('📦 classroom_id:', assignment.classroom_id);
    console.log('👨‍🏫 teacher_id:', assignment.teacher_id);
    console.log('📘 subject_id:', assignment.subject_id);

    // Defensive check
    if (!assignment.classroom_id || !assignment.teacher_id || !assignment.subject_id) {
      throw new TeacherAssignmentError(
        'Invalid input: classroom_id, teacher_id, and subject_id are required',
        'INVALID_INPUT'
      );
    }

    console.log('🔍 Checking for existing teacher assignment:', assignment);
    const { data: existingAssignment, error: checkError } = await supabase
      .from('classroom_teacher_subject')
      .select('*')
      .eq('classroom_id', assignment.classroom_id)
      .eq('subject_id', assignment.subject_id)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw new TeacherAssignmentError('Failed to check existing assignment', checkError.code, checkError);
    }

    if (existingAssignment) {
      throw new TeacherAssignmentError('This subject is already assigned to a teacher for this classroom', 'DUPLICATE_ASSIGNMENT');
    }

    console.log('📝 Inserting new teacher assignment:', assignment);
    // Insert the new assignment
    const { data, error } = await supabase
      .from('classroom_teacher_subject')
      .insert([assignment])
      .select()
      .single();

    if (error) {
      throw new TeacherAssignmentError('Failed to assign teacher to classroom', error.code, error);
    }
    console.log('✅ Teacher assignment created successfully:', data);
    return data as TeacherAssignment;
  } catch (error) {
    if (error instanceof TeacherAssignmentError) throw error;
    throw new TeacherAssignmentError(
      'An unexpected error occurred while assigning teacher',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

// Remove a teacher assignment
export async function removeTeacherAssignment(assignmentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('classroom_teacher_subject')
      .delete()
      .eq('assignment_id', assignmentId);

    if (error) {
      throw new TeacherAssignmentError('Failed to remove teacher assignment', error.code, error);
    }
  } catch (error) {
    if (error instanceof TeacherAssignmentError) throw error;
    throw new TeacherAssignmentError(
      'An unexpected error occurred while removing teacher assignment',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

// Get all teacher assignments for a classroom
export async function getTeacherAssignmentsForClassroom(classroomId: number): Promise<TeacherAssignment[]> {
  try {
    const { data, error } = await supabase
      .from('classroom_teacher_subject')
      .select(`
        *,
        teachers:teacher_id(first_name, last_name),
        subjects:subject_id(subjects_name)
      `)
      .eq('classroom_id', classroomId);

    if (error) {
      throw new TeacherAssignmentError('Failed to fetch teacher assignments', error.code, error);
    }

    return data as unknown as TeacherAssignment[];
  } catch (error) {
    if (error instanceof TeacherAssignmentError) throw error;
    throw new TeacherAssignmentError(
      'An unexpected error occurred while fetching teacher assignments',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}