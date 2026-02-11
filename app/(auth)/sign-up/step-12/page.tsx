'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui';
import { useOnboardingStep } from '@/hooks/useOnboardingStep';
import { useSubmitOnboardingStepMutation } from '@/store/onboarding';
import httpClient from '@/lib/httpClient';
import { useSession } from 'next-auth/react';
import { setCurrentUser } from '@/store/auth/reducer';
import { useAppDispatch } from '@/store/hooks';

interface PlatformCustomizationFormData {
  template: string;
  colorPalette: string;
  font: string;
}

interface Template {
  id: string;
  name: string;
  borderColor: string;
}

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

interface Font {
  id: string;
  name: string;
  fontFamily?: string;
}

// Helper function to generate UUID
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const templates: Template[] = [
  { id: 'template-1', name: 'Template 1', borderColor: '#93D5D1' }, // Light blue
  { id: 'template-2', name: 'Template 2', borderColor: '#A8E6CF' }, // Light mint green
  { id: 'template-3', name: 'Template 3', borderColor: '#71B8EA' }, // Blue
  { id: 'template-4', name: 'Template 4', borderColor: '#FFE5B4' }, // Light yellow
  { id: 'template-5', name: 'Template 5', borderColor: '#7FC0E7' }, // Light blue
];

const colorPalettes: ColorPalette[] = [
  {
    id: 'natural',
    name: 'Natural',
    colors: ['#2B2947', '#7D779F', '#FFFFFF'],
  },
  {
    id: 'warm',
    name: 'Warm',
    colors: ['#7FC0E7', '#71B8EA', '#FFE5B4'],
  },
  {
    id: 'cool',
    name: 'Cool',
    colors: ['#2B2947', '#7FC0E7', '#F0F1F3'],
  },
  {
    id: 'rose',
    name: 'Rose',
    colors: ['#2B2947', '#71B8EA', '#A8E6CF'],
  },
];

const fonts: Font[] = [
  { id: 'natural', name: 'Natural' },
  { id: 'modern', name: 'Modern' },
  { id: 'elegant', name: 'Elegant' },
  { id: 'casual', name: 'Casual' },
];

