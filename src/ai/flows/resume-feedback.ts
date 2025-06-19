
// 'use server';
/**
 * @fileOverview Provides AI-powered feedback on resume content, formatting, and overall effectiveness.
 *
 * - getResumeFeedback - A function that provides feedback on a resume.
 * - ResumeFeedbackInput - The input type for the getResumeFeedback function.
 * - ResumeFeedbackOutput - The return type for the getResumeFeedback function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumeFeedbackInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume to be reviewed.'),
  targetRole: z.string().optional().describe('Optional: The target job role or industry the user is applying for. This helps tailor feedback.'),
});
export type ResumeFeedbackInput = z.infer<typeof ResumeFeedbackInputSchema>;

const ImprovementAreaSchema = z.object({
  section: z.string().describe('Specific section of the resume (e.g., Header, Experience, Skills, Education, Projects).'),
  suggestion: z.string().describe('A specific, actionable suggestion for improvement in this section.'),
  importance: z.enum(['High', 'Medium', 'Low']).optional().describe('The importance level of this suggestion.'),
});

const ResumeFeedbackOutputSchema = z.object({
  overallScore: z
    .number()
    .min(0)
    .max(100)
    .describe('An overall score for the resume from 0 to 100, reflecting its effectiveness for the target role if provided, or general quality otherwise.'),
  summary: z
    .string()
    .describe('A concise overall summary of the feedback, highlighting the most critical points.'),
  strengths: z
    .array(z.string())
    .describe('Key strengths of the resume. List 2-4 main strengths.'),
  areasForImprovement: z
    .array(ImprovementAreaSchema)
    .describe('Specific, actionable areas where the resume can be improved. Provide 3-5 targeted suggestions.'),
  formattingAndStructureFeedback: z
    .array(z.string())
    .describe('Feedback on the resume\'s formatting, layout, readability, and overall structure. List 2-3 points.'),
  atsFriendliness: z
    .string()
    .optional()
    .describe('Brief comments on how well the resume might perform with Applicant Tracking Systems (ATS), focusing on keyword optimization (if target role provided) and parseability.'),
});
export type ResumeFeedbackOutput = z.infer<typeof ResumeFeedbackOutputSchema>;

export async function getResumeFeedback(input: ResumeFeedbackInput): Promise<ResumeFeedbackOutput> {
  return resumeFeedbackFlow(input);
}

const resumeFeedbackPrompt = ai.definePrompt({
  name: 'resumeFeedbackPrompt',
  input: {schema: ResumeFeedbackInputSchema},
  output: {schema: ResumeFeedbackOutputSchema},
  prompt: `You are an expert AI Resume Analyzer and Career Coach.
Analyze the provided resume text thoroughly.
{{#if targetRole}}
The user is targeting a role as a '{{targetRole}}'. Tailor your feedback towards this role.
{{else}}
No specific target role provided, so give general feedback for a professional resume.
{{/if}}

Resume Text:
{{{resumeText}}}

Provide a comprehensive review based on the ResumeFeedbackOutputSchema. Be constructive and actionable.

Specifically:
1.  **overallScore**: Assign a score from 0-100. Consider clarity, impact, relevance to the target role (if any), and professional standards.
2.  **summary**: Write a brief (2-3 sentences) summary of your key findings.
3.  **strengths**: Identify 2-4 clear strengths of the resume. Be specific.
4.  **areasForImprovement**: Provide 3-5 specific, actionable suggestions. For each suggestion, indicate the resume 'section' (e.g., "Experience", "Skills", "Education", "Projects", "Contact Information", "Summary/Objective") and the 'suggestion' itself. Optionally, assign an 'importance' level (High, Medium, Low).
5.  **formattingAndStructureFeedback**: Comment on 2-3 aspects of formatting, layout, and readability (e.g., font choice, consistency, use of white space, length, clarity of sections).
6.  **atsFriendliness**: (Optional but encouraged) Briefly comment on ATS compatibility. If a target role is given, mention keyword relevance. Otherwise, focus on general parseability (e.g., use of standard fonts, avoiding tables/columns if they hinder parsing).

Ensure your output strictly adheres to the JSON schema defined for ResumeFeedbackOutput.
Provide practical and professional advice to help the user improve their resume.
Be balanced: highlight positives as well as areas for growth.
`,
});

const resumeFeedbackFlow = ai.defineFlow(
  {
    name: 'resumeFeedbackFlow',
    inputSchema: ResumeFeedbackInputSchema,
    outputSchema: ResumeFeedbackOutputSchema,
  },
  async (input: ResumeFeedbackInput) => {
    // Input validation (example, can be more extensive)
    if (input.resumeText.length < 50) {
      throw new Error("Resume text is too short to analyze effectively.");
    }
    if (input.resumeText.length > 15000) {
      throw new Error("Resume text is too long. Please keep it under 15000 characters.");
    }

    const {output} = await resumeFeedbackPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate feedback. Please try again.');
    }
    
    // Ensure all required fields are present, even if AI misses one (though schema should enforce)
    return {
      overallScore: output.overallScore ?? 0,
      summary: output.summary ?? "No summary provided.",
      strengths: output.strengths ?? [],
      areasForImprovement: output.areasForImprovement ?? [],
      formattingAndStructureFeedback: output.formattingAndStructureFeedback ?? [],
      atsFriendliness: output.atsFriendliness,
    };
  }
);
