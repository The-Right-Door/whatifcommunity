import { supabase } from '../lib/supabase';

export interface Stream {
  id: string;
  name: string;
  description?: string;
  grade_range?: number[];
}

export class StreamError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'StreamError';
  }
}

/**
 * Fetches all available streams from the database
 */
export async function getStreams(): Promise<Stream[]> {
  try {
    console.log('🔍 Fetching streams from database');
    
    const { data, error } = await supabase
      .from('streams')
      .select('stream_id, stream_name, description')  // Specify exact columns to fetch
      .order('stream_name');  // Ordering by the correct column
    
    if (error) {
      console.error('❌ Error fetching streams:', error);
      throw new StreamError('Failed to fetch streams', error.code, error);
    }

    console.log('Fetched data:', data);
    
    if (!data || data.length === 0) {
      console.log('⚠️ No streams found in database, returning default streams');
      // Fallback to default streams if none found in database
      return [
        {
          id: 'pureMaths',
          name: 'Pure Maths',
          description: 'Focus on advanced mathematical concepts, calculus, algebra, and problem-solving skills'
        },
        {
          id: 'mathsLiteracy',
          name: 'Maths Literacy',
          description: 'Practical mathematical applications focused on everyday scenarios and financial literacy'
        },
        {
          id: 'nonMaths',
          name: 'Non-Maths',
          description: 'Focus on humanities, arts, languages, and social sciences'
        }
      ];
    }
    
    console.log(`✅ Found ${data.length} streams in database`);
    
    // Transform database records to Stream interface
    return data.map(stream => ({
      id: stream.stream_id.toString(),
      name: stream.stream_name,
      description: stream.description
    }));
  } catch (error) {
    console.error('❌ Error fetching streams:', error);
    if (error instanceof StreamError) throw error;
    throw new StreamError('Failed to fetch streams', undefined, { originalError: error });
  }
}

/**
 * Gets a stream by ID from the database
 */
export async function getStreamById(streamId: string): Promise<Stream | null> {
  try {
    console.log(`🔍 Fetching stream with ID: ${streamId}`);
    
    const { data, error } = await supabase
      .from('streams')
      .select('stream_id, stream_name, description')  // Specify exact columns to fetch
      .eq('stream_id', streamId)
      .single();  // Fetch a single stream by ID
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        console.log(`⚠️ No stream found with ID: ${streamId}`);
        return null;
      }
      
      console.error('❌ Error fetching stream by ID:', error);
      throw new StreamError('Failed to fetch stream', error.code, error);
    }
    
    if (!data) {
      return null;
    }
    
    console.log('✅ Stream found:', data);
    
    // Transform database record to Stream interface
    return {
      id: data.stream_id.toString(),
      name: data.stream_name,
      description: data.description
    };
  } catch (error) {
    console.error('❌ Error fetching stream by ID:', error);
    if (error instanceof StreamError) throw error;
    throw new StreamError('Failed to fetch stream', undefined, { originalError: error });
  }
}

/**
 * Gets a stream by name from the database
 */
export async function getStreamByName(streamName: string): Promise<Stream | null> {
  try {
    console.log(`🔍 Fetching stream with name: ${streamName}`);
    
    const { data, error } = await supabase
      .from('streams')
      .select('stream_id, stream_name, description')  // Specify exact columns to fetch
      .eq('stream_name', streamName)  // Filter by stream name
      .single();  // Fetch a single stream by name
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        console.log(`⚠️ No stream found with name: ${streamName}`);
        return null;
      }
      
      console.error('❌ Error fetching stream by name:', error);
      throw new StreamError('Failed to fetch stream by name', error.code, error);
    }
    
    if (!data) {
      return null;
    }
    
    console.log('✅ Stream found:', data);
    
    // Transform database record to Stream interface
    return {
      id: data.stream_id.toString(),
      name: data.stream_name,
      description: data.description
    };
  } catch (error) {
    console.error('❌ Error fetching stream by name:', error);
    if (error instanceof StreamError) throw error;
    throw new StreamError('Failed to fetch stream by name', undefined, { originalError: error });
  }
}

/**
 * Finds streams by partial name match
 */
export async function findStreamsByName(searchTerm: string): Promise<Stream[]> {
  try {
    console.log(`🔍 Finding streams with name containing: ${searchTerm}`);
    
    if (!searchTerm || searchTerm.trim() === '') {
      return getStreams(); // Return all streams if search term is empty
    }
    
    const { data, error } = await supabase
      .from('streams')
      .select('stream_id, stream_name, description')
      .ilike('stream_name', `%${searchTerm}%`) // Case-insensitive partial match
      .order('stream_name');
    
    if (error) {
      console.error('❌ Error finding streams by name:', error);
      throw new StreamError('Failed to find streams by name', error.code, error);
    }
    
    if (!data || data.length === 0) {
      console.log(`⚠️ No streams found matching: ${searchTerm}`);
      return [];
    }
    
    console.log(`✅ Found ${data.length} streams matching: ${searchTerm}`);
    
    // Transform database records to Stream interface
    return data.map(stream => ({
      id: stream.stream_id.toString(),
      name: stream.stream_name,
      description: stream.description
    }));
  } catch (error) {
    console.error('❌ Error finding streams by name:', error);
    if (error instanceof StreamError) throw error;
    throw new StreamError('Failed to find streams by name', undefined, { originalError: error });
  }
}

/**
 * Fetches streams that include a specific grade within their grade_range
 */
export async function getStreamsByGrade(selectedGrade: number): Promise<Stream[]> {
  try {
    console.log(`🔍 Fetching streams for grade: ${selectedGrade}`);
    
    const { data, error } = await supabase
      .from('streams')
      .select('stream_id, stream_name, description, grade_range')
      .contains('grade_range', [selectedGrade]);
    
    if (error) {
      console.error('❌ Error fetching streams by grade:', error);
      throw new StreamError('Failed to fetch streams by grade', error.code, error);
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No streams found for the selected grade');
      return [];
    }
    
    console.log(`✅ Found ${data.length} streams for grade ${selectedGrade}`);
    
    // Transform database records to Stream interface
    return data.map(stream => ({
      id: stream.stream_id.toString(),
      name: stream.stream_name,
      description: stream.description,
      grade_range: stream.grade_range || [],  // Ensure grade_range is returned, even if null
    }));
  } catch (error) {
    console.error('❌ Error fetching streams by grade:', error);
    if (error instanceof StreamError) throw error;
    throw new StreamError('Failed to fetch streams by grade', undefined, { originalError: error });
  }
}

export async function getStreamsByGradeRange(gradeRange: number | number[]): Promise<Stream[]> {
  try {
    console.log(`🔍 Fetching streams for grade range:`, gradeRange);
    
    const { data, error } = await supabase
      .from('streams')
      .select('stream_id, stream_name, description, grade_range')
      .contains('grade_range', Array.isArray(gradeRange) ? gradeRange : [gradeRange]);
    
    if (error) {
      console.error('❌ Error fetching streams by grade range:', error);
      throw new StreamError('Failed to fetch streams by grade range', error.code, error);
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No streams found for grade range:', gradeRange);
      return [];
    }
    
    console.log(`✅ Found ${data.length} streams for grade range`);
    
    // Transform database records to match Stream interface
    return data.map(stream => ({
      id: stream.stream_id.toString(),
      name: stream.stream_name,
      description: stream.description,
      grade_range: stream.grade_range,
    }));
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof StreamError) throw error;
    throw new StreamError('Unexpected error fetching streams by grade range', undefined, { originalError: error });
  }
}