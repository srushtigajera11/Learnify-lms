/**
 * migrate-progress.js
 *
 * One-time migration script.
 * Reads existing Enrollment.completedLessons and UserProgress data,
 * then writes everything into the new StudentProgress collection.
 *
 * Usage:
 *   node migrate-progress.js
 *
 * Safe to run multiple times — upserts, never overwrites bestScore downward.
 */
require('dotenv').config();
const mongoose        = require('mongoose');
const Enrollment      = require('./models/Enrollment');
const UserProgress    = require('./models/UserProgress');   // old model
const QuizResult      = require('./models/QuizResult');
const Lesson          = require('./models/Lesson');
const Quiz            = require('./models/Quiz');
const StudentProgress = require('./models/StudentProgress');

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected to MongoDB');

  // ── 1. Seed from Enrollment.completedLessons ──────────────────────────
  const enrollments = await Enrollment.find({
    completedLessons: { $exists: true, $not: { $size: 0 } }
  }).lean();

  console.log(`\n📦  Migrating ${enrollments.length} enrollment records …`);

  for (const enr of enrollments) {
    const studentId = enr.studentId;
    const courseId  = enr.courseId;

    let sp = await StudentProgress.findOne({ studentId, courseId });
    if (!sp) sp = new StudentProgress({ studentId, courseId });

    for (const lessonId of (enr.completedLessons || [])) {
      const alreadyIn = sp.completedLessons.some(
        l => l.lessonId.toString() === lessonId.toString()
      );
      if (!alreadyIn) {
        sp.completedLessons.push({ lessonId, completedAt: new Date() });
      }
    }

    await sp.save();
    process.stdout.write('.');
  }
  console.log('\n✅  Enrollment migration done');

  // ── 2. Seed from UserProgress ─────────────────────────────────────────
  let oldProgressDocs;
  try {
    oldProgressDocs = await UserProgress.find({}).lean();
  } catch (_) {
    oldProgressDocs = [];
  }
  console.log(`\n📦  Migrating ${oldProgressDocs.length} UserProgress records …`);

  for (const up of oldProgressDocs) {
    const studentId = up.userId;
    const courseId  = up.courseId;

    let sp = await StudentProgress.findOne({ studentId, courseId });
    if (!sp) sp = new StudentProgress({ studentId, courseId });

    // Completed lessons
    for (const cl of (up.completedLessons || [])) {
      const id = cl.lessonId || cl;
      const alreadyIn = sp.completedLessons.some(
        l => l.lessonId.toString() === id.toString()
      );
      if (!alreadyIn) {
        sp.completedLessons.push({ lessonId: id, completedAt: cl.completedAt || new Date() });
      }
    }

    // Certificate
    if (up.certificateId && !sp.certificateIssued) {
      sp.certificateIssued   = true;
      sp.certificateIssuedAt = up.completedAt || new Date();
      sp.certificateId       = up.certificateId;
    }

    // Course completed flag
    if (up.isCompleted && !sp.isCourseCompleted) {
      sp.isCourseCompleted  = true;
      sp.courseCompletedAt  = up.completedAt || new Date();
    }

    await sp.save();
    process.stdout.write('.');
  }
  console.log('\n✅  UserProgress migration done');

  // ── 3. Seed quiz results from QuizResult collection ───────────────────
  const quizResults = await QuizResult.find({}).lean();
  console.log(`\n📦  Migrating ${quizResults.length} quiz results …`);

  for (const qr of quizResults) {
    const { studentId, courseId, quizId, score, passed, attemptNumber } = qr;
    if (!courseId) continue;  // skip malformed records

    let sp = await StudentProgress.findOne({ studentId, courseId });
    if (!sp) sp = new StudentProgress({ studentId, courseId });

    const existing = sp.completedQuizzes.find(
      q => q.quizId.toString() === quizId.toString()
    );

    if (existing) {
      existing.bestScore   = Math.max(existing.bestScore, score);
      existing.passed      = existing.passed || passed;
      existing.attempts    = Math.max(existing.attempts, attemptNumber);
    } else {
      sp.completedQuizzes.push({
        quizId,
        completedAt: qr.completedAt || new Date(),
        bestScore:   score,
        passed,
        attempts:    attemptNumber
      });
    }

    await sp.save();
    process.stdout.write('.');
  }
  console.log('\n✅  QuizResult migration done');

  // ── 4. Recalculate completionPercentage for every StudentProgress ─────
  console.log('\n🔄  Recalculating completion percentages …');
  const allSP = await StudentProgress.find({});

  for (const sp of allSP) {
    const [lessonDocs, quizDocs] = await Promise.all([
      Lesson.find({ courseId: sp.courseId, status: 'published' }).select('_id').lean(),
      Quiz.find  ({ courseId: sp.courseId, isPublished: true   }).select('_id').lean()
    ]);
    sp.recalculate(
      lessonDocs.map(l => l._id),
      quizDocs.map(q => q._id)
    );
    await sp.save();
    process.stdout.write('.');
  }

  console.log('\n\n🎉  Migration complete!');
  console.log(`    StudentProgress documents: ${allSP.length}`);
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});