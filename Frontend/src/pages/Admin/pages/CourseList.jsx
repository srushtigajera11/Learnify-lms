import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  IndianRupee,
  Users,
  CalendarDays,
  Loader2,
  MoreVertical,
} from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // ================= FETCH COURSES =================
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/courses");
      setCourses(res.data || []);
    } catch (err) {
      console.error("Fetch Courses Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ================= CLOSE DROPDOWN ON OUTSIDE CLICK =================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-wrapper")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ================= STATUS CHANGE =================
  const handleStatusChange = async (id, status) => {
    try {
      await axiosInstance.put(`/admin/course/${id}/status`, { status });

      // Optimistic UI update
      setCourses((prev) =>
        prev.map((course) =>
          course._id === id ? { ...course, status } : course
        )
      );

      setOpenDropdown(null);
    } catch (err) {
      console.error(
        "Status Update Error:",
        err.response?.data || err.message
      );
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/admin/course/${id}/delete`);

      // Remove instantly from UI
      setCourses((prev) => prev.filter((course) => course._id !== id));

      setOpenDropdown(null);
    } catch (err) {
      console.error("Delete Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  // ================= FILTER =================
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title?.toLowerCase().includes(search.toLowerCase()) ||
        course.createdBy?.name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || course.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [courses, search, statusFilter]);

  // ================= STATUS BADGE =================
  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Search & Filter */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Loader */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin w-6 h-6" />
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((course) => {
          const revenue =
            (course.enrollmentCount || 0) * (course.price || 0);

          return (
            <div
              key={course._id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition"
            >
              {/* Thumbnail */}
              <div className="h-28 bg-gray-200">
                <img
                  src={course.thumbnail || "/placeholder.jpg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 relative dropdown-wrapper">
                {/* Dropdown Trigger */}
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === course._id
                        ? null
                        : course._id
                    )
                  }
                  className="absolute top-3 right-3"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-3 top-10 w-40 bg-white border rounded-md shadow-md text-sm transition-all duration-200 z-20 ${
                    openDropdown === course._id
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <button
                    onClick={() =>
                      handleStatusChange(course._id, "published")
                    }
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      handleStatusChange(course._id, "rejected")
                    }
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() =>
                      handleStatusChange(course._id, "draft")
                    }
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Move to Draft
                  </button>

                  <button
                    onClick={() => handleDelete(course._id)}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-base line-clamp-2">
                  {course.title}
                </h3>

                {/* Instructor */}
                <p className="text-sm text-gray-600 mt-1">
                  {course.createdBy?.name || "Unknown Instructor"}
                </p>

                {/* Stats */}
                <div className="flex justify-between mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    {course.price || 0}
                  </div>

                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.enrollmentCount  || 0}
                  </div>

                  <div className="font-medium">₹{revenue}</div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                  <CalendarDays className="w-4 h-4" />
                  {new Date(course.createdAt).toLocaleDateString()}
                </div>

                {/* Status */}
                <div className="mt-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      course.status
                    )}`}
                  >
                    {course.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseList;