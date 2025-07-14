import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { 
  Users, 
  ChevronLeft,
  Search,
  Plus,
  Minus,
  Check,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { 
  fetchPeriodsForGrade, 
  fetchTopicsForPeriod, 
  fetchSubtopicsForTopic,
  fetchAllTopicsAndSubtopics,
  Period,
  Topic,
  Subtopic
} from '../services/dailyReviewService';

import { generateDailyReview } from '../services/teacherDailyReviewService';
import { saveReview } from '../services/reviewService';
import { createAssessment } from '../services/assessmentService';
import { extractQuestionsFromContent, saveReviewQuestions } from '../services/ReviewPersistenceService';


interface SelectedSubtopic {
  id: number;
  title: string;
  topicId: number;
  topicTitle: string;
}

const questionTypes = [
  'Multiple Choice Questions',
  'Fill in Missing Words',
  'True or False',
  'Match the Column',
  'explain'
];

const difficultyLevels = [
  'Easy',
  'Medium',
  'Hard',
  'Advanced'
];

const examStyles = [
  'Standard',       // General school-level exams
  'IEB',            // South African Independent Examinations Board
  'Cambridge',      // Cambridge International
  'AP',             // Advanced Placement (US)
  'OCA',            // Oracle Certified Associate (Java)
  'OCP',            // Oracle Certified Professional (Java)
  'Oracle Master',  // Oracle Certified Master (Java)
  'Java SE 8',      // Specific Java version
  'Java SE 11',     // Specific Java version
  'Java SE 17',     // Specific Java version
  'Mock Interview', // For technical interview preparation
  'Coding Challenge', // For competitive programming
  'LeetCode Style',  // Based on LeetCode problem formats
  'HackerRank Style', // For HackerRank-style challenges
  'Final Exam',      // General final exams
  'Midterm',         // Mid-term exams
  'Placement Test'   // College or job placement tests
];

const groups = [
  { id: 1, name: 'Mathematics Study Group A', members: 15, grade: 'Grade 11' },
  { id: 2, name: 'Advanced Physics Team', members: 12, grade: 'Grade 12' },
  { id: 3, name: 'English Literature Circle', members: 10, grade: 'Grade 11' },
  { id: 4, name: 'Science Club', members: 20, grade: 'Grade 12' }
];

export default function TeacherDailyReview() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopicsByTopic, setSubtopicsByTopic] = useState<Record<number, Subtopic[]>>({});
  const [learners, setLearners] = useState<any[]>([]);
 // const [filteredClasses, setFilteredClasses] = useState<any[]>([]);
