import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface StreamSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamId: string | null;
  streamName: string;
  onConfirm: (selectedSubjects: number[]) => void;
}

interface Subject {
  subjects_id: number;
  subjects_name: string;
  subjects_status: string;
  subjects_short_description: string | null;
}

export default function StreamSubjectModal({
  isOpen,
  onClose,
  streamId,
  streamName,
  onConfirm
}: StreamSubjectModalProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && streamId) {
      fetchSubjects();
    }
  }, [isOpen, streamId]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      
      // Fetch all active subjects
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('subjects_status', 'active');
      
      if (error) throw error;
      
      setSubjects(data || []);
      
      // TODO: In a real implementation, you would fetch the subjects already associated with this stream
      // and pre-select them. For now, we'll just start with an empty selection.
      setSelectedSubjects([]);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subjectId: number) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedSubjects);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg w-full max-w-md mx-4 overflow-hidden shadow-xl animate-slideUp">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white">{streamName}</h2>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-white mb-4">Select Subjects for this Stream</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-white">Loading subjects...</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto mb-6">
              {subjects.length > 0 ? (
                subjects.map(subject => (
                  <label
                    key={subject.subjects_id}
                    className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.subjects_id)}
                      onChange={() => toggleSubject(subject.subjects_id)}
                      className="h-4 w-4 rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                    />
                    <div>
                      <p className="text-white font-medium">{subject.subjects_name}</p>
                      {subject.subjects_short_description && (
                        <p className="text-sm text-gray-300">{subject.subjects_short_description}</p>
                      )}
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-gray-400 text-center">No subjects available</p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}