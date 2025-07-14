import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  UserPlus,
  Search,
  Plus,
  Minus,
  X,
  List,
  PlusCircle,
  Users2,
  School,
  UserCheck,
  GraduationCap,
  Briefcase,
  BookOpen
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';
import { 
  createClassroom, 
  getAllClassrooms, 
  getClassroomsByGrade,
  ClassroomWithDetails
} from '../services/classroomService';
import {
  assignTeacherToClassroom,
  getTeacherAssignmentsForClassroom
} from '../services/teacherAssignmentService';
import {
  assignLearnersToClassroom,
  getLearnersForClassroom
} from '../services/learnerAssignmentService';
import { getStreams, Stream, getStreamsByGrade } from '../services/streamService';
import { getSubjectsByStreamId } from '../services/subjectService';

interface Subject {
  id: number;
  name: string;
  description: string | null;
}

interface Grade {
  grades_id: number;
  grade_no: number;
  grade_name: string;
}

interface Classroom {
  classroom_id: number;
  classroom_name: string;
  grade_id: number;
  stream_id?: string;
  capacity?: number;
  created_at?: string;
  updated_at?: string;
}


interface Teacher {
  user_id: string;
  first_name: string;
  last_name: string;
  subjects_majored: string[];
}

interface Learner {
  user_id: string;
  first_name: string;
  last_name: string;
  grade_id: number;
}

interface Assignment {
  teacher: Teacher;
  learners: Learner[];
}

interface ClassroomSubject {
  classroom_id: number;
  subject_id: number;
}


type View = 'list' | 'add' | 'allocate-learners' | 'view';

