const Lesson = require('../models/Lesson');
const cloudinary = require('../utils/cloudinary');

exports.addLesson = async (req, res) => {
  try {
    const { title, description, order, courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    console.log("=== BACKEND DEBUG ===");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    let materials = [];

    // Process materials from the array
    if (Array.isArray(req.body.materials)) {
      console.log("Processing materials as array");
      
      req.body.materials.forEach((mat, index) => {
        console.log(`Material ${index}:`, mat);
        
        if (mat && mat.type) {
          if (mat.type === 'link') {
            // Handle link materials
            if (mat.url) {
              materials.push({ 
                type: mat.type, 
                name: mat.name || 'Unnamed', 
                url: mat.url 
              });
              console.log(`✅ Added link material: ${mat.url}`);
            }
          } else {
            // Handle file materials (video, document, image)
            // With upload.any(), files don't have specific field names
            // So we need to match files to materials by index
            if (req.files && req.files[index]) {
              const file = req.files[index];
              materials.push({
                type: mat.type,
                name: mat.name || file.originalname,
                url: file.path, // Cloudinary URL
              });
              console.log(`✅ Added file material: ${file.originalname}`);
            } else {
              console.log(`❌ No file found for material ${index}`);
              // If no file but has URL, treat it as existing file
              if (mat.url) {
                materials.push({
                  type: mat.type,
                  name: mat.name || 'Unnamed',
                  url: mat.url,
                });
                console.log(`✅ Added existing file material: ${mat.url}`);
              }
            }
          }
        }
      });
    }

    console.log("Final materials to save:", materials);

    const lesson = await Lesson.create({
      courseId,
      title,
      description,
      order,
      materials,
    });

    console.log("✅ Lesson saved with materials:", lesson.materials);

    res.status(201).json({ 
      success: true, 
      message: 'Lesson added', 
      lesson 
    });

  } catch (error) {
    console.error("Add Lesson Error:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating lesson', 
      error: error.message 
    });
  }
};
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
    
    // Ensure materials is always an array
    const lessonWithMaterials = {
      ...lesson._doc,
      materials: lesson.materials || [] // Force array if undefined
    };
    
    console.log("Sending lesson:", lessonWithMaterials);
    
    res.status(200).json({ success: true, lesson: lessonWithMaterials });
  } catch (error) {
    console.error("Get Lesson Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    console.log("=== UPDATE LESSON DEBUG ===");
    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files ? req.files.map(f => f.fieldname) : 'No files');
    console.log("Lesson ID:", req.params.lessonId);

    const { title, description, order } = req.body;
    const lessonId = req.params.lessonId;

    // Find the existing lesson first
    const existingLesson = await Lesson.findById(lessonId);
    if (!existingLesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    console.log("Existing lesson materials:", existingLesson.materials);

    let materials = [];
    
    // Process materials from form data
    const materialCount = Object.keys(req.body).filter(key => 
      key.startsWith('materials[') && key.includes('][type]')
    ).length;

    console.log("Material count from request:", materialCount);

    for (let i = 0; i < materialCount; i++) {
      const type = req.body[`materials[${i}][type]`];
      const name = req.body[`materials[${i}][name]`] || 'Unnamed';

      console.log(`Processing material ${i}:`, { type, name });

      if (type === 'link') {
        const url = req.body[`materials[${i}][url]`];
        console.log(`Link URL: ${url}`);
        if (url) {
          materials.push({ type, name, url });
        }
      } else {
        const fieldName = `materials[${i}][file]`;
        console.log(`Looking for file: ${fieldName}`);
        
        const file = req.files?.find(f => f.fieldname === fieldName);

        if (file) {
          console.log(`File found: ${file.originalname}`);
          materials.push({
            type,
            name,
            url: file.path, // Cloudinary URL
          });
        } else {
          console.log(`No file found for: ${fieldName}`);
          // Keep existing material if no new file
          const existingMaterial = existingLesson.materials[i];
          if (existingMaterial && existingMaterial.url) {
            console.log(`Keeping existing material: ${existingMaterial.name}`);
            materials.push(existingMaterial);
          }
        }
      }
    }

    console.log("Final materials to save:", materials);

    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId,
      { 
        title: title || existingLesson.title,
        description: description || existingLesson.description,
        order: order || existingLesson.order,
        materials: materials.length > 0 ? materials : existingLesson.materials
      },
      { new: true }
    );

    console.log("Updated lesson:", updatedLesson);

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

