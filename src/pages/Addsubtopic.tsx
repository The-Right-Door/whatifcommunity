import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, ChevronLeft, Plus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { addSubtopic } from '../services/subtopicService';

interface LocationState {
  topicId?: string;
  subject?: string;
  grade?: string;
  returnPath?: string;
}

interface SubtopicFormData {
  title: string;
  description: string;
  fullExplanation: string;
}

interface ValidationErrors {
  title: string;
  fullExplanation: string;
}

export default function AddSubtopic() {
  const navigate = useNavigate();
  const location = useLocation();
  const { topicId, subject, grade, returnPath } = location.state as LocationState || {};
  const [topicName, setTopicName] = useState<string>('');

  const [formData, setFormData] = useState<SubtopicFormData>({
    title: '',
    description: '',
    fullExplanation: ''
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    title: '',
    fullExplanation: ''
  });

  useEffect(() => {
    const fetchTopicName = async () => {
      if (topicId) {
        try {
          const { data, error } = await supabase
            .from('topics')
            .select('topic')
            .eq('topics_id', topicId)
            .single();

          if (error) throw error;
          if (data) setTopicName(data.topic);
        } catch (error) {
          console.error('Error fetching topic:', error);
          toast.error('Failed to load topic information');
        }
      }
    };

    fetchTopicName();
  }, [topicId]);

  const validateForm = () => {
    const errors = {
      title: '',
      fullExplanation: ''
    };

    if (!formData.title.trim()) errors.title = 'Subtopic title is required';
    if (!formData.fullExplanation.trim()) errors.fullExplanation = 'Full explanation is required';

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSave = async (andAddAnother: boolean = false) => {
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    try {
      await addSubtopic({
        topic_id: Number(topicId),
        subtopic_title: formData.title.trim(),
        small_description: formData.description.trim() || null,
        full_explanation: formData.fullExplanation.trim(),
        start_date: today,
        end_date: today,
        status: 'draft',
        resources: null
      });

      toast.success('Subtopic saved successfully');

      if (andAddAnother) {
        setFormData({ title: '', description: '', fullExplanation: '' });
      } else {
        navigate(returnPath || '/subjects');
      }
    } catch (error) {
      console.error('Error saving subtopic:', error);
      toast.error('Failed to save subtopic');
    }
  };

  const handleCancel = () => navigate(returnPath || '/subjects');

  const handleAddResources = () => {
    toast.custom(t => (
      <div className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white/10 backdrop-blur-sm shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <AlertCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">Coming Soon</p>
              <p className="mt-1 text-sm text-gray-300">
                Resource management functionality will be available in a future update.
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-white/20">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-emerald-400 hover:text-emerald-300 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="relative min-h-screen">
      {/* Background + Navigation */}
      <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
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
              <h1 className="text-2xl font-bold text-white">Add New Subtopic</h1>
            </div>
            <button onClick={handleCancel} className="flex items-center space-x-2 text-white hover:text-gray-200">
              <ChevronLeft className="h-5 w-5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          {topicName && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">Topic</label>
              <div className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white">{topicName}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Subject</label>
              <input type="text" value={subject} disabled className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Grade</label>
              <input type="text" value={grade} disabled className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-gray-400" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">Subtopic Title <span className="text-red-400">*</span></label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white" placeholder="Enter subtopic title" required />
            {validationErrors.title && <p className="mt-1 text-sm text-red-400">{validationErrors.title}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">Small Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white" placeholder="Optional brief description" rows={2} />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">Full Explanation <span className="text-red-400">*</span></label>
            <textarea value={formData.fullExplanation} onChange={(e) => setFormData({ ...formData, fullExplanation: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white" placeholder="Detailed explanation" rows={6} required />
            {validationErrors.fullExplanation && <p className="mt-1 text-sm text-red-400">{validationErrors.fullExplanation}</p>}
          </div>

          <button onClick={handleAddResources} className="w-full bg-emerald-600/80 text-white px-4 py-3 rounded-lg hover:bg-emerald-500 flex items-center justify-center space-x-2 mb-8">
            <Plus className="h-5 w-5" />
            <span>Add Resources (Examples, Videos, Notes)</span>
          </button>

          <div className="flex items-center justify-end space-x-4">
            <button onClick={handleCancel} className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">Cancel</button>
            <button onClick={() => handleSave(true)} className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30">Save & Add Another</button>
            <button onClick={() => handleSave(false)} className="px-6 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500">Save Subtopic</button>
          </div>
        </div>
      </div>
    </div>
  );
}