export default function ManageClasses() {
  const navigate = useNavigate();
  const { hasSpecialPermissions } = useUser();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<number | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedLearners, setSelectedLearners] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('list');
  const [newClassroomName, setNewClassroomName] = useState('');
  const [newClassroomGrade, setNewClassroomGrade] = useState<number | null>(null);
  const [newClassroomStream, setNewClassroomStream] = useState<string>('');
  const [newClassroomSubject, setNewClassroomSubject] = useState<number | null>(null);
  const [newClassroomSubjects, setNewClassroomSubjects] = useState<number[]>([]);

  const [classes, setClasses] = useState<ClassroomWithDetails[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [assigningTeacher, setAssigningTeacher] = useState(false);
  const [assigningLearners, setAssigningLearners] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Redirect if user doesn't have special permissions
  useEffect(() => {
    if (!hasSpecialPermissions) {
      navigate('/teacher/dashboard');
    }
  }, [hasSpecialPermissions, navigate]);

  // Fetch subjects, grades, and classrooms on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .eq('subjects_status', 'active');
          
        if (subjectsError) throw subjectsError;
        setSubjects(subjectsData);
        
        // Fetch grades
        const { data: gradesData, error: gradesError } = await supabase
          .from('grades')
          .select('*')
          .order('grade_no');
          
        if (gradesError) throw gradesError;
        setGrades(gradesData);

        
        fetchClassrooms();
        
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

// Fetch streams based on selected grade
  useEffect(() => {
    const fetchStreamsForGrade = async () => {
      if (selectedGrade !== null) {
        try {
          setLoading(true);

          // Fetch streams filtered by the selected grade
          const filteredStreams = await getStreamsByGrade(selectedGrade);
          setStreams(filteredStreams);
        } catch (error) {
          console.error('Error fetching streams:', error);
          toast.error('Failed to load streams');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStreamsForGrade();
  }, [selectedGrade]);

  // Fetch subjects when stream changes
  useEffect(() => {
    const fetchSubjectsForStream = async () => {
      if (newClassroomStream) {
        try {
          setLoadingSubjects(true);
          console.log('Fetching subjects for stream ID:', newClassroomStream);
          const streamSubjects = await getSubjectsByStreamId(newClassroomStream);
          console.log('Subjects fetched:', streamSubjects);
          setSubjects(streamSubjects);
        } catch (error) {
          console.error('Error fetching subjects for stream:', error);
          toast.error('Failed to load subjects for this stream');
        } finally {
          setLoadingSubjects(false);
        }
      }
    };

    fetchSubjectsForStream();
  }, [newClassroomStream]);
  
  // Fetch classrooms
  const fetchClassrooms = async () => {
    try {
      setLoadingClasses(true);
      const classroomsData = await getAllClassrooms();
      setClasses(classroomsData);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      toast.error('Failed to load classrooms');
    } finally {
      setLoadingClasses(false);
    }
  };

  // Fetch classrooms when grade changes
  useEffect(() => {
    const fetchClassroomsByGrade = async () => {
      if (!selectedGrade) {
        setClassrooms([]);
        return;
      }
      
      try {
        const classroomsData = await getClassroomsByGrade(selectedGrade);
        setClassrooms(classroomsData);
      } catch (error) {
        console.error('Error fetching classrooms by grade:', error);
        toast.error('Failed to load classrooms');
      }
    };
    
    fetchClassroomsByGrade();
  }, [selectedGrade]);

  // Fetch teachers when subject changes
  useEffect(() => {
    const fetchTeachers = async () => {
      if (!selectedSubject) {
        setTeachers([]);
        return;
      }
      
      try {
        // Get subject name
        const subject = subjects.find(s => s.id === selectedSubject);
        if (!subject) return;
        
        // Fetch teachers who have this subject in their subjects_majored array
        const { data: teachersData, error: teachersError } = await supabase
          .from('users')
          .select('user_id, first_name, last_name, subjects_majored')
          .eq('role', 'teacher');
          
        if (teachersError) throw teachersError;
        
        // Filter teachers who have the selected subject in their subjects_majored
        const filteredTeachers = teachersData.filter(teacher => 
          teacher.subjects_majored && 
          teacher.subjects_majored.includes(subject.name)
        );
        
        setTeachers(filteredTeachers);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        toast.error('Failed to load teachers');
      }
    };
    
    fetchTeachers();
  }, [selectedSubject, subjects]);

  // Fetch learners when grade changes
  useEffect(() => {
    const fetchLearners = async () => {
      if (!selectedGrade) {
        setLearners([]);
        return;
      }
      
      try {
        const { data: learnersData, error: learnersError } = await supabase
          .from('users')
          .select('user_id, first_name, last_name, grade_id')
          .eq('role', 'learner')
          .eq('grade_id', selectedGrade);
          
        if (learnersError) throw learnersError;
        setLearners(learnersData);
      } catch (error) {
        console.error('Error fetching learners:', error);
        toast.error('Failed to load learners');
      }
    };
    
    fetchLearners();
  }, [selectedGrade]);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    setSelectedSubject(value);
    setSelectedTeacher(null);
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    setSelectedGrade(value);
    setSelectedClassroom(null);
    setSelectedLearners([]);
  };

  const handleClassroomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    setSelectedClassroom(value);
  };

  const handleTeacherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value || null;
    setSelectedTeacher(value);
  };

  const toggleLearnerSelection = (learnerId: string) => {
    setSelectedLearners(prev => 
      prev.includes(learnerId)
        ? prev.filter(id => id !== learnerId)
        : [...prev, learnerId]
    );
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacher || !selectedClassroom || !selectedSubject) {
      toast.error('Please select a teacher, classroom, and subject');
      return;
    }
    
    try {
      setAssigningTeacher(true);
      
      // Call the service to assign the teacher
      await assignTeacherToClassroom({
        classroom_id: selectedClassroom,
        subject_id: selectedSubject,
        teacher_id: selectedTeacher
      });
      
      // Get the teacher object
      const teacher = teachers.find(t => t.user_id === selectedTeacher);
      if (!teacher) {
        throw new Error('Selected teacher not found');
      }
      
      toast.success(`Teacher ${teacher.first_name} ${teacher.last_name} assigned successfully`);
      
      // Refresh the classrooms list
      await fetchClassrooms();
      
      // Reset selections
      setSelectedTeacher(null);
    } catch (error) {
      console.error('Error assigning teacher:', error);
      toast.error('Failed to assign teacher');
    } finally {
      setAssigningTeacher(false);
    }
  };

  const handleAssignLearners = async () => {
    if (!selectedClassroom || selectedLearners.length === 0) {
      toast.error('Please select a classroom and at least one learner');
      return;
    }
    
    try {
      setAssigningLearners(true);
      
      // Call the service to assign the learners
      await assignLearnersToClassroom(
        selectedClassroom,
        selectedLearners
      );
      
      toast.success(`${selectedLearners.length} learners assigned successfully`);
      
      // Refresh the classrooms list
      await fetchClassrooms();
      
      // Reset selections
      setSelectedLearners([]);
    } catch (error) {
      console.error('Error assigning learners:', error);
      toast.error('Failed to assign learners');
    } finally {
      setAssigningLearners(false);
    }
  };

  const handleRemoveAssignment = (index: number) => {
    setAssignments(prev => prev.filter((_, i) => i !== index));
    toast.success('Assignment removed');
  };

  const handleSaveAllAssignments = () => {
    // In a real app, this would save to the database
    toast.success('All assignments saved successfully');
    setCurrentView('list');
  };

  const handleAddClassroom = async () => {
    if (!newClassroomName || !newClassroomGrade) {
      toast.error('Please enter a classroom name and select a grade');
      return;
    }

    try {
      
    //  const { data: createdClassroom, error } = await createClassroom(
        const createdClassroom = await createClassroom(
           newClassroomName,
           newClassroomGrade,
           newClassroomStream
      );

//if (error || !createdClassroom) throw error;
console.log('from classroom service herbert');
const classroomId = createdClassroom.classroom_id;
console.log('✅ Classroom created with ID:', createdClassroom.classroom_id);
      
console.log('🧾 Subjects to link:', newClassroomSubjects);

if (!Array.isArray(newClassroomSubjects) || newClassroomSubjects.length === 0) {
  console.warn('⚠️ No subjects selected or invalid format:', newClassroomSubjects);
}

      console.log('is passing this stage?');
//if (error || !createdClassroom) throw error;

  console.log('how about the above error');
// Now insert selected subjects into classroom_subject

      console.log('going to add to classroom_subject ');
      
      for (const subjectId of newClassroomSubjects) {
  const { error: insertError } = await supabase
    .from('classroom_subject')
    .insert([{ classroom_id: classroomId, subject_id: subjectId }]);
        console.log('done the insert');

  if (insertError) {
    console.error('❌ Failed to insert classroom_subject:', insertError);
    throw insertError; // Optional: abort after first failure
  }
}

  console.log('inserted to classroom_subject table');
      
      // Refresh the classrooms list
      await fetchClassrooms();
      
      toast.success('Classroom added successfully');
      setNewClassroomName('');
      setNewClassroomGrade(null);
      setNewClassroomStream('');
      setNewClassroomSubject(null);
      setCurrentView('list');
    } catch (error) {
      console.error('Error adding classroom:', error);
      toast.error('Failed to add classroom');
    }
  };

  const filteredLearners = learners.filter(learner => {
    const fullName = `${learner.first_name} ${learner.last_name}`.toLowerCase();
    return searchTerm === '' || fullName.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      {/* Navigation */}
      <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <Users className="h-8 w-8" />
              <span className="text-xl font-bold">What-If Community</span>
            </Link>
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-2xl font-bold text-white">Manage Classes</h1>
            </div>
            
            <Link 
              to="/special/management"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Management</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Welcome to the Class Management Platform</h2>
          <p className="text-xl text-gray-200">
            Where you can add new classes, and allocate teachers to classes and learners
          </p>
        </div>

        {/* View Selection Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setCurrentView('list')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              currentView === 'list'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <List className="h-5 w-5" />
            <span>List of Classes</span>
          </button>
          
          <button
            onClick={() => setCurrentView('add')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              currentView === 'add'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add Classroom</span>
          </button>
          
          <button
            onClick={() => setCurrentView('allocate-learners')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              currentView === 'allocate-learners'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <UserPlus className="h-5 w-5" />
            <span>Allocate Learners</span>
          </button>
          
          <button
            onClick={() => setCurrentView('view')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              currentView === 'view'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <School className="h-5 w-5" />
            <span>View Allocations</span>
          </button>
        </div>

        {/* Current View Content */}
        {currentView === 'list' && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">List of Classes</h2>
            
            {loadingClasses ? (
              <div className="text-center py-8">
                <p className="text-white">Loading classrooms...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-4 text-white">Classroom Name</th>
                      <th className="text-left p-4 text-white">Grade</th>
                      <th className="text-left p-4 text-white">Stream</th>
                      <th className="text-left p-4 text-white">Teachers Assigned</th>
                      <th className="text-left p-4 text-white">Learners Assigned</th>
                      <th className="text-left p-4 text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.length > 0 ? (
                      classes.map(classItem => (
                        <tr key={classItem.id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="p-4 text-white">{classItem.name}</td>
                          <td className="p-4 text-white">{classItem.grade}</td>
                          <td className="p-4 text-white">{classItem.stream || 'Not specified'}</td>
                          <td className="p-4 text-white">{classItem.teachersAssigned}</td>
                          <td className="p-4 text-white">{classItem.learnersAssigned}</td>
                          <td className="p-4">
                            <button
                              onClick={() => setCurrentView('view')}
                              className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-400">
                          No classrooms found. Click "Add Classroom" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {currentView === 'add' && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Add New Classroom</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Grade
                </label>
                <select
                  value={newClassroomGrade || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value ? parseInt(e.target.value) : null;
                    setNewClassroomGrade(selectedId);  // for classroom creation
                    setSelectedGrade(selectedId);      // for stream loading logic
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                >
                  <option value="" className="bg-gray-900">Select a grade</option>
                  {grades.map(grade => (
                    <option 
                      key={grade.grades_id} 
                      value={grade.grades_id}
                      className="bg-gray-900"
                    >
                      {grade.grade_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Stream
                </label>
                <select
                  value={newClassroomStream}
                  onChange={(e) => setNewClassroomStream(e.target.value)}
                  disabled={!newClassroomGrade} // Disable stream selection until grade is selected
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                >
                  <option value="" className="bg-gray-900">Select a stream</option>
                  {streams.length > 0 ? (
                    streams.map((stream) => (
                      <option key={stream.id} value={stream.id} className="bg-gray-900">
                        {stream.name}
                      </option>
                    ))
                  ) : (
                    <option value="" className="bg-gray-900" disabled>No streams available</option>
                  )}
                </select>

                {/* Show message if no streams are available for the selected grade */}
                {streams.length === 0 && selectedGrade && (
                  <p className="text-gray-400 text-sm mt-2">No streams available for this grade.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Subjects (select one or more)
                </label>
         
                {newClassroomStream && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {loadingSubjects ? (
                      <p className="text-gray-400 text-sm">Loading subjects...</p>
                    ) : subjects.length > 0 ? (
                      subjects.map((subject) => (
                        <label key={subject.id} className="flex items-center space-x-2 text-white">
                          <input
                            type="checkbox"
                            value={subject.id}
                            checked={newClassroomSubjects.includes(subject.id)}
                            onChange={(e) => {
                              const id = parseInt(e.target.value);
                              setNewClassroomSubjects((prev) =>
                                prev.includes(id)
                                  ? prev.filter((s) => s !== id)
                                  : [...prev, id]
                              );
                            }}
                            className="h-4 w-4 text-emerald-500 bg-white/10 border-white/30 rounded"
                          />
                          <span>{subject.name}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">No subjects available for this stream.</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Classroom Name
                </label>
                <input
                  type="text"
                  value={newClassroomName}
                  onChange={(e) => setNewClassroomName(e.target.value)}
                  placeholder="e.g., 11A, 12B, etc."
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleAddClassroom}
                  disabled={!newClassroomName || !newClassroomGrade}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    newClassroomName && newClassroomGrade
                      ? 'bg-emerald-600/80 text-white hover:bg-emerald-500'
                      : 'bg-white/10 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Add Classroom
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'allocate-learners' && (
          <div className="space-y-6">
            {/* Selection Form */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6">Allocate Learners to Classes</h2>
              
              <div className="space-y-6">
                {/* Grade Selection */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Grade
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      value={selectedGrade || ''}
                      onChange={handleGradeChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-white/40"
                    >
                      <option value="" className="bg-gray-900">Select a grade</option>
                      {grades.map(grade => (
                        <option 
                          key={grade.grades_id} 
                          value={grade.grades_id}
                          className="bg-gray-900"
                        >
                          Grade {grade.grade_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Classroom Selection */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Classroom
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      value={selectedClassroom || ''}
                      onChange={handleClassroomChange}
                      disabled={!selectedGrade || classrooms.length === 0}
                      className={`w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-white/40 ${
                        !selectedGrade || classrooms.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="" className="bg-gray-900">Select a classroom</option>
                      {classrooms.map(classroom => (
                        <option 
                          key={classroom.classroom_id} 
                          value={classroom.classroom_id}
                          className="bg-gray-900"
                        >
                          {classroom.classroom_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedGrade && classrooms.length === 0 && (
                    <p className="mt-2 text-yellow-400 text-sm">
                      No classrooms found for this grade. Please add a classroom first.
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Learners Selection */}
            {selectedGrade && selectedClassroom && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Select Learners</h2>
                  
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search learners..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>
                
                {filteredLearners.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto mb-6">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="text-left p-3 text-white">Select</th>
                          <th className="text-left p-3 text-white">Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLearners.map(learner => (
                          <tr 
                            key={learner.user_id} 
                            className="border-b border-white/10 hover:bg-white/5"
                          >
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={selectedLearners.includes(learner.user_id)}
                                onChange={() => toggleLearnerSelection(learner.user_id)}
                                className="h-4 w-4 rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                              />
                            </td>
                            <td className="p-3 text-white">
                              {learner.first_name} {learner.last_name}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No learners found for the selected grade
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    onClick={handleAssignLearners}
                    disabled={selectedLearners.length === 0 || !selectedClassroom || assigningLearners}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      selectedLearners.length > 0 && selectedClassroom && !assigningLearners
                        ? 'bg-emerald-600/80 text-white hover:bg-emerald-500'
                        : 'bg-white/10 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>{assigningLearners ? 'Assigning...' : `Assign ${selectedLearners.length} Learners`}</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Assignments Table */}
            {assignments.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Current Assignments</h2>
                  
                  <button
                    onClick={handleSaveAllAssignments}
                    className="px-6 py-3 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
                  >
                    <span>Save All Assignments</span>
                  </button>
                </div>
                
                <div className="space-y-6">
                  {assignments.map((assignment, index) => (
                    <div 
                      key={index}
                      className="bg-white/5 rounded-lg p-4 relative"
                    >
                      <button
                        onClick={() => handleRemoveAssignment(index)}
                        className="absolute top-4 right-4 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      
                      <h3 className="text-lg font-medium text-white mb-4">
                        Teacher: {assignment.teacher.first_name} {assignment.teacher.last_name}
                      </h3>
                      
                      <div className="mb-2 text-gray-300">
                        <span className="font-medium">Assigned Learners ({assignment.learners.length}):</span>
                      </div>
                      
                      <div className="max-h-40 overflow-y-auto bg-white/5 rounded-lg">
                        <table className="w-full">
                          <tbody>
                            {assignment.learners.map(learner => (
                              <tr 
                                key={learner.user_id}
                                className="border-b border-white/10 last:border-0"
                              >
                                <td className="p-3 text-white">
                                  {learner.first_name} {learner.last_name}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'view' && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">View Class Allocations</h2>
            
            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-4">Class 11A - Mathematics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-emerald-400 font-medium mb-2">Assigned Teacher</h4>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white">Sarah Johnson</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-emerald-400 font-medium mb-2">Assigned Learners (25)</h4>
                    <div className="bg-white/5 rounded-lg p-3 max-h-40 overflow-y-auto">
                      <ul className="space-y-2">
                        {Array.from({ length: 25 }, (_, i) => (
                          <li key={i} className="text-white">Learner {i + 1}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-4">Class 11A - English</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-emerald-400 font-medium mb-2">Assigned Teacher</h4>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white">Michael Brown</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-emerald-400 font-medium mb-2">Assigned Learners (22)</h4>
                    <div className="bg-white/5 rounded-lg p-3 max-h-40 overflow-y-auto">
                      <ul className="space-y-2">
                        {Array.from({ length: 22 }, (_, i) => (
                          <li key={i} className="text-white">Learner {i + 1}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}