const aiService = require('../services/ai.service');

const generateSingleChapter = async (req, res) => {
    try {
        const { id } = req.params;
        const { chapterTitle } = req.body; 

        const course = await controller.getCourseById(id);
        if (!course) return res.status(404).json({ error: "Course not found" });

        const aiData = await aiService.generateChapterData(course.title, chapterTitle);

        const newChapter = await controller.addChapter(id, {
            title: chapterTitle,
            content: aiData.content,
            quiz: aiData.quiz
        });

        res.status(201).json(newChapter);
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ error: "Failed to generate chapter" });
    }
};

const generateCoursePlan = async (req, res) => {
    try {
        const { title, topicRequest } = req.body;
        if (!title || !topicRequest) {
            return res.status(400).json({ error: "title and topicRequest are required" });
        }
        const outline = await aiService.generateCoursePlan(title, topicRequest);
        res.json({ outline });
    } catch (error) {
        console.error("AI Plan Generation Error:", error);
        res.status(500).json({ error: "Failed to generate course plan" });
    }   
};

const confirmAndGenerateFullCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { confirmedPlan } = req.body;

        const courseService = require('../services/course.service');
        
        courseService.generateFullCourseContent(id, confirmedPlan);

        res.json({ success: true, message: "Course generation started" });
    } catch (error) {
        console.error("Confirmation Error:", error);
        res.status(500).json({ error: "Failed to confirm course" });
    }
};

module.exports.confirmAndGenerateFullCourse = confirmAndGenerateFullCourse;

module.exports.generateCoursePlan = generateCoursePlan;

module.exports.generateSingleChapter = generateSingleChapter;