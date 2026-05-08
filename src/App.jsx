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

// Guard: Protect /dashboard and app routes — require valid session
function OnboardingGuard({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated'

  useEffect(() => {
    base44.auth.me()
      .then(() => setStatus('authenticated'))
      .catch(() => setStatus('unauthenticated'));
  }, []);

  if (status === 'loading') return null;

  // If unauthenticated, redirect to /start
  if (status === 'unauthenticated') {
    window.location.href = '/start';
    return null;
  }

  // Otherwise, allow access to protected routes
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
        <Route path="/start" element={<Onboarding />} />

        {/* Redirect legacy /onboarding to /start */}
        <Route path="/onboarding" element={<Navigate to="/start" replace />} />

        {/* Main app — guarded */}
        <Route element={<OnboardingGuard><AppLayout /></OnboardingGuard>}>
          <Route path="/" element={wrap("dashboard", Dashboard)} />
          <Route path="/dashboard" element={wrap("dashboard", Dashboard)} />
          <Route path="/log" element={wrap("log", DailyLog)} />
          <Route path="/insights" element={wrap("insights", Insights)} />
          <Route path="/resources" element={wrap("resources", Resources)} />
          <Route path="/profile" element={wrap("profile", Profile)} />
        </Route>

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