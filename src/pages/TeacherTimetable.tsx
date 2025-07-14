import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { 
  Users, 
  ChevronLeft, 
  Calendar, 
  Clock, 
  BookOpen, 
  Users2, 
  Video,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  ArrowRight,
  Play
} from 'lucide-react';
import { getCurrentWeekRange } from '../utils/weekUtils';
import { getClassroomsForTeacher, getTimetableForClassroom } from '../services/timetableService';


// Sample data - would come from API in real app
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];


export default function TeacherTimetable() {
  const navigate = useNavigate();
  const { profile } = useUser(); // ✅ This is the valid place to call hooks!
 // const [currentWeek, setCurrentWeek] = useState<string>('March 18 - March 24, 2025');
  const [timetableEvents, setTimetableEvents] = useState([]);
  const [currentWeek, setCurrentWeek] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('All Subjects');


  const fetchMyClassroomTimetables = async () => {
  try {
    //const { data: userResponse, error: userError } = await supabase.auth.getUser();
   // const { profile } = useUser();
    const teacherId = profile?.user_id;
    
    
    if (!teacherId) {
       console.warn('⚠️ No teacher ID found in profile');
       return;
   }
    

   // const teacherId = userResponse.user.id;
    const classroomIds = await getClassroomsForTeacher(teacherId);

    let allEvents = [];

    for (const classroomId of classroomIds) {
      const slots = await getTimetableForClassroom(classroomId);

      const transformed = slots.map(slot => ({
        id: slot.id,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        subject: slot.subject || 'Unknown',
        class: `Classroom ${classroomId}`,
        lesson: '', // optionally replace with real lesson info
        type: 'class',
        location: 'TBD'
      }));

      allEvents = [...allEvents, ...transformed];
    }

    setTimetableEvents(allEvents);
  } catch (err) {
    console.error('❌ Error loading teacher timetable:', err);
  }
};

  /*
  useEffect(() => {
    const weekRange = getCurrentWeekRange();
    setCurrentWeek(weekRange);
  }, []);

  */
  useEffect(() => {
  const weekRange = getCurrentWeekRange();
  setCurrentWeek(weekRange);
  fetchMyClassroomTimetables(); // 👈 Fetch timetable
}, []);

  const filteredEvents = timetableEvents.filter(event => {
    const matchesSearch = 
      searchTerm === '' || 
      event.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.lesson.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = filterSubject === 'All Subjects' || event.subject === filterSubject;
    const matchesDay = event.day === selectedDay;
    
    return matchesDay && matchesSearch && matchesSubject;
  });

  const subjects = ['All Subjects', ...Array.from(new Set(timetableEvents.map(event => event.subject)))];

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
              <h1 className="text-2xl font-bold text-white">My Timetable</h1>
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
        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Week Navigation */}
            <div className="flex items-center space-x-4">
              <button className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="text-white font-medium">{currentWeek}</div>
              <button className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {/* Add Event Button */}
            <button className="bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Add Event</span>
            </button>
          </div>

          {/* Day Selection */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {weekdays.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
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

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
            </div>
            <div>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject} className="bg-gray-900">
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timetable View */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-4 text-white">Time</th>
                <th className="text-left p-4 text-white">Subject</th>
                <th className="text-left p-4 text-white">Class</th>
                <th className="text-left p-4 text-white">Lesson</th>
                <th className="text-left p-4 text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length > 0 ? (
                filteredEvents
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(event => (
                    <tr key={event.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-4 text-white">{event.startTime} - {event.endTime}</td>
                      <td className="p-4 text-white">{event.subject}</td>
                      <td className="p-4 text-white">{event.class}</td>
                      <td className="p-4 text-white">{event.lesson}</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                            View
                          </button>
                          <button className="px-3 py-1 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-1">
                            <Play className="h-3 w-3" />
                            <span>Start</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No events scheduled for {selectedDay}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}