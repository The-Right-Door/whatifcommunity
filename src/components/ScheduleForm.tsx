import React, { useState } from 'react';
import { Users, Search, Clock } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Calendar } from './Calendar';

interface ScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'qa' | 'live' | 'oneOnOne';
}

// Sample data - would come from API in real app
const learners = [
  { id: 1, name: 'John Smith', grade: 'Grade 11' },
  { id: 2, name: 'Sarah Johnson', grade: 'Grade 12' },
  { id: 3, name: 'Michael Brown', grade: 'Grade 10' },
];

const classes = [
  { id: 1, name: 'Mathematics Grade 11' },
  { id: 2, name: 'Physics Grade 12' },
  { id: 3, name: 'Chemistry Grade 10' },
];

export default function ScheduleForm({ isOpen, onClose, type }: ScheduleFormProps) {
  const [formData, setFormData] = useState({
    participantType: '',
    participant: '',
    searchTerm: '',
    date: undefined as Date | undefined,
    time: '',
    duration: '30',
    topic: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    onClose();
  };

  const getTitle = () => {
    switch(type) {
      case 'qa':
        return 'Schedule Q&A Session';
      case 'live':
        return 'Schedule Live Class';
      case 'oneOnOne':
        return 'Schedule One-on-One Session';
      default:
        return 'Schedule Session';
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-h-screen flex items-center justify-center px-4 py-20 w-full z-50">
          <div className="bg-transparent backdrop-blur-sm border border-white/20 rounded-lg p-8 max-w-md w-full">
            <div className="flex items-center space-x-2 mb-6 justify-center">
              <Users className="h-8 w-8 text-white" />
              <Dialog.Title className="text-2xl font-bold text-white">
                {getTitle()}
              </Dialog.Title>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white">Participant Type</label>
                <select
                  className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                  value={formData.participantType}
                  onChange={(e) => setFormData({ ...formData, participantType: e.target.value })}
                >
                  <option value="" className="bg-gray-900">Select participant type</option>
                  <option value="class" className="bg-gray-900">Whole Class</option>
                  <option value="learner" className="bg-gray-900">Learner</option>
                  <option value="parent" className="bg-gray-900">Parent</option>
                </select>
              </div>

              {formData.participantType === 'learner' && (
                <div>
                  <label className="block text-sm font-medium text-white">Search Learner</label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search by name..."
                      className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20 pl-10"
                      value={formData.searchTerm}
                      onChange={(e) => setFormData({ ...formData, searchTerm: e.target.value })}
                    />
                  </div>
                  <div className="mt-2 max-h-40 overflow-y-auto rounded-md bg-white/10">
                    {learners.map(learner => (
                      <button
                        key={learner.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-white hover:bg-white/10 transition-colors"
                        onClick={() => setFormData({ ...formData, participant: learner.name })}
                      >
                        {learner.name} - {learner.grade}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formData.participantType === 'class' && (
                <div>
                  <label className="block text-sm font-medium text-white">Select Class</label>
                  <select
                    className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                    value={formData.participant}
                    onChange={(e) => setFormData({ ...formData, participant: e.target.value })}
                  >
                    <option value="" className="bg-gray-900">Select a class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.name} className="bg-gray-900">
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white">Date</label>
                <div className="mt-1">
                  <Calendar
                    date={formData.date}
                    onDateChange={(date) => setFormData({ ...formData, date })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white">Time</label>
                <div className="relative mt-1">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="time"
                    className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20 pl-10"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white">Duration</label>
                <select
                  className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                >
                  <option value="30" className="bg-gray-900">30 minutes</option>
                  <option value="45" className="bg-gray-900">45 minutes</option>
                  <option value="60" className="bg-gray-900">1 hour</option>
                  <option value="90" className="bg-gray-900">1.5 hours</option>
                  <option value="120" className="bg-gray-900">2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white">Topic</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                  placeholder="Enter session topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Schedule Session
                </button>
              </div>

              <p className="text-center text-sm text-white">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-white font-semibold hover:underline"
                >
                  Cancel
                </button>
              </p>
            </form>

            <Dialog.Close className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}