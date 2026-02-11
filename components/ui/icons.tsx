import React from 'react';

export const EmailIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

export const UserIcon: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);

export const LockIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

export const ShieldIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

export const MoreVerticalIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
    />
  </svg>
);

export const UserPlusIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    />
  </svg>
);

export const InfoIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

export const CheckmarksIcon: React.FC<React.SVGProps<SVGSVGElement> & { strokeWidth?: number }> = ({
  className = 'w-5 h-5',
  strokeWidth = 2,
  ...props
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_459_6378)">
      <path
        d="M7 12L12 17L22 7"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12L7 17M12 12L17 7"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_459_6378">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const CheckmarkIcon: React.FC<React.SVGProps<SVGSVGElement> & { strokeWidth?: number }> = ({
  className = 'w-5 h-5',
  strokeWidth = 2,
  ...props
}) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth || 5}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

export const CheckmarkCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-5 h-5',
  ...props
}) => (
  <svg
    className={className}
    width="17"
    height="17"
    viewBox="0 0 17 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M8.33333 0C3.73333 0 0 3.73333 0 8.33333C0 12.9333 3.73333 16.6667 8.33333 16.6667C12.9333 16.6667 16.6667 12.9333 16.6667 8.33333C16.6667 3.73333 12.9333 0 8.33333 0ZM6.66667 12.5L2.5 8.33333L3.675 7.15833L6.66667 10.1417L12.9917 3.81667L14.1667 5L6.66667 12.5Z"
      fill="#10B981"
    />
  </svg>
);

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-5 h-5',
  ...props
}) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export const BuildingIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-12 h-12',
  ...props
}) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

export const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-5 h-5',
  ...props
}) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

export const LinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-5 h-5',
  ...props
}) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
    />
  </svg>
);

export const BackArrowIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-2 h-3.5',
  ...props
}) => (
  <svg
    className={className}
    width="8"
    height="14"
    viewBox="0 0 8 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M7.00195 1L1.00071 6.99875L6.99946 13"
      stroke="#ADB5BD"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CardIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-2 h-3.5',
  ...props
}) => (
  <svg
    className={className}
    width="27"
    height="22"
    viewBox="0 0 27 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M26.6667 8V16C26.6667 17.4145 26.1048 18.771 25.1046 19.7712C24.1044 20.7714 22.7478 21.3333 21.3333 21.3333H5.33333C3.91885 21.3333 2.56229 20.7714 1.5621 19.7712C0.561903 18.771 0 17.4145 0 16V8H26.6667ZM6.68 13.3333H6.66667C6.49157 13.3342 6.31836 13.3696 6.15693 13.4374C5.9955 13.5052 5.849 13.6041 5.72581 13.7286C5.47701 13.9799 5.33823 14.3197 5.34 14.6733C5.34088 14.8484 5.37623 15.0216 5.44405 15.1831C5.51186 15.3445 5.61081 15.491 5.73524 15.6142C5.85967 15.7374 6.00714 15.8349 6.16925 15.9011C6.33135 15.9673 6.5049 16.0009 6.68 16C7.03362 16 7.37276 15.8595 7.62281 15.6095C7.87286 15.3594 8.01333 15.0203 8.01333 14.6667C8.01333 14.313 7.87286 13.9739 7.62281 13.7239C7.37276 13.4738 7.03362 13.3333 6.68 13.3333ZM14.6667 13.3333H12C11.6464 13.3333 11.3072 13.4738 11.0572 13.7239C10.8071 13.9739 10.6667 14.313 10.6667 14.6667C10.6667 15.0203 10.8071 15.3594 11.0572 15.6095C11.3072 15.8595 11.6464 16 12 16H14.6667C15.0203 16 15.3594 15.8595 15.6095 15.6095C15.8595 15.3594 16 15.0203 16 14.6667C16 14.313 15.8595 13.9739 15.6095 13.7239C15.3594 13.4738 15.0203 13.3333 14.6667 13.3333ZM21.3333 0C22.7478 0 24.1044 0.561903 25.1046 1.5621C26.1048 2.56229 26.6667 3.91885 26.6667 5.33333H0C0 3.91885 0.561903 2.56229 1.5621 1.5621C2.56229 0.561903 3.91885 0 5.33333 0H21.3333Z"
      fill="#71B8EA"
    />
  </svg>
);

