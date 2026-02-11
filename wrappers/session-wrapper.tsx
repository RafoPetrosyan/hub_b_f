'use client';

import React, { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

interface SessionWrapperProps {
  children: ReactNode;
}

export const SessionWrapper: React.FC<SessionWrapperProps> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};
