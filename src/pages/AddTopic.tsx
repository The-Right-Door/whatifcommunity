import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, ChevronLeft, Calendar, Plus } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { addTopic, TopicError } from '../services/topicService';
import { fetchActivePeriods, Period } from '../services/periodService';
import toast from 'react-hot-toast';

interface LocationState {
  subject?: string;
  subjectId?: number; // ✅ NEW
  grade?: string;
  gradeId?: number;
  returnPath?: string;
}

interface TopicFormData {
  title: string;
  description: string;
  period: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'published';
}

interface ValidationErrors {
  title: string;
  startDate: string;
  endDate: string;
  period: string;
}

export default function AddTopic() {
  const navigate = useNavigate();
  const location = useLocation();
   console.log('AddTopic state:', location.state);
  const { subject, subjectId, grade, gradeId, returnPath } = location.state as LocationState || {};
  const { role } = useUser();

  const [formData, setFormData] = useState<TopicFormData>({
    title: '',
    description: '',
    period: '',
    startDate: '',
    endDate: '',
    status: 'draft'
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    title: '',
    startDate: '',
    endDate: '',
    period: ''
  });

  const [periods, setPeriods] = useState<Period[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role && role !== 'teacher') {
      toast.error('Only teachers can add topics');
      navigate('/');
      return;
    }

    console.log('Routing state values:', {
  subject,
  subjectId,
  grade,
  gradeId
});
    
    if (!subject || !grade || !subjectId || !gradeId) {
      toast.error('Missing subject or grade info');
      navigate('/subjects');
      return;
    }

    const loadPeriods = async () => {
      try {
        const fetchedPeriods = await fetchActivePeriods(gradeId);
        setPeriods(fetchedPeriods);
      } catch (error) {
        console.error('Error loading periods:', error);
        toast.error('Failed to load periods');
      } finally {
        setLoading(false);
      }
    };

    loadPeriods();
  }, [role, subject, grade, subjectId, gradeId, navigate]);

  const validateForm = () => {
    const errors = { title: '', startDate: '', endDate: '', period: '' };

    if (!formData.title.trim()) errors.title = 'Topic title is required';
    else if (formData.title.length < 3) errors.title = 'Title too short';

    if (!formData.period) errors.period = 'Select a period';
    if (!formData.startDate) errors.startDate = 'Start date required';
    if (!formData.endDate) errors.endDate = 'End date required';

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) errors.endDate = 'End before start';
    }

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const topicData = {
        topic: formData.title,
        description: formData.description || null,
        start_date: formData.startDate,
        end_date: formData.endDate,
        topics_status: status,
        period_id: parseInt(formData.period),
        subject_id: subjectId!,
        grade_id: gradeId!
      };

      console.log('Submitting topic:', topicData); // ✅ Debugging

      const savedTopic = await addTopic(topicData);

      toast.success(status === 'draft' ? 'Saved as draft' : 'Published successfully');

      if (status === 'published') {
        navigate('/add-subtopics', {
          state: {
            topicId: savedTopic.topics_id,
            subject,
            grade,
            returnPath
          }
        });
      } else {
        navigate(returnPath || '/subjects');
      }
    } catch (error) {
      console.error('Error saving topic:', error);
      if (error instanceof TopicError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to save topic');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (returnPath) {
      navigate(returnPath);
    } else {
      navigate('/subjects');
    }
  };

  const handleAddSubtopics = () => {
    handleSubmit('draft');
    // Note: navigate is handled after save if published
  };

/*  if (loading) {
    return <div className="text-white text-xl text-center mt-20">Loading periods...</div>;
  }

  // ... (UI remains unchanged)
  */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading periods...</div>
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
              <h1 className="text-2xl font-bold text-white">Add New Topic</h1>
            </div>
            
            <button 
              onClick={handleCancel}
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          {/* Subject and Grade Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                disabled
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Grade</label>
              <input
                type="text"
                value={grade}
                disabled
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Period Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Period <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              required
            >
              <option value="" className="bg-gray-900">Select a period</option>
              {periods.map(period => (
                <option 
                  key={period.period_id} 
                  value={period.period_id} 
                  className="bg-gray-900"
                >
                  {period.period_name}
                </option>
              ))}
            </select>
            {validationErrors.period && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.period}</p>
            )}
          </div>

          {/* Topic Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Topic Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              placeholder="Enter topic title"
              required
            />
            {validationErrors.title && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.title}</p>
            )}
          </div>

          {/* Topic Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Topic Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              placeholder="Enter topic description (optional)"
              rows={4}
            />
            <button
              onClick={handleAddSubtopics}
              className="mt-4 w-full bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Subtopics</span>
            </button>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Start Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-white/40"
                  required
                />
              </div>
              {validationErrors.startDate && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.startDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                End Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-white/40"
                  required
                />
              </div>
              {validationErrors.endDate && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.endDate}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              disabled={isSubmitting}
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              className="px-6 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Topic'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

