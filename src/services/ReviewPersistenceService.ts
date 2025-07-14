import { supabase } from '../lib/supabase';

export interface ReviewQuestion {
  question: string;
  options?: string[];
  answer?: string | number;
  explanation?: string;
  hint?: string;
}

export interface ReviewData {
  title: string;
  description: string;
  questionType: string;
  subtopicIds: number[];
  difficultyLevel: string;
  examStyle: string;
  includeHints: boolean;
}

export class ReviewPersistenceError extends Error {
  constructor(message: string, public code?: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'ReviewPersistenceError';
  }
}

/**
 * Extracts questions from the AI-generated review content
 * This function attempts to parse different formats of AI responses
 */
export function extractQuestionsFromContent(content: string): ReviewQuestion[] {
  console.log('🔍 Extracting questions from content:', content?.substring(0, 200) + '...');

  try {
    if (!content || typeof content !== 'string') {
      console.warn('⚠️ Invalid content provided to extractQuestionsFromContent');
      return [];
    }

    const questions: ReviewQuestion[] = [];

    // Try JSON block format (like { "question": "...", "options": [...], "answer": "..." })
    const blockMatches = content.match(/\{\s*"question":[\s\S]*?\}/g);

    if (blockMatches) {
      console.log(`📦 Found ${blockMatches.length} JSON-like question blocks`);
      for (const block of blockMatches) {
        try {
          const parsed = JSON.parse(block);
          if (parsed.question && parsed.answer) {
            questions.push(parsed);
          }
        } catch (err) {
          console.warn('⚠️ Failed to parse block:', block, err);
        }
      }
    }

    if (questions.length > 0) {
      console.log('✅ Parsed from JSON-like blocks:', questions.length);
      return questions;
    }

    // Fallback: Match multiple-choice format
    console.log('🔍 Trying to match MCQ pattern');
    const mcqRegex = /(\d+\.\s*.*?)\s*A\.\s*(.*?)\s*B\.\s*(.*?)\s*C\.\s*(.*?)\s*D\.\s*(.*?)\s*Answer:?\s*([A-D])/gs;
    let mcqMatch;
    while ((mcqMatch = mcqRegex.exec(content)) !== null) {
      const [, question, optionA, optionB, optionC, optionD, answer] = mcqMatch;
      questions.push({
        question: question.trim(),
        options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
        answer: answer.trim(),
      });
    }

    if (questions.length > 0) {
      console.log('✅ Parsed from MCQ pattern:', questions.length);
      return questions;
    }

    // Fallback: Match numbered questions with answer and hint lines
    console.log('🔍 Trying to match numbered questions with answers');
    const questionRegex = /(\d+\.\s*.*?)(?:\n|$)([\s\S]*?)(?:Answer:?\s*(.*?)\s*(?=\n\d+\.|$))/g;
    let match;
    while ((match = questionRegex.exec(content)) !== null) {
      const [, question, context, answer] = match;
      
      // Try to extract hint if it exists
      const hintMatch = context.match(/Hint:?\s*(.*?)(?:\n|$)/i);
      const hint = hintMatch ? hintMatch[1].trim() : undefined;
      
      questions.push({
        question: question.trim(),
        answer: answer.trim(),
        hint: hint
      });
    }

    if (questions.length > 0) {
      console.log('✅ Parsed from numbered pattern:', questions.length);
    } else {
      // Last resort: Try to find any numbered items that look like questions
      console.log('🔍 Trying to match simple numbered items');
      const simpleQuestionRegex = /(\d+\.\s*.*?)(?:\n|$)/g;
      let simpleMatch;
      while ((simpleMatch = simpleQuestionRegex.exec(content)) !== null) {
        const question = simpleMatch[1].trim();
        if (question.length > 10 && question.includes('?')) {
          questions.push({
            question: question,
            answer: "See explanation in content"
          });
        }
      }
      
      if (questions.length > 0) {
        console.log('✅ Parsed from simple numbered items:', questions.length);
      } else {
        console.warn('⚠️ No questions extracted');
      }
    }

    return questions;
  } catch (error) {
    console.error('❌ Error extracting questions:', error);
    return [];
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
      throw new ReviewPersistenceError('Authentication required', 'AUTH_REQUIRED');
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
      console.error('Error creating review:', reviewError);
      throw new ReviewPersistenceError('Failed to create review', reviewError.code, reviewError);
    }

    console.log('Review created successfully:', review);

    // Insert review-subtopic relationships
    const reviewSubtopics = reviewData.subtopicIds.map(subtopicId => ({
      review_id: review.review_id,
      subtopic_id: subtopicId
    }));

    const { error: subtopicsError } = await supabase
      .from('review_subtopics')
      .insert(reviewSubtopics);

    if (subtopicsError) {
      // If subtopics insertion fails, delete the review
      console.error('Error adding subtopics to review:', subtopicsError);
      await supabase.from('reviews').delete().eq('review_id', review.review_id);
      throw new ReviewPersistenceError('Failed to add subtopics to review', subtopicsError.code, subtopicsError);
    }

    console.log('Review subtopics added successfully');

    return review.review_id;
  } catch (error) {
    console.error('Error saving review:', error);
    if (error instanceof ReviewPersistenceError) throw error;
    throw new ReviewPersistenceError('Failed to save review', undefined, { originalError: error });
  }
}

/**
 *saves questions
 */
export async function saveReviewQuestions(
  reviewId: string,
  questions: ReviewQuestion[]
): Promise<void> {
  try {
    if (!Array.isArray(questions) || questions.length === 0) {
      console.warn('⚠️ No questions to insert');
      return;
    }

    console.log(`📝 Saving ${questions.length} questions for review ${reviewId}`);
    
    const questionsToInsert = questions.map((question, index) => ({
      review_id: reviewId,
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
      console.error('❌ Error inserting review questions:', questionsError);
      throw new ReviewPersistenceError('Failed to insert questions', questionsError.code, questionsError);
    } else {
      console.log('✅ Review questions inserted:', questions.length);
    }

  } catch (error) {
    console.error('❌ Failed to save review questions:', error);
    throw new ReviewPersistenceError('Failed to save review questions', undefined, { originalError: error });
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
      throw new ReviewPersistenceError('Failed to fetch review', reviewError.code, reviewError);
    }

    // Get questions
    const { data: questions, error: questionsError } = await supabase
      .from('review_questions')
      .select('*')
      .eq('review_id', reviewId)
      .order('question_number', { ascending: true });

    if (questionsError) {
      throw new ReviewPersistenceError('Failed to fetch questions', questionsError.code, questionsError);
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
    if (error instanceof ReviewPersistenceError) throw error;
    throw new ReviewPersistenceError('Failed to fetch review', undefined, { originalError: error });
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
        throw new ReviewPersistenceError('Failed to update review', updateError.code, updateError);
      }
    }

  } catch (error) {
    console.error('Error updating review:', error);
    if (error instanceof ReviewPersistenceError) throw error;
    throw new ReviewPersistenceError('Failed to update review', undefined, { originalError: error });
  }
}

/**
 * Deletes a review and all associated data
 */
export async function deleteReview(reviewId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('review_id', reviewId);

    if (error) {
      throw new ReviewPersistenceError('Failed to delete review', error.code, error);
    }
    
  } catch (error) {
    console.error('Error deleting review:', error);
    if (error instanceof ReviewPersistenceError) throw error;
    throw new ReviewPersistenceError('Failed to delete review', undefined, { originalError: error });
  }
}