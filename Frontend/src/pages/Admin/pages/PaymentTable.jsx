import React from "react";
import {
  Users,
  Mail,
  BookOpen,
  IndianRupee,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
} from "lucide-react";

const PaymentTable = ({ rows }) => {
  // ================= STATUS COLOR =================
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // ================= STATUS ICON =================
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return <CheckCircle className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "failed":
      case "cancelled":
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // ================= FORMAT AMOUNT (RUPEES) =================
  const formatAmount = (amountInPaise) => {
    const amountInRupees = (Number(amountInPaise) || 0) / 100;

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amountInRupees);
  };

  // ================= TOTAL REVENUE =================
  const totalRevenue = rows.reduce(
    (sum, payment) => sum + (Number(payment.amount) || 0),
    0
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Transactions
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Total {rows.length} transaction
              {rows.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-xl font-bold text-green-600">
              {formatAmount(totalRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <IndianRupee className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm">
                      No payment transactions found
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Transactions will appear here when users make payments
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((payment) => (
                <tr
                  key={payment._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* User */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-700">
                          {payment.userId?.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {payment.userId?.name || "Unknown User"}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.userId?.email || "—"}
                  </td>

                  {/* Course */}
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {payment.courseId?.title || "Unknown Course"}
                  </td>

                  {/* Amount (Correctly Converted) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatAmount(payment.amount)}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {getStatusIcon(payment.status)}
                      {payment.status || "Unknown"}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(payment.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(payment.createdAt).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {rows.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing{" "}
              <span className="font-medium">
                {rows.length}
              </span>{" "}
              of{" "}
              <span className="font-medium">
                {rows.length}
              </span>{" "}
              transactions
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTable;