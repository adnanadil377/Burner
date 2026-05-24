/**
 * API Service with Automatic Token Refresh
 * 
 * Authentication Flow:
 * 1. Access Token: Short-lived JWT stored in localStorage ('access_token')
 * 2. Refresh Token: Long-lived token stored in httpOnly cookie (never accessible to JS)
 * 3. When access token expires (401), automatically refresh using cookie
 * 4. Refresh happens once, preventing infinite loops
 * 5. If refresh fails, user is logged out and redirected to /login
 * 
 * Security Benefits:
 * - Refresh token cannot be stolen via XSS (httpOnly cookie)
 * - Access token expires quickly, limiting damage if stolen
 * - CSRF protected by SameSite cookie policy
 */

import { useAuthStore } from '../stores/useAuthStore';

const API_URL = "http://localhost:8000";

let refreshPromise: Promise<string> | null = null;

/**
 * Refresh the access token using the refresh token from httpOnly cookies
 * Note: Refresh token is NEVER stored in localStorage - only in httpOnly cookies
 */
/**
 * Refresh the access token using the refresh token from httpOnly cookies
 * Handles concurrency to prevent multiple refresh calls
 */
const refreshAccessToken = async (): Promise<string> => {
  // Return existing promise if a refresh is already in progress
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Critical: include httpOnly cookies with refresh token
      });

      if (!response.ok) {
        // Refresh token is invalid or expired, logout user
        localStorage.removeItem('access_token');
        useAuthStore.getState().logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();
      const newToken = data.access_token;

      // Update only access token in localStorage (refresh token stays in httpOnly cookie)
      localStorage.setItem('access_token', newToken);

      // Update global auth store state
      useAuthStore.getState().login(newToken);

      return newToken;
    } catch (error) {
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Make an authenticated request with automatic token refresh
 * Access token: stored in localStorage
 * Refresh token: stored in httpOnly cookie (never accessible to JS)
 */
const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('access_token');

  // First attempt with current access token
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Critical: include httpOnly cookies in all requests
  });

  // Don't try to refresh if this IS the refresh endpoint (prevent infinite loop)
  const isRefreshEndpoint = url.includes('/auth/refresh');

  // If 401 Unauthorized and not the refresh endpoint, try to refresh the access token
  if (response.status === 401 && !isRefreshEndpoint) {
    // If we're already on the login page, don't attempt to refresh.
    // This prevents infinite loops where a 401 on login page triggers refresh -> fail -> redirect to login.
    if (window.location.pathname === '/login') {
      return response;
    }

    try {
      // Wait for the refresh to complete (handles concurrency internally)
      const newToken = await refreshAccessToken();

      // Retry the original request with new access token
      const newHeaders = {
        ...headers,
        'Authorization': `Bearer ${newToken}`,
      };

      response = await fetch(url, {
        ...options,
        headers: newHeaders,
        credentials: 'include',
      });
    } catch (error) {
      throw error;
    }
  } else if (response.status === 401 && isRefreshEndpoint) {
    // If refresh endpoint itself returns 401, the refresh token is invalid - logout immediately
    localStorage.removeItem('access_token');
    useAuthStore.getState().logout(); // Fix: Update global state to prevent loop
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  return response;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export interface Video {
  id: number;
  user_id: string;
  s3_key: string;
  bucket: string;
  original_name: string;
  status: string;
}

export interface Subtitle {
  id: string;
  start: number;
  end: number;
  text: string;
}

export interface Transcription {
  id: number;
  video_id: number;
  subtitles: Subtitle[];
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface PresignedUrlResponse {
  upload_url: string;
  file_key: string;
  video_id: number;
}

export interface VideoCompletionResponse {
  message: string;
  video: {
    id: number;
    status: string;
    original_name: string;
  };
}

export const api = {
  // Get all user videos
  getUserVideos: async (): Promise<{ all_video: Video[] }> => {
    const response = await authenticatedFetch(`${API_URL}/video/get_user_videos`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }
    return response.json();
  },

  // Get video download URL
  getVideoDownloadUrl: async (fileName: string): Promise<{ download_url: string }> => {
    const response = await authenticatedFetch(
      `${API_URL}/video/download?file_name=${encodeURIComponent(fileName)}`,
      { method: 'GET' }
    );
    if (!response.ok) {
      throw new Error('Failed to get download URL');
    }
    return response.json();
  },

  // Get transcription for a video
  getTranscription: async (videoId: number): Promise<Transcription> => {
    const response = await authenticatedFetch(`${API_URL}/video/transcription/${videoId}`, {
      method: 'GET',
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('NOT_FOUND');
      }
      throw new Error('Failed to fetch transcription');
    }
    return response.json();
  },

  // Start transcription for a video
  startTranscription: async (videoId: number): Promise<{ message: string; task_id: string; video_id: number }> => {
    const response = await authenticatedFetch(`${API_URL}/video/transcribe?video_id=${videoId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to start transcription');
    }
    return response.json();
  },

  // Update transcription/subtitles for a video
  updateTranscription: async (videoId: number, subtitles: Subtitle[]): Promise<{ message: string; transcription: Transcription }> => {
    const response = await authenticatedFetch(`${API_URL}/video/transcription/${videoId}`, {
      method: 'PUT',
      body: JSON.stringify({ subtitles }),
    });
    if (!response.ok) {
      throw new Error('Failed to update transcription');
    }
    return response.json();
  },

  // Regenerate transcription for a video
  regenerateTranscription: async (videoId: number): Promise<{ message: string; task_id: string; video_id: number }> => {
    const response = await authenticatedFetch(`${API_URL}/video/transcription/${videoId}/regenerate`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to regenerate transcription');
    }
    return response.json();
  },

  // Initiate video upload (get presigned URL)
  initiateUpload: async (fileName: string, fileType: string): Promise<PresignedUrlResponse> => {
    const response = await authenticatedFetch(
      `${API_URL}/video/upload?file_name=${encodeURIComponent(fileName)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': fileType,
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }

    return response.json();
  },

  // Confirm upload and start processing
  confirmUpload: async (videoId: number): Promise<VideoCompletionResponse> => {
    const response = await authenticatedFetch(
      `${API_URL}/video/upload-success?video_id=${videoId}`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to confirm upload');
    }

    return response.json();
  },

  // Restore session using refresh token (manual trigger)
  restoreSession: async (): Promise<string> => {
    return refreshAccessToken();
  },
};
