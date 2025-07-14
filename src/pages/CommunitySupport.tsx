import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkPaymentStatus } from '../services/paymentService';
import { 
  Users, 
  ChevronLeft, 
  Clock, 
  MessageSquare, 
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Eye,
  MessageCircle,
  Calendar,
  Filter,
  Search,
  X,
  BookOpen,
  Clock as ClockIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';

interface Learner {
  id: string;
  name: string;
  score: number;
}

interface HelpRequest {
  id: number;
  subtopic_title: string;
  request_type: 'community' | 'class';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  request_date: string;
  peer_name?: string;
  peer_id?: string;
  response_date?: string;
  response_excerpt?: string;
}

type ActiveTab = 'my-requests' | 'peer-requests' | 'my-responses';
type StatusFilter = 'all' | 'pending' | 'in_progress' | 'resolved' | 'rejected';
type TypeFilter = 'all' | 'community' | 'class';

export default function CommunitySupport() {
  const navigate = useNavigate();
  const { profile } = useUser();
  const [activeTab, setActiveTab] = useState<ActiveTab>('my-requests');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  const [myRequests, setMyRequests] = useState<HelpRequest[]>([]);
  const [peerRequests, setPeerRequests] = useState<HelpRequest[]>([]);
  const [myResponses, setMyResponses] = useState<HelpRequest[]>([]);
  
  const [loadingMyRequests, setLoadingMyRequests] = useState(true);
  const [loadingPeerRequests, setLoadingPeerRequests] = useState(true);
  const [loadingMyResponses, setLoadingMyResponses] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const isPaid = await checkPaymentStatus();
        if (!isPaid) {
          toast.error("This feature requires an active subscription");
          navigate('/payment');
          return;
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    checkAccess();

    if (profile) {
      console.log('👤 User profile loaded:', profile);
      fetchMyRequests();
      fetchPeerRequests();
      fetchMyResponses();
    }
  }, [navigate, profile]);

  // Rest of the component code remains the same...

   const fetchMyRequests = async () => {
    try {
      setLoadingMyRequests(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      console.log('🔑 Current user ID:', user.id);

      // Fetch help requests made by the current user
      const { data, error } = await supabase
        .from('help_requests')
        .select(`
          id,
          request_type,
          status,
          created_at,
          subtopics(subtopic_title)
        `)
        .eq('learner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('📄 My raw help requests:', data);
      // Transform the data
      const formattedRequests = data.map(request => ({
        id: request.id,
        subtopic_title: request.subtopics?.subtopic_title || 'Unknown subtopic',
        request_type: request.request_type,
        status: request.status,
        request_date: new Date(request.created_at).toLocaleDateString()
      }));

      console.log('✅ Formatted My Requests:', formattedRequests);
      setMyRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching my help requests:', error);
      toast.error('Failed to load your help requests');
    } finally {
      setLoadingMyRequests(false);
    }
  };

  const fetchPeerRequests = async () => {
    try {
      setLoadingPeerRequests(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      console.log('🔍 Fetching peers for user:', user.id);
      
      // Get user's grade and subjects
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('education_level, subjects_enrolled')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      console.log('🎓 User grade & subjects:', userProfile);
      
      if (!userProfile.education_level || !userProfile.subjects_enrolled || userProfile.subjects_enrolled.length === 0){
        console.warn('⚠️ Missing grade or subjects — skipping peer request fetch');
        setLoadingPeerRequests(false);
        return;
      }

      let query = supabase
        .from('help_requests')
        .select(`
          id,
          request_type,
          status,
          created_at,
          learner_id,
          subtopics(subtopic_title),
          users:learner_id(first_name, last_name)
        `)
        .neq('learner_id', user.id)
        .eq('status', 'pending');

      // 👇 Only apply grade filter if it's valid
      if (userProfile.education_level) {
        query = query.eq('grade_id', userProfile.education_level);
      }

      // 👇 Only apply subject filter if it's valid and non-empty
      if (userProfile.subjects_enrolled && userProfile.subjects_enrolled.length > 0) {
        query = query.in('subject_id', userProfile.subjects_enrolled);
      }

      // 👇 Finally apply ordering and limit
      query = query
        .order('created_at', { ascending: false })
        .limit(10);

      // 🔄 Execute the query
      const { data, error } = await query;

      if (error) throw error;

      console.log('📄 Raw peer requests:', data);
      // Transform the data
      const formattedRequests = data.map(request => ({
        id: request.id,
        subtopic_title: request.subtopics?.subtopic_title || 'Unknown subtopic',
        request_type: request.request_type,
        status: request.status,
        request_date: new Date(request.created_at).toLocaleDateString(),
        peer_name: `${request.users.first_name} ${request.users.last_name.charAt(0)}.`,
        peer_id: request.learner_id
      }));

      console.log('✅ Formatted Peer Requests:', formattedRequests);
      setPeerRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching peer help requests:', error);
      toast.error('Failed to load peer help requests');
    } finally {
      setLoadingPeerRequests(false);
    }
  };

  const fetchMyResponses = async () => {
    try {
      setLoadingMyResponses(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // First get all comments made by the current user
      const { data: comments, error: commentsError } = await supabase
        .from('peer_comments')
        .select(`
          id,
          request_id,
          comment,
          created_at
        `)
        .eq('commenter_id', user.id)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Get unique request IDs
      const requestIds = [...new Set(comments.map(comment => comment.request_id))];
      
      if (requestIds.length === 0) {
        setMyResponses([]);
        setLoadingMyResponses(false);
        return;
      }

      // Get request details for each request
      const { data: requests, error: requestsError } = await supabase
        .from('help_requests')
        .select(`
          id,
          request_type,
          status,
          created_at,
          learner_id,
          subtopics(subtopic_title),
          users:learner_id(first_name, last_name)
        `)
        .in('id', requestIds)
        .neq('learner_id', user.id); // Only include requests from other users

      if (requestsError) throw requestsError;

      // Process learner data
      const learnersWithScores: Learner[] = [];
      
      // Transform the data
      const formattedResponses = requests?.map(request => {
        // Find the user's comment for this request
        const userComment = comments?.find(c => c.request_id === request.id);
        
        return {
          id: request.id,
          subtopic_title: request.subtopics?.subtopic_title || 'Unknown subtopic',
          request_type: request.request_type,
          status: request.status,
          request_date: new Date(request.created_at).toLocaleDateString(),
          peer_name: `${request.users.first_name} ${request.users.last_name.charAt(0)}.`,
          peer_id: request.learner_id,
          response_date: userComment ? new Date(userComment.created_at).toLocaleDateString() : 'Unknown',
          response_excerpt: userComment ? 
            (userComment.comment.length > 60 ? 
              userComment.comment.substring(0, 60) + '...' : 
              userComment.comment) : 
            'No comment found'
        };
      });

      setMyResponses(formattedResponses || []);
    } catch (error) {
      console.error('Error fetching my responses:', error);
      toast.error('Failed to load your responses');
    } finally {
      setLoadingMyResponses(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
            <MessageSquare className="h-3 w-3" />
            <span>In Progress</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            <span>Resolved</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
            <XCircle className="h-3 w-3" />
            <span>Rejected</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getRequestTypeBadge = (type: string) => {
    switch(type) {
      case 'community':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
            <Users className="h-3 w-3" />
            <span>Community</span>
          </span>
        );
      case 'class':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
            <User className="h-3 w-3" />
            <span>Class</span>
          </span>
        );
      default:
        return null;
    }
  };

  const handleViewDiscussion = (requestId: number, subtopicTitle: string) => {
    navigate(`/discussion/${requestId}`, { state: { subtopicTitle } });
  };

  // Filter the requests based on the selected filters
  const filterRequests = (requests: HelpRequest[]) => {
    return requests.filter(request => {
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesType = typeFilter === 'all' || request.request_type === typeFilter;
      const matchesDate = !dateFilter || request.request_date === dateFilter;
      
      return matchesStatus && matchesType && matchesDate;
    });
  };

  const filteredMyRequests = filterRequests(myRequests);
  const filteredPeerRequests = filterRequests(peerRequests);
  const filteredMyResponses = filterRequests(myResponses);

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
              <h1 className="text-2xl font-bold text-white">Community Support</h1>
            </div>
            
            <Link 
              to="/learner/dashboard"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Toggle Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`px-8 py-3 rounded-full font-medium transition-colors ${
              activeTab === 'my-requests'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            My Requests
          </button>
          <button
            onClick={() => setActiveTab('peer-requests')}
            className={`px-8 py-3 rounded-full font-medium transition-colors ${
              activeTab === 'peer-requests'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Peer Requests
          </button>
          <button
            onClick={() => setActiveTab('my-responses')}
            className={`px-8 py-3 rounded-full font-medium transition-colors ${
              activeTab === 'my-responses'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            My Responses
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-white mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              >
                <option value="all" className="bg-gray-900">All Statuses</option>
                <option value="pending" className="bg-gray-900">Pending</option>
                <option value="in_progress" className="bg-gray-900">In Progress</option>
                <option value="resolved" className="bg-gray-900">Resolved</option>
                <option value="rejected" className="bg-gray-900">Rejected</option>
              </select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-white mb-2">
                Filter by Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              >
                <option value="all" className="bg-gray-900">All Types</option>
                <option value="community" className="bg-gray-900">Community</option>
                <option value="class" className="bg-gray-900">Class</option>
              </select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-white mb-2">
                Filter by Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-white/40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          {/* My Requests Section */}
          {activeTab === 'my-requests' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-emerald-400" />
                  My Requests
                </h2>
              </div>
              
              {loadingMyRequests ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="rounded-full bg-white/10 h-12 w-12 mb-4"></div>
                    <div className="h-4 bg-white/10 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-24"></div>
                  </div>
                </div>
              ) : filteredMyRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMyRequests.map(request => (
                    <div 
                      key={request.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-medium text-white">{request.subtopic_title}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 text-gray-300 text-sm">
                          {getRequestTypeBadge(request.request_type)}
                          <span>{request.request_date}</span>
                        </div>
                        <button
                          onClick={() => handleViewDiscussion(request.id, request.subtopic_title)}
                          className="px-3 py-1 bg-emerald-600/80 text-white rounded-lg text-sm hover:bg-emerald-500 transition-colors flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View Discussion</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-lg">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No help requests yet</h3>
                  <p className="text-gray-400">
                    You haven't asked for help yet. When you're stuck on a topic, use the "Ask for Help" button.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Peer Requests Section */}
          {activeTab === 'peer-requests' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-emerald-400" />
                  Peer Requests
                </h2>
              </div>
              
              {loadingPeerRequests ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="rounded-full bg-white/10 h-12 w-12 mb-4"></div>
                    <div className="h-4 bg-white/10 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-24"></div>
                  </div>
                </div>
              ) : filteredPeerRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPeerRequests.map(request => (
                    <div 
                      key={request.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-medium text-white">{request.subtopic_title}</h3>
                        <div className="flex items-center space-x-2 text-gray-300 text-sm">
                          <User className="h-4 w-4" />
                          <span>{request.peer_name || 'A peer'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 text-gray-300 text-sm">
                          {getRequestTypeBadge(request.request_type)}
                          <span>{request.request_date}</span>
                        </div>
                        <button
                          onClick={() => handleViewDiscussion(request.id, request.subtopic_title)}
                          className="px-3 py-1 bg-emerald-600/80 text-white rounded-lg text-sm hover:bg-emerald-500 transition-colors flex items-center space-x-1"
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>View & Respond</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-lg">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No peer requests</h3>
                  <p className="text-gray-400">
                    There are no help requests from your peers at the moment. Check back later!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* My Responses Section */}
          {activeTab === 'my-responses' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-emerald-400" />
                  My Responses
                </h2>
              </div>
              
              {loadingMyResponses ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="rounded-full bg-white/10 h-12 w-12 mb-4"></div>
                    <div className="h-4 bg-white/10 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-24"></div>
                  </div>
                </div>
              ) : filteredMyResponses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMyResponses.map(response => (
                    <div 
                      key={response.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-medium text-white">{response.subtopic_title}</h3>
                        {getStatusBadge(response.status)}
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center space-x-2 text-gray-300 text-sm mb-1">
                          <User className="h-4 w-4" />
                          <span>Request by {response.peer_name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-300 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>You responded on {response.response_date}</span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="text-gray-300 text-sm italic">"{response.response_excerpt}"</p>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleViewDiscussion(response.id, response.subtopic_title)}
                          className="px-3 py-1 bg-emerald-600/80 text-white rounded-lg text-sm hover:bg-emerald-500 transition-colors flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Open Discussion</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-lg">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No responses yet</h3>
                  <p className="text-gray-400">
                    You haven't responded to any help requests yet. Help your peers by responding to their questions!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Information Box */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white mb-2">About Community Support</h3>
              <p className="text-gray-300">
                The Community Support feature connects learners who need help with those who can provide assistance. 
                When you're stuck on a topic, you can ask for help from either the entire community or just your class. 
                Similarly, you can help your peers by responding to their requests. This collaborative approach enhances 
                learning and builds a supportive community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}