
"use server";

import { getSoftSkillQuizResponse } from '@/ai/flows/soft-skill-quiz-flow';
import type { SoftSkillQuizInput, SoftSkillQuizOutput } from '@/ai/flows/soft-skill-quiz-flow';
import { updateUserPerformance } from '@/app/auth/actions';

// Input for this server action should now include username
interface HandleGetQuizResponseInput extends SoftSkillQuizInput {
  username: string;
}

export async function handleGetQuizResponse(input: HandleGetQuizResponseInput): Promise<SoftSkillQuizOutput | { error: string }> {
  try {
    if (!input.softSkillTopic || !input.userMessage || !input.username) {
      return { error: "Topic, user message, and username are required." };
    }
    
    const aiResult = await getSoftSkillQuizResponse({
        softSkillTopic: input.softSkillTopic,
        userMessage: input.userMessage,
        chatHistory: input.chatHistory
    });

    if ('error' in aiResult) {
        return aiResult;
    }

    if (aiResult.isQuizOver && aiResult.finalScore !== undefined && aiResult.totalQuestions !== undefined) {
      await updateUserPerformance(input.username, {
        softSkillEntry: {
          topic: input.softSkillTopic,
          finalScore: aiResult.finalScore,
          totalQuestions: aiResult.totalQuestions,
          date: new Date().toISOString().split('T')[0],
        },
      });
    }
    return aiResult;

  } catch (e) {
    console.error("Error in handleGetQuizResponse server action:", e);
    let message = "An unexpected error occurred while processing your request.";
    if (e instanceof Error) {
      // message = e.message; // Avoid exposing raw errors
    }
    return { error: message };
  }
}
