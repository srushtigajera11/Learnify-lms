const Lesson = require("../models/Lesson");
const Course = require("../models/courseModel");
const cloudinary = require("../utils/cloudinary");
const LessonProgress = require("../models/LessonProgress");

/* =========================================
   CREATE LESSON
========================================= */
exports.createLesson = async (req, res) => {
  try {
   const { title, description, order, courseId, duration } = req.body;


    if (!title  || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Title, order and courseId are required",
      });
    }

    const materialCount = parseInt(req.body.materialCount) || 0;
    const materials = [];

    for (let i = 0; i < materialCount; i++) {
      const type = req.body[`materials[${i}][type]`];
      const name = req.body[`materials[${i}][name]`] || "Material";
      const url = req.body[`materials[${i}][url]`];
      const file = req.files?.find(
        (f) => f.fieldname === `materials[${i}][file]`
      );

      /* ---------- LINK ---------- */
      if (type === "link" && url) {
        materials.push({
          type: "link",
          name,
          url,
        });
      }

      /* ---------- FILE ---------- */
      if (file) {
        let materialType = "document";
        if (file.mimetype.startsWith("video")) {
          materialType = "video";
        }

        materials.push({
          type: materialType,
          name,
          url: file.secure_url || file.path,
          public_id: file.filename || file.public_id,
          duration: file.duration || 0,
          size: file.size,
          format: file.mimetype,
        });
      }
    }
let finalOrder;

// If user sends order → insert at that position
if (order) {
  finalOrder = parseInt(order);

  // Shift all lessons >= this order
  await Lesson.updateMany(
    { courseId, order: { $gte: finalOrder } },
    { $inc: { order: 1 } }
  );

} else {
  // Auto append to last
  const lastLesson = await Lesson.findOne({ courseId })
    .sort({ order: -1 });

  finalOrder = lastLesson ? lastLesson.order + 1 : 1;
}

    /* ---------- CREATE LESSON ---------- */
    const lesson = await Lesson.create({
      title,
      description,
      order: finalOrder,
      courseId,
      materials,
      duration: duration || 0,
      lessonType:
        materials.find((m) => m.type === "video") ? "video" : "text",
    });

    /* ---------- CALCULATE TOTAL DURATION ---------- */
    lesson.totalDuration = lesson.materials
      .filter((m) => m.type === "video")
      .reduce((sum, m) => sum + (m.duration || 0), 0);

    await lesson.save();

    /* ---------- UPDATE COURSE DURATION ---------- */
    await updateCourseDuration(courseId);

    res.status(201).json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error("Create Lesson Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================================
   GET LESSON WITH SIGNED URL
========================================= */
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }
    const progress = await LessonProgress.findOne({
  studentId: req.user.id,
  lessonId: lesson._id,
});
    const updatedMaterials = lesson.materials.map((m) => {
      if (m.type === "video" && m.public_id) {
        const signedUrl = cloudinary.url(m.public_id, {
          resource_type: "video",
          type: "authenticated",
          sign_url: true,
          expires_at: Math.floor(Date.now() / 1000) + 300,
        });

        return { ...m._doc, url: signedUrl };
      }

      return m;
    });

   res.status(200).json({
  success: true,
  lesson: {
    ...lesson._doc,
    materials: updatedMaterials,
  },
  resumeFrom: progress?.lastWatchedTime || 0,
  progress: progress?.progress || 0,
});
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================================
   UPDATE LESSON
========================================= */
exports.updateLesson = async (req, res) => {
  try {
    const lessonId = req.params.lessonId;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    const materialCount = parseInt(req.body.materialCount) || 0;
    const materials = [];

    for (let i = 0; i < materialCount; i++) {
      const type = req.body[`materials[${i}][type]`];
      const name = req.body[`materials[${i}][name]`] || "Material";
      const url = req.body[`materials[${i}][url]`];
      const file = req.files?.find(
        (f) => f.fieldname === `materials[${i}][file]`
      );

      if (type === "link" && url) {
        materials.push({ type: "link", name, url });
      }

      if (file) {
        let materialType = "document";
        if (file.mimetype.startsWith("video")) {
          materialType = "video";
        }

        materials.push({
          type: materialType,
          name,
          url: file.secure_url || file.path,
          public_id: file.filename || file.public_id,
          duration: file.duration || 0,
          size: file.size,
          format: file.mimetype,
        });
      }
    }
    const newOrder = parseInt(req.body.order);
const oldOrder = lesson.order;
if (newOrder && newOrder !== oldOrder) {

  if (newOrder > oldOrder) {
    // Moving down
    await Lesson.updateMany(
      {
        courseId: lesson.courseId,
        order: { $gt: oldOrder, $lte: newOrder },
      },
      { $inc: { order: -1 } }
    );
  } else {
    // Moving up
    await Lesson.updateMany(
      {
        courseId: lesson.courseId,
        order: { $gte: newOrder, $lt: oldOrder },
      },
      { $inc: { order: 1 } }
    );
  }

  lesson.order = newOrder;
}


    lesson.title = req.body.title;
    lesson.description = req.body.description;
    lesson.duration = req.body.duration || lesson.duration;
    lesson.materials = materials;

    lesson.totalDuration = materials
      .filter((m) => m.type === "video")
      .reduce((sum, m) => sum + (m.duration || 0), 0);

    await lesson.save();
    await updateCourseDuration(lesson.courseId);

    res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error("Update Lesson Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================================
   DELETE LESSON
========================================= */
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Delete Cloudinary videos
    for (const material of lesson.materials) {
      if (material.public_id) {
        await cloudinary.uploader.destroy(material.public_id, {
          resource_type: material.type === "video" ? "video" : "raw",
        });
      }
    }

    await lesson.deleteOne();
    await updateCourseDuration(lesson.courseId);

    res.status(200).json({
      success: true,
      message: "Lesson deleted",
    });
  } catch (error) {
    console.error("Delete Lesson Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
/* =========================================
   GET LESSONS BY COURSE
========================================= */
exports.getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await Lesson.find({
      courseId: req.params.courseId,
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      lessons,
    });
  } catch (error) {
    console.error("Get Lessons By Course Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { progress, lastWatchedTime } = req.body;
    const studentId = req.user.id;
    const lessonId = req.params.lessonId;

    let record = await LessonProgress.findOne({
      studentId,
      lessonId,
    });

    if (!record) {
      record = await LessonProgress.create({
        studentId,
        lessonId,
        progress,
        lastWatchedTime,
        isCompleted: progress >= 90,
      });
    } else {
      record.progress = progress;
      record.lastWatchedTime = lastWatchedTime;
      if (progress >= 90) record.isCompleted = true;
      await record.save();
    }

    res.status(200).json({
      success: true,
      progress: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
    });
  }
};
exports.reorderLessons = async (req, res) => {
  try {
    const updates = req.body; // array of { lessonId, order }

    const bulkOps = updates.map((item) => ({
      updateOne: {
        filter: { _id: item.lessonId },
        update: { order: item.order },
      },
    }));

    await Lesson.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: "Lessons reordered",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Reorder failed",
    });
  }
};

/* =========================================
   HELPER: UPDATE COURSE TOTAL DURATION
========================================= */
async function updateCourseDuration(courseId) {
  const lessons = await Lesson.find({ courseId });

  const total = lessons.reduce(
    (sum, l) => sum + (l.totalDuration || 0),
    0
  );

  await Course.findByIdAndUpdate(courseId, {
    totalDuration: total,
  });
}

