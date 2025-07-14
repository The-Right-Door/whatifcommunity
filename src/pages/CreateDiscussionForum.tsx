import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Search, 
  BookOpen, 
  GraduationCap, 
  MessageSquare,
  CheckCircle,
  UserPlus,
  Users2,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useUser } from '../contexts/UserContext';
import { 
  getTopicsWithHelpRequests, 
  getTopPerformingLearners, 
  getLearnersRequestingHelp,
  createDiscussionForum,
  ForumLearner
} from '../services/discussionForumService';
import { getTeacherSubjects } from '../services/subjectService';

interface Subject {
  subjects_id: number;
  subjects_name: string;
  grades?: { grade_no: number; grade_name: string | null }[];
}

interface Grade {
  id: number;
  name: string;
}

interface Classroom {
  id: number;
  name: string;
  grade: string;
}

interface Topic {
  topicId: number;
  topicName: string;
  subtopics: {
    id: number;
    name: string;
    requestCount: number;
  }[];
}

export default function CreateDiscussionForum() {
  const navigate = useNavigate();
  const { isTeacher } = useUser();
  
  const [formData, setFormData] = useState({
    forumName: '',
    forumDescription: '',
    selectedSubject: '',
    selectedGrades: [] as number[],
    message: ''
  });
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [learnersAsking, setLearnersAsking] = useState<ForumLearner[]>([]);
  const [learnersHelping, setLearnersHelping] = useState<ForumLearner[]>([]);
  const [selectedClassrooms, setSelectedClassrooms] = useState<number[]>([]);
  const [selectedLearnersHelping, setSelectedLearnersHelping] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    // Redirect if not a teacher
    if (!isTeacher) {
      toast.error('Only teachers can create discussion forums');
      navigate('/teacher/dashboard');
      return;
    }
    
    fetchSubjects();
  }, [isTeacher, navigate]);
  
  useEffect(() => {
    if (formData.selectedSubject && formData.selectedGrades.length > 0) {
      fetchTopicsAndLearners();
    }
  }, [formData.selectedSubject, formData.selectedGrades]);
  
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const subjectsData = await getTeacherSubjects();
      setSubjects(subjectsData);
      
      // Extract all grades from subjects
      const allGrades: Grade[] = [];
      subjectsData.forEach(subject => {
        subject.grades?.forEach(grade => {
          if (!allGrades.some(g => g.id === grade.grade_no)) {
            allGrades.push({
              id: grade.grade_no,
              name: grade.grade_name || `Grade ${grade.grade_no}`
            });
          }
        });
      });
      
      setGrades(allGrades.sort((a, b) => a.id - b.id));
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTopicsAndLearners = async () => {
    try {
      setLoading(true);
      
      // Fetch topics, classrooms, and learners in parallel
      const [topicsData, learnersAskingData, learnersHelpingData] = await Promise.all([
        getTopicsWithHelpRequests(
          parseInt(formData.selectedSubject), 
          formData.selectedGrades
        ),
        getLearnersRequestingHelp(
          parseInt(formData.selectedSubject), 
          formData.selectedGrades
        ),
        getTopPerformingLearners(
          parseInt(formData.selectedSubject), 
          formData.selectedGrades
        )
      ]);
      
      setTopics(topicsData);
      setLearnersAsking(learnersAskingData);
      setLearnersHelping(learnersHelpingData);
      
      // Auto-select all learners asking for help
      const askingIds = learnersAskingData.map(learner => learner.id);
      
      // Generate mock classrooms based on grades
      const mockClassrooms = formData.selectedGrades.map(gradeId => ({
        id: gradeId * 100,
        name: `Class ${gradeId}A`,
        grade: `Grade ${gradeId}`
      }));
      
      setClassrooms(mockClassrooms);
    } catch (error) {
      console.error('Error fetching topics and learners:', error);
      toast.error('Failed to load topics and learners');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGradeChange = (gradeId: number) => {
    setFormData(prev => {
      const selectedGrades = prev.selectedGrades.includes(gradeId)
        ? prev.selectedGrades.filter(id => id !== gradeId)
        : [...prev.selectedGrades, gradeId];
      
      return { ...prev, selectedGrades };
    });
  };
  
  const toggleClassroom = (classroomId: number) => {
    setSelectedClassrooms(prev => 
      prev.includes(classroomId)
        ? prev.filter(id => id !== classroomId)
        : [...prev, classroomId]
    );
  };
  
  const toggleLearnerHelping = (learnerId: string) => {
    setSelectedLearnersHelping(prev => 
      prev.includes(learnerId)
        ? prev.filter(id => id !== learnerId)
        : [...prev, learnerId]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.forumName) {
      toast.error('Forum name is required');
      return;
    }
    
    if (!formData.selectedSubject) {
      toast.error('Please select a subject');
      return;
    }
    
    if (formData.selectedGrades.length === 0) {
      toast.error('Please select at least one grade');
      return;
    }
    
    if (selectedClassrooms.length === 0) {
      toast.error('Please select at least one classroom');
      return;
    }
    
    if (learnersAsking.length === 0) {
      toast.error('No learners are asking for help in the selected subject and grades');
      return;
    }
    
    if (selectedLearnersHelping.length === 0) {
      toast.error('Please select at least one learner to help');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const forumId = await createDiscussionForum(
        formData.forumName,
        formData.forumDescription,
        parseInt(formData.selectedSubject),
        formData.selectedGrades,
        selectedClassrooms,
        learnersAsking.map(l => l.id),
        selectedLearnersHelping,
        formData.message
      );
      
      toast.success('Discussion forum created successfully');
      navigate('/manage-discussion-forums');
    } catch (error) {
      console.error('Error creating forum:', error);
      toast.error('Failed to create discussion forum');
    } finally {
      setSubmitting(false);
    }
  };
  
  const filteredLearnersHelping = learnersHelping.filter(learner => 
    learner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
              <h1 className="text-2xl font-bold text-white">Create Discussion Forum</h1>
            </div>
            
            <Link 
              to="/manage-discussion-forums"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Forums</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Create Discussion Forum</h2>
          <p className="text-gray-300">Connect learners who need help with those who can provide assistance.</p>
        </div>
        
        {/* Create Forum Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Forum Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.forumName}
                  onChange={(e) => setFormData({ ...formData, forumName: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  placeholder="Enter forum name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Subject <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={formData.selectedSubject}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      selectedSubject: e.target.value,
                      selectedGrades: []
                    })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-white/40"
                    required
                  >
                    <option value="" className="bg-gray-900">Select a subject</option>
                    {subjects.map(subject => (
                      <option key={subject.subjects_id} value={subject.subjects_id} className="bg-gray-900">
                        {subject.subjects_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-white mb-2">
                Forum Description
              </label>
              <textarea
                value={formData.forumDescription}
                onChange={(e) => setFormData({ ...formData, forumDescription: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                placeholder="Enter forum description (optional)"
                rows={3}
              />
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-white mb-2">
                Select Grades <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {grades.map(grade => (
                  <label
                    key={grade.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      formData.selectedGrades.includes(grade.id)
                        ? 'bg-emerald-600/30 border border-emerald-500/50'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedGrades.includes(grade.id)}
                      onChange={() => handleGradeChange(grade.id)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white">{grade.name}</span>
                      {formData.selectedGrades.includes(grade.id) && (
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          {/* Classrooms and Topics */}
          {formData.selectedSubject && formData.selectedGrades.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-6">Classrooms and Topics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Select Classrooms <span className="text-red-400">*</span>
                  </label>
                  <div className="bg-white/5 rounded-lg p-3 max-h-60 overflow-y-auto">
                    {classrooms.length > 0 ? (
                      classrooms.map(classroom => (
                        <label
                          key={classroom.id}
                          className="flex items-center space-x-3 p-3 hover:bg-white/5 cursor-pointer border-b border-white/10 last:border-0"
                        >
                          <input
                            type="checkbox"
                            checked={selectedClassrooms.includes(classroom.id)}
                            onChange={() => toggleClassroom(classroom.id)}
                            className="rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                          />
                          <div>
                            <p className="text-white">{classroom.name}</p>
                            <p className="text-sm text-gray-400">{classroom.grade}</p>
                          </div>
                        </label>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-4">No classrooms found</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Topics with Help Requests
                  </label>
                  <div className="bg-white/5 rounded-lg p-3 max-h-60 overflow-y-auto">
                    {topics.length > 0 ? (
                      topics.map(topic => (
                        <div key={topic.topicId} className="mb-3 last:mb-0">
                          <h4 className="text-white font-medium mb-2">{topic.topicName}</h4>
                          <div className="space-y-2 pl-4">
                            {topic.subtopics.map(subtopic => (
                              <div key={subtopic.id} className="flex justify-between items-center">
                                <span className="text-gray-300">{subtopic.name}</span>
                                <span className="text-emerald-400 text-sm">{subtopic.requestCount} requests</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-4">No topics with help requests</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Learners */}
          {formData.selectedSubject && formData.selectedGrades.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-6">Learners</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-white">
                      Learners Asking for Help
                    </label>
                    <span className="text-sm text-gray-300">
                      {learnersAsking.length} learners
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 max-h-60 overflow-y-auto">
                    {learnersAsking.length > 0 ? (
                      learnersAsking.map(learner => (
                        <label
                          key={learner.id}
                          className="flex items-center space-x-3 p-3 hover:bg-white/5 cursor-pointer border-b border-white/10 last:border-0"
                        >
                          <input
                            type="checkbox"
                            checked={true}
                            disabled
                            className="rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                          />
                          <div>
                            <p className="text-white">{learner.name}</p>
                            <p className="text-sm text-emerald-400">Needs help</p>
                          </div>
                        </label>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-4">No learners asking for help</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-white">
                      Top Performers (Select Helpers)
                    </label>
                    <span className="text-sm text-gray-300">
                      {selectedLearnersHelping.length} selected
                    </span>
                  </div>
                  
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search top performers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    />
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3 max-h-60 overflow-y-auto">
                    {filteredLearnersHelping.length > 0 ? (
                      filteredLearnersHelping.map(learner => (
                        <label
                          key={learner.id}
                          className="flex items-center space-x-3 p-3 hover:bg-white/5 cursor-pointer border-b border-white/10 last:border-0"
                        >
                          <input
                            type="checkbox"
                            checked={selectedLearnersHelping.includes(learner.id)}
                            onChange={() => toggleLearnerHelping(learner.id)}
                            className="rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                          />
                          <div>
                            <p className="text-white">{learner.name}</p>
                            <p className="text-sm text-emerald-400">Top performer</p>
                          </div>
                        </label>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-4">No top performers found</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-white mb-2">
                  Welcome Message / Instructions
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  placeholder="Enter a welcome message or instructions for the forum participants"
                  rows={3}
                />
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                submitting
                  ? 'bg-white/20 text-gray-300 cursor-not-allowed'
                  : 'bg-emerald-600/80 text-white hover:bg-emerald-500'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span>{submitting ? 'Creating...' : 'Create Forum'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}