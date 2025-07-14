import { supabase } from '../lib/supabase';
//import { getAllClassrooms } from './classroomService';
import { getClassroomsWithSubjects, getTeachersForSubjectInClassroom  } from './classroomService';

export interface TimetableConfig {
  teachingDays: string[];
  periodDuration: string;
  periodsPerDay: number;
  customPeriods?: { startTime: string; endTime: string }[];
  startTime?: string;
  lunchPeriodAfter?: number;
  lunchDuration?: number;
}

export interface TimetableSlot {
  id: number;
  day: string;
  period: number;
  startTime: string;
  endTime: string;
  subject?: string;
  teacher?: string;
}

export interface ClassroomTimetable {
  classroomId: number;
  slots: TimetableSlot[];
}

export class TimetableServiceError extends Error {
  constructor(message: string, public code?: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'TimetableServiceError';
  }
}

/**
 * Fetches all classrooms for timetable management
 */
export async function getClassroomsForTimetable() {
  return await getClassroomsWithSubjects();
}

export async function getTeachersForSubjectInClassroomForTimetable(
  classroomId: number,
  subjectId: number
) {
  return await getTeachersForSubjectInClassroom(classroomId, subjectId);
}
/**
*fetches teachers for classroom and subject
*/
/*
export async function getTeachersForSubjectInClassroomForTimetable(){
  return await getTeachersForSubjectInClassroom();
}

*/


/**
 * Fetches timetable for a specific classroom
 */
