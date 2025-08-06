import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Trophy, Clock, Target } from "lucide-react";

interface SpotlightEntry {
  id: string;
  username: string;
  achievement: string;
  date: string;
  score: number;
  category: "accuracy" | "speed" | "overall";
  avatar?: string;
}

interface SpotlightCarouselProps {
  className?: string;
}

const SpotlightCarousel: React.FC<SpotlightCarouselProps> = ({
  className = "",
}) => {
  const [spotlightData, setSpotlightData] = useState<SpotlightEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSpotlightData = useCallback(async () => {
    try {
      setLoading(true);
      setError(""); // Clear any previous errors

      const apiUrl =
        import.meta.env.VITE_API_URL || "https://50cube-backend.vercel.app";
      if (!apiUrl) {
        throw new Error("VITE_API_URL environment variable is not set");
      }

      const response = await fetch(`${apiUrl}/api/leaderboard/spotlight`);

      // Check if the response is ok (status 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if the response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Expected JSON response, got ${contentType || "unknown content type"}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setSpotlightData(Array.isArray(data.data) ? data.data : []);
      } else {
        setError(data.message || "Failed to load spotlight data");
      }
    } catch (err) {
      console.error("Error fetching spotlight data:", err);

      if (err instanceof Error) {
        setError(`Error loading spotlight data: ${err.message}`);
      } else {
        setError("Error loading spotlight data");
      }

      // Set empty array as fallback
      setSpotlightData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpotlightData();
  }, [fetchSpotlightData]);

  useEffect(() => {
    if (spotlightData.length <= 1) return;

    // Auto-rotate every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === spotlightData.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [spotlightData.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === spotlightData.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? spotlightData.length - 1 : prev - 1
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "accuracy":
        return <Target className="w-5 h-5" />;
      case "speed":
        return <Clock className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "accuracy":
        return "from-green-500 to-emerald-600";
      case "speed":
        return "from-blue-500 to-cyan-600";
      default:
        return "from-yellow-500 to-orange-600";
    }
  };

  if (loading) {
    return (
      <div
        className={`bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white ${className}`}
      >
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error || !Array.isArray(spotlightData) || spotlightData.length === 0) {
    return (
      <div
        className={`bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl p-8 text-white ${className}`}
      >
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-bold mb-2">🌟 Spotlight</h3>
          <p className="text-gray-200">
            {error || "No spotlight performers yet. Be the first to shine!"}
          </p>
          {error && (
            <button
              onClick={fetchSpotlightData}
              className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentSpotlight = spotlightData[currentIndex];

  if (!currentSpotlight) {
    return (
      <div
        className={`bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl p-8 text-white ${className}`}
      >
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-bold mb-2">🌟 Spotlight</h3>
          <p className="text-gray-200">Loading spotlight data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <div
        className={`bg-gradient-to-r ${getCategoryColor(
          currentSpotlight.category
        )} p-8 text-white relative`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                {getCategoryIcon(currentSpotlight.category)}
              </div>
              <div>
                <h3 className="text-2xl font-bold">🌟 Spotlight</h3>
                <p className="text-white/80 text-sm">Top Performer</p>
              </div>
            </div>

            {/* Navigation */}
            {Array.isArray(spotlightData) && spotlightData.length > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={prevSlide}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl font-bold">
                {currentSpotlight.username.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h4 className="text-xl font-bold mb-1">
                {currentSpotlight.username}
              </h4>
              <p className="text-white/90 mb-2">
                {currentSpotlight.achievement}
              </p>
              <div className="flex items-center gap-4 text-sm text-white/70">
                <span>
                  {new Date(currentSpotlight.date).toLocaleDateString()}
                </span>
                <span>•</span>
                <span className="font-medium">
                  {currentSpotlight.score.toLocaleString()} points
                </span>
              </div>
            </div>
          </div>

          {/* Indicators */}
          {Array.isArray(spotlightData) && spotlightData.length > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {spotlightData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-white w-6"
                      : "bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotlightCarousel;
