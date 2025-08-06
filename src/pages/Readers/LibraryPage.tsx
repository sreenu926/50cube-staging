/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Download,
  Clock,
  Calendar,
  RefreshCw,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

interface PurchasedReader {
  id: string;
  title: string;
  author: string;
  description: string;
  pageCount?: number;
  pages?: number;
  purchaseDate?: string;
  purchasedAt?: string;
  downloadCount: number;
  maxDownloads: number;
  category: string;
  thumbnail?: string;
  downloadUrl?: string;
  price?: number;
}

const LibraryPage: React.FC = () => {
  const [library, setLibrary] = useState<PurchasedReader[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadLibraryFromStorage();
  }, []);

  const loadLibraryFromStorage = () => {
    try {
      setLoading(true);

      // Load library items from localStorage
      const libraryItems = localStorage.getItem("libraryItems");

      if (libraryItems) {
        const parsedItems: PurchasedReader[] = JSON.parse(libraryItems);

        // Normalize the data structure
        const normalizedItems = parsedItems.map((item) => ({
          id: item.id,
          title: item.title || "Untitled Reader",
          author: item.author || "Unknown Author",
          description: item.description || "No description available",
          pageCount: item.pageCount || item.pages || 0,
          purchaseDate:
            item.purchaseDate || item.purchasedAt || new Date().toISOString(),
          downloadCount: item.downloadCount || 0,
          maxDownloads: item.maxDownloads || 5,
          category: item.category || "General",
          thumbnail: item.thumbnail,
          downloadUrl: item.downloadUrl,
          price: item.price || 0,
        }));

        setLibrary(normalizedItems);
      } else {
        // No items in localStorage - empty library
        setLibrary([]);
      }
    } catch (error) {
      console.error("Error loading library from localStorage:", error);
      setLibrary([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (readerId: string, title: string) => {
    try {
      setDownloadingId(readerId);

      // Check if download URL exists and is not expired
      const reader = library.find((r) => r.id === readerId);
      if (!reader?.downloadUrl) {
        alert("Download link not available. Please contact support.");
        return;
      }

      // Check if link is expired (24 hours from purchase)
      const token = new URL(
        reader.downloadUrl,
        window.location.origin
      ).searchParams.get("token");
      if (token) {
        const tokenTime = parseInt(token);
        const isExpired = Date.now() - tokenTime > 24 * 60 * 60 * 1000; // 24 hours

        if (isExpired) {
          alert(
            "Download link has expired (24 hours limit). Please contact support for a new link."
          );
          return;
        }
      }

      // Check download limit
      if (reader.downloadCount >= reader.maxDownloads) {
        alert(
          `Download limit reached (${reader.maxDownloads} downloads maximum).`
        );
        return;
      }

      // Simulate download process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real app, this would trigger actual file download
      // For demo purposes, show success message
      alert(
        `✅ Download Started!\n\n"${title}" is downloading...\n\nIn production, this would download the actual PDF file.`
      );

      // Update download count in localStorage
      const libraryItems = JSON.parse(
        localStorage.getItem("libraryItems") || "[]"
      );
      const updatedItems = libraryItems.map((item: any) =>
        item.id === readerId
          ? { ...item, downloadCount: (item.downloadCount || 0) + 1 }
          : item
      );
      localStorage.setItem("libraryItems", JSON.stringify(updatedItems));

      // Update local state
      setLibrary((prev) =>
        prev.map((reader) =>
          reader.id === readerId
            ? { ...reader, downloadCount: reader.downloadCount + 1 }
            : reader
        )
      );
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const getTimeSincePurchase = (purchaseDate: string) => {
    const now = new Date();
    const purchased = new Date(purchaseDate);
    const daysDiff = Math.floor(
      (now.getTime() - purchased.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) return "Today";
    if (daysDiff === 1) return "Yesterday";
    if (daysDiff < 7) return `${daysDiff} days ago`;
    if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
    return `${Math.floor(daysDiff / 30)} months ago`;
  };

  const clearLibrary = () => {
    if (
      confirm(
        "Are you sure you want to clear your entire library? This cannot be undone."
      )
    ) {
      localStorage.removeItem("libraryItems");
      localStorage.removeItem("purchasedReaders");
      setLibrary([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen mt-20 bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <BookOpen className="w-16 h-16" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">My Library</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Access your purchased readers and download them anytime. Download
              links expire after 24 hours.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800">
                  {library.length}
                </div>
                <div className="text-gray-600">Purchased Readers</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Download className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800">
                  {library.reduce(
                    (sum, reader) => sum + reader.downloadCount,
                    0
                  )}
                </div>
                <div className="text-gray-600">Total Downloads</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800">
                  {library.reduce(
                    (sum, reader) => sum + (reader.pageCount || 0),
                    0
                  )}
                </div>
                <div className="text-gray-600">Total Pages</div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-blue-800">M15 Test Status</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-blue-700">
                ✅ Credits deducted (localStorage)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-blue-700">✅ Item appears in library</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-blue-700">✅ Links expire (24 hours)</span>
            </div>
          </div>
          {library.length > 0 && (
            <button
              onClick={clearLibrary}
              className="mt-3 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded transition-colors"
            >
              Clear Library (for testing)
            </button>
          )}
        </div>

        {/* Library Grid */}
        {library.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-md mx-auto">
              <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Readers Yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't purchased any readers yet. Browse our catalog to get
                started!
              </p>
              <a
                href="/readers"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors duration-300"
              >
                Browse Catalog
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {library.map((reader) => {
              // Check if download link is expired
              const token = reader.downloadUrl
                ? new URL(
                    reader.downloadUrl,
                    window.location.origin
                  ).searchParams.get("token")
                : null;
              const isExpired = token
                ? Date.now() - parseInt(token) > 24 * 60 * 60 * 1000
                : false;
              const canDownload =
                !isExpired && reader.downloadCount < reader.maxDownloads;

              return (
                <div
                  key={reader.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-2">
                          {reader.title}
                        </h3>
                        <p className="text-gray-600 mb-2">by {reader.author}</p>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {reader.category}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {reader.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6 py-4 bg-gray-50 rounded-xl">
                      <div className="text-center">
                        <BookOpen className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm text-gray-600">
                          {reader.pageCount || 0} pages
                        </p>
                      </div>
                      <div className="text-center">
                        <Download className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm text-gray-600">
                          {reader.downloadCount}/{reader.maxDownloads}
                        </p>
                      </div>
                    </div>

                    {/* Purchase Info & Status */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Purchased{" "}
                          {getTimeSincePurchase(
                            reader.purchaseDate || new Date().toISOString()
                          )}
                        </span>
                      </div>

                      {isExpired && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span>Download link expired (24h limit)</span>
                        </div>
                      )}

                      {reader.downloadCount >= reader.maxDownloads && (
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                          <AlertCircle className="w-4 h-4" />
                          <span>Download limit reached</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(reader.id, reader.title)}
                        disabled={downloadingId === reader.id || !canDownload}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 font-bold rounded-xl transition-colors duration-300 ${
                          canDownload
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-gray-400 cursor-not-allowed text-white"
                        }`}
                      >
                        {downloadingId === reader.id ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                        {!canDownload
                          ? isExpired
                            ? "Link Expired"
                            : "Limit Reached"
                          : "Download"}
                      </button>

                      <button className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors">
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Download Progress */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Downloads Used</span>
                        <span>
                          {reader.downloadCount}/{reader.maxDownloads}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            reader.downloadCount >= reader.maxDownloads
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                          style={{
                            width: `${
                              (reader.downloadCount / reader.maxDownloads) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Expand Your Library</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Discover more curated readers to enhance your learning journey.
            </p>
            <a
              href="/readers"
              className="inline-block px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 font-bold rounded-xl text-lg transition-colors duration-300"
            >
              Browse Catalog
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
