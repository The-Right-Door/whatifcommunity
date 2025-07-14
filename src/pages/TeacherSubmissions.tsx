import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Filter,
  AlertTriangle,
  Download,
  Eye,
  BarChart2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getSubmissionsForClassroomAndSubject, 
  sendSubmissionReminder, 
  gradeSubmission, 
  getSubmissionStatistics,
  exportSubmissionsToCSV,
  SubmissionWithDetails
} from '../services/submissionService';

export default function TeacherSubmissions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
 // const [classroomName, setClassroomName] = useState<string>('');
 // const [subjectName, setSubjectName] = useState<string>('');
  const [showFeedbackModal, setShowFeedbackModal] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(null);
  const [statistics, setStatistics] = useState<{
    total: number;
    submitted: number;
    pending: number;
    missed: number;
    averageScore: number | null;
  } | null>(null);

  // Parse query parameters
  
  const queryParams = new URLSearchParams(location.search);
  const classroomId = queryParams.get('classroom');
  const subjectId = queryParams.get('subject');

//  const queryParams = new URLSearchParams(location.search);
const classroomName = queryParams.get('classroomName');
const subjectName = queryParams.get('subjectName');
  
  
  useEffect(() => {
    if (classroomId && subjectId) {
    //  fetchClassroomAndSubjectDetails();
      fetchSubmissions();
    } else {
      // If no query params, show sample data
      setLoading(false);
      
      setSubmissions(sampleData);
      setStatistics({
        total: sampleData.length,
        submitted: sampleData.filter(s => s.status === 'submitted').length,
        pending: sampleData.filter(s => s.status === 'pending').length,
        missed: sampleData.filter(s => s.status === 'missed').length,
        averageScore: 86
      });
    }
  }, [classroomId, subjectId]);

  /*
  useEffect(() => {
  const queryParams = new URLSearchParams(location.search);

  const id = queryParams.get('classroom');
  const subj = queryParams.get('subject');
  const classroomNameParam = queryParams.get('classroomName');
  const subjectNameParam = queryParams.get('subjectName');

  if (id && subj) {
    setClassroomId(id);
    setSubjectId(subj);
    if (classroomNameParam) setClassroomName(decodeURIComponent(classroomNameParam));
    if (subjectNameParam) setSubjectName(decodeURIComponent(subjectNameParam));

    fetchSubmissions(); // or fetchLearners()
  }
}, []);

  */
  
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

  
  

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      if (!classroomId || !subjectId) {
        throw new Error('Classroom ID and Subject ID are required');
      }
      
      // Fetch submissions using the service
      const submissionsData = await getSubmissionsForClassroomAndSubject(
        parseInt(classroomId), 
        parseInt(subjectId)
      );
      
      setSubmissions(submissionsData);
      
      // Fetch statistics
      const stats = await getSubmissionStatistics(
        parseInt(classroomId),
        parseInt(subjectId)
      );
      
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
    const matchesSearch = 
      searchTerm === '' || 
      submission.learnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.assessmentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Submitted
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'missed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Missed
          </span>
        );
      default:
        return null;
    }
  };

  const handleSendReminder = async (submission: SubmissionWithDetails) => {
    try {
      // Extract learner ID from the submission
      const learnerId = submission.learnerName.split(' ')[0]; // This is a simplification
      
      // Send reminder using the service
      await sendSubmissionReminder(
        [learnerId], 
        submission.id, 
        `Reminder: Your ${submission.assessmentTitle} is due soon!`
      );
      
      toast.success('Reminder sent to learner');
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder');
    }
  };

  const handleViewSubmission = (submission: SubmissionWithDetails) => {
    setSelectedSubmission(submission);
    setShowFeedbackModal(submission.id);
    setFeedbackText(submission.feedback || '');
  };

  const handleSaveFeedback = async () => {
    if (!selectedSubmission) return;
    
    try {
      // Save feedback using the service
      await gradeSubmission(
        selectedSubmission.learnerName, // This is a simplification
        selectedSubmission.id,
        selectedSubmission.score || 0,
        feedbackText
      );
      
      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === selectedSubmission.id 
            ? { ...sub, feedback: feedbackText } 
            : sub
        )
      );
      
      toast.success('Feedback saved successfully');
      setShowFeedbackModal(null);
      setSelectedSubmission(null);
      setFeedbackText('');
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error('Failed to save feedback');
    }
  };

  const handleExportSubmissions = () => {
    try {
      // Generate CSV data
      const csvContent = exportSubmissionsToCSV(filteredSubmissions);
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `submissions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Submissions exported successfully');
    } catch (error) {
      console.error('Error exporting submissions:', error);
      toast.error('Failed to export submissions');
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
              <h1 className="text-2xl font-bold text-white">Submissions</h1>
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
        {/* Classroom and Subject Info */}
        {(classroomName || subjectName) && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              {classroomName && subjectName 
                ? `${subjectName} - ${classroomName}`
                : classroomName || subjectName}
            </h2>
            <p className="text-gray-300">
              Viewing submissions for {classroomName && subjectName 
                ? `${subjectName} in ${classroomName}`
                : classroomName 
                  ? `classroom ${classroomName}` 
                  : `subject ${subjectName}`}
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Filter by Status</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-emerald-600/80 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('submitted')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterStatus === 'submitted'
                      ? 'bg-emerald-600/80 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Submitted
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterStatus === 'pending'
                      ? 'bg-emerald-600/80 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterStatus('missed')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterStatus === 'missed'
                      ? 'bg-emerald-600/80 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Missed
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by learner or assessment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleExportSubmissions}
              className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>Export Submissions</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-white text-xl">Loading submissions...</div>
          </div>
        )}

        {/* Submissions Table */}
        {!loading && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-4 text-white">Learner Name</th>
                  <th className="text-left p-4 text-white">Assessment Title</th>
                  <th className="text-left p-4 text-white">Status</th>
                  <th className="text-left p-4 text-white">Score</th>
                  <th className="text-left p-4 text-white">Submitted On</th>
                  <th className="text-left p-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map(submission => (
                    <tr key={submission.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-4 text-white">{submission.learnerName}</td>
                      <td className="p-4 text-white">{submission.assessmentTitle}</td>
                      <td className="p-4">
                        {getStatusBadge(submission.status)}
                      </td>
                      <td className="p-4 text-white">
                        {submission.score !== null ? `${submission.score}%` : '-'}
                      </td>
                      <td className="p-4 text-white">
                        {submission.submittedDate || '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-4">
                          {submission.status === 'submitted' ? (
                            <>
                              <button 
                                onClick={() => handleViewSubmission(submission)}
                                className="text-emerald-400 hover:text-emerald-300 transition-colors"
                              >
                                View & Grade
                              </button>
                            </>
                          ) : submission.status === 'pending' ? (
                            <button 
                              onClick={() => handleSendReminder(submission)}
                              className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              <Send className="h-4 w-4" />
                              <span>Send Reminder</span>
                            </button>
                          ) : (
                            <span className="text-gray-400">No action available</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No submissions found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal !== null && selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowFeedbackModal(null)}
            />
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-2xl w-full">
              <h3 className="text-xl font-bold text-white mb-4">Submission Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Learner</h4>
                  <p className="text-white">{selectedSubmission.learnerName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Assessment</h4>
                  <p className="text-white">{selectedSubmission.assessmentTitle}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Status</h4>
                  <div>{getStatusBadge(selectedSubmission.status)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Score</h4>
                  <p className="text-white">{selectedSubmission.score !== null ? `${selectedSubmission.score}%` : '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Submitted On</h4>
                  <p className="text-white">{selectedSubmission.submittedDate || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Grade</h4>
                  <select 
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                    value={selectedSubmission.score || ''}
                    onChange={(e) => {
                      setSelectedSubmission({
                        ...selectedSubmission,
                        score: parseInt(e.target.value)
                      });
                    }}
                  >
                    <option value="" className="bg-gray-900">Select grade</option>
                    {Array.from({length: 11}, (_, i) => (i * 10)).map(score => (
                      <option key={score} value={score} className="bg-gray-900">
                        {score}%
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Feedback</h4>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  rows={4}
                  placeholder="Enter feedback for the learner..."
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowFeedbackModal(null)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFeedback}
                  className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                >
                  Save Feedback
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {!loading && statistics && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Total Submissions</h3>
              <p className="text-3xl font-bold text-white">{statistics.total}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Submitted</h3>
              <p className="text-3xl font-bold text-emerald-400">
                {statistics.submitted}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Pending</h3>
              <p className="text-3xl font-bold text-yellow-400">
                {statistics.pending}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Missed</h3>
              <p className="text-3xl font-bold text-red-400">
                {statistics.missed}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}