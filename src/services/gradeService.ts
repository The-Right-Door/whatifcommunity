import { supabase } from '../lib/supabase';

export interface Grade {
  grades_id: number;
  grade_no: number;
  grade_name: string;
}

export class GradeError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'GradeError';
  }
}

export async function fetchGrades(): Promise<Grade[]> {
  try {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .order('grade_no');

    if (error) {
      throw new GradeError(
        'Failed to fetch grades',
        error.code,
        { originalError: error }
      );
    }

    return data as Grade[];
  } catch (error) {
    if (error instanceof GradeError) throw error;
    throw new GradeError(
      'An unexpected error occurred while fetching grades',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}