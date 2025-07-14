import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Calendar, 
  BookOpen,
  CheckCircle,
  Target,
  Clock,
  Download,
  FileText
} from 'lucide-react';

export default function LessonPlan() {
  const { subject, grade } = useParams();
  const navigate = useNavigate();

  // Sample lesson plans data - in a real app, this would come from an API
  const lessonPlans = [
    {
      id: 1,
      week: "Week 1",
      topic: "Introduction to Quadratic Functions",
      objective: "Students will be able to identify, graph, and analyze quadratic functions, understanding their key features including vertex, axis of symmetry, and intercepts.",
      activities: [
        "Interactive exploration of quadratic graphs",
        "Collaborative problem-solving with real-world applications",
        "Individual practice with identifying key features"
      ],
      resources: [
        "Quadratic Functions Workbook",
        "Interactive Graphing Tool",
        "Video: Real-world Applications of Quadratics"
      ],
      assessment: "Formative assessment through exit tickets and homework problems focusing on graphing and identifying key features.",
      status: "completed"
    },
    {
      id: 2,
      week: "Week 2",
      topic: "Solving Quadratic Equations",
      objective: "Students will master multiple methods for solving quadratic equations, including factoring, completing the square, and the quadratic formula, and determine which method is most appropriate for different scenarios.",
      activities: [
        "Method comparison activity",
        "Guided practice with increasingly complex equations",
        "Problem-solving stations with real-world applications"
      ],
      resources: [
        "Solving Quadratics Handout",
        "Practice Problem Set",
        "Interactive Quiz"
      ],
      assessment: "Mid-week quiz on factoring and completing the square; end-of-week assessment on all solving methods.",
      status: "upcoming"
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
              <h1 className="text-2xl font-bold text-white">Lesson Plan for {subject} - {grade}</h1>
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
          <h2 className="text-3xl font-bold text-white mb-4">Weekly Lesson Plans</h2>
          <p className="text-xl text-gray-200">
            Structured learning path for {subject} in {grade}.
          </p>
        </div>

        {/* Lesson Plans */}
        <div className="space-y-8">
          {lessonPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`bg-white/10 backdrop-blur-sm border ${
                plan.status === 'completed' ? 'border-emerald-500/30' : 'border-white/20'
              } rounded-lg p-6 hover:border-white/40 transition-all duration-300`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 ${
                  plan.status === 'completed' ? 'bg-emerald-600/30' : 'bg-white/10'
                } rounded-lg`}>
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{plan.topic}</h3>
                      <p className="text-gray-300">{plan.week}</p>
                    </div>
                    {plan.status === 'completed' && (
                      <span className="flex items-center space-x-1 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-4 mt-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-5 w-5 text-emerald-400" />
                        <h4 className="text-lg font-medium text-white">Learning Objective</h4>
                      </div>
                      <p className="text-gray-300 ml-7">{plan.objective}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-medium text-white mb-2">Activities</h4>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                          {plan.activities.map((activity, index) => (
                            <li key={index}>{activity}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-medium text-white mb-2">Resources</h4>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                          {plan.resources.map((resource, index) => (
                            <li key={index}>{resource}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-white mb-2">Assessment</h4>
                      <p className="text-gray-300">{plan.assessment}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 mt-6">
                    <button className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors">
                      <FileText className="h-4 w-4" />
                      <span>View Detailed Plan</span>
                    </button>
                    <button className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors">
                      <Download className="h-4 w-4" />
                      <span>Download Resources</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Curriculum Timeline */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Curriculum Timeline</h2>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/20"></div>
              
              <div className="space-y-8">
                <div className="relative pl-12">
                  <div className="absolute left-0 w-8 h-8 bg-emerald-600/30 rounded-full flex items-center justify-center border-2 border-emerald-500">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Term 1: Foundations</h3>
                    <p className="text-gray-300 mt-1">Basic principles and core concepts</p>
                    <div className="flex items-center space-x-2 mt-2 text-sm text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>8 weeks</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative pl-12">
                  <div className="absolute left-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/30">
                    <span className="text-white text-sm font-medium">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Term 2: Applications</h3>
                    <p className="text-gray-300 mt-1">Applying concepts to real-world problems</p>
                    <div className="flex items-center space-x-2 mt-2 text-sm text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>10 weeks</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative pl-12">
                  <div className="absolute left-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/30">
                    <span className="text-white text-sm font-medium">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Term 3: Advanced Topics</h3>
                    <p className="text-gray-300 mt-1">Exploring complex concepts and extensions</p>
                    <div className="flex items-center space-x-2 mt-2 text-sm text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>10 weeks</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative pl-12">
                  <div className="absolute left-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/30">
                    <span className="text-white text-sm font-medium">4</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Term 4: Revision and Exam Preparation</h3>
                    <p className="text-gray-300 mt-1">Consolidation of learning and exam techniques</p>
                    <div className="flex items-center space-x-2 mt-2 text-sm text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>8 weeks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}