import { supabase } from '../lib/supabase';

export interface TopicCoverage {
  coverage_id: string;
  topic_id: number;
  teacher_id: string;
  covered_date: string;
  notes?: string;
  resources?: any;
  status: 'planned' | 'in_progress' | 'covered';
  last_covered_at?: string;
  last_tested_at?: string;
  created_at: string;
  updated_at: string;
}

export class CoverageError extends Error {
  constructor(message: string, public code?: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'CoverageError';
  }
}

// Create or update topic coverage
export async function updateTopicCoverage(
  topicId: number,
  data: Partial<Omit<TopicCoverage, 'coverage_id' | 'teacher_id' | 'created_at' | 'updated_at'>>
): Promise<TopicCoverage> {
  try {
    // Check if coverage exists
    const { data: existing, error: fetchError } = await supabase
      .from('topics_coverage')
      .select('*')
      .eq('topic_id', topicId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new CoverageError('Failed to check existing coverage', fetchError.code, fetchError);
    }

    if (existing) {
      // Update existing coverage
      const { data: updated, error: updateError } = await supabase
        .from('topics_coverage')
        .update(data)
        .eq('coverage_id', existing.coverage_id)
        .select()
        .single();

      if (updateError) throw new CoverageError('Failed to update coverage', updateError.code, updateError);
      return updated;
    } else {
      // Create new coverage
      const { data: created, error: createError } = await supabase
        .from('topics_coverage')
        .insert([{ topic_id: topicId, ...data }])
        .select()
        .single();

      if (createError) throw new CoverageError('Failed to create coverage', createError.code, createError);
      return created;
    }
  } catch (error) {
    if (error instanceof CoverageError) throw error;
    throw new CoverageError('Failed to update topic coverage', undefined, { originalError: error });
  }
}

// Get coverage for a topic
export async function getTopicCoverage(topicId: number): Promise<TopicCoverage | null> {
  try {
    const { data, error } = await supabase
      .from('topics_coverage')
      .select('*')
      .eq('topic_id', topicId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No coverage found
      throw new CoverageError('Failed to fetch coverage', error.code, error);
    }

    return data;
  } catch (error) {
    if (error instanceof CoverageError) throw error;
    throw new CoverageError('Failed to fetch topic coverage', undefined, { originalError: error });
  }
}

// Get coverage for multiple topics
export async function getTopicsCoverage(topicIds: number[]): Promise<Record<number, TopicCoverage>> {
  try {
    const { data, error } = await supabase
      .from('topics_coverage')
      .select('*')
      .in('topic_id', topicIds);

    if (error) throw new CoverageError('Failed to fetch coverage', error.code, error);

    // Convert array to record with topic_id as key
    return data.reduce((acc, coverage) => {
      acc[coverage.topic_id] = coverage;
      return acc;
    }, {} as Record<number, TopicCoverage>);
  } catch (error) {
    if (error instanceof CoverageError) throw error;
    throw new CoverageError('Failed to fetch topics coverage', undefined, { originalError: error });
  }
}

// Delete topic coverage
export async function deleteTopicCoverage(coverageId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('topics_coverage')
      .delete()
      .eq('coverage_id', coverageId);

    if (error) throw new CoverageError('Failed to delete coverage', error.code, error);
  } catch (error) {
    if (error instanceof CoverageError) throw error;
    throw new CoverageError('Failed to delete topic coverage', undefined, { originalError: error });
  }
}