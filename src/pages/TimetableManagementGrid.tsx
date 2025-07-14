import React, { useState, useEffect, useMemo  } from 'react';

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Plus, 
  Copy, 
  Trash2, 
  X,
  Save,
  Clock,
  Calendar,
  BookOpen,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getClassroomsForTimetable, getTimetableForClassroom, saveTimetableSlot, clearTimetableForClassroom, copyTimetable, getTeachersForSubjectInClassroomForTimetable } from '../services/timetableService';

interface TimetableSlot {
  id: number;
  day: string;
  period: number;
  startTime: string;
  endTime: string;
  subject?: string;
  teacher?: string;
}

interface Class {
  id: number;
  name: string;
  grade: string;
  stream?: string;
}

interface Subject {
  id: number;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
  subjects: string[];
}

export default function TimetableManagementGrid() {
  const navigate = useNavigate();
  const location = useLocation();

  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  

  
  // State for classes, subjects, and teachers
  const [classes, setClasses] = useState<Class[]>([]);

  /*
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: '1', name: 'John Mokoena', subjects: ['Mathematics'] },
    { id: '2', name: 'Sarah Johnson', subjects: ['Physics', 'Chemistry'] },
    { id: '3', name: 'Michael Brown', subjects: ['Biology'] },
    { id: '4', name: 'Emily Davis', subjects: ['English'] },
    { id: '5', name: 'David Wilson', subjects: ['History', 'English'] }
  ]);
  */

    const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  // State for timetable
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  // ⬇️ Memoized selected subjects
const selectedSubjects = useMemo(() => {
//  const found = classrooms.find(cls => cls.classroom_id === selectedClass);
  const found = classes.find(cls => cls.id === Number(selectedClass));
  console.log('🎯 Matched class:', found);
  return found?.subjects || [];
}, [selectedClass, classrooms]);
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);
  // Lunch configuration
  const [lunchPeriodAfter, setLunchPeriodAfter] = useState<number | null>(null); // e.g., after period 3
  const [lunchDuration, setLunchDuration] = useState<number>(30); // default 30 minutes

  const [days, setDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [periods, setPeriods] = useState<{number: number, startTime: string, endTime: string}[]>([
    { number: 1, startTime: '08:00', endTime: '08:45' },
    { number: 2, startTime: '08:50', endTime: '09:35' },
    { number: 3, startTime: '09:40', endTime: '10:25' },
    { number: 4, startTime: '10:45', endTime: '11:30' },
    { number: 5, startTime: '11:35', endTime: '12:20' },
    { number: 6, startTime: '12:25', endTime: '13:10' },
    { number: 7, startTime: '13:45', endTime: '14:30' }
  ]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{
    slotId?: number;
    day: string;
    period: number;
    startTime: string;
    endTime: string;
    subject: string;
    teacher: string;
  }>({
    day: '',
    period: 0,
    startTime: '',
    endTime: '',
    subject: '',
    teacher: ''
  });

  

  const fetchClassrooms = async () => {
  try {
    const data = await getClassroomsForTimetable();
    console.log('🧪 Sample classroom chelsea object:', data[0]);
    console.log('First classroom madrid:', classrooms[0]);


    setClassrooms(data); // Full data including subjects
 const mapped = data.map((cls: any) => ({
    id: cls.id,
    name: cls.name,
    grade: cls.grade,
    stream: cls.stream,
    subjects: cls.subjects || []
  }));

  console.log('📚 Mapped classes:', mapped);
    console.log('just curious what subject is', subjects);

  setClasses(mapped);
  //  setClasses(data);
} catch (error) {
  console.error('Error fetching classrooms:', error);
  toast.error('Failed to load classrooms');
}
};


  
  
  // Load classrooms when component mounts
  useEffect(() => {
    fetchClassrooms();
  }, []);

  /*
  // Initialize timetable when class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchTimetableForClass(selectedClass);
    }
  }, [selectedClass]);

  */

useEffect(() => {
  console.log ('attempting to get teachers');
  console.log('🎯 useEffect triggered - subject:', modalData.subject,'subject id', modalData.subject, 'class:', selectedClass);
  const loadTeachers = async () => {
//    if (!modalData.subject || !selectedClass) return;
    if (!modalData.subject || !selectedClass)
    {
      console.log('⏭️ Skipping fetch: missing subject or class');
      return;
    }

    /*
    const subjectObj = subjects.find(s => s.name === modalData.subject);
   // if (!subjectObj) return;
    if (!subjectObj) {
      console.warn('⚠️ Subject not found in subjects list:', modalData.subject);
      return;
    }
    */

   // console.log('📡 Fetching teachers for subject ID:', subjectObj.id, 'in classroom:', selectedClass);
    console.log('just checking subjtect before call hmnisi', subjects);
    console.log('🎯 useEffect triggered - subject:', modalData.subject, 'class:', selectedClass);

  // 👇 Log subjects BEFORE fetching teachers
  console.log('🕵️ Just checking subjects before teacher fetch:', subjects);
    const fetched = await getTeachersForSubjectInClassroomForTimetable(selectedClass, modalData.subject);
    console.log('✅ Fetched from timetableService:', fetched);
    setTeachers(fetched);
  };

  loadTeachers();
}, [modalData.subject, selectedClass]);
  
  
  useEffect(() => {
  if (selectedClass) {
    fetchTimetableForClass(selectedClass);

  //  const cls = classrooms.find(c => c.classroom_id === selectedClass);
    
//console.log('🧪 Selected classroom object:matlotlo', cls);
    const cls = classes.find(c => c.id === selectedClass);
    console.log('🧪 Selected class for subject load: makhabane', cls);
    
    if (cls && cls.subjects) {
      setSubjects(
        cls.subjects.map((s: any) => ({
         id: s.id,
          name: s.name
      //    id: s.subjects?.subjects_id ?? s.subject_id,
    //name: s.subjects?.subjects_name ?? 'Unnamed'
        }))
      );
    } else {
      setSubjects([]);
    }
  }
}, [selectedClass, classrooms]);

  
  // Get timetable data from location state if available
  useEffect(() => {
    if (location.state) {
      const { 
        teachingDays, 
        periodDuration, 
        periodsPerDay, 
        customPeriods, 
        startTime,
        lunchPeriodAfter: lunchAfter,
        lunchDuration: lunchMinutes
      } = location.state;
      
      if (teachingDays) {
        setDays(teachingDays);
      }

      if (lunchAfter) {
        setLunchPeriodAfter(lunchAfter);
      }
      if (lunchMinutes) {
        setLunchDuration(lunchMinutes);
      }
      
      if (periodDuration === 'custom' && customPeriods) {
        const formattedPeriods = customPeriods.map((period: any, index: number) => ({
          number: index + 1,
          startTime: period.startTime,
          endTime: period.endTime
        }));
        setPeriods(formattedPeriods);
      } else if (periodDuration && periodsPerDay) {
        // Generate periods based on duration and count
        const newPeriods = [];
        const durationMinutes = parseInt(periodDuration);
        let startHour = 8;
        let startMinute = 0;
        if (location.state?.startTime) {
          const [h, m] = location.state.startTime.split(':').map(Number);
          startHour = h;
          startMinute = m;
        }
        
        for (let i = 1; i <= periodsPerDay; i++) {
          const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
          
          // Calculate end time
          let endHour = startHour;
          let endMinute = startMinute + durationMinutes;
          
          if (endMinute >= 60) {
            endHour += Math.floor(endMinute / 60);
            endMinute = endMinute % 60;
          }
          
          const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
          
          newPeriods.push({
            number: i,
            startTime,
            endTime
          });

          // Update for next loop iteration
          startHour = endHour;
          startMinute = endMinute;
          
          // Insert lunch if configured
          if (lunchAfter && i === lunchAfter) {
            startMinute += lunchMinutes;
            if (startMinute >= 60) {
              startHour += Math.floor(startMinute / 60);
              startMinute %= 60;
            }
          }
        }
        
        setPeriods(newPeriods);
      }
    }
  }, [location.state]);

 
  const fetchTimetableForClass = async (classId: number) => {
    try {
      // In a real app, fetch the timetable from the database
      // For now, initialize with empty slots
      const timetableData = await getTimetableForClassroom(classId);
      
      if (timetableData && timetableData.length > 0) {
        setTimetableSlots(timetableData);
      } else {
        initializeTimetable();
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to load timetable');
      initializeTimetable();
    }
  };
  
  // Initialize timetable with empty slots
  const initializeTimetable = () => {
    const slots: TimetableSlot[] = [];
    let id = 1;
    
    days.forEach(day => {
      periods.forEach(period => {
        slots.push({
          id: id++,
          day,
          period: period.number,
          startTime: period.startTime,
          endTime: period.endTime
        });
      });
    });
    
    setTimetableSlots(slots);
  };
  
  // Handle slot click
  const handleSlotClick = (slot: TimetableSlot) => {
    setModalData({
      slotId: slot.id,
      day: slot.day,
      period: slot.period,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subject: slot.subject || '',
      teacher: slot.teacher || ''
    });
    setIsModalOpen(true);
  };
  
  // Handle modal save
  const handleModalSave = async () => {
    if (!modalData.subject) {
      toast.error('Please select a subject');
      return;
    }
    
    if (!modalData.teacher) {
      toast.error('Please select a teacher');
      return;
    }
    
    if (!selectedClass) {
      toast.error('No class selected');
      return;
    }
    
    try {
      console.log('🔍 Available subjects:', subjects);
console.log('🧑‍🏫 Available teachers:', teachers);
console.log('📌 Selected subject:', modalData.subject);
console.log('📌 Selected teacher:', modalData.teacher);
      
      // Find the subject and teacher IDs
      const subjectObj = subjects.find(s => s.id === modalData.subject);
      console.log('✅ Matched subject: herb', subjectObj);

      const teacherObj = teachers.find(t => t.name === modalData.teacher);
      console.log('✅ Matched teacher: herb', teacherObj);
      
      if (!subjectObj || !teacherObj) {
        toast.error('Invalid subject or teacher');
        return;
      }
      
      // Save to database via service
      await saveTimetableSlot(selectedClass, {
        day: modalData.day,
        period: modalData.period,
        startTime: modalData.startTime,
        endTime: modalData.endTime,
        subject: modalData.subject,
        teacher: modalData.teacher,
        subjectId: subjectObj.id,
        teacherId: teacherObj.id
      });
      
      // Update local state
      setTimetableSlots(prev => 
        prev.map(slot => 
          slot.id === modalData.slotId
            ? { 
                ...slot, 
                subject: modalData.subject, 
                teacher: modalData.teacher 
              }
            : slot
        )
      );
      
      setIsModalOpen(false);
      toast.success('Timetable slot updated successfully');
    } catch (error) {
      console.error('Error saving timetable slot:', error);
      toast.error('Failed to update timetable slot');
    }
  };
  
  // Filter teachers based on selected subject
  /*
  const filteredTeachers = teachers.filter(teacher => 
    teacher.subjects.includes(modalData.subject)
  );

  */
  const filteredTeachers = teachers;
  
  // Clear timetable
  const handleClearTimetable = async () => {
    if (!selectedClass) return;
    
    if (window.confirm('Are you sure you want to clear the entire timetable?')) {
      try {
        await clearTimetableForClassroom(selectedClass);
        initializeTimetable();
        toast.success('Timetable cleared successfully');
      } catch (error) {
        console.error('Error clearing timetable:', error);
        toast.error('Failed to clear timetable');
      }
    }
  };
  
  // Copy from another class
  const handleCopyFromClass = async () => {
    if (!selectedClass) return;
    
    const sourceClassId = prompt('Enter the ID of the class to copy from:');
    if (!sourceClassId) return;
    
    try {
      const sourceId = parseInt(sourceClassId);
      await copyTimetable(sourceId, selectedClass);
      await fetchTimetableForClass(selectedClass);
      toast.success('Timetable copied successfully');
    } catch (error) {
      console.error('Error copying timetable:', error);
      toast.error('Failed to copy timetable');
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
              <h1 className="text-2xl font-bold text-white">Timetable Management</h1>
            </div>
            
            <Link 
              to="/generate-timetable"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Setup</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Class Selection and Actions */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-white mb-2">
                Select Class
              </label>
              <select
                value={selectedClass || ''}
                onChange={(e) => setSelectedClass(parseInt(e.target.value) || null)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              >
                <option value="" className="bg-gray-900">Select a class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id} className="bg-gray-900">
                    
                    {cls.name || 'Unnamed'} ({cls.grade || 'No Grade'})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleClearTimetable}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
                disabled={!selectedClass}
              >
                <Trash2 className="h-5 w-5" />
                <span>Clear Timetable</span>
              </button>
              
              <button
                onClick={handleCopyFromClass}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
                disabled={!selectedClass}
              >
                <Copy className="h-5 w-5" />
                <span>Copy from Another Class</span>
              </button>
            </div>
          </div>
        </div>

        {/* Timetable Grid */}
        {selectedClass ? (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="p-4 text-white">Period</th>
                    {days.map(day => (
                      <th key={day} className="p-4 text-white">{day}</th>
                    ))}
                  </tr>
                </thead>
                
                <tbody>
                  {periods.map((period, index) => (
                    <React.Fragment key={period.number}>
                      {/* Regular period row */}
                      <tr className="border-b border-white/10">
                        <td className="p-4 text-white">
                          <div className="flex flex-col">
                            <span className="font-medium">Period {period.number}</span>
                            <span className="text-sm text-gray-400">
                              {period.startTime} - {period.endTime}
                            </span>
                          </div>
                        </td>
                        {days.map(day => {
                          const slot = timetableSlots.find(s =>
                            s.day === day && s.period === period.number
                          );
                          return (
                            <td
                              key={`${day}-${period.number}`}
                              className="p-4 border-l border-white/10"
                            >
                              {slot && (
                                <div
                                  onClick={() => handleSlotClick(slot)}
                                  className={`cursor-pointer rounded-lg p-3 transition-colors ${
                                    slot.subject
                                      ? 'bg-emerald-600/20 hover:bg-emerald-600/30'
                                      : 'bg-white/5 hover:bg-white/10'
                                  }`}
                                >
                                  {slot.subject ? (
                                    <div>
                                      <div className="font-medium text-white">{slot.subject}</div>
                                      <div className="text-sm text-gray-300">{slot.teacher}</div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center text-gray-400 hover:text-white">
                                      <Plus className="h-5 w-5 mr-1" />
                                      <span>Add</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Insert lunch row after the configured period */}
                      {lunchPeriodAfter === period.number && (
                        <tr className="bg-yellow-600/20 border-y border-white/20">
                          <td className="p-4 text-white font-semibold">Lunch Break</td>
                          {days.map(day => (
                            <td
                              key={`lunch-${day}`}
                              className="p-4 text-center text-yellow-300 italic"
                            >
                              {lunchDuration} min break
                            </td>
                          ))}
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Select a Class</h3>
            <p className="text-gray-400">
              Please select a class from the dropdown above to view and manage its timetable.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              {modalData.subject ? 'Edit Timetable Slot' : 'Add Timetable Slot'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Day
                  </label>
                  <input
                    type="text"
                    value={modalData.day}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Period
                  </label>
                  <input
                    type="text"
                    value={`Period ${modalData.period}`}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Start Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="time"
                      value={modalData.startTime}
                      disabled
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-3 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    End Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="time"
                      value={modalData.endTime}
                      disabled
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-3 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Subject
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={modalData.subject}
                    onChange={(e) => setModalData({ ...modalData, subject: Number(e.target.value), teacher: '' })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="" className="bg-gray-900">Select a subject</option>
                    {selectedSubjects.map((subject: any) => (
  <option key={subject.id} value={subject.id} className="bg-gray-900">
    {subject.name}
  </option>
))}

                    
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Teacher
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={modalData.teacher}
                    onChange={(e) => setModalData({ ...modalData, teacher: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-white/40"
                    disabled={!modalData.subject}
                  >
                    <option value="" className="bg-gray-900">Select a teacher</option>
                    {filteredTeachers.map(teacher => (
                      <option key={teacher.id} value={teacher.name} className="bg-gray-900">
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
                {modalData.subject && filteredTeachers.length === 0 && (
                  <p className="mt-2 text-yellow-400 text-sm">
                    No teachers available for this subject
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
              >
                <X className="h-5 w-5" />
                <span>Cancel</span>
              </button>
              
              <button
                onClick={handleModalSave}
                className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}