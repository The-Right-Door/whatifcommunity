import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Users, ChevronLeft, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { fetchSubtopicById, updateSubtopic } from '../services/subtopicService';
import MandatoryAssessmentModal from '../components/MandatoryAssessmentModal';

interface SubtopicFormData {
  title: string;
  description: string;
  fullExplanation: string;
}

interface ValidationErrors {
  title: string;
  fullExplanation: string;
}

export default function EditSubtopic() {
  const { subtopicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [topicName, setTopicName] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [grade, setGrade] = useState<string>('');

  const [formData, setFormData] = useState<SubtopicFormData>({
    title: '',
    description: '',
    fullExplanation: ''
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    title: '',
    fullExplanation: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showMandatoryModal, setShowMandatoryModal] = useState(false);

  useEffect(() => {
    if (!subtopicId) return;
    
    const loadSubtopic = async () => {
      try {
        setLoading(true);
        const subtopic = await fetchSubtopicById(parseInt(subtopicId));
        
        // Set form data
        setFormData({
          title: subtopic.subtopic_title,
          description: subtopic.small_description || '',
          fullExplanation: subtopic.full_explanation || ''
        });
        
        // Get topic name
        const { data: topicData, error: topicError } = await supabase
          .from('topics')
          .select('topic, subject_id, grade_id')
          .eq('topics_id', subtopic.topic_id)
          .single();
          
        if (topicError) throw topicError;
        setTopicName(topicData.topic);
        
        // Get subject and grade names
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('subjects_name')
          .eq('subjects_id', topicData.subject_id)
          .single();
          
        if (subjectError) throw subjectError;
        setSubject(subjectData.subjects_name);
        
        const { data: gradeData, error: gradeError } = await supabase
          .from('grades')
          .select('grade_name, grade_no')
          .eq('grades_id', topicData.grade_id)
          .single();
          
        if (gradeError) throw gradeError;
        setGrade(gradeData.grade_name || `Grade ${gradeData.grade_no}`);
        
      } catch (error) {
        console.error('Error loading subtopic:', error);
        toast.error('Failed to load subtopic information');
      } finally {
        setLoading(false);
      }
    };

    loadSubtopic();
  }, [subtopicId]);

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

  const handleSave = async () => {
    if (!validateForm() || !subtopicId) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setSubmitting(true);

    try {
      await updateSubtopic(parseInt(subtopicId), {
        subtopic_title: formData.title.trim(),
        small_description: formData.description.trim() || null,
        full_explanation: formData.fullExplanation.trim()
      });

      toast.success('Subtopic updated successfully');
      setShowMandatoryModal(true);
    } catch (error) {
      console.error('Error updating subtopic:', error);
      toast.error('Failed to update subtopic');
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Always navigate directly to the subtopic view page
    if (subtopicId) {
      navigate(`/subtopics/${subtopicId}`);
    } else {
      navigate(-1);
    }
  };

  const handleMandatorySave = async (isMandatory: boolean, assessmentId: string | null) => {
    if (!subtopicId) return;
    
    try {
      const { error } = await supabase
        .from('subtopics')
        .update({
          must_complete_assessment: isMandatory,
          required_assessment_id: assessmentId
        })
        .eq('subtopic_id', subtopicId);
        
      if (error) throw error;
      
      toast.success('Mandatory assessment setting saved');
      navigate(`/subtopics/${subtopicId}`);
    } catch (error) {
      console.error('Error updating mandatory assessment:', error);
      toast.error('Failed to update mandatory assessment setting');
      navigate(`/subtopics/${subtopicId}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading subtopic...</div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-white">Edit Subtopic</h1>
            </div>
            <button onClick={handleCancel} className="flex items-center space-x-2 text-white hover:text-gray-200">
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Subtopic</span>
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
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white" 
              placeholder="Enter subtopic title" 
              required 
            />
            {validationErrors.title && <p className="mt-1 text-sm text-red-400">{validationErrors.title}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">Small Description</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white" 
              placeholder="Optional brief description" 
              rows={2} 
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">Full Explanation <span className="text-red-400">*</span></label>
            <textarea 
              value={formData.fullExplanation} 
              onChange={(e) => setFormData({ ...formData, fullExplanation: e.target.value })} 
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white" 
              placeholder="Detailed explanation" 
              rows={6} 
              required 
            />
            {validationErrors.fullExplanation && <p className="mt-1 text-sm text-red-400">{validationErrors.fullExplanation}</p>}
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button onClick={handleCancel} className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">Cancel</button>
            <button 
              onClick={handleSave} 
              disabled={submitting}
              className="px-6 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Assessment Modal */}
      {showMandatoryModal && subtopicId && (
        <MandatoryAssessmentModal
          isOpen={showMandatoryModal}
          onClose={() => {
            setShowMandatoryModal(false);
            navigate(`/subtopics/${subtopicId}`);
          }}
          subtopicId={parseInt(subtopicId)}
          onSave={handleMandatorySave}
        />
      )}
    </div>
  );
}