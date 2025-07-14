import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  Edit,
  Filter,
  Search,
  BookOpen,
  User,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { saveTimetableSlot, getClassroomsForTeacher } from '../services/timetableService';

interface ClassRequest {
  id: number;
  learner_id: string;
  learner_name: string;
  topic_id: number;
  topic_name: string;
  subtopic_id: number | null;
  subtopic_name: string | null;
  subject_id: number | null;
  subject_name: string | null;
  preferred_date: string;
  preferred_time: string;
  session_type: string;
  note: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'rescheduled';
  created_at: string;
}

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ClassRequest | null;
  onReschedule: (requestId: number, newDate: string, newTime: string) => Promise<void>;
}

function RescheduleModal({ isOpen, onClose, request, onReschedule }: RescheduleModalProps) {
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && request) {
      setNewDate(request.preferred_date);
      setNewTime(request.preferred_time);
    }
  }, [isOpen, request]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!request || !newDate || !newTime) {
      toast.error('Please select a new date and time');
      return;
    }

    setSubmitting(true);
    try {
      await onReschedule(request.id, newDate, newTime);
      onClose();
    } catch (error) {
      console.error('Error rescheduling:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-white mb-4">Propose New Time</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              New Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-white/40"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              New Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-white/40"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                submitting
                  ? 'bg-white/20 text-gray-300 cursor-not-allowed'
                  : 'bg-emerald-600/80 text-white hover:bg-emerald-500'
              }`}
            >
              {submitting ? 'Submitting...' : 'Propose New Time'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TeacherClassRequests() {
  const navigate = useNavigate();
  const [classRequests, setClassRequests] = useState<ClassRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ClassRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ClassRequest | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);

  useEffect(() => {
    fetchClassRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [classRequests, searchTerm, statusFilter]);

  const fetchClassRequests = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Fetch class requests
      const { data, error } = await supabase
        .from('class_requests')
        .select(`
          *,
          learners:learner_id(first_name, last_name),
          topics:topic_id(topic),
          subtopics:subtopic_id(subtopic_title),
          subjects:subject_id(subjects_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // If no real data, use sample data
      if (!data || data.length === 0) {
        const sampleRequests: ClassRequest[] = [
          {
            id: 1,
            learner_id: '1',
            learner_name: 'Lerato Mokoena',
            topic_id: 1,
            topic_name: 'Inheritance',
            subtopic_id: 1,
            subtopic_name: 'Object References',
            subject_id: 1,
            subject_name: 'Java',
            preferred_date: '2025-07-05',
            preferred_time: '14:00',
            session_type: 'group',
            note: 'Can we go over object references again?',
            status: 'pending',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            learner_id: '2',
            learner_name: 'Thabo Ndlovu',
            topic_id: 2,
            topic_name: 'Polymorphism',
            subtopic_id: 2,
            subtopic_name: 'Method Overriding',
            subject_id: 1,
            subject_name: 'Java',
            preferred_date: '2025-07-06',
            preferred_time: '10:00',
            session_type: 'one-on-one',
            note: 'I need help understanding method overriding vs overloading',
            status: 'pending',
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            learner_id: '3',
            learner_name: 'Nomsa Khumalo',
            topic_id: 3,
            topic_name: 'Interfaces',
            subtopic_id: 3,
            subtopic_name: 'Default Methods',
            subject_id: 1,
            subject_name: 'Java',
            preferred_date: '2025-07-07',
            preferred_time: '15:30',
            session_type: 'class',
            note: 'The whole class is struggling with interfaces',
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ];
        
        setClassRequests(sampleRequests);
        setFilteredRequests(sampleRequests);
      } else {
        // Format the data
        const formattedRequests = data.map(request => ({
          id: request.id,
          learner_id: request.learner_id,
          learner_name: `${request.learners.first_name} ${request.learners.last_name}`,
          topic_id: request.topic_id,
          topic_name: request.topics?.topic || 'Unknown Topic',
          subtopic_id: request.subtopic_id,
          subtopic_name: request.subtopics?.subtopic_title || null,
          subject_id: request.subject_id,
          subject_name: request.subjects?.subjects_name || null,
          preferred_date: request.preferred_date,
          preferred_time: request.preferred_time,
          session_type: request.session_type,
          note: request.note,
          status: request.status,
          created_at: request.created_at
        }));
        
        setClassRequests(formattedRequests);
        setFilteredRequests(formattedRequests);
      }
    } catch (error) {
      console.error('Error fetching class requests:', error);
      toast.error('Failed to load class requests');
      
      // Use sample data as fallback
      const sampleRequests: ClassRequest[] = [
        {
          id: 1,
          learner_id: '1',
          learner_name: 'Lerato Mokoena',
          topic_id: 1,
          topic_name: 'Inheritance',
          subtopic_id: 1,
          subtopic_name: 'Object References',
          subject_id: 1,
          subject_name: 'Java',
          preferred_date: '2025-07-05',
          preferred_time: '14:00',
          session_type: 'group',
          note: 'Can we go over object references again?',
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ];
      
      setClassRequests(sampleRequests);
      setFilteredRequests(sampleRequests);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...classRequests];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        request.learner_name.toLowerCase().includes(term) ||
        request.topic_name.toLowerCase().includes(term) ||
        (request.subtopic_name && request.subtopic_name.toLowerCase().includes(term)) ||
        (request.subject_name && request.subject_name.toLowerCase().includes(term))
      );
    }
    
    setFilteredRequests(filtered);
  };

  /*
  const handleAcceptRequest = async (requestId: number) => {
    try {
      // In a real app, this would update the database
      // Update database
    const { error } = await supabase
      .from('class_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) throw error;
      const updatedRequests = classRequests.map(request => 
        request.id === requestId ? { ...request, status: 'accepted' as const } : request
      );
      
      setClassRequests(updatedRequests);
      
      // Show success message
      toast.success('Class request accepted! Event added to timetable.');
      
      // In a real app, this would also create a timetable entry
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  */

  function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes);

  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  const endHours = endDate.getHours().toString().padStart(2, '0');
  const endMinutes = endDate.getMinutes().toString().padStart(2, '0');

  return `${endHours}:${endMinutes}`;
}


