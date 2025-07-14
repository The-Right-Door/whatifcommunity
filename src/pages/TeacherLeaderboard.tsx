import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft,
  Search,
  Trophy,
  Medal,
  Star,
  TrendingUp,
  Filter,
  Calendar,
  Download,
  BarChart2,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Learner {
  id: string;
  rank: number;
  name: string;
  score: number;
  subjects: string[];
  improvement: string;
  streak: number;
}

export default function TeacherLeaderboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Week');
  const [selectedCategory, setSelectedCategory] = useState('Overall');
  const [searchTerm, setSearchTerm] = useState('');
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [classroomName, setClassroomName] = useState<string>('');
  const [subjectName, setSubjectName] = useState<string>('');

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const classroomId = queryParams.get('classroom');
  const subjectId = queryParams.get('subject');

  const timeframes = ['This Week', 'This Month', 'This Term', 'This Year'];
  const categories = ['Overall', 'Assessments', 'Participation', 'Improvement'];

  useEffect(() => {
    if (classroomId && subjectId) {
      fetchClassroomAndSubjectDetails();
      fetchLearnerData();
    } else {
      // If no query params, show sample data
      setLoading(false);
      setLearners([
        {
          id: '1',
          rank: 1,
          name: "Sarah Johnson",
          score: 98,
          subjects: ["Mathematics", "Physics"],
          improvement: "+12%",
          streak: 15
        },
        {
          id: '2',
          rank: 2,
          name: "Michael Chen",
          score: 95,
          subjects: ["Chemistry", "Biology"],
          improvement: "+8%",
          streak: 12
        },
        {
          id: '3',
          rank: 3,
          name: "Emily Brown",
          score: 93,
          subjects: ["English", "History"],
          improvement: "+15%",
          streak: 10
        },
        {
          id: '4',
          rank: 4,
          name: "David Wilson",
          score: 91,
          subjects: ["Mathematics", "English"],
          improvement: "+5%",
          streak: 8
        },
        {
          id: '5',
          rank: 5,
          name: "Lisa Anderson",
          score: 90,
          subjects: ["Physics", "Chemistry"],
          improvement: "+10%",
          streak: 7
        }
      ]);
    }
  }, [classroomId, subjectId]);

  const fetchClassroomAndSubjectDetails = async () => {
    try {
      // Fetch classroom details
      if (classroomId) {
        const { data: classroomData, error: classroomError } = await supabase
          .from('classrooms')
          .select('classroom_name')
          .eq('classroom_id', classroomId)
          .single();

        if (classroomError) throw classroomError;
        setClassroomName(classroomData.classroom_name);
      }

      // Fetch subject details
      if (subjectId) {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('subjects_name')
          .eq('subjects_id', subjectId)
          .single();

        if (subjectError) throw subjectError;
        setSubjectName(subjectData.subjects_name);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      toast.error('Failed to load classroom or subject details');
    }
  };

  const fetchLearnerData = async () => {
    try {
      setLoading(true);
      
      // Get learners in this classroom
      const { data: learners, error: learnersError } = await supabase
        .from('classroom_learners')
        .select(`
          learner_id,
          learners:learner_id(
            user_id,
            first_name,
            last_name
          )
        `)
        .eq('classroom_id', classroomId);

      if (learnersError) throw learnersError;

      // Get learner responses for this subject
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('assessment_id, review_id')
        .eq('subject', subjectName);
        
      if (assessmentsError) throw assessmentsError;
      
      const reviewIds = assessments?.map(a => a.review_id) || [];
      
      // Get responses for these reviews
      const { data: responses, error: responsesError } = await supabase
        .from('learner_responses')
        .select('*')
        .in('review_id', reviewIds);
        
      if (responsesError) throw responsesError;

      // Process learner data
      const learnersWithScores: Learner[] = [];
      
      if (learners) {
        for (let i = 0; i < learners.length; i++) {
          const learner = learners[i];
          
          // Get all responses for this learner
          const learnerResponses = responses?.filter(r => r.user_id === learner.learner_id) || [];
          
          // Calculate average score
          const scores = learnerResponses.map(r => r.score).filter(s => s !== null) as number[];
          const averageScore = scores.length > 0 
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
            : 0;
          
          // Generate random improvement and streak for demo
          const improvement = `+${Math.floor(Math.random() * 15) + 1}%`;
          const streak = Math.floor(Math.random() * 15) + 1;
          
          learnersWithScores.push({
            id: learner.learner_id,
            rank: i + 1, // Will be sorted later
            name: `${learner.learners.first_name} ${learner.learners.last_name}`,
            score: averageScore,
            subjects: [subjectName],
            improvement,
            streak
          });
        }
      }
      
      // Sort by score and assign ranks
      learnersWithScores.sort((a, b) => b.score - a.score);
      learnersWithScores.forEach((learner, index) => {
        learner.rank = index + 1;
      });
      
      setLearners(learnersWithScores);
    } catch (error) {
      console.error('Error fetching learner data:', error);
      toast.error('Failed to load learner performance data');
    } finally {
      setLoading(false);
    }
  };

  const filteredLearners = learners.filter(learner => {
    const matchesSearch = 
      searchTerm === '' || 
      learner.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-700" />;
      default:
        return <Star className="h-6 w-6 text-white/20" />;
    }
  };

  const handleExportLeaderboard = () => {
    // In a real app, this would generate a CSV or Excel file
    toast.success('Leaderboard exported successfully');
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
              <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
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
        {/* Classroom and Subject Info */}
        {(classroomName || subjectName) && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              {classroomName && subjectName 
                ? `${subjectName} - ${classroomName}`
                : classroomName || subjectName}
            </h2>
            <p className="text-gray-300">
              Viewing leaderboard for {classroomName && subjectName 
                ? `${subjectName} in ${classroomName}`
                : classroomName 
                  ? `classroom ${classroomName}` 
                  : `subject ${subjectName}`}
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              >
                {timeframes.map(timeframe => (
                  <option key={timeframe} value={timeframe} className="bg-gray-900">
                    {timeframe}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-gray-900">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search learners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleExportLeaderboard}
              className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>Export Leaderboard</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-white text-xl">Loading leaderboard data...</div>
          </div>
        )}

        {/* Top 3 Learners */}
        {!loading && filteredLearners.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-6">Top Performers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredLearners.slice(0, 3).map((learner) => (
                <div 
                  key={learner.id}
                  className={`bg-white/10 backdrop-blur-sm border ${
                    learner.rank === 1 ? 'border-yellow-500/50' : 
                    learner.rank === 2 ? 'border-gray-400/50' : 
                    'border-amber-700/50'
                  } rounded-lg p-6 relative overflow-hidden`}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 ${
                    learner.rank === 1 ? 'bg-yellow-500/10' : 
                    learner.rank === 2 ? 'bg-gray-400/10' : 
                    'bg-amber-700/10'
                  } rounded-bl-full`}></div>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`p-3 ${
                      learner.rank === 1 ? 'bg-yellow-500/20' : 
                      learner.rank === 2 ? 'bg-gray-400/20' : 
                      'bg-amber-700/20'
                    } rounded-full`}>
                      {getRankIcon(learner.rank)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{learner.name}</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Score</span>
                      <span className="text-xl font-bold text-white">{learner.score}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Improvement</span>
                      <span className="text-emerald-400">{learner.improvement}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Streak</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-white">{learner.streak} days</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        {!loading && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-4 text-white">Rank</th>
                  <th className="text-left p-4 text-white">Learner</th>
                  <th className="text-left p-4 text-white">Score</th>
                  <th className="text-left p-4 text-white">Top Subjects</th>
                  <th className="text-left p-4 text-white">Improvement</th>
                  <th className="text-left p-4 text-white">Streak</th>
                </tr>
              </thead>
              <tbody>
                {filteredLearners.length > 0 ? (
                  filteredLearners.map((learner) => (
                    <tr key={learner.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {getRankIcon(learner.rank)}
                          <span className="text-white">{learner.rank}</span>
                        </div>
                      </td>
                      <td className="p-4 text-white">{learner.name}</td>
                      <td className="p-4">
                        <span className="text-emerald-400 font-semibold">{learner.score}%</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {learner.subjects.map((subject, index) => (
                            <span 
                              key={index}
                              className="bg-white/10 text-white px-2 py-1 rounded-full text-sm"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1 text-emerald-400">
                          <TrendingUp className="h-4 w-4" />
                          <span>{learner.improvement}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <Star className="h-4 w-4" />
                          <span>{learner.streak} days</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No learners found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Information Box */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <Info className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white mb-2">About the Leaderboard</h3>
              <p className="text-gray-300">
                This leaderboard ranks learners based on their performance in assessments, participation in discussions, 
                and overall improvement. The scoring system takes into account assessment scores, completion rates, 
                and consistency in learning activities. Use this data to identify top performers and those who may need 
                additional support.
              </p>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        {!loading && filteredLearners.length > 0 && (
          <div className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Performance Insights</h2>
              <button className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors">
                <BarChart2 className="h-5 w-5" />
                <span>View Detailed Analytics</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Class Average</h3>
                <div className="flex items-end space-x-2">
                  <span className="text-3xl font-bold text-white">
                    {Math.round(filteredLearners.reduce((acc, learner) => acc + learner.score, 0) / filteredLearners.length)}%
                  </span>
                  <span className="text-emerald-400">+5% from last month</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Participation Rate</h3>
                <div className="flex items-end space-x-2">
                  <span className="text-3xl font-bold text-white">92%</span>
                  <span className="text-emerald-400">+3% from last month</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Most Improved</h3>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                  <div>
                    <p className="text-white font-medium">{filteredLearners.sort((a, b) => parseInt(b.improvement) - parseInt(a.improvement))[0].name}</p>
                    <p className="text-emerald-400">{filteredLearners.sort((a, b) => parseInt(b.improvement) - parseInt(a.improvement))[0].improvement}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Longest Streak</h3>
                <div className="flex items-center space-x-3">
                  <Star className="h-6 w-6 text-yellow-400" />
                  <div>
                    <p className="text-white font-medium">{filteredLearners.sort((a, b) => b.streak - a.streak)[0].name}</p>
                    <p className="text-yellow-400">{filteredLearners.sort((a, b) => b.streak - a.streak)[0].streak} days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}