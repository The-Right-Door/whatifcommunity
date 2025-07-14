import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  UserCog, 
  Check, 
  Search,
  Filter,
  BookOpen,
  GraduationCap,
  Settings
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';
import { allocateTeachersToClassrooms, getTeacherAllocations } from '../services/allocateTeacherService';

interface Teacher {
  id: string;
  name: string;
  role: string;
  subjects: string[];
}

interface Class {
  id: number;
  name: string;
  grade: string;
  stream: string;
}

export default function AllocateTeachers() {
  const navigate = useNavigate();
  const { hasSpecialPermissions } = useUser();
  
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [searchTeacherTerm, setSearchTeacherTerm] = useState<string>('');
  const [searchClassTerm, setSearchClassTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [allocations, setAllocations] = useState<any[]>([]);

  // Redirect if user doesn't have special permissions
  useEffect(() => {
    if (!hasSpecialPermissions) {
      navigate('/teacher/dashboard');
    }
  }, [hasSpecialPermissions, navigate]);

  // Fetch subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('subjects')
          .select('subjects_id, subjects_name')
          .eq('subjects_status', 'active');
          
        if (error) throw error;
        
        setSubjects(data.map(subject => subject.subjects_name));
        
        // Create a mapping of subject names to IDs
        const subjectMapping = data.reduce((acc, subject) => {
          acc[subject.subjects_name] = subject.subjects_id;
          return acc;
        }, {});
        
        // Store this mapping in component state or context if needed
        window.subjectMapping = subjectMapping;
        
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast.error('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubjects();
    fetchAllocations();
  }, []);

  // Fetch teachers when subject changes
  useEffect(() => {
    const fetchTeachers = async () => {
      if (!selectedSubject) return;
      
      try {
        setLoading(true);
        
        // Get the subject ID from the mapping
        const subjectId = window.subjectMapping?.[selectedSubject];
        setSelectedSubjectId(subjectId);
        
        // In a real app, this would be a more complex query to find teachers
        // who are qualified to teach the selected subject
        const { data, error } = await supabase
          .from('users')
          .select('user_id, first_name, last_name, subjects_majored')
          .eq('role', 'teacher')
          .contains('subjects_majored', [selectedSubject]);
          
        if (error) throw error;
        
        const formattedTeachers = data.map(teacher => ({
          id: teacher.user_id,
          name: `${teacher.first_name} ${teacher.last_name}`,
          role: Math.random() > 0.8 ? 'Head of Department' : 'Teacher',
          subjects: teacher.subjects_majored || []
        }));
        
        setTeachers(formattedTeachers);
        setSelectedTeachers([]);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        toast.error('Failed to load teachers for this subject');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeachers();
  }, [selectedSubject]);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would fetch actual classes from the database
        const { data, error } = await supabase
          .from('classrooms')
          .select(`
            classroom_id,
            classroom_name,
            grade_id,
            grades!inner(grade_no, grade_name),
            stream_id
          `);
          
        if (error) throw error;
        
        const formattedClasses = data.map(classroom => ({
          id: classroom.classroom_id,
          name: classroom.classroom_name,
          grade: `Grade ${classroom.grades.grade_name || classroom.grades.grade_no}`,
          stream: classroom.stream_id || 'General'
        }));
        
        setClasses(formattedClasses);
        setSelectedClasses([]);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, []);

  const fetchAllocations = async () => {
    try {
      const allocationData = await getTeacherAllocations();
      setAllocations(allocationData);
    } catch (error) {
      console.error('Error fetching allocations:', error);
      toast.error('Failed to load existing allocations');
    }
  };

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchTeacherTerm.toLowerCase())
  );

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchClassTerm.toLowerCase()) ||
    cls.grade.toLowerCase().includes(searchClassTerm.toLowerCase())
  );

  // Group classes by grade
  const classesByGrade: Record<string, Class[]> = {};
  filteredClasses.forEach(cls => {
    if (!classesByGrade[cls.grade]) {
      classesByGrade[cls.grade] = [];
    }
    classesByGrade[cls.grade].push(cls);
  });

  const handleSelectAllTeachers = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTeachers(filteredTeachers.map(teacher => teacher.id));
    } else {
      setSelectedTeachers([]);
    }
  };

  const handleSelectAllClasses = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedClasses(filteredClasses.map(cls => cls.id));
    } else {
      setSelectedClasses([]);
    }
  };

  const handleToggleTeacher = (teacherId: string) => {
    setSelectedTeachers(prev => 
      prev.includes(teacherId)
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleToggleClass = (classId: number) => {
    setSelectedClasses(prev => 
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }
    
    if (selectedTeachers.length === 0) {
      toast.error('Please select at least one teacher');
      return;
    }
    
    if (selectedClasses.length === 0) {
      toast.error('Please select at least one class');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Get the subject ID from the mapping
      const subjectId = selectedSubjectId;
      
      if (!subjectId) {
        throw new Error('Subject ID not found');
      }
      
      // Call the service to allocate teachers to classes
      await allocateTeachersToClassrooms(
        selectedTeachers,
        selectedClasses,
        subjectId
      );
      
      toast.success('Teachers allocated to selected classes successfully.');
      
      // Refresh allocations
      await fetchAllocations();
      
      // Reset selections
      setSelectedTeachers([]);
      setSelectedClasses([]);
    } catch (error) {
      console.error('Error allocating teachers:', error);
      toast.error('Failed to allocate teachers');
    } finally {
      setSubmitting(false);
    }
  };

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
              <h1 className="text-2xl font-bold text-white">Allocating Teachers to Classes</h1>
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Teacher Allocation</h2>
          <Link
            to="/allocation-rules"
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
          >
            <Settings className="h-5 w-5" />
            <span>Allocation Rules</span>
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Select Subject</h2>
          
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-white/40"
            >
              <option value="" className="bg-gray-900">Select a subject</option>
              {subjects.map(subject => (
                <option key={subject} value={subject} className="bg-gray-900">
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedSubject && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Teachers Section */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Select Teachers</h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="select-all-teachers"
                    checked={selectedTeachers.length === filteredTeachers.length && filteredTeachers.length > 0}
                    onChange={handleSelectAllTeachers}
                    className="rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                  />
                  <label htmlFor="select-all-teachers" className="text-white text-sm">
                    Select All Teachers
                  </label>
                </div>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={searchTeacherTerm}
                  onChange={(e) => setSearchTeacherTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-white">Loading teachers...</p>
                  </div>
                ) : filteredTeachers.length > 0 ? (
                  <div className="space-y-2">
                    {filteredTeachers.map(teacher => (
                      <label
                        key={teacher.id}
                        className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTeachers.includes(teacher.id)}
                          onChange={() => handleToggleTeacher(teacher.id)}
                          className="rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                        />
                        <div>
                          <p className="text-white font-medium">{teacher.name}</p>
                          <p className="text-sm text-gray-400">{teacher.role}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No teachers found for this subject</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-sm text-gray-400">
                {selectedTeachers.length} teachers selected
              </div>
            </div>

            {/* Classes Section */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Select Classes</h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="select-all-classes"
                    checked={selectedClasses.length === filteredClasses.length && filteredClasses.length > 0}
                    onChange={handleSelectAllClasses}
                    className="rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                  />
                  <label htmlFor="select-all-classes" className="text-white text-sm">
                    Select All Classes
                  </label>
                </div>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchClassTerm}
                  onChange={(e) => setSearchClassTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-white">Loading classes...</p>
                  </div>
                ) : Object.keys(classesByGrade).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(classesByGrade).map(([grade, gradeClasses]) => (
                      <div key={grade}>
                        <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                          <GraduationCap className="h-5 w-5 mr-2 text-emerald-400" />
                          {grade}
                        </h3>
                        <div className="space-y-2 ml-7">
                          {gradeClasses.map(cls => (
                            <label
                              key={cls.id}
                              className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedClasses.includes(cls.id)}
                                onChange={() => handleToggleClass(cls.id)}
                                className="rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                              />
                              <div>
                                <p className="text-white">{cls.name}</p>
                                {cls.stream !== 'General' && (
                                  <p className="text-sm text-gray-400">Stream: {cls.stream}</p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No classes found</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-sm text-gray-400">
                {selectedClasses.length} classes selected
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!selectedSubject || selectedTeachers.length === 0 || selectedClasses.length === 0 || submitting}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              !selectedSubject || selectedTeachers.length === 0 || selectedClasses.length === 0 || submitting
                ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600/80 text-white hover:bg-emerald-500'
            }`}
          >
            <Check className="h-5 w-5" />
            <span>{submitting ? 'Submitting...' : 'Submit Allocation'}</span>
          </button>
        </div>

        {/* Existing Allocations */}
        {allocations.length > 0 && (
          <div className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Existing Allocations</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-white">Teacher</th>
                    <th className="text-left p-4 text-white">Subject</th>
                    <th className="text-left p-4 text-white">Class</th>
                    <th className="text-left p-4 text-white">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((allocation, index) => (
                    <tr key={allocation.assignment_id} className={`border-b border-white/10 ${index % 2 === 0 ? 'bg-white/[0.03]' : ''}`}>
                      <td className="p-4 text-white">
                        {allocation.teachers?.first_name} {allocation.teachers?.last_name}
                      </td>
                      <td className="p-4 text-white">{allocation.subjects?.subjects_name}</td>
                      <td className="p-4 text-white">{allocation.classrooms?.classroom_name}</td>
                      <td className="p-4 text-white">Grade {allocation.classrooms?.grade_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}