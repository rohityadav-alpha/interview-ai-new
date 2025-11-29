import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GOOGLE_GEMINI_API_KEY is missing!");
}

const genAI = new GoogleGenerativeAI(apiKey || "dummy");

export async function generateInterviewQuestions(
  skill: string,
  difficulty: string = "medium",
  count: number = 10
) {
  if (!apiKey) {
    console.error("❌ Gemini API key not configured");
    return generateFallbackQuestions(skill, count);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192, // ✅ Increased
      },
    });

    const prompt = `Generate ${count} unique ${difficulty} level interview questions for ${skill}.

IMPORTANT: Return ONLY a valid JSON array, no markdown, no explanations:
[{"question": "Question 1?"}, {"question": "Question 2?"}]`;

    console.log("🤖 Generating questions with Gemini...");

    const result = await model.generateContent(prompt);

    if (!result || !result.response) {
      console.error("❌ No response from Gemini API");
      return generateFallbackQuestions(skill, count);
    }

    const response = result.response;
    let text = response.text();

    if (!text || text.trim() === "") {
      console.error("❌ Empty response from Gemini");
      return generateFallbackQuestions(skill, count);
    }

    console.log("📝 Raw response:", text); // ✅ No limit

    // Clean response
    text = text.trim();
    text = text.replace(/```json/gi, "");
    text = text.split("`").join("");

    // Extract JSON array
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      text = jsonMatch[0];
    } else {
      console.error("❌ No JSON array found in response");
      return generateFallbackQuestions(skill, count);
    }

    let questions;
    try {
      questions = JSON.parse(text);
    } catch (parseError: any) {
      console.error("❌ JSON parse error:", parseError.message);
      console.error("Text was:", text); // ✅ No limit
      return generateFallbackQuestions(skill, count);
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      console.error("❌ Invalid questions format");
      return generateFallbackQuestions(skill, count);
    }

    console.log(`✅ Generated ${questions.length} unique questions`);
    return questions.slice(0, count);
  } catch (error: any) {
    console.error("❌ Question generation error:", error.message);
    console.error("Error details:", {
      name: error.constructor.name,
      message: error.message,
      stack: error.stack, // ✅ No limit
    });
    return generateFallbackQuestions(skill, count);
  }
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  skill: string
) {
  // Safety checks
  if (!apiKey) {
    console.error("⚠️ No API key - using fallback");
    return generateFallbackEvaluation();
  }

  if (!question || !answer || !skill) {
    console.error("⚠️ Missing parameters");
    return generateFallbackEvaluation();
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 8192, // ✅ Increased
      },
    });

    const prompt = `Evaluate this ${skill} interview answer.

Question: ${question}
Candidate's Answer: ${answer}

CRITICAL: Return ONLY valid JSON in this exact format (no extra text):
{"score": 7, "feedback": "detailed feedback here", "strengths": ["strength 1", "strength 2", "strength 3"], "improvements": ["improvement 1", "improvement 2", "improvement 3"], "confidenceTips": ["tip 1", "tip 2", "tip 3"]}

Rules:
- score: number 1-10
- feedback: detailed string (no limit)
- strengths: array of 3 strings
- improvements: array of 3 strings
- confidenceTips: array of 3 strings

NO markdown, NO code blocks, NO extra text. Just the JSON object.`;

    console.log("🤖 Evaluating answer with Gemini...");

    const result = await model.generateContent(prompt);

    // Check if result exists
    if (!result) {
      console.error("❌ No result from Gemini API");
      return generateFallbackEvaluation();
    }

    // Check if response exists
    const response = result.response;
    if (!response) {
      console.error("❌ No response object from Gemini");
      return generateFallbackEvaluation();
    }

    // Get text
    let text;
    try {
      text = response.text();
    } catch (textError: any) {
      console.error("❌ Error getting text:", textError.message);
      return generateFallbackEvaluation();
    }

    // Check if text exists and is not empty
    if (!text || typeof text !== "string" || text.trim() === "") {
      console.error("❌ Empty or invalid text response");
      return generateFallbackEvaluation();
    }

    console.log("📝 Raw evaluation:", text); // ✅ No limit

    // Aggressive cleaning
    text = text.trim();
    text = text.replace(/```json/gi, "");

    text = text.replace(/```/g, "");

    // Remove newlines
    text = text.replace(/\n/g, " ");
    text = text.replace(/\r/g, "");

    // Remove extra spaces
    text = text.replace(/\s+/g, " ");

    console.log("🧼 After basic cleaning:", text); // ✅ No limit

    // Extract JSON object
    const startIdx = text.indexOf("{");
    const endIdx = text.lastIndexOf("}");

    if (startIdx === -1 || endIdx === -1) {
      console.error("❌ No JSON object braces found");
      console.error("Full text:", text);
      return generateFallbackEvaluation();
    }

    if (startIdx >= endIdx) {
      console.error("❌ Invalid brace positions:", { startIdx, endIdx });
      return generateFallbackEvaluation();
    }

    const jsonStr = text.substring(startIdx, endIdx + 1);

    if (jsonStr.length < 10) {
      console.error("❌ JSON string too short:", jsonStr);
      return generateFallbackEvaluation();
    }

    console.log("🧹 Extracted JSON:", jsonStr); // ✅ No limit

    // Parse JSON
    let evaluation;
    try {
      evaluation = JSON.parse(jsonStr);
    } catch (parseError: any) {
      console.error("❌ JSON parse failed:", parseError.message);
      console.error("Attempted to parse:", jsonStr); // ✅ No limit
      return generateFallbackEvaluation();
    }

    // Validate structure
    if (!evaluation || typeof evaluation !== "object") {
      console.error("❌ Parsed value is not an object");
      return generateFallbackEvaluation();
    }

    console.log("✅ Successfully parsed evaluation");
    console.log("Score:", evaluation.score);
    console.log("Has strengths:", Array.isArray(evaluation.strengths));
    console.log("Has improvements:", Array.isArray(evaluation.improvements));
    console.log(
      "Has confidenceTips:",
      Array.isArray(evaluation.confidenceTips)
    );

    // Build safe response with fallbacks - NO LIMITS
    return {
      score: Math.min(10, Math.max(1, Number(evaluation.score) || 5)),
      feedback:
        typeof evaluation.feedback === "string"
          ? evaluation.feedback // ✅ No limit
          : "Good attempt at answering the question.",
      strengths:
        Array.isArray(evaluation.strengths) && evaluation.strengths.length > 0
          ? evaluation.strengths
              .slice(0, 3)
              .map((s: any) => String(s || "Good point"))
          : [
              "Answer provided",
              "Engaged with the question",
              "Showed understanding",
            ],
      improvements:
        Array.isArray(evaluation.improvements) &&
        evaluation.improvements.length > 0
          ? evaluation.improvements
              .slice(0, 3)
              .map((i: any) => String(i || "Keep practicing"))
          : [
              "Practice more examples",
              "Review core concepts",
              "Study related topics",
            ],
      confidenceTips:
        Array.isArray(evaluation.confidenceTips) &&
        evaluation.confidenceTips.length > 0
          ? evaluation.confidenceTips
              .slice(0, 3)
              .map((t: any) => String(t || "Stay confident"))
          : [
              "Practice regularly",
              "Stay calm during interviews",
              "Build your knowledge base",
            ],
    };
  } catch (error: any) {
    console.error("❌ Evaluation error - Full details:");
    console.error("Error name:", error.constructor?.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error status:", error.status);
    if (error.stack) {
      console.error("Stack trace:", error.stack); // ✅ No limit
    }
    return generateFallbackEvaluation();
  }
}

