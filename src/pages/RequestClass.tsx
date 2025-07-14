import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Calendar,
  ArrowLeft,
  ArrowRight,
  Clock as ClockIcon,
  BookOpen,
  School,
  Filter,
  User,
  Users2,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { getTimetableForClassroom, getClassroomsForTimetable } from '../services/timetableService';

interface RequestClassState {
  subtopicId?: number;
  subtopicTitle?: string;
}

interface TimeSlot {
  id: number;
  day: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  capacity?: number;
  currentBookings?: number;
  instructor?: string;
  status: 'available' | 'full' | 'unavailable';
  subject?: string;
  classroomId?: number;
}

const convertDayToNextDate = (day: string): string => {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const currentDayIndex = today.getDay();
  const targetDayIndex = weekdays.indexOf(day);

  let daysToAdd = targetDayIndex - currentDayIndex;
  if (daysToAdd <= 0) daysToAdd += 7;

  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysToAdd);
  return nextDate.toISOString().split('T')[0];
};
export default function RequestClass() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as RequestClassState;
  const subtopicId = state?.subtopicId;
  const subtopicTitle = state?.subtopicTitle;
  
  const [topicId, setTopicId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [topicName, setTopicName] = useState<string>('');
  const [subjectName, setSubjectName] = useState<string>('');
  const [classrooms, setClassrooms] = useState<any[]>([]);
  
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Day-based filtering
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  
  // Filter states
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [timeFilter, setTimeFilter] = useState<string>('all'); // 'all', 'morning', 'afternoon', 'evening'
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [instructorFilter, setInstructorFilter] = useState<string>('all');
  
  // Form states
  const [sessionType, setSessionType] = useState<string>('one-on-one');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    console.log("🔍 useEffect triggered with subtopicId:", subtopicId);
    if (subtopicId) {
      fetchClassrooms();
      fetchTopicDetails(subtopicId);
    } else {
      console.warn("⚠️ No subtopicId provided. Component may not render correctly.");
      // Still fetch available slots even without a specific subtopic
      fetchClassrooms();
      fetchAvailableSlots();
    }
  }, [subtopicId]);

  useEffect(() => {
    applyFilters();
  }, [timeSlots, dateRange,selectedDay]);

  //the code to fetch classrooms not needed..double checking
  
  const fetchClassrooms = async () => {
    try {
      console.log("📡 Fetching classrooms");
      const classroomsData = await getClassroomsForTimetable();
      console.log("✅ Classrooms fetched:", classroomsData);
      setClassrooms(classroomsData);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      toast.error('Failed to load classrooms');
    }
  };

  
  const fetchTopicDetails = async (subtopicId: number) => {
    try {
      console.log("📡 Fetching topic details for subtopicId:", subtopicId);
      const { data, error } = await supabase
        .from('subtopics')
        .select(`
          topic_id,
          topics(topic, subject_id)
        `)
        .eq('subtopic_id', subtopicId)
        .single();

      if (error) throw error;
      console.log("✅ Topic details fetched:", data);
      
      if (data && data.topics) {
        setTopicName(data.topics.topic);
        setTopicId(data.topic_id);
        setSubjectId(data.topics.subject_id);
        setSubjectName(data.topics.subjects?.subjects_name || '');
        
        // Now fetch available slots for this subject
        fetchAvailableSlots(data.topics.subject_id);
      }
    } catch (error) {
      console.error('Error fetching topic details:', error);
      // Still try to fetch available slots even if topic details fail
      fetchAvailableSlots();
    }
  };



  console.log('chiefs and chelsea');
  console.log('subject id hawaai ', subjectId);
  const fetchAvailableSlots = async (subjectId: number) => {
  const { data, error } = await supabase
    .from('classroom_timetable')
    .select(`
      start_time,
      end_time,
      day,
      assignment_id,
      classroom_teacher_subject (
        subject_id,
        teacher_id,
        classroom_id,
        classrooms ( classroom_name ),
        subjects ( subjects_name )
      )
    `)
    .eq('classroom_teacher_subject.subject_id', subjectId);  // Get all slots for the subject

  if (error) {
    console.error('❌ Error fetching slots:', error);
    return;
  }

    console.log('data from classroom_time Hmnisi ', data);



const allSlots: TimeSlot[] = data.map((slot: any, index: number) => ({
    id: index + 1,
    day: slot.day,
    date: convertDayToNextDate(slot.day),
    startTime: slot.start_time || '10:45:00',  // fallback for grouping
    endTime: slot.end_time || '12:15:00',
    room: slot.classroom_teacher_subject?.classrooms?.classroom_name || 'Unknown Room',
  subject: slot.classroom_teacher_subject?.subjects?.subjects_name || 'Unknown Subject',
  //  room: `Room ${slot.classroom_teacher_subject?.classroom_id || 'N/A'}`,
    status: 'available',
//    subject: subjectName || 'JAVAS',
    classroomId: slot.classroom_teacher_subject?.classroom_id || null
  }));

  setTimeSlots(allSlots);         // ✅ Correct state
 // setFilteredSlots([]);           // Reset filters
  console.log("✅ Slots loaded:", allSlots);
    
  setLoading(false); // ✅ Place this at the end, once data is processed
};

  
  const applyFilters = () => {
    let filtered = [...timeSlots];

    
    // Apply day filter first
    
  if (selectedDay) {
    console.log("🔍 Selected day for filtering:", selectedDay);
    filtered = filtered.filter(slot => {
      console.log(`🧪 Comparing slot.day (${slot.day}) with selectedDay (${selectedDay})`);
      return slot.day === selectedDay;
    });
  } else {
    console.warn("⚠️ No day selected — skipping filter");
    setFilteredSlots([]);
   return;
  }

  // You can also log the filtered result
  console.log("✅ Filtered slots after day filter:", filtered);

 
    // Apply date range filter
    filtered = filtered.filter(slot => 
      slot.date >= dateRange.start && slot.date <= dateRange.end
    );

    
    setFilteredSlots(filtered);
    console.log("🧪 Final filteredSlots for UI rendering:", filtered);
filtered.forEach((slot, idx) => {
  console.log(`🔹 Slot ${idx + 1}:`, {
    id: slot.id,
    day: slot.day,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    room: slot.room,
    subject: slot.subject,
    classroomId: slot.classroomId,
    status: slot.status
  });
});
    
  };

  const toggleSlotSelection = (slotId: number) => {
    // Find the slot
    const slot = timeSlots.find(s => s.id === slotId);
    
    // Only allow selection of available slots
    if (!slot || slot.status !== 'available') {
      return;
    }
    
    setSelectedSlots(prev => 
      prev.includes(slotId)
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  const formatDateRange = (startDate: Date): string => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}, ${startDate.getFullYear()}`;
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const handleDayClick = (day: string) => {
    // If the day is already selected, deselect it
    if (selectedDay === day) {
      setSelectedDay(null);
    } else {
      setSelectedDay(day);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSlots.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      console.log("🙋 User ID:", user?.id);
      console.log("🕒 Selected slots:", selectedSlots);

      // For each selected slot, create a class request
      for (const slotId of selectedSlots) {
        const slot = timeSlots.find(s => s.id === slotId);
        if (!slot) continue;
        
        // Insert into class_requests table
        const { error } = await supabase
          .from('class_requests')
          .insert([{
            learner_id: user.id,
            topic_id: topicId,
            subject_id: subjectId,
            subtopic_id: subtopicId || null,
            preferred_date: slot.date,
            preferred_time: slot.startTime,
            session_type: sessionType,
            note: notes || null,
            status: 'pending'
          }]);

        if (error) throw error;
      }

      toast.success('Classroom booking submitted successfully!');
      navigate('/community-support');
    } catch (error) {
      console.error('Error submitting classroom booking:', error);
      toast.error('Failed to submit classroom booking');
    } finally {
      setSubmitting(false);
    }
  };

  // Get unique rooms and instructors for filters
  const uniqueRooms = ['all', ...new Set(timeSlots.map(slot => slot.room))];
  const uniqueInstructors = ['all', ...new Set(timeSlots.map(slot => slot.instructor))];


  console.log("🧪 filteredSlots before grouping:", filteredSlots);
filteredSlots.forEach((slot, idx) => {
  console.log(`🔹 Slot ${idx + 1} startTime: ${slot.startTime}`);
});
  // Group slots by period for timetable display
  const slotsByPeriod = filteredSlots.reduce((acc, slot) => {
    const period = slot.startTime;
    if (!acc[period]) {
      acc[period] = [];
    }
    acc[period].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  
  console.log("✅ slotsByPeriod result:", slotsByPeriod);
  // Get all unique periods (start times) for the timetable
  const periods = Object.keys(slotsByPeriod).sort();

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
              <h1 className="text-2xl font-bold text-white">Classroom Booking</h1>
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
        {/* Topic and Subtopic Information */}
        {(subtopicTitle || topicName) && (
          <div className="mb-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <BookOpen className="h-6 w-6 text-emerald-400 mt-1" />
              <div>
                {topicName && (
                  <div className="mb-2">
                    <h3 className="text-sm font-medium text-gray-400">Topic</h3>
                    <p className="text-white text-lg">{topicName}</p>
                  </div>
                )}
                {subtopicTitle && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Subtopic</h3>
                    <p className="text-white text-lg">{subtopicTitle}</p>
                  </div>
                )}
                {subjectName && (
                  <div className="mt-2">
                    <h3 className="text-sm font-medium text-gray-400">Subject</h3>
                    <p className="text-white text-lg">{subjectName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Date Navigator */}
        <div className="mb-6 flex justify-center items-center">
          <button 
            onClick={goToPreviousWeek}
            className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="mx-4 text-white font-medium">
            {formatDateRange(currentWeekStart)}
          </span>
          <button 
            onClick={goToNextWeek}
            className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day Selection Buttons */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Select Day</h2>
          <div className="flex flex-wrap gap-2">
            {weekdays.map(day => (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedDay === day
                    ? 'bg-emerald-600/80 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mb-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-emerald-500/50 rounded"></div>
              <span className="text-white">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500/50 rounded"></div>
              <span className="text-white">Almost Full</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500/50 rounded"></div>
              <span className="text-white">Full</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-500/50 rounded"></div>
              <span className="text-white">Unavailable</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500/50 rounded"></div>
              <span className="text-white">Selected</span>
            </div>
          </div>
        </div>

        {/* Timetable */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {selectedDay ? `Available Time Slots for ${selectedDay}` : 'Select a day to view available slots'}
          </h2>
          {console.log("🧪 periods array:", periods)}
          {console.log("🧪 selectedDay:", selectedDay)}
          { console.log("🧪 filteredSlots length:", filteredSlots.length)}
          {console.log("🧪 periods before rendering:", periods)}
          {console.log('🧪 slotsByPeriod keys:', Object.keys(slotsByPeriod))}
          {console.log('🚨 DEBUG BLOCK END 🚨')}
          {loading ? (
           // <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-12 flex justify-center">
              <div className="bg-white text-black border border-gray-400 rounded-lg overflow-hidden">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-white/10 h-12 w-12 mb-4"></div>
                <div className="h-4 bg-white/10 rounded w-32 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-24"></div>
              </div>
            </div>
      
           ) :selectedDay && filteredSlots.length > 0 ? (
  (() => {
    console.log('🧪 ✅ Condition passed — rendering timetable table');
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
  
          
          <table className="w-full">
  <thead>
    <tr className="border-b border-white/20">
      <th className="text-left p-4 text-white">Time</th>
      <th className="text-left p-4 text-white">Subject</th>
      <th className="text-left p-4 text-white">Classroom</th>
      <th className="text-left p-4 text-white">Action</th>
    </tr>
  </thead>
  <tbody>
    {filteredSlots
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map(slot => (
        <tr key={slot.id} className="border-b border-white/10 hover:bg-white/5">
          <td className="p-4 text-white">
            {slot.startTime} - {slot.endTime}
          </td>
          <td className="p-4 text-white">{slot.subject}</td>
          <td className="p-4 text-white">{slot.room}</td>
          <td className="p-4">
            <button
              onClick={() => toggleSlotSelection(slot.id)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedSlots.includes(slot.id)
                  ? 'bg-blue-500/80 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {selectedSlots.includes(slot.id) ? 'Selected' : 'Book Class'}
            </button>
          </td>
        </tr>
      ))}
  </tbody>
</table>
          
        </div>
      </div>
        );
  })()
          ) : selectedDay ? (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No available time slots for {selectedDay}</h3>
              <p className="text-gray-400">
                Try selecting a different day or adjusting your filters
              </p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Select a day to view available slots</h3>
              <p className="text-gray-400">
                Click on one of the day buttons above to see available time slots
              </p>
            </div>
          )}
        </div>

        {/* Selected Slots Summary */}
        {selectedSlots.length > 0 && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Selected Time Slots ({selectedSlots.length})</h3>
            
            <div className="space-y-3 mb-4">
              {selectedSlots.map(slotId => {
                const slot = timeSlots.find(s => s.id === slotId);
                if (!slot) return null;
                
                return (
                  <div key={slotId} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                    <div>
                      <p className="text-white">
                        {slot.day}, {new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' • '}
                        {slot.startTime} - {slot.endTime}
                      </p>
                      <p className="text-sm text-gray-400">
                        {slot.room} {slot.instructor ? `• ${slot.instructor}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSlotSelection(slotId)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Complete Your Booking</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Type of Session
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="sessionType"
                    value="one-on-one"
                    checked={sessionType === 'one-on-one'}
                    onChange={() => setSessionType('one-on-one')}
                    className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                  />
                  <div>
                    <span className="text-white font-medium">One-on-One Session</span>
                    <p className="text-sm text-gray-400 mt-1">
                      Private session with a teacher focused solely on your needs
                    </p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="sessionType"
                    value="group"
                    checked={sessionType === 'group'}
                    onChange={() => setSessionType('group')}
                    className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                  />
                  <div>
                    <span className="text-white font-medium">Group Session</span>
                    <p className="text-sm text-gray-400 mt-1">
                      Small group session with other learners having similar questions
                    </p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="sessionType"
                    value="class"
                    checked={sessionType === 'class'}
                    onChange={() => setSessionType('class')}
                    className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                  />
                  <div>
                    <span className="text-white font-medium">Open to Whole Class</span>
                    <p className="text-sm text-gray-400 mt-1">
                      Session open to all classmates, ideal for topics many students find challenging
                    </p>
                  </div>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-white/40"
                placeholder="Any specific topics or questions you'd like covered? Any particular areas you're struggling with?"
                rows={4}
              />
            </div>
            
            {/* Booking Summary */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Booking Summary</h3>
                  <p className="text-gray-300 text-sm mt-1">
                    You are booking {selectedSlots.length} time slot{selectedSlots.length !== 1 ? 's' : ''}.
                    {selectedSlots.length === 0 && ' Please select at least one available time slot.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || selectedSlots.length === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  submitting || selectedSlots.length === 0
                    ? 'bg-white/20 text-gray-300 cursor-not-allowed'
                    : 'bg-emerald-600/80 text-white hover:bg-emerald-500'
                }`}
              >
                {submitting ? 'Submitting...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}