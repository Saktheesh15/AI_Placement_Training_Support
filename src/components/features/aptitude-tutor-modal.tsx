
"use client";

import type { AptitudeTutorInput, AptitudeTutorOutput } from '@/ai/flows/aptitude-tutor-flow';
import type { AptitudeType } from '@/app/aptitude/page';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles, User, Bot, Brain, Star, Award } from 'lucide-react';
import { useState, useRef, useEffect, useTransition } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  score?: number; 
}

interface TutorSessionState {
  isOver: boolean;
  questionsAskedByAI: number; 
  questionsAnsweredByUser: number; 
  cumulativeScore: number; 
  currentTopic?: string; 
  averageScoreForSession?: number; // Store the final average score
}

const initialTutorSessionState: TutorSessionState = {
  isOver: false,
  questionsAskedByAI: 0,
  questionsAnsweredByUser: 0,
  cumulativeScore: 0,
  currentTopic: undefined,
  averageScoreForSession: undefined,
};

interface AptitudeTutorModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  aptitudeType: AptitudeType;
  initialTopic?: string;
  username: string; // Added for logging performance
  tutorInteractionAction: (input: AptitudeTutorInput & {username: string}) => Promise<AptitudeTutorOutput | { error: string }>;
}

export function AptitudeTutorModal({
  isOpen,
  onOpenChange,
  aptitudeType,
  initialTopic,
  username,
  tutorInteractionAction,
}: AptitudeTutorModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [sessionState, setSessionState] = useState<TutorSessionState>({...initialTutorSessionState, currentTopic: initialTopic});
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const resetTutor = () => {
    setMessages([]);
    setInputValue('');
    setError(null);
    setSessionState({...initialTutorSessionState, currentTopic: initialTopic});
  };

  useEffect(() => {
    if (isOpen) {
      resetTutor();
      startTransition(async () => {
        setError(null);
        const firstInteractionInput = {
          aptitudeType,
          currentTopic: initialTopic,
          userMessage: "Start", 
          chatHistory: [],
          questionsAsked: 0, 
          username,
        };
        const result = await tutorInteractionAction(firstInteractionInput);
        if ('error' in result) {
          setError(result.error);
        } else {
          setMessages([{ id: Date.now().toString(), role: 'assistant', content: result.aiResponse }]);
          setSessionState(prev => ({ ...prev, questionsAskedByAI: result.updatedQuestionsAsked }));
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, aptitudeType, initialTopic, username]); // tutorInteractionAction removed

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, sessionState.isOver]);


  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isPending || sessionState.isOver) return;

    const userMessageContent = inputValue;
    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content: userMessageContent };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setError(null);

    startTransition(async () => {
      const chatHistoryForAI = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }));
      
      const result = await tutorInteractionAction({
        aptitudeType,
        currentTopic: sessionState.currentTopic,
        userMessage: userMessageContent,
        chatHistory: chatHistoryForAI,
        questionsAsked: sessionState.questionsAskedByAI,
        username,
      });

      if ('error' in result) {
        setError(result.error);
        setMessages(prev => prev.slice(0, -1)); 
      } else {
        const newAIMessages: Message[] = [];
        let currentAnswerScore: number | undefined = result.answerScore;

        if (result.detailedFeedback) {
          newAIMessages.push({
            id: (Date.now() + 1).toString(),
            role: 'system', 
            content: result.detailedFeedback + (currentAnswerScore !== undefined ? `\nScore: ${currentAnswerScore}/10` : ""),
            score: currentAnswerScore
          });
        }
        if (result.aiResponse) {
             newAIMessages.push({
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: result.aiResponse,
             });
        }
        setMessages(prev => [...prev, ...newAIMessages]);
        
        const newSessionState = { ...sessionState };
        newSessionState.questionsAskedByAI = result.updatedQuestionsAsked;
        if (currentAnswerScore !== undefined) {
          newSessionState.questionsAnsweredByUser += 1;
          newSessionState.cumulativeScore += currentAnswerScore;
        }
        newSessionState.isOver = result.isQuizOver;
        
        if (result.isQuizOver) {
            const avgScore = newSessionState.questionsAnsweredByUser > 0 
                ? newSessionState.cumulativeScore / newSessionState.questionsAnsweredByUser 
                : 0;
            newSessionState.averageScoreForSession = parseFloat(avgScore.toFixed(1));
            // The server action now handles logging, using the averageScore from AI if quiz is over
             toast({
                title: "Aptitude Session Ended",
                description: `Performance for ${aptitudeType} (${newSessionState.currentTopic || 'General'}) has been recorded.`,
            });
        }
        setSessionState(newSessionState);
      }
    });
  };
  
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] flex flex-col h-[90vh] max-h-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Brain className="mr-2 h-6 w-6 text-primary" />
            AI Tutor: {aptitudeType}
          </DialogTitle>
          <DialogDescription>
            Topic: {sessionState.currentTopic || "General"}. Answer the questions to the best of your ability.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow p-1 -mx-1 mb-4 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'justify-end' : ''
                } ${message.role === 'system' ? 'justify-center' : '' }`}
              >
                {message.role === 'assistant' && (
                  <div className="p-2 bg-primary/10 rounded-full text-primary self-start mt-1 shrink-0">
                    <Bot size={20} />
                  </div>
                )}
                 {message.role === 'system' && ( 
                   <div className="p-2 bg-accent/10 rounded-full text-accent self-start mt-1 shrink-0">
                    <Star size={20} /> 
                  </div>
                 )}
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm shadow-md ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.role === 'system' 
                      ? 'bg-accent/20 text-accent-foreground border border-accent/50 w-full' 
                      : 'bg-card text-card-foreground border' 
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                 {message.role === 'user' && (
                  <div className="p-2 bg-secondary rounded-full text-secondary-foreground self-start mt-1 shrink-0">
                    <User size={20} />
                  </div>
                )}
              </div>
            ))}
            {isPending && messages.length > 0 && messages[messages.length-1]?.role === 'user' && (
               <div className="flex items-start gap-3">
                 <div className="p-2 bg-primary/10 rounded-full text-primary self-start mt-1 shrink-0">
                    <Bot size={20} />
                  </div>
                <div className="max-w-[85%] rounded-xl px-4 py-3 text-sm shadow-md bg-card text-card-foreground border flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>AI is thinking...</span>
                </div>
              </div>
            )}
            {sessionState.isOver && (
              <Card className="mt-6 bg-gradient-to-br from-primary/10 to-accent/10 shadow-xl">
                <CardHeader className="text-center pb-2">
                  <Award className="mx-auto h-12 w-12 text-primary mb-2" />
                  <DialogTitle className="text-2xl">Practice Session Ended!</DialogTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <p className="text-lg font-semibold text-foreground">
                    Topic: {sessionState.currentTopic || "General"}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    Average Score: {sessionState.averageScoreForSession !== undefined ? `${sessionState.averageScoreForSession} / 10` : "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You answered {sessionState.questionsAnsweredByUser} question(s) in this session.
                  </p>
                   <p className="text-xs text-muted-foreground pt-2">
                    Your performance has been logged to the dashboard.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!sessionState.isOver && (
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t pt-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer or ask for a hint..."
              className="flex-grow"
              disabled={isPending || sessionState.isOver || messages.length === 0}
              aria-label="Your answer"
            />
            <Button type="submit" disabled={isPending || !inputValue.trim() || sessionState.isOver || messages.length === 0} size="icon" aria-label="Send answer">
              {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        )}
         {messages.length === 0 && !isPending && !error && (
             <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Ready to Practice?</AlertTitle>
                <AlertDescription>
                    The AI tutor is initializing your session for {aptitudeType}
                    {sessionState.currentTopic ? ` on ${sessionState.currentTopic}` : ''}.
                </AlertDescription>
            </Alert>
        )}
        <DialogFooter className="sm:justify-start mt-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              {sessionState.isOver ? "Close" : "End Session"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
