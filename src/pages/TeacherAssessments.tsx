import React, { useEffect, useState } from 'react';
import { checkPaymentStatus } from '../services/paymentService';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft,
  ClipboardList, 
  Calendar,
  Archive,
  Sparkles,
  FileEdit,
  FileText,
  Database,
  Clock,
  Bell,
  BarChart,
  Repeat,
  CheckSquare,
  Send,
  Calendar as CalendarIcon,
  Bell as BellIcon
} from 'lucide-react';

const reviewTypes = [
  {
    title: "Create New Assessment",
    icon: ClipboardList,
    description: "Generate assessments using AI, manual entry, templates, or from your question bank.",
    actions: [
      { label: "AI-Generated Review", path: "/teacher/daily-review", icon: Sparkles },
      { label: "Manual Entry", path: "/teacher/manual-entry-review", icon: FileEdit },
      { label: "Template-Based", path: "/teacher/template-review", icon: FileText },
      { label: "Question Bank", path: "/teacher/hybrid-review", icon: Database }
    ]
  },
  {
    title: "Manage Assessments",
    icon: Calendar,
    description: "Manage upcoming assessments, edit drafts, and set reminders for your learners.",
    actions: [
      { label: "✅ All Generated Assessments", path: "/teacher/all-generated-assessments", icon: CheckSquare},
      { label: "📤 Sent Assessments", path: "/teacher/sent-assessments", icon: Send },
      { label: "📅 Scheduled Assessments", path: "/teacher/scheduled-assessments", icon: CalendarIcon },
      { label: "🔔 Reminders", path: "/teacher/assessment-reminders", icon: BellIcon }
    ]
  },
  {
    title: "Assessment History",
    icon: Archive,
    description: "Review past assessments, analyze performance data, and reuse questions.",
    actions: [
      { label: "View History", path: "/teacher/past-reviews", icon: Archive },
      { label: "Performance Analytics", path: "/teacher/analyze-results", icon: BarChart },
      { label: "Reuse Questions", path: "/teacher/reuse-questions", icon: Repeat },
      { label: "Export Results", path: "/teacher/export-results", icon: FileText }
    ]
  }
];

export default function TeacherAssessments() {
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

  const handleActionClick = (path: string) => {
    navigate(path);
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/payment')}
              className="flex items-center space-x-2 bg-yellow-600/80 text-white px-4 py-2 rounded-full hover:bg-yellow-500 transition-all duration-300"
            >
              <span>Upgrade</span>
            </button>
            
            <Link 
              to="/teacher/dashboard"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-2xl font-bold text-white">Assessment Center</h1>
          </div>
        </div>
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviewTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
                {/* Card Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-emerald-600/30 rounded-lg">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{type.title}</h2>
                  </div>
                  <p className="text-gray-300">{type.description}</p>
                </div>

                {/* Actions */}
                <div className="p-6 grid grid-cols-1 gap-3">
                  {type.actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={() => handleActionClick(action.path)}
                      className="w-full py-2 px-4 rounded-lg font-medium bg-white/10 text-white hover:bg-white/20 transition-all duration-300 flex items-center"
                    >
                      {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}