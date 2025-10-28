const Quiz = require('../models/Quiz');
const asyncHandler = require('express-async-handler');

exports.createQuiz = asyncHandler(async (req, res) => {
     const { courseId } = req.params;
    const { title, description, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
        res.status(400);
        throw new Error('Title and at least one question are required');
    }

    const quiz = await Quiz.create({
        title,
        description,
        courseId,
        questions,
        createdBy: req.user.id
    });

    res.status(201).json({
        success: true,
        data: quiz
    });
});

// @desc    Get all quizzes for a course
// @route   GET /api/quizzes/:courseId
exports.getQuizzesByCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    
    let filter = { courseId };
    
    // If user is student, only show published quizzes
    if (req.user.role === 'student') {
        filter.isPublished = true;
    } 
    // If user is tutor, only show their own quizzes
    else if (req.user.role === 'tutor') {
        filter.createdBy = req.user.id;
    }
    // Admin can see all quizzes

    const quizzes = await Quiz.find(filter)
        .select('-questions.options.isCorrect') // Hide correct answers for list view
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: quizzes.length,
        data: quizzes
    });
});

// @desc    Get single quiz by ID
// @route   GET /api/quizzes/quiz/:quizId
exports.getQuizById = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.quizId);
    
    if (!quiz) {
        res.status(404);
        throw new Error('Quiz not found');
    }

    // Authorization check
    if (req.user.role === 'tutor' && quiz.createdBy.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to access this quiz');
    }

    // If student, hide correct answers and only show if published
    if (req.user.role === 'student') {
        if (!quiz.isPublished) {
            res.status(403);
            throw new Error('This quiz is not available yet');
        }
        
        // Hide correct answers from students
        const quizObj = quiz.toObject();
        quizObj.questions = quizObj.questions.map(question => {
            const { options, ...questionWithoutCorrect } = question;
            return {
                ...questionWithoutCorrect,
                options: options.map(option => ({ 
                    _id: option._id, 
                    text: option.text 
                }))
            };
        });
        
        return res.json({
            success: true,
            data: quizObj
        });
    }

    res.json({
        success: true,
        data: quiz
    });
});

// @desc    Update a quiz
// @route   PUT /api/quizzes/quiz/:quizId
exports.updateQuiz = asyncHandler(async (req, res) => { // Fixed typo: was 'udateQuiz'
    let quiz = await Quiz.findById(req.params.quizId);
    
    if (!quiz) {
        res.status(404);
        throw new Error('Quiz not found');
    }

    // Check ownership (only tutor who created it can update)
    if (quiz.createdBy.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to update this quiz');
    }

    quiz = await Quiz.findByIdAndUpdate(
        req.params.quizId, 
        req.body, 
        {
            new: true,
            runValidators: true
        }
    );

    res.json({
        success: true,
        message: 'Quiz updated successfully',
        data: quiz
    });
});

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/quiz/:quizId
exports.deleteQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.quizId);
    
    if (!quiz) {
        res.status(404);
        throw new Error('Quiz not found');
    }

    // Check ownership (only tutor who created it can delete)
    if (quiz.createdBy.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to delete this quiz');
    }

    await Quiz.findByIdAndDelete(req.params.quizId);

    res.json({
        success: true,
        message: 'Quiz deleted successfully'
    });
});