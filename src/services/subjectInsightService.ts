import { supabase } from '../lib/supabase';

export interface CoreConcept {
  id: number;
  title: string;
  explanation: string;
  subject_id: number;
  grade_id: number;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExamWatchItem {
  id: number;
  title: string;
  importance: string;
  last_seen: string;
  expected_difficulty: string;
  resources_count: number;
  subject_id: number;
  grade_id: number;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export class SubjectInsightError extends Error {
  constructor(message: string, public code?: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'SubjectInsightError';
  }
}

/**
 * Fetches core concepts for a specific subject and grade
 */
export async function getCoreConcepts(subjectId: number, gradeId: number): Promise<CoreConcept[]> {
  try {
    console.log('🔍 Fetching core concepts for subject:', subjectId, 'grade:', gradeId);
    
    const { data, error } = await supabase
      .from('subject_insights')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('grade_id', gradeId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new SubjectInsightError('Failed to fetch core concepts', error.code, error);
    }
    
    console.log(`✅ Found ${data?.length || 0} core concepts`);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching core concepts:', error);
    if (error instanceof SubjectInsightError) throw error;
    throw new SubjectInsightError(
      'An unexpected error occurred while fetching core concepts',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Adds a new core concept
 */
export async function addCoreConcept(concept: Omit<CoreConcept, 'id' | 'created_by' | 'created_at' | 'updated_at'>): Promise<CoreConcept> {
  try {
    console.log('🔍 Adding new core concept:', concept);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new SubjectInsightError('Authentication required', 'AUTH_REQUIRED');
    }
    
    // Add concept
    const { data, error } = await supabase
      .from('subject_insights')
      .insert([{
        ...concept,
        created_by: user.id
      }])
      .select()
      .single();
    
    if (error) {
      throw new SubjectInsightError('Failed to add core concept', error.code, error);
    }
    
    console.log('✅ Core concept added successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error adding core concept:', error);
    if (error instanceof SubjectInsightError) throw error;
    throw new SubjectInsightError(
      'An unexpected error occurred while adding core concept',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Updates an existing core concept
 */
export async function updateCoreConcept(id: number, updates: Partial<Omit<CoreConcept, 'id' | 'created_by' | 'created_at' | 'updated_at'>>): Promise<CoreConcept> {
  try {
    console.log('🔍 Updating core concept:', id, updates);
    console.log('we are coming to update Herbza');
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new SubjectInsightError('Authentication required', 'AUTH_REQUIRED');
    }
    
    // Check if user is the creator or has special permissions
    const { data: concept, error: conceptError } = await supabase
      .from('subject_insights')
      .select('created_by')
      .eq('insight_id', id)
      .single();

    console.log('what did we get data');
    if (conceptError) {
      throw new SubjectInsightError('Failed to fetch concept', conceptError.code, conceptError);
    }
    
    if (concept.created_by !== user.id) {
      // Check if user has special permissions
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('special_permissions')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !userProfile.special_permissions) {
        throw new SubjectInsightError('You do not have permission to update this concept', 'PERMISSION_DENIED');
      }
    }

    console.log('going to update the record');
    // Update concept
    const { data, error } = await supabase
      .from('subject_insights')
      .update(updates)
      .eq('insight_id', id)
      .select()
      .single();
    
    if (error) {
      throw new SubjectInsightError('Failed to update core concept', error.code, error);
    }
    
    console.log('✅ Core concept updated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error updating core concept:', error);
    if (error instanceof SubjectInsightError) throw error;
    throw new SubjectInsightError(
      'An unexpected error occurred while updating core concept',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Deletes a core concept
 */
export async function deleteCoreConcept(id: number): Promise<void> {
  try {
    console.log('🔍 Deleting core concept:', id);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new SubjectInsightError('Authentication required', 'AUTH_REQUIRED');
    }
    
    // Check if user is the creator or has special permissions
    const { data: concept, error: conceptError } = await supabase
      .from('subject_insights')
      .select('created_by')
      .eq('id', id)
      .single();
    
    if (conceptError) {
      throw new SubjectInsightError('Failed to fetch concept', conceptError.code, conceptError);
    }
    
    if (concept.created_by !== user.id) {
      // Check if user has special permissions
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('special_permissions')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !userProfile.special_permissions) {
        throw new SubjectInsightError('You do not have permission to delete this concept', 'PERMISSION_DENIED');
      }
    }
    
    // Delete concept
    const { error } = await supabase
      .from('subject_insights')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new SubjectInsightError('Failed to delete core concept', error.code, error);
    }
    
    console.log('✅ Core concept deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting core concept:', error);
    if (error instanceof SubjectInsightError) throw error;
    throw new SubjectInsightError(
      'An unexpected error occurred while deleting core concept',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Fetches exam watch list items for a specific subject and grade
 */
export async function getExamWatchList(subjectId: number, gradeId: number): Promise<ExamWatchItem[]> {
  try {
    console.log('🔍 Fetching exam watch list for subject:', subjectId, 'grade:', gradeId);
    
    const { data, error } = await supabase
      .from('subject_insights')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('grade_id', gradeId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new SubjectInsightError('Failed to fetch exam watch list', error.code, error);
    }
    
    console.log(`✅ Found ${data?.length || 0} exam watch items`);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching exam watch list:', error);
    if (error instanceof SubjectInsightError) throw error;
    throw new SubjectInsightError(
      'An unexpected error occurred while fetching exam watch list',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Adds a new exam watch list item
 */
export async function addExamWatchItem(item: Omit<ExamWatchItem, 'id' | 'created_by' | 'created_at' | 'updated_at'>): Promise<ExamWatchItem> {
  try {
    console.log('🔍 Adding new exam watch item:', item);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new SubjectInsightError('Authentication required', 'AUTH_REQUIRED');
    }
    
    // Add item
    const { data, error } = await supabase
      .from('subject_insights')
      .insert([{
        ...item,
        created_by: user.id
      }])
      .select()
      .single();
    
    if (error) {
      throw new SubjectInsightError('Failed to add exam watch item', error.code, error);
    }
    
    console.log('✅ Exam watch item added successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error adding exam watch item:', error);
    if (error instanceof SubjectInsightError) throw error;
    throw new SubjectInsightError(
      'An unexpected error occurred while adding exam watch item',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Updates an existing exam watch list item
 */
export async function updateExamWatchItem(id: number, updates: Partial<Omit<ExamWatchItem, 'id' | 'created_by' | 'created_at' | 'updated_at'>>): Promise<ExamWatchItem> {
  try {
    console.log('🔍 Updating exam watch item:', id, updates);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new SubjectInsightError('Authentication required', 'AUTH_REQUIRED');
    }
    
    // Check if user is the creator or has special permissions
    const { data: item, error: itemError } = await supabase
      .from('subject_insights')
      .select('created_by')
      .eq('id', id)
      .single();
    
    if (itemError) {
      throw new SubjectInsightError('Failed to fetch exam watch item', itemError.code, itemError);
    }
    
    if (item.created_by !== user.id) {
      // Check if user has special permissions
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('special_permissions')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !userProfile.special_permissions) {
        throw new SubjectInsightError('You do not have permission to update this item', 'PERMISSION_DENIED');
      }
    }
    
    // Update item
    const { data, error } = await supabase
      .from('subject_insights')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new SubjectInsightError('Failed to update exam watch item', error.code, error);
    }
    
    console.log('✅ Exam watch item updated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error updating exam watch item:', error);
    if (error instanceof SubjectInsightError) throw error;
    throw new SubjectInsightError(
      'An unexpected error occurred while updating exam watch item',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Deletes an exam watch list item
 */
export async function deleteExamWatchItem(id: number): Promise<void> {
  try {
    console.log('🔍 Deleting exam watch item:', id);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new SubjectInsightError('Authentication required', 'AUTH_REQUIRED');
    }
    
    // Check if user is the creator or has special permissions
    const { data: item, error: itemError } = await supabase
      .from('subject_insights')
      .select('created_by')
      .eq('id', id)
      .single();
    
    if (itemError) {
      throw new SubjectInsightError('Failed to fetch exam watch item', itemError.code, itemError);
    }
    
    if (item.created_by !== user.id) {
      // Check if user has special permissions
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('special_permissions')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !userProfile.special_permissions) {
        throw new SubjectInsightError('You do not have permission to delete this item', 'PERMISSION_DENIED');
      }
    }
    
    // Delete item
    const { error } = await supabase
      .from('subject_insights')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new SubjectInsightError('Failed to delete exam watch item', error.code, error);
    }
    
    console.log('✅ Exam watch item deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting exam watch item:', error);
    if (error instanceof SubjectInsightError) throw error;
    throw new SubjectInsightError(
      'An unexpected error occurred while deleting exam watch item',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}