const handleAcceptRequest = async (requestId: number) => {
  try {
    // ✅ Get the request
    const request = classRequests.find(r => r.id === requestId);
    if (!request) throw new Error('Request not found');

    // ✅ Get current teacher
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError;

    // ✅ Update request status
    const { error: updateError } = await supabase
      .from('class_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);
    if (updateError) throw updateError;

    // ✅ Get classrooms for teacher
    const classroomIds = await getClassroomsForTeacher(user.id);
    if (!classroomIds || classroomIds.length === 0) throw new Error('No classroom found for teacher');

    const classroomId = classroomIds[0]; // or match better if needed

    // ✅ Add to timetable
    await saveTimetableSlot(classroomId, {
      day: new Date(request.preferred_date).toLocaleDateString('en-US', { weekday: 'long' }),
      period: 1, // Or choose dynamically
      startTime: request.preferred_time,
      endTime: '', // If not known, you could compute using config
      subjectId: request.subject_id!,
      teacherId: user.id,
      subject: request.subject_name || '',
      teacher: '', // Optional; display only
    });

    // ✅ Update UI
    const updatedRequests = classRequests.map(request =>
      request.id === requestId ? { ...request, status: 'accepted' as const } : request
    );
    setClassRequests(updatedRequests);
    toast.success('Class request accepted and added to timetable');
  } catch (error) {
    console.error('❌ Error accepting request:', error);
    toast.error('Failed to accept request');
  }
};
  
  const handleDeclineRequest = async (requestId: number) => {
    try {
      // In a real app, this would update the database
      const updatedRequests = classRequests.map(request => 
        request.id === requestId ? { ...request, status: 'declined' as const } : request
      );
      
      setClassRequests(updatedRequests);
      
      // Show success message
      toast.success('Class request declined.');
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Failed to decline request');
    }
  };

  const handleRescheduleRequest = async (requestId: number, newDate: string, newTime: string) => {
    try {
      // In a real app, this would update the database
      const updatedRequests = classRequests.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              status: 'rescheduled' as const,
              preferred_date: newDate,
              preferred_time: newTime
            } 
          : request
      );
      
      setClassRequests(updatedRequests);
      
      // Show success message
      toast.success('New time proposed to learner.');
    } catch (error) {
      console.error('Error rescheduling request:', error);
      toast.error('Failed to propose new time');
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'one-on-one':
        return <User className="h-4 w-4" />;
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'class':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
            Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
            Accepted
          </span>
        );
      case 'declined':
        return (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
            Declined
          </span>
        );
      case 'rescheduled':
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
            Rescheduled
          </span>
        );
      default:
        return null;
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
              <h1 className="text-2xl font-bold text-white">Class Requests</h1>
            </div>
            
            <Link 
              to="/teacher/dashboard"
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
        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === 'all' 
                    ? 'bg-emerald-600/80 text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                All Requests
              </button>
              <button 
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === 'pending' 
                    ? 'bg-emerald-600/80 text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Pending
              </button>
              <button 
                onClick={() => setStatusFilter('accepted')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === 'accepted' 
                    ? 'bg-emerald-600/80 text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Accepted
              </button>
              <button 
                onClick={() => setStatusFilter('declined')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === 'declined' 
                    ? 'bg-emerald-600/80 text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Declined
              </button>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-white/10 h-12 w-12 mb-4"></div>
              <div className="h-4 bg-white/10 rounded w-32 mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-24"></div>
            </div>
          </div>
        )}

        {/* Class Requests */}
        {!loading && filteredRequests.length > 0 ? (
          <div className="space-y-6">
            {filteredRequests.map(request => (
              <div 
                key={request.id}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:border-white/30 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-5 w-5 text-emerald-400" />
                      <h3 className="text-xl font-semibold text-white">From: {request.learner_name}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Subject</p>
                        <p className="text-white">{request.subject_name || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Topic</p>
                        <p className="text-white">{request.topic_name}</p>
                      </div>
                      {request.subtopic_name && (
                        <div>
                          <p className="text-gray-400 text-sm">Subtopic</p>
                          <p className="text-white">{request.subtopic_name}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-400 text-sm">Session Type</p>
                        <div className="flex items-center space-x-2">
                          {getSessionTypeIcon(request.session_type)}
                          <p className="text-white capitalize">{request.session_type}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                        <p className="text-white">{new Date(request.preferred_date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-emerald-400" />
                        <p className="text-white">{request.preferred_time}</p>
                      </div>
                      <div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                    
                    {request.note && (
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm">Note</p>
                        <div className="bg-white/5 rounded-lg p-3 mt-1">
                          <div className="flex items-start space-x-2">
                            <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
                            <p className="text-white">{request.note}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className="flex flex-col space-y-2 min-w-[120px]">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="w-full px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRescheduleModal(true);
                        }}
                        className="w-full px-4 py-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Propose Time</span>
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.id)}
                        className="w-full px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center justify-center space-x-2"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="bg-white/5 rounded-lg p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No class requests found</h3>
            <p className="text-gray-400">
              {searchTerm || statusFilter !== 'all'
                ? "Try adjusting your search or filters"
                : "You don't have any class requests at the moment"}
            </p>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        request={selectedRequest}
        onReschedule={handleRescheduleRequest}
      />
    </div>
  );
}