import { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post("/users/forgot-password", { email });

      setStatus({
        type: "success",
        msg: "Reset link sent! Check your email."
      });

    } catch (err) {
      setStatus({
        type: "error",
        msg: err.response?.data?.message || "Something went wrong"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Forgot Password
        </h2>

        <p className="text-gray-500 mb-6 text-sm">
          Enter your email and we'll send you a reset link.
        </p>

        {status && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              status.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 mt-3 rounded-lg text-sm font-medium transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-indigo-600 hover:underline"
          >
            Back to login
          </Link>
        </p>

      </div>
    </div>
  );
}