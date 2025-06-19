
'use server';

import {
  tutorAptitudeQuestion,
  type AptitudeTutorInput,
  type AptitudeTutorOutput,
} from '@/ai/flows/aptitude-tutor-flow';
import { updateUserPerformance } from '@/app/auth/actions';

// Input for this server action should now include username
interface HandleAptitudeTutorInteractionInput extends AptitudeTutorInput {
  username: string;
}

export async function handleAptitudeTutorInteraction(
  input: HandleAptitudeTutorInteractionInput
): Promise<AptitudeTutorOutput | {error: string}> {
  try {
    if (!input.aptitudeType || !input.userMessage || !input.username) {
      return {error: 'Aptitude type, user message, and username are required.'};
    }
    if (input.userMessage.length > 1000) {
      return {error: 'Your message is too long (max 1000 characters).'};
    }
    if (input.chatHistory && input.chatHistory.length > 20) {
      return {error: 'Chat history is too extensive.'};
    }

    const aiResult = await tutorAptitudeQuestion({
        aptitudeType: input.aptitudeType,
        currentTopic: input.currentTopic,
        userMessage: input.userMessage,
        chatHistory: input.chatHistory,
        questionsAsked: input.questionsAsked,
    });

    if ('error' in aiResult) {
        return aiResult;
    }
    
    if (aiResult.isQuizOver && aiResult.averageSessionScore !== undefined) { // averageSessionScore added to output schema
      await updateUserPerformance(input.username, {
        aptitudeEntry: {
          aptitudeType: input.aptitudeType,
          topic: input.currentTopic || 'General',
          score: aiResult.averageSessionScore, 
          date: new Date().toISOString().split('T')[0],
        },
      });
    }

    return aiResult;
  } catch (e) {
    console.error('Error in handleAptitudeTutorInteraction server action:', e);
    let message = 'An unexpected error occurred while assisting you.';
    if (e instanceof Error) {
      // Potentially specific error handling if needed
    }
    return {error: message};
  }
}
