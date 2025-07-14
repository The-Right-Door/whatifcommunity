import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Book, Users, ChevronLeft } from 'lucide-react';
import { getActiveSubjects} from '../services/subjectService';
import type { Subject, Grade } from '../services/subjectService';

const subjectIcons: Record<string, string> = {
  'Mathematics': '📘',
  'English': '📚'
};

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const fromDashboard = location.state?.from === 'teacherDashboard' || location.state?.from === 'learnerDashboard';

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const activeSubjects = await getActiveSubjects();
        setSubjects(activeSubjects);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subjects. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchSubjects();
  }, []);

  const handleBack = () => {
    if (location.state?.from === 'teacherDashboard') {
      navigate('/teacher/dashboard');
    } else if (location.state?.from === 'learnerDashboard') {
      navigate('/learner/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading subjects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="relative min-h-screen">
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

        <div className="relative z-20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="flex items-center space-x-2 text-white">
                <Users className="h-8 w-8" />
                <span className="text-xl font-bold">What-If Community</span>
              </Link>
              
              <h1 className="text-2xl font-bold text-white">My Subjects</h1>
              
              <button 
                onClick={handleBack}
                className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Back to {location.state?.from === 'teacherDashboard' ? 'Teacher' : 'Learner'} Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            No Active Subjects Available
          </h1>
          <p className="text-xl text-gray-200">
            Please check back later for available subjects.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
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

      <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <Users className="h-8 w-8" />
              <span className="text-xl font-bold">What-If Community</span>
            </Link>
            
            <h1 className="text-2xl font-bold text-white">My Subjects</h1>
            
            <button 
              onClick={handleBack}
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to {location.state?.from === 'teacherDashboard' ? 'Teacher' : 'Learner'} Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {fromDashboard ? 'Manage Your Subjects' : 'Here To Explore Our Subjects?'}
          </h1>
          <p className="text-3xl md:text-4xl font-bold text-white mb-4">
            You Are On The Right Place.
          </p>
          <p className="text-3xl md:text-4xl font-bold text-white mb-4">
            Choose a subject and a grade,
          </p>
          <p className="text-2xl md:text-3xl font-bold text-white mb-6">
            and let's take the next step together as a community.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8">
          {subjects.map((subject) => (
            <div 
              key={subject.subjects_id}
              className="relative w-72 h-72 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 overflow-hidden transform transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <span className="text-4xl mb-2">{subjectIcons[subject.subjects_name] || '📚'}</span>
                <h3 className="text-xl font-semibold text-white mb-2">{subject.subjects_name}</h3>
                <p className="text-gray-200 text-sm text-center mb-4">{subject.subjects_short_description}</p>
                
                <div className="grid grid-cols-2 gap-2 w-full px-4">
                  {subject.grades && subject.grades.map((grade) => (
                    <Link
                      key={grade.grade_no}
                      to={`/subjects/${subject.subjects_name.toLowerCase()}/grade-${grade.grade_no}`}
                      state={{ from: location.state?.from }}
                      className="bg-gradient-to-r from-emerald-600/80 to-emerald-500/80 text-white text-xs px-3 py-2 rounded-full font-medium 
                               hover:from-emerald-500/80 hover:to-emerald-400/80 transform transition-all duration-300 
                               hover:scale-105 shadow-lg hover:shadow-emerald-500/50 text-center"
                    >
                      {grade.grade_name || `Grade ${grade.grade_no}`}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}