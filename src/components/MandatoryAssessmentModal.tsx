import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface MandatoryAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtopicId: number;
  onSave: (isMandatory: boolean, assessmentId: number | null) => Promise<void>;
}

interface Assessment {
  assessment_id: string;
  title: string;
  subject: string;
  grade: string;
}

export default function MandatoryAssessmentModal({
  isOpen,
  onClose,
  subtopicId,
  onSave
}: MandatoryAssessmentModalProps) {
  const [isMandatory, setIsMandatory] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchAssessments();
    }
  }, [isOpen, subtopicId]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      
      // First get the review_ids linked to this subtopic
      const { data: reviewSubtopics, error: reviewSubtopicsError } = await supabase
        .from('review_subtopics')
        .select('review_id')
        .eq('subtopic_id', subtopicId);
        
      if (reviewSubtopicsError) throw reviewSubtopicsError;
      
      if (!reviewSubtopics || reviewSubtopics.length === 0) {
        setAssessments([]);
        setLoading(false);
        return;
      }
      
      const reviewIds = reviewSubtopics.map(rs => rs.review_id);
      
      // Then get the assessments linked to these reviews
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select('assessment_id, title, subject, grade')
        .in('review_id', reviewIds)
        .eq('status', 'active');
        
      if (assessmentsError) throw assessmentsError;
      
      setAssessments(assessmentsData || []);
      
      // Check if the subtopic already has a mandatory assessment
      const { data: subtopic, error: subtopicError } = await supabase
        .from('subtopics')
        .select('must_complete_assessment, required_assessment_id')
        .eq('subtopic_id', subtopicId)
        .single();
        
      if (subtopicError) throw subtopicError;
      
      if (subtopic) {
        setIsMandatory(subtopic.must_complete_assessment || false);
        setSelectedAssessment(subtopic.required_assessment_id || null);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await onSave(isMandatory, isMandatory ? selectedAssessment : null);
      onClose();
    } catch (error) {
      console.error('Error saving mandatory assessment:', error);
      toast.error('Failed to save mandatory assessment setting');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md w-full">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h3 className="text-xl font-bold text-white mb-6">Make Subtopic Mandatory?</h3>
        
        <p className="text-gray-300 mb-6">
          Should learners be required to complete an assessment before proceeding to the next subtopic?
        </p>
        
        <div className="mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isMandatory}
              onChange={(e) => setIsMandatory(e.target.checked)}
              className="h-5 w-5 rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
            />
            <span className="text-white">Make this subtopic mandatory</span>
          </label>
        </div>
        
        {isMandatory && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Select Required Assessment
            </label>
            {loading ? (
              <div className="text-center py-4 text-gray-400">Loading assessments...</div>
            ) : assessments.length > 0 ? (
              <select
                value={selectedAssessment || ''}
                onChange={(e) => setSelectedAssessment(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              >
                <option value="" className="bg-gray-900">Select an assessment</option>
                {assessments.map(assessment => (
                  <option key={assessment.assessment_id} value={assessment.assessment_id} className="bg-gray-900">
                    {assessment.title} ({assessment.subject} - {assessment.grade})
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-400">
                No assessments found for this subtopic. Please create an assessment first.
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSave}
            disabled={isMandatory && !selectedAssessment}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isMandatory && !selectedAssessment
                ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                : 'bg-emerald-600/80 text-white hover:bg-emerald-500'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}