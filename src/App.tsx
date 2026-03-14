import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, Outlet, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/BottomNav";
import { UserBottomNav } from "@/components/UserBottomNav";
import { AnimatedPage } from "@/components/AnimatedRoutes";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Pages
import LoginPage from "@/pages/LoginPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import UserLoginPage from "@/pages/UserLoginPage";
import HomePage from "@/pages/admin/HomePage";
import SupportPage from "@/pages/admin/SupportPage";
import SupportChatPage from "@/pages/admin/SupportChatPage";
import MonitoringPage from "@/pages/admin/MonitoringPage";
import FinancePage from "@/pages/admin/FinancePage";
import MorePage from "@/pages/admin/MorePage";
import NotificationsPage from "@/pages/admin/NotificationsPage";
import ReportsPage from "@/pages/admin/ReportsPage";
import VipRequestsPage from "@/pages/admin/VipRequestsPage";
import StoreRequestsPage from "@/pages/admin/StoreRequestsPage";
import UserSearchPage from "@/pages/admin/UserSearchPage";
import AdminChatPage from "@/pages/admin/AdminChatPage";
import GiftAuditPage from "@/pages/admin/GiftAuditPage";
import ActivityLogPage from "@/pages/admin/ActivityLogPage";
import IdChangePage from "@/pages/admin/IdChangePage";
import RegistrationsPage from "@/pages/admin/RegistrationsPage";
import UserDashboard from "@/pages/user/UserDashboard";
import UserChargesPage from "@/pages/user/UserChargesPage";
import UserSalaryPage from "@/pages/user/UserSalaryPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AdminLayout() {
  return (
    <div className="max-w-lg mx-auto min-h-screen bg-background">
      <ErrorBoundary>
        <AnimatedPage>
          <Outlet />
        </AnimatedPage>
      </ErrorBoundary>
      <BottomNav />
    </div>
  );
}

function UserLayout() {
  return (
    <div className="max-w-lg mx-auto min-h-screen bg-background">
      <ErrorBoundary>
        <AnimatedPage>
          <Outlet />
        </AnimatedPage>
      </ErrorBoundary>
      <UserBottomNav />
    </div>
  );
}

function ProtectedRoute({ children, allowedType }: { children: React.ReactNode; allowedType?: "admin" | "user" }) {
  const { loggedIn, type } = useAuth();
  if (!loggedIn) return <Navigate to="/login" replace />;
  if (allowedType && type !== allowedType) return <Navigate to={type === "user" ? "/user" : "/"} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { loggedIn, type } = useAuth();

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={loggedIn ? <Navigate to={type === "user" ? "/user" : "/"} replace /> : <LoginPage />} />
      <Route path="/login/admin" element={<AdminLoginPage />} />
      <Route path="/login/user" element={<UserLoginPage />} />

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedType="admin"><AdminLayout /></ProtectedRoute>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/monitoring" element={<MonitoringPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/more" element={<MorePage />} />
      </Route>

      {/* Admin sub-pages */}
      <Route path="/support/:ticketId" element={<ProtectedRoute allowedType="admin"><AnimatedPage><SupportChatPage /></AnimatedPage></ProtectedRoute>} />
      <Route path="/more/notifications" element={<ProtectedRoute allowedType="admin"><AnimatedPage><NotificationsPage /></AnimatedPage></ProtectedRoute>} />
      <Route path="/more/reports" element={<ProtectedRoute allowedType="admin"><AnimatedPage><ReportsPage /></AnimatedPage></ProtectedRoute>} />
      <Route path="/more/vip" element={<ProtectedRoute allowedType="admin"><AnimatedPage><VipRequestsPage /></AnimatedPage></ProtectedRoute>} />
      <Route path="/more/store" element={<ProtectedRoute allowedType="admin"><AnimatedPage><StoreRequestsPage /></AnimatedPage></ProtectedRoute>} />
      <Route path="/more/user-search" element={<ProtectedRoute allowedType="admin"><AnimatedPage><UserSearchPage /></AnimatedPage></ProtectedRoute>} />
      <Route path="/more/admin-chat" element={<ProtectedRoute allowedType="admin"><AnimatedPage><AdminChatPage /></AnimatedPage></ProtectedRoute>} />
      <Route path="/more/gift-audit" element={<ProtectedRoute allowedType="admin"><AnimatedPage><GiftAuditPage /></AnimatedPage></ProtectedRoute>} />
      <Route path="/more/activity-log" element={<ProtectedRoute allowedType="admin"><AnimatedPage><ActivityLogPage /></AnimatedPage></ProtectedRoute>} />
      <Route path="/more/id-change" element={<ProtectedRoute allowedType="admin"><AnimatedPage><IdChangePage /></AnimatedPage></ProtectedRoute>} />
      <Route path="/more/registrations" element={<ProtectedRoute allowedType="admin"><AnimatedPage><RegistrationsPage /></AnimatedPage></ProtectedRoute>} />

      {/* User routes */}
      <Route element={<ProtectedRoute allowedType="user"><UserLayout /></ProtectedRoute>}>
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/user/charges" element={<UserChargesPage />} />
        <Route path="/user/salary" element={<UserSalaryPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
