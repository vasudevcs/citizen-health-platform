import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyOtp from '../pages/auth/VerifyOtp';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

import CitizenLayout from '../layouts/CitizenLayout';
import DoctorLayout from '../layouts/DoctorLayout';
import AmbassadorLayout from '../layouts/AmbassadorLayout';
import ResearcherLayout from '../layouts/ResearcherLayout';
import AdminLayout from '../layouts/AdminLayout';

import RootRedirect from '../pages/RootRedirect';
import StatusPage from '../pages/StatusPage';
import CitizenDashboard from '../pages/citizen/Dashboard';
import PHR from '../pages/citizen/PHR';
import Analytics from '../pages/citizen/Analytics';
import RiskAssessment from '../pages/citizen/RiskAssessment';
import Telemedicine from '../pages/citizen/Telemedicine';
import MentalWellbeing from '../pages/citizen/MentalWellbeing';
import Community from '../pages/citizen/Community';
import CommunityPostDetail from '../pages/citizen/CommunityPostDetail';
import Education from '../pages/citizen/Education';
import EducationContentDetail from '../pages/citizen/EducationContentDetail';
import Settings from '../pages/citizen/Settings';
import DoctorDashboard from '../pages/doctor/Dashboard';
import DoctorAppointments from '../pages/doctor/Appointments';
import DoctorPatients from '../pages/doctor/Patients';
import DoctorPatientProfile from '../pages/doctor/PatientProfile';
import DoctorPrescriptions from '../pages/doctor/Prescriptions';
import DoctorAvailability from '../pages/doctor/Availability';
import AmbassadorDashboard from '../pages/ambassador/Dashboard';
import AmbassadorCitizens from '../pages/ambassador/Citizens';
import AmbassadorNotes from '../pages/ambassador/Notes';
import AmbassadorActivity from '../pages/ambassador/Activity';
import ResearcherDashboard from '../pages/research/Dashboard';
import PopulationAnalytics from '../pages/research/PopulationAnalytics';
import ReportsInsights from '../pages/research/ReportsInsights';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminModeration from '../pages/admin/Moderation';
import AdminAnalytics from '../pages/admin/Analytics';

export default function AppRoutes() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/403" element={<StatusPage code="403" />} />

            {/* Citizen */}
            <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
              <Route element={<CitizenLayout />}>
                <Route path="/dashboard" element={<CitizenDashboard />} />
                <Route path="/phr" element={<PHR />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/risk-assessment" element={<RiskAssessment />} />
                <Route path="/telemedicine" element={<Telemedicine />} />
                <Route path="/mental-wellbeing" element={<MentalWellbeing />} />
                <Route path="/community" element={<Community />} />
                <Route path="/community/:id" element={<CommunityPostDetail />} />
                <Route path="/education" element={<Education />} />
                <Route path="/education/:id" element={<EducationContentDetail />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Doctor */}
            <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
              <Route element={<DoctorLayout />}>
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="/doctor/appointments" element={<DoctorAppointments />} />
                <Route path="/doctor/patients" element={<DoctorPatients />} />
                <Route path="/doctor/patients/:citizenId" element={<DoctorPatientProfile />} />
                <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
                <Route path="/doctor/availability" element={<DoctorAvailability />} />
                <Route path="/doctor/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Health Ambassador */}
            <Route element={<ProtectedRoute allowedRoles={['ambassador']} />}>
              <Route element={<AmbassadorLayout />}>
                <Route path="/ambassador/dashboard" element={<AmbassadorDashboard />} />
                <Route path="/ambassador/citizens" element={<AmbassadorCitizens />} />
                <Route path="/ambassador/notes" element={<AmbassadorNotes />} />
                <Route path="/ambassador/notes/:citizenId" element={<AmbassadorNotes />} />
                <Route path="/ambassador/activity" element={<AmbassadorActivity />} />
                <Route path="/ambassador/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Researcher */}
            <Route element={<ProtectedRoute allowedRoles={['researcher']} />}>
              <Route element={<ResearcherLayout />}>
                <Route path="/research/dashboard" element={<ResearcherDashboard />} />
                <Route path="/research/analytics" element={<PopulationAnalytics />} />
                <Route path="/research/reports" element={<ReportsInsights />} />
                <Route path="/research/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Administrator */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/moderation" element={<AdminModeration />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Catch-all — unmatched paths */}
            <Route path="*" element={<StatusPage code="404" />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
