'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/ui/navigation';
import { User, Store, ArrowRight } from 'lucide-react';

function RoleSelectionContent() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<'USER' | 'SELLER' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    // If user is not authenticated, redirect to sign in
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // If user already has a role other than USER, redirect to callback
    if (session.user?.role && session.user.role !== 'USER') {
      router.push(callbackUrl);
      return;
    }
  }, [session, router, callbackUrl]);

  const handleRoleSelection = async () => {
    if (!selectedRole) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (response.ok) {
        // Update the session with new role
        await update();
        
        // Redirect based on role
        if (selectedRole === 'SELLER') {
          router.push('/seller/dashboard');
        } else {
          router.push(callbackUrl);
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update role');
      }
    } catch (error) {
      setError('An error occurred while updating your role');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Welcome to ProjectSH!
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Choose your account type to get started
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buyer Option */}
            <div
              className={`relative cursor-pointer rounded-2xl border-2 p-8 transition-all duration-200 ${
                selectedRole === 'USER'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedRole('USER')}
            >
              <div className="text-center">
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                  selectedRole === 'USER' ? 'bg-blue-500' : 'bg-gray-100'
                }`}>
                  <User className={`h-8 w-8 ${
                    selectedRole === 'USER' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">Buyer</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Browse and purchase LED light sequences from talented creators
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-500">
                  <li>• Access to thousands of sequences</li>
                  <li>• Download purchased content</li>
                  <li>• Rate and review sequences</li>
                  <li>• Manage your purchases</li>
                </ul>
              </div>
              {selectedRole === 'USER' && (
                <div className="absolute top-4 right-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Seller Option */}
            <div
              className={`relative cursor-pointer rounded-2xl border-2 p-8 transition-all duration-200 ${
                selectedRole === 'SELLER'
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedRole('SELLER')}
            >
              <div className="text-center">
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                  selectedRole === 'SELLER' ? 'bg-green-500' : 'bg-gray-100'
                }`}>
                  <Store className={`h-8 w-8 ${
                    selectedRole === 'SELLER' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">Seller</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Upload and sell your LED light sequences to the community
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-500">
                  <li>• Upload your sequences</li>
                  <li>• Set your own prices</li>
                  <li>• Earn from sales</li>
                  <li>• Build your reputation</li>
                </ul>
              </div>
              {selectedRole === 'SELLER' && (
                <div className="absolute top-4 right-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleRoleSelection}
              disabled={!selectedRole || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-8 py-3 text-white font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Setting up your account...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500">
            You can change your account type later in your profile settings
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RoleSelectionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>}>
      <RoleSelectionContent />
    </Suspense>
  );
}