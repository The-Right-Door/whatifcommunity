import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft,
  Search,
  Filter,
  Bell,
  Send,
  BookOpen,
  GraduationCap,
  AlertTriangle,
  X,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// Sample data for assessment reminders
const assessmentReminders = [
  {
    id: 1,
    title: "Mathematics: Calculus Review",
    subject: "Mathematics",
    grade: "Grade 12",
    notStarted: 8,
    inProgress: 16,
    lastReminderSent: "2025-03-18"
  },
  {
    id: 2,
    title: "Physics: Forces and Motion",
    subject: "Physics",
    grade: "Grade 11",
    notStarted: 12,
    inProgress: 10,
    lastReminderSent: "2025-03-19"
  },
  {
    id: 3,
    title: "English Literature: Poetry Analysis",
    subject: "English",
    grade: "Grade 10",
    notStarted: 15,
    inProgress: 5,
    lastReminderSent: null
  },
  {
    id: 4,
    title: "Chemistry: Organic Compounds",
    subject: "Chemistry",
    grade: "Grade 11",
    notStarted: 6,
    inProgress: 14,
    lastReminderSent: "2025-03-20"
  },
  {
    id: 5,
    title: "Biology: Cell Structure",
    subject: "Biology",
    grade: "Grade 10",
    notStarted: 18,
    inProgress: 2,
    lastReminderSent: null
  }
];

// Sample data for filters
const subjects = ["All Subjects", "Mathematics", "Physics", "Chemistry", "Biology", "English", "History"];
const grades = ["All Grades", "Grade 10", "Grade 11", "Grade 12"];

export default function AssessmentReminders() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [showReminderModal, setShowReminderModal] = useState<number | null>(null);
  const [reminderMessage, setReminderMessage] = useState('');

  // Filter assessments based on search and dropdown selections
  const filteredAssessments = assessmentReminders.filter(assessment => {
    const matchesSearch = 
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === 'All Subjects' || assessment.subject === selectedSubject;
    const matchesGrade = selectedGrade === 'All Grades' || assessment.grade === selectedGrade;
    
    return matchesSearch && matchesSubject && matchesGrade;
  });

  const handleSendReminder = (id: number) => {
    if (!reminderMessage.trim()) {
      toast.error('Please enter a reminder message');
      return;
    }
    
    // Here you would typically make an API call to send the reminder
    toast.success('Reminder sent successfully');
    setShowReminderModal(null);
    setReminderMessage('');
    
    // Update the last reminder sent date in the UI
    // This would normally be handled by the API response
    const today = new Date().toISOString().split('T')[0];
    const updatedAssessments = assessmentReminders.map(assessment => 
      assessment.id === id ? { ...assessment, lastReminderSent: today } : assessment
    );
    // In a real app, you would update state here
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
              <h1 className="text-2xl font-bold text-white">Assessment Reminders</h1>
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
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by title or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>
            
            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Subject</label>
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
            
            {/* Grade Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Grade</label>
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
          </div>
        </div>

        {/* Assessments Table */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20 bg-white/5">
                <th className="text-left p-4 text-white">Assessment Title</th>
                <th className="text-left p-4 text-white">Subject</th>
                <th className="text-left p-4 text-white">Grade</th>
                <th className="text-left p-4 text-white">Not Started</th>
                <th className="text-left p-4 text-white">In Progress</th>
                <th className="text-left p-4 text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssessments.map((assessment, index) => (
                <tr 
                  key={assessment.id} 
                  className={`border-b border-white/10 hover:bg-white/5 ${
                    index % 2 === 0 ? 'bg-white/[0.03]' : ''
                  }`}
                >
                  <td className="p-4 text-white font-medium">{assessment.title}</td>
                  <td className="p-4 text-white">{assessment.subject}</td>
                  <td className="p-4 text-white">{assessment.grade}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      assessment.notStarted > 10 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {assessment.notStarted} learners
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400">
                      {assessment.inProgress} learners
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col items-start">
                      <button
                        onClick={() => setShowReminderModal(assessment.id)}
                        className="bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
                      >
                        <Bell className="h-4 w-4" />
                        <span>Send Reminder</span>
                      </button>
                      
                      {assessment.lastReminderSent && (
                        <span className="text-xs text-gray-400 mt-2">
                          Last reminder: {assessment.lastReminderSent}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssessments.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No assessments found</h3>
            <p className="text-gray-400">
              Try adjusting your search or filters to find what you're looking for
            </p>
          </div>
        )}

        {/* Send Reminder Modal */}
        {showReminderModal !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowReminderModal(null)}
            />
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Send Reminder</h3>
                <button 
                  onClick={() => setShowReminderModal(null)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  Send a reminder to learners who haven't started or completed this assessment.
                </p>
                
                <label className="block text-sm font-medium text-white mb-2">
                  Reminder Message
                </label>
                <textarea
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  placeholder="Enter a personalized reminder message..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  rows={4}
                />
                
                <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-sm text-blue-400">
                    <strong>Tip:</strong> Personalized reminders are more effective than generic ones.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowReminderModal(null)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSendReminder(showReminderModal)}
                  className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Reminder</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}