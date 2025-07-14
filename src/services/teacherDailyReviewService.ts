import axios from 'axios';
import { extractQuestionsFromContent, ReviewQuestion } from './ReviewPersistenceService';

interface ReviewParams {
  subject: string;
  grade: string;
  title: string;
  description: string;
  questionType: string;
  subtopics: {
    id: number;
    title: string;
    topicId: number;
    topicTitle: string;
  }[];
  includeHints: boolean;
  difficultyLevel: string;
  examStyle: string;
  questionCount: number;  // Number of questions to generate
}

const getExamStyleInstruction = (examStyle: string) => {
  switch (examStyle) {
    case 'Standard':
      return 'Create questions that are straightforward and suitable for high school level exams.';
    case 'IEB':
      return 'Create questions that focus on critical thinking and application, as expected in IEB exams.';
    case 'Cambridge':
      return 'Create questions that assess deep understanding, problem-solving, and analytical skills, similar to Cambridge International exams.';
    case 'AP':
      return 'Create questions that are rigorous and college-level, similar to Advanced Placement exams.';
    case 'OCA':
      return 'Create questions that reflect the format and difficulty of the Oracle Certified Associate (OCA) exam, focusing on Java fundamentals and syntax.';
    case 'OCP':
      return 'Create questions that match the Oracle Certified Professional (OCP) exam, emphasizing advanced Java concepts, APIs, and performance optimization.';
    case 'Oracle Master':
      return 'Create highly complex questions that reflect the Oracle Certified Master (OCM) level, focusing on advanced Java architecture, performance tuning, and real-world scenarios.';
    case 'Java SE 8':
      return 'Create questions specific to Java SE 8, including lambdas, streams, and functional interfaces.';
    case 'Java SE 11':
      return 'Create questions specific to Java SE 11, including modules, var keyword, and new APIs.';
    case 'Java SE 17':
      return 'Create questions specific to Java SE 17, including pattern matching, records, and sealed classes.';
    case 'Mock Interview':
      return 'Create questions that simulate real-world technical interview challenges, including algorithmic problem-solving and coding exercises.';
    case 'Coding Challenge':
      return 'Create competitive programming questions that test problem-solving speed and accuracy, similar to coding contests.';
    case 'LeetCode Style':
      return 'Create algorithmic and data structure questions similar to those found on LeetCode, including edge cases and optimal solutions.';
    case 'HackerRank Style':
      return 'Create algorithmic and data structure questions similar to those on HackerRank, with a focus on efficiency and code clarity.';
    case 'Final Exam':
      return 'Create comprehensive, multi-topic questions suitable for final exams, covering a wide range of concepts.';
    case 'Midterm':
      return 'Create midterm-level questions that assess understanding at the halfway point of a course.';
    case 'Placement Test':
      return 'Create questions that assess readiness for job placement or university admission, focusing on practical knowledge and critical thinking.';
    default:
      return 'Create questions with a balanced difficulty level, suitable for general assessments.';
  }
};

const getQuestionFormatInstruction = (questionType: string) => {
  switch (questionType.toLowerCase()) {
    case 'multiple choice questions':
      return `
      Format each question as multiple choice with 4 options, including only one correct answer. Use this structure:

      {
        "question": "What is the correct answer to this concept?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "Correct Option",
        "explanation": "A short explanation of why this answer is correct.",
        "hint": "Optional hint for the question"
      }
      `;
    case 'fill in missing words':
      return `
      Format the questions as fill-in-the-blank sentences, where learners must identify the correct missing words. Use this structure:

      {
        "question": "Java is a ____ language.",
        "correct_answer": "programming",
        "hint": "It's a common term for software development."
      }
      `;
    case 'true or false':
      return `
      Format the questions as true/false statements. Use this structure:

      {
        "question": "Java is a compiled language.",
        "answer": true,
        "explanation": "Java code is compiled to bytecode which runs on the JVM.",
        "hint": "Think about how Java code is executed."
      }
      `;
    case 'match the column':
      return `
      Format the questions as match-the-column exercises, where learners pair related items. Use this structure:

      {
        "pairs": [
          { "left": "Java", "right": "Programming Language" },
          { "left": "JVM", "right": "Java Virtual Machine" },
          { "left": "Polymorphism", "right": "OOP Concept" }
        ],
        "hint": "Match the items based on their relationship."
      }
      `;
    case 'explain':
      return `
      Format the questions as open-ended explain prompts, where learners must provide detailed responses. Use this structure:

      {
        "question": "Explain the difference between overloading and overriding in Java.",
        "hint": "Consider method signatures and runtime behavior."
      }
      `;
    default:
      return '';
  }
};

export async function generateDailyReview(params: ReviewParams): Promise<{ generatedReview: string; questions: ReviewQuestion[] }> {
  try {
    console.log('Generating daily review with params:', {
      subject: params.subject,
      grade: params.grade,
      title: params.title,
      questionType: params.questionType,
      subtopicsCount: params.subtopics.length,
      includeHints: params.includeHints,
      difficultyLevel: params.difficultyLevel,
      examStyle: params.examStyle,
      questionCount: params.questionCount
    });

    // Construct the prompt for ChatGPT
    const subtopicsList = params.subtopics.map(s => `- ${s.title} (from topic: ${s.topicTitle})`).join('\n');
    const questionFormatInstruction = getQuestionFormatInstruction(params.questionType);
    const examStyleInstruction = getExamStyleInstruction(params.examStyle);
    
    const prompt = `
      Create a ${params.difficultyLevel} difficulty daily review for ${params.grade} ${params.subject} with the title "${params.title}".
      
      Description: ${params.description || 'No specific description provided.'}
      
      The review should cover the following subtopics *only*:
      ${subtopicsList}

      ❗Do not include questions about concepts not explicitly listed, such as methods, classes, or inheritance, unless they are part of the listed subtopics.
      
      Question type: ${params.questionType}
      Exam style: ${params.examStyle}
      ${params.includeHints ? 'Please include hints for each question.' : 'Do not include hints.'}
      ✏️ For each question, also include an explanation of why the correct answer is correct.
      Generate exactly ${params.questionCount} questions.

      ${questionFormatInstruction}
      ${examStyleInstruction}
      
      Format the review with:
      1. A brief introduction
      2. Exactly ${params.questionCount} questions with clear numbering
      3. ${params.includeHints ? 'Hints for each question' : ''}
      4. Answer key at the end
      
      Make the questions appropriate for ${params.grade} level students and ensure they cover all the listed subtopics.
    `;

    // Get API key from environment variable
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OpenAI API key is missing. Please check your environment variables.');
      throw new Error('API key is missing');
    }

    console.log('Sending request to ChatGPT API...');
    
    // Make API call to ChatGPT
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator specializing in creating review materials for students.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    // Extract the generated review from the response
    const generatedReview = response.data.choices[0].message.content;
    
    console.log('Review generated successfully!');
    
    // Extract questions from the generated content
    const questions = extractQuestionsFromContent(generatedReview);
    console.log(`Extracted ${questions.length} questions from the generated content`);
    
    return { generatedReview, questions };
  } catch (error) {
    console.error('Error generating daily review:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('API error details:', error.response?.data);
      throw new Error(`Failed to generate review: ${error.response?.data?.error?.message || error.message}`);
    }
    
    throw new Error('Failed to generate review');
  }
}