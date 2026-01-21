import React from "react";
import { Users, Calendar, BookOpen, Mail } from "lucide-react";

const EnrollmentTable = ({ rows }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Course Enrollments</h3>
            <p className="text-sm text-gray-600 mt-1">
              Total {rows.length} enrollment{rows.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Updated just now</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  User
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Course
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Enrolled On
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm">No enrollments found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Students will appear here when they enroll in courses
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((enroll) => (
                <tr key={enroll._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-700">
                          {enroll.studentId?.name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {enroll.studentId?.name || 'Unknown User'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {enroll.studentId?.email || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {enroll.courseId?.title || 'Unknown Course'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(enroll.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(enroll.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {rows.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing <span className="font-medium">{Math.min(rows.length, 10)}</span> of{" "}
              <span className="font-medium">{rows.length}</span> enrollments
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                Previous
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentTable;