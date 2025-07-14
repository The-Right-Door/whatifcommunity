import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  UserPlus, 
  BookOpen, 
  Calendar, 
  Clock, 
  Video,
  Search,
  X,
  Check,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchClassroomById, Classroom } from '../services/classroomService';
import { fetchTeachers } from '../services/teacherService';
import { fetchLearners } from '../services/learnerService';
import { fetchSubjects } from '../services/subjectService';
import { assignTeacherToClassroom, getTeacherAssignments, removeTeacherAssignment } from '../services/teacherAssignmentService';
import { assignLearnerToClassroom, getLearnerAssignments, removeLearnerAssignment } from '../services/learnerAssignmentService';

interface Teacher {
  user_id: string;
  first_name: string;
  last_name: string;
  subjects_majored?: string[];
}

interface Learner {
  user_id: string;
  first_name: string;
  last_name: string;
  grade_id?: number;
}

interface Subject {
  subjects_id: number;
  subjects_name: string;
}

interface TeacherAssignment {
  assignment_id: number;
  teacher_id: string;
  subject_id: number;
  teachers: {
    first_name: string;
    last_name: string;
  };
  subjects: {
    subjects_name: string;
  };
}

interface LearnerAssignment {
  assignment_id: number;
  learner_id: string;
  learners: {
    first_name: string;
    last_name: string;
    grade_id: number;
  };
}

