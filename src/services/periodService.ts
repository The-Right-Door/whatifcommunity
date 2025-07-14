import { supabase } from '../lib/supabase';

export interface Period {
  period_id: number;
  period_name: string;
  start_date: string;
  end_date: string;
  type: string;
  status: string;
}

export class PeriodError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'PeriodError';
  }
}

export async function fetchActivePeriods(gradeId: number): Promise<Period[]> {
  try {
    const { data, error } = await supabase
      .from('grades_periods')
      .select('periods!inner(*)')
      .eq('grade_id', gradeId)
      .eq('periods.status', 'active');

    if (error) {
      throw new PeriodError('Failed to fetch periods', error.code, { originalError: error });
    }

    if (!data) {
      return [];
    }

    return data.map((item: any) => item.periods);
  } catch (error) {
    if (error instanceof PeriodError) throw error;
    throw new PeriodError('An unexpected error occurred while fetching periods', 'UNKNOWN_ERROR', { originalError: error });
  }
}
