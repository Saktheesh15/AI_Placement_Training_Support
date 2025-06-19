'use server';

import { runCodeAndGetFeedback } from '@/ai/flows/code-runner-flow';
import type { CodeRunnerInput, CodeRunnerOutput } from '@/ai/flows/code-runner-flow';

export async function runCodeAction(input: CodeRunnerInput): Promise<CodeRunnerOutput | { error: string }> {
  try {
    if (!input.codeSnippet || input.codeSnippet.trim().length === 0) {
      return { error: "Code snippet cannot be empty." };
    }
    if (input.codeSnippet.trim().length > 5000) { 
      return { error: "Code snippet is too long. Please provide a snippet under 5000 characters." };
    }
    // Basic check for language, though optional in schema
    if (input.language && input.language.trim().length === 0) {
        input.language = undefined; // Treat empty string as undefined
    }
    
    const result = await runCodeAndGetFeedback(input);
    return result;
  } catch (e) {
    console.error("Error in runCodeAction:", e);
    let message = "An unexpected error occurred while analyzing your code.";
    if (e instanceof Error) {
      // Potentially more specific error handling here, for now, generic is fine.
      // message = e.message; // Avoid exposing raw internal errors
    }
    return { error: message };
  }
}
