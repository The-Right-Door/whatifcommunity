import { supabase } from '../lib/supabase';

export interface Grade {
  grade_no: number;
  grade_name: string | null;
}

export interface Subject {
  subjects_id: number;
  subjects_name: string;
  subjects_status: string;
  subjects_short_description: string;
  grades?: Grade[];
}

// ✨ Simple fetch for registration
export async function getAllActiveSubjects(): Promise<Subject[]> {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('subjects_status', 'active');

    if (error) throw error;

    return data as Subject[];
  } catch (error) {
    console.error('Error fetching all active subjects:', error);
    throw new Error('Failed to fetch active subjects');
  }
}

export async function getTeacherSubjects(): Promise<Subject[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // Get user profile to check role and subjects_majored
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw profileError;
    
    if (profile.role !== 'teacher') {
      throw new Error('Only teachers can access this function');
    }

    const subjectNames = profile.subjects_majored || [];
    
    // Get subjects that the teacher is qualified to teach
    const { data: teacherSubjects, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('subjects_status', 'active')
      .in('subjects_name', subjectNames);

    if (error) throw error;

    // Get grades for each subject
    const teacherSubjectsWithGrades = await Promise.all(
      teacherSubjects.map(async (subject: Subject) => {
        try {
          const { data: gradeData, error: gradeError } = await supabase
            .from('subject_grade')
            .select('grade:grades(grade_no, grade_name)')
            .eq('subject_id', subject.subjects_id);

          if (gradeError) {
            console.error(`Error fetching grades for subject ${subject.subjects_id}:`, gradeError);
            return { ...subject, grades: [] };
          }

          const grades = gradeData?.map(g => ({
            grade_no: g.grade.grade_no,
            grade_name: g.grade.grade_name || `Grade ${g.grade.grade_no}`
          })) || [];

          return { ...subject, grades };
        } catch (error) {
          console.error(`Failed to fetch grades for subject ${subject.subjects_id}:`, error);
          return { ...subject, grades: [] };
        }
      })
    );

    return teacherSubjectsWithGrades;
  } catch (error) {
    console.error('Error fetching teacher subjects:', error);
    throw new Error('Failed to fetch teacher subjects');
  }
}

