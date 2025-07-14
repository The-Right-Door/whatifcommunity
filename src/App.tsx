import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ChevronDown } from 'lucide-react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SignupConfirmation from './pages/SignupConfirmation';
import CompleteRegistration from './pages/CompleteRegistration';
import SelectStream from './pages/SelectStream';
import SelectSkill from './pages/SelectSkill';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import AddTopic from './pages/AddTopic';
import AddSubtopic from './pages/AddSubtopic';
import MaintainTopic from './pages/MaintainTopic';
import ViewSubtopic from './pages/ViewSubtopic';
import EditSubtopic from './pages/EditSubtopic';
import ManageSubtopicResources from './pages/ManageSubtopicResources';
import CreateReview from './pages/CreateReview';
import Classes from './pages/Classes';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherAssessments from './pages/TeacherAssessments';
import TeacherDailyReview from './pages/TeacherDailyReview';
import TeacherLearners from './pages/TeacherLearners';
import TeacherSubmissions from './pages/TeacherSubmissions';
import TeacherLeaderboard from './pages/TeacherLeaderboard';
import TeacherTimetable from './pages/TeacherTimetable';
import Navbar from './components/Navbar';
import LearnerDashboard from './pages/LearnerDashboard';
import { UserProvider } from './contexts/UserContext';
import EditReview from './pages/EditReview';
import SpecialManagement from './pages/SpecialManagement';
import ManageClasses from './pages/AllocateClasses';
import ManageCurriculum from './pages/ManageCurriculum';
import ManageResources from './pages/ManageResources';
import AllGeneratedAssessments from './pages/AllGeneratedAssessments.tsx';
import SentAssessments from './pages/SentAssessments';
import ScheduledAssessments from './pages/ScheduledAssessments';
import AssessmentReminders from './pages/AssessmentReminders';
import LearnerAssessments from './pages/LearnerAssessments';
import LearnerAssessmentsInProgress from './pages/LearnerAssessmentsInProgress';
import LearnerAssessmentsUpcoming from './pages/LearnerAssessmentsUpcoming';
import AssessmentScopeAndTips from './pages/AssessmentScopeAndTips';
import LearnerAssessmentsMissed from './pages/LearnerAssessmentsMissed';
import LearnerAssessmentsPast from './pages/LearnerAssessmentsPast';
import LearnerAssessmentAttempt from './pages/LearnerAssessmentAttempt';
import LearnerAssessmentResults from './pages/LearnerAssessmentResults';
import AllocateTeachers from './pages/AllocateTeachers';
import AllocationRules from './pages/AllocationRules';
import TimetableSetup from './pages/TimetableSetup';
import TimetableManagementGrid from './pages/TimetableManagementGrid';
import StartLearning from './pages/StartLearning';
import AskForHelp from './pages/AskForHelp';
import CommunitySupport from './pages/CommunitySupport';
import DiscussionPage from './pages/DiscussionPage';
import RequestClass from './pages/RequestClass';
import TeacherClassRequests from './pages/TeacherClassRequests';

import ManageDiscussionForums from './pages/ManageDiscussionForums';
import CreateDiscussionForum from './pages/CreateDiscussionForum';
import CoreConcepts from './pages/CoreConcepts';
import ExamWatchList from './pages/ExamWatchList';
import LessonPlan from './pages/LessonPlan';
import AssessmentsGenerated from './pages/AssessmentsGenerated';
import ResetPassword from './pages/ResetPassword';
import Payment from './pages/Payment';


