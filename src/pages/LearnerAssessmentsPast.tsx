import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle, 
  XCircle,
  BarChart,
  Eye,
  RefreshCw
} from 'lucide-react';
import { getPastAssessmentsForLearner, UpcomingAssessment } from '../services/learnerAssessmentService';
import toast from 'react-hot-toast';

export default function LearnerAssessmentsPast() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedResult, setSelectedResult] = useState('All');
  const [showFeedbackModal, setShowFeedbackModal] = useState<number | null>(null);
  const [pastAssessments, setPastAssessments] = useState<UpcomingAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        setError(null);
        const assessments = await getPastAssessmentsForLearner();
        setPastAssessments(assessments);
      } catch (err) {
        console.error('Error fetching past assessments:', err);
        setError('Failed to load completed assessments');
        toast.error('Could not load your completed assessments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const filteredAssessments = pastAssessments.filter(assessment => {
    const matchesSearch = 
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'All' || assessment.type === selectedType;
    const matchesResult = selectedResult === 'All' || 
                          (selectedResult === 'Passed' && assessment.score >= 70) ||
                          (selectedResult === 'Failed' && assessment.score < 70);
    
    return matchesSearch && matchesType && matchesResult;
  });

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'Submitted':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'Missed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
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
              <h1 className="text-2xl font-bold text-white">Completed Assessments</h1>
            </div>
            
            <Link 
              to="/learner/assessments"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Assessments</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-8">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSelectedType('All')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === 'All' 
                  ? 'bg-emerald-600/80 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              All Types
            </button>
            <button 
              onClick={() => setSelectedType('Class')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === 'Class' 
                  ? 'bg-emerald-600/80 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Class
            </button>
            <button 
              onClick={() => setSelectedType('Group')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === 'Group' 
                  ? 'bg-emerald-600/80 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Group
            </button>
            <button 
              onClick={() => setSelectedType('Individual')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === 'Individual' 
                  ? 'bg-emerald-600/80 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Individual
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSelectedResult('All')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedResult === 'All' 
                  ? 'bg-emerald-600/80 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              All Results
            </button>
            <button 
              onClick={() => setSelectedResult('Passed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedResult === 'Passed' 
                  ? 'bg-emerald-600/80 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Passed
            </button>
            <button 
              onClick={() => setSelectedResult('Failed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedResult === 'Failed' 
                  ? 'bg-emerald-600/80 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Failed
            </button>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-white/10 h-12 w-12 mb-4"></div>
              <div className="h-4 bg-white/10 rounded w-32 mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-24"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Assessments Table */}
        {!loading && !error && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-4 text-white">Title</th>
                  <th className="text-left p-4 text-white">Subject</th>
                  <th className="text-left p-4 text-white">Grade</th>
                  <th className="text-left p-4 text-white">Date Taken</th>
                  <th className="text-left p-4 text-white">Submission Status</th>
                  <th className="text-left p-4 text-white">Result</th>
                  <th className="text-left p-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map(assessment => (
                  <tr key={assessment.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4 text-white">{assessment.title}</td>
                    <td className="p-4 text-white">{assessment.subject}</td>
                    <td className="p-4 text-white">{assessment.grade}</td>
                    <td className="p-4 text-white"> {assessment.submittedAt?.substring(0, 10) || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {assessment.submissionStatus === 'Submitted' ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="text-white">{assessment.submissionStatus}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {assessment.score >= 70 ? (
                          <span className="text-emerald-400">Passed ({assessment.score}%)</span>
                        ) : (
                          <span className="text-red-400">Failed ({assessment.score}%)</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Link 
                          to={`/learner/assessments/results/${assessment.id}`}
                          className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                          title="View Results"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        
                        {assessment.score < 70 && (
                          <button 
                            className="p-2 bg-emerald-600/80 rounded-lg text-white hover:bg-emerald-500 transition-colors"
                            title="Retake Assessment"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* Feedback Modal */}
                      {showFeedbackModal === assessment.id && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
                          <div 
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowFeedbackModal(null)}
                          />
                          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold text-white mb-4">Assessment Feedback</h3>
                            
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-400">Assessment</h4>
                                <p className="text-white">{assessment.title}</p>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-400">Score</h4>
                                <p className={`text-lg font-bold ${assessment.score >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {assessment.score}%
                                </p>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-400">Result</h4>
                                <p className={`${assessment.score >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {assessment.score >= 70 ? 'Passed' : 'Failed'}
                                </p>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-400">Feedback</h4>
                                <p className="text-white">{assessment.feedback}</p>
                              </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                              <button
                                onClick={() => setShowFeedbackModal(null)}
                                className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                
                
                ))};
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredAssessments.length === 0 && (
          <div className="text-center py-12">
            <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No completed assessments found</h3>
            <p className="text-gray-400">
              {searchTerm || selectedType !== 'All' || selectedResult !== 'All'
                ? "Try adjusting your search or filters" 
                : "You haven't completed any assessments yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}