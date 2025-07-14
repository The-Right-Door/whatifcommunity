import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { handleLogout } from '../lib/logout';
import { supabase } from '../lib/supabase';
import { fetchCurrentUserProfile } from '../services/userProfileService';

import { checkPaymentStatus } from '../services/paymentService';

import toast from 'react-hot-toast';
import { 
  Users, 
  LogOut, 
  BookOpen, 
  Calendar, 
  ClipboardList,
  Video,
  Users2,
  UserCog,
  BookOpen as BookOpenIcon,
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import SubjectSelectionModal from '../components/SubjectSelectionModal';

const dashboardCards = [
  {
    title: 'My Subjects',
    icon: BookOpen,
    link: '/subjects',
    state: { from: 'learnerDashboard' },
    description: 'Access your enrolled subjects'
  },
  {
    title: 'My Assessments',
    icon: ClipboardList,
    link: '/learner/assessments',
    description: 'View and complete assessments'
  },
  {
    title: 'My Classes',
    icon: Video,
    link: '/classes',
    description: 'Join virtual classes'
  },
  {
    title: 'Study Groups',
    icon: Users2,
    link: '/learner/study-groups',
    description: 'Collaborate with peers'
  },
  {
    title: 'My Learnings',
    icon: GraduationCap,
    action: 'startLearning',
    description: 'Continue your learning journey'
  },
  {
    title: 'Community Support',
    icon: MessageSquare,
    link: '/community-support',
    description: 'Get help from the community'
  }
];

export default function LearnerDashboard() {
  const navigate = useNavigate();
  const {profile } = useUser();
  const [userName, setUserName] = useState<string>('');
  const [hasSpecialPermissions, setHasSpecialPermissions] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [enrolledSubjects, setEnrolledSubjects] = useState<any[]>([]);

  useEffect(() => {
    /*
    const checkAccess = async () => {
      setIsLoading(true);
      try {
        const isPaid = await checkPaymentStatus();
        if (!isPaid) {
          toast.error("This feature requires an active subscription");
          navigate('/payment');
          return;
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
    */
    const getUserProfile = async () => {
      try {
        const profile = await fetchCurrentUserProfile();
        // Now you have full profile: first_name, last_name, etc

        const formattedName = profile.first_name
          ? `${profile.first_name.charAt(0)}. ${profile.last_name}`
          : profile.last_name; // fallback if no first name

        setUserName(formattedName);
        setHasSpecialPermissions(profile.special_permissions || false);
        
        // Get enrolled subjects
        if (profile.subjects_enrolled && Array.isArray(profile.subjects_enrolled)) {
          setEnrolledSubjects(profile.subjects_enrolled);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);

        if (error instanceof Error && 'code' in error) {
          if (error.code === 'AUTH_REQUIRED') {
            handleLogout();
          }
        }
      }
    };

    getUserProfile();
  }, []);



 // const handleCardClick = (action?: string) => {

const handleCardClick = async (action?: string, link?: string) => {
 const premiumLinks = ['/learner/assessments', '/community-support'];
  const requiresPayment = action === 'startLearning' || (link && premiumLinks.includes(link));

  if (requiresPayment) {
    const isPaid = await checkPaymentStatus();
    if (!isPaid) {
      toast.error("Please upgrade your subscription to access this feature.");
      navigate('/payment');
      return;
    }
  }

    if (action === 'startLearning') {
      if (profile?.subjects_enrolled && Array.isArray(profile.subjects_enrolled)) {
        if (profile.subjects_enrolled.length === 1) {
          // If only one subject, navigate directly
          navigate(`/start-learning/${profile.subjects_enrolled[0]}`);
        } else if (profile.subjects_enrolled.length > 1) {
          // If multiple subjects, show selection modal
          setIsSubjectModalOpen(true);
        } else {
          // No subjects enrolled
          toast.error('You need to enroll in subjects first');
        }
      } else {
        // No subjects enrolled
        toast.error('You need to enroll in subjects first');
      }
    }
  if (link) {
    navigate(link);
  }
  };

  const handleSubjectSelect = (subjectId: number) => {
    navigate(`/start-learning/${subjectId}`);
    
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image with Overlay */}
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

      {/* Navigation */}
      <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <Users className="h-8 w-8" />
              <span className="text-xl font-bold">What-If Community</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/complete-registration?from=dashboard')}
                className="flex items-center space-x-2 bg-emerald-600/80 text-white px-4 py-2 rounded-full hover:bg-emerald-500 transition-all duration-300 mr-2"
              >
                <UserCog className="h-5 w-5" />
                <span>Update Profile</span>
              </button>
              
              <button
                onClick={() => navigate('/payment')}
                className="flex items-center space-x-2 bg-yellow-600/80 text-white px-4 py-2 rounded-full hover:bg-yellow-500 transition-all duration-300 mr-2"
              >
                <span>Upgrade</span>
              </button>
              
              <button
                className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
                onClick={handleLogout}
              >
                <span>Sign Out</span>
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {userName}
        </h1>
        <p className="text-xl text-gray-200 mb-12">
          Ready to continue your learning journey?
          {hasSpecialPermissions && <span className="ml-2 text-emerald-400">(Special Access Enabled)</span>}
        </p>

        {/* Dashboard Cards */}
        <div className="flex flex-wrap justify-center items-center gap-6">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                onClick={() => card.action ? handleCardClick(card.action) : null}
                className={`relative w-52 h-52 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 overflow-hidden transform transition-all duration-300 hover:scale-105 ${card.action ? 'cursor-pointer' : ''}`}
              >
                {card.link ? (
                  <Link
                    to={card.link}
                    state={card.state}
                    className="absolute inset-0 flex flex-col items-center justify-center p-4"
                  >
                    <div className="p-3 bg-emerald-600/30 rounded-lg mb-3">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-300 text-center">{card.description}</p>
                  </Link>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <div className="p-3 bg-emerald-600/30 rounded-lg mb-3">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-300 text-center">{card.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject Selection Modal */}
      <SubjectSelectionModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        entityId={null}
        entityName="Choose a subject to start learning"
        onConfirm={(selectedSubjects) => {
          if (selectedSubjects.length > 0) {
            handleSubjectSelect(selectedSubjects[0]);
          }
        }}
        type="learning"
      />
    </div>
  );
}