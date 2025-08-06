/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Download,
  Star,
  Search,
  Filter,
  Coins,
  Clock,
  Eye,
  Heart,
  Bookmark,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { readersApi } from "../../services/api";
import { useNavigate } from "react-router-dom";

interface Reader {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  price: number;
  rating: number;
  reviews: number;
  readTime: number;
  pages: number;
  downloads: number;
  tags: string[];
  thumbnail: string;
  isPremium: boolean;
  isNew: boolean;
  isFavorited: boolean;
  isPurchased?: boolean;
}

interface PurchaseState {
  isLoading: boolean;
  success: boolean;
  error: string;
}

const ReadersPage: React.FC = () => {
  const navigate = useNavigate();
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "popular" | "newest" | "rating" | "price"
  >("popular");
  const [showFilters, setShowFilters] = useState(false);

  // Purchase state management
  const [purchaseStates, setPurchaseStates] = useState<
    Record<string, PurchaseState>
  >({});
  const [userCredits, setUserCredits] = useState<number>(() => {
    // Initialize credits from localStorage or default to 1000
    const savedCredits = localStorage.getItem("userCredits");
    return savedCredits ? parseInt(savedCredits) : 1000;
  });
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState<string | null>(
    null
  );
  const [purchasedReaders, setPurchasedReaders] = useState<string[]>(() => {
    // Load purchased readers from localStorage
    const saved = localStorage.getItem("purchasedReaders");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchReaders = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await readersApi.getCatalog();
        console.log("API Response for Readers:", response);

        if (response.success && response.data) {
          // Simple approach: Try to extract the array directly
          let dataToProcess: unknown[] = [];

          // Check if data is already an array
          if (Array.isArray(response.data)) {
            dataToProcess = response.data;
          }
          // Check if data has a nested structure (common patterns)
          else if (response.data && typeof response.data === "object") {
            const dataObj = response.data as Record<string, unknown>;
            // Try common property names that might contain the array
            dataToProcess =
              (dataObj.readers as unknown[]) ||
              (dataObj.catalog as unknown[]) ||
              (dataObj.data as unknown[]) ||
              (dataObj.items as unknown[]) ||
              [];
          }

          if (dataToProcess.length === 0) {
            throw new Error("No readers data found in the response.");
          }

          // Convert API data to local Reader format
          const convertedReaders: Reader[] = [];

          for (const item of dataToProcess) {
            if (item && typeof item === "object") {
              const reader = item as Record<string, unknown>;
              const readerId = String(
                reader.id || reader._id || Math.random().toString(36)
              );

              convertedReaders.push({
                id: readerId,
                title: String(reader.title || "Untitled"),
                author: String(reader.author || "Unknown Author"),
                description: String(
                  reader.description || "No description available"
                ),
                category: String(reader.category || "General"),
                difficulty:
                  (reader.difficulty as Reader["difficulty"]) || "Intermediate",
                price: Number(reader.cost || reader.price || 0),
                rating: Number(reader.rating || 4.0 + Math.random() * 1),
                reviews: Number(
                  reader.reviews || Math.floor(Math.random() * 500) + 50
                ),
                readTime: Number(
                  reader.readTime ||
                    Math.floor(Number(reader.pageCount || 100) * 0.5) ||
                    30
                ),
                pages: Number(reader.pageCount || reader.pages || 100),
                downloads: Number(
                  reader.downloads || Math.floor(Math.random() * 2000) + 100
                ),
                tags: Array.isArray(reader.tags)
                  ? (reader.tags as string[])
                  : [String(reader.category || "general").toLowerCase()],
                thumbnail: String(
                  reader.thumbnail || "/api/placeholder/300/400"
                ),
                isPremium: Boolean(
                  reader.isPremium ||
                    Number(reader.cost || reader.price || 0) > 100
                ),
                isNew: Boolean(
                  reader.isNew ||
                    (reader.createdAt
                      ? new Date(String(reader.createdAt)).getTime() >
                        Date.now() - 30 * 24 * 60 * 60 * 1000
                      : false)
                ),
                isFavorited: false,
                isPurchased: purchasedReaders.includes(readerId),
              });
            }
          }

          setReaders(convertedReaders);
          setError("");
        } else {
          throw new Error(response.error || "Failed to fetch readers.");
        }
      } catch (err: any) {
        console.error("Error fetching readers:", err);
        setError(err.message || "An unexpected error occurred.");
        setReaders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReaders();
  }, [purchasedReaders]);

  // Purchase handler
  const handlePurchase = async (reader: Reader) => {
    const readerId = reader.id;

    // Check if user has enough credits
    if (userCredits < reader.price) {
      setPurchaseStates((prev) => ({
        ...prev,
        [readerId]: {
          isLoading: false,
          success: false,
          error: "Insufficient credits! Please top up your account.",
        },
      }));
      return;
    }

    // Check if already purchased
    if (purchasedReaders.includes(readerId)) {
      navigate("/library");
      return;
    }

    // Set loading state
    setPurchaseStates((prev) => ({
      ...prev,
      [readerId]: {
        isLoading: true,
        success: false,
        error: "",
      },
    }));

    try {
      // Simulate API call (since M15 doesn't require actual authentication)
      // In production, this would call: await readersApi.buyReader(readerId);

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Deduct credits and save to localStorage
      const newCredits = userCredits - reader.price;
      setUserCredits(newCredits);
      localStorage.setItem("userCredits", newCredits.toString());

      // Add to purchased readers and save to localStorage
      const newPurchased = [...purchasedReaders, readerId];
      setPurchasedReaders(newPurchased);
      localStorage.setItem("purchasedReaders", JSON.stringify(newPurchased));

      // Save reader details to localStorage for library
      const libraryItems = JSON.parse(
        localStorage.getItem("libraryItems") || "[]"
      );
      const readerForLibrary = {
        ...reader,
        purchaseDate: new Date().toISOString(),
        downloadUrl: `/api/readers/download/${readerId}?token=${Date.now()}`,
        id: readerId,
        downloadCount: 0,
        maxDownloads: 5,
      };
      libraryItems.push(readerForLibrary);
      localStorage.setItem("libraryItems", JSON.stringify(libraryItems));

      // Mark as purchased in UI
      setReaders((prev) =>
        prev.map((r) =>
          r.id === readerId
            ? { ...r, isPurchased: true, downloads: r.downloads + 1 }
            : r
        )
      );

      // Set success state
      setPurchaseStates((prev) => ({
        ...prev,
        [readerId]: {
          isLoading: false,
          success: true,
          error: "",
        },
      }));

      // Show success message
      setShowPurchaseSuccess(reader.title);
      setTimeout(() => setShowPurchaseSuccess(null), 3000);

      // Auto-navigate to library after 2 seconds
      setTimeout(() => {
        navigate("/library");
      }, 2000);
    } catch (err: any) {
      console.error("Purchase error:", err);
      setPurchaseStates((prev) => ({
        ...prev,
        [readerId]: {
          isLoading: false,
          success: false,
          error: err.message || "Purchase failed. Please try again.",
        },
      }));
    }
  };

  const categories = [
    "all",
    ...Array.from(new Set(readers.map((reader) => reader.category))),
  ];
  const difficulties = [
    "all",
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert",
  ];

  const filteredReaders = readers
    .filter((reader) => {
      const matchesSearch =
        reader.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reader.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reader.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCategory =
        selectedCategory === "all" || reader.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === "all" ||
        reader.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return readers.indexOf(a) - readers.indexOf(b);
        case "rating":
          return b.rating - a.rating;
        case "price":
          return a.price - b.price;
        case "popular":
        default:
          return b.downloads - a.downloads;
      }
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

  const toggleFavorite = (readerId: string) => {
    setReaders((prev) =>
      prev.map((reader) =>
        reader.id === readerId
          ? { ...reader, isFavorited: !reader.isFavorited }
          : reader
      )
    );
  };

  const retryLoading = () => {
    window.location.reload();
  };

  const getPurchaseButtonContent = (reader: Reader) => {
    const purchaseState = purchaseStates[reader.id];
    const isPurchased = purchasedReaders.includes(reader.id);

    if (isPurchased) {
      return (
        <>
          <CheckCircle className="w-5 h-5 mr-2" />
          In Library
        </>
      );
    }

    if (purchaseState?.isLoading) {
      return (
        <>
          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          Purchasing...
        </>
      );
    }

    if (purchaseState?.success) {
      return (
        <>
          <CheckCircle className="w-5 h-5 mr-2" />
          Purchased!
        </>
      );
    }

    return (
      <>
        <Coins className="w-5 h-5 mr-2" />
        Purchase ({reader.price} credits)
      </>
    );
  };

  const getPurchaseButtonClass = (reader: Reader) => {
    const purchaseState = purchaseStates[reader.id];
    const isPurchased = purchasedReaders.includes(reader.id);

    if (isPurchased) {
      return "flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors duration-300 flex items-center justify-center";
    }

    if (purchaseState?.success) {
      return "flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors duration-300 flex items-center justify-center";
    }

    if (userCredits < reader.price) {
      return "flex-1 py-3 bg-gray-400 cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center";
    }

    return "flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors duration-300 flex items-center justify-center";
  };

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Success Toast */}
      {showPurchaseSuccess && (
        <div className="fixed top-24 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p className="font-bold">Purchase Successful!</p>
            <p className="text-sm">
              "{showPurchaseSuccess}" added to your library
            </p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <BookOpen className="w-16 h-16" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Readers</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8">
              Purchase curated PDFs using credits and build your library!
              Enhance your reading skills with our premium collection.
            </p>

            {/* Credits Display */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm">
                <Coins className="w-6 h-6 text-yellow-300" />
                <span className="text-xl font-bold text-white">
                  {userCredits} Credits
                </span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Search readers by title, author, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filters and Sort */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price">Price: Low to High</option>
                </select>
              </div>

              <div className="text-gray-600">
                {filteredReaders.length} reader
                {filteredReaders.length !== 1 ? "s" : ""} found
              </div>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={`category-${category}`}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
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
                      {difficulties.map((difficulty) => (
                        <button
                          key={`difficulty-${difficulty}`}
                          onClick={() => setSelectedDifficulty(difficulty)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
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
            )}
          </div>
        </div>

        {/* Featured Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            M15 - Buy & Download Readers
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
                >
                  <div className="bg-gray-300 rounded-xl h-48 mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
                  <RefreshCw className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-red-800 mb-2">
                  Failed to load readers
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
          ) : filteredReaders.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-md mx-auto">
                <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No readers found
                </h3>
                <p className="text-gray-600 mb-6">
                  No readers match your current search and filters. Try
                  adjusting your selection.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedDifficulty("all");
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors duration-300"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredReaders.map((reader) => {
                const purchaseState = purchaseStates[reader.id];
                return (
                  <div
                    key={reader.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                  >
                    <div className="relative">
                      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-white" />
                      </div>

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {reader.isNew && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                            NEW
                          </span>
                        )}
                        {reader.isPremium && (
                          <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                            PREMIUM
                          </span>
                        )}
                        {purchasedReaders.includes(reader.id) && (
                          <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                            OWNED
                          </span>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleFavorite(reader.id)}
                        className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            reader.isFavorited
                              ? "text-red-500 fill-current"
                              : "text-gray-400"
                          }`}
                        />
                      </button>

                      {/* Price */}
                      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white/90 px-3 py-1 rounded-full">
                        <Coins className="w-4 h-4 text-yellow-600" />
                        <span className="font-bold text-gray-800">
                          {reader.price}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                          {reader.title}
                        </h3>
                        <p className="text-gray-600 mb-2">by {reader.author}</p>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {reader.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(
                            reader.difficulty
                          )}`}
                        >
                          {reader.difficulty}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium text-gray-700">
                            {reader.rating.toFixed(1)}
                          </span>
                          <span className="text-gray-500 text-sm">
                            ({reader.reviews})
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center mb-6 py-4 bg-gray-50 rounded-xl">
                        <div>
                          <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-sm text-gray-600">
                            {reader.readTime} min
                          </p>
                        </div>
                        <div>
                          <BookOpen className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-sm text-gray-600">
                            {reader.pages} pages
                          </p>
                        </div>
                        <div>
                          <Download className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-sm text-gray-600">
                            {reader.downloads}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mb-6">
                        {reader.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={`${reader.id}-tag-${tagIndex}-${tag}`}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Error Display */}
                      {purchaseState?.error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-600">
                              {purchaseState.error}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePurchase(reader)}
                          disabled={
                            purchaseState?.isLoading ||
                            (userCredits < reader.price &&
                              !purchasedReaders.includes(reader.id))
                          }
                          className={getPurchaseButtonClass(reader)}
                        >
                          {getPurchaseButtonContent(reader)}
                        </button>
                        <button className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors">
                          <Bookmark className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Browse Catalog CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Browse Our Complete Catalog
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Discover hundreds of curated reading materials designed to enhance
              your skills and knowledge.
            </p>
            <button
              onClick={() => navigate("/library")}
              className="px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 font-bold rounded-xl text-lg transition-colors duration-300"
            >
              View My Library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadersPage;
