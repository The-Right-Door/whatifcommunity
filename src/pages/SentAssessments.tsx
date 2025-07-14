import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft,
  Search,
  Filter,
  Eye,
  BarChart2,
  Bell,
  Calendar,
  BookOpen,
  GraduationCap
} from 'lucide-react';

// Sample data - would come from API in real app
const sentAssessments = [
  {
    id: 1,
    title: "Calculus: Derivatives and Integration",
    subject: "Mathematics",
    grade: "Grade 12",
    sentTo: "Mathematics Class 12A (24 learners)",
    dateSent: "2025-03-15",
    dueDate: "2025-03-22",
    completionPercentage: 85
  },
  {
    id: 2,
    title: "Linear Algebra Fundamentals",
    subject: "Mathematics",
    grade: "Grade 11",
    sentTo: "Mathematics Class 11B (22 learners)",
    dateSent: "2025-03-16",
    dueDate: "2025-03-23",
    completionPercentage: 72
  },
  {
    id: 3,
    title: "Quantum Physics Principles",
    subject: "Physics",
    grade: "Grade 12",
    sentTo: "Physics Group A (15 learners)",
    dateSent: "2025-03-17",
    dueDate: "2025-03-24",
    completionPercentage: 45
  },
  {
    id: 4,
    title: "Chemical Bonding Review",
    subject: "Chemistry",
    grade: "Grade 11",
    sentTo: "Chemistry Class 11A (20 learners)",
    dateSent: "2025-03-18",
    dueDate: "2025-03-25",
    completionPercentage: 30
  },
  {
    id: 5,
    title: "Shakespeare Literary Analysis",
    subject: "English",
    grade: "Grade 12",
    sentTo: "English Class 12C (18 learners)",
    dateSent: "2025-03-19",
    dueDate: "2025-03-26",
    completionPercentage: 95
  }
];

const subjects = ['All Subjects', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];
const grades = ['All Grades', 'Grade 10', 'Grade 11', 'Grade 12'];

export default function SentAssessments() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssessments = sentAssessments.filter(assessment => {
    const matchesSubject = selectedSubject === 'All Subjects' || assessment.subject === selectedSubject;
    const matchesGrade = selectedGrade === 'All Grades' || assessment.grade === selectedGrade;
    const matchesSearch = 
      searchTerm === '' || 
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.sentTo.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSubject && matchesGrade && matchesSearch;
  });

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRowHighlight = (percentage: number) => {
    return percentage < 40 ? 'bg-red-900/10' : '';
  };

  const handleViewAssessment = (id: number) => {
    console.log('Viewing assessment:', id);
    // Navigate to assessment detail page
    // navigate(`/teacher/assessments/${id}`);
  };

  const handleViewResults = (id: number) => {
    console.log('Viewing results for assessment:', id);
    // Navigate to results page
    // navigate(`/teacher/assessments/${id}/results`);
  };

  const handleSendReminder = (id: number) => {
    console.log('Sending reminder for assessment:', id);
    // Show confirmation dialog and send reminder
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
              <h1 className="text-2xl font-bold text-white">Sent Assessments</h1>
            </div>
            
            <Link 
              to="/teacher/assessments"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Assessments</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-white/40"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject} className="bg-gray-900">
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Grade</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-white/40"
                >
                  {grades.map(grade => (
                    <option key={grade} value={grade} className="bg-gray-900">
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by title or recipient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Assessments Table */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-4 text-white">Title</th>
                <th className="text-left p-4 text-white">Subject</th>
                <th className="text-left p-4 text-white">Grade</th>
                <th className="text-left p-4 text-white">Sent To</th>
                <th className="text-left p-4 text-white">Date Sent</th>
                <th className="text-left p-4 text-white">Due Date</th>
                <th className="text-left p-4 text-white">Completion</th>
                <th className="text-left p-4 text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssessments.map((assessment) => (
                <tr 
                  key={assessment.id} 
                  className={`border-b border-white/10 hover:bg-white/5 ${getRowHighlight(assessment.completionPercentage)}`}
                >
                  <td className="p-4 text-white">{assessment.title}</td>
                  <td className="p-4 text-white">{assessment.subject}</td>
                  <td className="p-4 text-white">{assessment.grade}</td>
                  <td className="p-4 text-white">{assessment.sentTo}</td>
                  <td className="p-4 text-white">{assessment.dateSent}</td>
                  <td className="p-4 text-white">{assessment.dueDate}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-white/10 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${getCompletionColor(assessment.completionPercentage)}`}
                          style={{ width: `${assessment.completionPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-white">{assessment.completionPercentage}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewAssessment(assessment.id)}
                        className="text-white hover:text-emerald-400 transition-colors"
                        title="View Assessment"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleViewResults(assessment.id)}
                        className="text-white hover:text-emerald-400 transition-colors"
                        title="View Results"
                      >
                        <BarChart2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleSendReminder(assessment.id)}
                        className="text-white hover:text-emerald-400 transition-colors"
                        title="Send Reminder"
                      >
                        <Bell className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}