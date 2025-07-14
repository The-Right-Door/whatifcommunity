import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft,
  Video,
  MessageSquare,
  Clock,
  Users2,
  BookOpen,
  FileText
} from 'lucide-react';

const subjects = [
  {
    id: 1,
    name: "Mathematics",
    grades: ["Grade 10", "Grade 11", "Grade 12"],
    upcomingClasses: {
      next: { date: "2025-03-20", time: "14:00", topic: "Quadratic Equations" },
      total: 3
    },
    resources: 12,
    activeDiscussions: 8
  },
  {
    id: 2,
    name: "Physics",
    grades: ["Grade 11", "Grade 12"],
    upcomingClasses: {
      next: { date: "2025-03-21", time: "15:30", topic: "Wave Motion" },
      total: 2
    },
    resources: 8,
    activeDiscussions: 5
  },
  {
    id: 3,
    name: "Chemistry",
    grades: ["Grade 10", "Grade 12"],
    upcomingClasses: {
      next: { date: "2025-03-22", time: "13:00", topic: "Organic Chemistry" },
      total: 1
    },
    resources: 10,
    activeDiscussions: 4
  }
];

export default function TeacherSubjects() {
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
              <h1 className="text-2xl font-bold text-white">My Subjects</h1>
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div 
              key={subject.id}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:border-white/40 transition-all duration-300"
            >
              {/* Subject Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-emerald-600/30 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{subject.name}</h2>
                  <p className="text-gray-300">{subject.grades.length} Grades</p>
                </div>
              </div>

              {/* Grades */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Teaching Grades</h3>
                <div className="flex flex-wrap gap-2">
                  {subject.grades.map((grade) => (
                    <Link
                      key={grade}
                      to={`/subjects/${subject.name.toLowerCase()}/${grade.toLowerCase().replace(' ', '-')}`}
                      state={{ from: 'teacherSubjects' }}
                      className="bg-emerald-600/80 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-emerald-500 transition-all duration-300"
                    >
                      {grade}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Next Class */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Next Class</h3>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-emerald-400" />
                      <span className="text-white">{subject.upcomingClasses.next.time}</span>
                    </div>
                    <span className="text-gray-300">{subject.upcomingClasses.next.date}</span>
                  </div>
                  <p className="text-white mb-4">{subject.upcomingClasses.next.topic}</p>
                  <button className="w-full bg-emerald-600/80 text-white px-4 py-2 rounded-full font-medium hover:bg-emerald-500 transition-all duration-300">
                    Start Class
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <Video className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                  <span className="text-sm text-gray-300">Classes</span>
                  <p className="text-lg font-semibold text-white">{subject.upcomingClasses.total}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <MessageSquare className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                  <span className="text-sm text-gray-300">Forums</span>
                  <p className="text-lg font-semibold text-white">{subject.activeDiscussions}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <FileText className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                  <span className="text-sm text-gray-300">Resources</span>
                  <p className="text-lg font-semibold text-white">{subject.resources}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button className="w-full bg-white/10 text-white px-4 py-2 rounded-full font-medium hover:bg-white/20 transition-all duration-300">
                  Upload Recording
                </button>
                <Link
                  to="/forums"
                  className="block w-full bg-white/10 text-white px-4 py-2 rounded-full font-medium hover:bg-white/20 transition-all duration-300 text-center"
                >
                  Group Forums
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}