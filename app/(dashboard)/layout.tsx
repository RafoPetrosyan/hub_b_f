'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { setCurrentUser } from '@/store/auth/reducer';
import { useAppDispatch } from '@/store/hooks';
import httpClient from '@/lib/httpClient';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Sidebar from '@/components/dashboard/Sidebar';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Loader = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-normal mx-auto"></div>
      <p className="mt-4 text-neutral-600">Loading...</p>
    </div>
  </div>
);

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const dispatch = useAppDispatch();
  const { data: session, status, update } = useSession();
  const pathname = usePathname();

  const hasFetchedUser = useRef(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const isDashboardPage = pathname === '/' || pathname?.startsWith('/dashboard');

  /**
   * 1. Store tokens + hydrate Redux from session (fast, sync)
   */
  useEffect(() => {
    if (status !== 'authenticated') return;

    // @ts-ignore
    if (session.user?.accessToken) {
      // @ts-ignore
      localStorage.setItem('accessToken', session.user.accessToken);
    }

    // @ts-ignore
    if (session.user?.refreshToken) {
      // @ts-ignore
      localStorage.setItem('refreshToken', session.user.refreshToken);
    }

    const payload = {
      // @ts-ignore
      ...session.user?.userData,
    };

    if (payload?.id) {
      // @ts-ignore
      dispatch(setCurrentUser(payload));

      if (process.env.NODE_ENV === 'development') {
        // @ts-ignore
        localStorage.setItem('x-tenant', payload.company_subdomain);
        // @ts-ignore
        httpClient.defaults.headers.common['x-tenant'] = payload.company_subdomain;
      }
    }
  }, [status, session, dispatch]);

  /**
   * 2. Fetch fresh user data ONCE, then mark app ready
   * Note: Authentication and onboarding checks are handled by middleware
   */
  useEffect(() => {
    if (status !== 'authenticated') return;
    if (hasFetchedUser.current) return;

    const fetchCurrentUser = async () => {
      hasFetchedUser.current = true;

      try {
        const response = await httpClient.get('/user/current');
        const userData = response.data?.user || response.data;

        if (userData) {
          // @ts-ignore
          const sessionUserData = session.user?.userData;

          await update({
            userData: {
              id: userData.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              email: userData.email,
              phone: userData.phone,
              status: userData.status,
              profile_picture: userData.profile_picture || '',
              company_id: userData.company_id,
              location_id: userData.location_id,
              role: userData.role,
              tfa_mode: userData.tfa_mode,
              company_subdomain: userData.company_subdomain,
              onboarding_completed: sessionUserData?.onboarding_completed,
              onboarding_current_step: sessionUserData?.onboarding_current_step,
            },
          });

          dispatch(setCurrentUser(userData));
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);

        // fallback to session data
        // @ts-ignore
        const fallback = session.user?.userData;
        if (fallback?.id) {
          // @ts-ignore
          dispatch(setCurrentUser(fallback));
        }
      } finally {
        setIsAppReady(true);
      }
    };

    fetchCurrentUser();
  }, [status, session, update, dispatch]);

  /**
   * 3. SINGLE loader (no flicker)
   */
  if (!isAppReady) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-white font-inter">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
      <DashboardHeader />
      <div className="flex h-[calc(100vh-131px)]">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-d-content-bg p-[12px]">{children}</main>
      </div>
    </div>
  );
}
