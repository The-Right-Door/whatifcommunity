import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  UserPlus, 
  Search,
  Filter,
  List,
  ClipboardList,
  Trophy,
  Calendar,
  BarChart,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import ClassroomSubjectModal from '../components/ClassroomSubjectModal';

interface Learner {
  id: string;
  firstName: string;
  lastName: string;
  attendance: string;
  submissions: string;
  lastActive: string;
}

interface QueryParams {
  classroom?: string;
  subject?: string;
}

type Tab = 'list' | 'submissions' | 'leaderboard' | 'attendance' | 'reports';

export default function TeacherLearners() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [classroomName, setClassroomName] = useState<string>('');
  const [subjectName, setSubjectName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const classroomId = queryParams.get('classroom');
  const subjectId = queryParams.get('subject');

  useEffect(() => {
    if (classroomId && subjectId) {
      fetchClassroomAndSubjectDetails();
      fetchLearners();
    } else {
      // If no query params, show sample data
      setLoading(false);
      setLearners([
        { id: '1', firstName: 'John', lastName: 'Smith', attendance: '85%', submissions: '12/15', lastActive: '2 hours ago' },
        { id: '2', firstName: 'Sarah', lastName: 'Johnson', attendance: '92%', submissions: '15/15', lastActive: '1 day ago' },
        { id: '3', firstName: 'Michael', lastName: 'Brown', attendance: '78%', submissions: '10/15', lastActive: '3 hours ago' },
        { id: '4', firstName: 'Emily', lastName: 'Davis', attendance: '95%', submissions: '14/15', lastActive: '5 minutes ago' },
        { id: '5', firstName: 'David', lastName: 'Wilson', attendance: '65%', submissions: '8/15', lastActive: '2 days ago' }
      ]);
    }
  }, [classroomId, subjectId]);

  const fetchClassroomAndSubjectDetails = async () => {
    try {
      // Fetch classroom details
      if (classroomId) {
        const { data: classroomData, error: classroomError } = await supabase
          .from('classrooms')
          .select('classroom_name')
          .eq('classroom_id', classroomId)
          .single();

        if (classroomError) throw classroomError;
        setClassroomName(classroomData.classroom_name);
      }

      // Fetch subject details
      if (subjectId) {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('subjects_name')
          .eq('subjects_id', subjectId)
          .single();

        if (subjectError) throw subjectError;
        setSubjectName(subjectData.subjects_name);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      toast.error('Failed to load classroom or subject details');
    }
  };

  const fetchLearners = async () => {
    try {
      setLoading(true);
      
      // Get learners in this classroom
      const { data: learnerAssignments, error: assignmentError } = await supabase
        .from('classroom_learners')
        .select(`
          learner_id,
          learners:learner_id(
            user_id,
            first_name,
            last_name
          )
        `)
        .eq('classroom_id', classroomId);

      if (assignmentError) throw assignmentError;

      // Transform the data
      const formattedLearners = learnerAssignments.map(assignment => {
        // In a real app, you would fetch actual attendance, submissions, and last active data
        // For now, we'll generate random values
        const attendance = Math.floor(Math.random() * 30) + 70 + '%'; // 70-100%
        const totalAssignments = 15;
        const completedAssignments = Math.floor(Math.random() * (totalAssignments + 1));
        const submissions = `${completedAssignments}/${totalAssignments}`;
        
        // Generate a random "last active" time
        const timeUnits = ['minutes', 'hours', 'days'];
        const timeValue = Math.floor(Math.random() * 24) + 1;
        const timeUnit = timeUnits[Math.floor(Math.random() * timeUnits.length)];
        const lastActive = `${timeValue} ${timeUnit} ago`;
        
        return {
          id: assignment.learner_id,
          firstName: assignment.learners.first_name,
          lastName: assignment.learners.last_name,
          attendance,
          submissions,
          lastActive
        };
      });

      setLearners(formattedLearners);
    } catch (error) {
      console.error('Error fetching learners:', error);
      toast.error('Failed to load learners');
    } finally {
      setLoading(false);
    }
  };

  /*
  const handleTabClick = (tab: Tab) => {
    if (tab === 'submissions') {
      navigate(`/teacher/submissions?classroom=${classroomId}&subject=${subjectId}`);
    } else if (tab === 'leaderboard') {
      navigate(`/teacher/leaderboard?classroom=${classroomId}&subject=${subjectId}`);
    } else if (tab === 'attendance') {
      navigate('/teacher/attendance');
    } else if (tab === 'reports') {
      navigate('/teacher/progress-reports');
    } else {
      setActiveTab(tab);
    }
  };

  */

  const handleTabClick = (tab: Tab) => {
  const encodedClassroomName = encodeURIComponent(classroomName);
  const encodedSubjectName = encodeURIComponent(subjectName);

  if (tab === 'submissions') {
    navigate(`/teacher/submissions?classroom=${classroomId}&subject=${subjectId}&classroomName=${encodedClassroomName}&subjectName=${encodedSubjectName}`);
  } else if (tab === 'leaderboard') {
    navigate(`/teacher/leaderboard?classroom=${classroomId}&subject=${subjectId}&classroomName=${encodedClassroomName}&subjectName=${encodedSubjectName}`);
  } else if (tab === 'attendance') {
    navigate('/teacher/attendance');
  } else if (tab === 'reports') {
    navigate('/teacher/progress-reports');
  } else {
    setActiveTab(tab);
  }
};

  
  const filteredLearners = learners.filter(learner => {
    const matchesSearch = 
      searchTerm === '' || 
      `${learner.firstName} ${learner.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getAttendanceColor = (attendance: string) => {
    const value = parseInt(attendance);
    if (value >= 90) return 'text-emerald-400';
    if (value >= 75) return 'text-blue-400';
    if (value >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSubmissionsColor = (submissions: string) => {
    const [completed, total] = submissions.split('/').map(Number);
    const percentage = (completed / total) * 100;
    
    if (percentage >= 90) return 'text-emerald-400';
    if (percentage >= 75) return 'text-blue-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
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
              <h1 className="text-2xl font-bold text-white">My Learners</h1>
            </div>
            
            {classroomId && subjectId ? (
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Go Back</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
              >
                <UserPlus className="h-5 w-5" />
                <span>Select Class</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Classroom and Subject Info */}
        {(classroomName || subjectName) && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              {classroomName && subjectName 
                ? `${subjectName} - ${classroomName}`
                : classroomName || subjectName}
            </h2>
            <p className="text-gray-300">
              Viewing learners for {classroomName && subjectName 
                ? `${subjectName} in ${classroomName}`
                : classroomName 
                  ? `classroom ${classroomName}` 
                  : `subject ${subjectName}`}
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => handleTabClick('list')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'list'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <List className="h-5 w-5" />
            <span>Learners List</span>
          </button>
          
          <button
            onClick={() => handleTabClick('submissions')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'submissions'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <ClipboardList className="h-5 w-5" />
            <span>View Submissions</span>
          </button>
          
          <button
            onClick={() => handleTabClick('leaderboard')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'leaderboard'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Trophy className="h-5 w-5" />
            <span>Leaderboard</span>
          </button>
          
          <button
            onClick={() => handleTabClick('attendance')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'attendance'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Attendance</span>
          </button>
          
          <button
            onClick={() => handleTabClick('reports')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'reports'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <BarChart className="h-5 w-5" />
            <span>Progress Reports</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search learners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
            </div>
            
            <button className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-white text-xl">Loading learners...</div>
          </div>
        )}

        {/* Learners List */}
        {!loading && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-4 text-white">First Name</th>
                  <th className="text-left p-4 text-white">Last Name</th>
                  <th className="text-left p-4 text-white">Attendance</th>
                  <th className="text-left p-4 text-white">Submissions</th>
                  <th className="text-left p-4 text-white">Last Active</th>
                  <th className="text-left p-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLearners.map(learner => (
                  <tr key={learner.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4 text-white">{learner.firstName}</td>
                    <td className="p-4 text-white">{learner.lastName}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-white/10 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              parseInt(learner.attendance) >= 90 ? 'bg-emerald-500' :
                              parseInt(learner.attendance) >= 75 ? 'bg-blue-500' :
                              parseInt(learner.attendance) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: learner.attendance }}
                          ></div>
                        </div>
                        <span className={`text-white ${getAttendanceColor(learner.attendance)}`}>{learner.attendance}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-white ${getSubmissionsColor(learner.submissions)}`}>
                        {learner.submissions}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{learner.lastActive}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => navigate(`/teacher/learner/${learner.id}`)}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          View Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredLearners.length === 0 && (
          <div className="bg-white/5 rounded-lg p-8 text-center">
            <p className="text-gray-300 mb-4">No learners found matching your criteria.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
              }}
              className="bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Performance Summary */}
        {!loading && filteredLearners.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-medium text-white">Attendance</h3>
              </div>
              <p className="text-3xl font-bold text-white">
                {Math.round(filteredLearners.reduce((acc, learner) => acc + parseInt(learner.attendance), 0) / filteredLearners.length)}%
              </p>
              <p className="text-gray-300 mt-2">Average attendance rate</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <ClipboardList className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-medium text-white">Submissions</h3>
              </div>
              <p className="text-3xl font-bold text-white">
                {Math.round(filteredLearners.reduce((acc, learner) => {
                  const [completed, total] = learner.submissions.split('/').map(Number);
                  return acc + (completed / total) * 100;
                }, 0) / filteredLearners.length)}%
              </p>
              <p className="text-gray-300 mt-2">Average submission rate</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <h3 className="text-lg font-medium text-white">At Risk</h3>
              </div>
              <p className="text-3xl font-bold text-white">
                {filteredLearners.filter(learner => parseInt(learner.attendance) < 70).length}
              </p>
              <p className="text-gray-300 mt-2">Learners needing attention</p>
            </div>
          </div>
        )}
      </div>

      {/* Classroom Subject Selection Modal */}
      <ClassroomSubjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}