function App() {
  return (
  <UserProvider>
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Authentication and Registration */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup-confirmation" element={<SignupConfirmation />} />
        <Route path="/complete-registration" element={<CompleteRegistration />} />
        <Route path="/select-stream" element={<SelectStream />} />
        <Route path="/select-skill" element={<SelectSkill />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Subjects */}
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/subjects/:subject/:grade" element={<SubjectDetail />} />
        <Route path="/add-topic" element={<AddTopic />} />
        <Route path="/add-subtopics" element={<AddSubtopic />} />
        <Route path="/topics/:topicId/maintain" element={<MaintainTopic />} />
        <Route path="/subtopics/:subtopicId" element={<ViewSubtopic />} />
        <Route path="/subtopics/:subtopicId/edit" element={<EditSubtopic />} />
        <Route path="/subtopics/:subtopicId/resources" element={<ManageSubtopicResources />} />
        <Route path="/create-review" element={<CreateReview />} />
        <Route path="/ask-for-help/:subtopicId" element={<AskForHelp />} />
        <Route path="/community-support" element={<CommunitySupport />} />
        <Route path="/discussion/:requestId" element={<DiscussionPage />} />
        <Route path="/request-class" element={<RequestClass />} />
        
        {/* Learning Guides Routes */}
        <Route path="/subjects/:subject/:grade/core-concepts" element={<CoreConcepts />} />
        <Route path="/subjects/:subject/:grade/exam-watch-list" element={<ExamWatchList />} />
        <Route path="/subjects/:subject/:grade/lesson-plan" element={<LessonPlan />} />
        <Route path="/subjects/:subject/:grade/assessments-generated" element={<AssessmentsGenerated />} />
        
        {/* Teacher Routes */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/class-requests" element={<TeacherClassRequests />} />
        <Route path="/teacher/assessments" element={<TeacherAssessments />} />
        <Route path="/teacher/daily-review" element={<TeacherDailyReview />} />
        <Route path="/teacher/learners" element={<TeacherLearners />} />
        <Route path="/teacher/submissions" element={<TeacherSubmissions />} />
        <Route path="/teacher/leaderboard" element={<TeacherLeaderboard />} />
        <Route path="/teacher/timetable" element={<TeacherTimetable />} />
        <Route path="/reviews/edit/:reviewId" element={<EditReview />} />
        <Route path="/reviews/save" element={<EditReview />} />
        <Route path="teacher/all-generated-assessments" element={<AllGeneratedAssessments />} />
        <Route path="/teacher/sent-assessments" element={<SentAssessments />} />
        <Route path="/teacher/scheduled-assessments" element={<ScheduledAssessments />} />
        <Route path="/teacher/assessment-reminders" element={<AssessmentReminders />} />
        {/* Special Management Routes */}
        <Route path="/special/management" element={<SpecialManagement />} />
        <Route path="/special/allocate-classes" element={<ManageClasses />} />
        <Route path="/special/class-owners" element={<ManageCurriculum />} />
        <Route path="/special/manage-classes" element={<ManageResources />} />
        <Route path="/allocate-teachers" element={<AllocateTeachers />} />
        <Route path="/allocation-rules" element={<AllocationRules />} />
        <Route path="/generate-timetable" element={<TimetableSetup />} />
        <Route path="/timetable-management-grid" element={<TimetableManagementGrid />} />
        <Route path="/manage-discussion-forums" element={<ManageDiscussionForums />} />
        <Route path="/create-discussion-forum" element={<CreateDiscussionForum />} />

        {/* Classes */}
        <Route path="/classes" element={<Classes />} />

        {/* Learner Dashboard */}
        <Route path="/learner/dashboard" element={<LearnerDashboard />} />
        <Route path="/learner/assessments" element={<LearnerAssessments />} />
        <Route path="/learner/assessments/in-progress" element={<LearnerAssessmentsInProgress />} />
        <Route path="/learner/assessments/upcoming" element={<LearnerAssessmentsUpcoming />} />
        <Route path="/learner/assessments/scope-tips/:assessmentId" element={<AssessmentScopeAndTips />} />
        <Route path="/learner/assessments/scope-tips/:assessmentId" element={<AssessmentScopeAndTips />} />
        <Route path="/learner/assessments/completed" element={<LearnerAssessmentsPast />} />
        <Route path="/learner/assessments/missed" element={<LearnerAssessmentsMissed />} />
        
        <Route path="/learner/assessments/attempt/:assessmentId" element={<LearnerAssessmentAttempt />} />
        <Route path="/learner/assessments/results/:assessmentId" element={<LearnerAssessmentResults />} />
        
     {/* Learning Routes */}
    <Route path="/start-learning/:subjectId" element={<StartLearning />}/>

        {/*payment */}
        <Route path="/payment" element={<Payment/>}/>

        {/* Landing Page */}
        <Route path="/" element={
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

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-white px-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                What If You Were Never Alone<br />On Your Journey?
              </h1>
              <p className="text-xl md:text-2xl text-center max-w-2xl mb-4 text-gray-200">
                But Surrounded by a vibrant community of mentors and fellow scholars.
              </p>
              <p className="text-xl md:text-2xl text-center max-w-2xl mb-4 text-gray-200">
                What If community is all about that!
              </p>
              <div className="flex space-x-4">
                <Link
                  to="/signup"
                  className="bg-emerald-600/80 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-emerald-500 transition-all duration-300"
                >
                  Join the Community
                </Link>
                <Link
                  to="/login"
                  className="bg-emerald-600/80 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-emerald-500 transition-all duration-300"
                >
                  Login
                </Link>
              </div>

              {/* Scroll Indicator */}
              <div className="absolute bottom-8 animate-bounce">
                <ChevronDown size={32} className="text-white opacity-80" />
              </div>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  </UserProvider>
  );
}

export default App;