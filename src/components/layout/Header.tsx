import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Crown, Sparkles, Menu, X, Home, Trophy, BookOpen } from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const Header: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems: NavItem[] = [
    { path: "/", label: t("home"), icon: Home },
    { path: "/leagues", label: t("leagues"), icon: Trophy },
    { path: "/readers", label: t("readers"), icon: BookOpen },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-slate-900/95 backdrop-blur-md border-b border-white/10 shadow-2xl shadow-purple-500/20"
          : "bg-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center group transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              {/* Logo Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>

              {/* Logo Container */}
              <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-3 backdrop-blur-sm group-hover:border-white/20 transition-all duration-300">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Crown className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-2 h-2 text-white" />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-black bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                      50
                    </span>
                    <span className="text-lg font-light text-purple-300 ml-1">
                      cube
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item: NavItem) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-transparent ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 scale-105"
                      : "text-slate-300 hover:text-white hover:bg-white/10 backdrop-blur-sm hover:scale-105"
                  }`}
                >
                  {/* Active State Background Glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  )}

                  {/* Content */}
                  <div className="relative flex items-center space-x-2">
                    <item.icon
                      className={`w-4 h-4 transition-all duration-300 ${
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-white"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {/* Hover Effect */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-all duration-300 border border-white/10"
            type="button"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-white/10 shadow-2xl">
            <div className="px-4 py-6 space-y-3">
              {navItems.map((item: NavItem) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-lg"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive ? "text-white" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
