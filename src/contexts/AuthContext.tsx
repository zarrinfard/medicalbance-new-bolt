import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  isEmailVerified: boolean;
  isAccountApproved?: boolean;
  profile?: any;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)
        .single();

      if (!roleData) {
        setUser(null);
        setLoading(false);
        return;
      }

      let profile = null;
      let isAccountApproved = true;

      // Get profile based on role
      if (roleData.role === 'doctor') {
        const { data: doctorProfile } = await supabase
          .from('doctor_profiles')
          .select('*')
          .eq('user_id', authUser.id)
          .single();
        
        profile = doctorProfile;
        isAccountApproved = doctorProfile?.is_approved || false;
      } else if (roleData.role === 'patient') {
        const { data: patientProfile } = await supabase
          .from('patient_profiles')
          .select('*')
          .eq('user_id', authUser.id)
          .single();
        
        profile = patientProfile;
      }

      setUser({
        id: authUser.id,
        email: authUser.email!,
        role: roleData.role,
        isEmailVerified: authUser.email_confirmed_at !== null,
        isAccountApproved,
        profile
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
  };

  const register = async (userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`
      }
    });

    if (error) throw error;

    if (data.user) {
      // Create user role
      await supabase
        .from('user_roles')
        .insert({
          user_id: data.user.id,
          role: userData.role
        });

      // Create profile based on role
      if (userData.role === 'doctor') {
        await supabase
          .from('doctor_profiles')
          .insert({
            user_id: data.user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            nationality: userData.nationality,
            specialties: userData.specialties,
            website: userData.website,
            social_media: userData.socialMedia,
            bio: userData.bio || ''
          });
      } else if (userData.role === 'patient') {
        await supabase
          .from('patient_profiles')
          .insert({
            user_id: data.user.id,
            alias: userData.alias,
            bio: userData.bio || ''
          });
      }
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const verifyEmail = async (token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });

    if (error) throw error;
  };

  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
  };

  const resetPassword = async (token: string, newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  };

  const updateProfile = async (profileData: any) => {
    if (!user) throw new Error('No user logged in');

    if (user.role === 'doctor') {
      const { error } = await supabase
        .from('doctor_profiles')
        .update(profileData)
        .eq('user_id', user.id);

      if (error) throw error;
    } else if (user.role === 'patient') {
      const { error } = await supabase
        .from('patient_profiles')
        .update(profileData)
        .eq('user_id', user.id);

      if (error) throw error;
    }

    // Reload user profile
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      await loadUserProfile(authUser);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};