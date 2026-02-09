const Course = require('../models/Course.model');
const Chapter = require('../models/Chapter.model');
const aiService = require('./ai.service'); 

async function createCourse({ user, title, topicRequest, initialPlan = [] }) {
    const course = await Course.create({ user, title, topicRequest, initialPlan, status: 'draft' });
    return course;
}

async function getCourseById(id) {
    return Course.findById(id).populate('chapters');
}

async function listCourses(filter = {}, { limit = 50, skip = 0, sort = { createdAt: -1 } } = {}) {
    return Course.find(filter).limit(limit).skip(skip).sort(sort).populate('chapters');
}

async function updateCourse(id, patch) {
    const updated = await Course.findByIdAndUpdate(id, patch, { new: true, runValidators: true }).populate('chapters');
    return updated;
}

async function deleteCourse(id) {
    const course = await Course.findById(id);
    if (!course) return false;
    await course.remove();
    return true;
}

async function addChapter(courseId, { title, content = '', quiz = [] }) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');
    if ((course.chapters || []).length >= 1000) throw new Error('chapter limit exceeded');
    
    const chapter = await Chapter.create({ course: course._id, title, content, quiz });
    course.chapters.push(chapter._id);
    if (course.progress < 0 || course.progress > 100) course.progress = 0;
    await course.save();
    return chapter;
}


async function initCourse({ user, title, topicRequest }) {
    let outline = [];

    try {
        outline = await aiService.generateCoursePlan(title, topicRequest);
    } catch (err) {
        console.warn('[AI] generateCoursePlan failed, fallback plan used', err);
    }

    if (!outline || !outline.length) {
        const tokens = String(topicRequest || 'Topic').split(/[ ,]+/).slice(0, 4).join(' ');
        outline = [
            `Introduction to ${tokens}`,
            `${tokens} — core concepts`,
            `${tokens} — practical examples`,
            `${tokens} — exercises and projects`
        ];
    }

    const course = await Course.create({
        user,
        title,
        topicRequest,
        initialPlan: outline,
        status: 'generating'
    });

    return {
        _id: course._id,
        courseId: course._id,
        initialPlan: outline,
        title: course.title
    };
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


async function generateFullCourseContent(courseId, plan = []) {
   try {
        const course = await Course.findById(courseId);
        if (!course) return { error: 'Course not found' };

        course.status = 'generating';
        await course.save();

        for (const chapterTitle of plan) {
            
            console.log(`Waiting 5s before generating "${chapterTitle}"...`);
            await delay(5000); 
            const aiData = await aiService.generateChapterData(course.title, chapterTitle);

            const ch = await Chapter.create({
                course: course._id,
                title: String(chapterTitle).trim(),
                content: aiData.content || '',
                quiz: aiData.quiz || []
            });

            course.chapters.push(ch._id);
            await course.save();
        }

        course.status = 'active';
        await course.save();

        return { success: true, courseId };
    } catch (err) {
        console.error('[generateFullCourseContent] Error:', err);
        return { error: err.message || 'failed' };
    }
}

module.exports = {
    createCourse,
    initCourse,
    getCourseById,
    listCourses,
    updateCourse,
    deleteCourse,
    addChapter,
    generateFullCourseContent
};
