'use server';
/**
 * @fileOverview Provides AI-powered mock interviews.
 *
 * - conductMockInterview - A function that simulates a mock interview.
 * - MockInterviewInput - The input type for the conductMockInterview function.
 * - MockInterviewOutput - The return type for the conductMockInterview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const MockInterviewInputSchema = z.object({
  interviewType: z
    .string()
    .describe(
      'The type of mock interview (e.g., "Behavioral", "Technical - JavaScript", "General Job Interview").'
    ),
  userMessage: z
    .string()
    .describe("The user's latest message or answer in the interview conversation."),
  chatHistory: z
    .array(ChatMessageSchema)
    .optional()
    .describe('The history of the conversation so far, to provide context to the AI.'),
  questionCount: z.number().optional().default(0).describe('The number of questions already asked by the AI.'),
});
export type MockInterviewInput = z.infer<typeof MockInterviewInputSchema>;

const MockInterviewOutputSchema = z.object({
  aiResponse: z
    .string()
    .describe("The AI's response, which could be the next interview question, feedback, or a concluding remark."),
  isInterviewOver: z
    .boolean()
    .default(false)
    .describe('Indicates if the mock interview has concluded.'),
  answerFeedback: z
    .string()
    .optional()
    .describe("Brief, qualitative feedback on the user's last answer. Not a score."),
  overallFeedback: z
    .string()
    .optional()
    .describe(
      'A summary of the user\'s overall performance, highlighting strengths and areas for improvement, if the interview is over.'
    ),
  interviewScore: z
    .number()
    .optional()
    .describe('An overall score (0-10) for the interview performance, if the interview is over.'),
  currentQuestionCount: z.number().optional().describe('The updated count of questions asked by the AI so far.'),
});
export type MockInterviewOutput = z.infer<typeof MockInterviewOutputSchema>;

export async function conductMockInterview(
  input: MockInterviewInput
): Promise<MockInterviewOutput> {
  return mockInterviewFlow(input);
}

const TOTAL_INTERVIEW_QUESTIONS = 4; // Define the number of questions for the mock interview

const mockInterviewPrompt = ai.definePrompt({
  name: 'mockInterviewPrompt',
  input: {schema: MockInterviewInputSchema},
  output: {schema: MockInterviewOutputSchema},
  prompt: `You are an expert AI Interviewer conducting a mock interview for the role/type: '{{interviewType}}'.
Your goal is to ask insightful questions, provide constructive feedback, and simulate a realistic interview experience.
The interview will consist of approximately ${TOTAL_INTERVIEW_QUESTIONS} questions. Keep track of the current question number using '{{questionCount}}'.

Your role:
1.  If this is the start of the conversation (e.g., userMessage is "Start Interview" or similar, or questionCount is 0), begin with a brief opening statement and ask the first question relevant to '{{interviewType}}'. Increment questionCount.
2.  When the user provides an answer:
    *   Provide brief, qualitative feedback on their answer in the 'answerFeedback' field. This should be constructive but not overly critical during the interview. Avoid giving scores per question.
    *   Ask the next relevant question for '{{interviewType}}'. Increment questionCount.
    *   The next question and any immediate follow-up remarks go into 'aiResponse'.
3.  If the user asks for clarification or seems unsure, you can rephrase or provide a small hint, but try to elicit their own thoughts first.
4.  Maintain a professional, encouraging, and neutral tone.
5.  After the user answers the ${TOTAL_INTERVIEW_QUESTIONS}th (final) question, or if the user explicitly states they want to end the interview:
    *   Provide feedback on this final answer in 'answerFeedback'.
    *   Set 'isInterviewOver' to true.
    *   Provide an 'overallFeedback' summary of the user's performance, highlighting strengths and areas for improvement based on all their answers.
    *   Assign an 'interviewScore' from 0 to 10 (0 for very poor, 10 for excellent).
    *   The 'aiResponse' should be a concluding remark for the interview (e.g., "Thank you for your time. That concludes our mock interview.").
6.  Ensure 'currentQuestionCount' in the output reflects the new total of questions you've asked.

Previous conversation:
{{#if chatHistory}}
{{#each chatHistory}}
{{this.role}}: {{{this.content}}}
{{/each}}
{{else}}
(No previous conversation history)
{{/if}}

User's latest message: {{{userMessage}}}
Current question count by AI: {{questionCount}}

Formulate your response according to the MockInterviewOutputSchema.
If the interview is not yet over, 'isInterviewOver' must be false.
If 'isInterviewOver' is true, 'overallFeedback' and 'interviewScore' must be populated.
Do not ask more than ${TOTAL_INTERVIEW_QUESTIONS} questions unless the user is very brief and you need one more to assess.
Focus on questions appropriate for '{{interviewType}}'. If 'Technical - JavaScript', ask about JavaScript concepts, problem-solving, etc. If 'Behavioral', ask situational questions (STAR method).
`,
});

const mockInterviewFlow = ai.defineFlow(
  {
    name: 'mockInterviewFlow',
    inputSchema: MockInterviewInputSchema,
    outputSchema: MockInterviewOutputSchema,
  },
  async (input: MockInterviewInput) => {
    // Increment question count if we are about to ask a new question.
    // The AI's prompt will handle the logic of whether it's asking or concluding.
    // We just need to provide the current state accurately.
    // The AI output 'currentQuestionCount' will be the true new count.
    const result = await mockInterviewPrompt(input);
    
    if (result.output && typeof result.output.isInterviewOver === 'undefined') {
      result.output.isInterviewOver = false;
    }
    if (result.output && result.output.currentQuestionCount === undefined) {
        result.output.currentQuestionCount = input.questionCount; // Default to old if not updated
    }
    return result.output!;
  }
);
