const express = require('express');
const router = express.Router(); 
const controller = require('../controllers/ai.controller.js');

const { asyncHandler } = require('../middleware/auth.middleware');

router.post('/:id/chapters/ai', asyncHandler(controller.generateSingleChapter));


router.post('/:id/chapters/ai/batch', asyncHandler(controller.generateCoursePlan));


router.post('/:id/confirm', asyncHandler(controller.confirmAndGenerateFullCourse));

module.exports = router;