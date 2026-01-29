'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import SequenceUploadForm from './SequenceUploadForm';
import OverviewTab from './OverviewTab';
import MySequencesTab from './MySequencesTab';
import ProfileSettingsTab from './ProfileSettingsTab';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState('overview');
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    checkOnboardingStatus();
  }, [user]);

  useEffect(() => {
    // Check for tab parameter in URL
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const checkOnboardingStatus = async () => {
    try {
      setIsCheckingOnboarding(true);

      // Check if user has completed onboarding
      const { data: progress, error } = await supabase
        .from('seller_onboarding_progress')
        .select('is_completed')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Error other than "not found"
        console.error('Error checking onboarding status:', error);
        return;
      }

      // If onboarding record doesn't exist or is not completed, redirect
      if (!progress || !progress.is_completed) {
        router.push('/seller-onboarding');
        return;
      }

      setIsCheckingOnboarding(false);
    } catch (err) {
      console.error('Error in checkOnboardingStatus:', err);
      setIsCheckingOnboarding(false);
    }
  };

  if (!user || isCheckingOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary mb-4" />
          <p className="text-white/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Seller Dashboard</h1>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'upload' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Upload Sequence
            </button>
            <button
              onClick={() => setActiveTab('my-sequences')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'my-sequences' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              My Sequences
            </button>
            <button
              onClick={() => setActiveTab('profile-settings')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile-settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Profile Settings
            </button>
          </nav>
        </div>

        <div>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'upload' && <SequenceUploadForm />}
          {activeTab === 'my-sequences' && <MySequencesTab />}
          {activeTab === 'profile-settings' && <ProfileSettingsTab />}
        </div>
      </div>
    </div>
  );
}