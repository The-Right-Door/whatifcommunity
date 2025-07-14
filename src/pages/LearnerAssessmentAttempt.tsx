import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Save,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { getAssessmentById, submitAssessmentAnswers } from '../services/learnerAssessmentService';

interface Question {
  id: string;
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  hint?: string;
}

interface Assessment {
  id: number;
  review_id: number;
  title: string;
  description: string;
  subject: string;
  grade: string;
  startDate: string;
  endDate: string;
  timeLimit: string;
  questions: Question[];
}

export default function LearnerAssessmentAttempt() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!assessmentId) return;
    
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const assessmentData = await getAssessmentById(parseInt(assessmentId));
        setAssessment(assessmentData);
        
        // Initialize answers object
        const initialAnswers: Record<string, string> = {};
        assessmentData.questions.forEach(question => {
          initialAnswers[question.id] = '';
        });
        setAnswers(initialAnswers);
        
        // Initialize timer if there's a time limit
        if (assessmentData.timeLimit) {
          const [hours, minutes] = assessmentData.timeLimit.split(':').map(Number);
          const totalSeconds = (hours * 60 * 60) + (minutes * 60);
          startTimer(totalSeconds);
        }
      } catch (error) {
        console.error('Error fetching assessment:', error);
        toast.error('Failed to load assessment');
        navigate('/learner/assessments/in-progress');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessment();
    
    // Cleanup timer on unmount
    return () => {
      if (window.assessmentTimer) {
        clearInterval(window.assessmentTimer);
      }
    };
  }, [assessmentId, navigate]);

  const startTimer = (totalSeconds: number) => {
    // Clear any existing timer
    if (window.assessmentTimer) {
      clearInterval(window.assessmentTimer);
    }
    
    // Set initial time
    updateTimeDisplay(totalSeconds);
    
    // Start the countdown
    window.assessmentTimer = setInterval(() => {
      totalSeconds--;
      
      if (totalSeconds <= 0) {
        clearInterval(window.assessmentTimer);
        handleTimeUp();
      } else {
        updateTimeDisplay(totalSeconds);
      }
    }, 1000);
  };

  const updateTimeDisplay = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    setTimeRemaining(
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    );
  };

  const handleTimeUp = () => {
    toast.error('Time is up! Your answers will be submitted automatically.');
    handleSubmit();
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (!assessment) return;
    
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleToggleHint = (questionId: string) => {
    setShowHint(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleSave = async () => {
    if (!assessment) return;
    
    try {
      setSubmitting(true);
      
      // Save progress without submitting
      await submitAssessmentAnswers(
        parseInt(assessmentId!), 
        assessment.review_id,
        answers, 
        assessment.questions,
        false
      );
      
      toast.success('Progress saved successfully');
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('Failed to save progress');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    
    // Check if all questions are answered
    const unansweredQuestions = assessment.questions.filter(q => !answers[q.id]);
    
    if (unansweredQuestions.length > 0 && 
        !window.confirm(`You have ${unansweredQuestions.length} unanswered questions. Are you sure you want to submit?`)) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Submit assessment
      await submitAssessmentAnswers(
        parseInt(assessmentId!),
        assessment.review_id,
        answers, 
        assessment.questions,
        true
      );
      
      // Clear timer
      if (window.assessmentTimer) {
        clearInterval(window.assessmentTimer);
      }
      
      toast.success('Assessment submitted successfully');
      navigate('/learner/assessments/completed');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading assessment...</div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-xl">Assessment not found</div>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const progressPercentage = Math.round(((currentQuestionIndex + 1) / assessment.questions.length) * 100);

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
              <h1 className="text-2xl font-bold text-white">{assessment.title}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {timeRemaining && (
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">{timeRemaining}</span>
                </div>
              )}
              
              <Link 
                to="/learner/assessments/in-progress"
                className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Exit</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-4">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full h-2.5 mb-2">
          <div 
            className="bg-emerald-500 h-2.5 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-300">
          <span>Question {currentQuestionIndex + 1} of {assessment.questions.length}</span>
          <span>{progressPercentage}% Complete</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-6">
          {/* Question */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Question {currentQuestionIndex + 1}</h2>
            <p className="text-white text-lg mb-6">{currentQuestion.questionText}</p>
            
            {/* Multiple Choice */}
            {currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label 
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      answers[currentQuestion.id] === String.fromCharCode(65 + index)
                        ? 'bg-emerald-600/30 border border-emerald-500/50'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={String.fromCharCode(65 + index)}
                      checked={answers[currentQuestion.id] === String.fromCharCode(65 + index)}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="h-4 w-4 text-emerald-500 bg-white/10 border-white/30 focus:ring-emerald-500 focus:ring-opacity-50"
                    />
                    <div className="flex items-center">
                      <span className="text-white font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      <span className="text-white">{option}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
            
            {/* Text Answer (for non-multiple choice) */}
            {!currentQuestion.options && (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                placeholder="Enter your answer here..."
                rows={4}
              />
            )}
          </div>
          
          {/* Hint */}
          {currentQuestion.hint && (
            <div className="mb-6">
              <button
                onClick={() => handleToggleHint(currentQuestion.id)}
                className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm"
              >
                {showHint[currentQuestion.id] ? 'Hide Hint' : 'Show Hint'}
              </button>
              
              {showHint[currentQuestion.id] && (
                <div className="mt-2 bg-emerald-600/20 border border-emerald-500/30 rounded-lg p-4">
                  <p className="text-emerald-300">{currentQuestion.hint}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={isFirstQuestion}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isFirstQuestion
                  ? 'bg-white/5 text-gray-400 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Previous
            </button>
            
            <button
              onClick={handleNextQuestion}
              disabled={isLastQuestion}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                isLastQuestion
                  ? 'bg-white/5 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600/80 text-white hover:bg-emerald-500'
              }`}
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Question Navigation */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-white mb-4">Question Navigator</h3>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {assessment.questions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-full aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  currentQuestionIndex === index
                    ? 'bg-emerald-600/80 text-white'
                    : answers[question.id]
                    ? 'bg-emerald-600/30 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleSave}
            disabled={submitting}
            className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
          >
            <Save className="h-5 w-5" />
            <span>{submitting ? 'Saving...' : 'Save Progress'}</span>
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
          >
            <Send className="h-5 w-5" />
            <span>{submitting ? 'Submitting...' : 'Submit Assessment'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}