//  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [classes, setClasses] = useState([]);
  const [expandedTopics, setExpandedTopics] = useState<number[]>([]);
  const [selectedSubtopics, setSelectedSubtopics] = useState<SelectedSubtopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedReview, setGeneratedReview] = useState<string | null>(null);
  const [extractedQuestions, setExtractedQuestions] = useState<any[]>([]);
  const [reviewId, setReviewId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    selectedPeriod: '',
    title: '',
    description: '',
    questionType: 'Multiple Choice Questions',
    startDate: '',
    endDate: '',
    timeLimit: '',
    targetAudience: 'class',
    selectedLearners: [] as number[],
    selectedGroups: [] as number[],
    selectedClasses: [], // 👈 Add this
    searchTerm: '',
    includeHints: false,
    difficultyLevel: 'Medium',
    examStyle: 'Standard',
    questionCount: 5 // Default to 5 questions
  });

  useEffect(() => {
    fetchSubjectsAndGrades();
  }, []);

  useEffect(() => {
    if (formData.grade) {
      fetchPeriods();
    }
  }, [formData.grade]);

  useEffect(() => {
    if (formData.selectedPeriod && formData.subject && formData.grade) {
      fetchTopicsAndSubtopics();
    }
  }, [formData.selectedPeriod]);

 // console.log('📦 Raw learners data:', data)
  

  useEffect(() => {
    const fetchLearnersForGrade = async () => {
      if (formData.targetAudience !== 'individual' || !formData.grade) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select(`user_id, first_name, last_name, grades_id, grades (
            grade_name
          )`)
          .eq('role', 'learner')
          .eq('grade_id', parseInt(formData.grade));

        if (error) throw error;

        const formattedLearners = data.map((learner: any) => ({
         // console.log('🎓 Grade info:', learner.grades)
         
          id: learner.user_id,
          name: `${learner.first_name} ${learner.last_name}`,
       //   grade: `Grade ${learner.grade_id}`,
          grade: learner.grades?.grade_name,
       //   grade: learner.grades?.grade_name || `Grade ${learner.grade_id}`,
          class: '' // If you have class info, include it here
         
        }));

        setLearners(formattedLearners);
      } catch (error) {
        console.error('Error fetching learners:', error);
        toast.error('Failed to load learners for this grade');
      }
    };

    fetchLearnersForGrade();
  }, [formData.grade, formData.targetAudience]);

  useEffect(() => {
  async function fetchClasses() {
    const { data, error } = await supabase
      .from('classrooms')
      .select('classroom_id, classroom_name, grade_id, stream_id');
    
    if (error) {
      console.error('❌ Error fetching classes:', error);
    } else {
      setClasses(data.map(cls => ({
        id: cls.classroom_id,
        name: cls.classroom_name || `Class ${cls.classroom_id}`,
        grade: `Grade ${cls.grade_id}`,
        stream: cls.stream_id, // You can map stream_id to a label if needed
        
      })));
    }
  }

  if (formData.targetAudience === 'class') {
    fetchClasses();
  }
}, [formData.targetAudience]);
  

  const fetchSubjectsAndGrades = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to create a review');
        navigate('/login');
        return;
      }

      // Fetch subjects and grades from Supabase
      const [subjectsResponse, gradesResponse] = await Promise.all([
        supabase.from('subjects').select('*').eq('subjects_status', 'active'),
        supabase.from('grades').select('*').order('grade_no')
      ]);

      if (subjectsResponse.error) throw subjectsResponse.error;
      if (gradesResponse.error) throw gradesResponse.error;

      setSubjects(subjectsResponse.data);
      setGrades(gradesResponse.data);

      if (subjectsResponse.data.length > 0) {
        setFormData(prev => ({ ...prev, subject: subjectsResponse.data[0].subjects_id.toString() }));
      }
      if (gradesResponse.data.length > 0) {
        setFormData(prev => ({ ...prev, grade: gradesResponse.data[0].grades_id.toString() }));
      }
    } catch (error) {
      console.error('Error fetching subjects and grades:', error);
      toast.error('Failed to load subjects and grades');
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriods = async () => {
    try {
      const periods = await fetchPeriodsForGrade(parseInt(formData.grade));
      setPeriods(periods);
    } catch (error) {
      console.error('Error fetching periods:', error);
      toast.error('Failed to load periods');
    }
  };

  const fetchTopicsAndSubtopics = async () => {
    if (!formData.selectedPeriod || !formData.subject || !formData.grade) return;
    
    setLoadingTopics(true);
    try {
      // Fetch topics for the selected period
      const topicsData = await fetchTopicsForPeriod(
        parseInt(formData.subject),
        parseInt(formData.grade),
        parseInt(formData.selectedPeriod)
      );
      
      setTopics(topicsData);
      
      // Fetch subtopics for each topic
      const subtopicsMap: Record<number, Subtopic[]> = {};
      for (const topic of topicsData) {
        const subtopicsData = await fetchSubtopicsForTopic(topic.topics_id);
        subtopicsMap[topic.topics_id] = subtopicsData;
      }
      
      setSubtopicsByTopic(subtopicsMap);
    } catch (error) {
      console.error('Error fetching topics and subtopics:', error);
      toast.error('Failed to load topics and subtopics');
    } finally {
      setLoadingTopics(false);
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

  const filteredLearners = learners.filter(learner => 
    learner.name.toLowerCase().includes(formData.searchTerm.toLowerCase()) ||
    learner.grade.toLowerCase().includes(formData.searchTerm.toLowerCase()) ||
    (learner.class && learner.class.toLowerCase().includes(formData.searchTerm.toLowerCase()))
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(formData.searchTerm.toLowerCase()) ||
    group.grade.toLowerCase().includes(formData.searchTerm.toLowerCase())
  );

  const filteredClasses = classes.filter((cls) =>
  cls.name.toLowerCase().includes(formData.searchTerm.toLowerCase())
);

  const toggleLearner = (learnerId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedLearners: prev.selectedLearners.includes(learnerId)
        ? prev.selectedLearners.filter(id => id !== learnerId)
        : [...prev.selectedLearners, learnerId]
    }));
  };

  const toggleGroup = (groupId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedGroups: prev.selectedGroups.includes(groupId)
        ? prev.selectedGroups.filter(id => id !== groupId)
        : [...prev.selectedGroups, groupId]
    }));
  };

 const toggleClass = (classId) => {
  setFormData(prev => {
    const isSelected = prev.selectedClasses.includes(classId);
    return {
      ...prev,
      selectedClasses: isSelected
        ? prev.selectedClasses.filter(id => id !== classId)
        : [...prev.selectedClasses, classId],
    };
  });
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSubtopics.length === 0) {
      toast.error('Please select at least one subtopic');
      return;
    }

    if (!formData.title) {
      toast.error('Please enter a title for the review');
      return;
    }

    if (!formData.questionCount || formData.questionCount < 1) {
      toast.error('Please enter a valid number of questions');
      return;
    }

    setIsSubmitting(true);
    setGeneratedReview(null);
    setExtractedQuestions([]);
    setReviewId(null);
    
    try {
      // Get the subject name and grade number for the API call
      const subjectObj = subjects.find(s => s.subjects_id.toString() === formData.subject);
      const gradeObj = grades.find(g => g.grades_id.toString() === formData.grade);
      
      if (!subjectObj || !gradeObj) {
        throw new Error('Subject or grade information is missing');
      }
      
      const subjectName = subjectObj.subjects_name;
      const gradeName = gradeObj.grade_name;
    //  const gradeName = `Grade ${gradeObj.grade_no}`;
      
      // Call the service to generate the review
      const { generatedReview, questions } = await generateDailyReview({
        subject: subjectName,
        grade: gradeName,
        title: formData.title,
        description: formData.description,
        questionType: formData.questionType,
        subtopics: selectedSubtopics,
        includeHints: formData.includeHints,
        difficultyLevel: formData.difficultyLevel,
        examStyle: formData.examStyle,
        questionCount: formData.questionCount
      });
      
      // Save the review to the database
      try {
        const savedReviewId = await saveReview({
          title: formData.title,
          description: formData.description,
          questionType: formData.questionType,
          difficultyLevel: formData.difficultyLevel,
          examStyle: formData.examStyle,
          includeHints: formData.includeHints,
          generatedContent: generatedReview,
          questions: questions,
          subtopicIds: selectedSubtopics.map(s => s.id)
        });
        
        setReviewId(savedReviewId);

        if (savedReviewId && questions.length > 0) {
          try {
            await saveReviewQuestions(savedReviewId, questions);
            console.log('✅ Questions saved successfully for review:', savedReviewId);
          } catch (questionError) {
            console.error('❌ Failed to save questions:', questionError);
            toast.error('Review saved but questions could not be saved');
          }
        }
        
        // Create an assessment for the review
        if (savedReviewId) {
          try {
            await createAssessment({
              reviewId: savedReviewId,
              title: formData.title,
              description: formData.description,
              subject: subjectName,
              grade: gradeName,
              startDate: formData.startDate || new Date().toISOString().split('T')[0],
              endDate: formData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              questionCount: questions.length,
              timeLimit: formData.timeLimit,
              targetAudience: formData.targetAudience as 'class' | 'group' | 'individual',
              selectedLearners: formData.selectedLearners,
              selectedGroups: formData.selectedGroups,
              selectedClasses: formData.selectedClasses
            });
            
            toast.success('Review and assessment created successfully');
          } catch (assessmentError) {
            console.error('Error creating assessment:', assessmentError);
            toast.error('Review saved but assessment creation failed');
          }
        }
      } catch (saveError) {
        console.error('Error saving review:', saveError);
        toast.error('Generated review could not be saved to database');
      }
      
      // Display the generated review
      setGeneratedReview(generatedReview);
      setExtractedQuestions(questions);
      toast.success('Daily review generated successfully');
      
    } catch (error) {
      console.error('Error generating daily review:', error);
      toast.error('Failed to generate daily review');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <h1 className="text-2xl font-bold text-white">Create A New Daily Review</h1>
            </div>
            
            <Link 
              to="/teacher/assessments"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Assessments</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {generatedReview ? (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Generated Review</h2>
            <div className="bg-white/5 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
              <pre className="text-white whitespace-pre-wrap">{generatedReview}</pre>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setGeneratedReview(null)}
                className="bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors"
              >
                Back to Form
              </button>
              <button
                onClick={() => {
                  navigate('/reviews/save', {
                    state: {
                      generatedReview,
                      extractedQuestions,
                      title: formData.title,
                      description: formData.description,
                      startDate: formData.startDate || new Date().toISOString().split('T')[0],
                      endDate: formData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      difficultyLevel: formData.difficultyLevel,
                      includeHints: formData.includeHints,
                      subtopicIds: selectedSubtopics.map(s => s.id),
                      reviewId: reviewId
                    }
                  });
                }}
                className="bg-emerald-600/80 text-white px-6 py-3 rounded-lg hover:bg-emerald-500 transition-colors"
              >
                Edit & Save Review
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  placeholder="Enter review title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Subject
                </label>
                <select
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                >
                  {subjects.map(subject => (
                    <option key={subject.subjects_id} value={subject.subjects_id} className="bg-gray-900">
                      {subject.subjects_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Grade
                </label>
                <select
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  required
                >
                  {grades.map(grade => (
                    <option key={grade.grades_id} value={grade.grades_id} className="bg-gray-900">
                       {grade.grade_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Selection Dropdown */}
              {periods.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Period
                  </label>
                  <select
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                    value={formData.selectedPeriod}
                    onChange={(e) => setFormData({ ...formData, selectedPeriod: e.target.value })}
                    required
                  >
                    <option value="" className="bg-gray-900">Select a period</option>
                    {periods.map(period => (
                      <option key={period.period_id} value={period.period_id} className="bg-gray-900">
                        {period.period_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Topics and Subtopics Selection */}
              {formData.selectedPeriod && topics.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Select Topics & Subtopics
                  </label>
                  <div className="space-y-3 max-h-60 overflow-y-auto bg-white/5 rounded-lg p-4">
                    {loadingTopics ? (
                      <div className="text-center text-gray-400 py-4">Loading topics and subtopics...</div>
                    ) : (
                      topics.map((topic) => (
                        <div key={topic.topics_id} className="bg-white/5 rounded-lg">
                          <button
                            type="button"
                            onClick={() => toggleTopic(topic.topics_id)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 text-left"
                          >
                            <span className="text-white">{topic.topic}</span>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
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
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Selected Subtopics */}
              {selectedSubtopics.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Selected Subtopics ({selectedSubtopics.length})
                  </label>
                  <div className="bg-white/5 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {selectedSubtopics.map((subtopic) => (
                        <div key={subtopic.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-white">{subtopic.title}</p>
                            <p className="text-sm text-gray-400">{subtopic.topicTitle}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSubtopicSelection(
                              { subtopic_id: subtopic.id, subtopic_title: subtopic.title, topic_id: subtopic.topicId },
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

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description/Notes
                </label>
                <textarea
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  rows={4}
                  placeholder="Enter description or notes for this review"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Questions/Tasks Type
                </label>
                <select
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  value={formData.questionType}
                  onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                  required
                >
                  {questionTypes.map(type => (
                    <option key={type} value={type} className="bg-gray-900">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Difficulty Level
                </label>
                <select
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  value={formData.difficultyLevel}
                  onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                  required
                >
                  {difficultyLevels.map(level => (
                    <option key={level} value={level} className="bg-gray-900">
                      {level}
                    </option>
                  ))}
                </select>
              </div>
  
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Exam Style
                </label>
                <select
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  value={formData.examStyle}
                  onChange={(e) => setFormData({ ...formData, examStyle: e.target.value })}
                >
                  <option value="">Select Exam Style</option>
                  {examStyles.map((style, index) => (
                    <option key={index} value={style} className="bg-gray-900">
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                  placeholder="Enter the number of questions"
                  value={formData.questionCount}
                  onChange={(e) => setFormData({ ...formData, questionCount: parseInt(e.target.value) || 5 })}
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeHints"
                  checked={formData.includeHints}
                  onChange={(e) => setFormData({ ...formData, includeHints: e.target.checked })}
                  className="h-4 w-4 rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50 mr-2"
                />
                <label 
                  htmlFor="includeHints"
                  className="text-white cursor-pointer"
                >
                  Include hints for questions
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">
                    Time Limit
                  </label>
                  <input
                    type="time"
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                    required
                  />
                </div>
              </div>
               <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Target Audience
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="targetAudience"
                      value="class"
                      checked={formData.targetAudience === 'class'}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      className="text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-white">Class</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="targetAudience"
                      value="group"
                      checked={formData.targetAudience === 'group'}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      className="text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-white">Group</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="targetAudience"
                      value="individual"
                      checked={formData.targetAudience === 'individual'}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      className="text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-white">Individual</span>
                  </label>
                </div>

                {['group', 'individual', 'class'].includes(formData.targetAudience)  && (
                  <div className="mt-4 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                   //     placeholder={`Search ${formData.targetAudience === 'group' ? 'groups' : 'learners'}...`}
                        placeholder={`Search ${
  formData.targetAudience === 'group'
    ? 'groups'
    : formData.targetAudience === 'class'
    ? 'classes'
    : 'learners'
}...`}
                        value={formData.searchTerm}
                        onChange={(e) => setFormData({ ...formData, searchTerm: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto bg-white/5 rounded-lg">
                      {formData.targetAudience === 'individual' ? (
  filteredLearners.length > 0 ? (
    filteredLearners.map(learner => (
                            <label
                              key={learner.id}
                              className="flex items-center space-x-3 p-3 hover:bg-white/5 cursor-pointer border-b border-white/10 last:border-0"
                            >
                              <input
                                type="checkbox"
                                checked={formData.selectedLearners.includes(learner.id)}
                                onChange={() => toggleLearner(learner.id)}
                                className="text-emerald-500 focus:ring-emerald-500"
                              />
                              <div>
                                <p className="text-white">{learner.name}</p>
                                <p className="text-sm text-gray-400">{learner.grade} {learner.class ? `- ${learner.class}` : ''}</p>
                              </div>
                            </label>
                          ))
  ) : (
    <div className="p-4 text-center text-gray-400">
      No learners found for the selected grade
    </div>
  )
) : formData.targetAudience === 'group' ? (
  filteredGroups.length > 0 ? (
    filteredGroups.map(group => (
                          <label
                            key={group.id}
                            className="flex items-center space-x-3 p-3 hover:bg-white/5 cursor-pointer border-b border-white/10 last:border-0"
                          >
                            <input
                              type="checkbox"
                              checked={formData.selectedGroups.includes(group.id)}
                              onChange={() => toggleGroup(group.id)}
                              className="text-emerald-500 focus:ring-emerald-500"
                            />
                            <div>
                              <p className="text-white">{group.name}</p>
                              <p className="text-sm text-gray-400">{group.grade} - {group.members} members</p>
                            </div>
                          </label>
                        ))
  ) : (
    <div className="p-4 text-center text-gray-400">
      No groups found
    </div>
  )
) : formData.targetAudience === 'class' ? (
  filteredClasses.length > 0 ? (
    filteredClasses.map((cls) => (
      <label
        key={cls.id}
        className="flex items-center space-x-3 p-3 hover:bg-white/5 cursor-pointer border-b border-white/10 last:border-0"
      >
        <input
          type="checkbox"
          checked={formData.selectedClasses.includes(cls.id)}
          onChange={() => toggleClass(cls.id)}
          className="text-emerald-500 focus:ring-emerald-500"
        />
        <div>
          <p className="text-white">{cls.name}</p>
          <p className="text-sm text-gray-400">
            {cls.grade} {cls.stream ? `- Stream ${cls.stream}` : ''}
          </p>
        </div>
      </label>
    ))
  ) : (
    <div className="p-4 text-center text-gray-400">No classes found</div>
  )
) : null}

        
                    </div>

                    <p className="text-sm text-gray-400">
  {formData.targetAudience === 'individual'
    ? `Selected ${formData.selectedLearners.length} learners`
    : formData.targetAudience === 'group'
    ? `Selected ${formData.selectedGroups.length} groups`
    : `Selected ${formData.selectedClasses.length} classes`}
</p>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full bg-emerald-600/80 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-500 transition-all duration-300"
                  disabled={selectedSubtopics.length === 0 || isSubmitting}
                >
                  {isSubmitting ? 'Generating Review...' : 'Generate Daily Review'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

             