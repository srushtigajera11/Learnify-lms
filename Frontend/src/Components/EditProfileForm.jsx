import { Box, TextField, Button, Stack, Card, CardContent, Typography, Avatar, Chip, IconButton } from "@mui/material";
import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Save, Person, Email, Work, LocationOn, Language, Code, Add, Close } from "@mui/icons-material";

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
    <Stack spacing={2}>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <TextField
              label="Full Name"
              value={formData.name}
              onChange={handleChange('name')}
              required
              fullWidth
              variant="outlined"
              size="small"
            />
            
            <TextField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              fullWidth
              variant="outlined"
              size="small"
            />

            <TextField
              label="Professional Headline"
              value={formData.headline}
              onChange={handleChange('headline')}
              fullWidth
              variant="outlined"
              size="small"
              placeholder="e.g., Senior Full Stack Developer"
            />

            <TextField
              label="Location"
              value={formData.location}
              onChange={handleChange('location')}
              fullWidth
              variant="outlined"
              size="small"
              placeholder="e.g., San Francisco, CA"
            />

            <TextField
              label="Website/Portfolio"
              value={formData.website}
              onChange={handleChange('website')}
              fullWidth
              variant="outlined"
              size="small"
              placeholder="https://your-portfolio.com"
            />

            {/* Enhanced Area of Expertise Section */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, bgcolor: 'background.default' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Code color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  Areas of Expertise
                </Typography>
              </Box>
              
              {/* Skills Input with Add Button */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add your skills (e.g., React, Python, UI/UX)"
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddSkill}
                  disabled={!newSkill.trim()}
                  startIcon={<Add />}
                  size="small"
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  Add
                </Button>
              </Box>

              {/* Quick Skill Suggestions */}
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Quick add:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {skillSuggestions.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    onClick={() => {
                      if (!formData.expertise.includes(skill)) {
                        setFormData(prev => ({
                          ...prev,
                          expertise: [...prev.expertise, skill]
                        }));
                      }
                    }}
                    variant={formData.expertise.includes(skill) ? "filled" : "outlined"}
                    color={formData.expertise.includes(skill) ? "primary" : "default"}
                    sx={{ fontSize: '0.7rem', cursor: 'pointer' }}
                  />
                ))}
              </Box>

              {/* Current Skills Display */}
              {formData.expertise.length > 0 ? (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Your skills ({formData.expertise.length}):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.expertise.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        onDelete={() => handleRemoveSkill(skill)}
                        variant="filled"
                        color="primary"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary" fontStyle="italic">
                  No skills added yet. Add your areas of expertise to showcase your knowledge.
                </Typography>
              )}
            </Box>

            <TextField
              label="Professional Bio"
              value={formData.bio}
              onChange={handleChange('bio')}
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Share your story, expertise, and what students can expect from your courses..."
            />
          </Stack>
        </CardContent>
      </Card>

      <Button 
        variant="contained" 
        type="submit" 
        disabled={loading}
        onClick={handleSubmit}
        startIcon={<Save />}
        size="medium"
        sx={{ 
          alignSelf: 'flex-start',
          px: 3,
          py: 1
        }}
      >
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </Stack>
  );
};

export default EditProfileForm;