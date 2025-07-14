import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  BookOpen, 
  Brain,
  ArrowRight,
  Plus,
  Edit,
  Trash,
  Loader
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';
import { 
  getCoreConcepts, 
  addCoreConcept, 
  updateCoreConcept, 
  deleteCoreConcept, 
  CoreConcept 
} from '../services/subjectInsightService';

export default function CoreConcepts() {

 //const { subject, grade } = useParams();
  const navigate = useNavigate();
  const { isTeacher } = useUser();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConcept, setEditingConcept] = useState<CoreConcept | null>(null);
  const [newConcept, setNewConcept] = useState({ title: '', description: '' });
  const [concepts, setConcepts] = useState<CoreConcept[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const subjectId = location.state?.subject_id;
  const gradeId = location.state?.grade_id;
  const subject = location.state?.subject_name;
  const grade = location.state?.grade_name;

  console.group('👀 Debug Cycle');
console.log('subject:', subject);
console.log('grade:', grade);
console.log('subjectId from state:', location.state?.subject_id);
  console.log('Full location:', location);
console.groupEnd();

  
  // ✅ After defining variables, do the early check
  if (!subjectId || !gradeId || !subject || !grade) {
    console.warn('🚫 Missing params or state. Skipping render...');
    return null;
  }

  useEffect(() => {
   
    fetchConcepts();
  }, [subjectId, gradeId]);

  const fetchConcepts = async () => {
    if (!subjectId || !gradeId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Extract subject ID and grade ID from URL parameters
      // In a real app, you would fetch these from a service
    //  const subjectId = getSubjectIdFromName(subject);
    //  const gradeId = getGradeIdFromName(grade);
      
      if (!subjectId || !gradeId) {
        throw new Error('Invalid subject or grade');
      }
      
      const conceptsData = await getCoreConcepts(subjectId, gradeId);
      setConcepts(conceptsData);
    } catch (err) {
      console.error('Error fetching concepts:', err);
      setError('Failed to load concepts');
      toast.error('Failed to load concepts');
      
      
    } finally {
      setLoading(false);
    }
  };

  /*
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

  */
  const handleAddConcept = async () => {
    if (!newConcept.title || !newConcept.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
     // const subjectId = getSubjectIdFromName(subject!);
     // const gradeId = getGradeIdFromName(grade!);
      
      const addedConcept = await addCoreConcept({
        title: newConcept.title,
        description: newConcept.description,
        subject_id: subjectId,
        grade_id: gradeId
      });
      
      setConcepts([addedConcept, ...concepts]);
      setNewConcept({ title: '', description: '' });
      setShowAddModal(false);
      toast.success('Concept added successfully');
    } catch (error) {
      console.error('Error adding concept:', error);
      toast.error('Failed to add concept');
    }
  };

  const handleEditConcept = async () => {
    if (!editingConcept || !editingConcept.title || !editingConcept.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const updatedConcept = await updateCoreConcept(editingConcept.insight_id, {
        title: editingConcept.title,
        description: editingConcept.description
      });
      
      setConcepts(concepts.map(c => c.id === updatedConcept.id ? updatedConcept : c));
      console.log('🧪 Concept keys:', Object.keys(concepts[0]));
console.log('🧪 Updated concept:', updatedConcept)
      setEditingConcept(null);
      setShowEditModal(false);
      toast.success('Concept updated successfully');
    } catch (error) {
      console.error('Error updating concept:', error);
      toast.error('Failed to update concept');
    }
  };

  const handleDeleteConcept = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this concept?')) {
      try {
        await deleteCoreConcept(id);
        setConcepts(concepts.filter(c => c.id !== id));
        toast.success('Concept deleted successfully');
      } catch (error) {
        console.error('Error deleting concept:', error);
        toast.error('Failed to delete concept');
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
              <h1 className="text-2xl font-bold text-white">Core Concepts for {subject} - {grade}</h1>
            </div>
            
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Subject Detail</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Essential Concepts</h2>
            <p className="text-xl text-gray-200">
              Master these fundamental concepts to build a strong foundation in {subject}.
            </p>
          </div>
          
          {isTeacher && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Concept</span>
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 text-white animate-spin" />
            <span className="ml-2 text-white">Loading concepts...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center mb-8">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchConcepts}
              className="mt-4 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Concepts List - New Visual Style */}
        {!loading && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
            {concepts.length > 0 ? (
              <div className="space-y-6">
                {concepts.map((concept) => (
                  <div 
                    key={concept.id}
                    className="border-b border-white/10 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="flex flex-col">
                      <div className="flex justify-between">
                        <div className="text-xl font-semibold text-white mb-2">
                          <span className="mr-2">📌</span> {concept.title}
                        </div>
                        {isTeacher && (
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {
                                setEditingConcept(concept);
                                setShowEditModal(true);
                              }}
                              className="text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteConcept(concept.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="text-gray-300 ml-7">
                        <span className="mr-2">💡</span> {concept.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-4">No core concepts have been added yet.</p>
                {isTeacher && (
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors inline-flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add First Concept</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Related Resources */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Related Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Practice Problems</h3>
              <p className="text-gray-300 mb-4">Reinforce your understanding with targeted practice exercises.</p>
              <button className="w-full bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors">
                Access Practice Sets
              </button>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Video Tutorials</h3>
              <p className="text-gray-300 mb-4">Watch step-by-step explanations of key concepts.</p>
              <button className="w-full bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors">
                View Video Library
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Concept Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Add New Concept</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Concept Title
                </label>
                <input
                  type="text"
                  value={newConcept.title}
                  onChange={(e) => setNewConcept({...newConcept, title: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  placeholder="Enter concept title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  value={newConcept.description}
                  onChange={(e) => setNewConcept({...newConcept, description: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  placeholder="Enter concept description"
                  rows={3}
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
                onClick={handleAddConcept}
                className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors"
              >
                Add Concept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Concept Modal */}
      {showEditModal && editingConcept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Edit Concept</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Concept Title
                </label>
                <input
                  type="text"
                  value={editingConcept.title}
                  onChange={(e) => setEditingConcept({...editingConcept, title: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  placeholder="Enter concept title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  value={editingConcept.description}
                  onChange={(e) => setEditingConcept({...editingConcept, description: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  placeholder="Enter concept description"
                  rows={3}
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
                onClick={handleEditConcept}
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