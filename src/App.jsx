import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from '@/lib/AuthContext';

import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import DailyLog from '@/pages/DailyLog';
import Insights from '@/pages/Insights';
import Resources from '@/pages/Resources';
import Profile from '@/pages/Profile';
import Onboarding from '@/pages/Onboarding';
import Welcome from '@/pages/Welcome';
import DoctorShareView from '@/pages/DoctorShareView';

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
        <Route path="/share/:token" element={<DoctorShareView />} />

        {/* Welcome + Onboarding */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/start" element={<Onboarding />} />

        {/* Main app - protected by auth only */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><Dashboard /></motion.div>} />
          <Route path="/dashboard" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><Dashboard /></motion.div>} />
          <Route path="/log" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><DailyLog /></motion.div>} />
          <Route path="/insights" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><Insights /></motion.div>} />
          <Route path="/resources" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><Resources /></motion.div>} />
          <Route path="/profile" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><Profile /></motion.div>} />
        </Route>

        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AnimatedOutlet />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;