import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Lock, VpnKey, Security, CheckCircle, Error } from "@mui/icons-material";

const UpdatePasswordForm = () => {
  const [formData, setFormData] = useState({
    current: "",
    newPassword: "",
    confirm: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirm) {
      alert("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.put("/users/change-password", {
        currentPassword: formData.current,
        newPassword: formData.newPassword,
      });
      alert("Password updated successfully!");
      setFormData({ current: "", newPassword: "", confirm: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const hasError = formData.newPassword !== formData.confirm && formData.confirm !== "";
  const passwordStrength = formData.newPassword.length >= 6;
  const passwordsMatch = formData.newPassword === formData.confirm && formData.confirm !== "";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-b border-amber-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow">
            <Security className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Update Password
            </h3>
            <p className="text-sm text-gray-600">
              Keep your account secure with a strong password
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Lock fontSize="small" className="text-gray-400" />
            Current Password
          </label>
          <input
            type="password"
            value={formData.current}
            onChange={handleChange('current')}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            placeholder="Enter your current password"
          />
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <VpnKey fontSize="small" className="text-gray-400" />
            New Password
          </label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={handleChange('newPassword')}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            placeholder="Create a strong password"
          />
          <div className="mt-2 flex items-center gap-2">
            {passwordStrength ? (
              <>
                <CheckCircle className="text-green-500" fontSize="small" />
                <span className="text-xs text-green-600">Password meets minimum requirements</span>
              </>
            ) : formData.newPassword ? (
              <>
                <Error className="text-red-500" fontSize="small" />
                <span className="text-xs text-red-600">Password must be at least 6 characters</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <VpnKey fontSize="small" className="text-gray-400" />
            Confirm New Password
          </label>
          <input
            type="password"
            value={formData.confirm}
            onChange={handleChange('confirm')}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              hasError
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : passwordsMatch
                ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
            }`}
            placeholder="Re-enter your new password"
          />
          <div className="mt-2 flex items-center gap-2">
            {hasError ? (
              <>
                <Error className="text-red-500" fontSize="small" />
                <span className="text-xs text-red-600">Passwords do not match</span>
              </>
            ) : passwordsMatch ? (
              <>
                <CheckCircle className="text-green-500" fontSize="small" />
                <span className="text-xs text-green-600">Passwords match</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Security Tips */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Security fontSize="small" />
            Security Tips
          </h4>
          <ul className="text-xs text-blue-700 space-y-1 list-disc pl-5">
            <li>Use at least 8 characters for stronger security</li>
            <li>Include numbers, uppercase and lowercase letters</li>
            <li>Consider using special characters (!@#$%^&*)</li>
            <li>Avoid using personal information</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          disabled={loading || hasError || !passwordStrength}
          onClick={handleChangePassword}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
            loading || hasError || !passwordStrength
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          <Security fontSize="small" />
          {loading ? "Updating Password..." : "Update Password"}
        </button>
      </div>
    </div>
  );
};

export default UpdatePasswordForm;