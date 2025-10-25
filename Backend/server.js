
require('dotenv').config(); // 👈 This should be the first line!
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const connectDB = require("./config/db");
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require("./routes/courseRoute");
const lessonRoutes = require("./routes/lessonRoute");
const studentRoutes = require("./routes/studentRoute");
const adminRoutes = require('./routes/adminRoute');
const wishlistRoute = require('./routes/wishlistRoute');
const progressRoute = require('./routes/progressRoute');
 const paymentRoute = require('./routes/paymentRoute');
const historyRoutes = require('./routes/historyRoute');
const path = require("path");
const PORT = process.env.PORT || 5000;

connectDB();

const app = express();
app.use(cookieParser());
app.use(cors({
    origin : 'http://localhost:5173',
    credentials: true, // Allow cookies to be sent with requests
}));
app.use(express.json({ limit: '10mb' })); // or higher if needed
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/analytics', require('./routes/analyticsRoute'));
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoute);
app.use('/api/progress', progressRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/history', historyRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
