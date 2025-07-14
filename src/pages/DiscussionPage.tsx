import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Send, 
  User,
  Clock,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { format, formatDistanceToNow } from 'date-fns';

interface Comment {
  id: number;
  commenter_name: string;
  commenter_id: string;
  comment: string;
  created_at: string;
  is_current_user: boolean;
}

export default function DiscussionPage() {
  const { requestId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { subtopicTitle = 'Help Request' } = location.state || {};
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestDetails, setRequestDetails] = useState<{
    learner_name: string;
    status: string;
    request_type: string;
    created_at: string;
  } | null>(null);

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
      fetchComments();
    }
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('help_requests')
        .select(`
          status,
          request_type,
          created_at,
          users:learner_id(first_name, last_name)
        `)
        .eq('id', requestId)
        .single();

      if (error) throw error;

      setRequestDetails({
        learner_name: `${data.users.first_name} ${data.users.last_name}`,
        status: data.status,
        request_type: data.request_type,
        created_at: data.created_at
      });
    } catch (error) {
      console.error('Error fetching request details:', error);
      toast.error('Failed to load request details');
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('peer_comments')
        .select(`
          id,
          comment,
          created_at,
          commenter_id,
          users:commenter_id(first_name, last_name)
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Format the comments
      const formattedComments = data.map(comment => ({
        id: comment.id,
        commenter_name: `${comment.users.first_name} ${comment.users.last_name}`,
        commenter_id: comment.commenter_id,
        comment: comment.comment,
        created_at: comment.created_at,
        is_current_user: comment.commenter_id === user.id
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load discussion');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Insert the new comment
      const { error } = await supabase
        .from('peer_comments')
        .insert([{
          request_id: requestId,
          commenter_id: user.id,
          comment: newComment.trim()
        }]);

      if (error) throw error;

      // Update the help request status to in_progress if it's pending
      const { error: updateError } = await supabase
        .from('help_requests')
        .update({ status: 'in_progress' })
        .eq('id', requestId)
        .eq('status', 'pending');

      if (updateError) console.error('Error updating request status:', updateError);

      // Clear the input and refresh comments
      setNewComment('');
      fetchComments();
      toast.success('Comment posted successfully');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const timeAgo = formatDistanceToNow(date, { addSuffix: true });
      const formattedDate = format(date, 'PPP p'); // e.g., "April 29, 2023 at 3:45 PM"
      
      return (
        <div className="text-sm text-gray-400">
          <span title={formattedDate}>{timeAgo}</span>
        </div>
      );
    } catch (error) {
      return <span className="text-sm text-gray-400">Unknown time</span>;
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
              <h1 className="text-2xl font-bold text-white">Discussion: {subtopicTitle}</h1>
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
        {/* Request Details */}
        {requestDetails && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Help Request</h2>
                <p className="text-gray-300">
                  Requested by <span className="text-white font-medium">{requestDetails.learner_name}</span>
                </p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2 text-gray-300 text-sm mb-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(requestDetails.created_at), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {requestDetails.request_type === 'community' ? (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                      Community
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                      Class
                    </span>
                  )}
                  {requestDetails.status === 'pending' && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                      Pending
                    </span>
                  )}
                  {requestDetails.status === 'in_progress' && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                      In Progress
                    </span>
                  )}
                  {requestDetails.status === 'resolved' && (
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Discussion</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-white/10 h-12 w-12 mb-4"></div>
                <div className="h-4 bg-white/10 rounded w-32 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-24"></div>
              </div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-6 max-h-96 overflow-y-auto mb-6 pr-2">
              {comments.map(comment => (
                <div 
                  key={comment.id}
                  className={`${
                    comment.is_current_user 
                      ? 'bg-emerald-600/20 border-emerald-600/30' 
                      : 'bg-white/5 border-white/10'
                  } border rounded-lg p-4`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <User className={`h-5 w-5 ${comment.is_current_user ? 'text-emerald-400' : 'text-gray-400'}`} />
                      <span className={`font-medium ${comment.is_current_user ? 'text-emerald-400' : 'text-white'}`}>
                        {comment.commenter_name}
                        {comment.is_current_user && ' (You)'}
                      </span>
                    </div>
                    {formatTimestamp(comment.created_at)}
                  </div>
                  <p className="text-gray-200 whitespace-pre-wrap">{comment.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-lg mb-6">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No comments yet</h3>
              <p className="text-gray-400">
                Be the first to respond to this help request!
              </p>
            </div>
          )}

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your response..."
              className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40 mb-4"
              rows={4}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  submitting || !newComment.trim()
                    ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600/80 text-white hover:bg-emerald-500'
                }`}
              >
                <Send className="h-5 w-5" />
                <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Information Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white mb-2">About Discussions</h3>
              <p className="text-gray-300">
                This is a peer-to-peer discussion thread where learners can help each other understand concepts. 
                Be respectful, clear, and supportive in your responses. If a response resolves the issue, 
                the original poster can mark the discussion as resolved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}