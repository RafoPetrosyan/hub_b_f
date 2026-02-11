import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/constants/constants';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Queue to store failed requests while refreshing
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    // Get access token from localStorage (set by dashboard layout)
    const accessToken = localStorage.getItem('accessToken') || '';
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;

    const xTenant = localStorage.getItem('x-tenant') || '';
    if (xTenant) config.headers['x-tenant'] = xTenant;

    // For FormData, let axios/browser set Content-Type automatically with boundary
    // Don't manually set Content-Type for FormData requests
    if (config.data instanceof FormData) {
      // Axios will automatically set Content-Type to multipart/form-data with boundary
      // We just need to ensure we don't override it
    }

    return config;
  }
);

httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (typeof window === 'undefined') {
        return Promise.reject(error);
      }

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return httpClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Make request to refresh token endpoint
        const refreshResponse = await axios.post(`${API_BASE_URL}/token/refresh`, {
          refreshToken,
        });

        const newAccessToken = refreshResponse.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('Failed to get new access token');
        }

        // Update localStorage
        localStorage.setItem('accessToken', newAccessToken);

        // Update NextAuth session using signIn
        // The JWT callback will preserve existing userData when it detects token refresh
        const { signIn } = await import('next-auth/react');
        await signIn('credentials', {
          redirect: false,
          accessToken: newAccessToken,
          refreshToken: refreshToken,
        });

        // Update the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Process queued requests
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Retry the original request
        return httpClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth data and sign out
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken'); // Legacy key

        // Sign out from NextAuth if on client side
        const { signOut } = await import('next-auth/react');
        signOut({ redirect: true, callbackUrl: '/' });

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default httpClient;
