import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft,
  FileText,
  Video,
  FolderPlus,
  Search,
  Upload,
  Filter,
  Book,
  PenTool,
  Presentation,
  Download,
  Share2,
  MoreVertical,
  FolderOpen
} from 'lucide-react';

// Sample data - would come from API in real app
const resources = [
  {
    id: 1,
    type: 'document',
    name: 'Grade 12 Mathematics Syllabus',
    subject: 'Mathematics',
    grade: 'Grade 12',
    lastModified: '2025-03-20',
    size: '2.4 MB',
    shared: true
  },
  {
    id: 2,
    type: 'video',
    name: 'Introduction to Quantum Physics',
    subject: 'Physics',
    grade: 'Grade 11',
    lastModified: '2025-03-19',
    duration: '45:00',
    shared: false
  },
  {
    id: 3,
    type: 'presentation',
    name: 'Chemical Bonding Slides',
    subject: 'Chemistry',
    grade: 'Grade 10',
    lastModified: '2025-03-18',
    size: '5.8 MB',
    shared: true
  }
];

const folders = [
  {
    id: 1,
    name: 'Lesson Plans',
    icon: Book,
    count: 15,
    lastModified: '2025-03-20'
  },
  {
    id: 2,
    name: 'Assignments',
    icon: PenTool,
    count: 24,
    lastModified: '2025-03-19'
  },
  {
    id: 3,
    name: 'Presentations',
    icon: Presentation,
    count: 18,
    lastModified: '2025-03-18'
  }
];

const subjects = ['All Subjects', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];
const grades = ['All Grades', 'Grade 10', 'Grade 11', 'Grade 12'];
const resourceTypes = ['All Types', 'Documents', 'Videos', 'Presentations', 'Assignments'];

export default function TeacherResources() {
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [selectedType, setSelectedType] = useState('All Types');
  const [searchTerm, setSearchTerm] = useState('');

  const getResourceIcon = (type: string) => {
    switch(type) {
      case 'document':
        return <FileText className="h-6 w-6 text-blue-400" />;
      case 'video':
        return <Video className="h-6 w-6 text-red-400" />;
      case 'presentation':
        return <Presentation className="h-6 w-6 text-yellow-400" />;
      default:
        return <FileText className="h-6 w-6 text-gray-400" />;
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
              <h1 className="text-2xl font-bold text-white">Resources & Materials</h1>
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
        {/* Action Buttons */}
        <div className="flex items-center space-x-4 mb-8">
          <button className="bg-emerald-600/80 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-500 transition-all duration-300 flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Resources</span>
          </button>
          <button className="bg-emerald-600/80 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-500 transition-all duration-300 flex items-center space-x-2">
            <FolderPlus className="h-5 w-5" />
            <span>New Folder</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Grade</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              >
                {resourceTypes.map(type => (
                  <option key={type} value={type} className="bg-gray-900">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Actions</label>
              <div className="flex space-x-2">
                <button className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filter</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Folders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {folders.map((folder) => {
            const Icon = folder.icon;
            return (
              <div 
                key={folder.id}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:border-white/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-emerald-600/30 rounded-lg">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{folder.name}</h3>
                      <p className="text-gray-300">{folder.count} items</p>
                    </div>
                  </div>
                  <button className="text-gray-300 hover:text-white transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-400">Last modified: {folder.lastModified}</p>
              </div>
            );
          })}
        </div>

        {/* Resources List */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-4 text-white">Name</th>
                <th className="text-left p-4 text-white">Subject</th>
                <th className="text-left p-4 text-white">Grade</th>
                <th className="text-left p-4 text-white">Last Modified</th>
                <th className="text-left p-4 text-white">Size/Duration</th>
                <th className="text-left p-4 text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      {getResourceIcon(resource.type)}
                      <span className="text-white">{resource.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-white">{resource.subject}</td>
                  <td className="p-4 text-white">{resource.grade}</td>
                  <td className="p-4 text-white">{resource.lastModified}</td>
                  <td className="p-4 text-white">{resource.size || resource.duration}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                        <Download className="h-5 w-5" />
                      </button>
                      <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                        <Share2 className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <MoreVertical className="h-5 w-5" />
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