export const ChevronUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-5 h-5',
  ...props
}) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-5 h-5',
  ...props
}) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={props.strokeWidth || 2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

export const ProfileIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = '',
  ...props
}) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="32" height="32" rx="16" fill="#95B0C4" />
    <g clipPath="url(#clip0_1877_1406)">
      <path
        d="M16 8.92139C16.6593 8.92139 17.3038 9.11688 17.8519 9.48315C18.4001 9.84943 18.8273 10.37 19.0796 10.9791C19.3319 11.5882 19.3979 12.2584 19.2693 12.905C19.1407 13.5516 18.8232 14.1456 18.357 14.6117C17.8909 15.0779 17.2969 15.3954 16.6503 15.524C16.0037 15.6526 15.3335 15.5866 14.7244 15.3343C14.1153 15.082 13.5947 14.6548 13.2285 14.1066C12.8622 13.5585 12.6667 12.914 12.6667 12.2547L12.67 12.1101C12.7073 11.2519 13.0744 10.4412 13.6948 9.84716C14.3152 9.25308 15.141 8.92144 16 8.92139Z"
        fill="white"
      />
      <path
        d="M17.6985 17.2546C18.8982 17.2546 20.0489 17.6058 20.8973 18.2309C21.7457 18.8561 22.2223 19.7039 22.2223 20.588V21.2546C22.2223 21.6083 22.0316 21.9474 21.6923 22.1974C21.3529 22.4475 20.8927 22.588 20.4127 22.588H11.3651C10.8852 22.588 10.425 22.4475 10.0856 22.1974C9.74625 21.9474 9.5556 21.6083 9.5556 21.2546V20.588C9.5556 19.7039 10.0322 18.8561 10.8806 18.2309C11.729 17.6058 12.8796 17.2546 14.0794 17.2546H17.6985Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_1877_1406">
        <rect width="16" height="16" fill="white" transform="translate(8 7.58789)" />
      </clipPath>
    </defs>
  </svg>
);

// Dashboard nav icons (from components/test)
export const DashboardNavIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_dashboard_nav)">
      <path
        d="M5 4H9C9.26522 4 9.51957 4.10536 9.70711 4.29289C9.89464 4.48043 10 4.73478 10 5V11C10 11.2652 9.89464 11.5196 9.70711 11.7071C9.51957 11.8946 9.26522 12 9 12H5C4.73478 12 4.48043 11.8946 4.29289 11.7071C4.10536 11.5196 4 11.2652 4 11V5C4 4.73478 4.10536 4.48043 4.29289 4.29289C4.48043 4.10536 4.73478 4 5 4Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 16H9C9.26522 16 9.51957 16.1054 9.70711 16.2929C9.89464 16.4804 10 16.7348 10 17V19C10 19.2652 9.89464 19.5196 9.70711 19.7071C9.51957 19.8946 9.26522 20 9 20H5C4.73478 20 4.48043 19.8946 4.29289 19.7071C4.10536 19.5196 4 19.2652 4 19V17C4 16.7348 4.10536 16.4804 4.29289 16.2929C4.48043 16.1054 4.73478 16 5 16Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12H19C19.2652 12 19.5196 12.1054 19.7071 12.2929C19.8946 12.4804 20 12.7348 20 13V19C20 19.2652 19.8946 19.5196 19.7071 19.7071C19.5196 19.8946 19.2652 20 19 20H15C14.7348 20 14.4804 19.8946 14.2929 19.7071C14.1054 19.5196 14 19.2652 14 19V13C14 12.7348 14.1054 12.4804 14.2929 12.2929C14.4804 12.1054 14.7348 12 15 12Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 4H19C19.2652 4 19.5196 4.10536 19.7071 4.29289C19.8946 4.48043 20 4.73478 20 5V7C20 7.26522 19.8946 7.51957 19.7071 7.70711C19.5196 7.89464 19.2652 8 19 8H15C14.7348 8 14.4804 7.89464 14.2929 7.70711C14.1054 7.51957 14 7.26522 14 7V5C14 4.73478 14.1054 4.48043 14.2929 4.29289C14.4804 4.10536 14.7348 4 15 4Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_dashboard_nav">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const CalendarNavIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.16667 0C4.6269 0 5 0.373096 5 0.833333V1.66667H10V0.833333C10 0.373096 10.3731 0 10.8333 0C11.2936 0 11.6667 0.373096 11.6667 0.833333V1.66667H12.5C13.163 1.66667 13.7989 1.93006 14.2678 2.3989C14.7366 2.86774 15 3.50362 15 4.16667V7.5C15 7.96024 14.6269 8.33333 14.1667 8.33333H1.66667V14.1667C1.66667 14.3877 1.75446 14.5996 1.91074 14.7559C2.06702 14.9122 2.27899 15 2.5 15H8.1625C8.62274 15 8.99583 15.3731 8.99583 15.8333C8.99583 16.2936 8.62274 16.6667 8.1625 16.6667H2.5C1.83696 16.6667 1.20107 16.4033 0.732233 15.9344C0.263392 15.4656 0 14.8297 0 14.1667V4.16667C0 3.50363 0.263392 2.86774 0.732233 2.3989C1.20107 1.93006 1.83696 1.66667 2.5 1.66667H3.33333V0.833333C3.33333 0.373096 3.70643 0 4.16667 0ZM3.33333 3.33333H2.5C2.27899 3.33333 2.06702 3.42113 1.91074 3.57741C1.75446 3.73369 1.66667 3.94565 1.66667 4.16667V6.66667H13.3333V4.16667C13.3333 3.94565 13.2455 3.73369 13.0893 3.57741C12.933 3.42113 12.721 3.33333 12.5 3.33333H11.6667V4.16667C11.6667 4.6269 11.2936 5 10.8333 5C10.3731 5 10 4.6269 10 4.16667V3.33333H5V4.16667C5 4.6269 4.6269 5 4.16667 5C3.70643 5 3.33333 4.6269 3.33333 4.16667V3.33333ZM13.3333 10.8333C11.9526 10.8333 10.8333 11.9526 10.8333 13.3333C10.8333 14.714 11.9526 15.8333 13.3333 15.8333C14.714 15.8333 15.8333 14.714 15.8333 13.3333C15.8333 11.9526 14.714 10.8333 13.3333 10.8333ZM9.16667 13.3333C9.16667 11.0321 11.0321 9.16667 13.3333 9.16667C15.6345 9.16667 17.5 11.0321 17.5 13.3333C17.5 15.6345 15.6345 17.5 13.3333 17.5C11.0321 17.5 9.16667 15.6345 9.16667 13.3333ZM13.3333 11.2466C13.7936 11.2466 14.1667 11.6197 14.1667 12.08V12.9881L14.7559 13.5774C15.0814 13.9028 15.0814 14.4305 14.7559 14.7559C14.4305 15.0813 13.9028 15.0813 13.5774 14.7559L12.7441 13.9226C12.5878 13.7663 12.5 13.5543 12.5 13.3333V12.08C12.5 11.6197 12.8731 11.2466 13.3333 11.2466Z"
      fill="currentColor"
    />
  </svg>
);

