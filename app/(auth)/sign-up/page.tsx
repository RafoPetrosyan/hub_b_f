'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // useEffect(() => {
  //   if (status === 'loading') return;
  //
  //   // If user is already logged in, redirect to dashboard (root)
  //   if (session) {
  //     router.push('/');
  //   }
  // }, [session, status, router]);

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-normal mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show sign up form
  // @ts-ignore
  if (!session?.userData?.email) {
    return <SignUpForm />;
  }

  // This shouldn't render, but just in case
  return <SignUpForm />;
}
