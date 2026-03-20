import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  User,
  Bell,
  LogOut,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flame,
  Trash2,
} from "lucide-react";
const forgeLogo = "/forge-logo.png";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const RECENT_SEARCHES_KEY = "forge_recent_searches";
const MAX_RECENT = 10;
const RESULTS_PER_PAGE = 12;

// Helper to manage recent searches in localStorage
const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)) || [];
  } catch {
    return [];
  }
};

const saveRecentSearch = (query) => {
  if (!query.trim()) return;
  const recent = getRecentSearches().filter(
    (s) => s.toLowerCase() !== query.toLowerCase(),
  );
  recent.unshift(query.trim());
  localStorage.setItem(
    RECENT_SEARCHES_KEY,
    JSON.stringify(recent.slice(0, MAX_RECENT)),
  );
};

const clearRecentSearches = () => {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showProfileMenu]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search results
  const fetchUsers = useCallback(
    async (query, page = 1) => {
      if (!query.trim()) {
        setSearchResults([]);
        setSearchTotal(0);
        setHasSearched(false);
        return;
      }

      setSearchLoading(true);
      try {
        const res = await api.get(
          `/users/search?query=${encodeURIComponent(query)}&page=${page}&limit=${RESULTS_PER_PAGE}`,
        );
        const data = res.data.data;
        setSearchResults(data.users || []);
        setSearchTotal(data.total || 0);
        setSearchPage(page);
        setHasSearched(true);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
        setSearchTotal(0);
        setHasSearched(true);
      } finally {
        setSearchLoading(false);
      }
    },
    [],
  );

  // Debounced live search on every keystroke
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowSearchDropdown(true);
    setSearchPage(1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setSearchResults([]);
      setSearchTotal(0);
      setHasSearched(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchUsers(val, 1);
    }, 300);
  };

  // When user clicks on search input, show dropdown with recent searches
  const handleSearchFocus = () => {
    setRecentSearches(getRecentSearches());
    setShowSearchDropdown(true);
  };

  // Handle pressing Enter to save to recent
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      setRecentSearches(getRecentSearches());
      fetchUsers(searchQuery, 1);
    }
    if (e.key === "Escape") {
      setShowSearchDropdown(false);
      searchInputRef.current?.blur();
    }
  };

  // Click a recent search
  const handleRecentClick = (query) => {
    setSearchQuery(query);
    saveRecentSearch(query);
    setRecentSearches(getRecentSearches());
    fetchUsers(query, 1);
  };

  // Click on a user result
  const handleUserClick = (username) => {
    saveRecentSearch(searchQuery);
    setShowSearchDropdown(false);
    setShowMobileSearch(false);
    setSearchQuery("");
    navigate(`/dashboard/user/${username}`);
  };

  // Pagination
  const totalPages = Math.ceil(searchTotal / RESULTS_PER_PAGE);

  const goToPage = (page) => {
    setSearchPage(page);
    fetchUsers(searchQuery, page);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchTotal(0);
    setHasSearched(false);
    searchInputRef.current?.focus();
  };

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
  };

  const goProfile = () => {
    setShowProfileMenu(false);
    navigate("/dashboard/profile");
  };

  const goDashboard = () => {
    navigate("/dashboard");
  };

  const avatarUrl = user?.avatar || null;

  // The search dropdown content (shared between desktop and mobile)
  const renderSearchDropdown = () => {
    if (!showSearchDropdown) return null;

    return (
      <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[100] max-h-[70vh] overflow-hidden flex flex-col">
        {/* Recent Searches (shown when no query typed) */}
        {!searchQuery.trim() && recentSearches.length > 0 && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Recent Searches
              </p>
              <button
                onClick={() => {
                  clearRecentSearches();
                  setRecentSearches([]);
                }}
                className="text-[10px] font-bold text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <Trash2 size={10} />
                Clear
              </button>
            </div>
            <div className="space-y-1">
              {recentSearches.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleRecentClick(s)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors group"
                >
                  <Clock
                    size={14}
                    className="text-gray-300 group-hover:text-[#FF6B00] transition-colors shrink-0"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 truncate">
                    {s}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No query and no recent searches */}
        {!searchQuery.trim() && recentSearches.length === 0 && (
          <div className="p-8 text-center">
            <Search size={24} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              Search for users by name or username
            </p>
          </div>
        )}

        {/* Loading */}
        {searchLoading && searchQuery.trim() && (
          <div className="p-6 flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Searching...</span>
          </div>
        )}

        {/* Search Results */}
        {!searchLoading && hasSearched && searchQuery.trim() && (
          <>
            {searchResults.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center">
                  <User size={24} className="text-gray-300 dark:text-gray-500" />
                </div>
                <p className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">
                  No users found
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Try a different search term
                </p>
              </div>
            ) : (
              <>
                {/* Results header */}
                <div className="px-4 pt-3 pb-2 border-b border-gray-50 dark:border-gray-700">
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    {searchTotal} user{searchTotal !== 1 ? "s" : ""} found
                  </p>
                </div>

                {/* User list */}
                <div className="overflow-y-auto max-h-[45vh] p-2">
                  {searchResults.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => handleUserClick(u.username)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 dark:hover:bg-gray-700/50 transition-all text-left group"
                    >
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.fullName}
                          className="w-10 h-10 rounded-xl object-cover shadow-sm border border-gray-100 dark:border-gray-700 group-hover:border-orange-200 transition-colors shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffae75] to-[#FAD5A5] flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                          {(u.username || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-[#FF6B00] transition-colors">
                          {u.fullName || u.username}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          @{u.username}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-300 shrink-0">
                        <Flame size={12} className="text-orange-300" />
                        {u.totalSpark || 0}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
                    <button
                      onClick={() => goToPage(searchPage - 1)}
                      disabled={searchPage <= 1}
                      className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-[#FF6B00] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={14} />
                      Prev
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        // Show pages around the current page
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (searchPage <= 3) {
                          pageNum = i + 1;
                        } else if (searchPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = searchPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                              pageNum === searchPage
                                ? "bg-[#FF6B00] text-white shadow-sm"
                                : "text-gray-400 hover:bg-gray-50 hover:text-gray-800"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => goToPage(searchPage + 1)}
                      disabled={searchPage >= totalPages}
                      className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-[#FF6B00] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center px-4 sm:px-6 justify-between sticky top-0 z-50 transition-colors">
        {/* Left: Logo */}
        <button
          onClick={goDashboard}
          className="flex items-center gap-3 hover:opacity-75 transition-opacity"
          title="Go to Dashboard"
        >
          <img
            src={forgeLogo}
            alt="Forge Logo"
            className="w-20 h-20 object-contain rounded-lg cursor-pointer"
          />
        </button>

        {/* Center: Search Bar (desktop) */}
        <div className="hidden sm:flex flex-1 max-w-md mx-6" ref={searchRef}>
          <div className="relative w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6B00] transition-colors pointer-events-none"
              size={18}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search users..."
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 py-2.5 pl-12 pr-10 rounded-2xl text-gray-900 dark:text-gray-100 outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all text-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}

            {/* Search Dropdown */}
            {renderSearchDropdown()}
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button className="text-gray-400 hover:text-[#FF6B00] transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF6B00] rounded-full border-2 border-white"></span>
          </button>

          {/* Mobile search button */}
          <button
            className="sm:hidden text-gray-400 hover:text-[#FF6B00] transition-colors"
            onClick={() => {
              setShowMobileSearch(true);
              setRecentSearches(getRecentSearches());
              setShowSearchDropdown(true);
            }}
          >
            <Search size={20} />
          </button>

          {user ? (
            <>
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l sm:border-gray-100 dark:sm:border-gray-700 hover:opacity-80 transition-opacity"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-none">
                      {user.fullName.split(" ")[0] || "User"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      User
                    </p>
                  </div>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-9 h-9 rounded-xl object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#ffae75] to-[#FAD5A5] flex items-center justify-center text-white shadow-md">
                      <User size={18} />
                    </div>
                  )}
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50">
                    <button
                      onClick={goProfile}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors text-sm font-medium"
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l sm:border-gray-100">
              <p className="text-sm text-gray-600">Login</p>
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#ffae75] to-[#FAD5A5] flex items-center justify-center text-white shadow-md">
                <User size={18} />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-gray-900 flex flex-col">
          {/* Mobile search header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => {
                setShowMobileSearch(false);
                setShowSearchDropdown(false);
                setSearchQuery("");
                setSearchResults([]);
                setHasSearched(false);
              }}
              className="text-gray-400 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="relative flex-1" ref={searchRef}>
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search users..."
                autoFocus
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 py-2.5 pl-10 pr-10 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all text-sm"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Mobile search body */}
          <div className="flex-1 overflow-y-auto">
            {/* Recent searches for mobile */}
            {!searchQuery.trim() && recentSearches.length > 0 && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Recent Searches
                  </p>
                  <button
                    onClick={() => {
                      clearRecentSearches();
                      setRecentSearches([]);
                    }}
                    className="text-[10px] font-bold text-red-400 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 size={10} />
                    Clear
                  </button>
                </div>
                {recentSearches.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleRecentClick(s)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-left transition-colors"
                  >
                    <Clock size={14} className="text-gray-300 shrink-0" />
                    <span className="text-sm text-gray-600 truncate">{s}</span>
                  </button>
                ))}
              </div>
            )}

            {!searchQuery.trim() && recentSearches.length === 0 && (
              <div className="p-12 text-center">
                <Search size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">
                  Search for users by name or username
                </p>
              </div>
            )}

            {/* Loading */}
            {searchLoading && searchQuery.trim() && (
              <div className="p-8 flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-400">Searching...</span>
              </div>
            )}

            {/* Results */}
            {!searchLoading && hasSearched && searchQuery.trim() && (
              <>
                {searchResults.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
                      <User size={28} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-600 mb-1">
                      No users found
                    </p>
                    <p className="text-xs text-gray-400">
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="px-4 pt-3 pb-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {searchTotal} user{searchTotal !== 1 ? "s" : ""} found
                      </p>
                    </div>
                    <div className="px-2 pb-4">
                      {searchResults.map((u) => (
                        <button
                          key={u._id}
                          onClick={() => handleUserClick(u.username)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-all text-left"
                        >
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.fullName}
                              className="w-11 h-11 rounded-xl object-cover shadow-sm border border-gray-100 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ffae75] to-[#FAD5A5] flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                              {(u.username || "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">
                              {u.fullName || u.username}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              @{u.username}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-gray-300 shrink-0">
                            <Flame size={12} className="text-orange-300" />
                            {u.totalSpark || 0}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Mobile Pagination */}
                    {totalPages > 1 && (
                      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                        <button
                          onClick={() => goToPage(searchPage - 1)}
                          disabled={searchPage <= 1}
                          className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-[#FF6B00] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft size={14} />
                          Prev
                        </button>
                        <span className="text-xs font-bold text-gray-400">
                          Page {searchPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => goToPage(searchPage + 1)}
                          disabled={searchPage >= totalPages}
                          className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-[#FF6B00] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
