import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  CheckCircle, 
  XCircle,
  Filter,
  Eye,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Question {
  id: string;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  userAnswer: string;
  explanation?: string;
  isCorrect: boolean;
}

interface AssessmentResult {
  id: number;
  title: string;
  subject: string;
  grade: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedDate: string;
  questions: Question[];
}

type Filter = 'all' | 'correct' | 'incorrect';

export default function LearnerAssessmentResults() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;

  useEffect(() => {
    fetchAssessmentResult();
  }, [assessmentId]);

  const fetchAssessmentResult = async () => {
    try {
      setLoading(true);
      
      if (!assessmentId) {
        throw new Error('Assessment ID is required');
      }
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Authentication required');
      }
      
      // Get assessment details
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select('assessment_id, title, subject, grade, review_id')
        .eq('assessment_id', assessmentId)
        .single();
        
      if (assessmentError) throw assessmentError;
      
      // Get learner response
      const { data: response, error: responseError } = await supabase
        .from('learner_responses')
        .select('responses, score, submitted_at')
        .eq('user_id', user.id)
        .eq('review_id', assessment.review_id)
        .eq('submission_status', 'completed')
        .single();
        
      if (responseError) throw responseError;
      
      // Get questions from the review
      const { data: questions, error: questionsError } = await supabase
        .from('review_questions')
        .select('question_id, question_text, options, correct_answer, explanation')
        .eq('review_id', assessment.review_id);
        
      if (questionsError) throw questionsError;
      
      // Process questions with user answers
      const processedQuestions = questions.map(question => {
      //  const userAnswer = response.responses[question.question_id] || '';
      //  const isCorrect = userAnswer === question.correct_answer;

        //
        const userAnswer = response.responses[question.question_id] || '';
        const correctIndex = question.options?.findIndex(opt => opt === 
        question.correct_answer);
        const correctLetter = correctIndex >= 0 ? String.fromCharCode(65 + 
        correctIndex): '';                     
        

        const isCorrect = userAnswer === correctLetter;

        
        //
            
        return {
          id: question.question_id,
          questionText: question.question_text,
          options: question.options,
          correctAnswer:correctLetter,
          correctAnswerText: question.correct_answer,
          userAnswer,
          explanation: question.explanation,
          isCorrect
        };
      });
      
      // Create result object
      const result: AssessmentResult = {
        id: assessment.assessment_id,
        title: assessment.title,
        subject: assessment.subject,
        grade: assessment.grade,
        score: response.score,
        totalQuestions: questions.length,
        correctAnswers: processedQuestions.filter(q => q.isCorrect).length,
        completedDate: response.submitted_at?.substring(0, 10) || '',
        questions: processedQuestions
      };
      
      setResult(result);
    } catch (error) {
      console.error('Error fetching assessment result:', error);
      toast.error('Failed to load assessment result');
      
      // Set sample data for demonstration
      setResult({
        id: 1,
        title: "Mathematics: Calculus Review",
        subject: "Mathematics",
        grade: "Grade 11",
        score: 80,
        totalQuestions: 10,
        correctAnswers: 8,
        completedDate: "2025-03-20",
        questions: [
          {
            id: "1",
            questionText: "What is the derivative of f(x) = x²?",
            options: ["f'(x) = x", "f'(x) = 2x", "f'(x) = 2", "f'(x) = x²"],
            correctAnswer: "f'(x) = 2x",
            userAnswer: "f'(x) = 2x",
            explanation: "The derivative of x² is 2x using the power rule: d/dx(x^n) = n*x^(n-1)",
            isCorrect: true
          },
          {
            id: "2",
            questionText: "What is the integral of f(x) = 2x?",
            options: ["F(x) = x² + C", "F(x) = x² - C", "F(x) = x + C", "F(x) = 2x² + C"],
            correctAnswer: "F(x) = x² + C",
            userAnswer: "F(x) = x² + C",
            explanation: "The integral of 2x is x² + C using the power rule: ∫x^n dx = x^(n+1)/(n+1) + C",
            isCorrect: true
          },
          {
            id: "3",
            questionText: "What is the derivative of f(x) = e^x?",
            options: ["f'(x) = e^x", "f'(x) = xe^x", "f'(x) = e^(x-1)", "f'(x) = 1/e^x"],
            correctAnswer: "f'(x) = e^x",
            userAnswer: "f'(x) = e^x",
            explanation: "The derivative of e^x is e^x. This is a special property of the exponential function.",
            isCorrect: true
          },
          {
            id: "4",
            questionText: "What is the derivative of f(x) = ln(x)?",
            options: ["f'(x) = 1/x", "f'(x) = x", "f'(x) = 1", "f'(x) = ln(x)/x"],
            correctAnswer: "f'(x) = 1/x",
            userAnswer: "f'(x) = ln(x)/x",
            explanation: "The derivative of ln(x) is 1/x. This is a fundamental derivative in calculus.",
            isCorrect: false
          },
          {
            id: "5",
            questionText: "What is the chain rule used for?",
            options: [
              "Finding derivatives of sums",
              "Finding derivatives of products",
              "Finding derivatives of composite functions",
              "Finding derivatives of quotients"
            ],
            correctAnswer: "Finding derivatives of composite functions",
            userAnswer: "Finding derivatives of composite functions",
            explanation: "The chain rule is used to find the derivative of a composite function, i.e., a function of a function.",
            isCorrect: true
          },
          {
            id: "6",
            questionText: "What is the product rule formula?",
            options: [
              "(f·g)' = f'·g + f·g'",
              "(f·g)' = f'·g'",
              "(f·g)' = f'·g - f·g'",
              "(f·g)' = (f+g)'"
            ],
            correctAnswer: "(f·g)' = f'·g + f·g'",
            userAnswer: "(f·g)' = f'·g + f·g'",
            explanation: "The product rule states that the derivative of a product of two functions is the first function times the derivative of the second, plus the second function times the derivative of the first.",
            isCorrect: true
          },
          {
            id: "7",
            questionText: "What is the quotient rule formula?",
            options: [
              "(f/g)' = (f'·g - f·g')/g²",
              "(f/g)' = (f'·g + f·g')/g²",
              "(f/g)' = f'/g'",
              "(f/g)' = (f-g)/(g·g)"
            ],
            correctAnswer: "(f/g)' = (f'·g - f·g')/g²",
            userAnswer: "(f/g)' = (f'·g + f·g')/g²",
            explanation: "The quotient rule states that the derivative of a quotient is the denominator times the derivative of the numerator, minus the numerator times the derivative of the denominator, all divided by the square of the denominator.",
            isCorrect: false
          },
          {
            id: "8",
            questionText: "What is the second derivative of f(x) = x³?",
            options: ["f''(x) = 6x", "f''(x) = 3x²", "f''(x) = 6", "f''(x) = 6x²"],
            correctAnswer: "f''(x) = 6x",
            userAnswer: "f''(x) = 6x",
            explanation: "The first derivative of x³ is 3x², and the second derivative is 6x.",
            isCorrect: true
          },
          {
            id: "9",
            questionText: "What is the integral of f(x) = sin(x)?",
            options: ["F(x) = cos(x) + C", "F(x) = -cos(x) + C", "F(x) = sin(x) + C", "F(x) = tan(x) + C"],
            correctAnswer: "F(x) = -cos(x) + C",
            userAnswer: "F(x) = -cos(x) + C",
            explanation: "The integral of sin(x) is -cos(x) + C. This is a fundamental integral in calculus.",
            isCorrect: true
          },
          {
            id: "10",
            questionText: "What is the integral of f(x) = e^x?",
            options: ["F(x) = e^x + C", "F(x) = e^(x+1) + C", "F(x) = ln(x) + C", "F(x) = x·e^x + C"],
            correctAnswer: "F(x) = e^x + C",
            userAnswer: "F(x) = ln(x) + C",
            explanation: "The integral of e^x is e^x + C. This is a special property of the exponential function.",
            isCorrect: false
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = result?.questions.filter(question => {
    if (filter === 'all') return true;
    if (filter === 'correct') return question.isCorrect;
    if (filter === 'incorrect') return !question.isCorrect;
    return true;
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const currentQuestions = filteredQuestions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading assessment results...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-xl">Failed to load assessment results</div>
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
              <h1 className="text-2xl font-bold text-white">Assessment Results</h1>
            </div>
            
            <Link 
              to="/learner/assessments/completed"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Assessments</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Assessment Summary */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-emerald-600/30 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{result.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Subject</h3>
                  <p className="text-white">{result.subject}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Grade</h3>
                  <p className="text-white">{result.grade}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Completed</h3>
                  <p className="text-white">{result.completedDate}</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-white">Your Score</h3>
                  <span className="text-2xl font-bold text-emerald-400">{result.score}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-emerald-500 h-2.5 rounded-full" 
                    style={{ width: `${result.score}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{result.correctAnswers} correct out of {result.totalQuestions}</span>
                  <span className="text-gray-300">
                    {result.score >= 70 ? (
                      <span className="text-emerald-400">Passed</span>
                    ) : (
                      <span className="text-red-400">Failed</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🔵 Show All
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'correct'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            ✅ Show Correct Answers Only
          </button>
          <button
            onClick={() => setFilter('incorrect')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'incorrect'
                ? 'bg-red-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            ❌ Show Wrong Answers with Explanation
          </button>
        </div>

        {/* Questions */}
        <div className="space-y-8 mb-8">
          {currentQuestions.length > 0 ? (
            currentQuestions.map((question, index) => (
              <div 
                key={question.id}
                className={`bg-white/10 backdrop-blur-sm border ${
                  question.isCorrect 
                    ? 'border-emerald-500/30' 
                    : 'border-red-500/30'
                } rounded-lg p-6`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-white">
                    Question {(currentPage - 1) * questionsPerPage + index + 1}
                  </h3>
                  {question.isCorrect ? (
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <CheckCircle className="h-5 w-5" />
                      <span>Correct</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-red-400">
                      <XCircle className="h-5 w-5" />
                      <span>Incorrect</span>
                    </span>
                  )}
                </div>
                
                <p className="text-white mb-6">{question.questionText}</p>
                
                {question.options && (
                  <div className="space-y-3 mb-6">
                    {question.options.map((option, optionIndex) => {
                      const optionLetter = String.fromCharCode(65 + optionIndex);
                      const isUserAnswer = question.userAnswer === optionLetter;
                      const isCorrectAnswer = question.correctAnswer === optionLetter;
                      
                      return (
                        <div 
                          key={optionIndex}
                          className={`flex items-center space-x-3 p-3 rounded-lg ${
                            isUserAnswer && isCorrectAnswer
                              ? 'bg-emerald-600/20 border border-emerald-500/50'
                              : isUserAnswer && !isCorrectAnswer
                              ? 'bg-red-600/20 border border-red-500/50'
                              : !isUserAnswer && isCorrectAnswer
                              ? 'bg-blue-600/20 border border-blue-500/50'
                              : 'bg-white/5 border border-white/10'
                          }`}
                        >
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                            isUserAnswer && isCorrectAnswer
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isUserAnswer && !isCorrectAnswer
                              ? 'bg-red-500/20 text-red-400'
                              : !isUserAnswer && isCorrectAnswer
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-white/10 text-white'
                          }`}>
                            {optionLetter}
                          </div>
                          <span className="text-white">{option}</span>
                          {isUserAnswer && (
                            <div className="ml-auto">
                              {isCorrectAnswer ? (
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-400" />
                              )}
                            </div>
                          )}
                          {!isUserAnswer && isCorrectAnswer && (
                            <div className="ml-auto">
                              <CheckCircle className="h-5 w-5 text-blue-400" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {!question.isCorrect && question.explanation && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="text-white font-medium mb-1">Explanation</h4>
                        <p className="text-gray-300">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-white/5 rounded-lg">
              <p className="text-gray-300">
                {filter === 'correct' 
                  ? "No correct answers found." 
                  : filter === 'incorrect' 
                  ? "No incorrect answers found." 
                  : "No questions found."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                currentPage === 1
                  ? 'bg-white/5 text-gray-400 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>
            
            <div className="text-white">
              Page {currentPage} of {totalPages}
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                currentPage === totalPages
                  ? 'bg-white/5 text-gray-400 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <span>Next</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}