'use client';

import React from 'react';
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

interface SettingsNavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export default function SettingsSidebar() {
  const pathname = usePathname();

  const settingsItems: SettingsNavItem[] = [
    { name: 'Account Owner', href: '/settings', icon: <UserProfileIcon className="w-5 h-5" /> },
    { name: 'Business Profile', href: '/settings/business-profile', icon: <BusinessProfileIcon className="w-5 h-5" /> },
    { name: 'Locations', href: '/settings/locations', icon: <LocationsIcon className="w-5 h-5" /> },
    { name: 'Policies', href: '/settings/policies', icon: <PoliciesIcon className="w-5 h-5" /> },
    { name: 'Services Settings', href: '/settings/services', icon: <SettingsIcon className="w-5 h-5" /> },
    { name: 'Education Settings', href: '/settings/education', icon: <EducationTestIcon className="w-5 h-5" /> },
    { name: 'Payments & Deposits', href: '/settings/payments', icon: <PaymentsTestIcon className="w-5 h-5" /> },
    { name: 'Notifications', href: '/settings/notifications', icon: <NotificationsIcon className="w-5 h-5" /> },
    { name: 'Calendar Integrations', href: '/settings/calendar', icon: <CalendarTestIcon className="w-5 h-5" /> },
    { name: 'Security', href: '/settings/security', icon: <SecurityIcon className="w-5 h-5" /> },
    { name: 'Subscription & Billing', href: '/settings/subscription', icon: <SubscriptionIcon className="w-5 h-5" /> },
  ];

  const isActive = (href: string) => {
    if (href === '/settings') {
      return pathname === '/settings' || pathname === '/settings/';
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex-shrink-0">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">Settings</h2>
          <p className="text-sm text-neutral-600 mt-1">Manage your business configuration</p>
        </div>
        <nav className="space-y-1">
          {settingsItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary-light text-primary-normal font-medium'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
