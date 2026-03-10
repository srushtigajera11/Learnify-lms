import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import axiosInstance from "../../utils/axiosInstance"; // ← adjust path if needed

// ─── API ──────────────────────────────────────────────────────────────────────
const fetchGamificationStats = async (studentId) => {
  
  const res = await axiosInstance.get(`/students/${studentId}/gamification`);
  return res.data.data;
};

// ─── Badge config ─────────────────────────────────────────────────────────────
const BADGE_CONFIG = {
  gold:    { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E", dot: "#F59E0B", glow: "rgba(245,158,11,0.25)" },
  silver:  { bg: "#F1F5F9", border: "#94A3B8", text: "#334155", dot: "#94A3B8", glow: "rgba(148,163,184,0.2)" },
  diamond: { bg: "#EFF6FF", border: "#3B82F6", text: "#1E40AF", dot: "#3B82F6", glow: "rgba(59,130,246,0.25)" },
  bronze:  { bg: "#FFF7ED", border: "#FB923C", text: "#7C2D12", dot: "#FB923C", glow: "rgba(251,146,60,0.2)"  },
};

const SKILL_COLOURS = ["#6366F1","#06B6D4","#10B981","#F59E0B","#EC4899","#8B5CF6"];

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Shimmer = ({ w = "100%", h = 14, r = 8 }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s ease infinite",
  }} />
);

// ─── Custom tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1E1B4B", color: "#fff", borderRadius: 10,
      padding: "8px 14px", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
      boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
    }}>
      <div style={{ fontWeight: 600 }}>{label}</div>
      <div style={{ color: "#A5B4FC" }}>{payload[0].value}% complete</div>
    </div>
  );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 18,
      padding: "22px 22px 20px",
      border: "1px solid #F1F0F5",
      boxShadow: "0 2px 12px rgba(99,102,241,0.06), 0 1px 3px rgba(0,0,0,0.04)",
      transition: "box-shadow 0.2s ease",
      ...style,
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.12), 0 2px 6px rgba(0,0,0,0.06)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(99,102,241,0.06), 0 1px 3px rgba(0,0,0,0.04)"}
  >
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{
    fontFamily: "'DM Serif Display', serif",
    fontSize: 17,
    color: "#1A1523",
    marginBottom: 18,
    letterSpacing: "-0.01em",
  }}>
    {children}
  </div>
);

