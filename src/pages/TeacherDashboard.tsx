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
  ClipboardList,
  Users2,
  UserCog,
  Video,
  Settings,
  Calendar,
  BookMarked
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import ClassroomSubjectModal from '../components/ClassroomSubjectModal';

const dashboardCards = [
  {
    title: 'My Subjects',
    icon: BookOpen,
    link: '/subjects',
    state: { from: 'teacherDashboard' },
    description: 'Manage your teaching subjects'
  },
  {
    title: 'Learners',
    icon: Users2,
    action: 'openLearnerModal',
    description: 'View and manage your learners'
  },
  {
    title: 'My Assessments',
    icon: ClipboardList,
    link: '/teacher/assessments',
    description: 'Create and manage assessments'
  },
  {
    title: 'My Classes',
    icon: Video,
    link: '/classes',
    description: 'Manage your virtual classes'
  },
  {
    title: 'My Timetable',
    icon: Calendar,
    link: '/teacher/timetable',
    description: 'View and manage your schedule'
  },
  {
    title: 'Manage Class Requests',
    icon: BookMarked,
    link: '/teacher/class-requests',
    description: 'View and manage class requests'
  }
];

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { hasSpecialPermissions } = useUser();
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLearnerModalOpen, setIsLearnerModalOpen] = useState(false);

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
        const formattedName = profile.first_name
          ? `${profile.first_name.charAt(0)}. ${profile.last_name}`
          : profile.last_name;
        setUserName(formattedName);
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

  /*
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  */
  const handleCardClick = (action?: string) => {
    if (action === 'openLearnerModal') {
      setIsLearnerModalOpen(true);
    }
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
          Your teaching dashboard is ready
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
          
          {/* Special Management Card - Only shown if user has special permission */}
          {hasSpecialPermissions && (
            <Link
              to="/special/management"
              className="relative w-52 h-52 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-md border border-emerald-500/30 overflow-hidden transform transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <div className="p-3 bg-emerald-600/30 rounded-lg mb-3">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Special Access</h3>
                <p className="text-sm text-gray-300 text-center">Access administrative features for Academy</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Classroom Subject Selection Modal */}
      <ClassroomSubjectModal 
        isOpen={isLearnerModalOpen}
        onClose={() => setIsLearnerModalOpen(false)}
      />
    </div>
  );
}