export const ClientsNavIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_clients_nav)">
      <path
        d="M8 7C8 8.06087 8.42143 9.07828 9.17157 9.82843C9.92172 10.5786 10.9391 11 12 11C13.0609 11 14.0783 10.5786 14.8284 9.82843C15.5786 9.07828 16 8.06087 16 7C16 5.93913 15.5786 4.92172 14.8284 4.17157C14.0783 3.42143 13.0609 3 12 3C10.9391 3 9.92172 3.42143 9.17157 4.17157C8.42143 4.92172 8 5.93913 8 7Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H11.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 18C15 18.7956 15.3161 19.5587 15.8787 20.1213C16.4413 20.6839 17.2044 21 18 21C18.7956 21 19.5587 20.6839 20.1213 20.1213C20.6839 19.5587 21 18.7956 21 18C21 17.2044 20.6839 16.4413 20.1213 15.8787C19.5587 15.3161 18.7956 15 18 15C17.2044 15 16.4413 15.3161 15.8787 15.8787C15.3161 16.4413 15 17.2044 15 18Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.2 20.2L22 22"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_clients_nav">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const ServicesNavIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.33333 1.66667C2.41286 1.66667 1.66667 2.41286 1.66667 3.33333V5C1.66667 5.92047 2.41286 6.66667 3.33333 6.66667H13.3333C14.2538 6.66667 15 5.92047 15 5V3.33333C15 2.41286 14.2538 1.66667 13.3333 1.66667H3.33333ZM3.33333 8.33333C2.89131 8.33333 2.46738 8.50893 2.15482 8.82149C1.84226 9.13405 1.66667 9.55797 1.66667 10V11.6667C1.66667 12.1087 1.84226 12.5326 2.15482 12.8452C2.46738 13.1577 2.89131 13.3333 3.33333 13.3333H8.33333C8.79357 13.3333 9.16667 13.7064 9.16667 14.1667C9.16667 14.6269 8.79357 15 8.33333 15H3.33333C2.44928 15 1.60143 14.6488 0.976311 14.0237C0.351189 13.3986 0 12.5507 0 11.6667V10C0 9.11594 0.351189 8.2681 0.976311 7.64298C1.02568 7.5936 1.07645 7.54594 1.12851 7.50002C0.436474 6.88924 0 5.99559 0 5V3.33333C0 1.49238 1.49238 0 3.33333 0H13.3333C15.1743 0 16.6667 1.49238 16.6667 3.33333V5C16.6667 6.84095 15.1743 8.33333 13.3333 8.33333H3.33333ZM4.16667 3.33333C4.6269 3.33333 5 3.70643 5 4.16667V4.175C5 4.63524 4.6269 5.00833 4.16667 5.00833C3.70643 5.00833 3.33333 4.63524 3.33333 4.175V4.16667C3.33333 3.70643 3.70643 3.33333 4.16667 3.33333ZM13.3341 8.75C13.7944 8.75 14.1675 9.1231 14.1675 9.58333V10.1423C14.4601 10.2457 14.7276 10.402 14.9587 10.5997L15.4432 10.32C15.8418 10.0899 16.3515 10.2264 16.5816 10.625C16.8117 11.0236 16.6752 11.5332 16.2766 11.7633L15.7925 12.0429C15.8198 12.1911 15.8341 12.3439 15.8341 12.5C15.8341 12.656 15.8199 12.8088 15.7925 12.9569L16.2772 13.2365C16.6758 13.4665 16.8126 13.9761 16.5826 14.3748C16.3526 14.7734 15.843 14.9101 15.4443 14.6802L14.9589 14.4001C14.7278 14.5979 14.4601 14.7543 14.1675 14.8577V15.4167C14.1675 15.8769 13.7944 16.25 13.3341 16.25C12.8739 16.25 12.5008 15.8769 12.5008 15.4167V14.8577C12.2083 14.7544 11.9408 14.5981 11.7097 14.4004L11.2247 14.6802C10.8261 14.9101 10.3165 14.7734 10.0865 14.3748C9.8565 13.9761 9.99322 13.4665 10.3919 13.2365L10.8759 12.9573C10.8485 12.809 10.8341 12.6562 10.8341 12.5C10.8341 12.3438 10.8485 12.191 10.8759 12.0427L10.3919 11.7635C9.99322 11.5335 9.8565 11.0239 10.0865 10.6252C10.3165 10.2266 10.8261 10.0899 11.2247 10.3198L11.7097 10.5996C11.9408 10.4019 12.2083 10.2456 12.5008 10.1423V9.58333C12.5008 9.1231 12.8739 8.75 13.3341 8.75ZM12.5989 12.1074C12.6039 12.0994 12.6087 12.0913 12.6135 12.0831C12.6179 12.0754 12.6222 12.0677 12.6264 12.0599C12.7735 11.8238 13.0355 11.6667 13.3341 11.6667C13.6378 11.6667 13.9035 11.8291 14.0492 12.0718C14.0513 12.0756 14.0535 12.0795 14.0557 12.0833C14.0581 12.0874 14.0605 12.0915 14.0629 12.0955C14.1295 12.2153 14.1675 12.3532 14.1675 12.5C14.1675 12.6468 14.1295 12.7847 14.0629 12.9045C14.0604 12.9086 14.058 12.9127 14.0556 12.9169C14.0534 12.9207 14.0513 12.9244 14.0492 12.9282C13.9035 13.1709 13.6378 13.3333 13.3341 13.3333C13.0355 13.3333 12.7735 13.1762 12.6264 12.9401C12.6222 12.9323 12.6179 12.9246 12.6135 12.9169C12.6087 12.9087 12.6039 12.9006 12.5989 12.8926C12.5363 12.7756 12.5008 12.642 12.5008 12.5C12.5008 12.358 12.5363 12.2244 12.5989 12.1074ZM4.16667 10C4.6269 10 5 10.3731 5 10.8333V10.8417C5 11.3019 4.6269 11.675 4.16667 11.675C3.70643 11.675 3.33333 11.3019 3.33333 10.8417V10.8333C3.33333 10.3731 3.70643 10 4.16667 10Z"
      fill="currentColor"
    />
  </svg>
);

