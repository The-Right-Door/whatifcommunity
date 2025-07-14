import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  Eye,
  MessageSquare,
  BookOpen,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useUser } from '../contexts/UserContext';
import { 
  getTeacherDiscussionForums, 
  deleteDiscussionForum,
  DiscussionForum
} from '../services/discussionForumService';

export default function ManageDiscussionForums() {
  const navigate = useNavigate();
  const { hasSpecialPermissions } = useUser();
  
  const [forums, setForums] = useState<DiscussionForum[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedForums, setExpandedForums] = useState<number[]>([]);
  
  useEffect(() => {
    if (!hasSpecialPermissions) {
      navigate('/teacher/dashboard');
      return;
    }
    
    fetchForums();
  }, [hasSpecialPermissions, navigate]);
  
  const fetchForums = async () => {
    try {
      setLoading(true);
      const forumsData = await getTeacherDiscussionForums();
      setForums(forumsData);
    } catch (error) {
      console.error('Error fetching forums:', error);
      toast.error('Failed to load discussion forums');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteForum = async (forumId: number) => {
    if (!window.confirm('Are you sure you want to delete this forum?')) return;
    
    try {
      await deleteDiscussionForum(forumId);
      toast.success('Forum deleted successfully');
      fetchForums();
    } catch (error) {
      console.error('Error deleting forum:', error);
      toast.error('Failed to delete forum');
    }
  };
  
  const toggleForumExpansion = (forumId: number) => {
    setExpandedForums(prev => 
      prev.includes(forumId)
        ? prev.filter(id => id !== forumId)
        : [...prev, forumId]
    );
  };
  
  const filteredForums = forums.filter(forum => 
    forum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forum.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
              <h1 className="text-2xl font-bold text-white">Discussion Forums</h1>
            </div>
            
            <Link 
              to="/special/class-owners"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Curriculum</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search forums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
            />
          </div>
          
          <Link
            to="/create-discussion-forum"
            className="bg-emerald-600/80 text-white px-6 py-3 rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Forum</span>
          </Link>
        </div>
        
        {/* Forums Table */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-white">Forum Name</th>
                <th className="text-left p-4 text-white">Description</th>
                <th className="text-left p-4 text-white">Learners Asking</th>
                <th className="text-left p-4 text-white">Learners Helping</th>
                <th className="text-left p-4 text-white">Created At</th>
                <th className="text-left p-4 text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-400">
                    Loading forums...
                  </td>
                </tr>
              ) : filteredForums.length > 0 ? (
                filteredForums.map(forum => (
                  <React.Fragment key={forum.id}>
                    <tr className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-4 text-white font-medium">{forum.name}</td>
                      <td className="p-4 text-white">{forum.description}</td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleForumExpansion(forum.id)}
                          className="flex items-center space-x-2 text-white hover:text-emerald-400 transition-colors"
                        >
                          <span>{forum.learnersAsking.length} learners</span>
                          {expandedForums.includes(forum.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleForumExpansion(forum.id)}
                          className="flex items-center space-x-2 text-white hover:text-emerald-400 transition-colors"
                        >
                          <span>{forum.learnersHelping.length} learners</span>
                          {expandedForums.includes(forum.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-white">{new Date(forum.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/forums/${forum.id}`)}
                            className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                            title="View Forum"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/forums/${forum.id}/edit`)}
                            className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                            title="Edit Forum"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteForum(forum.id)}
                            className="p-2 bg-white/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Delete Forum"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedForums.includes(forum.id) && (
                      <tr className="bg-white/5">
                        <td colSpan={6} className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-emerald-400 font-medium mb-2">Learners Asking for Help</h4>
                              <div className="bg-white/5 rounded-lg p-3 max-h-40 overflow-y-auto">
                                {forum.learnersAsking.length > 0 ? (
                                  <ul className="space-y-1">
                                    {forum.learnersAsking.map((learner, index) => (
                                      <li key={index} className="text-white">{learner}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-400">No learners asking for help</p>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-emerald-400 font-medium mb-2">Learners Helping</h4>
                              <div className="bg-white/5 rounded-lg p-3 max-h-40 overflow-y-auto">
                                {forum.learnersHelping.length > 0 ? (
                                  <ul className="space-y-1">
                                    {forum.learnersHelping.map((learner, index) => (
                                      <li key={index} className="text-white">{learner}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-400">No learners helping</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-400">
                    {searchTerm ? 'No forums match your search' : 'No discussion forums found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Empty State */}
        {!loading && forums.length === 0 && (
          <div className="text-center mt-8">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No discussion forums yet</h3>
            <p className="text-gray-300 mb-6">Create your first discussion forum to help learners collaborate</p>
            <Link
              to="/create-discussion-forum"
              className="inline-flex items-center space-x-2 bg-emerald-600/80 text-white px-6 py-3 rounded-lg hover:bg-emerald-500 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Forum</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}