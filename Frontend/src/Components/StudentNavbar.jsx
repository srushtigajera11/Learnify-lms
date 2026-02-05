import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ClearIcon from "@mui/icons-material/Clear";
import PersonIcon from "@mui/icons-material/Person";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import BookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useAuth } from "../Context/AuthContext";


const StudentNavbar = () => {
   const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const searchTimeout = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search function
  const searchCourses = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      // Make API call with search query
      const response = await axiosInstance.get(`/students/courses?q=${encodeURIComponent(query)}`);
      
    
      
      if (response.data?.success) {
        setSearchResults(response.data.courses || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim()) {
      setShowResults(true);
      
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      searchTimeout.current = setTimeout(() => {
        searchCourses(value);
      }, 500);
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
  };

  const handleCourseClick = (courseId) => {
    navigate(`/student/course/${courseId}`);
    setShowResults(false);
    setSearchTerm("");
  };

  const handleViewAllResults = () => {
    navigate(`/student/search?q=${encodeURIComponent(searchTerm)}`);
    setShowResults(false);
  };

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "U";

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);


  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };


  return (
    <nav className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 shadow-lg py-2 ">
      <div className="flex px-4 items-center justify-between gap-6">
        {/* Logo */}
        <div 
          onClick={() => navigate("/student/dashboard")}
          className="text-xl font-bold text-white cursor-pointer hover:text-indigo-300 transition-colors whitespace-nowrap"
        >
          Learnify
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-xl mx-4" ref={searchRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => searchTerm.trim() && setShowResults(true)}
              placeholder="Search courses, lessons..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-700 rounded-r-lg"
              >
                <ClearIcon className="h-4 w-4 text-gray-400 hover:text-gray-300" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full mt-1 w-full bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50 max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500 mr-2"></div>
                  <span className="text-sm text-gray-300">Searching for "{searchTerm}"...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="px-3 py-2 bg-gray-900 border-b border-gray-700">
                    <div className="flex items-center text-xs font-semibold text-gray-300 uppercase tracking-wide">
                      <SchoolIcon className="h-3 w-3 mr-2" />
                      Found {searchResults.length} courses for "{searchTerm}"
                    </div>
                  </div>
                  
                  {searchResults.slice(0, 4).map((course) => (
                    <button
                      key={course._id || course.id}
                      onClick={() => handleCourseClick(course._id || course.id)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-700 border-b border-gray-700 last:border-b-0 transition-colors duration-150"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm">
                            {course.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {course.category} • {course.totalLessons || 0} lessons
                          </div>
                          {course.progress !== undefined && (
                            <div className="flex items-center mt-2">
                              <div className="w-full bg-gray-700 rounded-full h-1.5">
                                <div 
                                  className="bg-green-500 h-1.5 rounded-full" 
                                  style={{ width: `${course.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-400 ml-2">
                                {course.progress || 0}%
                              </span>
                            </div>
                          )}
                        </div>
                        <ArrowForwardIcon className="h-4 w-4 text-gray-500 ml-3 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                  
                  {searchResults.length > 4 && (
                    <button
                      onClick={handleViewAllResults}
                      className="w-full py-2 text-center text-indigo-400 hover:bg-gray-700 text-sm font-medium border-t border-gray-700"
                    >
                      View all {searchResults.length} results
                    </button>
                  )}
                </>
              ) : searchTerm && !isSearching ? (
                <div className="px-4 py-3 text-center">
                  <SearchIcon className="h-6 w-6 text-gray-600 mx-auto mb-1" />
                  <div className="text-gray-400 text-sm">
                    No courses found for "{searchTerm}"
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Try different keywords
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-end pl-9 gap-3">
          <button
            onClick={() => navigate("/student/mylearning")}
            className="text-gray-300 hover:text-white text-sm font-medium transition-colors whitespace-nowrap px-2 py-1 rounded hover:bg-gray-800"
          >
            My Learning
          </button>

          <button
            onClick={() => navigate("/student/wishlist")}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Wishlist"
          >
            <FavoriteBorderIcon className="h-5 w-5" />
          </button>

          {/* Profile Avatar */}
          <div className="relative">
            <button
              onClick={handleMenuOpen}
             className="flex items-center justify-center px-2.5 py-2 bg-indigo-600 !  rounded-full text-white font-bold"

            >
              {initials}
            </button>

            {/* Dropdown Menu */}
            {anchorEl && (
              <div className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
                <div className="px-2 py-1.5 border-b border-gray-700 bg-gray-900">
                  <div className="flex items-center gap-2 ">
                    {/* <div className="w-7 h-7 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full p-2 flex items-center justify-center text-white font-bold text-xs">
                      {initials}
                    </div> */}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {user?.name || "Student"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user?.email || "student@learnify.com"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      handleMenuClose();
                      navigate("/student/mylearning");
                    }}
                    className="w-full flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
                  >
                    <BookIcon className="h-4 w-4 mr-2 text-gray-400" />
                    My Learning
                  </button>

                  <button
                    onClick={() => {
                      handleMenuClose();
                      navigate("/student/wishlist");
                    }}
                    className="w-full flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
                  >
                    <FavoriteBorderIcon className="h-4 w-4 mr-2 text-gray-400" />
                    Wishlist
                  </button>

                  <button
                    onClick={() => {
                      handleMenuClose();
                      navigate("/student/purchaseHistory");
                    }}
                    className="w-full flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
                  >
                    <HistoryIcon className="h-4 w-4 mr-2 text-gray-400" />
                    History
                  </button>

                  <button
                    onClick={() => {
                      handleMenuClose();
                      navigate("/student/profile");
                    }}
                    className="w-full flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
                  >
                    <PersonIcon className="h-4 w-4 mr-2 text-gray-400" />
                    Profile
                  </button>

                  <div className="border-t border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2 text-red-400 hover:bg-red-900/20 transition-colors text-sm"
                    >
                      <LogoutIcon className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StudentNavbar;