export const StaffNavIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.83333 1.66667C4.45262 1.66667 3.33333 2.78595 3.33333 4.16667C3.33333 5.54738 4.45262 6.66667 5.83333 6.66667C7.21405 6.66667 8.33333 5.54738 8.33333 4.16667C8.33333 2.78595 7.21405 1.66667 5.83333 1.66667ZM1.66667 4.16667C1.66667 1.86548 3.53215 0 5.83333 0C8.13452 0 10 1.86548 10 4.16667C10 6.46785 8.13452 8.33333 5.83333 8.33333C3.53215 8.33333 1.66667 6.46785 1.66667 4.16667ZM10.8594 0.734971C10.9735 0.289117 11.4275 0.0202222 11.8734 0.134379C12.7696 0.363859 13.564 0.885109 14.1313 1.61595C14.6986 2.3468 15.0065 3.24566 15.0065 4.17084C15.0065 5.09602 14.6986 5.99488 14.1313 6.72572C13.564 7.45656 12.7696 7.97782 11.8734 8.2073C11.4275 8.32145 10.9735 8.05256 10.8594 7.6067C10.7452 7.16085 11.0141 6.70687 11.46 6.59271C11.9977 6.45502 12.4744 6.14227 12.8147 5.70377C13.1551 5.26526 13.3399 4.72594 13.3399 4.17084C13.3399 3.61573 13.1551 3.07641 12.8147 2.63791C12.4744 2.1994 11.9977 1.88665 11.46 1.74896C11.0141 1.63481 10.7452 1.18083 10.8594 0.734971ZM4.16667 11.6667C3.50363 11.6667 2.86774 11.9301 2.3989 12.3989C1.93006 12.8677 1.66667 13.5036 1.66667 14.1667V15.8333C1.66667 16.2936 1.29357 16.6667 0.833333 16.6667C0.373096 16.6667 0 16.2936 0 15.8333V14.1667C0 13.0616 0.438987 12.0018 1.22039 11.2204C2.00179 10.439 3.0616 10 4.16667 10H7.5C8.60507 10 9.66488 10.439 10.4463 11.2204C11.2277 12.0018 11.6667 13.0616 11.6667 14.1667V15.8333C11.6667 16.2936 11.2936 16.6667 10.8333 16.6667C10.3731 16.6667 10 16.2936 10 15.8333V14.1667C10 13.5036 9.73661 12.8677 9.26777 12.3989C8.79893 11.9301 8.16304 11.6667 7.5 11.6667H4.16667ZM12.5265 10.75C12.6415 10.3044 13.096 10.0364 13.5417 10.1515C14.4321 10.3814 15.2215 10.8994 15.7867 11.6248C16.352 12.3502 16.6614 13.2423 16.6667 14.1619L16.6667 14.1667L16.6667 15.8334C16.6667 16.2936 16.2936 16.6667 15.8333 16.6667C15.3731 16.6667 15 16.2936 15 15.8334V14.1692C14.9963 13.6182 14.8107 13.0839 14.4721 12.6492C14.1329 12.214 13.6593 11.9032 13.125 11.7652C12.6794 11.6502 12.4114 11.1957 12.5265 10.75Z"
      fill="currentColor"
    />
  </svg>
);

