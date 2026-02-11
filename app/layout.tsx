import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { StoreProvider } from '@/wrappers/store-provider';
import { SessionWrapper } from '@/wrappers/session-wrapper';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const gazpacho = localFont({
  src: '../styles/font/gazpacho-regular.ttf',
  variable: '--font-gazpacho',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Business Dashboard - Registration',
  description: 'Register your business and get started with our B2B (dashboard)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${gazpacho.variable} antialiased`}>
        <StoreProvider>
          <SessionWrapper>{children}</SessionWrapper>
        </StoreProvider>
      </body>
    </html>
  );
}
