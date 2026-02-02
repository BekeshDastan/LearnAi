const express = require('express');
const router = express.Router();
const controller = require('../controllers/course.controller.impl');
const { asyncHandler } = require('../middleware/auth.middleware');

router.post('/', asyncHandler(controller.createCourse));

router.post('/init', asyncHandler(controller.initCourse));

router.get('/', asyncHandler(controller.listCourses));

router.get('/:id', asyncHandler(controller.getCourseById));

router.put('/:id', asyncHandler(controller.updateCourse));

router.delete('/:id', asyncHandler(controller.deleteCourse));

router.get('/chapters/:chapterId', asyncHandler(controller.getChapterById));

router.post('/chapters/:chapterId/complete', asyncHandler(controller.markChapterComplete));





module.exports = router;
