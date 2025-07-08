const Lesson = require('../models/Lesson');
const cloudinary = require('../utils/cloudinary');

exports.addLesson = async (req, res) => {
  console.log("Add Lesson Request Body:", req.body);

  const { title, description, order, courseId } = req.body;
   if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }
const totalMaterials = parseInt(req.body.materialCount);
const materials = []; // make sure this exists before the loop

for (let i = 0; i < totalMaterials; i++) {
  const type = req.body[`materials[${i}][type]`];
  const name = req.body[`materials[${i}][name]`] || 'Unnamed';

  if (type === 'link') {
    const url = req.body[`materials[${i}][url]`];
    materials.push({ type, name, url });
  } else {
    const fieldName = `materials[${i}][file]`;
    
    // Find the file in req.files
    const file = req.files.find(f => f.fieldname === fieldName);

    if (file) {
      materials.push({
        type,
        name,
        url: file.path, // this is the Cloudinary URL
      });
    } else {
      console.warn(`No file found for: ${fieldName}`);
    }
  }
}
  const lesson = await Lesson.create({
  courseId,
  title,
  description,
  order,
  materials,
});

res.status(201).json({ success: true, message: 'Lesson added', lesson });

}

exports.getLessonsByCourse = async (req, res) => {
    try{
        const lessons = await Lesson.find({courseId: req.params.courseId})
            .sort({ order: 1 }); // Sort by order field
            res.status(200).json({
                success: true,
                lessons
            });

    }catch(error) {
        console.error('Get Lessons Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }   
};

exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }
    res.status(200).json({ success: true, lesson });
  } catch (error) {
    console.error("Get Lesson Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


exports.updateLesson = async (req, res) => {
  try {
    const { title, description, materials, order } = req.body;
    const lessonId = req.params.lessonId;

    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId,
      { title, description, materials, order },
      { new: true } // return updated document
    );

    if (!updatedLesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    res.status(200).json({ success: true, lesson: updatedLesson });
  } catch (error) {
    console.error('Update Lesson Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteLesson = async (req, res) => {
  console.log("Deleting lesson with ID:", req.params.lessonId);
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.lessonId); // <-- FIXED HERE
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json({ message: 'Lesson deleted successfully' });
  } catch (err) {
    console.error('Delete Lesson Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

