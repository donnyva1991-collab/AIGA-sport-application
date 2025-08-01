const express = require('express');
const router = express.Router();
const accessTokenPolicy = require('#policies/accessToken.policy');
const LessonController = require('#controllers/api/LessonController')();

router.use(accessTokenPolicy);
router.get('/month/:coachId/:year/:month', LessonController.getMonthlySchedule);

module.exports = router;
