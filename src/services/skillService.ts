import { supabase } from '../lib/supabase';

export interface Skill {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  level?: string;
}

export class SkillError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'SkillError';
  }
}

/**
 * Fetches all available skills from the database
 */
export async function getSkills(): Promise<Skill[]> {
  try {
    console.log('🔍 Fetching skills from database');
    
    const { data, error } = await supabase
      .from('skills')
      .select('skill_id, skill_name, description, icon')
      .order('skill_name');
    
    if (error) {
      console.error('❌ Error fetching skills:', error);
      throw new SkillError('Failed to fetch skills', error.code, error);
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No skills found in database, returning default skills');
      // Fallback to default skills if none found in database
      return [
        {
          id: 'programming',
          name: 'Programming',
          description: 'Learn software development, web programming, mobile app development, and coding fundamentals.',
          icon: 'Code'
        },
        {
          id: 'analysis',
          name: 'Analysis',
          description: 'Develop skills in data analysis, business intelligence, statistical methods, and research techniques.',
          icon: 'BarChart2'
        },
        {
          id: 'ai',
          name: 'AI',
          description: 'Explore artificial intelligence, machine learning, neural networks, and AI application development.',
          icon: 'Brain'
        }
      ];
    }
    
    console.log(`✅ Found ${data.length} skills in database`);
    
    // Transform database records to Skill interface
    return data.map(skill => ({
      id: skill.skill_id.toString(),
      name: skill.skill_name,
      description: skill.description,
      icon: skill.icon
    }));
  } catch (error) {
    console.error('❌ Error fetching skills:', error);
    if (error instanceof SkillError) throw error;
    throw new SkillError('Failed to fetch skills', undefined, { originalError: error });
  }
}

/**
 * Gets a skill by ID from the database
 */
export async function getSkillById(skillId: string): Promise<Skill | null> {
  try {
    console.log(`🔍 Fetching skill with ID: ${skillId}`);
    
    const { data, error } = await supabase
      .from('skills')
      .select('skill_id, skill_name, description, icon')
      .eq('skill_id', skillId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        console.log(`⚠️ No skill found with ID: ${skillId}`);
        return null;
      }
      
      console.error('❌ Error fetching skill by ID:', error);
      throw new SkillError('Failed to fetch skill', error.code, error);
    }
    
    if (!data) {
      return null;
    }
    
    console.log('✅ Skill found:', data);
    
    // Transform database record to Skill interface
    return {
      id: data.skill_id.toString(),
      name: data.skill_name,
      description: data.description,
      icon: data.icon
    };
  } catch (error) {
    console.error('❌ Error fetching skill by ID:', error);
    if (error instanceof SkillError) throw error;
    throw new SkillError('Failed to fetch skill', undefined, { originalError: error });
  }
}

/**
 * Gets skills by level
 */
export async function getSkillsByLevel(level: string): Promise<Skill[]> {
  try {
    console.log(`🔍 Fetching skills for level: ${level}`);
    
    const { data, error } = await supabase
      .from('skills')
      .select('skill_id, skill_name, description, icon')
      .eq('level', level)
      .order('skill_name');
    
    if (error) {
      console.error('❌ Error fetching skills by level:', error);
      throw new SkillError('Failed to fetch skills by level', error.code, error);
    }
    
    if (!data || data.length === 0) {
      console.log(`⚠️ No skills found for level: ${level}`);
      return [];
    }
    
    console.log(`✅ Found ${data.length} skills for level: ${level}`);
    
    // Transform database records to Skill interface
    return data.map(skill => ({
      id: skill.skill_id.toString(),
      name: skill.skill_name,
      description: skill.description,
      icon: skill.icon
    }));
  } catch (error) {
    console.error('❌ Error fetching skills by level:', error);
    if (error instanceof SkillError) throw error;
    throw new SkillError('Failed to fetch skills by level', undefined, { originalError: error });
  }
}

/**
 * Gets all available skill levels
 */
export async function getSkillLevels(): Promise<string[]> {
  try {
    console.log('🔍 Fetching skill levels');
    
    const { data, error } = await supabase
      .from('skill_levels')
      .select('level_id, level_name')
      .order('level_order');
    
    if (error) {
      console.error('❌ Error fetching skill levels:', error);
      throw new SkillError('Failed to fetch skill levels', error.code, error);
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No skill levels found, returning default levels');
      return ['beginner', 'intermediate', 'advanced'];
    }
    
    console.log(`✅ Found ${data.length} skill levels`);
    
    // Return just the level names
    return data.map(level => level.level_id);
  } catch (error) {
    console.error('❌ Error fetching skill levels:', error);
    if (error instanceof SkillError) throw error;
    throw new SkillError('Failed to fetch skill levels', undefined, { originalError: error });
  }
}