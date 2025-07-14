import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, ChevronLeft, BookOpen, Calculator, Beaker, BarChart2, Briefcase, Music, PenTool as Tool } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { updateUserProfile, fetchCurrentUserProfile } from '../services/userProfileService';
import { getStreams, getStreamsByGradeRange, Stream } from '../services/streamService';
import SubjectSelectionModal from '../components/SubjectSelectionModal';

export default function SelectStream() {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState<string>('10');
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  const [currentStreamName, setCurrentStreamName] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await fetchCurrentUserProfile();
        console.log('✅ SelectStream: User profile loaded:', profile);
        setUserProfile(profile);
        
        // If user already has a stream selected, preselect it
        if (profile.stream) {
          setSelectedStream(profile.stream);
        }
        
        // If user already has a grade, preselect it
        if (profile.grade_id) {
          setSelectedGrade(profile.grade_id.toString());
        }
        
        // Load streams for the initial grade
      //  fetchStreamsForGrade(selectedGrade);
          const gradesData = await getStreamsByGradeRange([1, 2, 3, 4, 5]);
        setStreams(gradesData);
      } catch (error) {
        console.error('❌ SelectStream: Error loading user profile:', error);
        toast.error('Failed to load your profile');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  /*
  // Fetch streams when grade changes
  useEffect(() => {
    fetchStreamsForGrade(selectedGrade);
  }, [selectedGrade]);

  const fetchStreamsForGrade = async (grade: string) => {
    try {
      setLoading(true);
      const gradeStreams = await getStreamsByGradeRange(parseInt(grade));
      setStreams(gradeStreams);
    } catch (error) {
      console.error('❌ Error fetching streams for grade:', error);
      toast.error('Failed to load streams for this grade');
    } finally {
      setLoading(false);
    }
  };
   */
  const handleStreamSelect = (stream: Stream) => {
    // Open the modal instead of just selecting the stream
    setCurrentStreamId(stream.id);
    setCurrentStreamName(stream.name);
    setIsModalOpen(true);
  };

  const handleConfirmSubjects = (selectedSubjectIds: number[]) => {
    console.log('🔍 Selected stream:', currentStreamId, 'with subjects:', selectedSubjectIds);
    setSelectedStream(currentStreamId);
    setSelectedSubjects(selectedSubjectIds);
    toast.success(`${currentStreamName} stream selected with ${selectedSubjectIds.length} subjects`);
  };

  const handleSubmit = async () => {
    if (!selectedStream) {
      toast.error('Please select a stream');
      return;
    }

    
  if (selectedSubjects.length === 0) {
    toast.error('Please select at least one subject');
    return;
  }
    setIsSubmitting(true);
    try {
      console.log('📝 Updating user profile with stream:', selectedStream, 'and grade:', selectedGrade);
//      const educationLevel = parseInt(selectedGrade); // 🔁 direct mapping to education_level
      const gradeMap: Record<string, number> = {
  '10': 3,
  '11': 4,
  '12': 5
};

const educationLevel = gradeMap[selectedGrade]; // Use this in updateUserProfile


    console.log('📝 Submitting user profile update...');
    console.log('  📘 Selected Stream ID:', selectedStream);
    console.log('  🎓 Selected Grade ID:', selectedGrade);
    console.log('  🧠 Education Level:', educationLevel);
    console.log('  📚 Selected Subjects:', selectedSubjects);
      
      // Update user profile with selected stream and grade
      await updateUserProfile({
    //    stream: selectedStream,
    //    grade_id: parseInt(selectedGrade),
    //    education_level: 'grade10to12',
    //    registration_complete: true
        grade_id: educationLevel,
      stream_id: parseInt(selectedStream),
      education_level: educationLevel,
      subjects_enrolled: selectedSubjects,
      registration_complete: true
      });

      toast.success('Stream selected successfully!');
      console.log('✅ Profile updated, redirecting to dashboard');
      
      // Navigate to appropriate dashboard
      navigate('/learner/dashboard');
    } catch (error) {
      console.error('❌ Error saving stream selection:', error);
      toast.error('Failed to save your selection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    console.log('🔄 Going back to registration form');
    navigate('/complete-registration');
  };

  // Get the appropriate icon for each stream
  const getStreamIcon = (streamName: string) => {
    const name = streamName.toLowerCase();
    if (name.includes('maths')) return <Calculator className="h-8 w-8 text-white" />;
    if (name.includes('science')) return <Beaker className="h-8 w-8 text-white" />;
    if (name.includes('commerce')) return <BarChart2 className="h-8 w-8 text-white" />;
    if (name.includes('arts')) return <Music className="h-8 w-8 text-white" />;
    if (name.includes('technical')) return <Tool className="h-8 w-8 text-white" />;
    return <BookOpen className="h-8 w-8 text-white" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
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

      <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <Users className="h-8 w-8" />
              <span className="text-xl font-bold">What-If Community</span>
            </Link>
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-2xl font-bold text-white">Select Your Stream</h1>
            </div>
            
            <button 
              onClick={handleGoBack}
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Choose Your Academic Path</h2>
          <p className="text-xl text-gray-200">
            Select the stream that aligns with your educational goals and interests
          </p>
        </div>

        {/* Grade Selection */}
        <div className="mb-12">
          <label className="block text-xl font-medium text-white mb-4">Select Your Grade</label>
          <div className="flex justify-center space-x-4">
            {['10', '11', '12'].map(grade => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  selectedGrade === grade
                    ? 'bg-emerald-600/80 text-white ring-2 ring-emerald-500 ring-offset-2 ring-offset-transparent'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Grade {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Stream Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {streams.map(stream => (
            <div 
              key={stream.id}
              className={`bg-white/10 backdrop-blur-sm border ${
                selectedStream === stream.id 
                  ? 'border-emerald-500 ring-2 ring-emerald-500 ring-offset-2 ring-offset-transparent' 
                  : 'border-white/20'
              } rounded-lg p-6 cursor-pointer hover:border-white/40 transition-all duration-300`}
              onClick={() => handleStreamSelect(stream)}
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className="p-4 bg-emerald-600/30 rounded-full mb-4">
                  {getStreamIcon(stream.name)}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{stream.name}</h3>
                <p className="text-gray-300 mb-6 flex-grow">
                  {stream.description || `Focus on ${stream.name} related subjects and skills.`}
                </p>
                <div className="w-full">
                  {selectedStream === stream.id && (
                    <div className="bg-emerald-600/20 text-emerald-400 py-2 px-4 rounded-lg">
                      Selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!selectedStream || isSubmitting}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              selectedStream && !isSubmitting
                ? 'bg-emerald-600/80 text-white hover:bg-emerald-500'
                : 'bg-white/10 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>

      {/* Subject Selection Modal */}
      <SubjectSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entityId={currentStreamId}
        entityName={currentStreamName}
        onConfirm={handleConfirmSubjects}
        type="stream"
      />
    </div>
  );
}