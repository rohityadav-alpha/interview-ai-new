// src/lib/ai.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Configure model with safety settings
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp', // ✅ Latest flash model
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 8192, // ✅ Maximum tokens for long responses
    topP: 0.95,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});

// Types
export interface InterviewQuestion {
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface AnswerEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  confidenceTips: string[];
}

// Generate interview questions
export async function generateQuestions(
  skill: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 5
): Promise<InterviewQuestion[]> {
  try {
    console.log('🎯 Generating questions for:', { skill, difficulty, count });
    console.log('🤖 Generating questions with Gemini...');

    const prompt = `Generate ${count} technical interview questions for ${skill} at ${difficulty} difficulty level.

Return ONLY a JSON array in this EXACT format (no markdown, no extra text, no explanations):
[
  {
    "question": "Question text here?",
    "difficulty": "${difficulty}",
    "topic": "Specific topic name"
  }
]

Requirements:
- Questions should be clear, specific, and practical
- Appropriate for ${difficulty} level
- Focus on real-world knowledge and scenarios
- Each question should test understanding, not just memorization
- No markdown formatting, code blocks, or explanations
- Return ONLY the JSON array, nothing else`;

    const result = await model.generateContent(prompt);
    const response = result.response;

    // Check if response was blocked
    if (!response || response.promptFeedback?.blockReason) {
      console.error('❌ Response blocked:', response?.promptFeedback);
      throw new Error(`Response blocked: ${response?.promptFeedback?.blockReason}`);
    }

    // Get full text - NO CHARACTER LIMIT
    let text = response.text();
    
    if (!text || text.trim().length === 0) {
      console.error('❌ Empty response from Gemini');
      throw new Error('Empty response from Gemini');
    }

    console.log('📝 Full response length:', text.length);
    console.log('📝 Full response:', text); // ✅ Complete response logged

    // Clean the response
    text = text.trim();
    text = text.replace(/``````\n?/g, '');
    text = text.replace(/^\s*[\r\n]/gm, '');
    text = text.trim();

    // Try to extract JSON array
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      text = jsonMatch[0];
      console.log('✅ Extracted JSON array');
    } else {
      console.error('❌ No JSON array found');
      throw new Error('No valid JSON array in response');
    }

    // Parse and validate
    const questions = JSON.parse(text);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format');
    }

    // Validate question structure
    const validQuestions = questions.filter(q => 
      q && typeof q.question === 'string' && q.question.length > 0
    );

    console.log('✅ Generated questions:', validQuestions.length);

    return validQuestions.map((q) => ({
      question: q.question, // ✅ Full question, no truncation
      difficulty: difficulty,
      topic: q.topic || skill,
    }));

  } catch (error) {
    console.error('❌ Question generation error:', error);
    console.log('📋 Using fallback questions for', skill);
    return generateFallbackQuestions(skill, count);
  }
}

