import React, { useState } from 'react';
import { X, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const subjects = [
  'Mathematics',
  'Physical Sciences',
  'Life Sciences',
  'English',
  'Geography',
  'History'
];

export default function QuestionModal({ isOpen, onClose }: QuestionModalProps) {
  const [formData, setFormData] = useState({
    question: '',
    subject: '',
    tags: '',
    isAnonymous: false
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically make an API call to save the question
    console.log('Question submitted:', formData);
    
    // Show success toast
    toast.success('Your question has been posted!', {
      style: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#fff',
      },
      iconTheme: {
        primary: '#059669',
        secondary: '#fff',
      },
    });
    
    // Reset form and close modal
    setFormData({
      question: '',
      subject: '',
      tags: '',
      isAnonymous: false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg w-full max-w-2xl mx-4 overflow-hidden shadow-xl animate-slideUp">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white">Ask a Question</h2>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Your Question
              </label>
              <textarea
                required
                rows={4}
                placeholder="What would you like to ask?"
                className="mt-1 block w-full rounded-md bg-white/20 border-white/30 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              />
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Subject
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md bg-white/20 border-white/30 text-white focus:border-white focus:ring focus:ring-white/20"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              >
                <option value="" className="bg-gray-900">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject} className="bg-gray-900">
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-1 flex items-center gap-2">
                <Hash className="h-4 w-4" /> Tags
              </label>
              <input
                type="text"
                placeholder="Add tags (e.g., Grade11, Algebra)"
                className="mt-1 block w-full rounded-md bg-white/20 border-white/30 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>

            {/* Anonymity Toggle */}
            <div className="flex items-center gap-3 bg-white/20 p-4 rounded-md">
              <input
                type="checkbox"
                id="anonymous"
                className="rounded bg-white/20 border-white/30 text-emerald-500 focus:ring focus:ring-white/20"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              />
              <label htmlFor="anonymous" className="text-sm text-white">
                Post anonymously
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-emerald-600/80 text-white px-4 py-3 rounded-md hover:bg-emerald-500 transition-colors font-semibold"
            >
              Post Question
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}