'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { CopyIcon, LinkIcon, CheckmarkIcon } from '@/components/ui/icons';
import { useGetOnboardingLinksQuery } from '@/store/onboarding';

export default function Step12Page() {
  const router = useRouter();
  const { data: linksData, isLoading: isLoadingLinks } = useGetOnboardingLinksQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const websiteUrl = linksData?.dashboard_url || '';
  const bookingUrl = linksData?.booking_url || '';
  const embedCode = linksData?.embed_url || '';

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank');
  };

  const handleGoToDashboard = () => {
    router.push('/');
  };

  const handleViewBookingPage = () => {
    window.open(bookingUrl, '_blank');
  };

  if (isLoadingLinks) {
    return (
      <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
            You're live!
          </h1>
          <p className="text-sm sm:text-base text-secondary leading-[20px] sm:leading-[24px]">
            Loading your links...
          </p>
        </div>
      </div>
    );
  }

  if (!linksData) {
    return (
      <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
            You're live!
          </h1>
          <p className="text-sm sm:text-base text-secondary leading-[20px] sm:leading-[24px]">
            Unable to load your links. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
      {/* Title and Subtitle */}
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
          You're live!
        </h1>
        <p className="text-sm sm:text-base text-secondary leading-[20px] sm:leading-[24px]">
          Your booking system is ready to accept appointments
        </p>
      </div>

      {/* Main Content Card */}
      <div className="rounded-[16px] sm:rounded-[24px] mb-6 sm:mb-8 max-w-[937px] mx-auto">
        {/* Your website is live */}
        <div className="mb-6 sm:mb-8 bg-primary-light p-4 sm:p-5 md:p-[24px] rounded-[12px]">
          <h2 className="text-base sm:text-lg md:text-md font-bold text-strong mb-3 sm:mb-4">
            Your website is live
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={websiteUrl}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-neutral-300 bg-white text-xs sm:text-sm text-strong focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={() => handleOpenLink(websiteUrl)}
              disabled={!websiteUrl}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-primary-normal transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Open link"
            >
              <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
            <button
              type="button"
              onClick={() => handleCopy(websiteUrl, 'website')}
              disabled={!websiteUrl}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-primary-normal transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Copy URL"
            >
              {copiedField === 'website' ? (
                <CheckmarkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={3} />
              ) : (
                <CopyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Booking link */}
        <div className="mb-6 sm:mb-8 bg-primary-light p-4 sm:p-5 md:p-[24px] rounded-[12px]">
          <h2 className="text-base sm:text-lg md:text-md font-bold text-strong mb-1">
            Booking link
          </h2>
          <p className="text-xs sm:text-sm text-secondary mb-3 sm:mb-4">
            Share this link to start accepting bookings immediately
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={bookingUrl}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-neutral-300 bg-white text-xs sm:text-sm text-strong focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={() => handleCopy(bookingUrl, 'booking')}
              disabled={!bookingUrl}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center bg-primary-normal justify-center transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Copy URL"
            >
              {copiedField === 'booking' ? (
                <CheckmarkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={3} />
              ) : (
                <CopyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Embed on existing website */}
        <div className="mb-6 sm:mb-8 bg-primary-light p-4 sm:p-5 md:p-[24px] rounded-[12px]">
          <h2 className="text-base sm:text-lg md:text-md font-bold text-strong mb-1">
            Embed on existing website
          </h2>
          <p className="text-xs sm:text-sm text-secondary mb-3 sm:mb-4">
            Add booking to your existing site with this embed code
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={embedCode}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-neutral-300 bg-white text-xs sm:text-sm text-strong focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            />
            <button
              type="button"
              onClick={() => handleCopy(embedCode, 'embed')}
              disabled={!embedCode}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center bg-primary-normal justify-center transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Copy embed code"
            >
              {copiedField === 'embed' ? (
                <CheckmarkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={3} />
              ) : (
                <CopyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* What's next? */}
        <div className="mb-6 sm:mb-8 bg-primary-light p-4 sm:p-5 md:p-[24px] rounded-[12px]">
          <h2 className="text-base sm:text-lg md:text-md font-bold text-strong mb-3 sm:mb-4">
            What's next?
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckmarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-success" strokeWidth={3} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-strong mb-0.5 sm:mb-1">
                  Customize your booking page and settings
                </p>
                <p className="text-xs sm:text-sm text-secondary">
                  Add your branding, update availability, and configure notifications
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckmarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-success" strokeWidth={3} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-strong mb-0.5 sm:mb-1">
                  Test your booking flow
                </p>
                <p className="text-xs sm:text-sm text-secondary">
                  Make a test booking to see the client experience
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckmarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-success" strokeWidth={3} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-strong mb-0.5 sm:mb-1">
                  Share your booking link
                </p>
                <p className="text-xs sm:text-sm text-secondary">
                  Add your branding, update availability, and configure notifications
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-3">
        <Button
          type="button"
          onClick={handleGoToDashboard}
          className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 w-full sm:w-auto sm:min-w-[280px] md:w-[420px] bg-primary-normal rounded-full font-medium text-sm sm:text-base text-text-on-gradient transition-all hover:opacity-90"
        >
          Go to Dashboard
        </Button>
        <button
          type="button"
          onClick={handleViewBookingPage}
          className="text-xs sm:text-sm text-secondary hover:text-strong transition-colors"
        >
          View booking page
        </button>
      </div>
    </div>
  );
}
