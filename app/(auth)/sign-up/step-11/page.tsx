'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Button, Checkbox, Input, Select } from '@/components/ui';
import { TrashIcon } from '@/components/ui/icons';
import { useOnboardingStep } from '@/hooks/useOnboardingStep';
import { useSubmitOnboardingStepMutation } from '@/store/onboarding';

interface LocationFormData {
  type: 'mobile' | 'virtual' | 'studio' | null;
  studioAddress?: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'provider' | '';
}

export default function Step11Page() {
  const router = useRouter();
  const [teamType, setTeamType] = useState<'just-me' | 'team'>('just-me');
  const { onboardingData } = useOnboardingStep(11);
  const [submitOnboardingStep, { isLoading: isSubmitting }] = useSubmitOnboardingStepMutation();

  const [selectedType, setSelectedType] = useState<'mobile' | 'virtual' | 'studio' | null>(null);
  const [studioAddress, setStudioAddress] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: '', email: '', role: '' },
  ]);

  // Restore data from onboardingData if available
  useEffect(() => {
    const step11Data = onboardingData?.steps_data?.['11'];
    if (step11Data) {
      if (step11Data.type && ['mobile', 'virtual', 'studio'].includes(step11Data.type)) {
        setSelectedType(step11Data.type as 'mobile' | 'virtual' | 'studio');
      }
      if (step11Data.studio_address) {
        setStudioAddress(step11Data.studio_address);
      }
      if (step11Data.team && Array.isArray(step11Data.team) && step11Data.team.length > 0) {
        setTeamMembers(
          step11Data.team.map((member: any, index: number) => ({
            id: String(index + 1),
            name: member.name || '',
            email: member.email || '',
            role: member.role || '',
          }))
        );
        setTeamType('team');
      }
    }
  }, [onboardingData]);

  const {
    handleSubmit,
    formState: { errors },
  } = useForm<LocationFormData>({
    mode: 'onBlur',
    defaultValues: {
      type: null,
      studioAddress: '',
    },
  });

  const handleTypeSelect = (type: 'mobile' | 'virtual' | 'studio') => {
    setSelectedType(type);
  };

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'provider', label: 'Provider' },
  ];

  const handleAddTeamMember = () => {
    setTeamMembers([...teamMembers, { id: String(Date.now()), name: '', email: '', role: '' }]);
  };

  const handleRemoveTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== id));
  };

  const handleTeamMemberChange = (id: string, field: 'name' | 'email' | 'role', value: string) => {
    setTeamMembers(
      teamMembers.map((member) => (member.id === id ? { ...member, [field]: value } : member))
    );
  };

  const handleSkip = async () => {
    try {
      await submitOnboardingStep({ step: 11 }).unwrap();
      router.push('/sign-up/step-12');
    } catch (error: any) {
      console.log('Failed to skip onboarding step:', error);
      const errorMessage =
        error?.data?.data?.message ||
        error?.data?.message ||
        'Failed to skip step. Please try again.';
      toast.error(errorMessage);
    }
  };

  const onSubmit = async (data: LocationFormData) => {
    if (!selectedType) {
      return;
    }

    try {
      // Prepare the request body
      const requestBody: {
        step: number;
        type: 'mobile' | 'virtual' | 'studio';
        studio_address?: string;
        team?: Array<{
          name: string;
          email: string;
          role: 'admin' | 'manager' | 'provider';
        }>;
      } = {
        step: 11,
        type: selectedType,
      };

      // Only include studio_address if type is studio and address is provided
      if (selectedType === 'studio' && studioAddress.trim()) {
        requestBody.studio_address = studioAddress.trim();
      }

      // Include team array if team type is selected and members are filled
      if (teamType === 'team') {
        const validTeamMembers = teamMembers
          .filter((member) => member.name.trim() && member.email.trim() && member.role)
          .map((member) => ({
            name: member.name.trim(),
            email: member.email.trim(),
            role: member.role as 'admin' | 'manager' | 'provider',
          }));

        if (validTeamMembers.length > 0) {
          requestBody.team = validTeamMembers;
        }
      }

      // Submit the onboarding step
      await submitOnboardingStep(requestBody).unwrap();

      // Navigate to next step on success
      router.push('/sign-up/step-12');
    } catch (error: any) {
      console.log('Failed to submit onboarding step:', error);
      // Extract error message from API response
      const errorMessage =
        error?.data?.data?.message ||
        error?.data?.message ||
        'Failed to submit form. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
      {/* Title and Subtitle */}
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
          Team & locations
        </h1>
        <p className="text-sm sm:text-base text-secondary leading-[20px] sm:leading-[24px]">
          Tell us about your team and where you work
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-[937px] mx-auto">
        {/* Team Type Toggle */}
        <div className="mb-6 sm:mb-8 md:mb-[40px] flex justify-center">
          <div className="inline-flex items-center bg-primary-light rounded-full">
            <button
              type="button"
              onClick={() => setTeamType('just-me')}
              className={`px-3 sm:px-4 md:px-6 rounded-full font-bold text-sm sm:text-base md:text-md transition-all w-[120px] sm:w-[180px] md:w-[277px] h-[40px] sm:h-[44px] md:h-[48px] ${
                teamType === 'just-me'
                  ? 'bg-primary-normal-active text-neutral-0 shadow-sm'
                  : 'text-text-disable hover:text-neutral-900'
              }`}
            >
              Just me
            </button>
            <button
              type="button"
              onClick={() => setTeamType('team')}
              className={`px-3 sm:px-4 md:px-6 rounded-full font-bold text-sm sm:text-base md:text-md transition-all w-[120px] sm:w-[180px] md:w-[277px] h-[40px] sm:h-[44px] md:h-[48px] ${
                teamType === 'team'
                  ? 'bg-primary-normal-active text-neutral-0 shadow-sm'
                  : 'text-text-disable hover:text-neutral-900'
              }`}
            >
              Team
            </button>
          </div>
        </div>

        {/* Where do you work? Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg md:text-md font-bold text-text-strong mb-2 sm:mb-[8px]">Where do you work?</h2>
          <div className="space-y-2 sm:space-y-[8px]">
            {/* In-studio */}
            <div
              className={`rounded-[16px] sm:rounded-[24px] p-4 sm:p-6 space-y-3 sm:space-y-4 bg-primary-light border border-primary-normal ${selectedType !== 'studio' && 'border-none'}`}
            >
              <div className="flex items-start mb-2 sm:mb-3">
                <Checkbox
                  checked={selectedType === 'studio'}
                  onChange={() => handleTypeSelect('studio')}
                  label="In-studio (clients come to your location)"
                  containerClassName="flex items-start"
                  labelClassName={'text-sm sm:text-base text-text-emphasis'}
                />
              </div>
              {selectedType === 'studio' && (
                <div className="ml-6 sm:ml-7 mt-2">
                  <Input
                    label="STUDIO ADDRESS (OPTIONAL)"
                    type="text"
                    value={studioAddress}
                    onChange={(e) => setStudioAddress(e.target.value)}
                    placeholder="Enter studio address"
                    labelClassName="font-bold text-xs"
                  />
                </div>
              )}
            </div>

            {/* Mobile */}
            <div
              className={`rounded-[16px] sm:rounded-[24px] p-4 sm:p-6 space-y-3 sm:space-y-4 bg-primary-light border border-primary-150 ${selectedType !== 'mobile' && 'border-none'}`}
            >
              <Checkbox
                checked={selectedType === 'mobile'}
                onChange={() => handleTypeSelect('mobile')}
                label="Mobile (you travel to clients)"
                containerClassName="flex items-start"
                labelClassName={'text-sm sm:text-base text-text-emphasis'}
              />
            </div>

            {/* Virtual */}
            <div
              className={`rounded-[16px] sm:rounded-[24px] p-4 sm:p-6 space-y-3 sm:space-y-4 bg-primary-light border border-primary-150 ${selectedType !== 'virtual' && 'border-none'}`}
            >
              <Checkbox
                checked={selectedType === 'virtual'}
                onChange={() => handleTypeSelect('virtual')}
                label="Virtual (online consultations or classes)"
                containerClassName="flex items-start"
                labelClassName={'text-sm sm:text-base text-text-emphasis'}
              />
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        {teamType === 'team' && (
          <div className="mb-6 sm:mb-8 bg-primary-light px-4 sm:px-5 md:px-[25px] py-6 sm:py-8 md:py-[35px] rounded-[12px]">
            <h2 className="text-lg sm:text-xl md:text-xl font-bold text-heading mb-4 sm:mb-6">Team members</h2>
            <div className="space-y-3 sm:space-y-4">
              {teamMembers.length > 0 &&
                teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-[16px] sm:rounded-[24px] p-4 sm:p-6 bg-primary-light-active flex flex-col sm:flex-row items-start gap-3 sm:gap-4"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
                      <div>
                        <Input
                          label="NAME"
                          type="text"
                          value={member.name}
                          onChange={(e) =>
                            handleTeamMemberChange(member.id, 'name', e.target.value)
                          }
                          placeholder="Enter name"
                          labelClassName="font-bold text-xs uppercase"
                        />
                      </div>
                      <div>
                        <Input
                          label="EMAIL"
                          type="email"
                          value={member.email}
                          onChange={(e) =>
                            handleTeamMemberChange(member.id, 'email', e.target.value)
                          }
                          placeholder="Enter email"
                          labelClassName="font-bold text-xs uppercase"
                        />
                      </div>
                      <div>
                        <Select
                          label="ROLE"
                          options={roleOptions}
                          value={member.role || undefined}
                          onChange={(value) => handleTeamMemberChange(member.id, 'role', value)}
                          placeholder="Enter role"
                          labelClassName="font-bold text-xs uppercase"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTeamMember(member.id)}
                      className="mt-0 sm:mt-6 w-full sm:w-[48px] h-[40px] sm:h-[48px] p-2 flex items-center justify-center rounded-lg bg-neutral-0 hover:bg-neutral-300 transition-colors flex-shrink-0 self-start sm:self-auto"
                      title="Remove team member"
                    >
                      <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
                    </button>
                  </div>
                ))}
              <button
                type="button"
                onClick={handleAddTeamMember}
                className="w-full rounded-[16px] sm:rounded-[24px] p-3 sm:p-4 bg-primary-light-active border-2 border-dashed border-primary-normal text-center text-sm sm:text-base text-text-emphasis hover:text-strong transition-colors"
              >
                {teamMembers.length === 0 ? 'Add member' : 'Add another team member'}
              </button>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="flex flex-col items-center gap-3 mb-4">
          <Button
            type="submit"
            disabled={!selectedType || isSubmitting}
            className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 w-full sm:w-auto sm:min-w-[280px] md:w-[420px] bg-primary-normal rounded-full font-medium text-sm sm:text-base text-text-on-gradient transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Continue'}
          </Button>
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs sm:text-sm text-secondary hover:text-strong transition-colors"
          >
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
}
