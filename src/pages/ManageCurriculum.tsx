import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  BookOpen, 
  GraduationCap, 
  Layers,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ArrowRight,
  X,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

// Define interfaces for our data types
interface Subject {
  id: number;
  name: string;
  description: string | null;
  status: string;
  educationLevels: number;
  streams: number;
  learners: number;
}

interface EducationLevel {
  id: number;
  name: string;
  subjects: number;
  streams: number;
  learners: number;
}

interface Stream {
  id: string;
  name: string;
  description: string | null;
  subjects: number;
  educationLevels: number[];
  learners: number;
}

type View = 'subjects' | 'education-levels' | 'streams' | 'add';
type AddType = 'subject' | 'education-level' | 'stream' | null;

export default function ManageCurriculum() {
  const navigate = useNavigate();
  const { hasSpecialPermissions } = useUser();
  
  // State for data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  
  // State for UI
  const [currentView, setCurrentView] = useState<View>('subjects');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<AddType>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<{type: string, id: number | string} | null>(null);
  
  // Form state
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDescription, setNewSubjectDescription] = useState('');
  const [newEducationLevelName, setNewEducationLevelName] = useState('');
  const [newEducationLevelNumber, setNewEducationLevelNumber] = useState('');
  const [newStreamName, setNewStreamName] = useState('');
  const [newStreamDescription, setNewStreamDescription] = useState('');
  const [newStreamEducationLevels, setNewStreamEducationLevels] = useState<number[]>([]);

  // Redirect if user doesn't have special permissions
  useEffect(() => {
    if (!hasSpecialPermissions) {
      navigate('/teacher/dashboard');
    }
  }, [hasSpecialPermissions, navigate]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*');
        
      if (subjectsError) throw subjectsError;
      
      // Fetch education levels (grades)
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .order('grade_no');
        
      if (gradesError) throw gradesError;
      
      // Fetch streams
      const { data: streamsData, error: streamsError } = await supabase
        .from('streams')
        .select('*');
        
      if (streamsError) throw streamsError;
      
      // Transform data to include counts (in a real app, these would come from joins/counts in the database)
      const transformedSubjects = subjectsData.map(subject => ({
        id: subject.subjects_id,
        name: subject.subjects_name,
        description: subject.subjects_short_description,
        status: subject.subjects_status,
        educationLevels: Math.floor(Math.random() * 5) + 1, // Mock data
        streams: Math.floor(Math.random() * 4) + 1, // Mock data
        learners: Math.floor(Math.random() * 100) + 10 // Mock data
      }));
      
      const transformedEducationLevels = gradesData.map(grade => ({
        id: grade.grades_id,
        name: grade.grade_name || `Grade ${grade.grade_no}`,
        subjects: Math.floor(Math.random() * 8) + 3, // Mock data
        streams: Math.floor(Math.random() * 4) + 1, // Mock data
        learners: Math.floor(Math.random() * 100) + 20 // Mock data
      }));
      
      const transformedStreams = streamsData.map(stream => ({
        id: stream.stream_id,
        name: stream.stream_name,
        description: stream.description,
        subjects: Math.floor(Math.random() * 6) + 2, // Mock data
        educationLevels: stream.grade_range || [10, 11, 12], // Use actual data if available
        learners: Math.floor(Math.random() * 80) + 15 // Mock data
      }));
      
      setSubjects(transformedSubjects);
      setEducationLevels(transformedEducationLevels);
      setStreams(transformedStreams);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load curriculum data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = (type: AddType) => {
    setAddType(type);
    setShowAddModal(true);
    
    // Reset form fields
    setNewSubjectName('');
    setNewSubjectDescription('');
    setNewEducationLevelName('');
    setNewEducationLevelNumber('');
    setNewStreamName('');
    setNewStreamDescription('');
    setNewStreamEducationLevels([]);
  };

  const handleAddSubmit = async () => {
    try {
      if (addType === 'subject') {
        if (!newSubjectName) {
          toast.error('Subject name is required');
          return;
        }
        
        // Add subject to database
        const { error } = await supabase
          .from('subjects')
          .insert([{
            subjects_name: newSubjectName,
            subjects_short_description: newSubjectDescription || null,
            subjects_status: 'active'
          }]);
          
        if (error) throw error;
        toast.success('Subject added successfully');
      } 
      else if (addType === 'education-level') {
        if (!newEducationLevelName || !newEducationLevelNumber) {
          toast.error('Education level name and number are required');
          return;
        }
        
        // Add education level to database
        const { error } = await supabase
          .from('grades')
          .insert([{
            grade_name: newEducationLevelName,
            grade_no: parseInt(newEducationLevelNumber)
          }]);
          
        if (error) throw error;
        toast.success('Education level added successfully');
      } 
      else if (addType === 'stream') {
        if (!newStreamName) {
          toast.error('Stream name is required');
          return;
        }
        
        // Add stream to database
        const { error } = await supabase
          .from('streams')
          .insert([{
            stream_name: newStreamName,
            description: newStreamDescription || null,
            grade_range: newStreamEducationLevels.length > 0 ? newStreamEducationLevels : [10, 11, 12]
          }]);
          
        if (error) throw error;
        toast.success('Stream added successfully');
      }
      
      // Close modal and refresh data
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    
    try {
      const { type, id } = showDeleteModal;
      
      if (type === 'subject') {
        const { error } = await supabase
          .from('subjects')
          .delete()
          .eq('subjects_id', id);
          
        if (error) throw error;
        toast.success('Subject deleted successfully');
      } 
      else if (type === 'education-level') {
        const { error } = await supabase
          .from('grades')
          .delete()
          .eq('grades_id', id);
          
        if (error) throw error;
        toast.success('Education level deleted successfully');
      } 
      else if (type === 'stream') {
        const { error } = await supabase
          .from('streams')
          .delete()
          .eq('stream_id', id);
          
        if (error) throw error;
        toast.success('Stream deleted successfully');
      }
      
      // Close modal and refresh data
      setShowDeleteModal(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item. It may be in use by other records.');
    }
  };

  // Filter data based on search term
  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const filteredEducationLevels = educationLevels.filter(level => 
    level.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredStreams = streams.filter(stream => 
    stream.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stream.description && stream.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading curriculum data...</div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-white">Manage Curriculum</h1>
            </div>
            
            <Link 
              to="/special/management"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Management</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Curriculum Management Platform</h2>
          <p className="text-xl text-gray-200">
            Manage subjects, education levels, and streams for your educational institution
          </p>
        </div>

        {/* View Selection Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setCurrentView('subjects')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              currentView === 'subjects'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>Subjects</span>
          </button>
          
          <button
            onClick={() => setCurrentView('education-levels')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              currentView === 'education-levels'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <GraduationCap className="h-5 w-5" />
            <span>Education Levels</span>
          </button>
          
          <button
            onClick={() => setCurrentView('streams')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              currentView === 'streams'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Layers className="h-5 w-5" />
            <span>Streams</span>
          </button>
          
          <button
            onClick={() => setCurrentView('add')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              currentView === 'add'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Plus className="h-5 w-5" />
            <span>Add New</span>
          </button>
          
          <Link
            to="/manage-discussion-forums"
            className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 bg-white/10 text-white hover:bg-white/20"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Discussion Forums</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={`Search ${currentView === 'subjects' ? 'subjects' : currentView === 'education-levels' ? 'education levels' : 'streams'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
            />
          </div>
        </div>

        {/* Subjects View */}
        {currentView === 'subjects' && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Subjects</h2>
              <button
                onClick={() => handleAddClick('subject')}
                className="bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Subject</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-white">Subject Name</th>
                    <th className="text-left p-4 text-white">Description</th>
                    <th className="text-left p-4 text-white">Status</th>
                    <th className="text-left p-4 text-white">Education Levels</th>
                    <th className="text-left p-4 text-white">Streams</th>
                    <th className="text-left p-4 text-white">Total Learners</th>
                    <th className="text-left p-4 text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map(subject => (
                      <tr key={subject.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="p-4 text-white font-medium">{subject.name}</td>
                        <td className="p-4 text-white">{subject.description || 'No description'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subject.status === 'active' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {subject.status.charAt(0).toUpperCase() + subject.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 text-white">{subject.educationLevels}</td>
                        <td className="p-4 text-white">{subject.streams}</td>
                        <td className="p-4 text-white">{subject.learners}</td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button
                              className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                              title="Edit Subject"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteModal({ type: 'subject', id: subject.id })}
                              className="p-2 bg-white/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Delete Subject"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-gray-400">
                        No subjects found. {searchTerm ? 'Try a different search term.' : 'Add a subject to get started.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Education Levels View */}
        {currentView === 'education-levels' && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Education Levels</h2>
              <button
                onClick={() => handleAddClick('education-level')}
                className="bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Education Level</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-white">Level Name</th>
                    <th className="text-left p-4 text-white">Subjects</th>
                    <th className="text-left p-4 text-white">Streams</th>
                    <th className="text-left p-4 text-white">Total Learners</th>
                    <th className="text-left p-4 text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEducationLevels.length > 0 ? (
                    filteredEducationLevels.map(level => (
                      <tr key={level.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="p-4 text-white font-medium">{level.name}</td>
                        <td className="p-4 text-white">{level.subjects}</td>
                        <td className="p-4 text-white">{level.streams}</td>
                        <td className="p-4 text-white">{level.learners}</td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button
                              className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                              title="Edit Education Level"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteModal({ type: 'education-level', id: level.id })}
                              className="p-2 bg-white/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Delete Education Level"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-400">
                        No education levels found. {searchTerm ? 'Try a different search term.' : 'Add an education level to get started.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Streams View */}
        {currentView === 'streams' && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Streams</h2>
              <button
                onClick={() => handleAddClick('stream')}
                className="bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Stream</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-white">Stream Name</th>
                    <th className="text-left p-4 text-white">Description</th>
                    <th className="text-left p-4 text-white">Subjects</th>
                    <th className="text-left p-4 text-white">Education Levels</th>
                    <th className="text-left p-4 text-white">Total Learners</th>
                    <th className="text-left p-4 text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStreams.length > 0 ? (
                    filteredStreams.map(stream => (
                      <tr key={stream.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="p-4 text-white font-medium">{stream.name}</td>
                        <td className="p-4 text-white">{stream.description || 'No description'}</td>
                        <td className="p-4 text-white">{stream.subjects}</td>
                        <td className="p-4 text-white">
                          {stream.educationLevels.map(level => `Grade ${level}`).join(', ')}
                        </td>
                        <td className="p-4 text-white">{stream.learners}</td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button
                              className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                              title="Edit Stream"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteModal({ type: 'stream', id: stream.id })}
                              className="p-2 bg-white/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Delete Stream"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-400">
                        No streams found. {searchTerm ? 'Try a different search term.' : 'Add a stream to get started.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add New View */}
        {currentView === 'add' && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Add New Item</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Add Subject Card */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-300">
                <h3 className="text-lg font-medium text-white mb-4">Add Subject</h3>
                <p className="text-gray-300 mb-6">
                  Add a new subject to the curriculum with details about what will be taught.
                </p>
                <button
                  onClick={() => handleAddClick('subject')}
                  className="w-full bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Subject</span>
                </button>
              </div>
              
              {/* Add Education Level Card */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-300">
                <h3 className="text-lg font-medium text-white mb-4">Add Education Level</h3>
                <p className="text-gray-300 mb-6">
                  Add a new education level or grade to organize curriculum by student progression.
                </p>
                <button
                  onClick={() => handleAddClick('education-level')}
                  className="w-full bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Education Level</span>
                </button>
              </div>
              
              {/* Add Stream Card */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-300">
                <h3 className="text-lg font-medium text-white mb-4">Add Stream</h3>
                <p className="text-gray-300 mb-6">
                  Add a new educational stream or track for specialized learning paths.
                </p>
                <button
                  onClick={() => handleAddClick('stream')}
                  className="w-full bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Stream</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md w-full">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6">
              {addType === 'subject' ? 'Add New Subject' : 
               addType === 'education-level' ? 'Add New Education Level' : 
               'Add New Stream'}
            </h3>
            
            {/* Subject Form */}
            {addType === 'subject' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Subject Name</label>
                  <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                    placeholder="Enter subject name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Description</label>
                  <textarea
                    value={newSubjectDescription}
                    onChange={(e) => setNewSubjectDescription(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                    placeholder="Enter subject description"
                    rows={3}
                  />
                </div>
              </div>
            )}
            
            {/* Education Level Form */}
            {addType === 'education-level' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Level Name</label>
                  <input
                    type="text"
                    value={newEducationLevelName}
                    onChange={(e) => setNewEducationLevelName(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                    placeholder="e.g., Grade 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Level Number</label>
                  <input
                    type="number"
                    value={newEducationLevelNumber}
                    onChange={(e) => setNewEducationLevelNumber(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                    placeholder="e.g., 10"
                    min="1"
                  />
                </div>
              </div>
            )}
            
            {/* Stream Form */}
            {addType === 'stream' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Stream Name</label>
                  <input
                    type="text"
                    value={newStreamName}
                    onChange={(e) => setNewStreamName(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                    placeholder="e.g., Science Stream"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Description</label>
                  <textarea
                    value={newStreamDescription}
                    onChange={(e) => setNewStreamDescription(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                    placeholder="Enter stream description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Education Levels</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto bg-white/5 rounded-lg p-3">
                    {educationLevels.map(level => (
                      <label key={level.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newStreamEducationLevels.includes(level.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewStreamEducationLevels([...newStreamEducationLevels, level.id]);
                            } else {
                              setNewStreamEducationLevels(newStreamEducationLevels.filter(id => id !== level.id));
                            }
                          }}
                          className="rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                        />
                        <span className="text-white">{level.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubmit}
                className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(null)}
          />
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this {showDeleteModal.type}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}