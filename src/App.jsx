import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

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

function wrap(key, Component) {
  return (
    <motion.div key={key} variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.18, ease: "easeInOut" }}>
      <Component />
    </motion.div>
  );
}

// Guard: redirect un-onboarded users to /start, onboarded users away from /start
function OnboardingGuard({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'onboarded' | 'new'
  const location = useLocation();

  useEffect(() => {
    base44.auth.me()
      .then(async (user) => {
        if (!user?.onboarded) {
          setStatus('new');
          return;
        }
        // Also check if they have at least one Cycle
        const cycles = await base44.entities.Cycle.filter({ created_by: user.email }, '-start_date', 1);
        setStatus(cycles.length > 0 ? 'onboarded' : 'new');
      })
      .catch(() => setStatus('new'));
  }, []);

  if (status === 'loading') return null;

  const isStartPage = location.pathname === '/start';

  if (status === 'new' && !isStartPage) {
    return <Navigate to="/start" replace />;
  }
  if (status === 'onboarded' && isStartPage) {
    return <Navigate to="/" replace />;
  }
  return children;
}

const AnimatedOutlet = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false} key={location.pathname}>
      <Routes location={location}>
        {/* Public share view — no guard needed */}
        <Route path="/share/:token" element={<DoctorShareView />} />

        {/* Onboarding — accessible at /start only */}
        <Route
          path="/start"
          element={
            <OnboardingGuard>
              <Onboarding />
            </OnboardingGuard>
          }
        />

        {/* Redirect legacy /onboarding to /start */}
        <Route path="/onboarding" element={<Navigate to="/start" replace />} />

        {/* Main app — guarded */}
        <Route element={<OnboardingGuard><AppLayout /></OnboardingGuard>}>
          <Route path="/" element={wrap("dashboard", Dashboard)} />
          <Route path="/log" element={wrap("log", DailyLog)} />
          <Route path="/insights" element={wrap("insights", Insights)} />
          <Route path="/resources" element={wrap("resources", Resources)} />
          <Route path="/profile" element={wrap("profile", Profile)} />
        </Route>

        {/* Redirect /dashboard → / */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

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