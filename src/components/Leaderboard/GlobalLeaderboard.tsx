import React, { useState, useEffect, useCallback } from "react";
import { Trophy, TrendingUp, Users, Target } from "lucide-react";

interface GlobalLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalScore: number;
  subject?: string;
  accuracy?: number;
  completedChallenges?: number;
  weeklyChange?: number;
}

interface LeaderboardStats {
  totalPlayers: number;
  averageScore: number;
  topScore: number;
  activeToday: number;
}

interface GlobalLeaderboardProps {
  scope?: "global" | "subject";
  subject?: string;
  showStats?: boolean;
  limit?: number;
  compact?: boolean;
  className?: string;
}

const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({
  scope = "global",
  subject,
  showStats = true,
  limit = 10,
  compact = false,
  className = "",
}) => {
  const [leaderboard, setLeaderboard] = useState<GlobalLeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "accuracy" | "challenges">(
    "score"
  );

  // Utility function to ensure we always have a safe array
  const getSafeLeaderboard = (): GlobalLeaderboardEntry[] => {
    return Array.isArray(leaderboard) ? leaderboard : [];
  };

  const fetchLeaderboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        scope,
        limit: limit.toString(),
        sortBy,
      });
      if (subject) params.append("subject", subject);

      const apiUrl =
        import.meta.env.VITE_API_URL || "https://50cube-backend.vercel.app";
      const response = await fetch(`${apiUrl}/api/leaderboard?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setLeaderboard(data.data);
      } else {
        // Fallback sample data
        const sampleData: GlobalLeaderboardEntry[] = [
          {
            rank: 1,
            userId: "1",
            username: "TopPlayer",
            totalScore: 2850,
            accuracy: 95,
            completedChallenges: 45,
            weeklyChange: 150,
          },
          {
            rank: 2,
            userId: "2",
            username: "SpeedRunner",
            totalScore: 2650,
            accuracy: 92,
            completedChallenges: 38,
            weeklyChange: 85,
          },
          {
            rank: 3,
            userId: "3",
            username: "Challenger",
            totalScore: 2400,
            accuracy: 89,
            completedChallenges: 42,
            weeklyChange: -25,
          },
          {
            rank: 4,
            userId: "4",
            username: "RisingStar",
            totalScore: 2200,
            accuracy: 87,
            completedChallenges: 35,
            weeklyChange: 120,
          },
          {
            rank: 5,
            userId: "5",
            username: "Competitor",
            totalScore: 2050,
            accuracy: 84,
            completedChallenges: 31,
            weeklyChange: 45,
          },
        ];
        setLeaderboard(sampleData);
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      setError("Unable to load leaderboard data - showing sample data");

      // Always ensure leaderboard is an array, even on error
      const fallbackData: GlobalLeaderboardEntry[] = [
        {
          rank: 1,
          userId: "sample1",
          username: "Sample Player",
          totalScore: 1500,
          accuracy: 85,
          completedChallenges: 25,
          weeklyChange: 0,
        },
      ];
      setLeaderboard(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [scope, limit, sortBy, subject]);

  const fetchStats = useCallback(async () => {
    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "https://50cube.vercel.app";
      const response = await fetch(`${apiUrl}/api/leaderboard/stats`);

      if (!response.ok) {
        console.log(
          `Stats API returned ${response.status}, using fallback data`
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.log(
          "Stats API returned HTML instead of JSON, using fallback data"
        );
        throw new Error("Response is not JSON");
      }

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (parseError) {
        console.log("Failed to parse stats JSON, using fallback data");
        throw new Error("Invalid JSON response");
      }

      if (data.success && data.data) {
        // Ensure all properties exist with defaults
        const safeStats: LeaderboardStats = {
          totalPlayers: data.data.totalPlayers || 0,
          averageScore: data.data.averageScore || 0,
          topScore: data.data.topScore || 0,
          activeToday: data.data.activeToday || 0,
        };
        setStats(safeStats);
      } else {
        throw new Error("Invalid stats response structure");
      }
    } catch (err) {
      console.log("Using sample stats data due to API error:", err);
      // Always set fallback stats with guaranteed values
      setStats({
        totalPlayers: 2547,
        averageScore: 1850,
        topScore: 2850,
        activeToday: 127,
      });
    }
  }, []);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  useEffect(() => {
    if (showStats) {
      fetchStats();
    }
  }, [showStats, fetchStats]);

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white",
        2: "bg-gradient-to-r from-gray-400 to-gray-600 text-white",
        3: "bg-gradient-to-r from-orange-400 to-orange-600 text-white",
      };
      return colors[rank as keyof typeof colors];
    }
    return "bg-gray-100 text-gray-700";
  };

  const getWeeklyChangeColor = (change?: number) => {
    if (!change) return "text-gray-500";
    return change > 0
      ? "text-green-500"
      : change < 0
      ? "text-red-500"
      : "text-gray-500";
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-48"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">
                {scope === "global"
                  ? "Global Leaderboard"
                  : `${subject} Leaderboard`}
              </h3>
              <p className="text-blue-100 text-sm">Top performers this week</p>
            </div>
          </div>

          {!compact && (
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy("score")}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  sortBy === "score"
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:bg-white/10"
                }`}
              >
                Score
              </button>
              <button
                onClick={() => setSortBy("accuracy")}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  sortBy === "accuracy"
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:bg-white/10"
                }`}
              >
                Accuracy
              </button>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        {showStats && stats && !compact && (
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-2xl font-bold">
                  {stats.totalPlayers.toLocaleString()}
                </span>
              </div>
              <p className="text-blue-100 text-xs">Total Players</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-2xl font-bold">
                  {stats.averageScore.toLocaleString()}
                </span>
              </div>
              <p className="text-blue-100 text-xs">Avg Score</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-2xl font-bold">
                  {stats.topScore.toLocaleString()}
                </span>
              </div>
              <p className="text-blue-100 text-xs">Top Score</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-2xl font-bold">
                  {stats.activeToday.toLocaleString()}
                </span>
              </div>
              <p className="text-blue-100 text-xs">Active Today</p>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchLeaderboardData}
            className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Leaderboard */}
      {!error && (
        <div className="divide-y divide-gray-100">
          {getSafeLeaderboard().length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No rankings available yet</p>
              <p className="text-sm">
                Complete some challenges to appear on the leaderboard!
              </p>
            </div>
          ) : (
            getSafeLeaderboard().map((entry) => (
              <div
                key={entry.userId}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  entry.rank <= 3
                    ? "bg-gradient-to-r from-yellow-50 to-orange-50"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${getRankBadge(
                      entry.rank
                    )}`}
                  >
                    {entry.rank <= 3
                      ? entry.rank === 1
                        ? "🥇"
                        : entry.rank === 2
                        ? "🥈"
                        : "🥉"
                      : entry.rank}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {entry.username.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {entry.username}
                      </h4>
                      {entry.rank <= 3 && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          Top {entry.rank}
                        </span>
                      )}
                    </div>

                    {!compact && (
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {entry.accuracy && (
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {(entry.accuracy * 100).toFixed(1)}%
                          </span>
                        )}
                        {entry.completedChallenges && (
                          <span>{entry.completedChallenges} challenges</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Score & Change */}
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">
                      {entry.totalScore.toLocaleString()}
                    </div>
                    {!compact && entry.weeklyChange !== undefined && (
                      <div
                        className={`text-sm flex items-center gap-1 ${getWeeklyChangeColor(
                          entry.weeklyChange
                        )}`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        {entry.weeklyChange > 0 ? "+" : ""}
                        {entry.weeklyChange}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* View More */}
      {!compact && getSafeLeaderboard().length >= limit && (
        <div className="p-4 bg-gray-50 text-center">
          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            View Full Leaderboard →
          </button>
        </div>
      )}
    </div>
  );
};

export default GlobalLeaderboard;
