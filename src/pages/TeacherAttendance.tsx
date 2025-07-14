import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft,
  Search,
  Calendar,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

// Sample data - would come from API in real app
const attendanceData = [
  {
    id: 1,
    learnerName: "Sarah Johnson",
    grade: "Grade 11",
    status: "present",
    timeIn: "08:00",
    timeOut: "14:30",
    date: "2025-03-20"
  },
  {
    id: 2,
    learnerName: "Michael Chen",
    grade: "Grade 12",
    status: "absent",
    timeIn: null,
    timeOut: null,
    date: "2025-03-20"
  },
  {
    id: 3,
    learnerName: "Emily Brown",
    grade: "Grade 11",
    status: "late",
    timeIn: "08:45",
    timeOut: "14:30",
    date: "2025-03-20"
  },
  {
    id: 4,
    learnerName: "David Wilson",
    grade: "Grade 10",
    status: "present",
    timeIn: "07:55",
    timeOut: "14:30",
    date: "2025-03-20"
  },
  {
    id: 5,
    learnerName: "Lisa Anderson",
    grade: "Grade 12",
    status: "present",
    timeIn: "07:50",
    timeOut: "14:30",
    date: "2025-03-20"
  }
];

const grades = ['All Grades', 'Grade 10', 'Grade 11', 'Grade 12'];
type AttendanceStatus = 'all' | 'present' | 'absent' | 'late';

export default function TeacherAttendance() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('2025-03-20');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAttendance = attendanceData.filter(record => {
    const matchesGrade = selectedGrade === 'All Grades' || record.grade === selectedGrade;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    const matchesSearch = 
      searchTerm === '' || 
      record.learnerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesGrade && matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'present':
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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
              <h1 className="text-2xl font-bold text-white">Attendance</h1>
            </div>
            
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              />
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search learners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Actions</label>
              <div className="flex space-x-2">
                <button className="flex-1 bg-emerald-600/80 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-500 transition-all duration-300 flex items-center justify-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Export</span>
                </button>
                <button className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filter</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
              selectedStatus === 'all'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedStatus('present')}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
              selectedStatus === 'present'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Present
          </button>
          <button
            onClick={() => setSelectedStatus('absent')}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
              selectedStatus === 'absent'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Absent
          </button>
          <button
            onClick={() => setSelectedStatus('late')}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
              selectedStatus === 'late'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Late
          </button>
        </div>

        {/* Attendance Table */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-4 text-white">Learner Name</th>
                <th className="text-left p-4 text-white">Grade</th>
                <th className="text-left p-4 text-white">Status</th>
                <th className="text-left p-4 text-white">Time In</th>
                <th className="text-left p-4 text-white">Time Out</th>
                <th className="text-left p-4 text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((record) => (
                <tr key={record.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4 text-white">{record.learnerName}</td>
                  <td className="p-4 text-white">{record.grade}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.status)}
                      <span className="text-white">{getStatusText(record.status)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-white">{record.timeIn || '-'}</td>
                  <td className="p-4 text-white">{record.timeOut || '-'}</td>
                  <td className="p-4">
                    <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                      Edit
                    </button>
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