/**
 * backfill-quiz-progress.js
 *
 * One-time script to populate StudentProgress.completedQuizzes
 * from existing QuizResult documents.
 *
 * Safe to run multiple times — uses bestScore logic, never downgrades data.
 *
 * Usage:
 *   node scripts/backfill-quiz-progress.js
 */

require('dotenv').config();
const mongoose        = require('mongoose');
const QuizResult      = require('./models/QuizResult');
const Quiz            = require('./models/Quiz');
const Lesson          = require('./models/Lesson');
const StudentProgress = require('./models/StudentProgress');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected to MongoDB\n');

  // 1. Load all quiz results grouped by student + course
  const allResults = await QuizResult.find({}).lean();
  console.log(`📦  Found ${allResults.length} QuizResult documents to process\n`);

  if (allResults.length === 0) {
    console.log('Nothing to migrate.');
    await mongoose.disconnect();
    return;
  }

  // 2. Group by studentId + courseId
  const grouped = {};
  for (const qr of allResults) {
    const key = `${qr.studentId}__${qr.courseId}`;
    if (!grouped[key]) {
      grouped[key] = { studentId: qr.studentId, courseId: qr.courseId, results: [] };
    }
    grouped[key].results.push(qr);
  }

  const pairs     = Object.values(grouped);
  let   updated   = 0;
  let   created   = 0;
  let   skipped   = 0;

  // 3. For each student-course pair, upsert StudentProgress
  for (const { studentId, courseId, results } of pairs) {
    // Skip if courseId is missing (orphaned records)
    if (!courseId) { skipped++; continue; }

    let sp = await StudentProgress.findOne({ studentId, courseId });
    if (!sp) {
      sp = new StudentProgress({ studentId, courseId });
      created++;
    } else {
      updated++;
    }

    // Merge each quiz result into completedQuizzes
    for (const qr of results) {
      const existing = sp.completedQuizzes.find(
        cq => cq.quizId.toString() === qr.quizId.toString()
      );

      if (existing) {
        // Keep best score, mark passed if any attempt passed
        existing.bestScore = Math.max(existing.bestScore, qr.score);
        existing.passed    = existing.passed || qr.passed;
        existing.attempts  = Math.max(existing.attempts, qr.attemptNumber);
        if (qr.passed && (!existing.completedAt || qr.completedAt < existing.completedAt)) {
          existing.completedAt = qr.completedAt;
        }
      } else {
        sp.completedQuizzes.push({
          quizId:      qr.quizId,
          completedAt: qr.completedAt || new Date(),
          bestScore:   qr.score,
          passed:      qr.passed,
          attempts:    qr.attemptNumber
        });
      }

      // Add XP from this result if it was a first-pass
      if (qr.xpEarned > 0 && qr.attemptNumber === 1) {
        sp.totalXP = (sp.totalXP || 0) + qr.xpEarned;
      }
    }

    // Recalculate overall completion percentage
    const [lessonDocs, quizDocs] = await Promise.all([
      Lesson.find({ courseId, status: 'published' }).select('_id').lean(),
      Quiz.find({ courseId, isPublished: true }).select('_id').lean()
    ]);

    sp.recalculate(
      lessonDocs.map(l => l._id),
      quizDocs.map(q => q._id)
    );

    await sp.save();
    process.stdout.write('.');
  }

  console.log(`\n\n🎉  Backfill complete!`);
  console.log(`    StudentProgress updated : ${updated}`);
  console.log(`    StudentProgress created : ${created}`);
  console.log(`    Skipped (no courseId)   : ${skipped}`);
  console.log(`    Total pairs processed   : ${pairs.length}`);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('\n❌  Backfill failed:', err);
  process.exit(1);
});