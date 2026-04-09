// src/routes.jsx
// Centralized route configuration — single source of truth for all app routes.
// All pages are PUBLIC — auth is handled contextually inside components.

import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

// Pages
import LandingPage from './pages/LandingPage'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import LessonDetailPage from './pages/LessonDetailPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import NotFoundPage from './pages/NotFoundPage'
import AboutPage from './pages/AboutPage'
import ProfilePage from './pages/ProfilePage'
import DashboardPage from './pages/DashboardPage'

const pageVariants = {
  initial: { opacity: 0, y: 15, scale: 0.98 },
  enter: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
}

const PageWrapper = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="enter"
    exit="exit"
    style={{ minHeight: '100%', width: '100%' }}
  >
    {children}
  </motion.div>
)

export default function AppRoutes() {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"                     element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/dashboard"            element={<PageWrapper><DashboardPage /></PageWrapper>} />
        <Route path="/courses"              element={<PageWrapper><CoursesPage /></PageWrapper>} />
        <Route path="/courses/:courseId"    element={<PageWrapper><CourseDetailPage /></PageWrapper>} />
        <Route path="/lessons/:lessonId"    element={<PageWrapper><LessonDetailPage /></PageWrapper>} />
        <Route path="/about"                element={<PageWrapper><AboutPage /></PageWrapper>} />
        <Route path="/profile"              element={<PageWrapper><ProfilePage /></PageWrapper>} />
        <Route path="/login"                element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/signup"               element={<PageWrapper><SignupPage /></PageWrapper>} />
        <Route path="*"                     element={<PageWrapper><NotFoundPage /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  )
}
