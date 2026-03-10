/**
 * gamificationController.js
 *
 * Handles all gamification stats for the student dashboard sidebar.
 * Aggregates data from Gamification + StudentProgress models.
 *
 * Route: GET /api/students/:studentId/gamification
 */

const mongoose     = require('mongoose');
const Gamification = require('../models/Gamification');
const StudentProgress = require('../models/StudentProgress');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Maps badge tier label based on badgeType + xpReward.
 * Extend this logic to match your own badge rules.
 */
function resolveBadgeTier(badge) {
  if (badge.badgeType === 'special')              return 'diamond';
  if (badge.xpReward >= 50)                       return 'gold';
  if (badge.xpReward >= 20)                       return 'silver';
  return 'bronze';
}

/**
 * Assigns a deterministic fill colour to each skill name
 * so bar colours are consistent across page loads.
 */
const SKILL_COLOURS = [
  '#6366f1', // indigo
  '#60a5fa', // blue
  '#34d399', // emerald
  '#facc15', // yellow
  '#f472b6', // pink
  '#fb923c', // orange
  '#a78bfa', // violet
  '#2dd4bf', // teal
];

function colourForIndex(i) {
  return SKILL_COLOURS[i % SKILL_COLOURS.length];
}

// ─── Controller ───────────────────────────────────────────────────────────────

/**
 * GET /api/students/:studentId/gamification
 *
 * Aggregates XP, level, streak, skill progress bars, and badges
 * across ALL courses the student is enrolled in.
 *
 * Response shape (matches frontend contract):
 * {
 *   xp: { level, currentXP, nextLevelXP, progressPercent },
 *   streak: { current, longest },
 *   skills: [{ name, progress, fill }],
 *   badges: [{ label, tier }]
 * }
 */
exports.getStudentGamificationStats = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.id !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }

    // ✅ Fetch from StudentProgress (source of truth for XP)
    const progressDocs = await StudentProgress.find({ studentId })
      .populate('courseId', 'title')
      .lean();

    // ✅ Still fetch Gamification for streak + badges
    const gamificationDocs = await Gamification.find({ studentId }).lean();

    // ── 1. XP & LEVEL from StudentProgress.totalXP ──
    const totalXp = progressDocs.reduce((sum, p) => sum + (p.totalXP || 0), 0);

    const baseXP = 100;
    const highestLevel       = Math.floor(Math.sqrt(totalXp / baseXP)) + 1;
    const nextLvlXP          = Math.pow(highestLevel, 2) * baseXP;
    const currentLvlXP       = Math.pow(highestLevel - 1, 2) * baseXP;
    const progressToNextLevel = (nextLvlXP - currentLvlXP) > 0
      ? Math.round(((totalXp - currentLvlXP) / (nextLvlXP - currentLvlXP)) * 100)
      : 0;

    // ── 2. STREAK from Gamification ──
    const currentStreak = gamificationDocs.reduce(
      (max, g) => Math.max(max, g.currentStreak || 0), 0
    );
    const longestStreak = gamificationDocs.reduce(
      (max, g) => Math.max(max, g.longestStreak || 0), 0
    );

    // ── 3. SKILLS from StudentProgress ──
    const skills = progressDocs
      .filter(p => p.courseId)
      .map((p, i) => ({
        name:     p.courseId.title?.slice(0, 14) || `Course ${i + 1}`,
        progress: p.completionPercentage || 0,
        fill:     colourForIndex(i),
      }));

    // ── 4. BADGES from Gamification ──
    const seenBadges = new Set();
    const badges = gamificationDocs
      .flatMap(g => g.badges || [])
      .sort((a, b) => new Date(b.earnedDate) - new Date(a.earnedDate))
      .filter(badge => {
        if (seenBadges.has(badge.badgeName)) return false;
        seenBadges.add(badge.badgeName);
        return true;
      })
      .map(badge => ({
        label: badge.badgeName,
        tier:  resolveBadgeTier(badge),
        icon:  badge.badgeIcon || null,
        earnedDate: badge.earnedDate,
      }));

    return res.status(200).json({
      success: true,
      data: {
        xp: {
          level:           highestLevel,
          currentXP:       totalXp,
          nextLevelXP:     nextLvlXP,
          progressPercent: Math.min(progressToNextLevel, 100),
        },
        streak: { current: currentStreak, longest: longestStreak },
        skills,
        badges,
      },
    });

  } catch (err) {
    console.error('getStudentGamificationStats error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};