import React, { useState, useEffect } from 'react';
import { X, Users, School } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface AskForHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtopicId: number;
  subtopicTitle: string;
}

export default function AskForHelpModal({
  isOpen,
  onClose,
  subtopicId,
  subtopicTitle
}: AskForHelpModalProps) {
  const [audience, setAudience] = useState<'community' | 'class'>('community');
  const [submitting, setSubmitting] = useState(false);
  const [classroomId, setClassroomId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [gradeId, setGradeId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSubtopicDetails();
    }
  }, [isOpen, subtopicId]);

  const fetchSubtopicDetails = async () => {
    try {
      // Get the topic_id from the subtopic
      const { data: subtopicData, error: subtopicError } = await supabase
        .from('subtopics')
        .select('topic_id')
        .eq('subtopic_id', subtopicId)
        .single();
        
      if (subtopicError) throw subtopicError;
      
      // Get the subject_id and grade_id from the topic
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select('subject_id, grade_id')
        .eq('topics_id', subtopicData.topic_id)
        .single();
        
      if (topicError) throw topicError;
      
      setSubjectId(topicData.subject_id);
      setGradeId(topicData.grade_id);
      
      // Get the user's classroom for this subject and grade
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const { data: classroomData, error: classroomError } = await supabase
        .from('classroom_learners')
        .select(`
          classroom_id,
          classrooms:classroom_id(
            classroom_id,
            grade_id,
            classroom_subject(subject_id)
          )
        `)
        .eq('learner_id', user.id);

      console.log('🏫 Fetched classroomData:', classroomData);
        
      if (classroomError) throw classroomError;
      
      // Find a classroom that matches both subject and grade
      const matchingClassroom = classroomData?.find(cl => 
        cl.classrooms.grade_id === topicData.grade_id && 
        cl.classrooms.classroom_subject.some((cs: any) => cs.subject_id === topicData.subject_id)
      );

       console.log('🎯 Matching classroom:', matchingClassroom);
      if (matchingClassroom) {
        setClassroomId(matchingClassroom.classroom_id);
      }
    } catch (error) {
      console.error('Error fetching subtopic details:', error);
    }
  };

  const handleSubmit = async () => {
    if (!subtopicId) return;
    
    setSubmitting(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

       console.log('📤 Sending help request for user:', user.id);
    console.log('➡️ Request details:', {
      learner_id: user.id,
      subtopic_id: subtopicId,
      subject_id: subjectId,
      grade_id: gradeId,
      classroom_id: audience === 'class' ? classroomId : null,
      request_type: audience,
      status: 'pending'
    });

      // Create a help request
      const { error: requestError } = await supabase
        .from('help_requests')
        .insert([{
          learner_id: user.id,
          subtopic_id: subtopicId,
          subject_id: subjectId,
          grade_id: gradeId,
          classroom_id: audience === 'class' ? classroomId : null,
          request_type: audience === 'community' ? 'community' : 'class',
          status: 'pending'
        }]);
        
      if (requestError) throw requestError;
      
      toast.success('Help request sent successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting help request:', error);
      toast.error('Failed to send help request');
    } finally {
      setSubmitting(false);
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
        
        <h3 className="text-xl font-bold text-white mb-4">Ask for Help</h3>
        
        <p className="text-gray-300 mb-6">
          Who would you like to ask for help with <span className="text-white font-medium">"{subtopicTitle}"</span>?
        </p>
        
        <div className="space-y-4 mb-6">
          <label className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
            <input
              type="radio"
              name="audience"
              value="community"
              checked={audience === 'community'}
              onChange={() => setAudience('community')}
              className="mt-1 h-4 w-4 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
            />
            <div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-emerald-400" />
                <span className="text-white font-medium">Ask the Whole Community</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Your question will be visible to all learners and mentors studying the same subject and grade
              </p>
            </div>
          </label>
          
          <label className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
            <input
              type="radio"
              name="audience"
              value="class"
              checked={audience === 'class'}
              onChange={() => setAudience('class')}
              className="mt-1 h-4 w-4 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
            />
            <div>
              <div className="flex items-center space-x-2">
                <School className="h-5 w-5 text-emerald-400" />
                <span className="text-white font-medium">Ask My Class/Group Only</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Your question will only be visible to members of your class or group
              </p>
              {audience === 'class' && !classroomId && (
                <p className="text-sm text-yellow-400 mt-2">
                  You're not assigned to a class for this subject. Your request will be sent to administrators.
                </p>
              )}
            </div>
          </label>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
          >
            <span>{submitting ? 'Sending...' : 'Send Request'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}