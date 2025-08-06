// Common Types
export interface User {
  id: string;
  username: string;
  email: string;
  credits: number;
}

// M13 - Leagues Types
export interface League {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  rules: string[];
  prizeTable: Prize[];
  status: "upcoming" | "active" | "completed";
}

export interface Prize {
  rank: number;
  reward: string;
  credits?: number;
}

export interface LeagueEntry {
  id: string;
  userId: string;
  leagueId: string;
  joinedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  accuracy: number;
  timeScore: number;
  totalScore: number;
}

// M14 - Leaderboard Types
export interface SpotlightPlayer {
  id: string;
  username: string;
  achievement: string;
  date: string;
  score: number;
}

export interface GlobalLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalScore: number;
  subject?: string;
}

// M15 - Readers Types
export interface Reader {
  id: string;
  title: string;
  description: string;
  pageCount: number;
  cost: number;
  category: string;
  thumbnail?: string;
  filePath: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  readerId: string;
  purchasedAt: string;
  downloadCount: number;
}

export interface DownloadLink {
  url: string;
  expiresAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}
