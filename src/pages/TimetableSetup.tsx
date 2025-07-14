import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2,
  CheckSquare,
  Square,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PeriodSlot {
  id: number;
  startTime: string;
  endTime: string;
}

export default function TimetableSetup() {
  const navigate = useNavigate();
  
  // State for teaching days
  const [teachingDays, setTeachingDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // State for period duration
  const [periodDuration, setPeriodDuration] = useState<string>('45');
  const [periodsPerDay, setPeriodsPerDay] = useState<number>(7);
  
  // State for custom periods
  const [customPeriods, setCustomPeriods] = useState<PeriodSlot[]>([
    { id: 1, startTime: '08:00', endTime: '08:45' },
    { id: 2, startTime: '08:50', endTime: '09:35' }
  ]);

  //state for start time
  const [startTime, setStartTime] = useState<string>('07:00');

  // Lunch configuration
const [lunchPeriodAfter, setLunchPeriodAfter] = useState<number | null>(null); // e.g., after period 3
const [lunchDuration, setLunchDuration] = useState<number>(30); // default 30 minutes


  
  // State for next custom period ID
  const [nextPeriodId, setNextPeriodId] = useState<number>(3);

  const toggleDay = (day: string) => {
    if (teachingDays.includes(day)) {
      // Don't allow removing the last day
      if (teachingDays.length === 1) {
        toast.error('At least one teaching day is required');
        return;
      }
      setTeachingDays(teachingDays.filter(d => d !== day));
    } else {
      setTeachingDays([...teachingDays, day]);
    }
  };

  const handlePeriodDurationChange = (duration: string) => {
    setPeriodDuration(duration);
    
    // Reset periods per day to a sensible default based on duration
    if (duration === '30') setPeriodsPerDay(9);
    else if (duration === '45') setPeriodsPerDay(7);
    else if (duration === '60') setPeriodsPerDay(6);
    else if (duration === '90') setPeriodsPerDay(4);
  };

  const addCustomPeriod = () => {
    // Get the last period's end time to suggest as the next period's start time
    const lastPeriod = customPeriods[customPeriods.length - 1];
    const newStartTime = lastPeriod ? lastPeriod.endTime : '08:00';
    
    // Calculate a reasonable end time (45 minutes later)
    const [hours, minutes] = newStartTime.split(':').map(Number);
    const endTimeDate = new Date();
    endTimeDate.setHours(hours, minutes + 45);
    const newEndTime = `${String(endTimeDate.getHours()).padStart(2, '0')}:${String(endTimeDate.getMinutes()).padStart(2, '0')}`;
    
    setCustomPeriods([
      ...customPeriods,
      { id: nextPeriodId, startTime: newStartTime, endTime: newEndTime }
    ]);
    setNextPeriodId(nextPeriodId + 1);
  };

  const removeCustomPeriod = (id: number) => {
    // Don't allow removing if only one period remains
    if (customPeriods.length <= 1) {
      toast.error('At least one period is required');
      return;
    }
    setCustomPeriods(customPeriods.filter(period => period.id !== id));
  };

  const updateCustomPeriod = (id: number, field: 'startTime' | 'endTime', value: string) => {
    setCustomPeriods(customPeriods.map(period => 
      period.id === id ? { ...period, [field]: value } : period
    ));
  };

  const handleGenerateTimetable = () => {
    // Validate inputs
    if (teachingDays.length === 0) {
      toast.error('Please select at least one teaching day');
      return;
    }
    
    if (periodDuration === 'custom' && customPeriods.length === 0) {
      toast.error('Please add at least one custom period');
      return;
    }
    
    // Validate custom periods
    if (periodDuration === 'custom') {
      for (const period of customPeriods) {
        if (!period.startTime || !period.endTime) {
          toast.error('All periods must have start and end times');
          return;
        }
        
        // Check if end time is after start time
        if (period.startTime >= period.endTime) {
          toast.error('Period end time must be after start time');
          return;
        }
      }
    }
    
    // Navigate to timetable management grid with the configuration
    navigate('/timetable-management-grid', { 
      state: { 
        teachingDays, 
        periodDuration, 
        periodsPerDay, 
        customPeriods,
        startTime,
        lunchPeriodAfter,
        lunchDuration
      } 
    });
    
    toast.success('Timetable grid generated successfully');
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
              <h1 className="text-2xl font-bold text-white">Timetable Setup</h1>
            </div>
            
            <Link 
              to="/special/management"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Management</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Description */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-500/20 rounded-full">
              <Info className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Timetable Configuration</h2>
              <p className="text-white">
                Configure your school's timetable structure by selecting teaching days and defining period durations. 
                This will create the framework for class scheduling.
              </p>
            </div>
          </div>
        </div>

        {/* Teaching Days Selection */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Select Teaching Days</h2>
          
            
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    {allDays.map(day => (
      <label
        key={day}
        onClick={() => toggleDay(day)}           // ← make the whole label clickable
        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
          teachingDays.includes(day)
            ? 'bg-emerald-600/30 hover:bg-emerald-600/40'
            : 'bg-white/5 hover:bg-white/10'
        }`}
      >
        {/* controlled checkbox input */}
        <input
          type="checkbox"
          checked={teachingDays.includes(day)}
          readOnly
          className="h-5 w-5 text-emerald-400 rounded"
        />
        <span className={teachingDays.includes(day) ? 'text-white' : 'text-gray-400'}>
          {day}
        </span>
      </label>
    ))}
  </div>
</div>

        <div className="mt-6">
  <label className="block text-sm font-medium text-white mb-2">
    School Start Time
  </label>
  <input
    type="time"
    value={startTime}
    onChange={(e) => setStartTime(e.target.value)}
    className="w-full md:w-1/3 bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
  />
</div>


        {/* Period Duration */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Period Duration</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {['30', '45', '60', '90', 'custom'].map(duration => (
                <label
                  key={duration}
                  className={`flex items-center justify-center p-3 rounded-lg cursor-pointer transition-colors ${
                    periodDuration === duration 
                      ? 'bg-emerald-600/30 border border-emerald-500/50' 
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="periodDuration"
                    value={duration}
                    checked={periodDuration === duration}
                    onChange={() => handlePeriodDurationChange(duration)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-white" />
                    <span className="text-white">
                      {duration === 'custom' ? 'Custom' : `${duration} min`}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            {periodDuration !== 'custom' ? (
              <div className="mt-6">
                <label className="block text-sm font-medium text-white mb-2">
                  Number of Periods Per Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={periodsPerDay}
                  onChange={(e) => setPeriodsPerDay(parseInt(e.target.value) || 1)}
                  className="w-full md:w-1/3 bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                />
                <div className="mt-6 space-y-4">
  <label className="block text-sm font-medium text-white">
    Insert lunch break after which period?
  </label>
  <select
    value={lunchPeriodAfter ?? ''}
    onChange={(e) => setLunchPeriodAfter(parseInt(e.target.value))}
    className="w-full md:w-1/3 bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white"
  >
    <option value="">None</option>
    {Array.from({ length: periodsPerDay }, (_, i) => (
      <option key={i + 1} value={i + 1}>
        After Period {i + 1}
      </option>
    ))}
  </select>

  <label className="block text-sm font-medium text-white">
    Lunch duration (minutes)
  </label>
  <input
    type="number"
    value={lunchDuration}
    onChange={(e) => setLunchDuration(parseInt(e.target.value))}
    className="w-full md:w-1/3 bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white"
    min="10"
  />
</div>

              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Custom Periods</h3>
                  <button
                    onClick={addCustomPeriod}
                    className="px-3 py-1 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Period</span>
                  </button>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {customPeriods.map((period, index) => (
                    <div key={period.id} className="flex items-center space-x-3">
                      <div className="bg-white/5 rounded-lg px-3 py-2 text-white">
                        Period {index + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-white mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={period.startTime}
                            onChange={(e) => updateCustomPeriod(period.id, 'startTime', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={period.endTime}
                            onChange={(e) => updateCustomPeriod(period.id, 'endTime', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeCustomPeriod(period.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <button
            onClick={handleGenerateTimetable}
            className="px-6 py-3 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
          >
            <Calendar className="h-5 w-5" />
            <span>Generate Timetable Grid</span>
          </button>
        </div>
      </div>
    </div>
  );
}