function generateFallbackQuestions(skill: string, count: number) {
  console.log("📋 Using fallback questions for", skill);
  return [
    {
      question: `What is ${skill} and why is it important in modern development?`,
    },
    { question: `Explain the core concepts and principles of ${skill}.` },
    { question: `Describe a challenging project where you used ${skill}.` },
    { question: `What are the best practices when working with ${skill}?` },
    {
      question: `How do you approach debugging and troubleshooting in ${skill}?`,
    },
    {
      question: `Compare ${skill} with alternative technologies or approaches.`,
    },
    { question: `What are common pitfalls or mistakes to avoid in ${skill}?` },
    { question: `Explain advanced features or techniques in ${skill}.` },
    { question: `How do you optimize performance when using ${skill}?` },
    {
      question: `What are the latest trends and future directions for ${skill}?`,
    },
  ].slice(0, count);
}

function generateFallbackEvaluation() {
  console.log("📋 Using fallback evaluation");
  return {
    score: 5,
    feedback:
      "Your answer has been recorded. AI evaluation is temporarily unavailable, but your response shows good effort.",
    strengths: [
      "Answer submitted successfully",
      "Attempted to address the question",
      "Engaged with the interview process",
    ],
    improvements: [
      "Practice more technical questions",
      "Review fundamental concepts",
      "Study real-world examples",
    ],
    confidenceTips: [
      "Practice coding problems daily",
      "Stay calm and think through problems",
      "Build confidence through consistent practice",
    ],
  };
}
