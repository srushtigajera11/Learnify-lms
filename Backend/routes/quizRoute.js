const express = require('express'); 
const quizController = require('../controller/quizController');
const { isAuthenticated ,authorizeRoles} = require('../middleware/auth');
const router = express.Router();

router.post(
  '/:courseId/add-quiz',
  isAuthenticated,
  authorizeRoles('tutor'),
  quizController.createQuiz
);

router.put(
    '/quiz/:quizId',
    isAuthenticated,
    authorizeRoles('tutor'),
    quizController.updateQuiz
);
router.get(
    '/quiz/:quizId',
    isAuthenticated,
    authorizeRoles('tutor','student'),
    quizController.getQuizById
);

router.delete(
    '/quiz/:quizId',
    isAuthenticated,
    authorizeRoles('tutor'),
    quizController.deleteQuiz
);
router.get(
    '/:courseId',
    isAuthenticated,
    authorizeRoles('tutor','student'),
    quizController.getQuizzesByCourse
);
module.exports = router;
