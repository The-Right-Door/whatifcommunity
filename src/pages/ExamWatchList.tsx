import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  AlertCircle, 
  Calendar,
  BookOpen,
  Download,
  Eye,
  Plus,
  Edit,
  Trash,
  Loader
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';
import { 
  getExamWatchList, 
  addExamWatchItem, 
  updateExamWatchItem, 
  deleteExamWatchItem, 
  ExamWatchItem 
} from '../services/subjectInsightService';

export default function ExamWatchList() {
  const { subject, grade } = useParams();
  const navigate = useNavigate();
  const { isTeacher } = useUser();
  const [examTopics, setExamTopics] = useState<ExamWatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ExamWatchItem | null>(null);
  const [newItem, setNewItem] = useState({
    title: '',
    importance: '',
    last_seen: '',
    expected_difficulty: '',
    resources_count: 0
  });

  useEffect(() => {
    fetchExamWatchList();
  }, [subject, grade]);

  const fetchExamWatchList = async () => {
    if (!subject || !grade) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Extract subject ID and grade ID from URL parameters
      const subjectId = getSubjectIdFromName(subject);
      const gradeId = getGradeIdFromName(grade);
      
      if (!subjectId || !gradeId) {
        throw new Error('Invalid subject or grade');
      }
      
      const watchListData = await getExamWatchList(subjectId, gradeId);
      setExamTopics(watchListData);
    } catch (err) {
      console.error('Error fetching exam watch list:', err);
      setError('Failed to load exam watch list');
      toast.error('Failed to load exam watch list');
      
      // Set sample data as fallback
      setExamTopics([
        {
          id: 1,
          title: "Quadratic Functions and Inequalities",
          importance: "High frequency exam topic that appears in almost every final exam. Understanding the properties of quadratic functions and solving quadratic inequalities is essential for success.",
          last_seen: "2024 June Exam",
          expected_difficulty: "Medium to High",
          resources_count: 5,
          subject_id: 1,
          grade_id: 1,
          created_by: "user123"
        },
        {
          id: 2,
          title: "Euclidean Geometry: Circle Theorems",
          importance: "Consistently appears in Paper 2 and often carries significant marks. Mastery of circle theorems and their applications is crucial for achieving high scores.",
          last_seen: "2024 March Exam",
          expected_difficulty: "High",
          resources_count: 3,
          subject_id: 1,
          grade_id: 1,
          created_by: "user123"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to get IDs from names
  const getSubjectIdFromName = (subjectName: string): number => {
    // In a real app, this would be a lookup from a service
    const subjectMap: Record<string, number> = {
      'mathematics': 1,
      'physics': 2,
      'chemistry': 3,
      'biology': 4,
      'english': 5
    };
    return subjectMap[subjectName.toLowerCase()] || 1;
  };

  const getGradeIdFromName = (gradeName: string): number => {
    // In a real app, this would be a lookup from a service
    const gradeNumber = parseInt(gradeName.replace('grade-', ''));
    return isNaN(gradeNumber) ? 1 : gradeNumber;
  };

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.importance || !newItem.last_seen || !newItem.expected_difficulty) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const subjectId = getSubjectIdFromName(subject!);
      const gradeId = getGradeIdFromName(grade!);
      
      const addedItem = await addExamWatchItem({
        title: newItem.title,
        importance: newItem.importance,
        last_seen: newItem.last_seen,
        expected_difficulty: newItem.expected_difficulty,
        resources_count: newItem.resources_count,
        subject_id: subjectId,
        grade_id: gradeId
      });
      
      setExamTopics([addedItem, ...examTopics]);
      setNewItem({
        title: '',
        importance: '',
        last_seen: '',
        expected_difficulty: '',
        resources_count: 0
      });
      setShowAddModal(false);
      toast.success('Exam topic added successfully');
    } catch (error) {
      console.error('Error adding exam topic:', error);
      toast.error('Failed to add exam topic');
    }
  };

  const handleEditItem = async () => {
    if (!editingItem || !editingItem.title || !editingItem.importance || !editingItem.last_seen || !editingItem.expected_difficulty) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const updatedItem = await updateExamWatchItem(editingItem.id, {
        title: editingItem.title,
        importance: editingItem.importance,
        last_seen: editingItem.last_seen,
        expected_difficulty: editingItem.expected_difficulty,
        resources_count: editingItem.resources_count
      });
      
      setExamTopics(examTopics.map(item => item.id === updatedItem.id ? updatedItem : item));
      setEditingItem(null);
      setShowEditModal(false);
      toast.success('Exam topic updated successfully');
    } catch (error) {
      console.error('Error updating exam topic:', error);
      toast.error('Failed to update exam topic');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this exam topic?')) {
      try {
        await deleteExamWatchItem(id);
        setExamTopics(examTopics.filter(item => item.id !== id));
        toast.success('Exam topic deleted successfully');
      } catch (error) {
        console.error('Error deleting exam topic:', error);
        toast.error('Failed to delete exam topic');
      }
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
              <h1 className="text-2xl font-bold text-white">Exam Watch List for {subject} - {grade}</h1>
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Exam Focus Areas</h2>
            <p className="text-xl text-gray-200">
              These topics frequently appear in exams and require special attention.
            </p>
          </div>
          
          {isTeacher && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Topic</span>
            </button>
          )}
        </div>

        {/* Information Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Exam Preparation Strategy</h3>
              <p className="text-gray-300">
                This watch list is based on analysis of past exam papers and curriculum focus areas. 
                Topics are ranked by frequency of appearance and mark allocation. Prioritize these 
                topics in your revision schedule for maximum exam readiness.
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 text-white animate-spin" />
            <span className="ml-2 text-white">Loading exam topics...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center mb-8">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchExamWatchList}
              className="mt-4 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Exam Topics List */}
        {!loading && (
          <div className="space-y-6">
            {examTopics.length > 0 ? (
              examTopics.map((topic) => (
                <div 
                  key={topic.id}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:border-white/40 transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-emerald-600/30 rounded-lg">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold text-white mb-2">{topic.title}</h3>
                        {isTeacher && (
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {
                                setEditingItem(topic);
                                setShowEditModal(true);
                              }}
                              className="text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(topic.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-300 mb-4">{topic.importance}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400">Last Seen</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-4 w-4 text-emerald-400" />
                            <span className="text-white">{topic.last_seen}</span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-400">Expected Difficulty</h4>
                          <span className="text-white">{topic.expected_difficulty}</span>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-400">Resources</h4>
                          <span className="text-white">{topic.resources_count} available</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <button className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors">
                          <Eye className="h-4 w-4" />
                          <span>View Past Papers</span>
                        </button>
                        <button className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors">
                          <Download className="h-4 w-4" />
                          <span>Download Practice Questions</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-4">No exam topics have been added yet.</p>
                {isTeacher && (
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors inline-flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add First Topic</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Exam Calendar */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Upcoming Exams</h2>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-medium text-white">Mid-Term Assessment</h3>
                  <p className="text-gray-300">Covers all topics from the first term</p>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                  <span>May 15, 2025</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-medium text-white">Practice Exam</h3>
                  <p className="text-gray-300">Full-length practice under exam conditions</p>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                  <span>June 5, 2025</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">Final Examination</h3>
                  <p className="text-gray-300">Comprehensive assessment of all material</p>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                  <span>June 20, 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Exam Topic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Add Exam Topic</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Topic Title
                </label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  placeholder="Enter topic title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Importance
                </label>
                <textarea
                  value={newItem.importance}
                  onChange={(e) => setNewItem({...newItem, importance: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  placeholder="Describe why this topic is important for exams"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Last Seen
                </label>
                <input
                  type="text"
                  value={newItem.last_seen}
                  onChange={(e) => setNewItem({...newItem, last_seen: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  placeholder="e.g., 2024 June Exam"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Expected Difficulty
                </label>
                <select
                  value={newItem.expected_difficulty}
                  onChange={(e) => setNewItem({...newItem, expected_difficulty: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                >
                  <option value="" className="bg-gray-900">Select difficulty</option>
                  <option value="Easy" className="bg-gray-900">Easy</option>
                  <option value="Medium" className="bg-gray-900">Medium</option>
                  <option value="High" className="bg-gray-900">High</option>
                  <option value="Very High" className="bg-gray-900">Very High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Number of Resources
                </label>
                <input
                  type="number"
                  min="0"
                  value={newItem.resources_count}
                  onChange={(e) => setNewItem({...newItem, resources_count: parseInt(e.target.value) || 0})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors"
              >
                Add Topic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Exam Topic Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Edit Exam Topic</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Topic Title
                </label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  placeholder="Enter topic title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Importance
                </label>
                <textarea
                  value={editingItem.importance}
                  onChange={(e) => setEditingItem({...editingItem, importance: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  placeholder="Describe why this topic is important for exams"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Last Seen
                </label>
                <input
                  type="text"
                  value={editingItem.last_seen}
                  onChange={(e) => setEditingItem({...editingItem, last_seen: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  placeholder="e.g., 2024 June Exam"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Expected Difficulty
                </label>
                <select
                  value={editingItem.expected_difficulty}
                  onChange={(e) => setEditingItem({...editingItem, expected_difficulty: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                >
                  <option value="" className="bg-gray-900">Select difficulty</option>
                  <option value="Easy" className="bg-gray-900">Easy</option>
                  <option value="Medium" className="bg-gray-900">Medium</option>
                  <option value="High" className="bg-gray-900">High</option>
                  <option value="Very High" className="bg-gray-900">Very High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Number of Resources
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingItem.resources_count}
                  onChange={(e) => setEditingItem({...editingItem, resources_count: parseInt(e.target.value) || 0})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditItem}
                className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}