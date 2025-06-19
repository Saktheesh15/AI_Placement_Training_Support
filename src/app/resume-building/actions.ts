
"use server";

import { getResumeFeedback } from '@/ai/flows/resume-feedback';
import type { ResumeFeedbackInput, ResumeFeedbackOutput } from '@/ai/flows/resume-feedback';

export async function getResumeFeedbackAction(input: ResumeFeedbackInput): Promise<ResumeFeedbackOutput | { error: string }> {
  try {
    if (!input.resumeText || input.resumeText.trim().length < 50) {
      return { error: "Resume text is too short. Please provide substantial content for effective feedback." };
    }
    if (input.resumeText.trim().length > 15000) {
      return { error: "Resume text is too long. Please provide a resume under 15,000 characters." };
    }
    if (input.targetRole && input.targetRole.length > 100) {
      return { error: "Target role is too long (max 100 characters)." };
    }
    
    const result = await getResumeFeedback(input);
    return result;
  } catch (e) {
    console.error("Error getting resume feedback:", e);
    let message = "An unexpected error occurred while analyzing your resume.";
    if (e instanceof Error) {
        // For specific Genkit errors or other known errors, you might customize message further
        // For now, if it's a generic Error, we can use its message if it's deemed safe.
        // Or, stick to a generic message for security.
        // Example: message = e.message; // Be cautious with exposing raw error messages
    }
    return { error: message };
  }
}
