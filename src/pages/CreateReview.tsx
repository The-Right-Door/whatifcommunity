import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, ChevronLeft, Check, Minus, Plus } from 'lucide-react';
//import { getAvailableSubtopics } from '../services/reviewService';
import { getTeacherSubjects } from '../services/subjectService';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

interface SelectedSubtopic {
  id: number;
  title: string;
  topicId: number;
  topicTitle: string;
}

interface Subject {
  subjects_id: number;
  subjects_name: string;
}

interface Grade {
  grade_no: number;
  grade_name?: string;
}

interface SubjectWithGrades extends Subject {
  grades?: Grade[];
}

interface Topic {
  topics_id: number;
  topic: string;
  description?: string;
  start_date: string;
  end_date: string;
  topics_status: string;
}

interface Subtopic {
  subtopic_id: number;
  topic_id: number;
  subtopic_title: string;
  small_description?: string;
}

export default function CreateReview() {
  const navigate = useNavigate();
  const { isTeacher } = useUser();
  const [subjects, setSubjects] = useState<SubjectWithGrades[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [availableGrades, setAvailableGrades] = useState<Grade[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<number[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopicsByTopic, setSubtopicsByTopic] = useState<Record<number, Subtopic[]>>({});
  const [selectedSubtopics, setSelectedSubtopics] = useState<SelectedSubtopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    // Redirect if not a teacher
    if (!isTeacher) {
      toast.error('Only teachers can create reviews');
      navigate('/');
      return;
    }
    
    loadTeacherSubjects();
  }, [isTeacher, navigate]);

  useEffect(() => {
    if (selectedSubject && selectedGrade) {
      loadSubtopicsForReview();
    }
  }, [selectedSubject, selectedGrade]);

  const loadTeacherSubjects = async () => {
    try {
      const teacherSubjects = await getTeacherSubjects();
      setSubjects(teacherSubjects);
    } catch (error) {
      console.error('Error loading teacher subjects:', error);
      toast.error('Failed to load your subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (subjectId: number | null) => {
    setSelectedSubject(subjectId);
    setSelectedGrade(null);
    setTopics([]);
    setSubtopicsByTopic({});
    setSelectedSubtopics([]);
    
    if (subjectId) {
      const selectedSubjectData = subjects.find(s => s.subjects_id === subjectId);
      if (selectedSubjectData && selectedSubjectData.grades) {
        setAvailableGrades(selectedSubjectData.grades);
      } else {
        setAvailableGrades([]);
      }
    } else {
      setAvailableGrades([]);
    }
  };

  const loadSubtopicsForReview = async () => {
    if (!selectedSubject || !selectedGrade) return;
    
    setLoadingContent(true);
    try {
      const { topics: fetchedTopics, subtopics } = await getAvailableSubtopics(selectedSubject, selectedGrade);
      setTopics(fetchedTopics);
      setSubtopicsByTopic(subtopics);
    } catch (error) {
      console.error('Error loading content for review:', error);
      toast.error('Failed to load topics and subtopics');
    } finally {
      setLoadingContent(false);
    }
  };

  const toggleTopic = (topicId: number) => {
    setExpandedTopics(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const toggleSubtopicSelection = (subtopic: Subtopic, topic: Topic) => {
    setSelectedSubtopics(prev => {
      const isSelected = prev.some(s => s.id === subtopic.subtopic_id);
      if (isSelected) {
        return prev.filter(s => s.id !== subtopic.subtopic_id);
      } else {
        return [...prev, {
          id: subtopic.subtopic_id,
          title: subtopic.subtopic_title,
          topicId: topic.topics_id,
          topicTitle: topic.topic
        }];
      }
    });
  };

  const toggleAllSubtopicsForTopic = (topic: Topic) => {
    const topicSubtopics = subtopicsByTopic[topic.topics_id] || [];
    if (topicSubtopics.length === 0) return;
    
    const allSubtopicIds = topicSubtopics.map(s => s.subtopic_id);
    const allSelected = topicSubtopics.every(s => 
      selectedSubtopics.some(selected => selected.id === s.subtopic_id)
    );
    
    if (allSelected) {
      // Remove all subtopics for this topic
      setSelectedSubtopics(prev => 
        prev.filter(s => !allSubtopicIds.includes(s.id))
      );
    } else {
      // Add all subtopics for this topic
      const newSubtopics = topicSubtopics
        .filter(s => !selectedSubtopics.some(selected => selected.id === s.subtopic_id))
        .map(s => ({
          id: s.subtopic_id,
          title: s.subtopic_title,
          topicId: topic.topics_id,
          topicTitle: topic.topic
        }));
      
      setSelectedSubtopics([...selectedSubtopics, ...newSubtopics]);
    }
  };

  const handleGenerateReview = () => {
    if (selectedSubtopics.length === 0) {
      toast.error('Please select at least one subtopic');
      return;
    }
    
    // Here you would typically send the selected subtopics to the backend
    console.log('Selected subtopics for review:', selectedSubtopics);
    toast.success(`Review generated with ${selectedSubtopics.length} subtopics`);
    
    // Navigate to the next step or show confirmation
    // navigate('/review-confirmation', { state: { selectedSubtopics } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-2xl font-bold text-white">Create Review</h1>
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Select Topics & Subtopics</h2>

          {/* Subject and Grade Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Subject</label>
              <select
                value={selectedSubject || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : null;
                  handleSubjectChange(value);
                }}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              >
                <option value="" className="bg-gray-900">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject.subjects_id} value={subject.subjects_id} className="bg-gray-900">
                    {subject.subjects_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Grade</label>
              <select
                value={selectedGrade || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : null;
                  setSelectedGrade(value);
                }}
                disabled={!selectedSubject || availableGrades.length === 0}
                className={`w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40 ${
                  !selectedSubject ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="" className="bg-gray-900">Select a grade</option>
                {availableGrades.map(grade => (
                  <option key={grade.grade_no} value={grade.grade_no} className="bg-gray-900">
                    {grade.grade_name || `Grade ${grade.grade_no}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Review Button - Top */}
          {selectedSubtopics.length > 0 && (
            <div className="mb-6">
              <button
                onClick={handleGenerateReview}
                className="w-full bg-emerald-600/80 text-white px-4 py-3 rounded-lg hover:bg-emerald-500 transition-colors flex items-center justify-center space-x-2"
              >
                <Check className="h-5 w-5" />
                <span>Generate Review with {selectedSubtopics.length} Subtopics</span>
              </button>
            </div>
          )}

          {/* Topics and Subtopics */}
          {selectedSubject && selectedGrade && (
            <div className="space-y-4 mb-8">
              {loadingContent ? (
                <div className="text-center text-gray-400 py-4">Loading topics and subtopics...</div>
              ) : topics.length > 0 ? (
                <div className="space-y-3">
                  {topics.map((topic) => (
                    <div key={topic.topics_id} className="bg-white/5 rounded-lg">
                      <button
                        onClick={() => toggleTopic(topic.topics_id)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5"
                      >
                        <span className="text-white">{topic.topic}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAllSubtopicsForTopic(topic);
                            }}
                            className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm mr-2"
                          >
                            {subtopicsByTopic[topic.topics_id] && 
                             subtopicsByTopic[topic.topics_id].every(s => 
                              selectedSubtopics.some(selected => selected.id === s.subtopic_id)
                            ) ? 'Deselect All' : 'Select All'}
                          </button>
                          {expandedTopics.includes(topic.topics_id) ? (
                            <Minus className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Plus className="h-4 w-4 text-emerald-400" />
                          )}
                        </div>
                      </button>
                      {expandedTopics.includes(topic.topics_id) && subtopicsByTopic[topic.topics_id] && (
                        <div className="px-4 py-2 space-y-2">
                          {subtopicsByTopic[topic.topics_id].map((subtopic) => {
                            const isSelected = selectedSubtopics.some(s => s.id === subtopic.subtopic_id);
                            return (
                              <div
                                key={subtopic.subtopic_id}
                                className="flex justify-between items-center text-gray-300 pl-4 py-2"
                              >
                                <span>{subtopic.subtopic_title}</span>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`subtopic-${subtopic.subtopic_id}`}
                                    checked={isSelected}
                                    onChange={() => toggleSubtopicSelection(subtopic, topic)}
                                    className="h-4 w-4 rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50 mr-2"
                                  />
                                  <label 
                                    htmlFor={`subtopic-${subtopic.subtopic_id}`}
                                    className={`cursor-pointer ${isSelected ? 'text-emerald-400' : 'text-white'}`}
                                  >
                                    {isSelected ? 'Selected' : 'Select'}
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center">No topics available for the selected subject and grade</p>
              )}
            </div>
          )}

          {/* Selected Subtopics */}
          {selectedSubtopics.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4">Selected Subtopics ({selectedSubtopics.length})</h3>
              <div className="bg-white/5 rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {selectedSubtopics.map((subtopic) => (
                    <div key={subtopic.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-white">{subtopic.title}</p>
                        <p className="text-sm text-gray-400">{subtopic.topicTitle}</p>
                      </div>
                      <button
                        onClick={() => toggleSubtopicSelection(
                          { subtopic_id: subtopic.id, subtopic_title: subtopic.title },
                          { topics_id: subtopic.topicId, topic: subtopic.topicTitle }
                        )}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Generate Review Button - Bottom */}
          <div className="flex justify-end">
            <button
              onClick={handleGenerateReview}
              disabled={selectedSubtopics.length === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedSubtopics.length > 0
                  ? 'bg-emerald-600/80 text-white hover:bg-emerald-500'
                  : 'bg-white/10 text-gray-400 cursor-not-allowed'
              }`}
            >
              Generate Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}