export default function Step10Page() {
  const router = useRouter();
  const { onboardingData } = useOnboardingStep(12);
  const dispatch = useAppDispatch();
  const { update } = useSession();
  const [submitOnboardingStep, { isLoading: isSubmitting }] = useSubmitOnboardingStepMutation();

  const [selectedTemplate, setSelectedTemplate] = useState<string>('template-1');
  const [selectedColorPalette, setSelectedColorPalette] = useState<string>('natural');
  const [selectedFont, setSelectedFont] = useState<string>('natural');

  // Generate UUIDs for each option - memoized to ensure consistency
  const templateUUIDs = useMemo(() => {
    const uuids: Record<string, string> = {};
    templates.forEach((template) => {
      uuids[template.id] = generateUUID();
    });
    return uuids;
  }, []);

  const colorPaletteUUIDs = useMemo(() => {
    const uuids: Record<string, string> = {};
    colorPalettes.forEach((palette) => {
      uuids[palette.id] = generateUUID();
    });
    return uuids;
  }, []);

  const fontUUIDs = useMemo(() => {
    const uuids: Record<string, string> = {};
    fonts.forEach((font) => {
      uuids[font.id] = generateUUID();
    });
    return uuids;
  }, []);

  const {
    handleSubmit,
    formState: { errors },
  } = useForm<PlatformCustomizationFormData>({
    mode: 'onBlur',
    defaultValues: {
      template: 'template-1',
      colorPalette: 'natural',
      font: 'natural',
    },
  });

  const onSubmit = async (data: PlatformCustomizationFormData) => {
    try {
      // Prepare the request body with UUIDs
      const requestBody: {
        step: number;
        template_id?: string;
        color_palette_id?: string;
        font_id?: string;
      } = {
        step: 12,
        // template_id: templateUUIDs[selectedTemplate],
        // color_palette_id: colorPaletteUUIDs[selectedColorPalette],
        // font_id: fontUUIDs[selectedFont],
      };

      // Submit the onboarding step
      await submitOnboardingStep(requestBody).unwrap();

      const userResponse = await httpClient.get('/user/current');
      const userData = userResponse.data?.user || userResponse.data;

      if (userData) {
        await update({
          userData: {
            id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            phone: userData.phone,
            status: userData.status,
            company_id: userData.company_id,
            location_id: userData.location_id,
            role: userData.role,
            tfa_mode: userData.tfa_mode,
            company_subdomain: userData.company_subdomain,
            onboarding_completed: true,
          },
        });

        dispatch(setCurrentUser(userData));
      }

      // Navigate to next step on success
      router.push('/sign-up/step-13');
    } catch (error) {
      console.error('Failed to submit onboarding step:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
      {/* Title and Subtitle */}
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
          Choose your scheduling platform
        </h1>
        <p className="text-sm sm:text-base text-secondary leading-[20px] sm:leading-[24px]">
          Select a template, colors, and font. You can customize everything later.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-[1112px] mx-auto">
        {/* Template Selection */}
        <div className="mb-6 sm:mb-8 md:mb-10 bg-neutral-25 p-4 sm:p-5 md:p-[24px] rounded-[12px]">
          <h2 className="text-base sm:text-lg md:text-md font-bold text-strong mb-3 sm:mb-4">
            Template
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {templates.map((template) => {
              const isSelected = selectedTemplate === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`rounded-[12px] h-[140px] sm:h-[160px] md:h-[192px] border-2 p-3 sm:p-4 transition-all bg-white ${
                    isSelected ? 'border-primary-500 shadow-md' : 'hover:border-neutral-300'
                  }`}
                  style={isSelected ? {} : { borderColor: template.borderColor }}
                >
                  {/* Template Preview - Wireframe representation */}
                  <div className="space-y-1.5 sm:space-y-2">
                    {/* Header bar */}
                    <div
                      className="h-1.5 sm:h-2 rounded"
                      style={{ backgroundColor: template.borderColor, opacity: 0.3 }}
                    />
                    {/* Main content area */}
                    <div
                      className="h-6 sm:h-7 md:h-8 rounded"
                      style={{ backgroundColor: template.borderColor, opacity: 0.2 }}
                    />
                    {/* Footer sections */}
                    <div className="flex gap-1">
                      <div
                        className="h-1 flex-1 rounded"
                        style={{ backgroundColor: template.borderColor, opacity: 0.2 }}
                      />
                      <div
                        className="h-1 flex-1 rounded"
                        style={{ backgroundColor: template.borderColor, opacity: 0.2 }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Palette Selection */}
        <div className="mb-6 sm:mb-8 md:mb-10 bg-neutral-25 p-4 sm:p-5 md:p-[24px] rounded-[12px]">
          <h2 className="text-base sm:text-lg md:text-md font-bold text-strong mb-3 sm:mb-4">
            Color palette
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {colorPalettes.map((palette) => {
              const isSelected = selectedColorPalette === palette.id;
              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => setSelectedColorPalette(palette.id)}
                  className={`rounded-[12px] border-2 p-3 sm:p-4 transition-all bg-white ${
                    isSelected
                      ? 'border-primary-500 shadow-md'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex gap-1.5 sm:gap-2 mb-2 items-center justify-center">
                    {palette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-[35px] h-[32px] sm:w-[45px] sm:h-[40px] md:w-[51px] md:h-[46px] rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base font-bold text-heading text-center mt-3 sm:mt-4 md:mt-[16px]">
                    {palette.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Selection */}
        <div className="mb-6 sm:mb-8 md:mb-10 bg-neutral-25 p-4 sm:p-5 md:p-[24px] rounded-[12px]">
          <h2 className="text-base sm:text-lg md:text-md font-bold text-strong mb-3 sm:mb-4">
            Font
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {fonts.map((font) => {
              const isSelected = selectedFont === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => setSelectedFont(font.id)}
                  className={`rounded-[12px] border-2 p-3 sm:p-4 transition-all bg-white ${
                    isSelected
                      ? 'border-primary-500 shadow-md'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="text-center mb-1.5 sm:mb-2">
                    <span
                      className="text-xl sm:text-display-sm md:text-4xl font-gazpacho text-strong"
                      style={{ fontFamily: font.fontFamily || 'inherit' }}
                    >
                      Aa
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-heading text-center mt-3 sm:mt-4 md:mt-[16px]">
                    {font.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 w-full sm:w-auto sm:min-w-[280px] md:w-[420px] bg-primary-normal rounded-full font-medium text-sm sm:text-base text-text-on-gradient transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
}
