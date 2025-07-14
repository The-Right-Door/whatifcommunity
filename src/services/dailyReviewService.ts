import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

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
  topics_status: string;
}

export interface Subtopic {
  subtopic_id: number;
  topic_id: number;
  subtopic_title: string;
  small_description?: string;
}

export interface DailyReview {
  review_id?: string;
  teacher_id?: string;
  title: string;
  description?: string;
  question_type: string;
  start_date: string;
  end_date: string;
  time_limit?: string;
  target_audience: 'class' | 'group' | 'individual';
  selected_learners?: number[];
  selected_groups?: number[];
  subtopics: number[];
  status: 'draft' | 'published';
}

export class DailyReviewError extends Error {
  constructor(message: string, public code?: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'DailyReviewError';
  }
}

// Fetch periods for a grade
export async function fetchPeriodsForGrade(gradeId: number): Promise<Period[]> {
  try {
    const { data, error } = await supabase
      .from('grades_periods')
      .select('periods(*)')
      .eq('grade_id', gradeId);

    if (error) throw new DailyReviewError('Failed to fetch periods', error.code, error);
    
    return data.map((item: any) => item.periods);
  } catch (error) {
    console.error('Error fetching periods:', error);
    if (error instanceof DailyReviewError) throw error;
    throw new DailyReviewError('An unexpected error occurred while fetching periods', 'UNKNOWN_ERROR', { originalError: error });
  }
}

// Fetch topics for a subject, grade, and period
export async function fetchTopicsForPeriod(subjectId: number, gradeId: number, periodId: number): Promise<Topic[]> {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('grade_id', gradeId)
      .eq('period_id', periodId);

    if (error) throw new DailyReviewError('Failed to fetch topics', error.code, error);
    
    return data;
  } catch (error) {
    console.error('Error fetching topics:', error);
    if (error instanceof DailyReviewError) throw error;
    throw new DailyReviewError('An unexpected error occurred while fetching topics', 'UNKNOWN_ERROR', { originalError: error });
  }
}

// Fetch subtopics for a topic
export async function fetchSubtopicsForTopic(topicId: number): Promise<Subtopic[]> {
  try {
    const { data, error } = await supabase
      .from('subtopics')
      .select('*')
      .eq('topic_id', topicId);

    if (error) throw new DailyReviewError('Failed to fetch subtopics', error.code, error);
    
    return data;
  } catch (error) {
    console.error('Error fetching subtopics:', error);
    if (error instanceof DailyReviewError) throw error;
    throw new DailyReviewError('An unexpected error occurred while fetching subtopics', 'UNKNOWN_ERROR', { originalError: error });
  }
}

// Create a daily review
export async function createDailyReview(reviewData: DailyReview): Promise<string> {
  try {
    // Validate required fields
    if (!reviewData.title) throw new DailyReviewError('Review title is required', 'VALIDATION_ERROR');
    if (!reviewData.start_date) throw new DailyReviewError('Start date is required', 'VALIDATION_ERROR');
    if (!reviewData.end_date) throw new DailyReviewError('End date is required', 'VALIDATION_ERROR');
    if (!reviewData.subtopics || reviewData.subtopics.length === 0) {
      throw new DailyReviewError('At least one subtopic must be selected', 'VALIDATION_ERROR');
    }

    // Insert review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert([{
        title: reviewData.title,
        description: reviewData.description || null,
        type: 'daily',
        status: reviewData.status,
        start_date: reviewData.start_date,
        end_date: reviewData.end_date,
        question_type: reviewData.question_type,
        time_limit: reviewData.time_limit,
        target_audience: reviewData.target_audience,
        selected_learners: reviewData.selected_learners || [],
        selected_groups: reviewData.selected_groups || []
      }])
      .select()
      .single();

    if (reviewError) throw new DailyReviewError('Failed to create review', reviewError.code, reviewError);

    // Insert review-subtopic relationships
    const reviewSubtopics = reviewData.subtopics.map(subtopicId => ({
      review_id: review.review_id,
      subtopic_id: subtopicId
    }));

    const { error: subtopicsError } = await supabase
      .from('review_subtopics')
      .insert(reviewSubtopics);

    if (subtopicsError) {
      // If subtopics insertion fails, delete the review
      await supabase.from('reviews').delete().eq('review_id', review.review_id);
      throw new DailyReviewError('Failed to add subtopics to review', subtopicsError.code, subtopicsError);
    }

    return review.review_id;
  } catch (error) {
    console.error('Error creating daily review:', error);
    if (error instanceof DailyReviewError) throw error;
    throw new DailyReviewError('An unexpected error occurred while creating the review', 'UNKNOWN_ERROR', { originalError: error });
  }
}

// Get all topics and subtopics for a subject and grade
export async function fetchAllTopicsAndSubtopics(subjectId: number, gradeId: number): Promise<{
  topics: Topic[];
  subtopicsByTopic: Record<number, Subtopic[]>;
}> {
  try {
    // Fetch all topics for the subject and grade
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('grade_id', gradeId);

    if (topicsError) throw new DailyReviewError('Failed to fetch topics', topicsError.code, topicsError);

    // Fetch subtopics for each topic
    const subtopicsByTopic: Record<number, Subtopic[]> = {};
    
    for (const topic of topics) {
      const { data: subtopics, error: subtopicsError } = await supabase
        .from('subtopics')
        .select('*')
        .eq('topic_id', topic.topics_id);
        
      if (subtopicsError) throw new DailyReviewError('Failed to fetch subtopics', subtopicsError.code, subtopicsError);
      
      subtopicsByTopic[topic.topics_id] = subtopics;
    }

    return { topics, subtopicsByTopic };
  } catch (error) {
    console.error('Error fetching topics and subtopics:', error);
    if (error instanceof DailyReviewError) throw error;
    throw new DailyReviewError('An unexpected error occurred', 'UNKNOWN_ERROR', { originalError: error });
  }
}