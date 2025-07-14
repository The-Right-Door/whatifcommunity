import { supabase } from '../lib/supabase';
import { getStreamById } from './streamService';

export interface Classroom {
  classroom_id: number;
  classroom_name: string;
  grade_id: number;
  stream_id?: string;
  capacity?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ClassroomWithDetails {
  id: number;
  name: string;
  grade: string;
  stream?: string;
  teachersAssigned: number;
  learnersAssigned: number;
}

export interface ClassroomWithSubjects {
  classroom_id: number;
  classroom_name: string;
  grade_id: number;
  stream_id?: number;
  subjects: {
    subject_id: number;
    name: string;
  }[];
}


export class ClassroomError extends Error {
  constructor(message: string, public code?: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'ClassroomError';
  }
}

// Create a new classroom
export async function createClassroom(
  classroomName: string,
  gradeId: number,
  streamId: string
 // subjectId: number
): Promise<Classroom> {
  try {
    const classroomData: any = {
      classroom_name: classroomName,
      grade_id: gradeId,
       stream_id: streamId
 // subject_id: subjectId
    };
    
  /*
    // Add stream_id if provided
    if (streamId) {
      classroomData.stream_id = streamId;
    }
    */
    
    console.log('📝 Inserting classroom:', classroomData);
    
    const { data, error } = await supabase
      .from('classrooms')
      .insert([classroomData])
      .select();
     // .single();

    const createdClassroom = data[0]; // ✅ access the first inserted row
  //  console.log('📦 Created classroom:', data);
    console.log('just checking Herbert');

    if (error|| !data || data.length === 0) throw new ClassroomError('Failed to create classroom', error.code, error);
    return data[0];
  } catch (error) {
    console.error('Error creating classroom:', error);
    if (error instanceof ClassroomError) throw error;
    throw new ClassroomError('An unexpected error occurred while creating classroom', 'UNKNOWN_ERROR', { originalError: error });
  }
}

// Get all classrooms with details
export async function getAllClassrooms(): Promise<ClassroomWithDetails[]> {
  try {
    const { data: classrooms, error } = await supabase
      .from('classrooms')
      .select(`
        classroom_id,
        classroom_name,
        grade_id,
        stream_id,
        grades!inner(grade_no, grade_name)
      `);

    if (error) throw new ClassroomError('Failed to fetch classrooms', error.code, error);

    // For each classroom, get the count of teachers and learners
    const classroomsWithDetails = await Promise.all(
      classrooms.map(async (classroom) => {
        // Get teacher assignments count
        const { count: teachersCount, error: teachersError } = await supabase
          .from('classroom_teacher_subject')
          .select('assignment_id', { count: 'exact', head: true })
          .eq('classroom_id', classroom.classroom_id);

        if (teachersError) throw new ClassroomError('Failed to count teachers', teachersError.code, teachersError);

        // Get learners count
        const { count: learnersCount, error: learnersError } = await supabase
          .from('classroom_learners')
          .select('learner_id', { count: 'exact', head: true })
          .eq('classroom_id', classroom.classroom_id);

        if (learnersError) throw new ClassroomError('Failed to count learners', learnersError.code, learnersError);

        // Get stream name if stream_id exists
        let streamName = undefined;
        if (classroom.stream_id) {
          const stream = await getStreamById(classroom.stream_id);
          streamName = stream?.name;
        }

        return {
          id: classroom.classroom_id,
          name: classroom.classroom_name,
          grade: `${classroom.grades.grade_name || classroom.grades.grade_no}`,
          stream: streamName,
          teachersAssigned: teachersCount || 0,
          learnersAssigned: learnersCount || 0
        };
      })
    );

    return classroomsWithDetails;
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    if (error instanceof ClassroomError) throw error;
    throw new ClassroomError('An unexpected error occurred while fetching classrooms', 'UNKNOWN_ERROR', { originalError: error });
  }
}

// Get classrooms for a specific grade
export async function getClassroomsByGrade(gradeId: number): Promise<Classroom[]> {
  try {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('grade_id', gradeId);

    if (error) throw new ClassroomError('Failed to fetch classrooms by grade', error.code, error);
    return data;
  } catch (error) {
    console.error('Error fetching classrooms by grade:', error);
    if (error instanceof ClassroomError) throw error;
    throw new ClassroomError('An unexpected error occurred while fetching classrooms by grade', 'UNKNOWN_ERROR', { originalError: error });
  }
}

// Delete a classroom
export async function deleteClassroom(classroomId: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('classrooms')
      .delete()
      .eq('classroom_id', classroomId);

    if (error) throw new ClassroomError('Failed to delete classroom', error.code, error);
  } catch (error) {
    console.error('Error deleting classroom:', error);
    if (error instanceof ClassroomError) throw error;
    throw new ClassroomError('An unexpected error occurred while deleting classroom', 'UNKNOWN_ERROR', { originalError: error });
  }
}

export async function getClassroomsWithSubjects(): Promise<ClassroomWithSubjects[]> {
  try {
    const { data, error } = await supabase
      .from('classrooms')
      .select(`
        classroom_id,
        classroom_name,
        grade_id,
        stream_id,
        classroom_subject (
          subject_id,
          subjects (
            subjects_id,
            subjects_name
          )
        )
      `);

    if (error) {
      throw new TimetableServiceError('Failed to fetch classrooms with subjects', error.code, error);
    }

    console.log('📦 Raw Supabase classroom data:', data);
    return data.map(classroom => ({
      id: classroom.classroom_id,
      name: classroom.classroom_name,
      grade: classroom.grade_id,
      stream: classroom.stream_id || 'General',
      subjects: classroom.classroom_subject.map(cs => ({
        id: cs.subjects.subjects_id,
        name: cs.subjects.subjects_name
      }))
    }));
    
    /*
    return data.map(classroom => ({
  classroom_id: classroom.classroom_id,
  classroom_name: classroom.classroom_name,
  grade_id: classroom.grade_id,
  stream_id: classroom.stream_id,
  subjects: (classroom.classroom_subject || []).map(cs => ({
    id: cs.subjects?.subjects_id ?? cs.subject_id, // fallback to subject_id if join fails
    name: cs.subjects?.subjects_name ?? 'Unnamed'
  }))
}));
    */
  } catch (error) {
    throw new TimetableServiceError(
      'Failed to fetch classrooms with subjects',
      'FETCH_ERROR',
      { originalError: error }
    );
  }
}

//import { supabase } from '../lib/supabase';

export async function getTeachersForSubjectInClassroom(classroomId: number, subjectId: number) {
  try {
    console.log(`🔍 Fetching teachers for classroom ${classroomId} and subject ${subjectId}`);

    const { data, error } = await supabase
      .from('classroom_teacher_subject')
      .select(`
        teacher:teacher_id(user_id, first_name, last_name)
      `)
      .eq('classroom_id', classroomId)
      .eq('subject_id', subjectId);

    if (error) {
      console.error('❌ Supabase error fetching teachers:', error);
      return [];
    }

    return data.map(row => ({
      id: row.teacher.user_id,
      name: `${row.teacher.first_name} ${row.teacher.last_name}`
    }));
  } catch (error) {
    console.error('❌ Unexpected error in getTeachersForSubjectInClassroom:', error);
    return [];
  }
}
