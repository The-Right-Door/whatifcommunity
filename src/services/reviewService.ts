import { supabase } from '../lib/supabase';
import { ReviewQuestion } from './ReviewPersistenceService';

export interface ReviewData {
  title: string;
  description?: string;
  questionType: string;
  difficultyLevel: string;
  examStyle: string;
  includeHints: boolean;
  subtopicIds?: number[];
}

export class ReviewServiceError extends Error {
  constructor(message: string, public code?: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'ReviewServiceError';
  }
}

/**
 * Saves a review and its questions to the database
 */
export async function saveReview(
  reviewData: ReviewData,
  generatedContent: string,
  questions: ReviewQuestion[]
): Promise<string> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new ReviewServiceError('Authentication required', 'AUTH_REQUIRED');
    }
    
    // Insert review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert([{
        teacher_id: user.id,
        title: reviewData.title,
        description: reviewData.description || null,
        status: 'published',
        question_type: reviewData.questionType,
        difficulty_level: reviewData.difficultyLevel,
        exam_style: reviewData.examStyle,
        include_hints: reviewData.includeHints,
        content: generatedContent
      }])
      .select()
      .single();

    if (reviewError) {
      throw new ReviewServiceError('Failed to create review', reviewError.code, reviewError);
    }

    // Insert review-subtopic relationships
    if (reviewData.subtopicIds && reviewData.subtopicIds.length > 0) {
      const reviewSubtopics = reviewData.subtopicIds.map(subtopicId => ({
        review_id: review.review_id,
        subtopic_id: subtopicId
      }));

      const { error: subtopicsError } = await supabase
        .from('review_subtopics')
        .insert(reviewSubtopics);

      if (subtopicsError) {
        // If subtopics insertion fails, delete the review
        await supabase.from('reviews').delete().eq('review_id', review.review_id);
        throw new ReviewServiceError('Failed to add subtopics to review', subtopicsError.code, subtopicsError);
      }
    }

    // Insert questions
    if (Array.isArray(questions) && questions.length > 0){
      const questionsToInsert = questions.map((question, index) => ({
        review_id: review.review_id,
        question_number: index + 1,
        question_text: question.question,
        options: question.options || null,
        correct_answer: question.answer || null,
        explanation: question.explanation || null,
        hint: question.hint || null
      }));

      const { error: questionsError } = await supabase
        .from('review_questions')
        .insert(questionsToInsert);

      if (questionsError) {
        console.error('Error inserting questions:', questionsError);
        // We don't throw here to avoid losing the review if questions fail
      }
    }

    return review.review_id;
  } catch (error) {
    console.error('Error saving review:', error);
    if (error instanceof ReviewServiceError) throw error;
    throw new ReviewServiceError('Failed to save review', undefined, { originalError: error });
  }
}

/**
 * Retrieves a review with its questions
 */
export async function getReviewWithQuestions(reviewId: string): Promise<{
  review: any;
  questions: ReviewQuestion[];
}> {
  try {
    // Get review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('*')
      .eq('review_id', reviewId)
      .single();

    if (reviewError) {
      throw new ReviewServiceError('Failed to fetch review', reviewError.code, reviewError);
    }

    // Get questions
    const { data: questions, error: questionsError } = await supabase
      .from('review_questions')
      .select('*')
      .eq('review_id', reviewId)
      .order('question_number', { ascending: true });

    if (questionsError) {
      throw new ReviewServiceError('Failed to fetch questions', questionsError.code, questionsError);
    }

    // Transform questions to ReviewQuestion format
    const formattedQuestions: ReviewQuestion[] = questions.map(q => ({
      question: q.question_text,
      options: q.options,
      answer: q.correct_answer,
      explanation: q.explanation,
      hint: q.hint
    }));

    return { review, questions: formattedQuestions };
  } catch (error) {
    console.error('Error fetching review with questions:', error);
    if (error instanceof ReviewServiceError) throw error;
    throw new ReviewServiceError('Failed to fetch review', undefined, { originalError: error });
  }
}

/**
 * Updates an existing review
 */
export async function updateReview(
  reviewId: string,
  updates: Partial<ReviewData>,
  updatedContent?: string,
  updatedQuestions?: ReviewQuestion[]
): Promise<void> {
  try {
    // Update review
    const reviewUpdates: Record<string, any> = {};
    
    if (updates.title) reviewUpdates.title = updates.title;
    if (updates.description !== undefined) reviewUpdates.description = updates.description || null;
    if (updates.difficultyLevel) reviewUpdates.difficulty_level = updates.difficultyLevel;
    if (updates.examStyle) reviewUpdates.exam_style = updates.examStyle;
    if (updates.includeHints !== undefined) reviewUpdates.include_hints = updates.includeHints;
    if (updatedContent) reviewUpdates.content = updatedContent;

    if (Object.keys(reviewUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from('reviews')
        .update(reviewUpdates)
        .eq('review_id', reviewId);

      if (updateError) {
        throw new ReviewServiceError('Failed to update review', updateError.code, updateError);
      }
    }

    // Update subtopics if provided
    if (updates.subtopicIds && updates.subtopicIds.length > 0) {
      // Delete existing subtopic relationships
      const { error: deleteError } = await supabase
        .from('review_subtopics')
        .delete()
        .eq('review_id', reviewId);

      if (deleteError) {
        throw new ReviewServiceError('Failed to update subtopics', deleteError.code, deleteError);
      }

      // Insert new subtopic relationships
      const reviewSubtopics = updates.subtopicIds.map(subtopicId => ({
        review_id: reviewId,
        subtopic_id: subtopicId
      }));

      const { error: insertError } = await supabase
        .from('review_subtopics')
        .insert(reviewSubtopics);

      if (insertError) {
        throw new ReviewServiceError('Failed to update subtopics', insertError.code, insertError);
      }
    }

    // Update questions if provided
    if (updatedQuestions && updatedQuestions.length > 0) {
      // Delete existing questions
      const { error: deleteError } = await supabase
        .from('review_questions')
        .delete()
        .eq('review_id', reviewId);

      if (deleteError) {
        throw new ReviewServiceError('Failed to update questions', deleteError.code, deleteError);
      }

      // Insert new questions
      const questionsToInsert = updatedQuestions.map((question, index) => ({
        review_id: reviewId,
        question_number: index + 1,
        question_text: question.question,
        options: question.options || null,
        correct_answer: question.answer || null,
        explanation: question.explanation || null,
        hint: question.hint || null
      }));

      const { error: insertError } = await supabase
        .from('review_questions')
        .insert(questionsToInsert);

      if (insertError) {
        throw new ReviewServiceError('Failed to update questions', insertError.code, insertError);
      }
    }
  } catch (error) {
    console.error('Error updating review:', error);
    if (error instanceof ReviewServiceError) throw error;
    throw new ReviewServiceError('Failed to update review', undefined, { originalError: error });
  }
}

/**
 * Deletes a review and all associated data
 */
export async function deleteReview(reviewId: string): Promise<void> {
  try {
    // Delete review (cascades to review_subtopics and review_questions)
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('review_id', reviewId);

    if (error) {
      throw new ReviewServiceError('Failed to delete review', error.code, error);
    }
  } catch (error) {
    console.error('Error deleting review:', error);
    if (error instanceof ReviewServiceError) throw error;
    throw new ReviewServiceError('Failed to delete review', undefined, { originalError: error });
  }
}