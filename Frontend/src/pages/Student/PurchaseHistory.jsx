import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const PurchaseHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axiosInstance.get("/history/payments");
        setPayments(res.data.payments || []);
      } catch (error) {
        console.error("Payments fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800">
          Billing & Payment History
        </h1>
        <p className="text-gray-500 mt-2">
          View all your course transactions and payment details.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading payments...</p>
      ) : payments.length === 0 ? (
        <div className="bg-white shadow-sm rounded-xl p-8 text-center">
          <p className="text-gray-500 text-lg">
            No payment history found.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {payments.map((item) => (
            <div
              key={item._id}
              className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                 <h2 className="text-lg font-semibold text-gray-800">
  {item.course.title}
</h2>

{!item.course._id && (
  <span className="text-xs text-red-500">
    This course has been removed
  </span>
)}

                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">
                    ₹{item.amount / 100}
                  </p>

                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "success"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-4"></div>

              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium">Payment ID</p>
                  <p className="truncate">
                    {item.razorpayPaymentId}
                  </p>
                </div>

                <div>
                  <p className="font-medium">Order ID</p>
                  <p className="truncate">
                    {item.razorpayOrderId}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;