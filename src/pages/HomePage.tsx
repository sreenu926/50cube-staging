import React, { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  Users,
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  Zap,
  Target,
  Crown,
  Sparkles,
  ArrowRight,
  Play,
  Star,
  Flame,
  Medal,
  BarChart3,
  Globe,
  Rocket,
} from "lucide-react";
import { leaderboardApi } from "../services/api";
import { Link } from "react-router-dom";

interface LeaderboardEntry {
  _id: string;
  username: string;
  totalPoints: number;
  rank: number;
  accuracy?: number;
  completionTime?: number;
  subject?: string;
}

interface SpotlightEntry {
  _id: string;
  username: string;
  achievement: string;
  points: number;
  date: string;
  avatar?: string;
}

interface PlatformStats {
  activePlayers: number;
  leaguesRunning: number;
  totalReaders: number;
}

// Helper function to safely convert unknown values to LeaderboardEntry
const convertToLeaderboardEntry = (
  entry: unknown,
  index: number
): LeaderboardEntry => {
  if (!entry || typeof entry !== "object") {
    return {
      _id: `user-${index}`,
      username: "Unknown",
      totalPoints: 0,
      rank: index + 1,
    };
  }

  const entryObj = entry as Record<string, unknown>;
  return {
    _id: String(
      entryObj.userId || entryObj._id || entryObj.id || `user-${index}`
    ),
    username: String(entryObj.username || entryObj.name || "Anonymous"),
    totalPoints: Number(
      entryObj.totalScore || entryObj.totalPoints || entryObj.points || 0
    ),
    rank: Number(entryObj.rank || index + 1),
    accuracy: entryObj.accuracy ? Number(entryObj.accuracy) : undefined,
    completionTime: entryObj.completionTime
      ? Number(entryObj.completionTime)
      : undefined,
    subject: entryObj.subject ? String(entryObj.subject) : undefined,
  };
};

// Helper function to extract array data from API response
const extractLeaderboardData = (responseData: unknown): unknown[] => {
  console.log("📊 Raw leaderboard response:", responseData);

  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (responseData && typeof responseData === "object") {
    const dataObj = responseData as Record<string, unknown>;
    const extractedData =
      (dataObj.leaderboard as unknown[]) ||
      (dataObj.data as unknown[]) ||
      (dataObj.users as unknown[]) ||
      (dataObj.entries as unknown[]) ||
      [];

    console.log("📊 Extracted leaderboard data:", extractedData);
    return extractedData;
  }

  return [];
};