export const PaymentNavIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 17 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.732233 0.732233C1.20107 0.263392 1.83696 0 2.5 0H10.8333C11.4964 0 12.1323 0.263392 12.6011 0.732233C13.0699 1.20107 13.3333 1.83696 13.3333 2.5V3.33333H14.1667C15.5474 3.33333 16.6667 4.45262 16.6667 5.83333V10.8333C16.6667 12.214 15.5474 13.3333 14.1667 13.3333H5.83333C4.45262 13.3333 3.33333 12.214 3.33333 10.8333V10H2.5C1.83696 10 1.20107 9.73661 0.732233 9.26777C0.263392 8.79893 0 8.16304 0 7.5V2.5C0 1.83696 0.263392 1.20107 0.732233 0.732233ZM5 10.8333C5 11.2936 5.3731 11.6667 5.83333 11.6667H14.1667C14.6269 11.6667 15 11.2936 15 10.8333V5.83333C15 5.3731 14.6269 5 14.1667 5H5.83333C5.3731 5 5 5.3731 5 5.83333V10.8333ZM11.6667 3.33333H5.83333C4.45262 3.33333 3.33333 4.45262 3.33333 5.83333V8.33333H2.5C2.27899 8.33333 2.06702 8.24554 1.91074 8.08926C1.75446 7.93298 1.66667 7.72101 1.66667 7.5V2.5C1.66667 2.27899 1.75446 2.06702 1.91074 1.91074C2.06702 1.75446 2.27899 1.66667 2.5 1.66667H10.8333C11.0543 1.66667 11.2663 1.75446 11.4226 1.91074C11.5789 2.06702 11.6667 2.27899 11.6667 2.5V3.33333ZM10 7.5C9.53976 7.5 9.16667 7.8731 9.16667 8.33333C9.16667 8.79357 9.53976 9.16667 10 9.16667C10.4602 9.16667 10.8333 8.79357 10.8333 8.33333C10.8333 7.8731 10.4602 7.5 10 7.5ZM7.5 8.33333C7.5 6.95262 8.61929 5.83333 10 5.83333C11.3807 5.83333 12.5 6.95262 12.5 8.33333C12.5 9.71405 11.3807 10.8333 10 10.8333C8.61929 10.8333 7.5 9.71404 7.5 8.33333Z"
      fill="currentColor"
    />
  </svg>
);

export const ReportsNavIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_reports_nav)">
      <path
        d="M3 3V21H21"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 18V21"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 16V21"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 13V21"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 16V21"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 11C9 11 8 6 12 6C16 6 15 11 21 11"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_reports_nav">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const MarketingNavIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_marketing_nav)">
      <path
        d="M11.933 5H5V21H18V13"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 17H9"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 13H14V9H9V13Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 5V3"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 6L20 4"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 9H21"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_marketing_nav">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const EducationNavIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_education_nav)">
      <path
        d="M22 9L12 5L2 9L12 13L22 9ZM22 9V15"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 10.6001V16.0001C6 16.7957 6.63214 17.5588 7.75736 18.1214C8.88258 18.684 10.4087 19.0001 12 19.0001C13.5913 19.0001 15.1174 18.684 16.2426 18.1214C17.3679 17.5588 18 16.7957 18 16.0001V10.6001"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_education_nav">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

