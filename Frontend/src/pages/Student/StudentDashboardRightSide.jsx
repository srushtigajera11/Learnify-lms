import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import SpeedIcon from "@mui/icons-material/Speed";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// Dummy data
const skillProgressData = [
  { name: "React", progress: 80, fill: "#6366f1" },
  { name: "Redux", progress: 50, fill: "#60a5fa" },
  { name: "JS", progress: 90, fill: "#34d399" },
  { name: "Node", progress: 65, fill: "#facc15" },
];

const StudentDashboardRightSidebar = () => {
  return (
    <Stack spacing={3}>
      {/* Skill Progress (Circular + Bar Chart) */}
      <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            My Skill Progress
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              flexWrap: "wrap",
            }}
          >
            {/* Circular XP */}
            <Box sx={{ width: 100, height: 100 }}>
              <CircularProgressbar
                value={72}
                text="72%"
                styles={buildStyles({
                  textColor: "#111",
                  pathColor: "#6366f1",
                  trailColor: "#e5e7eb",
                })}
              />
              <Typography align="center" variant="body2" mt={1}>
                Level 8
              </Typography>
            </Box>

            {/* Skill Bar Chart */}
            <Box sx={{ flex: 1, height: 200 }}>
              <ResponsiveContainer>
                <BarChart
                  data={skillProgressData}
                  layout="vertical"
                  barCategoryGap="15%"
                >
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={60}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar
                    dataKey="progress"
                    radius={[0, 10, 10, 0]}
                    barSize={20}
                  >
                    {skillProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Achievements / Badges */}
      <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Achievements
          </Typography>
          <Stack  sx={{ flexWrap: "wrap", gap: 1 }} direction="row" spacing={1} justifyContent="center" mt={1}>
            <Chip
              icon={<EmojiEventsIcon />}
              label="Gold Badge"
              color="warning"
              variant="outlined"
            />
            <Chip
              icon={<EmojiEventsIcon />}
              label="Silver Badge"
              color="default"
              variant="outlined"
            />
            <Chip
              icon={<EmojiEventsIcon />}
              label="Diamond Badge"
              color="info"
              variant="outlined"
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Links
          </Typography>
          <Stack spacing={1} mt={1}>
            <Chip
              icon={<FavoriteIcon sx={{ color: "#ef4444" }} />}
              label="My Wishlist"
              variant="outlined"
              clickable
              component="a"
              href="/student/wishlist"
            />
            <Chip
              icon={<HistoryIcon sx={{ color: "#34d399" }} />}
              label="Purchase History"
              variant="outlined"
              clickable
              component="a"
              href="/student/purchaseHistory"
            />
            <Chip
              icon={<SettingsIcon sx={{ color: "#f59e0b" }} />}
              label="Settings"
              variant="outlined"
              clickable
              component="a"
              href="/student/settings"
            />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default StudentDashboardRightSidebar;
