import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  UserCog, 
  Users2, 
  Briefcase,
  ArrowRight,
  BookOpen,
  FileText,
  Calendar
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export default function SpecialManagement() {
  const navigate = useNavigate();
  const { hasSpecialPermissions } = useUser();

  // Redirect if user doesn't have special permissions
  React.useEffect(() => {
    if (!hasSpecialPermissions) {
      navigate('/teacher/dashboard');
    }
  }, [hasSpecialPermissions, navigate]);

  // Stats data (hardcoded for now)
  const stats = {
    manageClasses: {
      totalClassesAvailable: 24,
      totalTeachersAssigned: 18,
      unallocatedTeachers: 6
    },
    manageCurriculum: {
      totalClassesWithOwners: 16,
      totalWithoutOwners: 8,
      pendingRequests: 3
    },
    manageResources: {
      specialAccessRequests: 5,
      rolesPermissionRequests: 3,
      financesRequests: 2
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
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-2xl font-bold text-white">Special Management</h1>
            </div>
            
            <Link 
              to="/teacher/dashboard"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">
          Special Management Features
        </h1>
        <p className="text-xl text-gray-200 mb-8 text-center max-w-3xl mx-auto">
          These administrative tools are available to you based on your special permissions.
          Use them to manage classes, teachers, and educational resources.
        </p>

        {/* Quick Action Buttons */}
        <div className="flex justify-center space-x-6 mb-12">
          <Link
            to="/allocate-teachers"
            className="px-6 py-3 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2 shadow-lg"
          >
            <UserCog className="h-5 w-5" />
            <span>Allocation of Teachers</span>
          </Link>
          
          <Link
            to="/generate-timetable"
            className="px-6 py-3 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2 shadow-lg"
          >
            <Calendar className="h-5 w-5" />
            <span>Generate Timetable</span>
          </Link>
        </div>

        {/* Management Cards - Horizontal Row with Vertical Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Manage Classes Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-emerald-600/30 rounded-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Manage Classes</h3>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">Assign classes to specific grades, subjects, and time slots</p>
            
            {/* Stats */}
            <div className="space-y-3 mb-6 flex-grow">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Total Classes Available</p>
                <p className="text-xl font-bold text-white">{stats.manageClasses.totalClassesAvailable}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Total Teachers Assigned</p>
                <p className="text-xl font-bold text-emerald-400">{stats.manageClasses.totalTeachersAssigned}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Classes Without Learners</p>
                <p className="text-xl font-bold text-yellow-400">{stats.manageClasses.unallocatedTeachers}</p>
              </div>
            </div>
            
            {/* Action Button */}
            <Link 
              to="/special/allocate-classes" 
              className="w-full bg-emerald-600/80 text-white px-6 py-3 rounded-lg hover:bg-emerald-500 transition-colors flex items-center justify-center space-x-2 mt-auto"
            >
              <span>Manage</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          
          {/* Manage Curriculum Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-emerald-600/30 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Manage Curriculum</h3>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">Assign teachers as owners for specific classes</p>
            
            {/* Stats */}
            <div className="space-y-3 mb-6 flex-grow">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Total Subjects</p>
                <p className="text-xl font-bold text-emerald-400">{stats.manageCurriculum.totalClassesWithOwners}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Total Educational Level</p>
                <p className="text-xl font-bold text-yellow-400">{stats.manageCurriculum.totalWithoutOwners}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Total Streams</p>
                <p className="text-xl font-bold text-blue-400">{stats.manageCurriculum.pendingRequests}</p>
              </div>
            </div>
            
            {/* Action Button */}
            <Link 
              to="/special/class-owners" 
              className="w-full bg-emerald-600/80 text-white px-6 py-3 rounded-lg hover:bg-emerald-500 transition-colors flex items-center justify-center space-x-2 mt-auto"
            >
              <span>Manage</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          
          {/* Manage Resources Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-emerald-600/30 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Manage Resources</h3>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">View, edit, and monitor all resources in the system</p>
            
            {/* Stats */}
            <div className="space-y-3 mb-6 flex-grow">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Special Access Requests</p>
                <p className="text-xl font-bold text-white">{stats.manageResources.specialAccessRequests}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Roles and Permission Requests</p>
                <p className="text-xl font-bold text-emerald-400">{stats.manageResources.rolesPermissionRequests}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Finances Requests</p>
                <p className="text-xl font-bold text-yellow-400">{stats.manageResources.financesRequests}</p>
              </div>
            </div>
            
            {/* Action Button */}
            <Link 
              to="/special/manage-classes" 
              className="w-full bg-emerald-600/80 text-white px-6 py-3 rounded-lg hover:bg-emerald-500 transition-colors flex items-center justify-center space-x-2 mt-auto"
            >
              <span>Manage</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}