// Test/settings nav icons (from components/test)
export const BusinessProfileIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_business_profile)">
      <path
        d="M14 3V7C14 7.26522 14.1054 7.51957 14.2929 7.70711C14.4804 7.89464 14.7348 8 15 8H19"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 12V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H14L19 8V12"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 21H19M5 18H19M5 15H19"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_business_profile">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const CalendarTestIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.83329 1.66675C6.29353 1.66675 6.66663 2.03984 6.66663 2.50008V3.33341H11.6666V2.50008C11.6666 2.03984 12.0397 1.66675 12.5 1.66675C12.9602 1.66675 13.3333 2.03984 13.3333 2.50008V3.33341H14.1666C14.8297 3.33341 15.4656 3.59681 15.9344 4.06565C16.4032 4.53449 16.6666 5.17037 16.6666 5.83341V9.16675C16.6666 9.62699 16.2935 10.0001 15.8333 10.0001H3.33329V15.8334C3.33329 16.0544 3.42109 16.2664 3.57737 16.4227C3.73365 16.579 3.94561 16.6667 4.16663 16.6667H9.82913C10.2894 16.6667 10.6625 17.0398 10.6625 17.5001C10.6625 17.9603 10.2894 18.3334 9.82913 18.3334H4.16663C3.50358 18.3334 2.8677 18.07 2.39886 17.6012C1.93002 17.1323 1.66663 16.4965 1.66663 15.8334V5.83341C1.66663 5.17037 1.93002 4.53449 2.39886 4.06565C2.8677 3.59681 3.50358 3.33341 4.16663 3.33341H4.99996V2.50008C4.99996 2.03984 5.37306 1.66675 5.83329 1.66675ZM4.99996 5.00008H4.16663C3.94561 5.00008 3.73365 5.08788 3.57737 5.24416C3.42109 5.40044 3.33329 5.6124 3.33329 5.83341V8.33341H15V5.83341C15 5.6124 14.9122 5.40044 14.7559 5.24416C14.5996 5.08788 14.3876 5.00008 14.1666 5.00008H13.3333V5.83341C13.3333 6.29365 12.9602 6.66675 12.5 6.66675C12.0397 6.66675 11.6666 6.29365 11.6666 5.83341V5.00008H6.66663V5.83341C6.66663 6.29365 6.29353 6.66675 5.83329 6.66675C5.37306 6.66675 4.99996 6.29365 4.99996 5.83341V5.00008ZM15 12.5001C13.6192 12.5001 12.5 13.6194 12.5 15.0001C12.5 16.3808 13.6192 17.5001 15 17.5001C16.3807 17.5001 17.5 16.3808 17.5 15.0001C17.5 13.6194 16.3807 12.5001 15 12.5001ZM10.8333 15.0001C10.8333 12.6989 12.6988 10.8334 15 10.8334C17.3011 10.8334 19.1666 12.6989 19.1666 15.0001C19.1666 17.3013 17.3011 19.1667 15 19.1667C12.6988 19.1667 10.8333 17.3013 10.8333 15.0001ZM15 12.9134C15.4602 12.9134 15.8333 13.2865 15.8333 13.7467V14.6549L16.4225 15.2441C16.748 15.5696 16.748 16.0972 16.4225 16.4226C16.0971 16.7481 15.5695 16.7481 15.244 16.4226L14.4107 15.5893C14.2544 15.433 14.1666 15.2211 14.1666 15.0001V13.7467C14.1666 13.2865 14.5397 12.9134 15 12.9134Z"
      fill="currentColor"
    />
  </svg>
);

