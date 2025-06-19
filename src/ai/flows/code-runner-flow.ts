'use server';
/**
 * @fileOverview An AI agent that analyzes and provides feedback on code snippets.
 *
 * - runCodeAndGetFeedback - A function that handles code analysis and feedback.
 * - CodeRunnerInput - The input type for the runCodeAndGetFeedback function.
 * - CodeRunnerOutput - The return type for the runCodeAndGetFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeRunnerInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet to be analyzed.'),
  language: z
    .string()
    .optional()
    .describe('The programming language of the snippet (e.g., "JavaScript", "Python", "SQL").'),
});
export type CodeRunnerInput = z.infer<typeof CodeRunnerInputSchema>;

const CodeRunnerOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A brief explanation of what the code does, its purpose, and key logic.'),
  simulatedOutput: z
    .string()
    .optional()
    .describe(
      'A simulated or predicted output if the code were to be executed. For non-executable code or complex scenarios, describe the expected outcome or data transformation. For SQL, this could be a sample of the result set.'
    ),
  suggestions: z
    .string()
    .optional()
    .describe(
      'Suggestions for improvement, best practices, potential bugs, or alternative approaches. This can include notes on efficiency, readability, or security if applicable.'
    ),
  isExecutable: z
    .boolean()
    .optional()
    .describe('A flag indicating if the AI believes the code is directly executable or primarily for illustration/learning. This is a best-effort assessment.'),
});
export type CodeRunnerOutput = z.infer<typeof CodeRunnerOutputSchema>;

export async function runCodeAndGetFeedback(input: CodeRunnerInput): Promise<CodeRunnerOutput> {
  return codeRunnerFlow(input);
}

const codeRunnerPrompt = ai.definePrompt({
  name: 'codeRunnerPrompt',
  input: {schema: CodeRunnerInputSchema},
  output: {schema: CodeRunnerOutputSchema},
  prompt: `You are an expert AI Coding Assistant and Code Execution Simulator.
You are given a code snippet in '{{language}}'. Your task is to analyze this code and provide comprehensive feedback.

Code Snippet:
\`\`\`{{language}}
{{{codeSnippet}}}
\`\`\`

Please provide the following in your response, adhering strictly to the CodeRunnerOutputSchema:
1.  **explanation**: Clearly explain what the code does. Describe its main purpose, the logic flow, and any key functions or operations it performs.
2.  **simulatedOutput**: If the code snippet appears to be executable and has clear output statements (like console.log, print, or a SQL query that returns data), provide a realistic simulated output. If the code is complex, not directly runnable, or doesn't produce a simple textual output, describe the expected outcome or data transformation. For SQL queries, describe the structure of the result set and provide a small, illustrative example of the data it might return. If no output is expected, state that clearly or omit the field.
3.  **suggestions**: Offer constructive suggestions. This could include:
    *   Improvements for clarity, efficiency, or readability.
    *   Potential bugs or edge cases not handled.
    *   Adherence to best practices for the given language.
    *   Alternative ways to achieve the same result, if relevant.
    *   Security considerations, if applicable.
    If there are no specific suggestions, you can omit this field.
4.  **isExecutable**: Based on your analysis, indicate if the provided snippet seems like a complete, executable piece of code (true) or if it's more of an illustrative fragment, pseudo-code, or requires a broader context to run (false). This is a best-effort assessment. If unsure, you can omit this field.

Structure your response strictly according to the 'CodeRunnerOutputSchema'.
The language is '{{language}}'. If no language is specified, make a best guess based on the syntax.
Be concise yet thorough.
`,
});

const codeRunnerFlow = ai.defineFlow(
  {
    name: 'codeRunnerFlow',
    inputSchema: CodeRunnerInputSchema,
    outputSchema: CodeRunnerOutputSchema,
  },
  async input => {
    const {output} = await codeRunnerPrompt(input);
    return output!;
  }
);
