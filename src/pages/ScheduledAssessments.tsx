import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft,
  Search,
  Calendar,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  X,
  Info,
  BookOpen,
  Users2,
  User,
  AlertTriangle,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getScheduledAssessmentFilters, 
  getScheduledAssessments, 
  ScheduledAssessment,
  cancelAssessment,
  markAssessmentAsActive
} from '../services/scheduledAssessmentService';

export default function ScheduledAssessments() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null);
  const [showSendModal, setShowSendModal] = useState<number | null>(null);
  const [dropdownDirection, setDropdownDirection] = useState<'up' | 'down'>('down');
  const [newDate, setNewDate] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  // State for filter options and assessments
  const [subjects, setSubjects] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [assessments, setAssessments] = useState<ScheduledAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  // Load filter options and assessments on component mount
  useEffect(() => {
    const loadFiltersAndAssessments = async () => {
      try {
        setLoading(true);
        
        // Fetch filter options from the service
        const filters = await getScheduledAssessmentFilters();
        setSubjects(filters.subjects);
        setGrades(filters.grades);
        
        // Fetch initial assessments
        const initialAssessments = await getScheduledAssessments();
        setAssessments(initialAssessments);
      } catch (error) {
        console.error('Error loading filters and assessments:', error);
        toast.error('Failed to load assessment data');
      } finally {
        setLoading(false);
      }
    };
    
    loadFiltersAndAssessments();
  }, []);

  // Fetch assessments when filters change
  useEffect(() => {
    const fetchFilteredAssessments = async () => {
      try {
        setLoading(true);
        const filteredAssessments = await getScheduledAssessments(
          selectedSubject !== 'All Subjects' ? selectedSubject : undefined,
          selectedGrade !== 'All Grades' ? selectedGrade : undefined,
          searchTerm || undefined
        );
        setAssessments(filteredAssessments);
      } catch (error) {
        console.error('Error fetching filtered assessments:', error);
        toast.error('Failed to apply filters');
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce the search to avoid too many requests
    const handler = setTimeout(() => {
      fetchFilteredAssessments();
    }, 300);
    
    return () => {
      clearTimeout(handler);
    };
  }, [selectedSubject, selectedGrade, searchTerm]);

  const getAudienceIcon = (audience: string) => {
    switch(audience) {
      case 'Class':
        return <BookOpen className="h-4 w-4" />;
      case 'Group':
        return <Users2 className="h-4 w-4" />;
      case 'Individual':
        return <User className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

const handleDropdownClick = (
  e: React.MouseEvent<HTMLButtonElement>,
  assessmentId: number
) => {
  const rect = e.currentTarget.getBoundingClientRect();
  /*
  const parentOffsetTop = e.currentTarget.offsetTop;
  const parentOffsetLeft = e.currentTarget.offsetLeft;

  setDropdownPosition({
    top: parentOffsetTop + 40, // adds spacing below the button
    left: parentOffsetLeft - 180, // adjust based on table width
  });
   */
   setDropdownPosition({
    top: rect.bottom + window.scrollY + 8,
    left: rect.left + window.scrollX,
  });

  setShowActionMenu(showActionMenu === assessmentId ? null : assessmentId);
};
  
  const handleView = (id: number) => {
    toast.success(`Viewing assessment ${id}`);
    setShowActionMenu(null);
    // Navigate to view page
    // navigate(`/teacher/assessments/${id}`);
  };

  const handleEdit = (id: number) => {
    toast.success(`Editing assessment ${id}`);
    setShowActionMenu(null);
    // Navigate to edit page
    // navigate(`/teacher/assessments/${id}/edit`);
  };

  const handleReschedule = (id: number) => {
    if (!newDate) {
      toast.error('Please select a new date');
      return;
    }
    
    toast.success(`Assessment ${id} rescheduled to ${newDate}`);
    setShowRescheduleModal(null);
    setNewDate('');
  };

  /*
  const handleCancel = (id: number) => {
    toast.success(`Assessment ${id} cancelled`);
    setShowCancelModal(null);
    // Logic to cancel assessment
  };
  */

  const handleCancel = async (id: number) => {
  try {
    await cancelAssessment(id);
    toast.success(`Assessment ${id} cancelled`);

    // Refresh list
    const updated = await getScheduledAssessments(
      selectedSubject !== 'All Subjects' ? selectedSubject : undefined,
      selectedGrade !== 'All Grades' ? selectedGrade : undefined,
      searchTerm || undefined
    );
    setAssessments(updated);
  } catch (error) {
    console.error(error);
    toast.error('Failed to cancel assessment');
  } finally {
    setShowCancelModal(null);
  }
};

  const handleSendToLearners = async (id: number) => {
    try {
      await markAssessmentAsActive(id);
      toast.success(`Assessment ${id} sent to learners`);
      
      // Refresh the assessments list
      const updatedAssessments = await getScheduledAssessments(
        selectedSubject !== 'All Subjects' ? selectedSubject : undefined,
        selectedGrade !== 'All Grades' ? selectedGrade : undefined,
        searchTerm || undefined
      );
      setAssessments(updatedAssessments);
    } catch (error) {
      console.error('❌ Failed to send assessment:', error);
      toast.error('Failed to send assessment to learners');
    } finally {
      setShowSendModal(null);
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
              <h1 className="text-2xl font-bold text-white">Scheduled Assessments</h1>
            </div>
            
            <Link 
              to="/teacher/assessments"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Assessments</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Information Banner */}
        <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4 mb-8 flex items-start space-x-3">
          <div className="p-1 bg-blue-500/30 rounded-full">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-1">Scheduled Assessments</h3>
            <p className="text-gray-300">
              These assessments are scheduled but not yet live. Learners will be able to access them on the scheduled date.
              You can reschedule or cancel these assessments before they go live.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by title or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>
            
            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject} className="bg-gray-900">
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Grade Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Grade</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              >
                {grades.map(grade => (
                  <option key={grade} value={grade} className="bg-gray-900">
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-pulse bg-white/10 h-8 w-32 mx-auto rounded mb-4"></div>
            <div className="animate-pulse bg-white/10 h-4 w-48 mx-auto rounded"></div>
          </div>
        )}

        {/* Assessments Table */}
        {!loading && (
          <div className=" bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20 bg-white/5">
                  <th className="text-left p-4 text-white">Title</th>
                  <th className="text-left p-4 text-white">Subject</th>
                  <th className="text-left p-4 text-white">Grade</th>
                  <th className="text-left p-4 text-white">Scheduled For</th>
                  <th className="text-left p-4 text-white">Target Audience</th>
                  <th className="text-left p-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((assessment, index) => (
                  <tr 
                    key={assessment.id} 
                    className={`border-b border-white/10 hover:bg-white/5 ${
                      index % 2 === 0 ? 'bg-white/[0.03]' : ''
                    }`}
                  >
                    <td className="p-4 text-white font-medium">{assessment.title}</td>
                    <td className="p-4 text-white">{assessment.subject}</td>
                    <td className="p-4 text-white">{assessment.grade}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                        <span className="text-white">{assessment.scheduledFor}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`p-1 rounded-full ${
                          assessment.targetAudience === 'Class' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : assessment.targetAudience === 'Group'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {getAudienceIcon(assessment.targetAudience)}
                        </span>
                        <div>
                          <span className="text-white">{assessment.targetAudience}</span>
                          <p className="text-xs text-gray-400">
  {typeof assessment.audienceDetails === 'string'
    ? assessment.audienceDetails
    : 'No details provided'}
</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="relative inline-block text-left">
        <button
  
          onClick={() => setShowActionMenu(showActionMenu === assessment.id ? null : assessment.id)}
  className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
>
  <MoreVertical className="h-5 w-5" />
</button>
                        
                        {/* Action Menu Dropdown */}
                        
                        {showActionMenu !== null && (
  <div
    className="fixed z-50 w-64 bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl"
    style={{
      top: dropdownPosition.top,
      left: dropdownPosition.left,
    }}
  >
    <div className="py-1">
      <button
        onClick={() => handleView(showActionMenu)}
        className="w-full text-left px-4 py-2 text-white hover:bg-white/10 flex items-center space-x-2"
      >
        <Eye className="h-4 w-4" />
        <span>View</span>
      </button>
      <button
        onClick={() => handleEdit(showActionMenu)}
        className="w-full text-left px-4 py-2 text-white hover:bg-white/10 flex items-center space-x-2"
      >
        <Edit className="h-4 w-4" />
        <span>Edit</span>
      </button>
      <button
        onClick={() => {
          setShowSendModal(showActionMenu);
          setShowActionMenu(null);
        }}
        className="w-full text-left px-4 py-2 text-white hover:bg-white/10 flex items-center space-x-2"
      >
        <Send className="h-4 w-4" />
        <span>Send to Learners</span>
      </button>
      <button
        onClick={() => {
          setShowRescheduleModal(showActionMenu);
          setShowActionMenu(null);
        }}
        className="w-full text-left px-4 py-2 text-white hover:bg-white/10 flex items-center space-x-2"
      >
        <Calendar className="h-4 w-4" />
        <span>Reschedule</span>
      </button>
      <button
        onClick={() => {
          setShowCancelModal(showActionMenu);
          setShowActionMenu(null);
        }}
        className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 flex items-center space-x-2"
      >
        <X className="h-4 w-4" />
        <span>Cancel</span>
      </button>
    </div>
  </div>
)}


                      
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && assessments.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No scheduled assessments found</h3>
            <p className="text-gray-400">
              Try adjusting your search or filters to find what you're looking for
            </p>
          </div>
        )}

        {/* Reschedule Modal */}
        {showRescheduleModal !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowRescheduleModal(null)}
            />
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">Reschedule Assessment</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">
                  New Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-white/40"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowRescheduleModal(null)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReschedule(showRescheduleModal)}
                  className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                  disabled={!newDate}
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCancelModal(null)}
            />
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Cancel Assessment</h3>
              </div>
              
              <p className="text-gray-300 mb-6">
                Are you sure you want to cancel this scheduled assessment? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowCancelModal(null)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Keep Assessment
                </button>
                <button
                  onClick={() => handleCancel(showCancelModal)}
                  className="px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  Cancel Assessment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send to Learners Modal */}
        {showSendModal !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSendModal(null)}
            />
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-emerald-500/20 rounded-full">
                  <Send className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Send to Learners</h3>
              </div>
              
              <p className="text-gray-300 mb-6">
                This will make the assessment immediately available to learners, overriding the scheduled date. Are you sure you want to proceed?
              </p>
              
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                  <p className="text-sm text-blue-300">
                    Learners will receive a notification that the assessment is available. The due date will remain the same.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowSendModal(null)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSendToLearners(showSendModal)}
                  className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Now</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}