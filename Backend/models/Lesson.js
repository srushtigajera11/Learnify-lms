const mongoose = require('mongoose');
const materialSchema = new mongoose.Schema({
    name : {type : String , required : true},
    url : {type : String , required : true},
    type : {type : String , required : true, enum : ['video', 'document', "link"], default : 'document'}
});

const lessonSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String },
  materials: [materialSchema], // Array of materials
  order : { type: Number, required: true }, // Order of the lesson in the course
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);