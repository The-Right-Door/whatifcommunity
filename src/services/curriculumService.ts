import { supabase } from '../lib/supabase';

// ---------- Types ---------- //

export interface Period {
  period_id: number;
  period_name: string;
  start_date: string;
  end_date: string;
  type: string;
  status: string;
}

export interface Topic {
  topics_id: number;
  topic: string;
  description?: string;
  start_date: string;
  end_date: string;
  period_id: number;
  grade_id: number;
  subject_id: number;
  topics_status: string;
  subtopics?: Subtopic[];
}

export interface Subtopic {
  subtopic_id: number;
  topic_id: number;
  subtopic_title: string;
  small_description?: string;
  full_explanation?: string;
  resources?: any[];
}

export class CurriculumError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'CurriculumError';
  }
}

// ---------- Fetch Functions ---------- //

export async function fetchPeriodsForGrade(gradeId: number): Promise<Period[]> {
  console.group('🔍 Fetching Periods');
  console.log('Grade ID:', gradeId);
  
  try {
    const { data, error } = await supabase
      .from('grades_periods')
      .select('periods(*)')
      .eq('grade_id', gradeId);

    if (error) {
      console.error('❌ Error fetching periods:', error);
      throw new CurriculumError('Failed to load periods', 'PERIODS_FETCH_ERROR', { gradeId, originalError: error });
    }

    const periods = data.map((item: any) => item.periods) as Period[];
    periods.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

    console.log(`✅ Successfully fetched ${periods.length} periods`);
    console.groupEnd();
    return periods;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.groupEnd();
    if (error instanceof CurriculumError) throw error;
    throw new CurriculumError('Unexpected error fetching periods', 'UNKNOWN_ERROR', { originalError: error });
  }
}

export async function fetchTopicsForSubjectGradePeriod(
  subjectId: number,
  gradeId: number,
  periodId: number
): Promise<Topic[]> {
  console.group('🔍 Fetching Topics');
  console.log('Parameters:', { subjectId, gradeId, periodId });

  try {
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('grade_id', gradeId)
      .eq('period_id', periodId)
      .or('topics_status.eq.active,topics_status.eq.published')
      .order('start_date', { ascending: true });

    if (topicsError) {
      console.error('❌ Topics fetch error:', topicsError);
      throw new CurriculumError('Failed to load topics', 'TOPICS_FETCH_ERROR', {
        subjectId,
        gradeId,
        periodId,
        originalError: topicsError
      });
    }

    console.log(`📚 Found ${topics.length} topics`);
    console.groupEnd();
    return topics as Topic[];
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.groupEnd();
    if (error instanceof CurriculumError) throw error;
    throw new CurriculumError('Unexpected error fetching topics', 'UNKNOWN_ERROR', { originalError: error });
  }
}

export async function fetchSubtopicsForTopic(topicId: number): Promise<Subtopic[]> {
  console.group('🔍 Fetching Subtopics');
  console.log('Topic ID:', topicId);

  try {
    const { data, error } = await supabase
      .from('subtopics')
      .select('*')
      .eq('topic_id', topicId)
      .order('subtopic_id', { ascending: true });

    if (error) {
      console.error('❌ Subtopics fetch error:', error);
      throw new CurriculumError('Failed to load subtopics', 'SUBTOPICS_FETCH_ERROR', {
        topicId,
        originalError: error
      });
    }

    console.log(`📖 Found ${data.length} subtopics`);
    console.groupEnd();
    return data as Subtopic[];
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.groupEnd();
    if (error instanceof CurriculumError) throw error;
    throw new CurriculumError('Unexpected error fetching subtopics', 'UNKNOWN_ERROR', { originalError: error });
  }
}

export async function fetchCurriculum(subjectName: string, gradeParam: string) {
  console.group('📚 Fetching Complete Curriculum');
  console.log('Parameters:', { subjectName, gradeParam });

  try {
    // Get grade ID
    const gradeNumber = gradeParam.replace('grade-', '');
    const { data: gradeData, error: gradeError } = await supabase
      .from('grades')
      .select('*')
      .eq('grade_no', gradeNumber)
      .single();

    if (gradeError || !gradeData) {
      throw new CurriculumError('Grade not found', 'GRADE_NOT_FOUND', {
        gradeNumber,
        originalError: gradeError
      });
    }

    const gradeId = gradeData.grades_id;
    console.log('✅ Found grade:', { id: gradeId, number: gradeNumber });

    // Get subject ID
    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
      .ilike('subjects_name', subjectName)
      .single();

    if (subjectError || !subjectData) {
      throw new CurriculumError('Subject not found', 'SUBJECT_NOT_FOUND', {
        subjectName,
        originalError: subjectError
      });
    }

    const subjectId = subjectData.subjects_id;
    console.log('✅ Found subject:', { id: subjectId, name: subjectName });

    // Get periods and build curriculum structure
    const periods = await fetchPeriodsForGrade(gradeId);
    const topicsByPeriod: Record<number, Topic[]> = {};

    for (const period of periods) {
      console.group(`Processing Period: ${period.period_name}`);
      try {
        const topics = await fetchTopicsForSubjectGradePeriod(subjectId, gradeId, period.period_id);

        if (topics.length === 0) {
          console.log('⚠️ No topics for this period');
          continue; // ✅ Skip period if no topics
        }

        const topicsWithSubtopics = await Promise.all(
          topics.map(async (topic) => {
            const subtopics = await fetchSubtopicsForTopic(topic.topics_id);
            return { ...topic, subtopics };
          })
        );

        topicsByPeriod[period.period_id] = topicsWithSubtopics;
        console.log(`✅ Added ${topicsWithSubtopics.length} topics`);
      } catch (error) {
        console.error(`❌ Error processing period ${period.period_id}:`, error);
        topicsByPeriod[period.period_id] = [];
      }
      console.groupEnd();
    }

    console.log('✅ Complete curriculum structure built');
    console.groupEnd();
    return { gradeId, subjectId, periods, topicsByPeriod };
  } catch (error) {
    console.error('❌ Error in fetchCurriculum:', error);
    console.groupEnd();
    if (error instanceof CurriculumError) throw error;
    throw new CurriculumError('Failed to fetch curriculum', 'CURRICULUM_FETCH_ERROR', {
      originalError: error
    });
  }
}
