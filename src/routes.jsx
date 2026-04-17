// src/routes.jsx
// Clean route map — two zones, no legacy bloat.

import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Suspense, lazy } from 'react'
import PageSkeleton from './components/ui/PageSkeleton'
import AdminProtectedRoute from './components/auth/AdminProtectedRoute'

// ── Public pages ──────────────────────────────────────
const LandingPage = lazy(() => import('./pages/LandingPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// ── Auth-zone pages ───────────────────────────────────
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const LessonDetailPage = lazy(() => import('./pages/LessonDetailPage'))
const ShopPage = lazy(() => import('./pages/ShopPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const QuizPage = lazy(() => import('./pages/QuizPage'))
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'))
const QuizzesHubPage = lazy(() => import('./pages/QuizzesHubPage'))

// ── Admin pages ───────────────────────────────────────
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminContent = lazy(() => import('./pages/admin/AdminContent'))
const AdminGeneralQuizzes = lazy(() => import('./pages/admin/AdminGeneralQuizzes'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'))
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'))

// ── Page transition ───────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 14 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
}

const PW = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit" style={{ width: '100%' }}>
    {children}
  </motion.div>
)

export default function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageSkeleton />}>
        <Routes location={location} key={location.pathname}>

          {/* ── Public ── */}
          <Route path="/" element={<PW><LandingPage /></PW>} />
          <Route path="/about" element={<PW><AboutPage /></PW>} />
          <Route path="/login" element={<PW><LoginPage /></PW>} />
          <Route path="/signup" element={<PW><SignupPage /></PW>} />

          {/* ── Auth zone ── */}
          <Route path="/dashboard" element={<PW><DashboardPage /></PW>} />
          <Route path="/courses/:courseId" element={<PW><CourseDetailPage /></PW>} />
          <Route path="/lessons/:lessonId" element={<PW><LessonDetailPage /></PW>} />
          <Route path="/shop" element={<PW><ShopPage /></PW>} />
          <Route path="/profile" element={<PW><ProfilePage /></PW>} />
          <Route path="/leaderboard" element={<PW><LeaderboardPage /></PW>} />
          <Route path="/quizzes" element={<PW><QuizzesHubPage /></PW>} />
          <Route path="/quiz/:lessonId" element={<PW><QuizPage /></PW>} />

          {/* ── Admin ── */}
          <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="general-quizzes" element={<AdminGeneralQuizzes />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="notifications" element={<AdminNotifications />} />
          </Route>

          {/* ── 404 ── */}
          <Route path="*" element={<PW><NotFoundPage /></PW>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}