export async function getTimetableForClassroom(classroomId: number): Promise<TimetableSlot[]> {
  try {
    console.log(`🔍 Fetching timetable for classroom ID: ${classroomId}`);
    
    const { data, error } = await supabase
      .from('classroom_timetable')
      .select(`
        id,
        day,
        period,
        start_time,
        end_time,
        classroom_teacher_subject!inner(
          subject:subject_id(subjects_name),
          teacher:teacher_id(first_name, last_name)
        )
      `)
      .eq('classroom_id', classroomId);
    
    if (error) {
      throw new TimetableServiceError('Failed to fetch timetable', error.code, error);
    }
    
    // Transform the data to match the TimetableSlot interface
    return data.map(slot => ({
      id: slot.id,
      day: slot.day,
      period: slot.period,
      startTime: slot.start_time,
      endTime: slot.end_time,
      subject: slot.classroom_teacher_subject?.subject?.subjects_name,
      teacher: slot.classroom_teacher_subject?.teacher 
        ? `${slot.classroom_teacher_subject.teacher.first_name} ${slot.classroom_teacher_subject.teacher.last_name}`
        : undefined
    }));
  } catch (error) {
    console.error(`❌ Error fetching timetable for classroom ${classroomId}:`, error);
    
    // If the error is because the table doesn't exist yet, return an empty array
    if (error instanceof TimetableServiceError && 
        error.details?.originalError?.code === '42P01') { // PostgreSQL code for undefined_table
      console.log('⚠️ Timetable table does not exist yet, returning empty array');
      return [];
    }
    
    throw new TimetableServiceError(
      'Failed to fetch classroom timetable',
      'FETCH_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Saves a timetable slot
 */
export async function saveTimetableSlot(
  classroomId: number,
  slot: Omit<TimetableSlot, 'id'> & { teacherId: string; subjectId: number }
): Promise<TimetableSlot> {
  try {
    console.log(`🔍 Saving timetable slot for classroom ID: ${classroomId}`);
    
    // First, check if there's already a teacher assignment for this classroom and subject
    const { data: existingAssignment, error: assignmentError } = await supabase
      .from('classroom_teacher_subject')
      .select('assignment_id')
      .eq('classroom_id', classroomId)
      .eq('subject_id', slot.subjectId)
      .eq('teacher_id', slot.teacherId)
      .maybeSingle();
    
    let assignmentId: string;
    
    if (assignmentError && assignmentError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new TimetableServiceError('Failed to check existing assignment', assignmentError.code, assignmentError);
    }
    
    // If no existing assignment, create one
    if (!existingAssignment) {
      const { data: newAssignment, error: insertError } = await supabase
        .from('classroom_teacher_subject')
        .insert([{
          classroom_id: classroomId,
          subject_id: slot.subjectId,
          teacher_id: slot.teacherId
        }])
        .select()
        .single();
      
      if (insertError) {
        throw new TimetableServiceError('Failed to create teacher assignment', insertError.code, insertError);
      }
      
      assignmentId = newAssignment.assignment_id;
    } else {
      assignmentId = existingAssignment.assignment_id;
    }
    
    // Now save the timetable slot
    const { data: timetableSlot, error: slotError } = await supabase
      .from('classroom_timetable')
      .insert([{
        classroom_id: classroomId,
        day: slot.day,
        period: slot.period,
        start_time: slot.startTime,
        end_time: slot.endTime,
        assignment_id: assignmentId
      }])
      .select()
      .single();
    
    if (slotError) {
      throw new TimetableServiceError('Failed to save timetable slot', slotError.code, slotError);
    }
    
    // Return the saved slot with the expected format
    return {
      id: timetableSlot.id,
      day: timetableSlot.day,
      period: timetableSlot.period,
      startTime: timetableSlot.start_time,
      endTime: timetableSlot.end_time,
      subject: slot.subject,
      teacher: slot.teacher
    };
  } catch (error) {
    console.error(`❌ Error saving timetable slot for classroom ${classroomId}:`, error);
    throw new TimetableServiceError(
      'Failed to save timetable slot',
      'SAVE_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Deletes a timetable slot
 */
export async function deleteTimetableSlot(slotId: number): Promise<void> {
  try {
    console.log(`🔍 Deleting timetable slot ID: ${slotId}`);
    
    const { error } = await supabase
      .from('classroom_timetable')
      .delete()
      .eq('id', slotId);
    
    if (error) {
      throw new TimetableServiceError('Failed to delete timetable slot', error.code, error);
    }
  } catch (error) {
    console.error(`❌ Error deleting timetable slot ${slotId}:`, error);
    throw new TimetableServiceError(
      'Failed to delete timetable slot',
      'DELETE_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Clears all timetable slots for a classroom
 */
export async function clearTimetableForClassroom(classroomId: number): Promise<void> {
  try {
    console.log(`🔍 Clearing timetable for classroom ID: ${classroomId}`);
    
    const { error } = await supabase
      .from('classroom_timetable')
      .delete()
      .eq('classroom_id', classroomId);
    
    if (error) {
      throw new TimetableServiceError('Failed to clear timetable', error.code, error);
    }
  } catch (error) {
    console.error(`❌ Error clearing timetable for classroom ${classroomId}:`, error);
    throw new TimetableServiceError(
      'Failed to clear timetable',
      'CLEAR_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Copies timetable from one classroom to another
 */
export async function copyTimetable(sourceClassroomId: number, targetClassroomId: number): Promise<void> {
  try {
    console.log(`🔍 Copying timetable from classroom ${sourceClassroomId} to ${targetClassroomId}`);
    
    // First, get the source timetable
    const sourceSlots = await getTimetableForClassroom(sourceClassroomId);
    
    if (sourceSlots.length === 0) {
      throw new TimetableServiceError('Source classroom has no timetable to copy', 'EMPTY_SOURCE');
    }
    
    // Clear the target timetable
    await clearTimetableForClassroom(targetClassroomId);
    
    // For each slot in the source, create a corresponding slot in the target
    for (const slot of sourceSlots) {
      // We need to get the subject ID and teacher ID
      const { data: assignment, error: assignmentError } = await supabase
        .from('classroom_teacher_subject')
        .select('subject_id, teacher_id')
        .eq('classroom_id', sourceClassroomId)
        .eq('assignment_id', slot.id)
        .single();
      
      if (assignmentError) {
        console.warn(`⚠️ Could not find assignment for slot ${slot.id}, skipping`);
        continue;
      }
      
      // Save the slot to the target classroom
      await saveTimetableSlot(targetClassroomId, {
        day: slot.day,
        period: slot.period,
        startTime: slot.startTime,
        endTime: slot.endTime,
        subject: slot.subject,
        teacher: slot.teacher,
        subjectId: assignment.subject_id,
        teacherId: assignment.teacher_id
      });
    }
  } catch (error) {
    console.error(`❌ Error copying timetable from ${sourceClassroomId} to ${targetClassroomId}:`, error);
    throw new TimetableServiceError(
      'Failed to copy timetable',
      'COPY_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Saves timetable configuration
 */
export async function saveTimetableConfig(config: TimetableConfig): Promise<void> {
  try {
    console.log('🔍 Saving timetable configuration');
    
    const { error } = await supabase
      .from('timetable_config')
      .upsert([{
        id: 1, // Single configuration record
        teaching_days: config.teachingDays,
        period_duration: config.periodDuration,
        periods_per_day: config.periodsPerDay,
        custom_periods: config.customPeriods || null,
        start_time: config.startTime || null,
        lunch_period_after: config.lunchPeriodAfter || null,
        lunch_duration: config.lunchDuration || null
      }]);
    
    if (error) {
      throw new TimetableServiceError('Failed to save timetable configuration', error.code, error);
    }
  } catch (error) {
    console.error('❌ Error saving timetable configuration:', error);
    throw new TimetableServiceError(
      'Failed to save timetable configuration',
      'SAVE_CONFIG_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Gets the current timetable configuration
 */
export async function getTimetableConfig(): Promise<TimetableConfig | null> {
  try {
    console.log('🔍 Fetching timetable configuration');
    
    const { data, error } = await supabase
      .from('timetable_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    
    if (error) {
      throw new TimetableServiceError('Failed to fetch timetable configuration', error.code, error);
    }
    
    if (!data) {
      return null;
    }
    
    return {
      teachingDays: data.teaching_days,
      periodDuration: data.period_duration,
      periodsPerDay: data.periods_per_day,
      customPeriods: data.custom_periods,
      startTime: data.start_time,
      lunchPeriodAfter: data.lunch_period_after,
      lunchDuration: data.lunch_duration
    };
  } catch (error) {
    console.error('❌ Error fetching timetable configuration:', error);
    throw new TimetableServiceError(
      'Failed to fetch timetable configuration',
      'FETCH_CONFIG_ERROR',
      { originalError: error }
    );
  }
}

/**
* Gets the classrooms where this teacher is assigned
 */
export async function getClassroomsForTeacher(teacherId: string): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from('classroom_teacher_subject')
      .select('classroom_id')
      .eq('teacher_id', teacherId);

    if (error) {
      throw new TimetableServiceError('Failed to fetch classrooms for teacher', error.code, error);
    }

    const classroomIds = data.map((record) => record.classroom_id);
    return [...new Set(classroomIds)]; // Remove duplicates
  } catch (error) {
    console.error('❌ Error fetching classrooms for teacher:', error);
    throw new TimetableServiceError('Failed to fetch classrooms for teacher', 'FETCH_TEACHER_CLASSROOMS', { originalError: error });
  }
}
