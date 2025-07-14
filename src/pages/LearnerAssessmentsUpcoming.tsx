import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  BookOpen,
  Users2,
  User,
  BookOpen as BookOpenIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUpcomingAssessmentsForLearner, UpcomingAssessment } from '../services/learnerAssessmentService';

export default function LearnerAssessmentsUpcoming() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [upcomingAssessments, setUpcomingAssessments] = useState<UpcomingAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        setError(null);
        const assessments = await getUpcomingAssessmentsForLearner();
        setUpcomingAssessments(assessments);
      } catch (err) {
        console.error('Error fetching upcoming assessments:', err);
        setError('Failed to load upcoming assessments');
        toast.error('Could not load your upcoming assessments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const filteredAssessments = upcomingAssessments.filter(assessment => {
    const matchesSearch = 
      searchTerm === '' || 
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'All' || assessment.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch(type) {
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

  /*
  const handleViewScopeAndTips = (assessment: UpcomingAssessment) => {
        navigate(`/learner/assessments/scope-tips/${assessment.id}`,{
  state: {
    assessment: {
      ...assessment,
      review_id: assessment.review_id  // make sure this is part of it
    }
  }
});
    
  };
  */

  const handleViewScopeAndTips = (assessment: UpcomingAssessment) => {
  const payload = {
    assessment: {
      ...assessment,
      review_id: assessment.review_id  // ensure this exists on the assessment object
    }
  };

  console.log("📦 Navigating to Scope & Tips with state:", payload);

  navigate(`/learner/assessments/scope-tips/${assessment.id}`, {
    state: payload
  });
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
              <h1 className="text-2xl font-bold text-white">Upcoming Assessments</h1>
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
          <div className="flex space-x-4">
            <button 
              onClick={() => setSelectedType('All')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === 'All' 
                  ? 'bg-emerald-600/80 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              All
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
                  <th className="text-left p-4 text-white">Type</th>
                  <th className="text-left p-4 text-white">Subject</th>
                  <th className="text-left p-4 text-white">Start Date</th>
                  <th className="text-left p-4 text-white">Due Date</th>
                  <th className="text-left p-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map(assessment => (
                  <tr key={assessment.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4 text-white font-medium">{assessment.title}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`p-1 rounded-full ${
                          assessment.type === 'Class' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : assessment.type === 'Group'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {getTypeIcon(assessment.type)}
                        </span>
                        <span className="text-white">{assessment.type}</span>
                      </div>
                    </td>
                    <td className="p-4 text-white">{assessment.subject}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span className="text-white">{new Date(assessment.startDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                        <span className="text-white">{assessment.dueDate}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex">
                        <button
                          onClick={() => handleViewScopeAndTips(assessment)}
                          className="px-3 py-1 bg-blue-600/80 text-white rounded-lg text-sm hover:bg-blue-500 transition-colors flex items-center space-x-1"
                        >
                          <BookOpenIcon className="h-4 w-4" />
                          <span>Scope & Tips</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredAssessments.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No upcoming assessments found</h3>
            <p className="text-gray-400">
              {searchTerm || selectedType !== 'All'
                ? "Try adjusting your search or filters" 
                : "You don't have any upcoming assessments at the moment"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}