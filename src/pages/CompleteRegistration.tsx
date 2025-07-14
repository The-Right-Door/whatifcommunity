import React, { useState, useEffect } from 'react';
import { Users, Upload } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { getAllActiveSubjects } from '../services/subjectService';
import { fetchGrades } from '../services/gradeService';
import { fetchActiveSubjects } from '../services/subjectService';
import { fetchCurrentUserProfile, updateUserProfile } from '../services/userProfileService';
import { uploadProfileImage } from '../services/imageUploadService'; // optional


const SUPABASE_URL = 'https://kfqpexcrslxxroovxubq.supabase.co';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  date_of_birth: string | null;
  subjects_majored?: string[];
  profile_image_url?: string;
  experience?: string;
  achievements?: string;
  grade_id?: number;
  registration_complete?: boolean;
  special_permissions?: boolean;
  education_level?: string;
}

interface Grade {
  grades_id: number;
  grade_no: number;
}

interface Subject {
  subjects_id: number;
  subjects_name: string;
  subjects_status: string;
  subjects_short_description: string;
}

export default function CompleteRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const isFromDashboard = new URLSearchParams(location.search).get('from') === 'dashboard';
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [educationLevel, setEducationLevel] = useState<string>('');

  console.log(`🔄 Component rendering, educationLevel is: ${educationLevel}`);

  // Education level routing effect - placed first to ensure it runs before other effects
  useEffect(() => {
    console.log(`🔄 Education level useEffect triggered, educationLevel: ${educationLevel}`);
    
    if (educationLevel) {
      console.log(`🔄 Routing based on education level: ${educationLevel}`);
      
      if (educationLevel === 'postGrade12') {
        console.log('🔄 Navigating to skill selection page');
        navigate('/select-skill');
        return;
      } 
      
      if (educationLevel === 'grade10to12') {
        console.log('🔄 Navigating to stream selection page');
        navigate('/select-stream');
        return;
      }
    } else {
      console.log(`🔄 Not routing: educationLevel=${educationLevel}`);
    }
  }, [educationLevel, navigate]);

  useEffect(() => {
    console.log('🚀 CompleteRegistration.tsx: Page mounted');
    fetchUserProfile();
    fetchGradesAndSubjects();
  }, []);

  useEffect(() => {
    if (loading || !userProfile) return;

    console.log('🔍 Redirect check:', {
      loading,
      userProfile,
      isFromDashboard,
      registrationComplete: userProfile.registration_complete
    });

    if (userProfile.registration_complete && !isFromDashboard) {
      const target = userProfile.role === 'teacher' ? '/teacher/dashboard' : '/learner/dashboard';
      navigate(target);
    }
    
    // Set education level from profile if available
    if (userProfile.education_level) {
      console.log('📝 Setting education level from profile:', userProfile.education_level);
      setEducationLevel(userProfile.education_level);
    }
  }, [userProfile, isFromDashboard, loading, navigate]);

  const fetchGradesAndSubjects = async () => {
    try {
       const gradesData = await fetchGrades(); // call gradeService
       setGrades(gradesData);

       const subjectsData = await getAllActiveSubjects(); // call subjectService
       setSubjects(subjectsData);
      const coursesSubject = subjectsData.find(s => s.subjects_name === 'Courses');
if (coursesSubject) {
  await fetchCourses(coursesSubject.subjects_id);
}
      
    } catch (error) {
      console.error('Error fetching grades and subjects:', error);
      toast.error('Failed to load grades and subjects');
    }
  };

  const fetchUserProfile = async () => {
    try {
    console.log('🔍 CompleteRegistration: Fetching user profile');
    const profile = await fetchCurrentUserProfile();
    console.log('✅ CompleteRegistration: User profile fetched:', profile);
    
    setUserProfile({
      ...profile,
      subjects_majored: profile.subjects_majored || []
    });

    // Set education level from profile if available
    if (profile.education_level) {
      console.log('📝 Setting education level from profile:', profile.education_level);
      setEducationLevel(profile.education_level);
    }
  } catch (error) {
    console.error('❌ CompleteRegistration: Error fetching user profile:', error);
    toast.error('Failed to load user profile');
    navigate('/login');
  } finally {
    setLoading(false);
  }
};
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
    const publicUrl = await uploadProfileImage(file);

    setUserProfile(prev => prev ? {
      ...prev,
      profile_image_url: publicUrl
    } : null);

    toast.success('Profile image uploaded successfully');
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error('Failed to upload image');
  } finally {
    setUploadingImage(false);
  }
};

  const handleSubjectChange = (subjectName: string, isChecked: boolean) => {
    setUserProfile(prev => {
      if (!prev) return null;
      
      const currentSubjects = [...(prev.subjects_majored || [])];
      
      if (isChecked && !currentSubjects.includes(subjectName)) {
        return {
          ...prev,
          subjects_majored: [...currentSubjects, subjectName]
        };
      } else if (!isChecked && currentSubjects.includes(subjectName)) {
        return {
          ...prev,
          subjects_majored: currentSubjects.filter(s => s !== subjectName)
        };
      }
      
      return prev;
    });
  };

  const handleEducationLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value;
    console.log(`🔄 Setting education level to: ${level}`);
    setEducationLevel(level);
    
    // Update the user profile with the selected education level
    setUserProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        education_level: level
      };
    });
  };

  const handleCancel = () => {
    const target = userProfile?.role === 'teacher' ? '/teacher/dashboard' : '/learner/dashboard';
    navigate(target);
  };

    const handleGoBack = () => {
    console.log('🔄 Going back to registration form');
    navigate('/complete-registration');
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) return;

    try {
      console.log('🔍 CompleteRegistration: Submitting profile update:', userProfile);
      console.log('🔍 Education level selected:', educationLevel);
      
      const updateData = {
        ...userProfile,
        registration_complete: true,
        education_level: educationLevel
      };

      // Remove undefined or empty values
      Object.keys(updateData).forEach(key => {
        if (
          updateData[key as keyof UserProfile] === undefined ||
          updateData[key as keyof UserProfile] === ''
        ) {
          delete updateData[key as keyof UserProfile];
        }
      });

      console.log('🔍 CompleteRegistration: Final update data:', updateData);
      await updateUserProfile(updateData);

      toast.success(isFromDashboard ? 'Profile updated successfully!' : 'Registration completed successfully!');
      
      setUserProfile({ ...userProfile, registration_complete: true });
      console.log('✅ CompleteRegistration: Profile updated, registration_complete set to true');

      // Route based on education level selection
      if (educationLevel === 'postGrade12') {
        console.log('🔄 Navigating to skill development page');
        navigate('/select-skill');
      } else if (educationLevel === 'grade10to12') {
        console.log('🔄 Navigating to stream selection page');
        navigate('/select-stream');
      } else if (!isFromDashboard) {
        const target = userProfile.role === 'teacher' ? '/teacher/dashboard' : '/learner/dashboard';
        console.log(`🔄 CompleteRegistration: Redirecting to ${target}`);
        navigate(target);
      }
    } catch (error) {
      console.error('❌ CompleteRegistration: Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

   
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-400 text-xl">Failed to load profile</div>
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="bg-transparent backdrop-blur-sm border border-white/20 rounded-lg p-8 max-w-md w-full">
          <div className="flex items-center space-x-2 mb-6 justify-center">
            <Users className="h-8 w-8 text-white" />
            <h2 className="text-2xl font-bold text-white">
              {isFromDashboard ? 'Edit Profile' : 'Complete Your Registration'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white">First Name</label>
                <input
                  type="text"
                  required
                  value={userProfile.first_name || ''}
                  onChange={(e) => setUserProfile({ ...userProfile, first_name: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white">Last Name</label>
                <input
                  type="text"
                  required
                  value={userProfile.last_name || ''}
                  onChange={(e) => setUserProfile({ ...userProfile, last_name: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white">Email</label>
              <input
                type="email"
                value={userProfile.email}
                disabled
                className="mt-1 block w-full rounded-md bg-white/5 border-white/10 text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white">Role</label>
              <input
                type="text"
                value={userProfile.role}
                disabled
                className="mt-1 block w-full rounded-md bg-white/5 border-white/10 text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white">Date of Birth</label>
              <input
                type="date"
                required
                value={userProfile.date_of_birth || ''}
                onChange={(e) => setUserProfile({ ...userProfile, date_of_birth: e.target.value })}
                className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white focus:border-white focus:ring focus:ring-white/20"
              />
            </div>

            {/* Education Level Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Education Level</label>
              <select
                value={educationLevel}
                onChange={handleEducationLevelChange}
                className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white focus:border-white focus:ring focus:ring-white/20"
              >
                <option value="" className="bg-gray-900">Select Education Level</option>
                <option value="grade10to12" className="bg-gray-900">Grade 10 to 12</option>
                <option value="postGrade12" className="bg-gray-900">Post-Grade 12 Skill Development</option>
              </select>
            </div>

            {userProfile.role === 'learner' && educationLevel === 'grade10to12' && (
              <div>
                <label className="block text-sm font-medium text-white">Grade</label>
                <select
                  required
                  value={userProfile.grade_id || ''}
                  onChange={(e) => setUserProfile({ ...userProfile, grade_id: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white focus:border-white focus:ring focus:ring-white/20"
                >
                  <option value="" className="bg-gray-900">Select your grade</option>
                  {grades.map(grade => (
                    <option key={grade.grades_id} value={grade.grades_id} className="bg-gray-900">
                      Grade {grade.grade_no}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {userProfile.role === 'teacher' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Subjects Majored</label>
                  <div className="mt-1 bg-white/10 border border-white/20 rounded-md p-3 max-h-48 overflow-y-auto">
                    {subjects.map(subject => (
                      <div key={subject.subjects_id} className="flex items-center mb-2 last:mb-0">
                        <input
                          type="checkbox"
                          id={`subject-${subject.subjects_id}`}
                          checked={userProfile.subjects_majored?.includes(subject.subjects_name) || false}
                          onChange={(e) => handleSubjectChange(subject.subjects_name, e.target.checked)}
                          className="h-4 w-4 rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                        />
                        <label 
                          htmlFor={`subject-${subject.subjects_id}`}
                          className="ml-2 block text-white"
                        >
                          {subject.subjects_name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                

                <div>
                  <label className="block text-sm font-medium text-white">Experience</label>
                  <textarea
                    required
                    value={userProfile.experience || ''}
                    onChange={(e) => setUserProfile({ ...userProfile, experience: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                    placeholder="Describe your teaching experience..."
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-2">Profile Image</label>
              {userProfile.profile_image_url && (
                <div className="mb-4">
                  <img
                    src={userProfile.profile_image_url}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                </div>
              )}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-image"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="profile-image"
                  className={`flex items-center justify-center space-x-2 w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white cursor-pointer hover:bg-white/20 transition-colors ${
                    uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="h-5 w-5" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Profile Image'}</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white">
                Achievements {userProfile.role === 'learner' && '(Optional)'}
              </label>
              <textarea
                value={userProfile.achievements || ''}
                onChange={(e) => setUserProfile({ ...userProfile, achievements: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                placeholder="List your achievements..."
                required={userProfile.role === 'teacher'}
              />
            </div>

            {userProfile.role === 'teacher' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="special-permissions"
                  checked={userProfile.special_permissions || false}
                  onChange={(e) => setUserProfile({ ...userProfile, special_permissions: e.target.checked })}
                  className="h-4 w-4 rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50 mr-2"
                />
                <label 
                  htmlFor="special-permissions"
                  className="text-white cursor-pointer"
                >
                  Enable special permissions
                </label>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                {isFromDashboard ? 'Save Changes' : 'Save & Continue'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-white/10 text-white px-4 py-2 rounded-md hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}