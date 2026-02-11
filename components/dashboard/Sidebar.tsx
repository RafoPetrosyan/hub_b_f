'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  UserProfileIcon,
  BusinessProfileIcon,
  LocationsIcon,
  PoliciesIcon,
  SettingsIcon,
  EducationTestIcon,
  PaymentsTestIcon,
  NotificationsIcon,
  CalendarTestIcon,
  SecurityIcon,
  SubscriptionIcon,
} from '@/components/ui/icons';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { name: 'Account Owner', href: '/dashboard', icon: <UserProfileIcon className="w-5 h-5" /> },
    {
      name: 'Business Profile',
      href: '/dashboard/business-profile',
      icon: <BusinessProfileIcon className="w-5 h-5" />,
    },
    {
      name: 'Locations',
      href: '/dashboard/locations',
      icon: <LocationsIcon className="w-5 h-5" />,
    },
    { name: 'Policies', href: '/dashboard/policies', icon: <PoliciesIcon className="w-5 h-5" /> },
    {
      name: 'Services Settings',
      href: '/dashboard/services',
      icon: <SettingsIcon className="w-5 h-5" />,
    },
    {
      name: 'Education Settings',
      href: '/dashboard/education',
      icon: <EducationTestIcon className="w-5 h-5" />,
    },
    {
      name: 'Payments & Deposits',
      href: '/dashboard/payments',
      icon: <PaymentsTestIcon className="w-5 h-5" />,
    },
    {
      name: 'Notifications',
      href: '/dashboard/notifications',
      icon: <NotificationsIcon className="w-5 h-5" />,
    },
    {
      name: 'Calendar Integrations',
      href: '/dashboard/calendar',
      icon: <CalendarTestIcon className="w-5 h-5" />,
    },
    { name: 'Security', href: '/dashboard/security', icon: <SecurityIcon className="w-5 h-5" /> },
    {
      name: 'Subscription & Billing',
      href: '/dashboard/subscription',
      icon: <SubscriptionIcon className="w-5 h-5" />,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside
      className={`bg-d-menu-bg border-r pl-[24px] border-neutral-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64 min-w-[291px]'
      }`}
    >
      <div className="mt-[12px]">
        <p className="text-xl font-bold text-d-menu-title">Settings</p>
        <p className="text-sm font-medium text-d-menu-label">Manage your business configuration</p>
      </div>
      <div className="flex flex-col">
        {/* Navigation Items */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center text-base font-normal gap-3 px-4 py-[15px] mr-[24px] rounded-lg transition-colors ${
                  active
                    ? 'bg-d-menu-vertical-active-bg text-d-accent'
                    : 'text-d-vertical-menu hover:bg-d-accent-light'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
