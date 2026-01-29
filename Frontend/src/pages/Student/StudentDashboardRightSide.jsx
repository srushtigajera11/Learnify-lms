import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";

// Dummy data
const skillProgressData = [
  { name: "React", progress: 80, fill: "#6366f1" },
  { name: "Redux", progress: 50, fill: "#60a5fa" },
  { name: "JS", progress: 90, fill: "#34d399" },
  { name: "Node", progress: 65, fill: "#facc15" },
];

const StudentDashboardRightSidebar = () => {
  return (
    <div className="space-y-6" suppressHydrationWarning>
      {/* Skill Progress (Circular + Bar Chart) */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          My Skill Progress
        </h3>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Circular XP */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24">
              <CircularProgressbar
                value={72}
                text="72%"
                styles={buildStyles({
                  textColor: "#111827",
                  pathColor: "#6366f1",
                  trailColor: "#e5e7eb",
                  textSize: "24px",
                })}
              />
            </div>
            <div className="text-center text-sm text-gray-600 mt-2">Level 8</div>
          </div>

          {/* Skill Bar Chart */}
          <div className="flex-1 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={skillProgressData}
                layout="vertical"
                barCategoryGap="15%"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  formatter={(value) => [`${value}%`, "Progress"]}
                />
                <Bar
                  dataKey="progress"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                >
                  {skillProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Achievements / Badges */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Achievements
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          <div className="inline-flex items-center gap-1 px-3 py-1.5 border border-yellow-300 rounded-full bg-yellow-50 text-yellow-800 text-sm font-medium">
            <EmojiEventsIcon className="h-4 w-4" />
            Gold Badge
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-full bg-gray-50 text-gray-800 text-sm font-medium">
            <EmojiEventsIcon className="h-4 w-4" />
            Silver Badge
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1.5 border border-blue-300 rounded-full bg-blue-50 text-blue-800 text-sm font-medium">
            <EmojiEventsIcon className="h-4 w-4" />
            Diamond Badge
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Quick Links
        </h3>
        <div className="space-y-2">
          <a
            href="/student/wishlist"
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors duration-200 group"
          >
            <FavoriteIcon className="h-5 w-5 text-red-500" />
            <span className="text-gray-700 group-hover:text-red-700">
              My Wishlist
            </span>
          </a>
          <a
            href="/student/purchaseHistory"
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors duration-200 group"
          >
            <HistoryIcon className="h-5 w-5 text-green-500" />
            <span className="text-gray-700 group-hover:text-green-700">
              Purchase History
            </span>
          </a>
          <a
            href="/student/settings"
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-yellow-50 hover:border-yellow-200 transition-colors duration-200 group"
          >
            <SettingsIcon className="h-5 w-5 text-yellow-500" />
            <span className="text-gray-700 group-hover:text-yellow-700">
              Settings
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardRightSidebar;