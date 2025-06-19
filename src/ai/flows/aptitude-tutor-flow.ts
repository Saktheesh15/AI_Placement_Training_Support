
'use server';
/**
 * @fileOverview Provides an AI-powered tutor for aptitude test preparation.
 *
 * - tutorAptitudeQuestion - A function that handles the aptitude tutoring interaction.
 * - AptitudeTutorInput - The input type for the tutorAptitudeQuestion function.
 * - AptitudeTutorOutput - The return type for the tutorAptitudeQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const AptitudeTutorInputSchema = z.object({
  aptitudeType: z
    .enum(['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'])
    .describe('The main category of aptitude to focus on.'),
  currentTopic: z
    .string()
    .optional()
    .describe('The specific topic within the aptitude type (e.g., "Percentages", "Syllogisms"). AI will pick if not provided.'),
  userMessage: z
    .string()
    .describe("The user's latest message, which could be an answer, a request for a new question, or a greeting."),
  chatHistory: z
    .array(ChatMessageSchema)
    .optional()
    .describe('The history of the conversation so far, to provide context.'),
  questionsAsked: z
    .number()
    .optional()
    .default(0)
    .describe('Number of questions already asked by AI in this session.'),
});
export type AptitudeTutorInput = z.infer<typeof AptitudeTutorInputSchema>;

const AptitudeTutorOutputSchema = z.object({
  aiResponse: z
    .string()
    .describe("The AI's primary response: a new question, a greeting, or a lead-in to feedback."),
  detailedFeedback: z
    .string()
    .optional()
    .describe("Detailed explanation of the user's previous answer, including the correct solution and method if applicable."),
  isQuestion: z
    .boolean()
    .default(true)
    .describe("True if aiResponse primarily contains a new question for the user."),
  isQuizOver: z
    .boolean()
    .default(false)
    .describe('Indicates if the current short quiz cycle (e.g., 3-5 questions) is over.'),
  updatedQuestionsAsked: z
    .number()
    .describe('The updated count of questions asked by AI in this session.'),
  answerScore: z
    .number()
    .min(0).max(10)
    .optional()
    .describe("Score (0-10) for the user's latest answer if applicable. Not provided for hints or session start."),
  averageSessionScore: z
    .number()
    .min(0).max(10)
    .optional()
    .describe("The average score of all questions answered by the user in this quiz session, if the quiz is over.")
});
export type AptitudeTutorOutput = z.infer<typeof AptitudeTutorOutputSchema>;

const MAX_QUESTIONS_PER_SESSION = 3;

const aptitudeTutorPrompt = ai.definePrompt({
  name: 'aptitudeTutorPrompt',
  input: {schema: AptitudeTutorInputSchema},
  output: {schema: AptitudeTutorOutputSchema},
  prompt: `You are an expert AI Aptitude Tutor. The user wants to practice '{{aptitudeType}}'.
{{#if currentTopic}}They are focusing on the topic: '{{currentTopic}}'.{{/if}}
You will conduct a short quiz of up to ${MAX_QUESTIONS_PER_SESSION} questions for this session. '{{questionsAsked}}' is the number of questions you (AI) have asked so far.
Cumulative score and number of answers scored are tracked by the system calling you, not by you.

Your goal:
1.  **Starting**: If '{{userMessage}}' is a greeting (e.g., "Start", "Hi", "Begin", "Let's go") or if '{{questionsAsked}}' is 0:
    *   Greet the user warmly.
    *   Ask the first question relevant to '{{aptitudeType}}'{{#if currentTopic}} and '{{currentTopic}}'{{/if}}. If no specific topic, pick a fundamental one.
    *   Set 'isQuestion' to true.
    *   Set 'updatedQuestionsAsked' to 1.
    *   'aiResponse' should contain the question. No 'answerScore' or 'averageSessionScore' at this stage. 'isQuizOver' is false.
2.  **Answering**: If the user provides an answer to a previous question (and 'userMessage' is not primarily a request for a hint or to change topic):
    *   Evaluate their answer.
    *   Provide 'detailedFeedback': Start with "Correct!", "Partially Correct.", or "Not quite." Then, give a step-by-step explanation of the solution. Be encouraging.
    *   Provide an 'answerScore' from 0 to 10 for the user's answer. 0 for completely incorrect, 10 for perfectly correct.
    *   Let current_questions_asked_by_ai = {{questionsAsked}}. Increment this count for 'updatedQuestionsAsked'.
    *   If 'updatedQuestionsAsked' (new count) < ${MAX_QUESTIONS_PER_SESSION}:
        *   Ask the next question for '{{aptitudeType}}'{{#if currentTopic}} (can be same or related to '{{currentTopic}}'){{/if}} in 'aiResponse'.
        *   Set 'isQuestion' to true. 'isQuizOver' is false.
    *   Else ('updatedQuestionsAsked' (new count) has reached ${MAX_QUESTIONS_PER_SESSION} questions):
        *   Set 'isQuizOver' to true.
        *   'aiResponse' should be a concluding remark (e.g., "That's the end of this short practice session! Well done.").
        *   'detailedFeedback' should contain the feedback for the final answer.
        *   Set 'isQuestion' to false.
        *   The calling system will calculate and use 'averageSessionScore'. You do not need to set it.
    *   Set 'updatedQuestionsAsked' to the new incremented count of questions you (AI) have asked.
3.  **General Interaction**:
    *   If the user asks for a hint: provide one in 'aiResponse'. 'detailedFeedback' can elaborate slightly. Re-iterate the current question if one was active. 'isQuestion' should be true. Do not increment 'updatedQuestionsAsked' (it should be same as '{{questionsAsked}}'). Do NOT provide an 'answerScore'.
    *   Maintain a professional, encouraging, and helpful tone.

Previous conversation history (if any):
{{#if chatHistory}}
{{#each chatHistory}}
{{this.role}}: {{{this.content}}}
{{/each}}
{{else}}
(No previous conversation history)
{{/if}}

User's latest message: {{{userMessage}}}
Number of questions already asked by AI in this session: {{questionsAsked}}

Formulate your response strictly according to the AptitudeTutorOutputSchema.
'updatedQuestionsAsked' must always be populated.
If 'isQuizOver' is true, 'isQuestion' must be false.
'answerScore' is only for when the user submits an answer to a question.
'averageSessionScore' is only relevant if 'isQuizOver' is true; the calling system calculates it. You may omit it or it can be null.
`,
});

const aptitudeTutorFlow = ai.defineFlow(
  {
    name: 'aptitudeTutorFlow',
    inputSchema: AptitudeTutorInputSchema,
    outputSchema: AptitudeTutorOutputSchema,
  },
  async (input: AptitudeTutorInput): Promise<AptitudeTutorOutput> => {
    const {output} = await aptitudeTutorPrompt(input);
    if (!output) {
      throw new Error("AI failed to produce an output for aptitude tutor.");
    }

    // Ensure default values if AI omits optional fields, though Zod schema defaults should ideally handle this.
    const finalOutput: AptitudeTutorOutput = {
      aiResponse: output.aiResponse,
      detailedFeedback: output.detailedFeedback,
      isQuizOver: output.isQuizOver ?? false,
      isQuestion: output.isQuestion ?? !(output.isQuizOver ?? false), // if quiz is over, it's not a question
      updatedQuestionsAsked: output.updatedQuestionsAsked ?? input.questionsAsked ?? 0,
      answerScore: output.answerScore,
      averageSessionScore: output.averageSessionScore
    };

    return finalOutput;
  }
);

export async function tutorAptitudeQuestion(input: AptitudeTutorInput): Promise<AptitudeTutorOutput> {
  return aptitudeTutorFlow(input);
}
