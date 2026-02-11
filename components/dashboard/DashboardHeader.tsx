'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import httpClient from '@/lib/httpClient';
import {
  ChevronDownIcon,
  ProfileIcon,
  DashboardNavIcon,
  CalendarNavIcon,
  ClientsNavIcon,
  ServicesNavIcon,
  StaffNavIcon,
  PaymentNavIcon,
  ReportsNavIcon,
  MarketingNavIcon,
  EducationNavIcon,
} from '@/components/ui/icons';

export default function DashboardHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call logout API endpoint
      try {
        await httpClient.post('/admin/auth/logout');
      } catch (apiError) {
        // Log the error but continue with local logout
        // This ensures logout happens even if API call fails
        console.error('Logout API error:', apiError);
      }

      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');

      // Sign out from NextAuth
      await signOut({ redirect: true, callbackUrl: '/login' });
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const userData = (session?.user as any)?.userData;
  const profilePicture = userData?.profile_picture ?? userData?.logo ?? null;
  const userName = userData
    ? `${userData.first_name} ${userData.last_name}`.trim()
    : session?.user?.email || 'User';

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <DashboardNavIcon className="w-[24px] h-[24px]" />,
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: <CalendarNavIcon className="w-[22px] h-[22px]" />,
    },
    { name: 'Clients', href: '/clients', icon: <ClientsNavIcon className="w-[24px] h-[24px]" /> },
    {
      name: 'Services',
      href: '/services',
      icon: <ServicesNavIcon className="w-[22px] h-[22px]" />,
    },
    { name: 'Staff / Team', href: '/staff', icon: <StaffNavIcon className="w-[22px] h-[22px]" /> },
    { name: 'Payments', href: '/payments', icon: <PaymentNavIcon className="w-[24px] h-[24px]" /> },
    { name: 'Reports', href: '/reports', icon: <ReportsNavIcon className="w-[24px] h-[24px]" /> },
    {
      name: 'Marketing',
      href: '/marketing',
      icon: <MarketingNavIcon className="w-[24px] h-[24px]" />,
    },
    {
      name: 'Education',
      href: '/education',
      icon: <EducationNavIcon className="w-[24px] h-[24px]" />,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard' || pathname?.startsWith('/dashboard/');
    }
    return pathname?.startsWith(href);
  };

  return (
    <header className="w-full font-inter">
      {/* Light Blue Main Header Section */}
      <div className="bg-d-accent-normal w-full px-[24px]">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex flex-col">
                <Image
                  src="/logo.png"
                  alt="aesthetichub!"
                  width={200}
                  height={38}
                  className="object-contain"
                />
                <span className="text-sm font-semibold text-body-strong mt-0.5">
                  Business Dashboard
                </span>
              </div>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center justify-center gap-2 bg-d-accent-light rounded-full px-3 py-2 hover:opacity-90 transition-opacity w-[98px] h-[48px]"
              >
                {profilePicture ? (
                  <div className="w-[32px] h-[32px] rounded-full overflow-hidden flex-shrink-0 bg-neutral-200">
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <ProfileIcon className="w-[32px] h-[32px]" />
                )}
                <ChevronDownIcon
                  className="text-neutral-soft-strong w-5 h-5 ml-[5px]"
                  strokeWidth={3}
                />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 py-2">
                    <div className="px-4 py-3 border-b border-neutral-200">
                      <p className="text-sm font-medium text-neutral-900">{userName}</p>
                      {userData?.email && (
                        <p className="text-xs text-neutral-500 mt-1">{userData.email}</p>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-light transition-colors disabled:opacity-50"
                    >
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* White Navigation Bar */}
      <nav className="bg-d-menu-bg border-b border-neutral-200 w-full px-[24px]">
        <div className="flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 mr-10 py-3 text-base font-medium transition-colors whitespace-nowrap ${
                isActive(item.href)
                  ? 'text-d-accent border-b-2 border-d-accent'
                  : 'text-neutral-700 hover:text-d-accent hover:border-b-2 hover:d-accent-normal'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
