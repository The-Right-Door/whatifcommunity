import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Plus, 
  Minus, 
  Book, 
  PenTool, 
  Presentation, 
  Download, 
  Share2, 
  MoreVertical, 
  FolderOpen,
  Eye,
  ClipboardList,
  Settings,
  FileText
} from 'lucide-react';
import { fetchCurriculum, CurriculumError } from '../services/curriculumService';
import { useUser } from '../contexts/UserContext';
import type { Period, Topic, Subtopic } from '../services/curriculumService';
import toast from 'react-hot-toast';

interface LocationState {
  subject?: string;
  grade?: string;
  subjectId?: number;
  gradeId?: number;
  returnPath?: string;
}

export default function SubjectDetail() {
  const { subject, grade } = useParams();
  const [expandedPeriod, setExpandedPeriod] = useState<number | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<number[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [gradeId, setGradeId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);

  const [topicsByPeriod, setTopicsByPeriod] = useState<Record<number, Topic[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { role } = useUser();

  const isTeacher = role === 'teacher';

  useEffect(() => {
    const loadCurriculum = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!subject || !grade) {
          throw new Error('Missing subject or grade parameter');
        }

        const result = await fetchCurriculum(subject, grade);
        setPeriods(result.periods);
        setTopicsByPeriod(result.topicsByPeriod);
        setGradeId(result.gradeId);
        setSubjectId(result.subjectId);

      } catch (err) {
        console.error('Error loading curriculum:', err);
        
        if (err instanceof CurriculumError) {
          switch (err.code) {
            case 'SUBJECT_NOT_FOUND':
              setError('Subject not found');
              break;
            case 'CURRICULUM_FETCH_ERROR':
              setError('Failed to load curriculum data');
              break;
            default:
              setError('An error occurred while loading the curriculum');
          }
          toast.error(err.message);
        } else {
          setError('Failed to load curriculum data');
          toast.error('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCurriculum();
  }, [grade, subject]);

  const handlePeriodClick = (periodId: number) => {
    setExpandedPeriod(expandedPeriod === periodId ? null : periodId);
  };

  const toggleTopic = (topicId: number) => {
    setExpandedTopics(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleAddTopic = () => {
    navigate('/add-topic', { 
      state: { subject, subjectId, gradeId, grade, returnPath: location.pathname } 
    });
  };

  const handleViewSubtopic = (subtopicId: number) => {
    navigate(`/subtopics/${subtopicId}`);
  };

  const handleCreateGroup = () => {
    navigate(`/create-learner-group?subject=${subjectId}&grade=${gradeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading curriculum...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
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

      <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <Users className="h-8 w-8" />
              <span className="text-xl font-bold">What-If Community</span>
            </Link>
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-2xl font-bold text-white">Subject Detail page for {subject} - {grade}</h1>
            </div>
            
            <Link 
              to="/subjects"
              state={{ from: location.state?.from }}
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Subjects</span>
            </Link>
          </div>
        </div>
      </div>

       {/* Add Topic Button - Only visible for teachers */}
      {isTeacher && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={handleAddTopic}
            className="bg-emerald-600/80 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-500 transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Topic</span>
          </button>
        </div>
      )}

      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Curriculum Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-emerald-600/30 rounded-lg">
                <Book className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Curriculum</h2>
            </div>
            <div className="space-y-4">
              {periods.map((period) => (
                <div key={period.period_id} className="border border-white/20 rounded-lg">
                  <button
                    className="w-full px-4 py-3 flex justify-between items-center hover:bg-white/5 text-white"
                    onClick={() => handlePeriodClick(period.period_id)}
                  >
                    <span className="font-medium">{period.period_name}</span>
                    {expandedPeriod === period.period_id ? <Minus /> : <Plus />}
                  </button>
                  {expandedPeriod === period.period_id && (
                    <div className="p-4 border-t border-white/10">
                      {topicsByPeriod[period.period_id]?.length > 0 ? (
                        <div className="space-y-3">
                          {topicsByPeriod[period.period_id].map((topic) => (
                            <div key={topic.topics_id} className="bg-white/5 rounded-lg">
                              <button
                                onClick={() => toggleTopic(topic.topics_id)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5"
                              >
                                <span className="text-white">{topic.topic}</span>
                                <div className="flex items-center space-x-2">
                                  {isTeacher && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                            navigate(`/topics/${topic.topics_id}/maintain`, {
      state: {
        subject,
        grade,
        subjectId,
        gradeId,
        returnPath: location.pathname
      }
    });
                                      }}
                                      className="text-emerald-400 hover:text-emerald-300 transition-colors p-1"
                                    >
                                      <Settings className="h-4 w-4" />
                                    </button>
                                  )}
                                  {expandedTopics.includes(topic.topics_id) ? (
                                    <Minus className="h-4 w-4 text-emerald-400" />
                                  ) : (
                                    <Plus className="h-4 w-4 text-emerald-400" />
                                  )}
                                </div>
                              </button>
                              {expandedTopics.includes(topic.topics_id) && topic.subtopics && (
                                <div className="px-4 py-2 space-y-2">
                                  {topic.subtopics.map((subtopic) => (
                                    <div
                                      key={subtopic.subtopic_id}
                                      className="flex justify-between items-center text-gray-300 pl-4 py-2"
                                    >
                                      <span>{subtopic.subtopic_title}</span>
                                      <button
                                        onClick={() => handleViewSubtopic(subtopic.subtopic_id)}
                                        className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-1"
                                      >
                                        <Eye className="h-4 w-4" />
                                        <span>View</span>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center">No topics available</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Learning Guides */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-emerald-600/30 rounded-lg">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Learning Guides</h2>
            </div>
            <div className="space-y-4">
              <Link
            to={`/subjects/${subject}/${grade}/core-concepts`}
            //       to={`/subjects/${subject}/${grade}/lesson-plan`}
            //     state={{ subject_id: selectedSubjectId, grade_id: selectedGradeId }}
           state={{subject_id: subjectId,        // already correct: number
    subject_name: subject,        // correct: string like "java"
    grade_id: gradeId,            // already correct: number
    grade_name: grade             // correct: string like "grade-15"
                 }}
                onClick={() => {
    console.log('➡️ Navigating to Core Concepts with:');
    console.log('Subject ID:', subjectId);
    console.log ('subject_id:', subject.subjects_id);
    console.log('Subject Name:', subject);
    console.log('subject_name:', subject.subjects_name);  
    console.log('Grade ID:', gradeId);
    console.log('Grade Name:', grade);
    console.log('grade_id:', grade.grade_id);
    console.log('grade_name:',grade.grade_name);
    
  }}
                className="w-full text-left px-4 py-3 bg-white/5 rounded-lg text-white hover:bg-white/10 transition-colors block"
              >
                Core Concepts
              </Link>
              <Link
                to={`/subjects/${subject}/${grade}/exam-watch-list`}
                className="w-full text-left px-4 py-3 bg-white/5 rounded-lg text-white hover:bg-white/10 transition-colors block"
              >
                Exam Watch List
              </Link>
              <Link
                to={`/subjects/${subject}/${grade}/lesson-plan`}
                className="w-full text-left px-4 py-3 bg-white/5 rounded-lg text-white hover:bg-white/10 transition-colors block"
              >
                Lesson Plan
              </Link>
              <Link
                to={`/subjects/${subject}/${grade}/assessments-generated`}
                className="w-full text-left px-4 py-3 bg-white/5 rounded-lg text-white hover:bg-white/10 transition-colors block"
              >
                Assessments Generated
              </Link>
            </div>
          </div>

          {/* Peer mentoring(support center) */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-emerald-600/30 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Peer Mentoring</h2>
            </div>
            <div className="space-y-4">
              <Link 
                to={`/forums/${subject?.toLowerCase()}`}
                className="block w-full bg-emerald-600/80 text-white px-4 py-3 rounded-lg hover:bg-emerald-500 text-center transition-all duration-300"
              >
                Find a Mentor
              </Link>
              <button className="w-full bg-white/10 text-white px-4 py-3 rounded-lg hover:bg-white/20 transition-all duration-300">
                Become a Mentor
              </button>
              <button className="w-full bg-white/10 text-white px-4 py-3 rounded-lg hover:bg-white/20 transition-all duration-300">
                View Mentoring Groups
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}