export const EducationTestIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_education_test)">
      <path
        d="M22 9L12 5L2 9L12 13L22 9ZM22 9V15"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 10.6001V16.0001C6 16.7957 6.63214 17.5588 7.75736 18.1214C8.88258 18.684 10.4087 19.0001 12 19.0001C13.5913 19.0001 15.1174 18.684 16.2426 18.1214C17.3679 17.5588 18 16.7957 18 16.0001V10.6001"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_education_test">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const LocationsIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_locations)">
      <path
        d="M3 7L9 4L15 7L21 4V17L15 20L9 17L3 20V7Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 4V17M15 7V20"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_locations">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const NotificationsIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_notifications)">
      <path
        d="M10 5C10 4.46957 10.2107 3.96086 10.5858 3.58579C10.9609 3.21071 11.4696 3 12 3C12.5304 3 13.0391 3.21071 13.4142 3.58579C13.7893 3.96086 14 4.46957 14 5C15.1484 5.54303 16.1274 6.38833 16.8321 7.4453C17.5367 8.50227 17.9404 9.73107 18 11V14C18.0753 14.6217 18.2954 15.2171 18.6428 15.7381C18.9902 16.2592 19.4551 16.6914 20 17H4C4.54494 16.6914 5.00981 16.2592 5.35719 15.7381C5.70457 15.2171 5.92474 14.6217 6 14V11C6.05956 9.73107 6.4633 8.50227 7.16795 7.4453C7.8726 6.38833 8.85159 5.54303 10 5Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 17V18C9 18.7956 9.31607 19.5587 9.87868 20.1213C10.4413 20.6839 11.2044 21 12 21C12.7956 21 13.5587 20.6839 14.1213 20.1213C14.6839 19.5587 15 18.7956 15 18V17"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.0001 6.727C20.3441 5.30025 19.3916 4.02969 18.2061 3M3 6.727C3.65535 5.30044 4.60715 4.0299 5.792 3"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_notifications">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const PaymentsTestIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.39886 4.06548C2.8677 3.59664 3.50358 3.33325 4.16663 3.33325H12.5C13.163 3.33325 13.7989 3.59664 14.2677 4.06548C14.7366 4.53433 15 5.17021 15 5.83325V6.66659H15.8333C17.214 6.66659 18.3333 7.78587 18.3333 9.16658V14.1666C18.3333 15.5473 17.214 16.6666 15.8333 16.6666H7.49996C6.11925 16.6666 4.99996 15.5473 4.99996 14.1666V13.3333H4.16663C3.50358 13.3333 2.8677 13.0699 2.39886 12.601C1.93002 12.1322 1.66663 11.4963 1.66663 10.8333V5.83325C1.66663 5.17021 1.93002 4.53433 2.39886 4.06548ZM6.66663 14.1666C6.66663 14.6268 7.03972 14.9999 7.49996 14.9999H15.8333C16.2935 14.9999 16.6666 14.6268 16.6666 14.1666V9.16658C16.6666 8.70635 16.2935 8.33325 15.8333 8.33325H7.49996C7.03972 8.33325 6.66663 8.70635 6.66663 9.16658V14.1666ZM13.3333 6.66659H7.49996C6.11925 6.66659 4.99996 7.78587 4.99996 9.16658V11.6666H4.16663C3.94561 11.6666 3.73365 11.5788 3.57737 11.4225C3.42109 11.2662 3.33329 11.0543 3.33329 10.8333V5.83325C3.33329 5.61224 3.42109 5.40028 3.57737 5.244C3.73365 5.08772 3.94561 4.99992 4.16663 4.99992H12.5C12.721 4.99992 12.9329 5.08772 13.0892 5.244C13.2455 5.40028 13.3333 5.61224 13.3333 5.83325V6.66659ZM11.6666 10.8333C11.2064 10.8333 10.8333 11.2063 10.8333 11.6666C10.8333 12.1268 11.2064 12.4999 11.6666 12.4999C12.1269 12.4999 12.5 12.1268 12.5 11.6666C12.5 11.2063 12.1269 10.8333 11.6666 10.8333ZM9.16663 11.6666C9.16663 10.2859 10.2859 9.16658 11.6666 9.16658C13.0473 9.16658 14.1666 10.2859 14.1666 11.6666C14.1666 13.0473 13.0473 14.1666 11.6666 14.1666C10.2859 14.1666 9.16663 13.0473 9.16663 11.6666Z"
      fill="currentColor"
    />
  </svg>
);

