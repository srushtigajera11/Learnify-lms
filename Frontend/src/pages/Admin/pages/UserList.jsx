import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  UserX, 
  CheckCircle, 
  User, 
  Mail, 
  Calendar,
  Shield,
  GraduationCap,
  Users,
  MoreVertical
} from "lucide-react";
import { blockUnblockUser } from "../services/adminApi";

const UserList = ({ users, refresh }) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleBlockToggle = async (userId, currentStatus) => {
    const shouldBlock = !currentStatus;
    await blockUnblockUser(userId, shouldBlock);
    refresh();
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && !user.isBlocked) ||
      (statusFilter === "blocked" && user.isBlocked);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-300';
      case 'instructor': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'student': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-3 h-3" />;
      case 'instructor': return <GraduationCap className="w-3 h-3" />;
      case 'student': return <Users className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6">
        {/* Header with Search & Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              User Management ({filteredUsers.length} users)
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
              />
            </div>
            
            {/* Role Filter */}
            <div className="flex-1 sm:flex-none sm:w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1 sr-only">
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            {/* Status Filter */}
            <div className="flex-1 sm:flex-none sm:w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1 sr-only">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-sm">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${user.isBlocked ? 'bg-red-100 text-red-800 border-red-300' : 'bg-green-100 text-green-800 border-green-300'}`}>
                        {user.isBlocked ? (
                          <UserX className="w-3 h-3" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${user.isBlocked 
                          ? 'border-green-300 text-green-600 hover:bg-green-50' 
                          : 'border-red-300 text-red-600 hover:bg-red-50'
                        } flex items-center gap-1`}
                      >
                        {user.isBlocked ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <UserX className="w-4 h-4" />
                            Block
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-2 py-3 border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handleChangePage(null, page - 1)}
              disabled={page === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handleChangePage(null, page + 1)}
              disabled={page >= Math.ceil(filteredUsers.length / rowsPerPage) - 1}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{page * rowsPerPage + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min((page + 1) * rowsPerPage, filteredUsers.length)}
                </span>{" "}
                of <span className="font-medium">{filteredUsers.length}</span> users
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handleChangePage(null, page - 1)}
                  disabled={page === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  Previous
                </button>
                <button
                  onClick={() => handleChangePage(null, page + 1)}
                  disabled={page >= Math.ceil(filteredUsers.length / rowsPerPage) - 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Rows per page selector */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700">
            Rows per page:
          </div>
          <select
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default UserList;