export default function ClassroomDetail() {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [learnerAssignments, setLearnerAssignments] = useState<LearnerAssignment[]>([]);
  
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showLearnerModal, setShowLearnerModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedLearner, setSelectedLearner] = useState<string>('');
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [learnerSearchTerm, setLearnerSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!classroomId) return;
    
    const loadClassroomData = async () => {
      try {
        setLoading(true);
        const classroomData = await fetchClassroomById(parseInt(classroomId));
        setClassroom(classroomData);
        
        // Load teachers, learners, subjects, and assignments
        const [teachersData, learnersData, subjectsData, teacherAssignmentsData, learnerAssignmentsData] = await Promise.all([
          fetchTeachers(),
          fetchLearners(),
          fetchSubjects(),
          getTeacherAssignments(parseInt(classroomId)),
          getLearnerAssignments(parseInt(classroomId))
        ]);
        
        setTeachers(teachersData);
        setLearners(learnersData);
        setSubjects(subjectsData);
        setTeacherAssignments(teacherAssignmentsData);
        setLearnerAssignments(learnerAssignmentsData);
      } catch (error) {
        console.error('Error loading classroom data:', error);
        toast.error('Failed to load classroom details');
      } finally {
        setLoading(false);
      }
    };
    
    loadClassroomData();
  }, [classroomId]);

  const handleAssignTeacher = async () => {
    if (!selectedTeacher || !selectedSubject || !classroomId) {
      toast.error('Please select both a teacher and a subject');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await assignTeacherToClassroom({
        classroom_id: parseInt(classroomId),
        teacher_id: selectedTeacher,
        subject_id: selectedSubject
      });
      
      // Refresh teacher assignments
      const updatedAssignments = await getTeacherAssignments(parseInt(classroomId));
      setTeacherAssignments(updatedAssignments);
      
      toast.success('Teacher assigned successfully');
      setShowTeacherModal(false);
      setSelectedTeacher('');
      setSelectedSubject(null);
    } catch (error) {
      console.error('Error assigning teacher:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to assign teacher');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignLearner = async () => {
    if (!selectedLearner || !classroomId) {
      toast.error('Please select a learner');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await assignLearnerToClassroom({
        classroom_id: parseInt(classroomId),
        learner_id: selectedLearner
      });
      
      // Refresh learner assignments
      const updatedAssignments = await getLearnerAssignments(parseInt(classroomId));
      setLearnerAssignments(updatedAssignments);
      
      toast.success('Learner assigned successfully');
      setShowLearnerModal(false);
      setSelectedLearner('');
    } catch (error) {
      console.error('Error assigning learner:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to assign learner');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTeacher = async (assignmentId: number) => {
    if (!window.confirm('Are you sure you want to remove this teacher?')) return;
    
    try {
      await removeTeacherAssignment(assignmentId);
      
      // Refresh teacher assignments
      const updatedAssignments = await getTeacherAssignments(parseInt(classroomId!));
      setTeacherAssignments(updatedAssignments);
      
      toast.success('Teacher removed successfully');
    } catch (error) {
      console.error('Error removing teacher:', error);
      toast.error('Failed to remove teacher');
    }
  };

  const handleRemoveLearner = async (assignmentId: number) => {
    if (!window.confirm('Are you sure you want to remove this learner?')) return;
    
    try {
      await removeLearnerAssignment(assignmentId);
      
      // Refresh learner assignments
      const updatedAssignments = await getLearnerAssignments(parseInt(classroomId!));
      setLearnerAssignments(updatedAssignments);
      
      toast.success('Learner removed successfully');
    } catch (error) {
      console.error('Error removing learner:', error);
      toast.error('Failed to remove learner');
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const fullName = `${teacher.first_name} ${teacher.last_name}`.toLowerCase();
    return fullName.includes(teacherSearchTerm.toLowerCase());
  });

  const filteredLearners = learners.filter(learner => {
    const fullName = `${learner.first_name} ${learner.last_name}`.toLowerCase();
    return fullName.includes(learnerSearchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading classroom details...</div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-xl">Classroom not found</div>
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
              <h1 className="text-2xl font-bold text-white">Classroom Details</h1>
            </div>
            
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Classroom Info Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">{classroom.classroom_name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Grade</h3>
              <p className="text-white">Grade {classroom.grade_id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Schedule</h3>
              <div className="flex items-center space-x-2 text-white">
                <Calendar className="h-4 w-4 text-emerald-400" />
                <span>{classroom.schedule_days || 'Not specified'}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Time</h3>
              <div className="flex items-center space-x-2 text-white">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span>{classroom.schedule_time || 'Not specified'}</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-400">Description</h3>
            <p className="text-white">{classroom.description || 'No description provided'}</p>
          </div>
        </div>

        {/* Teachers Section */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Assigned Teachers</h2>
            <button
              onClick={() => setShowTeacherModal(true)}
              className="bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
            >
              <UserPlus className="h-5 w-5" />
              <span>Assign Teacher</span>
            </button>
          </div>

          {teacherAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No teachers assigned to this classroom yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teacherAssignments.map((assignment) => (
                <div 
                  key={assignment.assignment_id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        {assignment.teachers.first_name} {assignment.teachers.last_name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <BookOpen className="h-4 w-4 text-emerald-400" />
                        <span className="text-gray-300">{assignment.subjects.subjects_name}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveTeacher(assignment.assignment_id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Learners Section */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Enrolled Learners</h2>
            <button
              onClick={() => setShowLearnerModal(true)}
              className="bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
            >
              <UserPlus className="h-5 w-5" />
              <span>Assign Learner</span>
            </button>
          </div>

          {learnerAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No learners enrolled in this classroom yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {learnerAssignments.map((assignment) => (
                <div 
                  key={assignment.assignment_id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        {assignment.learners.first_name} {assignment.learners.last_name}
                      </h3>
                      <div className="text-gray-300 mt-2">
                        Grade {assignment.learners.grade_id}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveLearner(assignment.assignment_id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assign Teacher Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowTeacherModal(false)}
          />
          
          <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg w-full max-w-md mx-4 overflow-hidden shadow-xl animate-slideUp">
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h2 className="text-xl font-bold text-white">Assign Teacher</h2>
              <button 
                onClick={() => setShowTeacherModal(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Search Teacher</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={teacherSearchTerm}
                    onChange={(e) => setTeacherSearchTerm(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Select Teacher</label>
                <div className="max-h-40 overflow-y-auto bg-white/5 rounded-lg">
                  {filteredTeachers.length === 0 ? (
                    <div className="p-4 text-gray-400 text-center">No teachers found</div>
                  ) : (
                    filteredTeachers.map(teacher => (
                      <div
                        key={teacher.user_id}
                        className={`p-3 cursor-pointer hover:bg-white/10 transition-colors ${
                          selectedTeacher === teacher.user_id ? 'bg-emerald-600/20 border-l-4 border-emerald-500' : ''
                        }`}
                        onClick={() => setSelectedTeacher(teacher.user_id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">{teacher.first_name} {teacher.last_name}</p>
                            {teacher.subjects_majored && (
                              <p className="text-sm text-gray-400">
                                {teacher.subjects_majored.join(', ')}
                              </p>
                            )}
                          </div>
                          {selectedTeacher === teacher.user_id && (
                            <Check className="h-5 w-5 text-emerald-400" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Select Subject</label>
                <select
                  value={selectedSubject || ''}
                  onChange={(e) => setSelectedSubject(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                >
                  <option value="" className="bg-gray-900">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject.subjects_id} value={subject.subjects_id} className="bg-gray-900">
                      {subject.subjects_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowTeacherModal(false)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignTeacher}
                  disabled={!selectedTeacher || !selectedSubject || isSubmitting}
                  className={`px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors ${
                    (!selectedTeacher || !selectedSubject || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Assigning...' : 'Assign Teacher'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Learner Modal */}
      {showLearnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowLearnerModal(false)}
          />
          
          <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg w-full max-w-md mx-4 overflow-hidden shadow-xl animate-slideUp">
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h2 className="text-xl font-bold text-white">Assign Learner</h2>
              <button 
                onClick={() => setShowLearnerModal(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Search Learner</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={learnerSearchTerm}
                    onChange={(e) => setLearnerSearchTerm(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Select Learner</label>
                <div className="max-h-60 overflow-y-auto bg-white/5 rounded-lg">
                  {filteredLearners.length === 0 ? (
                    <div className="p-4 text-gray-400 text-center">No learners found</div>
                  ) : (
                    filteredLearners.map(learner => (
                      <div
                        key={learner.user_id}
                        className={`p-3 cursor-pointer hover:bg-white/10 transition-colors ${
                          selectedLearner === learner.user_id ? 'bg-emerald-600/20 border-l-4 border-emerald-500' : ''
                        }`}
                        onClick={() => setSelectedLearner(learner.user_id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">{learner.first_name} {learner.last_name}</p>
                            {learner.grade_id && (
                              <p className="text-sm text-gray-400">
                                Grade {learner.grade_id}
                              </p>
                            )}
                          </div>
                          {selectedLearner === learner.user_id && (
                            <Check className="h-5 w-5 text-emerald-400" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowLearnerModal(false)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignLearner}
                  disabled={!selectedLearner || isSubmitting}
                  className={`px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors ${
                    (!selectedLearner || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Assigning...' : 'Assign Learner'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}