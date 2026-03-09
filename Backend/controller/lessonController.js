const Lesson = require("../models/Lesson");
const Course = require("../models/courseModel");
const cloudinary = require("../utils/cloudinary");


/* =========================================
   CREATE LESSON
========================================= */
exports.createLesson = async (req, res) => {
  try {
    const { title, description = "", duration = 0 } = req.body;
    const courseId = req.params.courseId;

    if (!title || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Title and courseId are required",
      });
    }

    // Parse materials JSON
    let materialsInput = [];
    if (req.body.materials) {
      materialsInput = JSON.parse(req.body.materials);
    }

    const materials = [];

    for (let i = 0; i < materialsInput.length; i++) {
      const material = materialsInput[i];
      const file = req.files?.[i]; // files come in order

      /* =========================
         FILE MATERIAL
      ========================= */
      if (file) {
        const materialType = file.mimetype.startsWith("video")
          ? "video"
          : "document";

        materials.push({
          type: materialType,
          name: material.name || file.originalname,
          url: file.path,
          public_id: file.filename,
          description: material.description || "",
          duration: file.duration || 0,
          size: file.size,
          format: file.mimetype,
          isPreview: material.isPreview === true,
        });

        continue;
      }

      /* =========================
         URL MATERIAL
      ========================= */
      if (material.url && material.url.trim()) {
        let normalizedUrl = material.url.trim();

        if (!/^https?:\/\//i.test(normalizedUrl)) {
          normalizedUrl = `https://${normalizedUrl}`;
        }

        let materialType = material.type || "link";

        if (
          /youtube\.com|youtu\.be|vimeo\.com|\.mp4|\.webm|\.ogg|\.mov|\.m4v/i.test(
            normalizedUrl
          )
        ) {
          materialType = "video";
        }

        materials.push({
          type: materialType,
          name: material.name || "Resource",
          url: normalizedUrl,
          description: material.description || "",
          isPreview: material.isPreview === true,
        });
      }
    }

    if (materials.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one material is required",
      });
    }

    // Order logic
    const lastLesson = await Lesson.findOne({ courseId }).sort({ order: -1 });
    const finalOrder = lastLesson ? lastLesson.order + 1 : 1;

    const lesson = await Lesson.create({
      title,
      description,
      duration,
      order: finalOrder,
      courseId,
      materials,
      lessonType: materials.some((m) => m.type === "video")
        ? "video"
        : "text",
    });

    lesson.totalDuration = materials
      .filter((m) => m.type === "video")
      .reduce((sum, m) => sum + (m.duration || 0), 0);

    await lesson.save();
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
   GET TUTOR LESSON PREVIEW
   - For tutors to preview their lessons
   - Returns lesson with all course lessons for navigation
========================================= */
exports.getTutorLessonPreview = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const tutorId = req.user.id;

    // Get the lesson
    const lesson = await Lesson.findById(lessonId).populate('courseId');
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Verify tutor owns this course
    if (lesson.courseId.createdBy.toString() !== tutorId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to preview this lesson",
      });
    }

    // Get all lessons from this course for sidebar navigation
    const allLessons = await Lesson.find({ courseId: lesson.courseId._id })
      .sort({ order: 1 })
      .select('_id title order duration lessonType isPreview');

    // Format materials with signed URLs for videos if needed
    const formattedMaterials = lesson.materials.map((m) => {
      if (m.type === "video" && m.public_id) {
        const signedUrl = cloudinary.url(m.public_id, {
          resource_type: "video",
          type: "authenticated",
          sign_url: true,
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        });
        return { ...m._doc, url: signedUrl };
      }
      return m;
    });

    res.status(200).json({
      success: true,
      lesson: {
        ...lesson._doc,
        materials: formattedMaterials,
      },
      allLessons,
      course: {
        _id: lesson.courseId._id,
        title: lesson.courseId.title,
      }
    });

  } catch (error) {
    console.error("Get Tutor Lesson Preview Error:", error);
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

    let materialsInput = [];
    if (req.body.materials) {
      materialsInput = JSON.parse(req.body.materials);
    }

    const materials = [];

    for (let i = 0; i < materialsInput.length; i++) {
      const material = materialsInput[i];
      const file = req.files?.[i];

      if (file) {
        const materialType = file.mimetype.startsWith("video")
          ? "video"
          : "document";

        materials.push({
          type: materialType,
          name: material.name || file.originalname,
          url: file.path,
          public_id: file.filename,
          description: material.description || "",
          duration: file.duration || 0,
          size: file.size,
          format: file.mimetype,
          isPreview: material.isPreview === true,
        });
      } else if (material.url) {
        let normalizedUrl = material.url.trim();

        if (!/^https?:\/\//i.test(normalizedUrl)) {
          normalizedUrl = `https://${normalizedUrl}`;
        }

        materials.push({
          type: material.type || "link",
          name: material.name || "Resource",
          url: normalizedUrl,
          description: material.description || "",
          isPreview: material.isPreview === true,
        });
      }
    }

    lesson.title = req.body.title;
    lesson.description = req.body.description;
    lesson.duration = req.body.duration;
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

    const deletedOrder = lesson.order;
    const courseId = lesson.courseId;

    for (const material of lesson.materials) {
      if (material.public_id) {
        await cloudinary.uploader.destroy(material.public_id, {
          resource_type: material.type === "video" ? "video" : "raw",
        });
      }
    }

    await lesson.deleteOne();

    await Lesson.updateMany(
      {
        courseId,
        order: { $gt: deletedOrder },
      },
      {
        $inc: { order: -1 },
      }
    );

    await updateCourseDuration(courseId);

    res.status(200).json({
      success: true,
      message: "Lesson deleted and reordered",
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

/* =========================================
   UPDATE PROGRESS
========================================= */
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

/* =========================================
   REORDER LESSONS
========================================= */
exports.reorderLessons = async (req, res) => {
  try {
    const updates = req.body;

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