export async function getActiveSubjects(): Promise<Subject[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // If no user or error, return all active subjects
    if (authError || !user) {
      const { data: unauthSubjects, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('subjects_status', 'active');

      if (error) throw error;

      const unauthSubjectsWithGrades = await Promise.all(
        unauthSubjects.map(async (subject: Subject) => {
          try {
            const { data: gradeData, error: gradeError } = await supabase
              .from('subject_grade')
              .select('grade:grades(grade_no, grade_name)')
              .eq('subject_id', subject.subjects_id);

            if (gradeError) {
              console.error(`Error fetching grades for subject ${subject.subjects_id}:`, gradeError);
              return { ...subject, grades: [] };
            }

            const grades = gradeData?.map(g => ({
              grade_no: g.grade.grade_no,
              grade_name: g.grade.grade_name || `Grade ${g.grade.grade_no}`
            })) || [];

            return { ...subject, grades };
          } catch (error) {
            console.error(`Failed to fetch grades for subject ${subject.subjects_id}:`, error);
            return { ...subject, grades: [] };
          }
        })
      );

      return unauthSubjectsWithGrades;
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw profileError;

    if (profile.role === 'teacher') {
      const subjectNames = profile.subjects_majored || [];

      const { data: teacherSubjects, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('subjects_status', 'active')
        .in('subjects_name', subjectNames);

      if (error) throw error;

      const teacherSubjectsWithGrades = await Promise.all(
        teacherSubjects.map(async (subject: Subject) => {
          try {
            const { data: gradeData, error: gradeError } = await supabase
              .from('subject_grade')
              .select('grade:grades(grade_no, grade_name)')
              .eq('subject_id', subject.subjects_id);

            if (gradeError) {
              console.error(`Error fetching grades for subject ${subject.subjects_id}:`, gradeError);
              return { ...subject, grades: [] };
            }

            const grades = gradeData?.map(g => ({
              grade_no: g.grade.grade_no,
              grade_name: g.grade.grade_name || `Grade ${g.grade.grade_no}`
            })) || [];

            return { ...subject, grades };
          } catch (error) {
            console.error(`Failed to fetch grades for subject ${subject.subjects_id}:`, error);
            return { ...subject, grades: [] };
          }
        })
      );

      return teacherSubjectsWithGrades;
    }

    if (profile.role === 'learner') {
      console.log('👨‍🎓 Role is learner');
//  const subjectIds = profile.subjects || [];
  const subjectIds = profile.subjects_enrolled || [];

  const gradeId = profile.education_level;

       console.log('📚 Enrolled subject IDs:', subjectIds);
  console.log('🎓 Education level (grade_id):', gradeId);

  if (subjectIds.length === 0 || !gradeId) {
     console.warn('⚠️ No subjects or grade found for learner');
    return [];
  }

      console.log('🎯 Checking gradeId before query:', gradeId);

if (!gradeId) {
  console.warn('⚠️ gradeId is missing');
  return [];
}

  const { data: gradeData, error: gradeError } = await supabase
    .from('grades')
    .select('grade_no, grade_name')
    .eq('grades_id', gradeId)
    .maybeSingle();

      console.log('📬 Raw grade data:', gradeData);
console.log('🐛 Grade error:', gradeError);
  if (gradeError) {
     console.error('❌ Failed to fetch learner grade:', gradeError);
    throw new Error('Failed to fetch learner grade');
  }

      console.log('🎓 Grade fetched from Supabase:', gradeData);

  const learnerGrade = {
    grade_no: gradeData.grade_no,
    grade_name: gradeData.grade_name || `Grade ${gradeData.grade_no}`
  };

      console.log('📘 Constructed learnerGrade object:', learnerGrade);

  const { data: subjects, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('subjects_status', 'active')
    .in('subjects_id', subjectIds);

  if (error) {
       console.error('❌ Failed to fetch subjects for learner:', error);
    throw error;
  }

  console.log('📦 Raw subjects fetched from Supabase:', subjects);

  const subjectsWithGrade = subjects.map((subject: Subject) => ({
    ...subject,
    grades: [learnerGrade]
  }));

      console.log('✅ Final learner subjects with grade attached:', subjectsWithGrade);
  return subjectsWithGrade;
}

    
    /*
    if (profile.role === 'learner' && profile.grade_id) {
      const { data: subjectGrades, error: gradeError } = await supabase
        .from('subject_grade')
        .select(`
          subject:subjects(
            subjects_id,
            subjects_name,
            subjects_status,
            subjects_short_description
          ),
          grade:grades(grade_no, grade_name)
        `)
        .eq('grade_id', profile.grade_id);

      if (gradeError) throw gradeError;

      const learnerSubjects = subjectGrades
        .map(sg => ({
          ...sg.subject,
          grades: [{
            grade_no: sg.grade.grade_no,
            grade_name: sg.grade.grade_name || `Grade ${sg.grade.grade_no}`
          }]
        }))
        .filter(subject => subject.subjects_status.toLowerCase() === 'active');

      return learnerSubjects;
    }

    */

    // Fallback for other roles
    const { data: fallbackSubjects, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('subjects_status', 'active');

    if (error) throw error;

    const fallbackSubjectsWithGrades = await Promise.all(
      fallbackSubjects.map(async (subject: Subject) => {
        try {
          const { data: gradeData, error: gradeError } = await supabase
            .from('subject_grade')
            .select('grade:grades(grade_no, grade_name)')
            .eq('subject_id', subject.subjects_id);

          if (gradeError) {
            console.error(`Error fetching grades for subject ${subject.subjects_id}:`, gradeError);
            return { ...subject, grades: [] };
          }

          const grades = gradeData?.map(g => ({
            grade_no: g.grade.grade_no,
            grade_name: g.grade.grade_name || `Grade ${g.grade.grade_no}`
          })) || [];

          return { ...subject, grades };
        } catch (error) {
          console.error(`Failed to fetch grades for subject ${subject.subjects_id}:`, error);
          return { ...subject, grades: [] };
        }
      })
    );

    return fallbackSubjectsWithGrades;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw new Error('Failed to fetch subjects');
  }
}

//
export async function getSubjectsByStreamId(streamId: string): Promise<Subject[]> {
  try {
    console.log(`🔍 Fetching subjects for stream ID: ${streamId}`);

    const { data, error } = await supabase
      .from('subjects')
      .select('subjects_id, subjects_name, subjects_short_description, subjects_status')
      .eq('subjects_status', 'active')
      .eq('stream_id', streamId);

    if (error) {
      console.error('❌ Error fetching subjects for stream:', error);
      throw new Error('Failed to fetch subjects for stream');
    }

     console.log('📦 Raw subject data from Supabase:', data);

    /*
    return data.map(subject => ({
      id: subject.subjects_id,
      name: subject.subjects_name,
      description: subject.subjects_short_description
    }));
    */
    const mappedSubjects = data.map(subject => ({
      id: subject.subjects_id,
      name: subject.subjects_name,
      description: subject.subjects_short_description
    }));

    console.log('✅ Mapped subjects:', mappedSubjects);

    return mappedSubjects;

    
  } catch (error) {
    console.error('❌ Exception fetching subjects by stream ID:', error);
    return [];
  }
}

/*
export async function getActiveSubjectsForLearner(): Promise<Subject[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Authentication required');

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('subjects, role, education_level')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw profileError;
    if (profile.role !== 'learner') throw new Error('Only learners can access this function');

    const subjectIds = profile.subjects || [];
    const gradeId = profile.education_level;

    if (subjectIds.length === 0 || !gradeId) return [];

    // Fetch the grade name based on education_level (grade_id)
    const { data: gradeData, error: gradeError } = await supabase
      .from('grades')
      .select('grade_no, grade_name')
      .eq('grade_id', gradeId)
      .single();

    if (gradeError) throw new Error('Failed to fetch learner grade');

    const learnerGrade = {
      grade_no: gradeData.grade_no,
      grade_name: gradeData.grade_name || `Grade ${gradeData.grade_no}`
    };

    // Fetch active subjects using subject_ids
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('subjects_status', 'active')
      .in('subjects_id', subjectIds);

    if (error) throw error;

    // Attach the learner's grade to each subject
    const subjectsWithGrade = subjects.map((subject: Subject) => ({
      ...subject,
      grades: [learnerGrade]
    }));

    return subjectsWithGrade;
  } catch (error) {
    console.error('❌ Error in getActiveSubjectsForLearner:', error);
    throw new Error('Failed to fetch learner subjects');
  }
}
*/