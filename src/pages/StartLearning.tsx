import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { checkPaymentStatus } from '../services/paymentService';
import toast from 'react-hot-toast';
import { 
  Users, 
  ChevronLeft, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  GraduationCap,
  BookOpen as BookIcon,
  Eye
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { 
  getSubjectDetails, 
  getTopicsAndSubtopics, 
  getLearningProgress, 
  updateLearningProgress,
  getLearningStats,
  Topic,
  Subtopic,
  LearningProgress
} from '../services/startLearningService';
import AskForHelpModal from '../components/AskForHelpModal';

export default function StartLearning() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
 // const location = useLocation();
  const location = useLocation();
  const { profile } = useUser();
  const highlightSubtopicId = location.state?.subtopicId;
  const highlightSubtopicTitle = location.state?.subtopicTitle;
  const shouldHighlightHelp = location.state?.highlightHelp;
 // const highlightSubtopicId = location.state?.subtopicId;
 // const highlightSubtopicTitle = location.state?.subtopicTitle;
 // const shouldHighlightHelp = location.state?.highlightHelp;
  
  const [subject, setSubject] = useState<{ id: number; name: string; } | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [learningProgress, setLearningProgress] = useState<Record<number, LearningProgress>>({}); 
  const [stats, setStats] = useState<{
    totalSubtopics: number;
    viewed: number;
    understood: number;
    unclear: number;
  } | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedSubtopic, setSelectedSubtopic] = useState<{id: number, title: string} | null>(null);

  useEffect(() => {
    // If we have a highlighted subtopic, expand its topic
    if (highlightSubtopicId) {
      // Find the topic that contains this subtopic
      for (const topic of topics) {
        if (topic.subtopics?.some(s => s.subtopic_id === highlightSubtopicId)) {
          setExpandedTopics(prev => [...prev, topic.topics_id]);
          break;
        }
      }
    }
  }, [topics, highlightSubtopicId]);

  useEffect(() => {
    // If we have a highlighted subtopic, expand its topic
    if (highlightSubtopicId) {
      // Find the topic that contains this subtopic
      for (const topic of topics) {
        if (topic.subtopics?.some(s => s.subtopic_id === highlightSubtopicId)) {
          setExpandedTopics(prev => [...prev, topic.topics_id]);
          break;
        }
      }
    }
  }, [topics, highlightSubtopicId]);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const isPaid = await checkPaymentStatus();
        if (!isPaid) {
          toast.error("This feature requires an active subscription");
          navigate('/payment');
          return;
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    checkAccess();

    if (!subjectId) {
      navigate('/learner/dashboard');
      return;
    }

    loadData();
  }, [subjectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get grade_id from user profile
      const gradeId = profile?.grade_id || profile?.education_level;
      
      if (!gradeId) {
        throw new Error('Grade information not found in user profile');
      }

      // Fetch data in parallel
      const [subjectDetails, topicsData, progressData, statsData] = await Promise.all([
        getSubjectDetails(subjectId),
        getTopicsAndSubtopics(subjectId, gradeId),
        getLearningProgress(subjectId),
        getLearningStats(subjectId)
      ]);

      setSubject(subjectDetails);
      setTopics(topicsData);
      setLearningProgress(progressData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading learning data:', error);
      setError('Failed to load learning content');
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicId: number) => {
    setExpandedTopics(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleViewLesson = (subtopicId: number) => {
    // Navigate to subtopic view
    navigate(`/subtopics/${subtopicId}`);
    
    // Mark as viewed in progress
    handleUpdateProgress(subtopicId, 'viewed', true);
  };

  const handleMarkUnderstood = (subtopicId: number) => {
    handleUpdateProgress(subtopicId, 'understood', true);
    handleUpdateProgress(subtopicId, 'unclear', false);
    toast.success('Marked as understood!');
  };

  const handleMarkUnclear = (subtopicId: number) => {
    handleUpdateProgress(subtopicId, 'unclear', true);
    handleUpdateProgress(subtopicId, 'understood', false);
    toast.success('Marked as unclear. We\'ll help you with this!');
  };

  const handleAskForHelp = (subtopicId: number, subtopicTitle: string) => {
    const gradeId = profile?.grade_id || profile?.education_level;
    const classroomId = profile?.classroom_id || null; // or however you manage this

    navigate(`/ask-for-help/${subtopicId}`, {
      state: {
        subtopicId,
        subtopicTitle,
        subjectId: Number(subjectId),
        gradeId,
        classroomId
      }
    });
  };
  
  const handleRequestClass = (subtopicId: number, subtopicTitle: string) => {
    navigate('/request-class', {
      state: {
        subtopicId,
        subtopicTitle
      }
    });
  };

  const handleUpdateProgress = async (subtopicId: number, field: 'understood' | 'unclear' | 'viewed', value: boolean) => {
    try {
      await updateLearningProgress(subjectId!, subtopicId, field, value);
      
      // Update local state
      setLearningProgress(prev => ({
        ...prev,
        [subtopicId]: {
          ...prev[subtopicId] || { understood: false, unclear: false, viewed: false },
          [field]: value
        }
      }));

      // Update stats
      if (stats) {
        const newStats = { ...stats };
        
        if (field === 'viewed' && value && !learningProgress[subtopicId]?.viewed) {
          newStats.viewed += 1;
        } else if (field === 'viewed' && !value && learningProgress[subtopicId]?.viewed) {
          newStats.viewed -= 1;
        }
        
        if (field === 'understood' && value && !learningProgress[subtopicId]?.understood) {
          newStats.understood += 1;
          if (learningProgress[subtopicId]?.unclear) {
            newStats.unclear -= 1;
          }
        } else if (field === 'understood' && !value && learningProgress[subtopicId]?.understood) {
          newStats.understood -= 1;
        }
        
        if (field === 'unclear' && value && !learningProgress[subtopicId]?.unclear) {
          newStats.unclear += 1;
          if (learningProgress[subtopicId]?.understood) {
            newStats.understood -= 1;
          }
        } else if (field === 'unclear' && !value && learningProgress[subtopicId]?.unclear) {
          newStats.unclear -= 1;
        }
        
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error updating learning progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const getProgressStatus = (subtopicId: number) => {
    const progress = learningProgress[subtopicId];
    
    if (!progress) return null;
    
    if (progress.understood) return 'understood';
    if (progress.unclear) return 'unclear';
    if (progress.viewed) return 'viewed';
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading learning content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
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

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/payment')}
                className="flex items-center space-x-2 bg-yellow-600/80 text-white px-4 py-2 rounded-full hover:bg-yellow-500 transition-all duration-300"
              >
                <span>Upgrade</span>
              </button>
              
              <Link 
                to="/learner/dashboard"
                className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
          
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-2xl font-bold text-white">Learning {subject?.name}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Your Learning Modules</h2>
          <p className="text-xl text-gray-200">
            Track your progress through the curriculum and mark your understanding
          </p>
        </div>

        {/* Topics and Subtopics */}
        <div className="space-y-6">
          {topics.length > 0 ? (
            topics.map((topic) => (
              <div 
                key={topic.topics_id}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleTopic(topic.topics_id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <BookIcon className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-xl font-semibold text-white">{topic.topic}</h3>
                  </div>
                  {expandedTopics.includes(topic.topics_id) ? (
                    <ChevronUp className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-emerald-400" />
                  )}
                </button>

                {expandedTopics.includes(topic.topics_id) && topic.subtopics && (
                  <div className="divide-y divide-white/10">
                    {topic.subtopics.map((subtopic) => {
                      const progressStatus = getProgressStatus(subtopic.subtopic_id);
                      
                      return (
                        <div 
                          key={subtopic.subtopic_id}
                          className={`px-6 py-4 ${
                            progressStatus === 'understood' ? 'bg-emerald-600/10' :
                            progressStatus === 'unclear' ? 'bg-red-600/10' :
                            progressStatus === 'viewed' ? 'bg-blue-600/10' : ''
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-white mb-1">{subtopic.subtopic_title}</h4>
                              {subtopic.small_description && (
                                <p className="text-gray-300 text-sm">{subtopic.small_description}</p>
                              )}
                              {progressStatus && (
                                <div className="mt-2">
                                  {progressStatus === 'understood' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Understood
                                    </span>
                                  )}
                                  {progressStatus === 'unclear' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Unclear
                                    </span>
                                  )}
                                  {progressStatus === 'viewed' && !learningProgress[subtopic.subtopic_id]?.understood && !learningProgress[subtopic.subtopic_id]?.unclear && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      <Eye className="h-3 w-3 mr-1" />
                                      Viewed
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleViewLesson(subtopic.subtopic_id)}
                                className="px-3 py-1 bg-blue-600/80 text-white rounded-lg text-sm hover:bg-blue-500 transition-colors flex items-center space-x-1"
                              >
                                <BookOpen className="h-3 w-3" />
                                <span>View Lesson</span>
                              </button>
                              <button
                                className={`px-3 py-1 bg-emerald-600/80 text-white rounded-lg text-sm hover:bg-emerald-500 transition-colors flex items-center space-x-1 ${
                                  highlightSubtopicId === subtopic.subtopic_id ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-transparent' : ''
                                }`}
                                onClick={() => handleMarkUnderstood(subtopic.subtopic_id)}
                              >
                                <CheckCircle className="h-3 w-3" />
                                <span>Understood</span>
                              </button>
                              <button
                                className={`px-3 py-1 bg-red-600/80 text-white rounded-lg text-sm hover:bg-red-500 transition-colors flex items-center space-x-1 ${
                                  highlightSubtopicId === subtopic.subtopic_id ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-transparent' : ''
                                }`}
                                onClick={() => handleMarkUnclear(subtopic.subtopic_id)}
                              >
                                <XCircle className="h-3 w-3" />
                                <span>Unclear</span>
                              </button>
                              <button
                                className={`px-3 py-1 bg-purple-600/80 text-white rounded-lg text-sm hover:bg-purple-500 transition-colors flex items-center space-x-1 ${
                                  highlightSubtopicId === subtopic.subtopic_id && shouldHighlightHelp ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-transparent animate-pulse' : ''
                                }`}
                                onClick={() => handleAskForHelp(subtopic.subtopic_id, subtopic.subtopic_title)}
                              >
                                <MessageSquare className="h-3 w-3" />
                                <span>Ask For Help</span>
                              </button>
                              <button
                                onClick={() => handleRequestClass(subtopic.subtopic_id, subtopic.subtopic_title)}
                                className="px-3 py-1 bg-yellow-600/80 text-white rounded-lg text-sm hover:bg-yellow-500 transition-colors flex items-center space-x-1"
                              >
                                <GraduationCap className="h-3 w-3" />
                                <span>Request Class</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No learning content available</h3>
              <p className="text-gray-300">
                There are no topics available for this subject yet. Please check back later.
              </p>
            </div>
          )}
        </div>

        {/* Learning Progress Summary */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Learning Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Topics Viewed</span>
                <span className="text-white font-medium">
                  {stats?.viewed || 0} / {stats?.totalSubtopics || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Topics Understood</span>
                <span className="text-emerald-400 font-medium">
                  {stats?.understood || 0} / {stats?.totalSubtopics || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Topics Unclear</span>
                <span className="text-red-400 font-medium">
                  {stats?.unclear || 0} / {stats?.totalSubtopics || 0}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Next Steps</h3>
            <p className="text-gray-300">
              Continue learning by viewing lessons and marking your understanding. Ask for help when needed.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Need Help?</h3>
            <p className="text-gray-300 mb-4">
              If you're struggling with any topics, don't hesitate to ask for help.
            </p>
            <button 
              onClick={() => {
                if (topics.length > 0 && topics[0].subtopics && topics[0].subtopics.length > 0) {
                  const firstSubtopic = topics[0].subtopics[0];
                  handleAskForHelp(firstSubtopic.subtopic_id, firstSubtopic.subtopic_title);
                } else {
                  toast.error('No topics available to request help for');
                }
              }}
              className="w-full bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors"
            >
              Contact a Tutor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}