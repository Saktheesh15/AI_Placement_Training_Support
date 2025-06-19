
'use server';
/**
 * @fileOverview Provides an AI-powered chatbot for soft skill quizzes with scoring.
 *
 * - getSoftSkillQuizResponse - A function that simulates a quiz interaction for a given soft skill, including scoring.
 * - SoftSkillQuizInput - The input type for the getSoftSkillQuizResponse function.
 * - SoftSkillQuizOutput - The return type for the getSoftSkillQuizResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

// Not exported directly
const SoftSkillQuizInputSchema = z.object({
  softSkillTopic: z
    .string()
    .describe('The specific soft skill topic for the quiz (e.g., "Effective Communication", "Teamwork & Collaboration").'),
  userMessage: z.string().describe("The user's latest message or answer in the quiz conversation."),
  chatHistory: z
    .array(ChatMessageSchema)
    .optional()
    .describe('The history of the conversation so far, to provide context to the AI.'),
});
export type SoftSkillQuizInput = z.infer<typeof SoftSkillQuizInputSchema>;

// Not exported directly
const SoftSkillQuizOutputSchema = z.object({
  aiResponse: z.string().describe("The AI's response, which could be the next quiz question, or a concluding remark if the quiz is over."),
  isQuizOver: z.boolean().default(false).describe('Indicates if the quiz has concluded.'),
  questionFeedback: z.string().optional().describe("Specific feedback on the user's last answer. This should include the score for that answer if applicable (e.g., 'Good point! Score: 8/10')."),
  answerScore: z.number().min(0).max(10).optional().describe("Score for the user's last answer (0-10). Only present if an answer was just evaluated."),
  finalScore: z.number().optional().describe('The total score (e.g., out of 30 for a 3-question quiz) if the quiz is over.'),
  quizSummary: z.string().optional().describe('A summary of performance, including strengths and areas for improvement, if the quiz is over.'),
  totalQuestions: z.number().optional().describe('The total number of questions planned for this quiz session.'),
});
export type SoftSkillQuizOutput = z.infer<typeof SoftSkillQuizOutputSchema>;

const TOTAL_QUIZ_QUESTIONS = 3; // Define the number of questions for the quiz

const softSkillQuizPrompt = ai.definePrompt({
  name: 'softSkillQuizPrompt',
  input: {schema: SoftSkillQuizInputSchema},
  output: {schema: SoftSkillQuizOutputSchema},
  prompt: `You are an AI quiz master for soft skills. The current topic is '{{softSkillTopic}}'.
You will conduct a quiz consisting of exactly ${TOTAL_QUIZ_QUESTIONS} questions. This fact should be part of your initial output in 'totalQuestions'.

Your role is to:
1.  Ask one question at a time.
2.  When the user provides an answer:
    *   Provide brief, constructive feedback on their answer. This feedback is for the 'questionFeedback' field.
    *   Assign a score from 0 to 10 for the answer (0 for very poor, 10 for excellent). This score is for the 'answerScore' field.
    *   In the 'questionFeedback' text, clearly state the score (e.g., "That's an insightful way to look at it. Score: 9/10.").
    *   Then, ask the next question. The next question or concluding remarks go into the 'aiResponse' field.
3.  If this is the start of the conversation (no chat history or user message is a greeting like "hi", "start quiz", "Start the quiz"), begin by asking the first question. This first question goes into 'aiResponse'. No feedback or score is given at this stage. Set 'totalQuestions' to ${TOTAL_QUIZ_QUESTIONS}.
4.  If the user asks for a hint, provide a small hint as part of 'aiResponse'. Do not score a hint request.
5.  If the user's answer is vague, ask for clarification or a more specific example in 'aiResponse'. Do not score a vague answer until clarified.
6.  Maintain a conversational, encouraging, and friendly tone.
7.  After the user answers the ${TOTAL_QUIZ_QUESTIONS}rd (final) question:
    *   Provide feedback and the score for this final answer in 'questionFeedback' and 'answerScore'.
    *   Set 'isQuizOver' to true.
    *   Calculate the 'finalScore' by summing the scores for all ${TOTAL_QUIZ_QUESTIONS} answers (max score: ${TOTAL_QUIZ_QUESTIONS * 10}). This should be based on the actual answers scored.
    *   Provide a 'quizSummary' of the user's overall performance, highlighting strengths and areas for improvement based on their answers.
    *   The 'aiResponse' should be a concluding remark for the quiz.
    *   Ensure 'totalQuestions' is still ${TOTAL_QUIZ_QUESTIONS}.

Interaction Flow:
-   Initial: You provide Q1 in 'aiResponse'. 'totalQuestions' is ${TOTAL_QUIZ_QUESTIONS}.
-   User answers A1: You provide feedback on A1 + score for A1 in 'questionFeedback' & 'answerScore', and Q2 in 'aiResponse'.
-   User answers A2: You provide feedback on A2 + score for A2 in 'questionFeedback' & 'answerScore', and Q3 in 'aiResponse'.
-   User answers A3 (final): You provide feedback on A3 + score for A3 in 'questionFeedback' & 'answerScore'. 'aiResponse' has concluding remarks. 'isQuizOver' is true. 'finalScore' and 'quizSummary' are populated. 'totalQuestions' is ${TOTAL_QUIZ_QUESTIONS}.

Previous conversation (use this to determine current question number and context):
{{#if chatHistory}}
{{#each chatHistory}}
{{this.role}}: {{{this.content}}}
{{/each}}
{{else}}
(No previous conversation history)
{{/if}}

User's latest message: {{{userMessage}}}

Based on the above, formulate your response according to the output schema. Ensure all relevant fields in the output schema are populated.
If the quiz is not yet over, 'isQuizOver' should be false.
Do not ask more than ${TOTAL_QUIZ_QUESTIONS} questions.
Always populate 'totalQuestions' with ${TOTAL_QUIZ_QUESTIONS}.
`,
});

const softSkillQuizFlow = ai.defineFlow(
  {
    name: 'softSkillQuizFlow',
    inputSchema: SoftSkillQuizInputSchema,
    outputSchema: SoftSkillQuizOutputSchema,
  },
  async (input: SoftSkillQuizInput): Promise<SoftSkillQuizOutput> => {
    const {output} = await softSkillQuizPrompt(input);
    if (!output) {
      throw new Error("AI failed to generate a response for the soft skill quiz.");
    }
    // Ensure defaults if AI misses them, though Zod schema defaults should primarily handle this.
    return {
      aiResponse: output.aiResponse,
      isQuizOver: output.isQuizOver ?? false,
      questionFeedback: output.questionFeedback,
      answerScore: output.answerScore,
      finalScore: output.finalScore,
      quizSummary: output.quizSummary,
      totalQuestions: output.totalQuestions ?? TOTAL_QUIZ_QUESTIONS,
    };
  }
);

// This is the exported async function that calls the flow.
export async function getSoftSkillQuizResponse(input: SoftSkillQuizInput): Promise<SoftSkillQuizOutput> {
  return softSkillQuizFlow(input);
}
