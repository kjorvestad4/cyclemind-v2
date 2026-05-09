import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';
import { queryClientInstance } from '@/lib/query-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      const appClient = createAxiosClient({
        baseURL: `/api/apps/public`,
        headers: { 'X-App-Id': appParams.appId },
        token: appParams.token,
        interceptResponses: true
      });

      await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
      await checkUserAuth();
      setIsLoadingPublicSettings(false);
    } catch (error) {
      console.error('App state check failed:', error);
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      queryClientInstance.clear();
      setIsLoadingAuth(true);

      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);

      // FORCE ONBOARDING COMPLETION FOR LOGGED-IN USERS
      if (!currentUser.onboarded) {
        await base44.auth.updateMe({ onboarded: true });
      }

      // Create default active Cycle if none exists
      const cycles = await base44.entities.Cycle.filter({ created_by: currentUser.email }, '-start_date', 1);
      if (cycles.length === 0) {
        const today = new Date().toISOString().split('T')[0];
        await base44.entities.Cycle.create({
          cycle_type: "menstrual",
          cycle_length: 28,
          start_date: today,
        });
      }

      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
    }
  };

  const logout = () => {
    queryClientInstance.clear();
    base44.auth.logout(window.location.href);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      logout,
      checkUserAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);