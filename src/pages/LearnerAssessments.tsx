import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { checkPaymentStatus } from '../services/paymentService';
import toast from 'react-hot-toast';
import { 
  Users, 
  ChevronLeft,
  BookOpen,
  Users2,
  User,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  HourglassIcon,
  ArrowRight,
  CheckSquare,
  XCircle,
  BarChart
} from 'lucide-react';

export default function LearnerAssessments() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Card data for the three assessment types
  const assessmentTypes = [
    {
      title: "Class Assessments",
      icon: BookOpen,
      stats: {
        total: 12,
        upcoming: 3,
        inProgress: 2,
        completed: 7
      },
      nextDue: {
        title: "Algebra Quiz",
        timeRemaining: "2 days"
      }
    },
    {
      title: "Group Assessments",
      icon: Users2,
      stats: {
        total: 8,
        upcoming: 2,
        inProgress: 1,
        completed: 5
      },
      nextDue: {
        title: "Physics Group Project",
        timeRemaining: "3 days"
      }
    },
    {
      title: "Individual Assessments",
      icon: User,
      stats: {
        total: 5,
        upcoming: 1,
        inProgress: 0,
        completed: 4
      },
      nextDue: {
        title: "Literature Analysis",
        timeRemaining: "1 day"
      }
    }
  ];

  // Sample upcoming assessments for quick access
  const upcomingAssessments = [
    {
      id: 1,
      title: "Mathematics: Calculus Review",
      dueDate: "2025-03-25",
      timeRemaining: "2 days",
      type: "class"
    },
    {
      id: 2,
      title: "Physics: Forces and Motion",
      dueDate: "2025-03-26",
      timeRemaining: "3 days",
      type: "group"
    },
    {
      id: 3,
      title: "English Literature: Poetry Analysis",
      dueDate: "2025-03-24",
      timeRemaining: "1 day",
      type: "individual"
    }
  ];

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

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/payment')}
                className="flex items-center space-x-2 bg-yellow-600/80 text-white px-4 py-2 rounded-full hover:bg-yellow-500 transition-all duration-300"
              >
                <span>Upgrade</span>
              </button>
              
              <Link 
                to="/learner/dashboard"
                className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
          
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-2xl font-bold text-white">My Assessments</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Welcome to your assessment center!</h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Here you will find all your tests, quizzes, and reviews — whether for your class, group, or just you!
          </p>
        </div>

        {/* Horizontal Navigation Buttons */}
        <div className="flex justify-center space-x-4 mb-12">
          <Link 
            to="/learner/assessments/in-progress"
            className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 flex items-center space-x-2 transform hover:-translate-y-1"
          >
            <HourglassIcon className="h-5 w-5 text-yellow-400" />
            <span>In Progress</span>
          </Link>
          
          <Link 
            to="/learner/assessments/upcoming"
            className="px-6 py-3 bg-emerald-600/80 backdrop-blur-sm border border-emerald-500/50 rounded-lg text-white hover:bg-emerald-500 transition-all duration-300 flex items-center space-x-2 transform hover:-translate-y-1 shadow-lg shadow-emerald-900/20"
          >
            <Calendar className="h-5 w-5" />
            <span>Upcoming</span>
          </Link>
          
          <Link 
            to="/learner/assessments/completed"
            className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 flex items-center space-x-2 transform hover:-translate-y-1"
          >
            <CheckSquare className="h-5 w-5 text-emerald-400" />
            <span>Completed</span>
          </Link>
          
          <Link 
            to="/learner/assessments/missed"
            className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 flex items-center space-x-2 transform hover:-translate-y-1"
          >
            <XCircle className="h-5 w-5 text-red-400" />
            <span>Missed</span>
          </Link>
        </div>

        {/* Assessment Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {assessmentTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 flex flex-col h-full hover:border-white/30 transition-all duration-300"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-emerald-600/30 rounded-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{type.title}</h3>
                </div>
                
                {/* Summary Stats Section */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Assessments:</span>
                    <span className="text-white font-medium">{type.stats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Upcoming:</span>
                    <span className="text-white font-medium">{type.stats.upcoming}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">In Progress:</span>
                    <span className="text-white font-medium">{type.stats.inProgress}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Completed:</span>
                    <span className="text-white font-medium">{type.stats.completed}</span>
                  </div>
                </div>
                
                {/* Next Due Section */}
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Next Due:</h4>
                  <p className="text-white">{type.nextDue.title} <span className="text-emerald-400">in {type.nextDue.timeRemaining}</span></p>
                </div>
                
                {/* View All Button */}
                <div className="mt-auto">
                  <button
                    onClick={() => navigate(`/learner/assessments/${index === 0 ? 'class' : index === 1 ? 'group' : 'individual'}`)}
                    className="w-full bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>View Details</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming Assessments Section */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-emerald-600/30 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Upcoming Assessments</h3>
          </div>

          <div className="space-y-4">
            {upcomingAssessments.map(assessment => (
              <div 
                key={assessment.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-1">{assessment.title}</h4>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-gray-300">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                        <span>Due: {new Date(assessment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-300">
                        <HourglassIcon className="h-4 w-4 text-emerald-400" />
                        <span>Time remaining: {assessment.timeRemaining}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          assessment.type === 'class' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : assessment.type === 'group'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors">
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <h4 className="text-lg font-medium text-white">Completed</h4>
            </div>
            <p className="text-3xl font-bold text-white">16</p>
            <p className="text-gray-300 mt-2">Assessments completed this term</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <HourglassIcon className="h-5 w-5 text-yellow-400" />
              <h4 className="text-lg font-medium text-white">In Progress</h4>
            </div>
            <p className="text-3xl font-bold text-white">3</p>
            <p className="text-gray-300 mt-2">Assessments currently in progress</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="h-5 w-5 text-blue-400" />
              <h4 className="text-lg font-medium text-white">Upcoming</h4>
            </div>
            <p className="text-3xl font-bold text-white">6</p>
            <p className="text-gray-300 mt-2">Assessments scheduled soon</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <XCircle className="h-5 w-5 text-red-400" />
              <h4 className="text-lg font-medium text-white">Missed</h4>
            </div>
            <p className="text-3xl font-bold text-white">2</p>
            <p className="text-gray-300 mt-2">Assessments missed this term</p>
          </div>
        </div>
      </div>
    </div>
  );
}