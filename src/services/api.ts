/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import {
  ApiResponse,
  League,
  LeaderboardEntry,
  Reader,
  Purchase,
  DownloadLink,
  GlobalLeaderboardEntry,
} from "../types";

// Environment-aware base URL configuration
const getBaseUrl = (): string => {
  // Check for explicit environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Detect environment
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5001";
  } else {
    // Production deployment on Vercel
    return "https://50cube-backend.vercel.app";
  }
};

const BASE_URL = getBaseUrl();

console.log("🔗 API Base URL:", BASE_URL);
console.log("🌍 Current hostname:", window.location.hostname);

interface LeagueSubmissionData {
  answers?: unknown[];
  completionTime?: number;
  accuracy?: number;
  [key: string]: unknown;
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 3000,
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(
      `📡 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${
        config.url
      }`
    );
    return config;
  },
  (error: unknown) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error("❌ API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Helper function for API calls
const apiCall = async <T>(
  requestFn: () => Promise<AxiosResponse<ApiResponse<T>>>,
  errorMessage: string
): Promise<ApiResponse<T>> => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    console.error(`API Call Failed: ${errorMessage}`, error);

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
        return {
          success: false,
          error: `Unable to connect to server at ${BASE_URL}. Please check if the backend is running.`,
        };
      } else if (error.code === "ECONNABORTED") {
        return {
          success: false,
          error: "Request timeout. The server might be experiencing high load.",
        };
      } else if (error.response?.status === 404) {
        return {
          success: false,
          error: "API endpoint not found. Please check the backend routes.",
        };
      } else if (error.response?.data?.error) {
        return {
          success: false,
          error: error.response.data.error,
        };
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// M13 - Leagues API (Required + Essential for UI)
export const leaguesApi = {
  // ESSENTIAL: List all leagues (needed for M13 UI - entry page)
  getLeagues: async (): Promise<ApiResponse<League[]>> => {
    return apiCall(() => api.get("/api/leagues"), "Failed to fetch leagues");
  },

  // ESSENTIAL: Get specific league details (needed for M13 UI - rules/prize table)
  getLeague: async (id: string): Promise<ApiResponse<League>> => {
    return apiCall(
      () => api.get(`/api/leagues/${id}`),
      "Failed to fetch league details"
    );
  },

  // REQUIRED: Join a league - POST /api/leagues/enter
  enterLeague: async (leagueId: string): Promise<ApiResponse> => {
    return apiCall(
      () => api.post("/api/leagues/enter", { leagueId }),
      "Failed to join league"
    );
  },

  // REQUIRED: Submit league results - POST /api/leagues/submit
  submitLeague: async (
    leagueId: string,
    data: LeagueSubmissionData
  ): Promise<ApiResponse> => {
    return apiCall(
      () => api.post("/api/leagues/submit", { leagueId, ...data }),
      "Failed to submit league data"
    );
  },

  // REQUIRED: Get leaderboard for a league - GET /api/leagues/:id/leaderboard
  getLeaderboard: async (
    leagueId: string
  ): Promise<ApiResponse<LeaderboardEntry[]>> => {
    return apiCall(
      () => api.get(`/api/leagues/${leagueId}/leaderboard`),
      "Failed to fetch leaderboard"
    );
  },
};

// M14 - Leaderboard API (Required only)
// M14 - Leaderboard API (Required only)
export const leaderboardApi = {
  // REQUIRED: Get global or subject-specific leaderboard - GET /api/leaderboard?scope=global|subject
  getGlobalLeaderboard: async (
    scope: "global" | "subject" = "global",
    subject?: string
  ): Promise<ApiResponse<GlobalLeaderboardEntry[]>> => {
    return apiCall(() => {
      const params = new URLSearchParams({ scope });
      if (subject) params.append("subject", subject);
      return api.get(`/api/leaderboard?${params}`);
    }, "Failed to fetch global leaderboard");
  },

  // REQUIRED: Get spotlight data - GET /api/leaderboard/spotlight
  getSpotlight: async (): Promise<ApiResponse<any>> => {
    return apiCall(
      () => api.get("/api/leaderboard/spotlight"),
      "Failed to fetch spotlight data"
    );
  },

  // REQUIRED: Get stats data - GET /api/leaderboard/stats
  getStats: async (): Promise<ApiResponse<any>> => {
    return apiCall(
      () => api.get("/api/leaderboard/stats"),
      "Failed to fetch stats data"
    );
  },
};

// M15 - Readers API (Required + Essential for UI)
export const readersApi = {
  // REQUIRED: Get readers catalog - GET /api/readers/catalog
  getCatalog: async (): Promise<ApiResponse<Reader[]>> => {
    return apiCall(
      () => api.get("/api/readers/catalog"),
      "Failed to fetch readers catalog"
    );
  },

  // REQUIRED: Buy a reader - POST /api/readers/buy
  buyReader: async (readerId: string): Promise<ApiResponse<Purchase>> => {
    return apiCall(
      () => api.post("/api/readers/buy", { readerId }),
      "Failed to buy reader"
    );
  },

  // REQUIRED: Get download link for purchased reader - GET /api/readers/download/:id
  getDownloadLink: async (
    readerId: string
  ): Promise<ApiResponse<DownloadLink>> => {
    return apiCall(
      () => api.get(`/api/readers/download/${readerId}`),
      "Failed to get download link"
    );
  },

  // ESSENTIAL: Get user's purchased readers (needed for M15 test checklist - "item appears in library")
  getLibrary: async (): Promise<ApiResponse<Purchase[]>> => {
    return apiCall(
      () => api.get("/api/readers/library"),
      "Failed to fetch library"
    );
  },
};

export default api;
