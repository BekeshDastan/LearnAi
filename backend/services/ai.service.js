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
        TASK: Generate a logical learning path for the course "${title}".
        USER REQUIREMENT: "${topicRequest}"

        STRICT RULES:
        1. Output MUST be a valid JSON array of strings.
        2. DO NOT include any markdown formatting (no \`\`\`json).
        3. DO NOT include any text before or after the JSON.
        4. Maximum 5 chapters.
        5. Logical progression is mandatory.

    FORMAT EXAMPLE:
    ["Chapter 1", "Chapter 2"]
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
        ACT as an expert professor for "${courseTitle}".
        TASK: Create a lecture and quiz for: "${chapterTitle}".

        JSON STRUCTURE:
        {
        "content": "Full markdown lecture text (min 300 words)",
        "quiz": [
            {
            "question": "text",
            "options": ["opt0", "opt1", "opt2", "opt3"],
            "correctAnswer": 0
            }
        ]
        }

        STRICT CONSTRAINTS:
        1. Output MUST be a single valid JSON object.
        2. NO conversational filler. NO introductory text.
        3. Use JSON5 compatible formatting but strictly valid JSON is preferred.
        4. Ensure all quotes inside the "content" string are escaped properly (\\" or use single quotes).
        5. The "quiz" array must contain exactly 5 objects.

        START JSON OUTPUT:
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