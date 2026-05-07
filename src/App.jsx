import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { AnimatePresence, motion } from 'framer-motion';

import AppLayout from '@/components/layout/AppLayout';
import DoctorShareView from '@/pages/DoctorShareView';
import Dashboard from '@/pages/Dashboard';
import DailyLog from '@/pages/DailyLog';
import Insights from '@/pages/Insights';
import Resources from '@/pages/Resources';
import Profile from '@/pages/Profile';
import Onboarding from '@/pages/Onboarding';

const pageVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

const AnimatedOutlet = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false} key={location.pathname}>
      <Routes location={location}>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={
              <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.18, ease: "easeInOut" }}>
                <Dashboard />
              </motion.div>
            }
          />
          <Route
            path="/log"
            element={
              <motion.div key="log" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.18, ease: "easeInOut" }}>
                <DailyLog />
              </motion.div>
            }
          />
          <Route
            path="/insights"
            element={
              <motion.div key="insights" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.18, ease: "easeInOut" }}>
                <Insights />
              </motion.div>
            }
          />
          <Route
            path="/resources"
            element={
              <motion.div key="resources" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.18, ease: "easeInOut" }}>
                <Resources />
              </motion.div>
            }
          />
          <Route
            path="/profile"
            element={
              <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.18, ease: "easeInOut" }}>
                <Profile />
              </motion.div>
            }
          />
        </Route>
        <Route path="/share/:token" element={<DoctorShareView />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();
  const location = useLocation();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground font-medium">Loading CycleMind...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  // Show onboarding instead of dashboard if user hasn't completed it
  if (user && !user.has_completed_onboarding && !location.pathname.startsWith('/onboarding')) {
    return <Onboarding />;
  }

  return <AnimatedOutlet />;
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            <Route path="*" element={<AuthenticatedApp />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App