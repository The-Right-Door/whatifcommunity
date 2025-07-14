import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Users, ChevronLeft, Edit2, Trash2, AlertCircle, FileText, Video, Image, Link2, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { fetchSubtopicById, deleteSubtopic } from '../services/subtopicService';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'file' | 'video' | 'image' | 'link';
  url: string;
  created_at: string;
}

interface SubtopicWithTopic {
  subtopic_id: number;
  topic_id: number;
  subtopic_title: string;
  small_description?: string;
  full_explanation: string;
  start_date: string;
  end_date: string;
  status: string;
  resources?: Resource[];
  must_complete_assessment?: boolean;
  required_assessment_id?: string | null;
  topics: {
    topic: string;
  };
}

interface Assessment {
  assessment_id: string;
  title: string;
  subject: string;
  grade: string;
}

export default function ViewSubtopic() {
  const { subtopicId } = useParams();
  const navigate = useNavigate();
  const { role } = useUser();
  const [subtopic, setSubtopic] = useState<SubtopicWithTopic | null>(null);
  const [requiredAssessment, setRequiredAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubtopic();
  }, [subtopicId]);

  useEffect(() => {
    if (subtopic?.required_assessment_id) {
      fetchRequiredAssessment(subtopic.required_assessment_id);
    }
  }, [subtopic]);

  const loadSubtopic = async () => {
    try {
      if (!subtopicId) return;
      const data = await fetchSubtopicById(parseInt(subtopicId));
      setSubtopic(data as SubtopicWithTopic);
    } catch (error) {
      console.error('Error loading subtopic:', error);
      toast.error('Failed to load subtopic details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequiredAssessment = async (assessmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('assessment_id, title, subject, grade')
        .eq('assessment_id', assessmentId)
        .single();
        
      if (error) throw error;
      setRequiredAssessment(data);
    } catch (error) {
      console.error('Error fetching required assessment:', error);
    }
  };

  const handleDelete = async () => {
    if (!subtopicId || !window.confirm('Are you sure you want to delete this subtopic?')) return;

    try {
      await deleteSubtopic(parseInt(subtopicId));
      toast.success('Subtopic deleted successfully');
      navigate(-1);
    } catch (error) {
      console.error('Error deleting subtopic:', error);
      toast.error('Failed to delete subtopic');
    }
  };

  const getResourceIcon = (type: string) => {
    switch(type) {
      case 'file':
        return <FileText className="h-6 w-6 text-red-400" />;
      case 'video':
        return <Video className="h-6 w-6 text-blue-400" />;
      case 'image':
        return <Image className="h-6 w-6 text-green-400" />;
      case 'link':
        return <Link2 className="h-6 w-6 text-purple-400" />;
      default:
        return <FileText className="h-6 w-6 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading subtopic details...</div>
      </div>
    );
  }

  if (!subtopic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-xl">Subtopic not found</div>
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
              <h1 className="text-2xl font-bold text-white">View Subtopic</h1>
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
          {/* Header with Actions */}
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-2xl font-bold text-white">{subtopic.subtopic_title}</h2>
            {role === 'teacher' && (
              <div className="flex space-x-4">
                <Link
                  to={`/subtopics/${subtopic.subtopic_id}/resources`}
                  className="bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
                >
                  <FileText className="h-5 w-5" />
                  <span>Manage Resources</span>
                </Link>
                <Link
                  to={`/subtopics/${subtopic.subtopic_id}/edit`}
                  className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
                >
                  <Edit2 className="h-5 w-5" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={handleDelete}
                  className="bg-red-600/80 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          {/* Topic Name */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Topic</h3>
            <p className="text-white text-lg">{subtopic.topics.topic}</p>
          </div>

          {/* Small Description */}
          {subtopic.small_description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Brief Description</h3>
              <p className="text-white">{subtopic.small_description}</p>
            </div>
          )}

          {/* Full Explanation */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Full Explanation</h3>
            <div className="reading-panel">
             <p className="reading-text">{subtopic.full_explanation}</p>
           </div>
          </div>

          {/* Mandatory Assessment Info */}
          {subtopic.must_complete_assessment && (
            <div className="mb-6 bg-emerald-600/20 border border-emerald-600/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">Mandatory Assessment</h3>
                  <p className="text-gray-300">
                    Learners must complete the assessment "{requiredAssessment?.title || 'Selected assessment'}" before proceeding to the next subtopic.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dates and Status */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Start Date</h3>
              <p className="text-white">{new Date(subtopic.start_date).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">End Date</h3>
              <p className="text-white">{new Date(subtopic.end_date).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Status</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                subtopic.status === 'published' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {subtopic.status.charAt(0).toUpperCase() + subtopic.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Resources Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Resources</h3>
              {role === 'teacher' && (
                <Link
                  to={`/subtopics/${subtopic.subtopic_id}/resources`}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm"
                >
                  Manage Resources
                </Link>
              )}
            </div>
            
            {subtopic.resources && subtopic.resources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subtopic.resources.map((resource: Resource) => (
                  <div
                    key={resource.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-white/10 rounded-lg">
                        {getResourceIcon(resource.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-white mb-1">{resource.title}</h4>
                        {resource.description && (
                          <p className="text-gray-300 text-sm mb-2">{resource.description}</p>
                        )}
                        <p className="text-gray-400 text-xs">
                          Added {new Date(resource.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Resource</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-gray-400" />
                <p className="text-gray-400">No resources available for this subtopic</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}