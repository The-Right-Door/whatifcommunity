import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSubjectsByStreamId } from '../services/subjectService';
import { supabase } from '../lib/supabase';

interface SubjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string | null;
  entityName: string;
  onConfirm: (selectedSubjects: number[]) => void;
  type?: 'stream' | 'skill' | 'learning'; // Added 'learning' type
}

interface Subject {
  id: number;
  name: string;
  description: string | null;
}

export default function SubjectSelectionModal({
  isOpen,
  onClose,
  entityId,
  entityName,
  onConfirm,
  type = 'stream'
}: SubjectSelectionModalProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (type === 'learning') {
        fetchEnrolledSubjects();
      } else if (entityId) {
        fetchSubjectsForEntity();
      }
    }
  }, [isOpen, entityId, type]);

  const fetchSubjectsForEntity = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Fetching subjects for ${type} ID:`, entityId);
      
      // Fetch subjects from the service
      const fetchedSubjects = await getSubjectsByStreamId(entityId!);
      
      console.log('📥 SubjectSelectionModal: Raw subjects data received:', fetchedSubjects);
      console.log('📦 SubjectSelectionModal: Number of subjects:', fetchedSubjects.length);
      
      if (fetchedSubjects.length > 0) {
        console.log('🔍 SubjectSelectionModal: First subject sample:', fetchedSubjects[0]);
      } else {
        console.log('⚠️ SubjectSelectionModal: No subjects returned from service');
        
        // Fallback to direct database query for debugging
        console.log('🔄 SubjectSelectionModal: Attempting direct database query as fallback');
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('subjects_status', 'active');
          
        if (error) {
          console.error('❌ SubjectSelectionModal: Fallback query error:', error);
        } else {
          console.log('📊 SubjectSelectionModal: Fallback query returned', data?.length, 'subjects');
        }
      }
      
      setSubjects(fetchedSubjects || []);
    } catch (error) {
      console.error(`❌ SubjectSelectionModal: Error fetching subjects for ${type}:`, error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledSubjects = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Authentication required');
      }
      
      // Get user profile to get enrolled subjects
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('subjects_enrolled')
        .eq('user_id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      const subjectIds = profile.subjects_enrolled || [];
      
      if (subjectIds.length === 0) {
        setSubjects([]);
        return;
      }
      
      // Fetch subject details
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('subjects_id, subjects_name, subjects_short_description')
        .in('subjects_id', subjectIds);
        
      if (subjectsError) throw subjectsError;
      
      const formattedSubjects = subjectsData.map(subject => ({
        id: subject.subjects_id,
        name: subject.subjects_name,
        description: subject.subjects_short_description
      }));
      
      setSubjects(formattedSubjects);
    } catch (error) {
      console.error('Error fetching enrolled subjects:', error);
      toast.error('Failed to load your enrolled subjects');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subjectId: number) => {
    if (type === 'learning') {
      // For learning, we only allow selecting one subject
      setSelectedSubjects([subjectId]);
    } else {
      setSelectedSubjects(prev => 
        prev.includes(subjectId)
          ? prev.filter(id => id !== subjectId)
          : [...prev, subjectId]
      );
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedSubjects);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-white mb-4">{entityName}</h3>
        
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white mb-2">
            {type === 'learning' ? 'Select a subject to start learning' : `Select Subjects for this ${type === 'stream' ? 'Stream' : 'Skill Path'}`}
          </h4>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-white">Loading subjects...</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {subjects.length > 0 ? (
                subjects.map(subject => (
                  <label
                    key={subject.id}
                    className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.id)}
                      onChange={() => toggleSubject(subject.id)}
                      className="h-4 w-4 rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                    />
                    <div>
                      <p className="text-white font-medium">{subject.name}</p>
                      {subject.description && (
                        <p className="text-sm text-gray-300">{subject.description}</p>
                      )}
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-gray-400 text-center">No subjects available</p>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors"
            disabled={selectedSubjects.length === 0}
          >
            {type === 'learning' ? 'Start Learning' : 'Confirm'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}