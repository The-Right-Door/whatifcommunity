import { supabase } from '../lib/supabase';

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  profile_image_url: string;
  achievements: string;
  experience: string;
  rating: number;
  students: number;
}

export interface DBTeacher {
  first_name: string;
  last_name: string;
  profile_image_url: string | null;
  subjects_majored: string[] | null;
  achievements: string | null;
  experience: string | null;
}

export class TeacherError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'TeacherError';
  }
}

export async function fetchTeachers(): Promise<Teacher[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('first_name, last_name, profile_image_url, subjects_majored, achievements, experience')
      .eq('role', 'teacher');

    if (error) {
      throw new TeacherError(
        'Failed to fetch teachers',
        error.code,
        { originalError: error }
      );
    }

    // Transform DB data to Teacher interface
    const teachers = data.map((teacher: DBTeacher, index: number): Teacher => ({
      id: `${teacher.first_name}_${teacher.last_name}_${index}`,
      name: `${teacher.first_name} ${teacher.last_name}`,
      subject: teacher.subjects_majored?.[0] || 'N/A',
      profile_image_url: teacher.profile_image_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80',
      achievements: teacher.achievements || 'No achievements listed',
      experience: teacher.experience || 'Experience not provided',
      rating: 4.8, // Default rating
      students: 200 // Default student count
    }));

    return teachers;
  } catch (error) {
    if (error instanceof TeacherError) throw error;
    throw new TeacherError(
      'An unexpected error occurred while fetching teachers',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}