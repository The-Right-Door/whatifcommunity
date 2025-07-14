import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Eye, 
  Copy,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Users2,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

// Sample data for generated assessments
const generatedAssessments = [
  {
    id: 1,
    title: "Mathematics: Calculus Review",
    subject: "Mathematics",
    grade: "Grade 11",
    status: "Sent",
    createdDate: "2025-03-15",
    type: "Class"
  },
  {
    id: 2,
    title: "Physics: Forces and Motion",
    subject: "Physics",
    grade: "Grade 12",
    status: "Scheduled",
    createdDate: "2025-03-16",
    type: "Group"
  },
  {
    id: 3,
    title: "English Literature: Poetry Analysis",
    subject: "English",
    grade: "Grade 10",
    status: "Draft",
    createdDate: "2025-03-17",
    type: "Individual"
  },
  {
    id: 4,
    title: "Chemistry: Organic Compounds",
    subject: "Chemistry",
    grade: "Grade 11",
    status: "Sent",
    createdDate: "2025-03-18",
    type: "Class"
  },
  {
    id: 5,
    title: "Biology: Cell Structure",
    subject: "Biology",
    grade: "Grade 10",
    status: "Draft",
    createdDate: "2025-03-19",
    type: "Individual"
  },
  {
    id: 6,
    title: "History: World War II",
    subject: "History",
    grade: "Grade 12",
    status: "Scheduled",
    createdDate: "2025-03-20",
    type: "Group"
  }
];

// Sample data for filters
const subjects = ["All Subjects", "Mathematics", "Physics", "Chemistry", "Biology", "English", "History"];
const grades = ["All Grades", "Grade 10", "Grade 11", "Grade 12"];
const statuses = ["All Statuses", "Draft", "Scheduled", "Sent"];

export default function AllGeneratedAssessments() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

  // Filter assessments based on search and dropdown selections
  const filteredAssessments = generatedAssessments.filter(assessment => {
    const matchesSearch = 
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === 'All Subjects' || assessment.subject === selectedSubject;
    const matchesGrade = selectedGrade === 'All Grades' || assessment.grade === selectedGrade;
    const matchesStatus = selectedStatus === 'All Statuses' || assessment.status === selectedStatus;
    
    return matchesSearch && matchesSubject && matchesGrade && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'Draft':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Scheduled':
        return 'bg-blue-500/20 text-blue-400';
      case 'Sent':
        return 'bg-emerald-500/20 text-emerald-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Class':
        return <BookOpen className="h-4 w-4" />;
      case 'Group':
        return <Users2 className="h-4 w-4" />;
      case 'Individual':
        return <User className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const handleView = (id: number) => {
    toast.success(`Viewing assessment ${id}`);
    // Navigate to view page
    // navigate(`/teacher/assessments/${id}`);
  };

  const handleEdit = (id: number) => {
    toast.success(`Editing assessment ${id}`);
    // Navigate to edit page
    // navigate(`/teacher/assessments/${id}/edit`);
  };

  const handleDuplicate = (id: number) => {
    toast.success(`Assessment ${id} duplicated`);
    // Logic to duplicate assessment
  };

  const handleDelete = (id: number) => {
    // Close modal
    setShowDeleteModal(null);
    
    // Delete logic would go here
    toast.success(`Assessment ${id} deleted`);
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
              <h1 className="text-2xl font-bold text-white">All Generated Assessments</h1>
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject} className="bg-gray-900">
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Grade Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Grade</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              >
                {grades.map(grade => (
                  <option key={grade} value={grade} className="bg-gray-900">
                    {grade}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              >
                {statuses.map(status => (
                  <option key={status} value={status} className="bg-gray-900">
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Assessments Table */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20 bg-white/5">
                <th className="text-left p-4 text-white">Title</th>
                <th className="text-left p-4 text-white">Subject</th>
                <th className="text-left p-4 text-white">Grade</th>
                <th className="text-left p-4 text-white">Status</th>
                <th className="text-left p-4 text-white">Created Date</th>
                <th className="text-left p-4 text-white">Type</th>
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(assessment.status)}`}>
                      {assessment.status}
                    </span>
                  </td>
                  <td className="p-4 text-white">{assessment.createdDate}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className={`p-1 rounded-full ${
                        assessment.type === 'Class' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : assessment.type === 'Group'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {getTypeIcon(assessment.type)}
                      </span>
                      <span className="text-white">{assessment.type}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleView(assessment.id)}
                        className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(assessment.id)}
                        className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDuplicate(assessment.id)}
                        className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setShowDeleteModal(assessment.id)}
                        className="p-2 bg-white/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssessments.length === 0 && (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No assessments found</h3>
            <p className="text-gray-400">
              Try adjusting your search or filters to find what you're looking for
            </p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(null)}
            />
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this assessment? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  className="px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}