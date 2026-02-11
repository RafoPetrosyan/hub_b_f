import axios from 'axios';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
        accessToken: { label: 'Access Token', type: 'text' },
        refreshToken: { label: 'Refresh Token', type: 'text' },
        userData: { label: 'User Data', type: 'text' }, // JSON stringified user data for 2FA login
      },
      async authorize(credentials) {
        try {
          // Handle token refresh or 2FA login - if accessToken is provided, skip login
          if (credentials?.accessToken) {
            // If userData is provided (2FA login), parse and use it
            // Otherwise, treat as token refresh and preserve existing userData
            let userData = null;
            if (credentials.userData) {
              try {
                userData = JSON.parse(credentials.userData);
              } catch (e) {
                console.error('Failed to parse userData:', e);
              }
            }

            if (userData) {
              // 2FA login - return user with new tokens and user data
              return {
                id: userData.id,
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                phone: userData.phone,
                status: userData.status,
                subdomain: userData.subdomain,
                dashboardUrl: userData.dashboardUrl,
                onboarding_completed: userData.onboarding_completed,
                onboarding_current_step: userData.onboarding_current_step,
                accessToken: credentials.accessToken,
                refreshToken: credentials.refreshToken || '',
              };
            } else {
              // Token refresh - return minimal user object, JWT callback will preserve existing userData
              return {
                id: '', // Will be preserved from existing token in JWT callback
                email: '', // Will be preserved from existing token in JWT callback
                accessToken: credentials.accessToken,
                refreshToken: credentials.refreshToken || '',
              };
            }
          }

          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/login`, {
            username: credentials?.username,
            password: credentials?.password,
          });

          const user = {
            ...res.data?.user,
            subdomain: res.data?.subdomain,
            dashboardUrl: res.data?.dashboardUrl,
          };
          const accessToken = res.data?.accessToken;
          const refreshToken = res.data?.refreshToken;
          const onboarding = res.data?.onboarding;

          if (!user || !accessToken) return null;

          // Extract onboarding data
          const onboardingCompleted = onboarding ? onboarding?.completed : true;
          const onboardingCurrentStep = onboarding ? onboarding?.current_step : 14;

          return {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone,
            status: user.status,
            subdomain: res.data?.subdomain,
            dashboardUrl: res.data?.dashboardUrl,
            accessToken,
            refreshToken,
            onboarding_completed: onboardingCompleted,
            onboarding_current_step: onboardingCurrentStep,
          };
        } catch (error: any) {
          console.log(error.response.data.code, 'error');
          // If it's our verification required error, re-throw it
          if (error.code === 'VERIFICATION_REQUIRED') {
            throw error;
          }

          // Check if 2FA is required
          const errorCode = error?.response?.data?.code;
          if (errorCode === '2FA_REQUIRED') {
            const twoFAError: any = new Error('2FA_REQUIRED');
            twoFAError.code = '2FA_REQUIRED';
            twoFAError.user_id = error?.response?.data?.user_id;
            throw twoFAError;
          }

          // Status: 0 checks removed - onboarding completion is now the indicator

          throw new Error(
            error?.response?.data?.message || error?.response?.data?.error || 'Invalid credentials'
          );
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial login or token refresh
      if (user) {
        // Check if this is a token refresh (has accessToken but empty id/email)
        const isTokenRefresh =
          (user as any).accessToken &&
          (!user.id || user.id === '') &&
          (!user.email || user.email === '');

        if (isTokenRefresh && token.userData) {
          // Token refresh - update tokens but preserve existing userData
          token.accessToken = (user as any).accessToken;
          if ((user as any).refreshToken) {
            token.refreshToken = (user as any).refreshToken;
          }
          // userData remains unchanged from existing token
        } else {
          // Initial login - set new tokens and userData
          token.accessToken = (user as any).accessToken;
          token.refreshToken = (user as any).refreshToken;
          token.userData = {
            id: user.id,
            first_name: (user as any).first_name,
            last_name: (user as any).last_name,
            email: user.email,
            phone: (user as any).phone,
            status: (user as any).status,
            subdomain: (user as any).subdomain,
            dashboardUrl: (user as any).dashboardUrl,
            onboarding_completed: (user as any).onboarding_completed ?? false,
            onboarding_current_step: (user as any).onboarding_current_step ?? 1,
          };
        }
      }

      // Allow session update
      if (trigger === 'update' && session?.userData) {
        token.userData = {
          // @ts-ignore
          ...token.userData,
          ...session.userData,
        };
      }

      if (trigger === 'update' && session?.accessToken) {
        token.accessToken = session.accessToken;
      }

      if (trigger === 'update' && session?.refreshToken) {
        token.refreshToken = session.refreshToken;
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        userData: token.userData,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      } as any;

      return session;
    },
  },

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};