// Evaluate answer
export async function evaluateAnswer(
  question: string,
  userAnswer: string,
  skill: string
): Promise<AnswerEvaluation> {
  try {
    console.log('🎯 Evaluating answer');
    console.log('Question:', question); // ✅ Full question
    console.log('Answer length:', userAnswer.length);
    console.log('🤖 Evaluating answer with Gemini...');

    const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

Question: "${question}"
Candidate's Answer: "${userAnswer}"
Skill Domain: ${skill}

Evaluate the answer and provide detailed feedback in this EXACT JSON format (no markdown, no extra text):
{
  "score": <number from 0 to 10>,
  "feedback": "<detailed constructive feedback, 3-5 sentences explaining the score and what was good/missing>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"],
  "confidenceTips": ["<practical tip 1>", "<practical tip 2>", "<practical tip 3>"]
}

Scoring Guidelines:
- 0-2: No understanding or completely irrelevant answer
- 3-4: Poor understanding with major conceptual gaps
- 5-6: Basic understanding but lacks depth and detail
- 7-8: Good understanding with minor gaps or missing details
- 9-10: Excellent, comprehensive, and accurate answer

Requirements:
- Be constructive, specific, and encouraging
- Provide detailed, actionable feedback
- Each array must have exactly 3 items
- Focus on technical accuracy and completeness
- Return ONLY valid JSON, nothing else`;

    const result = await model.generateContent(prompt);
    const response = result.response;

    // Check if response was blocked
    if (!response || response.promptFeedback?.blockReason) {
      console.error('❌ Response blocked:', response?.promptFeedback);
      throw new Error(`Response blocked: ${response?.promptFeedback?.blockReason}`);
    }

    // Get full text - NO CHARACTER LIMIT
    let text = response.text();
    
    if (!text || text.trim().length === 0) {
      console.error('❌ Empty response from Gemini');
      throw new Error('Empty response from Gemini');
    }

    console.log('📝 Full evaluation length:', text.length);
    console.log('📝 Full evaluation:', text); // ✅ Complete evaluation logged

    // Clean response
    text = text.trim();
    text = text.replace(/``````\n?/g, '');
    text = text.replace(/^\s*[\r\n]/gm, '');
    text = text.trim();

    // Try to extract JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
      console.log('✅ Extracted JSON object');
    } else {
      console.error('❌ No JSON object found');
      throw new Error('No valid JSON in response');
    }

    // Parse JSON
    const evaluation = JSON.parse(text);

    // Validate structure
    if (
      typeof evaluation.score !== 'number' ||
      evaluation.score < 0 ||
      evaluation.score > 10 ||
      !evaluation.feedback ||
      !Array.isArray(evaluation.strengths) ||
      !Array.isArray(evaluation.improvements) ||
      !Array.isArray(evaluation.confidenceTips)
    ) {
      console.error('❌ Invalid evaluation structure:', evaluation);
      throw new Error('Invalid evaluation structure');
    }

    console.log('✅ Evaluation successful');

    return {
      score: Math.round(evaluation.score),
      feedback: evaluation.feedback, // ✅ Full feedback, no truncation
      strengths: evaluation.strengths, // ✅ All strengths
      improvements: evaluation.improvements, // ✅ All improvements
      confidenceTips: evaluation.confidenceTips, // ✅ All tips
    };

  } catch (error) {
    console.error('❌ Evaluation error:', error);
    console.log('📋 Using fallback evaluation');

    // Better fallback based on answer
    const answerLength = userAnswer.trim().length;
    const hasContent = answerLength > 20;
    const hasDetail = answerLength > 100;
    
    let score = 2;
    let feedback = 'Unable to evaluate your answer at this time. Please provide a detailed response with specific technical concepts, examples, and clear explanations.';
    
    if (hasDetail) {
      score = 6;
      feedback = 'Your answer demonstrates understanding of the topic. To improve, include more specific technical details, real-world examples, and explain trade-offs or alternatives when applicable.';
    } else if (hasContent) {
      score = 4;
      feedback = 'Your answer touches on the topic but needs significant expansion. Include technical terminology, explain core concepts thoroughly, and provide practical examples to demonstrate deeper understanding.';
    }

    return {
      score,
      feedback,
      strengths: hasContent 
        ? ['Attempted to answer the question', 'Showed basic awareness of the topic', 'Provided a response']
        : ['Acknowledged the question'],
      improvements: [
        'Include comprehensive technical details and proper terminology',
        'Provide specific real-world examples and use cases',
        'Explain reasoning, trade-offs, and alternative approaches',
      ],
      confidenceTips: [
        'Structure answers clearly: introduce concept, explain details, provide example',
        'Practice explaining technical concepts out loud before interviews',
        'Use the STAR method for behavioral questions: Situation, Task, Action, Result',
      ],
    };
  }
}

// Fallback questions - REDUCED TO 5 PER SKILL
function generateFallbackQuestions(skill: string, count: number): InterviewQuestion[] {
  const fallbackQuestions: Record<string, InterviewQuestion[]> = {
    'System Design': [
      {
        question: 'Design a URL shortening service like Bitly. Discuss the database schema, API endpoints, how you handle collisions, and strategies for scaling to handle millions of requests per day.',
        difficulty: 'hard',
        topic: 'System Design',
      },
      {
        question: 'How would you design a distributed cache system? Explain cache eviction policies (LRU, LFU), consistency strategies (write-through, write-back), and handling cache invalidation across multiple nodes.',
        difficulty: 'hard',
        topic: 'Caching',
      },
      {
        question: 'Design a real-time chat application supporting millions of concurrent users. How would you handle message delivery, user presence, read receipts, media uploads, and ensure scalability?',
        difficulty: 'hard',
        topic: 'Real-time Systems',
      },
      {
        question: 'Explain how you would design a rate limiting system for a public API. Discuss different algorithms (token bucket, leaky bucket, sliding window), their trade-offs, and implementation approaches.',
        difficulty: 'hard',
        topic: 'API Design',
      },
      {
        question: 'Design a monitoring and alerting system for microservices. What metrics would you collect, how would you aggregate them, what alerting strategies would you use, and how would you prevent alert fatigue?',
        difficulty: 'hard',
        topic: 'Observability',
      },
    ],
    'JavaScript': [
      {
        question: 'Explain the JavaScript event loop in detail. How do the call stack, callback queue, and microtask queue work together? How does setTimeout, Promises, and async/await execution differ?',
        difficulty: 'medium',
        topic: 'Async Programming',
      },
      {
        question: 'What are closures in JavaScript and how do they work? Provide practical examples including module patterns, data privacy, and callback functions. What are potential memory leak concerns?',
        difficulty: 'medium',
        topic: 'Functions',
      },
      {
        question: 'Explain prototypal inheritance in JavaScript. How does the prototype chain work? What is the difference between __proto__ and prototype? How does Object.create() work?',
        difficulty: 'hard',
        topic: 'OOP',
      },
      {
        question: 'What are Promises in JavaScript? Explain Promise states, chaining, error handling, and compare Promise.all(), Promise.race(), Promise.allSettled(), and Promise.any() with examples.',
        difficulty: 'medium',
        topic: 'Async Programming',
      },
      {
        question: 'Explain the "this" keyword in JavaScript. How does its value change in different contexts: global scope, object methods, constructor functions, arrow functions, and classes? How do call, apply, and bind work?',
        difficulty: 'hard',
        topic: 'Functions',
      },
    ],
    'React': [
      {
        question: 'Explain the difference between state and props in React. When would you use each? How does unidirectional data flow work? What happens when state or props change?',
        difficulty: 'easy',
        topic: 'React Basics',
      },
      {
        question: 'What are React hooks and why were they introduced? Explain useState, useEffect, useContext, useReducer, useMemo, and useCallback with practical examples. What are the rules of hooks?',
        difficulty: 'medium',
        topic: 'Hooks',
      },
      {
        question: 'Explain the Virtual DOM and React\'s reconciliation algorithm. How does React determine what needs to be updated? What is the diffing algorithm? How do keys help optimization?',
        difficulty: 'medium',
        topic: 'Performance',
      },
      {
        question: 'How do you optimize performance in React applications? Discuss React.memo, useMemo, useCallback, code splitting, lazy loading, windowing, and profiling techniques.',
        difficulty: 'hard',
        topic: 'Performance',
      },
      {
        question: 'What is server-side rendering (SSR) and static site generation (SSG)? Compare client-side rendering, SSR, and SSG approaches. When would you use each? How does Next.js handle these?',
        difficulty: 'hard',
        topic: 'Rendering',
      },
    ],
    'Node.js': [
      {
        question: 'Explain the Node.js event loop architecture in detail. What are the different phases (timers, I/O callbacks, idle, poll, check, close)? How does Node.js handle asynchronous operations?',
        difficulty: 'hard',
        topic: 'Event Loop',
      },
      {
        question: 'What are streams in Node.js? Explain readable, writable, duplex, and transform streams. Provide examples of when to use each and discuss backpressure handling.',
        difficulty: 'medium',
        topic: 'Streams',
      },
      {
        question: 'How do you handle errors in Node.js applications? Discuss try-catch, error-first callbacks, Promise rejections, async/await error handling, and uncaught exception handling.',
        difficulty: 'medium',
        topic: 'Error Handling',
      },
      {
        question: 'Explain middleware in Express.js. How does the middleware chain work? How do you create custom middleware? What is the difference between application-level and router-level middleware?',
        difficulty: 'easy',
        topic: 'Express.js',
      },
      {
        question: 'How do you scale Node.js applications? Discuss the cluster module, worker threads, load balancing, horizontal vs vertical scaling, and strategies for handling high traffic.',
        difficulty: 'hard',
        topic: 'Scalability',
      },
    ],
    'Python': [
      {
        question: 'Explain decorators in Python. How do they work internally? Provide examples of function decorators, class decorators, and decorators with arguments. What are common use cases?',
        difficulty: 'medium',
        topic: 'Decorators',
      },
      {
        question: 'What is the Global Interpreter Lock (GIL) in Python? How does it affect multi-threading? What are the alternatives for achieving parallelism in Python (multiprocessing, asyncio)?',
        difficulty: 'hard',
        topic: 'Concurrency',
      },
      {
        question: 'Explain generators and iterators in Python. What is the yield keyword? How do generators save memory? Provide examples of when to use generators vs lists.',
        difficulty: 'medium',
        topic: 'Generators',
      },
      {
        question: 'What are the different data structures in Python (list, tuple, set, dictionary, frozenset)? When would you use each? Discuss time complexity of common operations.',
        difficulty: 'easy',
        topic: 'Data Structures',
      },
      {
        question: 'Explain context managers and the "with" statement in Python. How do you create custom context managers using classes and @contextmanager decorator? What are practical use cases?',
        difficulty: 'medium',
        topic: 'Context Managers',
      },
    ],
  };

  // Get questions for skill or use generic ones
  const questions = fallbackQuestions[skill] || [
    {
      question: `Explain the fundamental concepts and best practices in ${skill}. Provide specific examples and discuss common patterns or architectures used in production environments.`,
      difficulty: 'medium',
      topic: skill,
    },
    {
      question: `Describe a complex problem you've encountered while working with ${skill}. What was your approach to solving it? What trade-offs did you consider?`,
      difficulty: 'medium',
      topic: skill,
    },
    {
      question: `What are common pitfalls or mistakes developers make when working with ${skill}? How do you identify and avoid them? Share specific examples.`,
      difficulty: 'medium',
      topic: skill,
    },
    {
      question: `How would you optimize performance when working with ${skill}? Discuss specific techniques, tools, and strategies you would employ in a production system.`,
      difficulty: 'hard',
      topic: skill,
    },
    {
      question: `Explain the testing strategies for ${skill} applications. Discuss unit testing, integration testing, and end-to-end testing approaches with examples of tools and best practices.`,
      difficulty: 'medium',
      topic: skill,
    },
  ];

  return questions.slice(0, count);
}

export { model, genAI };
