import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Users, ChevronLeft, Plus, Trash2, Eye, Edit2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Topic, Subtopic } from '../services/curriculumService';

interface LocationState {
  subject?: string;
  grade?: string;
  subjectId?: number;
  gradeId?: number;
  returnPath?: string;
}

export default function MaintainTopic() {
  const location = useLocation();
  const { subject, grade, subjectId, gradeId, returnPath } = location.state as LocationState || {};
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    topic: '',
    description: '',
    start_date: '',
    end_date: '',
    topics_status: ''
  });

  useEffect(() => {
    fetchTopicDetails();
  }, [topicId]);

  const fetchTopicDetails = async () => {
    try {
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select('*')
        .eq('topics_id', topicId)
        .single();

      if (topicError) throw topicError;

      setTopic(topicData);
      setEditForm({
        topic: topicData.topic,
        description: topicData.description || '',
        start_date: topicData.start_date,
        end_date: topicData.end_date,
        topics_status: topicData.topics_status
      });

      const { data: subtopicsData, error: subtopicsError } = await supabase
        .from('subtopics')
        .select('*')
        .eq('topic_id', topicId);

      if (subtopicsError) throw subtopicsError;

      setSubtopics(subtopicsData || []);
    } catch (error) {
      console.error('Error fetching topic details:', error);
      toast.error('Failed to load topic details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({
          topic: editForm.topic,
          description: editForm.description,
          start_date: editForm.start_date,
          end_date: editForm.end_date,
          topics_status: editForm.topics_status
        })
        .eq('topics_id', topicId);

      if (error) throw error;

      toast.success('Topic updated successfully');
      setIsEditing(false);
      fetchTopicDetails();
    } catch (error) {
      console.error('Error updating topic:', error);
      toast.error('Failed to update topic');
    }
  };

  const handlePublish = async () => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({ topics_status: 'published' })
        .eq('topics_id', topicId);

      if (error) throw error;

      toast.success('Topic published successfully');
      fetchTopicDetails();
    } catch (error) {
      console.error('Error publishing topic:', error);
      toast.error('Failed to publish topic');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;

    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('topics_id', topicId);

      if (error) throw error;

      toast.success('Topic deleted successfully');
      navigate(-1);
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast.error('Failed to delete topic');
    }
  };

  const handleDeleteSubtopic = async (subtopicId: number) => {
    if (!window.confirm('Are you sure you want to delete this subtopic?')) return;

    try {
      const { error } = await supabase
        .from('subtopics')
        .delete()
        .eq('subtopic_id', subtopicId);

      if (error) throw error;

      toast.success('Subtopic deleted successfully');
      fetchTopicDetails();
    } catch (error) {
      console.error('Error deleting subtopic:', error);
      toast.error('Failed to delete subtopic');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading topic details...</div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-xl">Topic not found</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
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

      <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <Users className="h-8 w-8" />
              <span className="text-xl font-bold">What-If Community</span>
            </Link>
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-2xl font-bold text-white">Maintain Topic</h1>
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          {/* Topic Details */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">Topic Details</h2>
              <div className="absolute left-1/2 transform -translate-x-1/2 text-center text-white text-sm">
                <div className="bg-white/10 px-4 py-2 rounded-md border border-white/20 backdrop-blur-sm">
                  <p><strong>Subject:</strong> {subject}</p>
                  <p><strong>Grade:</strong> {grade}</p>
                </div>
              </div>
              <div className="flex space-x-4">
                {topic.topics_status === 'draft' && (
                  <button
                    onClick={handlePublish}
                    className="bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
                  >
                    <Check className="h-5 w-5" />
                    <span>Publish</span>
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
                >
                  <Edit2 className="h-5 w-5" />
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600/80 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Title</label>
                  <input
                    type="text"
                    value={editForm.topic}
                    onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Start Date</label>
                    <input
                      type="date"
                      value={editForm.start_date}
                      onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">End Date</label>
                    <input
                      type="date"
                      value={editForm.end_date}
                      onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Status</label>
                  <select
                    value={editForm.topics_status}
                    onChange={(e) => setEditForm({ ...editForm, topics_status: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="draft" className="bg-gray-900">Draft</option>
                    <option value="published" className="bg-gray-900">Published</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className="bg-emerald-600/80 text-white px-6 py-2 rounded-lg hover:bg-emerald-500 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Title</h3>
                  <p className="text-white">{topic.topic}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Description</h3>
                  <p className="text-white">{topic.description || 'No description provided'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Start Date</h3>
                    <p className="text-white">{new Date(topic.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">End Date</h3>
                    <p className="text-white">{new Date(topic.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Status</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    topic.topics_status === 'published' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {topic.topics_status.charAt(0).toUpperCase() + topic.topics_status.slice(1)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Subtopics Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Subtopics</h2>
              <Link
                to={`/add-subtopics`}
                state={{ topicId: topic.topics_id, subject, grade, returnPath }}
                className="bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Subtopic</span>
              </Link>
            </div>

            <div className="space-y-4">
              {subtopics.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No subtopics added yet</p>
              ) : (
                subtopics.map((subtopic) => (
                  <div 
                    key={subtopic.subtopic_id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2">{subtopic.subtopic_title}</h3>
                        <p className="text-gray-300">{subtopic.small_description || 'No description provided'}</p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigate(`/subtopics/${subtopic.subtopic_id}`)}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubtopic(subtopic.subtopic_id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}