export const PoliciesIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_policies)">
      <path
        d="M12 3C14.3358 5.06658 17.3844 6.14257 20.5 6C20.9535 7.54302 21.0923 9.16147 20.9081 10.7592C20.7238 12.3569 20.2203 13.9013 19.4274 15.3005C18.6344 16.6998 17.5683 17.9254 16.2924 18.9045C15.0165 19.8836 13.5567 20.5962 12 21C10.4432 20.5962 8.98344 19.8836 7.7075 18.9045C6.43157 17.9254 5.36547 16.6998 4.57255 15.3005C3.77964 13.9013 3.27609 12.3569 3.09183 10.7592C2.90757 9.16147 3.04636 7.54302 3.49996 6C6.61548 6.14257 9.66413 5.06658 12 3Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 11C11 11.2652 11.1054 11.5196 11.2929 11.7071C11.4804 11.8946 11.7348 12 12 12C12.2652 12 12.5196 11.8946 12.7071 11.7071C12.8946 11.5196 13 11.2652 13 11C13 10.7348 12.8946 10.4804 12.7071 10.2929C12.5196 10.1054 12.2652 10 12 10C11.7348 10 11.4804 10.1054 11.2929 10.2929C11.1054 10.4804 11 10.7348 11 11Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12V14.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_policies">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const SecurityIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_security)">
      <path
        d="M15 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V13C5 12.4696 5.21071 11.9609 5.58579 11.5858C5.96086 11.2107 6.46957 11 7 11H17C17.3516 10.9999 17.697 11.0924 18.0015 11.2683C18.3059 11.4442 18.5586 11.6973 18.734 12.002"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 16C11 16.2652 11.1054 16.5196 11.2929 16.7071C11.4804 16.8946 11.7348 17 12 17C12.2652 17 12.5196 16.8946 12.7071 16.7071C12.8946 16.5196 13 16.2652 13 16C13 15.7348 12.8946 15.4804 12.7071 15.2929C12.5196 15.1054 12.2652 15 12 15C11.7348 15 11.4804 15.1054 11.2929 15.2929C11.1054 15.4804 11 15.7348 11 16Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 11V7C8 5.93913 8.42143 4.92172 9.17157 4.17157C9.92172 3.42143 10.9391 3 12 3C13.0609 3 14.0783 3.42143 14.8284 4.17157C15.5786 4.92172 16 5.93913 16 7V11"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 16V19M19 22V22.01"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_security">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_settings)">
      <path
        d="M10.325 4.317C10.751 2.561 13.249 2.561 13.675 4.317C13.7389 4.5808 13.8642 4.82578 14.0407 5.032C14.2172 5.23822 14.4399 5.39985 14.6907 5.50375C14.9414 5.60764 15.2132 5.65085 15.4838 5.62987C15.7544 5.60889 16.0162 5.5243 16.248 5.383C17.791 4.443 19.558 6.209 18.618 7.753C18.4769 7.98466 18.3924 8.24634 18.3715 8.51677C18.3506 8.78721 18.3938 9.05877 18.4975 9.30938C18.6013 9.55999 18.7627 9.78258 18.9687 9.95905C19.1747 10.1355 19.4194 10.2609 19.683 10.325C21.439 10.751 21.439 13.249 19.683 13.675C19.4192 13.7389 19.1742 13.8642 18.968 14.0407C18.7618 14.2172 18.6001 14.4399 18.4963 14.6907C18.3924 14.9414 18.3491 15.2132 18.3701 15.4838C18.3911 15.7544 18.4757 16.0162 18.617 16.248C19.557 17.791 17.791 19.558 16.247 18.618C16.0153 18.4769 15.7537 18.3924 15.4832 18.3715C15.2128 18.3506 14.9412 18.3938 14.6906 18.4975C14.44 18.6013 14.2174 18.7627 14.0409 18.9687C13.8645 19.1747 13.7391 19.4194 13.675 19.683C13.249 21.439 10.751 21.439 10.325 19.683C10.2611 19.4192 10.1358 19.1742 9.95929 18.968C9.7828 18.7618 9.56011 18.6001 9.30935 18.4963C9.05859 18.3924 8.78683 18.3491 8.51621 18.3701C8.24559 18.3911 7.98375 18.4757 7.752 18.617C6.209 19.557 4.442 17.791 5.382 16.247C5.5231 16.0153 5.60755 15.7537 5.62848 15.4832C5.64942 15.2128 5.60624 14.9412 5.50247 14.6906C5.3987 14.44 5.23726 14.2174 5.03127 14.0409C4.82529 13.8645 4.58056 13.7391 4.317 13.675C2.561 13.249 2.561 10.751 4.317 10.325C4.5808 10.2611 4.82578 10.1358 5.032 9.95929C5.23822 9.7828 5.39985 9.56011 5.50375 9.30935C5.60764 9.05859 5.65085 8.78683 5.62987 8.51621C5.60889 8.24559 5.5243 7.98375 5.383 7.752C4.443 6.209 6.209 4.442 7.753 5.382C8.753 5.99 10.049 5.452 10.325 4.317Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_settings">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const SubscriptionIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_subscription)">
      <path
        d="M3 21H21"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 21V7L13 3V21"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 21V11L13 7"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9V9.01M9 12V12.01M9 15V15.01M9 18V18.01"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_subscription">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const UserProfileIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-4 h-4',
  ...props
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_user_profile)">
      <path
        d="M8 7C8 8.06087 8.42143 9.07828 9.17157 9.82843C9.92172 10.5786 10.9391 11 12 11C13.0609 11 14.0783 10.5786 14.8284 9.82843C15.5786 9.07828 16 8.06087 16 7C16 5.93913 15.5786 4.92172 14.8284 4.17157C14.0783 3.42143 13.0609 3 12 3C10.9391 3 9.92172 3.42143 9.17157 4.17157C8.42143 4.92172 8 5.93913 8 7Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_user_profile">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