const HomePage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [spotlight, setSpotlight] = useState<SpotlightEntry[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    activePlayers: 2547,
    leaguesRunning: 12,
    totalReaders: 156,
  });
  const [loading, setLoading] = useState(false);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [leaderboardScope, setLeaderboardScope] = useState<
    "global" | "subject"
  >("global");

  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");

  // Memoized spotlight navigation functions
  const nextSpotlight = useCallback(() => {
    setSpotlightIndex((prev) => (prev + 1) % spotlight.length);
  }, [spotlight.length]);

  const prevSpotlight = useCallback(() => {
    setSpotlightIndex(
      (prev) => (prev - 1 + spotlight.length) % spotlight.length
    );
  }, [spotlight.length]);

  // Function to refresh data
  const refreshData = useCallback(async () => {
    console.log("🔄 Refreshing homepage data...");
    setLoading(true);

    setConnectionStatus("checking");

    try {
      // Fetch leaderboard data
      console.log(`📊 Fetching ${leaderboardScope} leaderboard...`);
      const leaderboardResponse = await leaderboardApi.getGlobalLeaderboard(
        leaderboardScope
      );

      if (leaderboardResponse.success && leaderboardResponse.data) {
        console.log("✅ Leaderboard data received:", leaderboardResponse.data);
        const dataToProcess = extractLeaderboardData(leaderboardResponse.data);
        const convertedData: LeaderboardEntry[] = [];

        for (let i = 0; i < Math.min(dataToProcess.length, 10); i++) {
          convertedData.push(convertToLeaderboardEntry(dataToProcess[i], i));
        }

        console.log("✅ Converted leaderboard data:", convertedData);
        setLeaderboard(convertedData);
        setConnectionStatus("connected");
      } else {
        console.error(
          "❌ Failed to fetch leaderboard:",
          leaderboardResponse.error
        );
        setLeaderboard([]);

        setConnectionStatus("disconnected");
      }

      // Try to fetch spotlight data from backend
      try {
        console.log("🌟 Attempting to fetch spotlight data from backend...");
        const spotlightResponse = await leaderboardApi.getSpotlight();

        if (spotlightResponse.success && spotlightResponse.data) {
          console.log(
            "✅ Spotlight data from backend:",
            spotlightResponse.data
          );
          // Process spotlight data from backend
          const spotlightData = Array.isArray(spotlightResponse.data)
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              spotlightResponse.data.map((item: any, index: number) => ({
                _id: item._id || item.id || `spotlight-${index}`,
                username: item.username || item.name || "Champion",
                achievement: item.achievement || "Outstanding Performance",
                points: Number(item.points || item.totalPoints || 0),
                date: item.date || new Date().toISOString(),
                avatar: item.avatar,
              }))
            : [];

          if (spotlightData.length > 0) {
            setSpotlight(spotlightData);
          } else {
            throw new Error("Empty spotlight data");
          }
        } else {
          throw new Error("No spotlight data from backend");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (spotlightError) {
        console.log("⚠️ Using fallback spotlight data");
        // Fallback to static spotlight data
        const currentDate = new Date();
        setSpotlight([
          {
            _id: "1",
            username: "SpeedReader_Pro",
            achievement: "Speed Reading Champion",
            points: 950,
            date: currentDate.toISOString(),
          },
          {
            _id: "2",
            username: "QuickEyes",
            achievement: "Accuracy Master",
            points: 920,
            date: new Date(
              currentDate.getTime() - 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            _id: "3",
            username: "BrainBoost",
            achievement: "Learning Streak",
            points: 890,
            date: new Date(
              currentDate.getTime() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ]);
      }

      // Try to fetch stats from backend
      try {
        console.log("📈 Attempting to fetch stats from backend...");
        const statsResponse = await leaderboardApi.getStats();

        if (statsResponse.success && statsResponse.data) {
          console.log("✅ Stats data from backend:", statsResponse.data);
          const statsData = statsResponse.data as Record<string, unknown>;
          setStats({
            activePlayers: Number(
              statsData.activePlayers || statsData.totalUsers || 2547
            ),
            leaguesRunning: Number(
              statsData.leaguesRunning || statsData.activeLeagues || 12
            ),
            totalReaders: Number(
              statsData.totalReaders || statsData.premiumUsers || 156
            ),
          });
        } else {
          throw new Error("No stats data from backend");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (statsError) {
        console.log("⚠️ Using fallback stats data");
        // Keep fallback stats
        setStats({
          activePlayers: 2547,
          leaguesRunning: 12,
          totalReaders: 156,
        });
      }
    } catch (error) {
      console.error("❌ Error fetching homepage data:", error);

      setConnectionStatus("disconnected");

      // Set fallback data
      setLeaderboard([
        {
          _id: "sample-1",
          username: "LearningMaster",
          totalPoints: 2450,
          rank: 1,
          accuracy: 98,
        },
        {
          _id: "sample-2",
          username: "QuizChampion",
          totalPoints: 2180,
          rank: 2,
          accuracy: 95,
        },
        {
          _id: "sample-3",
          username: "StudyPro",
          totalPoints: 1920,
          rank: 3,
          accuracy: 92,
        },
      ]);

      const currentDate = new Date();
      setSpotlight([
        {
          _id: "fallback-1",
          username: "SpeedReader_Pro",
          achievement: "Speed Reading Champion",
          points: 950,
          date: currentDate.toISOString(),
        },
        {
          _id: "fallback-2",
          username: "QuickEyes",
          achievement: "Accuracy Master",
          points: 920,
          date: new Date(
            currentDate.getTime() - 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ]);

      setStats({
        activePlayers: 2547,
        leaguesRunning: 12,
        totalReaders: 156,
      });
    } finally {
      setLoading(false);
    }
  }, [leaderboardScope]);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-rotate spotlight
  useEffect(() => {
    if (spotlight.length > 1) {
      const interval = setInterval(nextSpotlight, 5000);
      return () => clearInterval(interval);
    }
  }, [nextSpotlight, spotlight.length]);

  // Loading component
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-purple-300/30 border-t-purple-400"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div className="text-white text-xl font-semibold">
            Loading 50cube...
          </div>
          <div className="text-purple-300 text-sm mt-2">
            {connectionStatus === "checking"
              ? "Connecting to server..."
              : "Preparing your learning experience"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Rest of the HomePage content remains the same... */}
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-7xl mt-6 mx-auto text-center">
            {/* Floating Logo */}
            <div className="relative mb-8">
              <div className="inline-block relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 border border-white/10 rounded-3xl p-8 backdrop-blur-sm group-hover:scale-105 transition-transform duration-500">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="relative">
                      <Crown className="w-16 h-16 text-yellow-400 drop-shadow-lg" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="text-6xl font-black bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                        50cube
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8 mb-16">
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-none">
                  <span className="block text-white mb-4">Welcome to the</span>
                  <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                    Future of Learning
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl lg:text-3xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-medium">
                  Master bite-sized interactive modules, dominate skill-based
                  leagues, and climb the global leaderboard in our revolutionary
                  points-based learning ecosystem.
                </p>
              </div>

              {/* Feature Tags */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {[
                  {
                    icon: Rocket,
                    label: "Leagues",
                    color: "from-blue-500 to-cyan-500",
                    link: "/leagues",
                  },
                  {
                    icon: Globe,
                    label: "Global Community",
                    color: "from-green-500 to-emerald-500",
                    link: "/", // Stay on homepage, scroll to leaderboard
                  },
                  {
                    icon: Flame,
                    label: "Gamified Learning",
                    color: "from-orange-500 to-red-500",
                    link: "/leagues",
                  },
                  {
                    icon: Medal,
                    label: "Readers",
                    color: "from-yellow-500 to-orange-500",
                    link: "/readers",
                  },
                ].map((feature, index) => (
                  <Link
                    key={`feature-${index}`}
                    to={feature.link}
                    className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${feature.color} rounded-full text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-300`}
                  >
                    <feature.icon className="w-5 h-5 mr-2" />
                    {feature.label}
                  </Link>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  to="/leagues"
                  className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold rounded-2xl text-xl hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 block text-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative flex items-center justify-center">
                    <Play className="w-7 h-7 mr-3 group-hover:scale-110 transition-transform" />
                    Join a League
                    <Sparkles className="w-6 h-6 ml-3 group-hover:rotate-180 transition-transform duration-500" />
                  </div>
                </Link>

                <Link
                  to="/readers"
                  className="group px-10 py-5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl text-xl border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 shadow-xl block text-center"
                >
                  <div className="flex items-center justify-center">
                    <BookOpen className="w-7 h-7 mr-3 group-hover:text-yellow-400 transition-colors" />
                    Browse Readers
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white mb-4">
                Platform Analytics
              </h2>
              <p className="text-xl text-slate-400">
                Real-time insights into our thriving learning community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  value: stats.activePlayers.toLocaleString(),
                  label: "Active Learners",
                  color: "from-blue-500 to-cyan-500",
                  bgColor: "from-blue-500/10 to-cyan-500/10",
                  iconBg: "bg-blue-500/20",
                  description: "Engaged users learning daily",
                },
                {
                  icon: Trophy,
                  value: stats.leaguesRunning,
                  label: "Active Leagues",
                  color: "from-emerald-500 to-teal-500",
                  bgColor: "from-emerald-500/10 to-teal-500/10",
                  iconBg: "bg-emerald-500/20",
                  description: "Competitive tournaments running",
                },
                {
                  icon: BookOpen,
                  value: stats.totalReaders,
                  label: "Premium Members",
                  color: "from-purple-500 to-pink-500",
                  bgColor: "from-purple-500/10 to-pink-500/10",
                  iconBg: "bg-purple-500/20",
                  description: "Elite learning community",
                },
              ].map((stat, index) => (
                <div key={`stat-${index}`} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-3xl blur-xl group-hover:from-white/10 group-hover:to-white/20 transition-all duration-500"></div>
                  <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 group-hover:-translate-y-2">
                    {/* Background Gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    ></div>

                    {/* Content */}
                    <div className="relative text-center">
                      <div
                        className={`inline-flex items-center justify-center w-20 h-20 ${stat.iconBg} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <stat.icon className={`w-10 h-10 text-white`} />
                      </div>
                      <div
                        className={`text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3`}
                      >
                        {stat.value}
                      </div>
                      <div className="text-white font-bold text-xl mb-2">
                        {stat.label}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {stat.description}
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Spotlight Section */}
        {spotlight.length > 0 && (
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full mb-6">
                  <Star className="w-6 h-6 text-yellow-400 mr-2" />
                  <span className="text-yellow-300 font-semibold">
                    Featured Champions
                  </span>
                </div>
                <h2 className="text-5xl font-black text-white mb-4">
                  Hall of Fame
                </h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                  Celebrating our top performers and their extraordinary
                  achievements
                </p>
              </div>

              <div className="relative max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-12 shadow-2xl">
                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={prevSpotlight}
                      className="group p-4 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={spotlight.length <= 1}
                      type="button"
                      aria-label="Previous champion"
                    >
                      <ChevronLeft className="w-6 h-6 text-white group-hover:text-yellow-400 transition-colors" />
                    </button>

                    <div className="text-center flex-1 mx-8">
                      {/* Champion Avatar */}
                      <div className="relative inline-block mb-8">
                        <div className="w-40 h-40 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl">
                          <span className="text-5xl font-black text-white">
                            {spotlight[spotlightIndex]?.username
                              ?.charAt(0)
                              .toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-xl">
                          <Crown className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold text-sm shadow-lg">
                          Champion
                        </div>
                      </div>

                      {/* Champion Info */}
                      <h3 className="text-4xl font-black text-white mb-3">
                        {spotlight[spotlightIndex]?.username ||
                          "Unknown Champion"}
                      </h3>
                      <p className="text-2xl text-yellow-400 font-semibold mb-8">
                        {spotlight[spotlightIndex]?.achievement ||
                          "Outstanding Performance"}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md mx-auto">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                          <div className="flex items-center justify-center mb-3">
                            <Zap className="w-8 h-8 text-yellow-400 mr-2" />
                            <span className="text-3xl font-black text-white">
                              {spotlight[spotlightIndex]?.points || 0}
                            </span>
                          </div>
                          <div className="text-slate-400 font-medium">
                            Total Points
                          </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                          <div className="flex items-center justify-center mb-3">
                            <Clock className="w-8 h-8 text-blue-400 mr-2" />
                            <span className="text-lg font-bold text-white">
                              {new Date(
                                spotlight[spotlightIndex]?.date || Date.now()
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-slate-400 font-medium">
                            Achievement Date
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={nextSpotlight}
                      className="group p-4 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={spotlight.length <= 1}
                      type="button"
                      aria-label="Next champion"
                    >
                      <ChevronRight className="w-6 h-6 text-white group-hover:text-yellow-400 transition-colors" />
                    </button>
                  </div>

                  {/* Indicators */}
                  {spotlight.length > 1 && (
                    <div className="flex justify-center mt-8 space-x-3">
                      {spotlight.map((_, index) => (
                        <button
                          key={`spotlight-indicator-${index}`}
                          onClick={() => setSpotlightIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === spotlightIndex
                              ? "bg-yellow-400 w-10"
                              : "bg-white/30 hover:bg-white/50"
                          }`}
                          type="button"
                          aria-label={`View champion ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Leaderboard Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-8 py-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex items-center">
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl mr-6">
                      <BarChart3 className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-white mb-2">
                        Global Leaderboard
                      </h2>
                      <p className="text-blue-100 text-lg">
                        Top performers dominating the platform
                        {connectionStatus === "connected"
                          ? " (Live Data)"
                          : " (Cached Data)"}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLeaderboardScope("global");
                      }}
                      className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                        leaderboardScope === "global"
                          ? "bg-white text-purple-600 shadow-lg scale-105"
                          : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                      type="button"
                    >
                      Global Rankings
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLeaderboardScope("subject");
                      }}
                      className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                        leaderboardScope === "subject"
                          ? "bg-white text-purple-600 shadow-lg scale-105"
                          : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                      type="button"
                    >
                      By Category
                    </button>
                  </div>
                </div>
              </div>

              {/* Leaderboard Content */}
              <div className="p-0">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Trophy className="w-12 h-12 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      No Data Available
                    </h3>
                    <p className="text-slate-400 text-lg mb-6">
                      {connectionStatus === "disconnected"
                        ? "Unable to connect to server"
                        : "Check back soon for updated rankings!"}
                    </p>
                    <button
                      onClick={refreshData}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                      type="button"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-800/50">
                        <tr>
                          <th className="px-8 py-6 text-left text-sm font-black text-slate-300 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-8 py-6 text-left text-sm font-black text-slate-300 uppercase tracking-wider">
                            Player
                          </th>
                          <th className="px-8 py-6 text-left text-sm font-black text-slate-300 uppercase tracking-wider">
                            Points
                          </th>
                          {leaderboardScope === "subject" && (
                            <th className="px-8 py-6 text-left text-sm font-black text-slate-300 uppercase tracking-wider">
                              Category
                            </th>
                          )}
                          <th className="px-8 py-6 text-left text-sm font-black text-slate-300 uppercase tracking-wider">
                            Accuracy
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {leaderboard.map((entry, index) => (
                          <tr
                            key={`leaderboard-${entry._id}-${index}`}
                            className={`${
                              index < 3
                                ? "bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 hover:from-yellow-500/20 hover:via-orange-500/20 hover:to-red-500/20"
                                : "hover:bg-white/5"
                            } transition-all duration-300`}
                          >
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex items-center">
                                {index < 3 ? (
                                  <div className="relative">
                                    <div
                                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-xl ${
                                        index === 0
                                          ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                                          : index === 1
                                          ? "bg-gradient-to-br from-slate-300 to-slate-500"
                                          : "bg-gradient-to-br from-orange-400 to-orange-600"
                                      }`}
                                    >
                                      {index + 1}
                                    </div>
                                    {index === 0 && (
                                      <Crown className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400" />
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-14 h-14 bg-slate-700/50 rounded-2xl flex items-center justify-center border border-white/10">
                                    <span className="text-xl font-black text-slate-300">
                                      {entry.rank || index + 1}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                  <span className="text-xl font-black text-white">
                                    {entry.username?.charAt(0).toUpperCase() ||
                                      "U"}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-xl font-bold text-white mb-1">
                                    {entry.username || "Unknown Player"}
                                  </div>
                                  <div className="text-sm text-slate-400">
                                    Position #{entry.rank || index + 1}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex items-center">
                                <Flame className="w-6 h-6 text-orange-400 mr-3" />
                                <span className="text-2xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                                  {entry.totalPoints?.toLocaleString() || 0}
                                </span>
                              </div>
                            </td>
                            {leaderboardScope === "subject" && (
                              <td className="px-8 py-6 whitespace-nowrap">
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30">
                                  {entry.subject || "General"}
                                </span>
                              </td>
                            )}
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex items-center">
                                <Target className="w-6 h-6 text-green-400 mr-3" />
                                <span className="text-lg font-bold text-white">
                                  {entry.accuracy
                                    ? `${entry.accuracy * 100}%`
                                    : "N/A"}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
