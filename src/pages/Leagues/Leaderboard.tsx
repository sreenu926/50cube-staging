import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LeaderboardEntry, League } from "../../types";
import { leaguesApi } from "../../services/api";

const Leaderboard: React.FC = () => {
  const { t } = useTranslation();
  const { id: leagueId } = useParams<{ id: string }>();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    if (leagueId) {
      fetchLeaderboardData(leagueId);
    }
  }, [leagueId]);

  const fetchLeaderboardData = async (id: string) => {
    try {
      setLoading(true);

      // Fetch both league details and leaderboard
      const [leagueResponse, leaderboardResponse] = await Promise.all([
        leaguesApi.getLeague(id),
        leaguesApi.getLeaderboard(id),
      ]);

      if (leagueResponse.success && leagueResponse.data) {
        setLeague(leagueResponse.data);
      }

      if (leaderboardResponse.success) {
        setLeaderboard(leaderboardResponse.data || []);
      } else {
        setError(
          leaderboardResponse.message ||
            leaderboardResponse.error ||
            "Failed to load leaderboard"
        );
      }
    } catch (err) {
      setError("Error loading leaderboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!leagueId) return;

    try {
      setRefreshing(true);
      const response = await leaguesApi.getLeaderboard(leagueId);

      if (response.success) {
        setLeaderboard(response.data || []);
        setError("");
      } else {
        setError(
          response.message || response.error || "Failed to refresh leaderboard"
        );
      }
    } catch (err) {
      setError("Error refreshing leaderboard");
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return "text-yellow-600 bg-yellow-50";
      case 2:
        return "text-gray-600 bg-gray-50";
      case 3:
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-900 bg-white";
    }
  };

  const getRankIcon = (rank: number): string => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen mt-20 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🏆 {t("leaderboard")}
              </h1>
              {league && (
                <p className="text-gray-600">
                  {league.name} - {league.description}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <Link
                to={`/leagues/${leagueId}`}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                League Details
              </Link>
            </div>
          </div>

          {/* League Status */}
          {league && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  league.status === "active"
                    ? "bg-green-100 text-green-800"
                    : league.status === "upcoming"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {league.status.toUpperCase()}
              </span>
              <span>Ends: {new Date(league.endDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Rankings ({leaderboard.length} players)
            </h2>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No players have joined this league yet.
              </p>
              <Link
                to={`/leagues/${leagueId}`}
                className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Join League
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accuracy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.userId}
                      className={`hover:bg-gray-50 ${getRankColor(entry.rank)}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">
                            {getRankIcon(entry.rank)}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {entry.rank <= 3 ? "" : `#${entry.rank}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(entry.accuracy * 100).toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {entry.timeScore.toFixed(0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.totalScore.toFixed(0)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Scoring Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📊 How Scoring Works
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              • <strong>Primary:</strong> Ranked by accuracy (correct answers /
              total questions)
            </p>
            <p>
              • <strong>Tiebreaker:</strong> Faster completion time wins
            </p>
            <p>
              • <strong>Total Score:</strong> Combined accuracy and time-based
              points
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
