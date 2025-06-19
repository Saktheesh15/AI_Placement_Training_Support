
'use server';

import {
  conductMockInterview,
  type MockInterviewInput,
  type MockInterviewOutput,
} from '@/ai/flows/mock-interview-flow';
import { updateUserPerformance } from '@/app/auth/actions';

// Input for this server action should now include username
interface HandleConductMockInterviewInput extends MockInterviewInput {
  username: string;
}

export async function handleConductMockInterview(
  input: HandleConductMockInterviewInput
): Promise<MockInterviewOutput | {error: string}> {
  try {
    if (!input.interviewType || !input.userMessage || !input.username) {
      return {error: 'Interview type, user message, and username are required.'};
    }
    if (input.userMessage.length > 2000) {
        return {error: 'Your message is too long. Please keep it under 2000 characters.'}
    }
    if (input.chatHistory && input.chatHistory.length > 20) { 
        return {error: 'Chat history is too long.'}
    }

    const aiResult = await conductMockInterview({
        interviewType: input.interviewType,
        userMessage: input.userMessage,
        chatHistory: input.chatHistory,
        questionCount: input.questionCount,
    });

    if ('error' in aiResult) {
        return aiResult;
    }

    if (aiResult.isInterviewOver && aiResult.interviewScore !== undefined) {
      await updateUserPerformance(input.username, {
        interviewEntry: {
          type: input.interviewType,
          score: aiResult.interviewScore,
          overallFeedback: aiResult.overallFeedback,
          date: new Date().toISOString().split('T')[0],
        },
      });
    }

    return aiResult;
  } catch (e) {
    console.error('Error in handleConductMockInterview server action:', e);
    let message = 'An unexpected error occurred while processing your request.';
    if (e instanceof Error) {
      // Potentially specific error handling for Genkit errors if known
    }
    return {error: message};
  }
}
