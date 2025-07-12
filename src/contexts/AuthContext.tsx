import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUser, getUserById } from '@/lib/api';

interface AuthContextType {
  currentUser: User | null;
  userRole: string | null;
  hasAccess: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string) {
    try {
      console.log('[AUTH] Starting signup process for:', email);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user in backend with retry logic
      let retries = 3;
      while (retries > 0) {
        try {
          console.log(`[AUTH] Creating user in backend (attempt ${4 - retries}/3)`);
          await createUser(user.uid, user.email || '', 'student');
          console.log('[AUTH] User created in backend successfully');
          break;
        } catch (error: any) {
          console.error(`[AUTH] Failed to create user in backend, retries left: ${retries - 1}`, error);
          retries--;
          if (retries === 0) {
            console.error('[AUTH] All retries exhausted for user creation');
            throw new Error('Failed to create user account. Please try again.');
          }
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
      
      console.log('[AUTH] Signup completed successfully');
    } catch (error: any) {
      console.error('[AUTH] Signup error:', error);
      throw error;
    }
  }

  async function login(email: string, password: string) {
    try {
      console.log('[AUTH] Starting login process for:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('[AUTH] Firebase login successful');
      return result;
    } catch (error: any) {
      console.error('[AUTH] Login error:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      console.log('[AUTH] Starting logout process');
      setUserRole(null);
      setHasAccess(false);
      await signOut(auth);
      console.log('[AUTH] Logout completed successfully');
    } catch (error: any) {
      console.error('[AUTH] Logout error:', error);
      throw error;
    }
  }

  async function fetchUserData(user: User) {
    try {
      console.log('[AUTH] Fetching user data for:', user.uid);
      
      // Retry logic for fetching user data
      let retries = 3;
      let userData = null;
      
      while (retries > 0 && !userData) {
        try {
          console.log(`[AUTH] Fetching user data (attempt ${4 - retries}/3)`);
          userData = await getUserById(user.uid);
          
          if (userData) {
            console.log('[AUTH] User data fetched successfully:', userData);
            break;
          }
        } catch (error: any) {
          console.error(`[AUTH] Failed to fetch user data, retries left: ${retries - 1}`, error);
          retries--;
          
          // If user doesn't exist in backend, create them
          if (error.status === 404 || error.message?.includes('User not found')) {
            try {
              console.log('[AUTH] User not found in backend, creating...');
              await createUser(user.uid, user.email || '', 'student');
              userData = await getUserById(user.uid);
              console.log('[AUTH] User created and fetched successfully');
              break;
            } catch (createError: any) {
              console.error('[AUTH] Failed to create user in backend:', createError);
            }
          }
          
          if (retries === 0) {
            console.error('[AUTH] All retries exhausted, using default values');
            setUserRole('student');
            setHasAccess(false);
            return;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
      
      if (userData) {
        console.log('[AUTH] Setting user data:', {
          role: userData.role,
          hasAccess: userData.has_access
        });
        setUserRole(userData.role || 'student');
        setHasAccess(userData.has_access || false);
      } else {
        console.log('[AUTH] No user data found, using defaults');
        setUserRole('student');
        setHasAccess(false);
      }
    } catch (error: any) {
      console.error('[AUTH] Error in fetchUserData:', error);
      setUserRole('student');
      setHasAccess(false);
    }
  }

  async function refreshUserData() {
    if (currentUser) {
      console.log('[AUTH] Refreshing user data');
      await fetchUserData(currentUser);
    }
  }

  useEffect(() => {
    console.log('[AUTH] Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[AUTH] Auth state changed:', user ? user.uid : 'null');
      setCurrentUser(user);
      
      if (user) {
        await fetchUserData(user);
      } else {
        setUserRole(null);
        setHasAccess(false);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('[AUTH] Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userRole,
    hasAccess,
    login,
    signup,
    logout,
    loading,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}