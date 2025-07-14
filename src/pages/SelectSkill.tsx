import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, ChevronLeft, Code, BarChart, Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateUserProfile, fetchCurrentUserProfile } from '../services/userProfileService';
import { getStreamsByGradeRange, Stream } from '../services/streamService';
import SubjectSelectionModal from '../components/SubjectSelectionModal';

export default function SelectSkill() {
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('beginner');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [skills, setSkills] = useState<Stream[]>([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSkillId, setCurrentSkillId] = useState<string | null>(null);
  const [currentSkillName, setCurrentSkillName] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await fetchCurrentUserProfile();
        console.log('✅ SelectSkill: User profile loaded:', profile);
        setUserProfile(profile);
        
        // If user already has a skill path selected, preselect it
        if (profile.skill_path) {
          setSelectedSkill(profile.skill_path);
        }
        
        // If user already has a skill level, preselect it
        if (profile.skill_level) {
          setSelectedLevel(profile.skill_level);
        }

        // Load skills from streams table with grade range [6, 7, 8]
        const skillsData = await getStreamsByGradeRange([6, 7, 8]);
        setSkills(skillsData);
      } catch (error) {
        console.error('❌ SelectSkill: Error loading user profile:', error);
        toast.error('Failed to load your profile');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  const handleSkillSelect = (skill: Stream) => {
    // Open the modal instead of just selecting the skill
    setCurrentSkillId(skill.id);
    setCurrentSkillName(skill.name);
    setIsModalOpen(true);
  };

  const handleLevelSelect = (level: string) => {
    console.log('🔍 Selected level:', level);
    setSelectedLevel(level);
  };

  const handleConfirmSubjects = (selectedSubjectIds: number[]) => {
    console.log('🔍 Selected skill:', currentSkillId, 'with subjects:', selectedSubjectIds);
    setSelectedSkill(currentSkillId);
    setSelectedSubjects(selectedSubjectIds);
    toast.success(`${currentSkillName} selected with ${selectedSubjectIds.length} subjects`);
  };

  const handleSubmit = async () => {
    if (!selectedSkill) {
      toast.error('Please select a skill development path');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('📝 Updating user profile with skill path:', selectedSkill, 'and level:', selectedLevel);
      

      const gradeMap: Record<string, number> = {
  beginner: 6,
  intermediate: 7,
  advanced: 8
};

const educationLevel = gradeMap[selectedLevel];



    console.log('📝 Submitting user profile update...');
    console.log('📌 Current user role:', userProfile?.role);
    console.log('  📘 Selected Stream ID:', selectedSkill);
    console.log('  🎓 Selected Grade ID:', selectedLevel);
    console.log('  🧠 Education Level:', educationLevel);
    console.log('  📚 Selected Subjects:', selectedSubjects);
   // console.log('📤 Sending profile to updateUserProfile:', profile);

      
      // Update user profile with selected skill path and level
      await updateUserProfile({
      //  skill_path: selectedSkill,
       // skill_level: selectedLevel,
      //  education_level: 'postGrade12',
      //    grade_id: educationLevel,
       role: userProfile.role,
      stream_id: parseInt(selectedSkill),
      education_level: educationLevel,
      subjects_enrolled: selectedSubjects,
        registration_complete: true
      });

      toast.success('Skill path selected successfully!');
      console.log('✅ Profile updated, redirecting to dashboard');
      
      // Navigate to appropriate dashboard
      navigate('/learner/dashboard');
    } catch (error) {
      console.error('❌ Error saving skill selection:', error);
      toast.error('Failed to save your selection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    console.log('🔄 Going back to registration form');
    navigate('/complete-registration');
  };

  // Get the appropriate icon for each skill
  const getSkillIcon = (skill: Stream) => {
    const iconName = skill.name.toLowerCase();
    
    if (iconName.includes('program') || iconName.includes('code')) 
      return <Code className="h-8 w-8 text-white" />;
    if (iconName.includes('analy') || iconName.includes('data') || iconName.includes('chart')) 
      return <BarChart className="h-8 w-8 text-white" />;
    if (iconName.includes('ai') || iconName.includes('brain') || iconName.includes('machine')) 
      return <Brain className="h-8 w-8 text-white" />;
    
    // Default icon
    return <Code className="h-8 w-8 text-white" />;
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
              <h1 className="text-2xl font-bold text-white">Skill Development</h1>
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
          <h2 className="text-3xl font-bold text-white mb-4">Choose Your Skill Development Path</h2>
          <p className="text-xl text-gray-200">
            Select the skill area you want to focus on for your post-Grade 12 development
          </p>
        </div>

        {/* Level Selection */}
        <div className="mb-12">
          <label className="block text-xl font-medium text-white mb-4">Select Your Level</label>
          <div className="flex justify-center space-x-4">
            {[
              { value: 'beginner', label: 'Level 1', sublabel: 'beginner' },
              { value: 'intermediate', label: 'Level 2', sublabel: 'intermediate' },
              { value: 'advanced', label: 'Level 3', sublabel: 'advanced' }
            ].map(level => (
              <button
                key={level.value}
                onClick={() => handleLevelSelect(level.value)}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  selectedLevel === level.value
                    ? 'bg-emerald-600/80 text-white ring-2 ring-emerald-500 ring-offset-2 ring-offset-transparent'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>{level.label}</span>
                  <span className="text-xs mt-1 opacity-80">{level.sublabel}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Skill Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {skills.map(skill => (
            <div 
              key={skill.id}
              className={`bg-white/10 backdrop-blur-sm border ${
                selectedSkill === skill.id 
                  ? 'border-emerald-500 ring-2 ring-emerald-500 ring-offset-2 ring-offset-transparent' 
                  : 'border-white/20'
              } rounded-lg p-6 cursor-pointer hover:border-white/40 transition-all duration-300`}
              onClick={() => handleSkillSelect(skill)}
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className="p-4 bg-emerald-600/30 rounded-full mb-4">
                  {getSkillIcon(skill)}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{skill.name}</h3>
                <p className="text-gray-300 mb-6 flex-grow">
                  {skill.description || `Focus on ${skill.name} related skills and knowledge.`}
                </p>
                <div className="w-full">
                  {selectedSkill === skill.id && (
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
            disabled={!selectedSkill || isSubmitting}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              selectedSkill && !isSubmitting
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
        entityId={currentSkillId}
        entityName={currentSkillName}
        onConfirm={handleConfirmSubjects}
        type="skill"
      />
    </div>
  );
}