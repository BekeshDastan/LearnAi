const CourseService = require('../services/course.service');
const Chapter = require('../models/Chapter.model');

async function createCourse(req, res) {
  const { user, title, topicRequest, initialPlan } = req.body;
  if (!user || !title || !topicRequest) {
    return res.status(400).json({ error: 'user, title and topicRequest are required' });
  }
  const course = await CourseService.createCourse({ user, title, topicRequest, initialPlan });
  res.status(201).json(course);
}

async function listCourses(req, res) {
  const { user, userId, limit, skip } = req.query;
  const filter = {};
  if (user) filter.user = user;
  if (userId) filter.user = userId;
  const courses = await CourseService.listCourses(filter, { limit: Number(limit) || 50, skip: Number(skip) || 0 });
  res.json(courses);
}

async function initCourse(req, res) {
  const { userId, title, topicRequest } = req.body;
  if (!userId || !title || !topicRequest) return res.status(400).json({ error: 'userId, title and topicRequest are required' });

  const result = await CourseService.initCourse({ user: userId, title, topicRequest });
  res.status(201).json(result);
}

async function getCourseById(req, res) {
  const course = await CourseService.getCourseById(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
}

async function updateCourse(req, res) {
  const patch = req.body;
  const updated = await CourseService.updateCourse(req.params.id, patch);
  if (!updated) return res.status(404).json({ error: 'Course not found' });
  res.json(updated);
}

async function deleteCourse(req, res) {
  const ok = await CourseService.deleteCourse(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Course not found' });
  res.json({ success: true });
}

async function addChapter(req, res) {
  const { title, content, quiz } = req.body;
  if (!title) return res.status(400).json({ error: 'Chapter title is required' });
  const chapter = await CourseService.addChapter(req.params.id, { title, content, quiz });
  res.status(201).json(chapter);
}

async function getChapterById(req, res) {
    try {
        const chapter = await Chapter.findById(req.params.chapterId);
        if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
        res.json(chapter);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteChapter(req, res) {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.chapterId);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateChapter(req, res) {
  try {
    const patch = req.body;
    const updated = await Chapter.findByIdAndUpdate(req.params.chapterId, patch, { new: true });
    if (!updated) return res.status(404).json({ error: 'Chapter not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function markChapterComplete(req, res) {
    try {
        const chapter = await Chapter.findByIdAndUpdate(
            req.params.chapterId, 
            { isCompleted: true }, 
            { new: true }
        );
        res.json({ success: true, chapter });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createCourse,
    listCourses,
    initCourse,
    getCourseById,
    updateCourse,
    deleteCourse,
    addChapter,
    deleteChapter,
    updateChapter,
    getChapterById,
    markChapterComplete
};
