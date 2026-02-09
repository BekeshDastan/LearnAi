require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const JSON5 = require('json5');

console.log('GEMINI KEY LOADED:', !!process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
    }
    
});

function cleanAIResponse(text) {
    let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}'); 

    if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    return cleaned;
}

async function retryOperation(operation, maxRetries = 2) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            console.warn(`Attempt ${i + 1} failed. Retrying...`, error.message);
            if (i === maxRetries - 1) throw error;
        }
    }
}

async function generateCoursePlan(title, topicRequest) {
    console.log('GENERATE PLAN:', { title, topicRequest });
    
    const prompt = `
    You are an expert educational content creator.
    Create a structured learning path for a course titled "${title}".
    User Requirement: "${topicRequest}"
    
    Constraint:
    - Return ONLY a JSON array of strings representing chapter titles.
    - Focus on logical progression.
    - Maximum 5 chapters.
    
   Output strictly a JSON array of strings.
    Example: ["Introduction", "Chapter 2", "Conclusion"]
    `;

    try {
        return await retryOperation(async () => {
            const result = await model.generateContent(prompt);
            const text = cleanAIResponse(result.response.text());
            return JSON.parse(text);
            });
    } catch (error) {

        console.error("AI Plan Generation Error:", error);
        return [
            `Introduction to ${title}`,
            `Basics of ${title}`,
            `Advanced topics in ${title}`,
            `Conclusion and Review`
        ];
    }
}

async function generateChapterData(courseTitle, chapterTitle) {
    const prompt = `
    Context: Act as a professor for the course "${courseTitle}".
    Task: Write a detailed lecture and a quiz for the chapter: "${chapterTitle}".
    
    Requirements:
    1. Content: Thoroughly explain the topic (at least 300 words). Use Markdown.
    2. Quiz: Create 5 multiple-choice questions.
    
    Return the response strictly in this JSON format:
    {
      "content": "Lecture text here...",
      "quiz": [
        {
          "question": "Question text?",
          "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
          "correctAnswer": 0
        }
      ]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = cleanAIResponse(result.response.text());

        try {
            return JSON5.parse(text);
        } catch (parseError) {
            console.error("JSON Parse Failed. Bad text:", text);
            throw parseError; 
        }
    } catch (error) {
        console.error("AI Chapter Generation Error:", error);
        return {
            content: `# Error Generating Content\n\nSorry, the AI could not generate this chapter right now. Please try again later.\n\n**Error details:** ${error.message}`,
            quiz: []
        };
    }
}

module.exports = {
    generateCoursePlan,
    generateChapterData
};