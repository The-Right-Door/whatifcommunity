import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Globe, 
  School,
  Tag,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export default function AskForHelp() {
  const navigate = useNavigate();
  const location = useLocation();
  // ⬇️ Destructure passed state values here
  const {
    subtopicTitle = 'this subtopic',
    subtopicId,
    subjectId,
    gradeId,
    classroomId
  }: {
    subtopicTitle?: string;
    subtopicId: number;
    subjectId: number;
    gradeId: number;
    classroomId?: number;
  } = location.state || {};
//  const { subtopicId } = useParams();
//  const [subtopicTitle, setSubtopicTitle] = useState<string>('');
  const [audience, setAudience] = useState<'community' | 'class'>('community');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
  if (!subtopicTitle) {
    console.warn('⚠️ subtopicTitle not provided. Defaulting to "this subtopic".');
  }
}, [subtopicTitle]);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Please describe what you need help with');
      return;
    }

    setSubmitting(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const payload = {
  learner_id: user.id,
  subtopic_id: subtopicId ? parseInt(subtopicId) : null,
  subject_id: subjectId,
  grade_id: gradeId,
  classroom_id: audience === 'class' ? classroomId : null,
  request_type: audience,
  status: 'pending'
};

console.log('📤 Help request payload:', payload);
      
      // Create help request
      const {data: helpRequestData, error: requestError } = await supabase
        .from('help_requests')
        .insert([{
          learner_id: user.id,
          subtopic_id: subtopicId ? parseInt(subtopicId) : null,
          subject_id: subjectId,
          grade_id: gradeId,
          classroom_id: audience === 'class' ? classroomId : null,
          request_type: audience,     
          status: 'pending'
        }])
          .select('id') // 🔥 important to get back the inserted ID
          .single();

      if (requestError) throw requestError;

      const helpRequestId = helpRequestData.id;
      

      // STEP 2: Insert the description as the first peer comment
    const { error: commentError } = await supabase
      .from('peer_comments')
      .insert([{
        request_id: helpRequestId,
        commenter_id: user.id,
        comment: description
      }]);

    if (commentError) throw commentError;

    toast.success('Your help request was submitted successfully!');
    navigate(-1);
    
    } catch (error) {
      console.error('Error submitting help request:', error);
      toast.error('Failed to submit help request');
    } finally {
      setSubmitting(false);
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
              <h1 className="text-2xl font-bold text-white">Ask for Help</h1>
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
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-2">🆘 Ask for Help</h2>
            <p className="text-gray-300">
              You're asking for support with <span className="text-white font-medium">"{subtopicTitle}"</span>
            </p>
          </div>

          {/* Audience Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-white mb-4">Who would you like to ask?</h3>
            <div className="space-y-4">
              <label className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  value="community"
                  checked={audience === 'community'}
                  onChange={() => setAudience('community')}
                  className="mt-1 h-4 w-4 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-emerald-400" />
                    <span className="text-white font-medium">Ask the Whole Community</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Your question will be visible to all learners and mentors studying the same subject and grade
                  </p>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  value="class"
                  checked={audience === 'class'}
                  onChange={() => setAudience('class')}
                  className="mt-1 h-4 w-4 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <School className="h-5 w-5 text-emerald-400" />
                    <span className="text-white font-medium">Ask My Class/Group Only</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Your question will only be visible to members of your class or group
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-white mb-4">
              Describe what you're struggling with
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you're struggling with..."
              className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              rows={6}
            />
          </div>

          {/* Tags */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-white mb-4">
              Add Tags (optional)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <div key={tag} className="flex items-center bg-emerald-600/30 text-white px-3 py-1 rounded-full">
                  <span className="mr-2">{tag}</span>
                  <button 
                    onClick={() => handleRemoveTag(tag)}
                    className="text-white/70 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add tags (e.g., exam, concept, assignment)"
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>
              <button
                onClick={handleAddTag}
                className="ml-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}