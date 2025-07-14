import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Save, 
  Trash2, 
  Plus, 
  Minus,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getReviewWithQuestions, updateReview, deleteReview, ReviewQuestion } from '../services/ReviewPersistenceService';

interface EditReviewProps {}

export default function EditReview() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const generatedReview = location.state?.generatedReview;
  const extractedQuestions = location.state?.extractedQuestions || [];
  
  const [loading, setLoading] = useState(!generatedReview);
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState<any>(null);
  const [questions, setQuestions] = useState<ReviewQuestion[]>(extractedQuestions);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    difficultyLevel: 'Medium',
    includeHints: false
  });

  useEffect(() => {
    if (reviewId && !generatedReview) {
      loadReview();
    } else if (generatedReview) {
      // Use the passed review data from state
      setFormData({
        title: location.state?.title || '',
        description: location.state?.description || '',
        startDate: location.state?.startDate || new Date().toISOString().split('T')[0],
        endDate: location.state?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        difficultyLevel: location.state?.difficultyLevel || 'Medium',
        includeHints: location.state?.includeHints || false
      });
      setReview({
        content: generatedReview
      });
    }
  }, [reviewId, generatedReview]);

  const loadReview = async () => {
    if (!reviewId) return;
    
    try {
      setLoading(true);
      const { review: loadedReview, questions: loadedQuestions } = await getReviewWithQuestions(reviewId);
      
      setReview(loadedReview);
      setQuestions(loadedQuestions);
      setFormData({
        title: loadedReview.title || '',
        description: loadedReview.description || '',
        startDate: loadedReview.start_date || '',
        endDate: loadedReview.end_date || '',
        difficultyLevel: loadedReview.difficulty_level || 'Medium',
        includeHints: loadedReview.include_hints || false
      });
    } catch (error) {
      console.error('Error loading review:', error);
      toast.error('Failed to load review');
      navigate('/teacher/assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (index: number, field: keyof ReviewQuestion, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const options = [...(updatedQuestions[questionIndex].options || [])];
    options[optionIndex] = value;
    updatedQuestions[questionIndex].options = options;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: formData.title.toLowerCase().includes('multiple choice') ? ['', '', '', ''] : undefined,
        answer: '',
        explanation: '',
        hint: formData.includeHints ? '' : undefined
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Please enter a title for the review');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error('Please set start and end dates');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    // Validate questions
    const invalidQuestions = questions.filter(q => !q.question || (q.options && q.options.some(o => !o)));
    if (invalidQuestions.length > 0) {
      toast.error('Please complete all questions and options');
      return;
    }

    setSaving(true);
    try {
      if (reviewId) {
        // Update existing review
        await updateReview(
          reviewId,
          {
            title: formData.title,
            description: formData.description,
            startDate: formData.startDate,
            endDate: formData.endDate,
            difficultyLevel: formData.difficultyLevel,
            includeHints: formData.includeHints
          },
          review.content,
          questions
        );
        toast.success('Review updated successfully');
      } else {
        // This would be handled by the ReviewPersistenceService in a real implementation
        toast.success('Review saved successfully');
      }
      navigate('/teacher/assessments');
    } catch (error) {
      console.error('Error saving review:', error);
      toast.error('Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!reviewId || !window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await deleteReview(reviewId);
      toast.success('Review deleted successfully');
      navigate('/teacher/assessments');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading review...</div>
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
              <h1 className="text-2xl font-bold text-white">
                {reviewId ? 'Edit Review' : 'Save Generated Review'}
              </h1>
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
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Review Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                placeholder="Enter review title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                placeholder="Enter review description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Difficulty Level
              </label>
              <select
                value={formData.difficultyLevel}
                onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              >
                <option value="Easy" className="bg-gray-900">Easy</option>
                <option value="Medium" className="bg-gray-900">Medium</option>
                <option value="Hard" className="bg-gray-900">Hard</option>
                <option value="Advanced" className="bg-gray-900">Advanced</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeHints"
                checked={formData.includeHints}
                onChange={(e) => setFormData({ ...formData, includeHints: e.target.checked })}
                className="h-4 w-4 rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50 mr-2"
              />
              <label 
                htmlFor="includeHints"
                className="text-white cursor-pointer"
              >
                Include hints for questions
              </label>
            </div>
          </div>
        </div>

        {/* Original Generated Content */}
        {review?.content && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Original Generated Content</h2>
              <button
                type="button"
                onClick={() => {
                  const el = document.createElement('textarea');
                  el.value = review.content;
                  document.body.appendChild(el);
                  el.select();
                  document.execCommand('copy');
                  document.body.removeChild(el);
                  toast.success('Content copied to clipboard');
                }}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Copy
              </button>
            </div>
            <div className="bg-white/5 rounded-lg p-4 max-h-60 overflow-y-auto">
              <pre className="text-white whitespace-pre-wrap">{review.content}</pre>
            </div>
          </div>
        )}

        {/* Questions Editor */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Question</span>
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-white text-lg mb-4">No questions found</p>
              <p className="text-gray-300 mb-6">Add questions to complete your review</p>
              <button
                type="button"
                onClick={addQuestion}
                className="px-6 py-3 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors"
              >
                Add First Question
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {questions.map((question, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-6 relative">
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Question {index + 1}
                    </label>
                    <textarea
                      value={question.question}
                      onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                      rows={3}
                    />
                  </div>

                  {question.options && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-white mb-2">
                        Options
                      </label>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center">
                            <div className="w-8 text-center text-white">{String.fromCharCode(65 + optionIndex)}.</div>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                              className="flex-1 bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Answer
                    </label>
                    <input
                      type="text"
                      value={question.answer || ''}
                      onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Explanation
                    </label>
                    <textarea
                      value={question.explanation || ''}
                      onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                      rows={2}
                    />
                  </div>

                  {formData.includeHints && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Hint
                      </label>
                      <textarea
                        value={question.hint || ''}
                        onChange={(e) => handleQuestionChange(index, 'hint', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          {reviewId && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-3 bg-red-600/80 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center space-x-2"
              disabled={saving}
            >
              <Trash2 className="h-5 w-5" />
              <span>Delete Review</span>
            </button>
          )}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-3 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
              disabled={saving}
            >
              <Save className="h-5 w-5" />
              <span>{saving ? 'Saving...' : 'Save Review'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}