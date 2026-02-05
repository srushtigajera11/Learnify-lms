import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { 
  Save, 
  Person, 
  Email, 
  Work, 
  LocationOn, 
  Language, 
  Code, 
  Add, 
  Close 
} from "@mui/icons-material";

const EditProfileForm = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    bio: "Senior Full Stack Developer with 5+ years of experience in React, Node.js, and MongoDB. Passionate about teaching and creating impactful learning experiences." || "",
    location: "San Francisco, CA" || "",
    website: "https://john-doe-portfolio.com" || "",
    headline: "Senior Full Stack Developer & Instructor" || "",
    expertise: ["React", "Node.js", "MongoDB", "JavaScript", "TypeScript"]
  });

  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.expertise.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.put("/users/profile", formData);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Common skills suggestions
  const skillSuggestions = ["React", "Python", "UI/UX", "Data Science", "Machine Learning", "DevOps", "Cloud Computing", "Mobile Development"];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange('name')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email address"
              />
            </div>

            {/* Professional Headline */}
            <div>
              <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">
                Professional Headline
              </label>
              <input
                id="headline"
                type="text"
                value={formData.headline}
                onChange={handleChange('headline')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Senior Full Stack Developer"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={handleChange('location')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., San Francisco, CA"
              />
            </div>

            {/* Website/Portfolio */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website/Portfolio
              </label>
              <input
                id="website"
                type="url"
                value={formData.website}
                onChange={handleChange('website')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://your-portfolio.com"
              />
            </div>

            {/* Enhanced Area of Expertise Section */}
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <Code className="text-blue-600" fontSize="small" />
                <h3 className="text-lg font-semibold text-blue-600">
                  Areas of Expertise
                </h3>
              </div>
              
              {/* Skills Input with Add Button */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add your skills (e.g., React, Python, UI/UX)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={!newSkill.trim()}
                  className={`px-4 py-2 rounded-md font-medium flex items-center gap-1 ${
                    !newSkill.trim()
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Add fontSize="small" />
                  Add
                </button>
              </div>

              {/* Quick Skill Suggestions */}
              <p className="text-xs text-gray-500 mb-2">
                Quick add:
              </p>
              <div className="flex flex-wrap gap-1 mb-4">
                {skillSuggestions.map((skill, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      if (!formData.expertise.includes(skill)) {
                        setFormData(prev => ({
                          ...prev,
                          expertise: [...prev.expertise, skill]
                        }));
                      }
                    }}
                    className={`px-2 py-1 text-xs rounded-full border ${
                      formData.expertise.includes(skill)
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              {/* Current Skills Display */}
              {formData.expertise.length > 0 ? (
                <div>
                  <p className="text-xs text-gray-500 mb-2">
                    Your skills ({formData.expertise.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise.map((skill, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-blue-600 hover:text-blue-800 ml-1"
                        >
                          <Close fontSize="small" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No skills added yet. Add your areas of expertise to showcase your knowledge.
                </p>
              )}
            </div>

            {/* Professional Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Professional Bio
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={handleChange('bio')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share your story, expertise, and what students can expect from your courses..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        type="button"
        disabled={loading}
        onClick={handleSubmit}
        className={`px-6 py-2 rounded-md font-medium flex items-center gap-2 ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <Save fontSize="small" />
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
};

export default EditProfileForm;