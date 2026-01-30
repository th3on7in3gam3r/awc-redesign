import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import MainLayout from './src/layouts/MainLayout';
import { MemberLayout } from './src/layouts/MemberLayout';
import { StaffLayout } from './src/layouts/StaffLayout';
import { RoleGate } from './src/components/auth/RoleGate';

// Public Pages
import Home from './src/pages/public/Home';
import About from './src/pages/public/About';
import Ministries from './src/pages/public/Ministries';
import Sermons from './src/pages/public/Sermons';
import Community from './src/pages/public/Community';
import Events from './src/pages/public/Events';
import Connect from './src/pages/public/Connect';
import Visit from './src/pages/public/Visit';

// Auth Pages
import { MemberLogin } from './src/pages/auth/MemberLogin';
import { StaffLogin } from './src/pages/auth/StaffLogin';
import { ChoosePortal } from './src/pages/auth/ChoosePortal';

// Member Pages
import { DashboardHome } from './src/pages/admin/DashboardHome';
import { ProfileHub } from './src/pages/ProfileHub';
import { CheckIn } from './src/pages/member/CheckIn';
import { CheckInScreen } from './src/pages/member/CheckInScreen';
import { SermonArchive } from './src/pages/member/SermonArchive';
import { GivingPage } from '@/src/pages/member/GivingPage';
import { KidsCheckin } from './src/pages/member/KidsCheckin';

// Staff Pages
import { PeopleDirectory } from './src/pages/admin/PeopleDirectory';
import { AdminEvents } from './src/pages/admin/AdminEvents';
import { AuditLogPage } from './src/pages/admin/AuditLogPage';
import { ProgramsRoster } from './src/pages/admin/ProgramsRoster';
import { HouseholdsPage } from './src/pages/staff/HouseholdsPage';
import { HouseholdDetailPage } from './src/pages/staff/HouseholdDetailPage';
import { StaffCalendar } from './src/pages/staff/StaffCalendar';
import { StaffSettings } from './src/pages/staff/StaffSettings';
import { MinistriesPage } from './src/pages/staff/MinistriesPage';
import { MinistryDetailPage } from './src/pages/staff/MinistryDetailPage';
import FinancePage from './src/pages/staff/FinancePage';
import ChatPage from './src/pages/staff/ChatPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/ministries" element={<Ministries />} />
            <Route path="/sermons" element={<Sermons />} />
            <Route path="/events" element={<Events />} />
            <Route path="/community" element={<Community />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/visit" element={<Visit />} />
          </Route>

          {/* Login Portals */}
          <Route path="/login" element={<MemberLogin />} />
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/choose-portal" element={
            <ProtectedRoute>
              <ChoosePortal />
            </ProtectedRoute>
          } />

          {/* Member Portal */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MemberLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="profile" element={<ProfileHub />} />
            <Route path="checkin" element={<CheckIn />} />
            <Route path="checkin/screen" element={<CheckInScreen />} />
            <Route path="kids-checkin" element={<KidsCheckin />} />
            <Route path="sermons" element={<SermonArchive />} />
            <Route path="giving" element={<GivingPage />} />

            {/* Legacy admin routes in member portal (will show in staff section) */}
            <Route path="members" element={
              <RoleGate allowedRoles={['admin', 'pastor']}>
                <PeopleDirectory />
              </RoleGate>
            } />
            <Route path="events" element={
              <RoleGate allowedRoles={['admin', 'pastor']}>
                <AdminEvents />
              </RoleGate>
            } />
            <Route path="audit" element={
              <RoleGate allowedRoles={['admin', 'pastor']}>
                <AuditLogPage />
              </RoleGate>
            } />
          </Route>

          {/* Staff Portal */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <RoleGate allowedRoles={['admin', 'pastor', 'staff', 'ministry_leader', 'checkin_team', 'finance', 'first_lady', 'administrator']}>
                  <StaffLayout />
                </RoleGate>
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="ministries" element={<MinistriesPage />} />
            <Route path="ministries/:id" element={<MinistryDetailPage />} />
            <Route path="members" element={<PeopleDirectory />} />
            <Route path="households" element={<HouseholdsPage />} />
            <Route path="households/:id" element={<HouseholdDetailPage />} />
            <Route path="calendar" element={<StaffCalendar />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="programs/roster" element={<ProgramsRoster />} />
            <Route path="giving" element={<GivingPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="checkin/screen" element={<CheckInScreen />} />
            <Route path="settings" element={<StaffSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
