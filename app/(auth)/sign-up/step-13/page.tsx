'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { CheckmarksIcon } from '@/components/ui/icons';

type TaskStatus = 'pending' | 'in-progress' | 'complete';

interface SetupTask {
  id: string;
  label: string;
  status: TaskStatus;
}

export default function Step11Page() {
  const router = useRouter();
  const [tasks, setTasks] = useState<SetupTask[]>([
    { id: 'booking-system', label: 'Setting up booking system', status: 'pending' },
    { id: 'services', label: 'Adding your services', status: 'pending' },
    { id: 'add-ons', label: 'Activating add-ons', status: 'pending' },
    { id: 'ai-features', label: 'Enabling AI features', status: 'pending' },
    { id: 'finalizing', label: 'Finalizing setup', status: 'pending' },
  ]);

  // Simulate progress - update tasks sequentially
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Complete booking system after 1s
    timers.push(
      setTimeout(() => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === 'booking-system' ? { ...task, status: 'complete' as TaskStatus } : task
          )
        );
      }, 1000)
    );

    // Start services after 1.5s, complete after 2.5s
    timers.push(
      setTimeout(() => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === 'services' ? { ...task, status: 'in-progress' as TaskStatus } : task
          )
        );
      }, 1500)
    );

    timers.push(
      setTimeout(() => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === 'services' ? { ...task, status: 'complete' as TaskStatus } : task
          )
        );
      }, 2500)
    );

    // Start add-ons after 3s
    timers.push(
      setTimeout(() => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === 'add-ons' ? { ...task, status: 'in-progress' as TaskStatus } : task
          )
        );
      }, 3000)
    );

    // Complete add-ons after 4s
    timers.push(
      setTimeout(() => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === 'add-ons' ? { ...task, status: 'complete' as TaskStatus } : task
          )
        );
      }, 4000)
    );

    // Start AI features after 4.5s
    timers.push(
      setTimeout(() => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === 'ai-features' ? { ...task, status: 'in-progress' as TaskStatus } : task
          )
        );
      }, 4500)
    );

    // Complete AI features after 5.5s
    timers.push(
      setTimeout(() => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === 'ai-features' ? { ...task, status: 'complete' as TaskStatus } : task
          )
        );
      }, 5500)
    );

    // Start finalizing after 6s
    timers.push(
      setTimeout(() => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === 'finalizing' ? { ...task, status: 'in-progress' as TaskStatus } : task
          )
        );
      }, 6000)
    );

    // Complete finalizing after 7s
    timers.push(
      setTimeout(() => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === 'finalizing' ? { ...task, status: 'complete' as TaskStatus } : task
          )
        );
      }, 7000)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const handleGoToDashboard = () => {
    router.push('/sign-up/step-14');
  };

  const getTaskBackgroundColor = (status: TaskStatus) => {
    switch (status) {
      case 'complete':
        return 'bg-success-soft';
      case 'in-progress':
        return 'bg-primary-light';
      case 'pending':
        return 'bg-primary-light';
      default:
        return 'bg-transparent';
    }
  };

  const getTaskTag = (status: TaskStatus) => {
    switch (status) {
      case 'complete':
        return (
          <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-2xs sm:text-xs font-bold text-success bg-info-soft">
            Complete
          </span>
        );
      case 'in-progress':
        return (
          <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-2xs sm:text-xs font-medium text-white bg-primary-150">
            In progress
          </span>
        );
      default:
        return null;
    }
  };

  const getTaskIcon = (status: TaskStatus) => {
    switch (status) {
      case 'complete':
        return <CheckmarksIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success" strokeWidth={3} />;
      case 'in-progress':
        return (
          <div className="w-4 h-4 sm:w-5 sm:h-5 relative">
            <div className="absolute inset-0 border-2 rounded-full animate-spin border-primary-500 border-b-transparent border-l-transparent" />
          </div>
        );
      default:
        return <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-neutral-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
      {/* Title and Subtitle */}
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
          Setting up your platform
        </h1>
        <p className="text-sm sm:text-base text-secondary leading-[20px] sm:leading-[24px]">
          We're building your booking system. This will only take a moment
        </p>
      </div>

      {/* Progress List */}
      <div className="max-w-[934px] mx-auto mb-6 sm:mb-8 md:mb-10">
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-[12px] mb-4 sm:mb-6 md:mb-[40px] p-3 sm:p-4 flex flex-row sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 transition-all ${getTaskBackgroundColor(task.status)}`}
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1">
                <div className="flex-shrink-0">{getTaskIcon(task.status)}</div>
                <span className="text-xs sm:text-sm md:text-sm font-medium text-label">
                  {task.label}
                </span>
              </div>
              {getTaskTag(task.status)}
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
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
          onClick={handleGoToDashboard}
          className="text-xs sm:text-sm text-secondary hover:text-strong transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