// ─── XP + Skills ──────────────────────────────────────────────────────────────
const SkillProgressSection = ({ xp, skills }) => {
  const animXP = useCountUp(xp.currentXP);

  return (
    <Card>
      <SectionTitle>Skill Progress</SectionTitle>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

        {/* Circular XP */}
        <div style={{ flexShrink: 0, textAlign: "center" }}>
          <div style={{ width: 88, height: 88, position: "relative" }}>
            <CircularProgressbar
              value={xp.progressPercent}
              styles={buildStyles({
                pathColor: "#6366F1",
                trailColor: "#EEF2FF",
                pathTransitionDuration: 1.2,
              })}
            />
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: "#1A1523", lineHeight: 1 }}>
                {xp.level}
              </span>
              <span style={{ fontSize: 9, color: "#9CA3AF", fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
                lvl
              </span>
            </div>
          </div>
          <div style={{ marginTop: 10, fontFamily: "'DM Sans',sans-serif" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#6366F1" }}>
              {animXP.toLocaleString()} XP
            </div>
            <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>
              of {xp.nextLevelXP.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Skill bars */}
        {skills?.length > 0 ? (
          <div style={{ flex: 1, height: Math.max(skills.length * 36 + 20, 100) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skills} layout="vertical" barCategoryGap="20%"
                margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis
                  type="category" dataKey="name" width={72} axisLine={false} tickLine={false}
                  tick={{ fontSize: 11, fill: "#6B7280", fontFamily: "'DM Sans',sans-serif" }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.04)" }} />
                <Bar dataKey="progress" radius={[0, 6, 6, 0]} barSize={14}>
                  {skills.map((entry, i) => (
                    <Cell key={i} fill={entry.fill || SKILL_COLOURS[i % SKILL_COLOURS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontSize: 12, color: "#D1D5DB", fontFamily: "'DM Sans',sans-serif" }}>
              No courses enrolled yet
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

// ─── Streak ───────────────────────────────────────────────────────────────────
const StreakSection = ({ streak }) => {
  const animCurrent = useCountUp(streak.current, 700);
  const animLongest = useCountUp(streak.longest, 900);
  const isHot = streak.current >= 3;

  return (
    <Card>
      <SectionTitle>Daily Streak</SectionTitle>
      <div style={{ display: "flex", gap: 12 }}>

        {/* Current */}
        <div style={{
          flex: 1, borderRadius: 14, padding: "16px 14px",
          background: isHot ? "linear-gradient(135deg,#FFF7ED,#FEF3C7)" : "#F9FAFB",
          border: `1px solid ${isHot ? "#FDE68A" : "#F1F0F5"}`,
          textAlign: "center",
          transition: "all 0.3s ease",
        }}>
          <div style={{ fontSize: 26, lineHeight: 1, marginBottom: 4 }}>
            {isHot ? "🔥" : "❄️"}
          </div>
          <div style={{
            fontFamily: "'DM Serif Display',serif",
            fontSize: 32, color: isHot ? "#D97706" : "#6B7280", lineHeight: 1,
          }}>
            {animCurrent}
          </div>
          <div style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: 10,
            color: isHot ? "#92400E" : "#9CA3AF",
            textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 6,
          }}>
            day streak
          </div>
        </div>

        {/* Best */}
        <div style={{
          flex: 1, borderRadius: 14, padding: "16px 14px",
          background: "#F5F3FF", border: "1px solid #EDE9FE",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 26, lineHeight: 1, marginBottom: 4 }}>🏅</div>
          <div style={{
            fontFamily: "'DM Serif Display',serif",
            fontSize: 32, color: "#7C3AED", lineHeight: 1,
          }}>
            {animLongest}
          </div>
          <div style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: 10,
            color: "#6D28D9", textTransform: "uppercase",
            letterSpacing: "0.06em", marginTop: 6,
          }}>
            best ever
          </div>
        </div>
      </div>

      {streak.current > 0 && (
        <div style={{
          marginTop: 14, padding: "10px 14px",
          background: "#FFFBEB", borderRadius: 10,
          border: "1px solid #FDE68A",
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 12, color: "#92400E",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span>✨</span>
          <span>Come back tomorrow to keep your streak alive!</span>
        </div>
      )}
    </Card>
  );
};

// ─── Badges ───────────────────────────────────────────────────────────────────
const AchievementsSection = ({ badges }) => (
  <Card>
    <SectionTitle>Achievements</SectionTitle>
    {!badges?.length ? (
      <div style={{
        textAlign: "center", padding: "16px 0",
        fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#D1D5DB",
      }}>
        <div style={{ fontSize: 30, marginBottom: 8 }}>🎯</div>
        Complete lessons to earn your first badge
      </div>
    ) : (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {badges.map((badge, i) => {
          const cfg = BADGE_CONFIG[badge.tier] ?? BADGE_CONFIG.bronze;
          return (
            <div
              key={i}
              title={badge.earnedDate ? `Earned ${new Date(badge.earnedDate).toLocaleDateString()}` : ""}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 13px",
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderRadius: 30,
                boxShadow: `0 0 0 3px ${cfg.glow}`,
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 12, fontWeight: 500, color: cfg.text,
                cursor: "default",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px) scale(1.04)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}
            >
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: cfg.dot, flexShrink: 0,
              }} />
              {badge.label}
            </div>
          );
        })}
      </div>
    )}
  </Card>
);

// ─── Quick Links ──────────────────────────────────────────────────────────────
const LINKS = [
  { href: "/student/wishlist",        icon: "♡", label: "Wishlist",         accent: "#F43F5E" },
  { href: "/student/purchaseHistory", icon: "◷", label: "Purchase History", accent: "#10B981" },
  { href: "/student/settings",        icon: "⚙", label: "Settings",         accent: "#F59E0B" },
];

const QuickLinks = () => (
  <Card>
    <SectionTitle>Quick Links</SectionTitle>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {LINKS.map(({ href, icon, label, accent }) => (
        <a
          key={href}
          href={href}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "11px 14px", borderRadius: 12,
            border: "1px solid #F1F0F5",
            textDecoration: "none",
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 13, fontWeight: 500, color: "#374151",
            transition: "all 0.18s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = accent;
            e.currentTarget.style.background = `${accent}12`;
            e.currentTarget.style.color = accent;
            e.currentTarget.querySelector(".ql-icon").style.background = `${accent}22`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "#F1F0F5";
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#374151";
            e.currentTarget.querySelector(".ql-icon").style.background = "#F5F5F7";
          }}
        >
          <span className="ql-icon" style={{
            width: 32, height: 32, borderRadius: 9,
            background: "#F5F5F7",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, transition: "background 0.18s ease", flexShrink: 0,
          }}>
            {icon}
          </span>
          {label}
        </a>
      ))}
    </div>
  </Card>
);

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const SidebarSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    {[120, 110, 100, 88].map((h, i) => (
      <div key={i} style={{
        background: "#fff", borderRadius: 18, padding: 22,
        border: "1px solid #F1F0F5",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        <Shimmer w="45%" h={14} r={8} />
        <Shimmer w="100%" h={h} r={12} />
      </div>
    ))}
  </div>
);

// ─── Error ────────────────────────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
  <Card>
    <div style={{ textAlign: "center", padding: "12px 0", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
      <p style={{ fontSize: 13, color: "#EF4444", fontWeight: 500, marginBottom: 4 }}>
        Failed to load stats
      </p>
      <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 14 }}>{message}</p>
      <button
        onClick={onRetry}
        style={{
          padding: "8px 20px", borderRadius: 20,
          border: "1px solid #6366F1", background: "#EEF2FF",
          color: "#6366F1", fontSize: 12, fontWeight: 600,
          cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#6366F1"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#EEF2FF"; e.currentTarget.style.color = "#6366F1"; }}
      >
        Retry
      </button>
    </div>
  </Card>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const StudentDashboardRightSidebar = ({ studentId }) => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tick,    setTick]    = useState(0);

  // Core fetch effect — reruns on studentId change or manual retry (tick)
  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchGamificationStats(studentId)
      .then(data => { if (!cancelled) setStats(data); })
      .catch(err  => { if (!cancelled) setError(err.message); })
      .finally(()  => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [studentId, tick]);

  // Listen for XP updates fired by CoursePlayer after lesson/quiz completion
  useEffect(() => {
    const handleXpUpdate = () => setTick(t => t + 1);
    window.addEventListener("xp:updated", handleXpUpdate);
    return () => window.removeEventListener("xp:updated", handleXpUpdate);
  }, []);

  return (
    <>
     

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {loading && <SidebarSkeleton />}

        {!loading && error && (
          <ErrorState message={error} onRetry={() => setTick(t => t + 1)} />
        )}

        {!loading && stats && (
          <>
            <SkillProgressSection xp={stats.xp}        skills={stats.skills} />
            <StreakSection         streak={stats.streak}                       />
            <AchievementsSection  badges={stats.badges}    />
            <QuickLinks />
          </>
        )}
      </div>
    </>
  );
};

export default StudentDashboardRightSidebar;