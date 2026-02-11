import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      userData?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        status: number;
        dashboardUrl?: string;
        subdomain?: string;
        onboarding_completed?: boolean;
        onboarding_current_step?: number;
      };
      accessToken?: string;
      refreshToken?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    status?: number;
    dashboardUrl?: string;
    subdomain?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    userData?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      status: number;
      dashboardUrl?: string;
      subdomain?: string;
      onboarding_completed?: boolean;
      onboarding_current_step?: number;
    };
  }
}



