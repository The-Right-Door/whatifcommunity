import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Upload, 
  File, 
  Video, 
  Image as ImageIcon, 
  Link as LinkIcon,
  Trash2,
  Eye,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  fetchSubtopicWithResources, 
  addResource, 
  deleteResource, 
  deleteFileFromStorage, 
  uploadFile,
  Resource,
  SubtopicWithResources
} from '../services/subtopicResourceService';

export default function ManageSubtopicResources() {
  const navigate = useNavigate();
  const { subtopicId } = useParams();
  const [subtopic, setSubtopic] = useState<SubtopicWithResources | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    type: 'file' as 'file' | 'video' | 'image' | 'link',
    file: null as File | null,
    url: ''
  });

  useEffect(() => {
    loadSubtopic();
  }, [subtopicId]);

  const loadSubtopic = async () => {
    try {
      if (!subtopicId) return;
      const data = await fetchSubtopicWithResources(parseInt(subtopicId));
      setSubtopic(data);
      
      // If resources exist in the subtopic data, set them
      if (data.resources) {
        setResources(Array.isArray(data.resources) ? data.resources : []);
      }
    } catch (error) {
      console.error('Error loading subtopic:', error);
      toast.error('Failed to load subtopic details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Determine resource type based on file type
      let type: 'file' | 'video' | 'image' = 'file';
      if (file.type.startsWith('image/')) {
        type = 'image';
      } else if (file.type.startsWith('video/')) {
        type = 'video';
      }

      setUploadData({
        ...uploadData,
        type,
        title: file.name.split('.')[0], // Set default title as filename without extension
        file
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subtopicId) return;
    
    if (uploadData.type === 'link' && !uploadData.url) {
      toast.error('Please enter a valid URL');
      return;
    }
    
    if (uploadData.type !== 'link' && !uploadData.file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    if (!uploadData.title.trim()) {
      toast.error('Please enter a title for the resource');
      return;
    }
    
    setUploading(true);
    
    try {
      let resourceUrl = uploadData.url;
      
      // If it's a file upload, upload to Supabase Storage
      if (uploadData.file) {
        resourceUrl = await uploadFile(parseInt(subtopicId), uploadData.file);
      }
      
      // Add resource to subtopic
      const newResource = await addResource(parseInt(subtopicId), {
        title: uploadData.title,
        description: uploadData.description,
        type: uploadData.type,
        url: resourceUrl
      });
      
      // Update local state
      setResources([...resources, newResource]);
      
      toast.success('Resource added successfully');
      
      // Reset form
      setUploadData({
        title: '',
        description: '',
        type: 'file',
        url: '',
        file: null
      });
      
      setShowUploadForm(false);
    } catch (error) {
      console.error('Error uploading resource:', error);
      toast.error('Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!subtopicId || !window.confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      // Find the resource to delete
      const resourceToDelete = resources.find(r => r.id === resourceId);
      if (!resourceToDelete) return;
      
      // If it's a file stored in Supabase, delete it from storage
      if (resourceToDelete.type !== 'link' && resourceToDelete.url.includes('supabase')) {
        await deleteFileFromStorage(resourceToDelete.url);
      }
      
      // Delete resource from subtopic
      await deleteResource(parseInt(subtopicId), resourceId);
      
      // Update local state
      setResources(resources.filter(r => r.id !== resourceId));
      
      toast.success('Resource deleted successfully');
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const getResourceIcon = (type: string) => {
    switch(type) {
      case 'file':
        return <File className="h-6 w-6 text-blue-400" />;
      case 'video':
        return <Video className="h-6 w-6 text-red-400" />;
      case 'image':
        return <ImageIcon className="h-6 w-6 text-green-400" />;
      case 'link':
        return <LinkIcon className="h-6 w-6 text-purple-400" />;
      default:
        return <File className="h-6 w-6 text-gray-400" />;
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
              <h1 className="text-2xl font-bold text-white">Manage Subtopic Resources</h1>
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
        {/* Subtopic Info */}
        <div className="mb-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">{subtopic.subtopic_title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Topic</label>
              <div className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white">
                {subtopic.topics.topic}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Subtopic ID</label>
              <div className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white">
                {subtopic.subtopic_id}
              </div>
            </div>
          </div>
        </div>

        {/* Add Resource Button */}
        {!showUploadForm && (
          <button
            onClick={() => setShowUploadForm(true)}
            className="mb-8 bg-emerald-600/80 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-500 transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Resource</span>
          </button>
        )}

        {/* Upload Form */}
        {showUploadForm && (
          <div className="mb-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Resource Title
                </label>
                <input
                  type="text"
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  placeholder="Enter resource title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  required
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  placeholder="Enter resource description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Resource Type
                </label>
                <select
                  value={uploadData.type}
                  onChange={(e) => setUploadData({ ...uploadData, type: e.target.value as 'file' | 'video' | 'image' | 'link' })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                >
                  <option value="file" className="bg-gray-900">File</option>
                  <option value="video" className="bg-gray-900">Video</option>
                  <option value="image" className="bg-gray-900">Image</option>
                  <option value="link" className="bg-gray-900">Link</option>
                </select>
              </div>

              {uploadData.type === 'link' ? (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    required
                    value={uploadData.url}
                    onChange={(e) => setUploadData({ ...uploadData, url: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="Enter resource URL"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Upload File
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/20 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-400">
                        <label className="relative cursor-pointer rounded-md font-medium text-emerald-400 hover:text-emerald-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-400">
                        Any file type up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className={`px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors ${
                    uploading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? 'Uploading...' : 'Upload Resource'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Resources List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.length === 0 ? (
            <div className="col-span-full bg-white/5 rounded-lg p-8 text-center">
              <p className="text-gray-400">No resources added yet</p>
            </div>
          ) : (
            resources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:border-white/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/10 rounded-lg">
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(resource.url, '_blank')}
                      className="p-2 text-white hover:text-emerald-400 transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="p-2 text-white hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{resource.title}</h3>
                <p className="text-gray-300 mb-4">{resource.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Added: {new Date(resource.created_at).toLocaleDateString()}</span>
                  <span className="capitalize">{resource.type}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}