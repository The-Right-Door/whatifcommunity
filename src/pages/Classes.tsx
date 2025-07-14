import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Clock, Video, Bell, Play, Users2 } from 'lucide-react';
import Navbar from '../components/Navbar';

const liveClasses = [
  {
    id: 1,
    topic: "Advanced Calculus: Differential Equations",
    teacher: "Dr. Sarah Johnson",
    startTime: "14:00",
    duration: "90 minutes",
    participants: 25
  },
  {
    id: 2,
    topic: "Quantum Physics: Wave Functions",
    teacher: "Prof. Michael Chen",
    startTime: "15:30",
    duration: "60 minutes",
    participants: 18
  }
];

const upcomingClasses = [
  {
    id: 1,
    topic: "English Literature: Modern Poetry Analysis",
    teacher: "Ms. Emily Brown",
    scheduledDate: "2025-03-26",
    scheduledTime: "14:00",
    startsIn: "2 days"
  },
  {
    id: 2,
    topic: "Biology: Cellular Respiration",
    teacher: "Dr. James Wilson",
    scheduledDate: "2025-03-27",
    scheduledTime: "15:30",
    startsIn: "3 days"
  }
];

const recordedClasses = [
  {
    id: 1,
    topic: "Chemistry: Organic Compounds",
    teacher: "Dr. Lisa Martinez",
    date: "2025-03-20",
    duration: "75 minutes"
  },
  {
    id: 2,
    topic: "History: World War II Analysis",
    teacher: "Prof. Robert Thompson",
    date: "2025-03-19",
    duration: "90 minutes"
  }
];

export default function Classes() {
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

      <Navbar />

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Your Learning Journey Continues
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto">
          Join live sessions, plan for upcoming classes, or catch up with recordings
        </p>
      </div>

      {/* Classes Cards */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Classes Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-emerald-500/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Live Classes</h2>
              <div className="animate-pulse">
                <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-6">
              {liveClasses.map((classItem) => (
                <div key={classItem.id} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                  <h3 className="text-lg font-semibold text-white mb-2">{classItem.topic}</h3>
                  <div className="space-y-2 text-gray-200 mb-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{classItem.teacher}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Started at {classItem.startTime} ({classItem.duration})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users2 className="h-4 w-4" />
                      <span>{classItem.participants} participants</span>
                    </div>
                  </div>
                  <button className="w-full bg-emerald-600/80 text-white px-4 py-2 rounded-full font-semibold hover:bg-emerald-500 transition-all duration-300">
                    Join Now
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Classes Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Upcoming Classes</h2>
            <div className="space-y-6">
              {upcomingClasses.map((classItem) => (
                <div key={classItem.id} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                  <h3 className="text-lg font-semibold text-white mb-2">{classItem.topic}</h3>
                  <div className="space-y-2 text-gray-200 mb-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{classItem.teacher}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(classItem.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{classItem.scheduledTime}</span>
                    </div>
                    <div className="text-emerald-400 font-medium">
                      Starts in {classItem.startsIn}
                    </div>
                  </div>
                  <button className="w-full bg-white/10 text-white px-4 py-2 rounded-full font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <span>Set Reminder</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recorded Classes Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Recorded Classes</h2>
            <div className="space-y-6">
              {recordedClasses.map((classItem) => (
                <div key={classItem.id} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                  <h3 className="text-lg font-semibold text-white mb-2">{classItem.topic}</h3>
                  <div className="space-y-2 text-gray-200 mb-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{classItem.teacher}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(classItem.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{classItem.duration}</span>
                    </div>
                  </div>
                  <button className="w-full bg-emerald-600/80 text-white px-4 py-2 rounded-full font-semibold hover:bg-emerald-500 transition-all duration-300 flex items-center justify-center space-x-2">
                    <Play className="h-4 w-4" />
                    <span>Watch Recording</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}