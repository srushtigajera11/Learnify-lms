import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const getStrength = (pass) => {
    if (pass.length > 10) return "Strong";
    if (pass.length > 6) return "Medium";
    if (pass.length > 0) return "Weak";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      return setStatus({
        type: "error",
        msg: "Passwords don't match"
      });
    }

    setLoading(true);

    try {
      await axiosInstance.post(`/users/reset-password/${token}`, {
        password
      });

      setStatus({
        type: "success",
        msg: "Password reset successfully! Redirecting..."
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setStatus({
        type: "error",
        msg: err.response?.data?.message || "Invalid or expired link"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Reset Password
        </h2>

        <p className="text-gray-500 mb-6 text-sm">
          Choose a strong new password.
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

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          {/* Strength indicator */}
          {password && (
            <p className="text-xs text-gray-500">
              Strength: {getStrength(password)}
            </p>
          )}

          {/* Confirm password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-sm font-medium transition"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Remembered your password?{" "}
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