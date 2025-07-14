import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  BookOpen, 
  CheckCircle, 
  ArrowRight,
  HelpCircle,
  Lightbulb,
  BookMarked,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Subtopic {
  subtopic_id: number;
  subtopic_title: string;
  small_description?: string;
}

interface AssessmentDetails {
  id: number;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  timeRemaining: string;
  subtopics: Subtopic[];
  tips: string[];
}

export default function AssessmentScopeAndTips() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [assessment, setAssessment] = useState<AssessmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get assessment data from location state or fetch it
  /*
  useEffect(() => {
    const fetchAssessmentDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // If we have assessment data in location state, use it
        if (location.state?.assessment) {
          // In a real app, we would fetch the subtopics based on the assessment
          // For now, we'll create mock data
          const mockSubtopics: Subtopic[] = [
            { id: 1, title: "Quadratic Equations", description: "Solving and graphing quadratic equations" },
            { id: 2, title: "Polynomial Functions", description: "Understanding polynomial functions and their properties" },
            { id: 3, title: "Rational Expressions", description: "Simplifying and operating with rational expressions" },
            { id: 4, title: "Exponential Functions", description: "Working with exponential growth and decay" }
          ];

          const mockTips = [
            "Review your class notes before starting the assessment",
            "Practice similar problems to build confidence",
            "Don't spend too much time on any single question",
            "Double-check your work before submitting"
          ];

          setAssessment({
            ...location.state.assessment,
            subtopics: mockSubtopics,
            tips: mockTips
          });
        } else {
          // In a real app, we would fetch the assessment data from the API
          // For now, we'll create mock data
          toast.error("Assessment data not found");
          navigate('/learner/assessments/upcoming');
        }
      } catch (err) {
        console.error('Error fetching assessment details:', err);
        setError('Failed to load assessment details');
        toast.error('Could not load assessment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentDetails();
  }, [assessmentId, location.state, navigate]);
  */

  useEffect(() => {
  const fetchAssessmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📦 Location state on load:", location.state);

      if (location.state?.assessment) {
        const reviewId = location.state.assessment.review_id;
         console.log("📌 Found reviewId:", reviewId);
        const subtopics = await fetchSubtopicsByAssessment(reviewId);
          console.log("📚 Subtopics fetched:", subtopics);
        const mockTips = [
          "Review class notes related to each subtopic.",
          "Focus on weak areas you've marked previously.",
          "Use 'Start Practice' to reinforce key concepts.",
          "Ask for help on anything still unclear before the test."
        ];

        /*
        setAssessment({
          ...location.state.assessment,
          subtopics,
          tips: mockTips
        });
         console.log("✅ Full assessment prepared:", fullAssessment);
        setAssessment(fullAssessment);
        */
        const fullAssessment = {
    ...location.state.assessment,
    subtopics,
    tips: mockTips
  };

  console.log("✅ Full assessment prepared:", fullAssessment);
  setAssessment(fullAssessment);
      } else {
        console.warn("⚠️ No assessment found in location.state");
        toast.error("Assessment data not found");
        navigate('/learner/assessments/upcoming');
      }
    } catch (err) {
      console.error('Error fetching assessment details:', err);
      setError('Failed to load assessment details');
      toast.error('Could not load assessment details');
    } finally {
      setLoading(false);
    }
  };

  fetchAssessmentDetails();
}, [assessmentId, location.state, navigate]);



  const fetchSubtopicsByAssessment = async (reviewId: number) => {
     console.log("🔄 Fetching subtopics for review_id:", reviewId)
  const { data, error } = await supabase
    .from('review_subtopics')
    .select(`
      subtopics:subtopic_id (
        subtopic_id,
        subtopic_title,
        small_description
      )
    `)
    .eq('review_id', reviewId);
    

  if (error) {
    console.error('Error fetching subtopics:', error);
    throw error;
  }

  return data.map(entry => entry.subtopics);
};

/*
  const handleNeedMoreHelp = (subtopicId: number, subtopicTitle: string) => {
    navigate(`/start-learning/${assessment?.subject.toLowerCase()}`, {
      state: {
        subtopicId,
        subtopicTitle,
        highlightHelp: true
      }
    });
  };

  */

  const handleNeedMoreHelp = (subtopicId: number, subtopicTitle: string) => {
  navigate(`/start-learning/${assessment?.subject.toLowerCase()}`, {
    state: {
      subtopicId,
      subtopicTitle,
      subject: assessment?.subject,
      grade: assessment?.grade,
      assessmentId: assessment?.id
    }
  });
};
  const handleStartPractice = (subtopicId: number) => {
    // In a real app, this would navigate to a practice page for the specific subtopic
    toast.success(`Starting practice for ${assessment?.subtopics.find(s => s.id === subtopicId)?.title}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading assessment details...</div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-xl">{error || 'Assessment not found'}</div>
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
              <h1 className="text-2xl font-bold text-white">Scope and Tips</h1>
            </div>
            
            <Link 
              to="/learner/assessments/upcoming"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Upcoming</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Assessment Header */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Scope and Tips for {assessment.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Subject</h3>
              <p className="text-white">{assessment.subject}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Grade</h3>
              <p className="text-white">{assessment.grade}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Due Date</h3>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span className="text-white">{assessment.dueDate} ({assessment.timeRemaining} remaining)</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Link 
              to={`/learner/assessments/attempt/${assessment.id}`}
              className="bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
            >
              <ArrowRight className="h-5 w-5" />
              <span>Start Assessment</span>
            </Link>
          </div>
        </div>

        {/* Subtopics Section */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <BookMarked className="h-5 w-5 mr-2 text-emerald-400" />
            Assessment Scope
          </h3>
          
          <div className="space-y-6">
            {assessment.subtopics.map((subtopic) => (
              <div 
                key={subtopic.subtopic_id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300"
              >
                <h4 className="text-lg font-medium text-white mb-2">{subtopic.title}</h4>
                {subtopic.subtopic_title && (
                  <p className="text-gray-300 mb-4">{subtopic.subtopic_title}</p>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleNeedMoreHelp(subtopic.subtopic_id, subtopic.subtopic_title)}
                    className="px-3 py-1 bg-blue-600/80 text-white rounded-lg text-sm hover:bg-blue-500 transition-colors flex items-center space-x-1"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Still Need More Help</span>
                  </button>
                  <button
                    onClick={() => handleStartPractice(subtopic.id)}
                    className="px-3 py-1 bg-emerald-600/80 text-white rounded-lg text-sm hover:bg-emerald-500 transition-colors flex items-center space-x-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Start Practice</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Tips Section */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
            Study Tips
          </h3>
          
          <ul className="space-y-3">
            {assessment.tips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="p-1 bg-emerald-600/30 rounded-full mt-0.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-white">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}