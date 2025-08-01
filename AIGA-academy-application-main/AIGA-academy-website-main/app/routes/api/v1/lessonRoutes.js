const express = require('express');
const router = express.Router();
const accessTokenPolicy = require('#policies/accessToken.policy');
const LessonController = require('#controllers/api/LessonController')();

router.use(accessTokenPolicy);
router.post('/create', LessonController.createLesson);
router.post('/book/:lessonId', LessonController.bookLesson);
router.post('/validate/:bookingId', LessonController.validateBooking);
router.get('/coach/:coachId', LessonController.getLessons);

module.exports = router;
