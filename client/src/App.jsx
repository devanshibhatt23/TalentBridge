import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

import { AppLayout } from './components/AppLayout.jsx'
import { GuestRoute } from './components/GuestRoute.jsx'
import { HomeRedirect } from './components/HomeRedirect.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { Landing } from './pages/Landing.jsx'
import { Features } from './pages/Features.jsx'
import { Login } from './pages/Login.jsx'
import { Register } from './pages/Register.jsx'
import { CandidateDashboard } from './pages/CandidateDashboard.jsx'
import { RecruiterDashboard } from './pages/RecruiterDashboard.jsx'
import { Jobs } from './pages/Jobs.jsx'
import { JobDetail } from './pages/JobDetail.jsx'
import { CreateJob } from './pages/CreateJob.jsx'
import { MyApplications } from './pages/MyApplications.jsx'
import { Candidates } from './pages/Candidates.jsx'
import { CandidateProfile } from './pages/CandidateProfile.jsx'
import { Profile } from './pages/Profile.jsx'
import { Messages } from './pages/Messages.jsx'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Landing />} />
        <Route path="/features" element={<Features />} />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <JobDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs/new"
          element={
            <ProtectedRoute roles={['recruiter']}>
              <CreateJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate-dashboard"
          element={
            <ProtectedRoute roles={['candidate']}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter-dashboard"
          element={
            <ProtectedRoute roles={['recruiter']}>
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-applications"
          element={
            <ProtectedRoute roles={['candidate']}>
              <MyApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidates"
          element={
            <ProtectedRoute roles={['recruiter']}>
              <Candidates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidates/:id"
          element={
            <ProtectedRoute roles={['recruiter']}>
              <CandidateProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
