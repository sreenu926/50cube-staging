/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Trophy,
  Users,
  Clock,
  Target,
  Star,
  Medal,
  Zap,
  RefreshCw,
  Calendar,
  Award,
} from "lucide-react";
import { leaguesApi } from "../../services/api";
import { Link } from "react-router-dom";

// Local League interface
interface LocalLeague {
  id: string;
  name: string;
  description: string;
  participants: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  prize: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  category: "Speed" | "Accuracy" | "Mixed";
  status: "upcoming" | "active" | "completed";
}

const LeaguesPage: React.FC = () => {
  const [leagues, setLeagues] = useState<LocalLeague[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "Speed" | "Accuracy" | "Mixed"
  >("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "all" | "Beginner" | "Intermediate" | "Advanced" | "Expert"
  >("all");

  useEffect(() => {
    const fetchLeagues = async () => {
      setLoading(true);
      setError("");
      try {
        console.log("🚀 Fetching leagues...");
        const response = await leaguesApi.getLeagues();
        console.log("📦 Raw API Response:", response);

        let leaguesArray: any[] = [];

        // Handle the response - cast to unknown first to bypass strict typing
        const unknownResponse = response as unknown;

        // Now we can safely check for different structures
        if (unknownResponse && typeof unknownResponse === "object") {
          const obj = unknownResponse as Record<string, any>;

          // Method 1: Direct leagues property {leagues: [...], pagination: {...}}
          if (obj.leagues && Array.isArray(obj.leagues)) {
            leaguesArray = obj.leagues;
            console.log(
              "✅ Method 1: Found leagues via response.leagues -",
              leaguesArray.length,
              "items"
            );
          }
          // Method 2: Standard API response {success: true, data: [...]}
          else if (obj.success && obj.data) {
            if (Array.isArray(obj.data)) {
              leaguesArray = obj.data;
              console.log(
                "✅ Method 2: Found leagues via response.data (direct array)"
              );
            } else if (obj.data.leagues && Array.isArray(obj.data.leagues)) {
              leaguesArray = obj.data.leagues;
              console.log(
                "✅ Method 2: Found leagues via response.data.leagues"
              );
            }
          }
          // Method 3: Direct array
          else if (Array.isArray(unknownResponse)) {
            leaguesArray = unknownResponse;
            console.log("✅ Method 3: Response is direct array");
          }
        }

        console.log("📊 Final leagues array:", leaguesArray);

        // Convert to our local format
        const convertedLeagues: LocalLeague[] = leaguesArray.map(
          (league: any, index: number) => {
            console.log(
              `🔄 Converting league ${index}:`,
              league?.name || `League ${index}`
            );
            return {
              id: String(league?.id || league?._id || `league-${index}`),
              name: String(league?.name || `League ${index + 1}`),
              description: String(
                league?.description || "No description available"
              ),
              participants: Number(league?.participants) || 0,
              maxParticipants: Number(league?.maxParticipants) || 1000,
              startDate: String(league?.startDate || new Date().toISOString()),
              endDate: String(
                league?.endDate ||
                  new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
              ),
              prize: String(league?.prize || "TBD"),
              difficulty:
                (league?.difficulty as LocalLeague["difficulty"]) ||
                "Intermediate",
              category:
                (league?.category as LocalLeague["category"]) || "Mixed",
              status: (league?.status as LocalLeague["status"]) || "upcoming",
            };
          }
        );

        console.log(
          "✅ Successfully converted",
          convertedLeagues.length,
          "leagues"
        );
        setLeagues(convertedLeagues);
        setError("");
      } catch (err: any) {
        console.error("❌ Error in fetchLeagues:", err);
        setError(`Failed to load leagues: ${err.message}`);
        setLeagues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  const filteredLeagues = leagues.filter((league) => {
    const categoryMatch =
      selectedCategory === "all" || league.category === selectedCategory;
    const difficultyMatch =
      selectedDifficulty === "all" || league.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Advanced":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Expert":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Speed":
        return <Zap className="w-5 h-5" />;
      case "Accuracy":
        return <Target className="w-5 h-5" />;
      case "Mixed":
        return <Star className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const retryLoading = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Medal className="w-16 h-16" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Skill-Only Leagues
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Join competitive leagues and test your skills against other
              players. Rankings are based on accuracy first, then completion
              time.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filters */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Filter Leagues
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {["all", "Speed", "Accuracy", "Mixed"].map((category) => (
                    <button
                      key={`category-filter-${category}`}
                      onClick={() => setSelectedCategory(category as any)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        selectedCategory === category
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category === "all" ? "All Categories" : category}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Difficulty
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "all",
                    "Beginner",
                    "Intermediate",
                    "Advanced",
                    "Expert",
                  ].map((difficulty) => (
                    <button
                      key={`difficulty-filter-${difficulty}`}
                      onClick={() => setSelectedDifficulty(difficulty as any)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        selectedDifficulty === difficulty
                          ? "bg-purple-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {difficulty === "all" ? "All Levels" : difficulty}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info (Remove this after testing) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-2">Debug Info:</h3>
            <p className="text-yellow-700 text-sm">
              Leagues loaded: {leagues.length} | Loading: {loading.toString()} |
              Error: {error || "None"}
            </p>
          </div>
        )}

        {/* Leagues List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading leagues...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">
                Failed to load leagues
              </h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={retryLoading}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors duration-300"
              >
                Retry
              </button>
            </div>
          </div>
        ) : filteredLeagues.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-md mx-auto">
              <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No leagues available
              </h3>
              <p className="text-gray-600 mb-6">
                {leagues.length === 0
                  ? "No leagues found. They may not be loaded yet."
                  : "No leagues match your current filters. Try adjusting your selection."}
              </p>
              {leagues.length === 0 ? (
                <button
                  onClick={retryLoading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors duration-300"
                >
                  Retry Loading
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedDifficulty("all");
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors duration-300"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredLeagues.map((league) => (
              <div
                key={`league-${league.id}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                        {getCategoryIcon(league.category)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          {league.name}
                        </h3>
                        <p className="text-gray-600">{league.description}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        league.status
                      )}`}
                    >
                      {league.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Participants</p>
                        <p className="font-bold text-gray-800">
                          {league.participants}/{league.maxParticipants}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-bold text-gray-800">
                          {new Date(league.startDate).toLocaleDateString()} -{" "}
                          {new Date(league.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(
                          league.difficulty
                        )}`}
                      >
                        {league.difficulty}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {league.category}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">
                        Prize Pool
                      </span>
                    </div>
                    <p className="text-yellow-700 font-medium">
                      {league.prize}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Registration Progress</span>
                      <span>
                        {Math.round(
                          (league.participants / league.maxParticipants) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (league.participants / league.maxParticipants) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <Link
                    to={`/leagues/${league.id}`}
                    className={`block w-full py-4 rounded-xl font-bold text-lg text-center transition-all duration-300 ${
                      league.status === "active"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : league.status === "upcoming"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
                    }`}
                  >
                    {league.status === "active"
                      ? "Join Now"
                      : league.status === "upcoming"
                      ? "Register"
                      : "Completed"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Sections */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* How Leagues Work */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Trophy className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                How Leagues Work
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg mt-1">
                  <Target className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Scoring System
                  </h3>
                  <p className="text-gray-600">
                    Primary ranking by accuracy, tiebreaker by completion time
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg mt-1">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Weekly Competition Cycles
                  </h3>
                  <p className="text-gray-600">
                    New leagues start every week with different themes and
                    challenges
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Rewards</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg mt-1">
                  <Medal className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Credits for top performers
                  </h3>
                  <p className="text-gray-600">
                    Earn credits to unlock premium content and features
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg mt-1">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Exclusive badges and titles
                  </h3>
                  <p className="text-gray-600">
                    Show off your achievements with unique profile badges
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg mt-1">
                  <Trophy className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Spotlight recognition
                  </h3>
                  <p className="text-gray-600">
                    Top performers get featured on the homepage spotlight
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaguesPage;
