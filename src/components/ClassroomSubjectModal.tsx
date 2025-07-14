import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ClassroomSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Classroom {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

export default function ClassroomSubjectModal({ isOpen, onClose }: ClassroomSubjectModalProps) {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTeacherClassrooms();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedClassroom) {
      fetchSubjectsForClassroom(selectedClassroom);
    } else {
      setSubjects([]);
      setSelectedSubject(null);
    }
  }, [selectedClassroom]);

  const fetchTeacherClassrooms = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Get classrooms where this teacher teaches
      const { data, error } = await supabase
        .from('classroom_teacher_subject')
        .select(`
          classroom_id,
          classrooms:classroom_id(
            classroom_id,
            classroom_name
          )
        `)
        .eq('teacher_id', user.id);

      if (error) throw error;

      // Transform and deduplicate classrooms
      const uniqueClassrooms = Array.from(
        new Map(
          data.map(item => [
            item.classroom_id,
            {
              id: item.classroom_id,
              name: item.classrooms.classroom_name
            }
          ])
        ).values()
      );

      setClassrooms(uniqueClassrooms);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      toast.error('Failed to load your classrooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectsForClassroom = async (classroomId: number) => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Get subjects this teacher teaches in this classroom
      const { data, error } = await supabase
        .from('classroom_teacher_subject')
        .select(`
          subject_id,
          subjects:subject_id(
            subjects_id,
            subjects_name
          )
        `)
        .eq('classroom_id', classroomId)
        .eq('teacher_id', user.id);

      if (error) throw error;

      // Transform subjects
      const subjectsList = data.map(item => ({
        id: item.subject_id,
        name: item.subjects.subjects_name
      }));

      setSubjects(subjectsList);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects for this classroom');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedClassroom || !selectedSubject) return;
    
    // Navigate to learners page with query parameters
    navigate(`/teacher/learners?classroom=${selectedClassroom}&subject=${selectedSubject}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md w-full">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-6 text-center">Select Classroom and Subject</h2>
        
        <div className="space-y-6">
          {/* Classroom Dropdown */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Classroom
            </label>
            <select
              value={selectedClassroom || ''}
              onChange={(e) => setSelectedClassroom(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              disabled={loading}
            >
              <option value="" className="bg-gray-900">Select a classroom</option>
              {classrooms.map(classroom => (
                <option key={classroom.id} value={classroom.id} className="bg-gray-900">
                  {classroom.name}
                </option>
              ))}
            </select>
            {loading && classrooms.length === 0 && (
              <p className="mt-2 text-sm text-gray-400">Loading classrooms...</p>
            )}
            {!loading && classrooms.length === 0 && (
              <p className="mt-2 text-sm text-yellow-400">You don't have any assigned classrooms</p>
            )}
          </div>
          
          {/* Subject Dropdown */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Subject
            </label>
            <select
              value={selectedSubject || ''}
              onChange={(e) => setSelectedSubject(e.target.value ? parseInt(e.target.value) : null)}
              className={`w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40 ${
                !selectedClassroom ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!selectedClassroom || loading}
            >
              <option value="" className="bg-gray-900">Select a subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id} className="bg-gray-900">
                  {subject.name}
                </option>
              ))}
            </select>
            {loading && selectedClassroom && subjects.length === 0 && (
              <p className="mt-2 text-sm text-gray-400">Loading subjects...</p>
            )}
            {!loading && selectedClassroom && subjects.length === 0 && (
              <p className="mt-2 text-sm text-yellow-400">No subjects found for this classroom</p>
            )}
          </div>
          
          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedClassroom || !selectedSubject}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              selectedClassroom && selectedSubject
                ? 'bg-emerald-600/80 text-white hover:bg-emerald-500'
                : 'bg-white/10 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}