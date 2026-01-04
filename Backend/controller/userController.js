
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { isAdmin } = require('../middleware/isAdmin');
const { registerSchema } = require('../utils/validation');
dotenv.config();



exports.createUserProfile = async (req, res) => {
  try {
     const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role : role.toLowerCase() });

    await user.save(); // Save BEFORE sending response

    res.status(201).json({  success: true,  message: "User profile created"}); // ✅ Only ONE response
  } catch (error) {
   
    res.status(500).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
     const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign({ id: user._id , role : user.role,isAdmin : user.isAdmin}, process.env.JWT_SECRET, { expiresIn: "4h" });
       res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'Lax',
                secure: false,
                maxAge: 60 * 60  * 1000, 
              });
        res.json({ success : true , message: 'Logged in', user:{user_id : user._id ,role : user.role,isAdmin : user.isAdmin} });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}   

exports.logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: 'Lax',
    secure: false, // set to true in production with HTTPS
  }).json({ success: true, message: "Logged out successfully" });
};

exports.getUserProfile = async(req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user) return res.status(404).json({error : 'user not found'});
        res.json(user);
    }catch(err){
        res.status(500).json({error : err.message})
    }
};


// @desc    Get current user's profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({user});
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (err) {

    res.status(500).json({ message: "Update failed" });
  }
};





// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
