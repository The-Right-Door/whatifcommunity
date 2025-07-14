import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  CheckCircle, 
  XCircle,
  Calendar,
  Clock,
  FileText,
  Eye,
  Download
} from 'lucide-react';

export default function AssessmentsGenerated() {
  const { subject, grade } = useParams();
  const navigate = useNavigate();

  // Sample assessments data - in a real app, this would come from an API
  const assessments = [
    {
      id: 1,
      title: "Quadratic Equations Mid-Term",
      type: "Summative Assessment",
      status: "Completed",
      score: 85,
      date: "2025-03-15",
      questions: 20,
      duration: "60 minutes"
    },
    {
      id: 2,
      title: "Functions and Relations Quiz",
      type: "Formative Assessment",
      status: "Not Attempted",
      score: null,
      date: "2025-03-25",
      questions: 15,
      duration: "45 minutes"
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

      {/* Navigation */}
      <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <Users className="h-8 w-8" />
              <span className="text-xl font-bold">What-If Community</span>
            </Link>
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-2xl font-bold text-white">Assessments for {subject} - {grade}</h1>
            </div>
            
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Subject</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Your Assessments</h2>
          <p className="text-xl text-gray-200">
            Track your progress and performance in {subject}.
          </p>
        </div>

        {/* Assessments List */}
        <div className="space-y-6">
          {assessments.map((assessment) => (
            <div 
              key={assessment.id}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:border-white/40 transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-emerald-600/30 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{assessment.title}</h3>
                      <p className="text-gray-300">{assessment.type}</p>
                    </div>
                    <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                      assessment.status === 'Completed' 
                        ? 'bg-emerald-400/10 text-emerald-400' 
                        : 'bg-yellow-400/10 text-yellow-400'
                    }`}>
                      {assessment.status === 'Completed' 
                        ? <CheckCircle className="h-4 w-4 mr-1" /> 
                        : <XCircle className="h-4 w-4 mr-1" />}
                      {assessment.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">Date</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                        <span className="text-white">{assessment.date}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">Questions</h4>
                      <span className="text-white">{assessment.questions} questions</span>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">Duration</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-4 w-4 text-emerald-400" />
                        <span className="text-white">{assessment.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  {assessment.status === 'Completed' && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-400">Score</h4>
                      <div className="mt-1 bg-white/5 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white">Your score</span>
                          <span className="text-emerald-400 font-semibold">{assessment.score}%</span>
                        </div>
                        <div className="mt-2 w-full bg-white/10 rounded-full h-2.5">
                          <div 
                            className="bg-emerald-500 h-2.5 rounded-full" 
                            style={{ width: `${assessment.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-4">
                    <button className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors">
                      <Eye className="h-4 w-4" />
                      <span>{assessment.status === 'Completed' ? 'Review Assessment' : 'Start Assessment'}</span>
                    </button>
                    {assessment.status === 'Completed' && (
                      <button className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors">
                        <Download className="h-4 w-4" />
                        <span>Download Results</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Assessment Statistics */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Your Performance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Average Score</h3>
              <p className="text-3xl font-bold text-emerald-400">85%</p>
              <p className="text-gray-300 mt-2">Across all assessments</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Completion Rate</h3>
              <p className="text-3xl font-bold text-emerald-400">50%</p>
              <p className="text-gray-300 mt-2">1 of 2 assessments completed</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Strongest Topic</h3>
              <p className="text-xl font-semibold text-white">Quadratic Equations</p>
              <p className="text-gray-300 mt-2">90% accuracy on related questions</p>
            </div>
          </div>
        </div>

        {/* Upcoming Assessments */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Upcoming Assessments</h2>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-medium text-white">Geometry Quiz</h3>
                  <p className="text-gray-300">Circle theorems and applications</p>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                  <span>April 5, 2025</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">End of Term Test</h3>
                  <p className="text-gray-300">Comprehensive assessment</p>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                  <span>April 20, 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}