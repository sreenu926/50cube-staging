/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { League, Prize } from "../../types";
import { leaguesApi } from "../../services/api";

type LeagueEntryProps = object;

// ✅ Add interface for the actual API response
interface LeagueApiResponse extends Omit<League, "rules"> {
  rules?: {
    submissionsPerUser?: number;
    timeLimit?: number;
    scoringMethod?: string;
  };
  userJoined?: boolean;
}

const LeagueEntry: React.FC<LeagueEntryProps> = () => {
  const { t } = useTranslation();
  const { id: leagueId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [league, setLeague] = useState<LeagueApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isAlreadyJoined, setIsAlreadyJoined] = useState<boolean>(false);

  // Fetch league details
  useEffect(() => {
    if (leagueId) {
      fetchLeagueDetails(leagueId);
    }
  }, [leagueId]);

  const fetchLeagueDetails = async (id: string) => {
    try {
      setLoading(true);

      const response = await leaguesApi.getLeague(id);

      if (response.success && response.data) {
        // ✅ Cast the response to our extended type
        const leagueData = response.data as LeagueApiResponse;
        setLeague(leagueData);
        // ✅ Fixed: Check userJoined safely
        setIsAlreadyJoined(leagueData.userJoined || false);
      } else {
        setError(response.message || response.error || "Failed to load league");
      }
    } catch (err: any) {
      setError("Error loading league details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeague = async () => {
    if (!leagueId) return;

    try {
      setIsJoining(true);
      setError("");

      const response = await leaguesApi.enterLeague(leagueId);

      if (response.success) {
        setIsAlreadyJoined(true);
        navigate(`/leagues/${leagueId}/leaderboard`);
      } else {
        setError(response.message || response.error || "Failed to join league");
      }
    } catch (err: any) {
      setError("Error joining league");
      console.error(err);
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error && !league) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/leagues")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Leagues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* League Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {league?.name || "League Details"}
              </h1>
              <p className="text-gray-600">
                {league?.description ||
                  "Join this league to compete with other players!"}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  league?.status === "active"
                    ? "bg-green-100 text-green-800"
                    : league?.status === "upcoming"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {league?.status?.toUpperCase() || "ACTIVE"}
              </span>
            </div>
          </div>

          {/* League Dates */}
          {league && (
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
              <div>
                <span className="font-medium">Start Date:</span>{" "}
                {new Date(league.startDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">End Date:</span>{" "}
                {new Date(league.endDate).toLocaleDateString()}
              </div>
            </div>
          )}

          {/* Join Button */}
          <div className="flex gap-4">
            {isAlreadyJoined ? (
              <button
                onClick={() => navigate(`/leagues/${leagueId}/leaderboard`)}
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                View Leaderboard
              </button>
            ) : (
              <button
                onClick={handleJoinLeague}
                disabled={isJoining || league?.status !== "active"}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isJoining ? "Joining..." : t("joinLeague")}
              </button>
            )}

            {/* Add Start Challenge Button */}
            {league?.status === "active" && (
              <button
                onClick={() => navigate(`/leagues/${leagueId}/play`)}
                className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Start Challenge
              </button>
            )}

            <button
              onClick={() => navigate("/leagues")}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Back to Leagues
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* League Rules */}
        {league && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              📋 League Rules
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li>• Rankings based on accuracy first, then completion time</li>
              {/* ✅ Fixed: Safe access to rules properties */}
              <li>
                • Each player gets {league.rules?.submissionsPerUser || 1}{" "}
                submission(s)
              </li>
              <li>
                • Time limit:{" "}
                {Math.floor((league.rules?.timeLimit || 600) / 60)} minutes per
                challenge
              </li>
              <li>
                • League ends on {new Date(league.endDate).toLocaleDateString()}
              </li>
            </ul>
          </div>
        )}

        {/* Prize Table */}
        {league?.prizeTable && league.prizeTable.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🏆 Prize Table
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prize
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credits
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {league.prizeTable.map((prize: Prize, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{prize.rank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prize.reward}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prize.credits || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeagueEntry;
