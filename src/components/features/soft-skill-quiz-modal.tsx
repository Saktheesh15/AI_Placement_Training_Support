
"use client";

import type { SoftSkillQuizInput, SoftSkillQuizOutput } from '@/ai/flows/soft-skill-quiz-flow';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles, User, Bot, Star, Award } from 'lucide-react';
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

interface QuizState {
  isOver: boolean;
  finalScore: number | null;
  quizSummary: string | null;
  totalQuestionsInQuiz: number; // Updated by AI's output
}

const initialQuizState: QuizState = {
  isOver: false,
  finalScore: null,
  quizSummary: null,
  totalQuestionsInQuiz: 3, // Default, will be updated
};

interface SoftSkillQuizModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  softSkillTopic: string;
  username: string; // Added for logging performance
  getQuizResponseAction: (input: SoftSkillQuizInput & { username: string }) => Promise<SoftSkillQuizOutput | { error: string }>;
}

export function SoftSkillQuizModal({
  isOpen,
  onOpenChange,
  softSkillTopic,
  username,
  getQuizResponseAction,
}: SoftSkillQuizModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [quizState, setQuizState] = useState<QuizState>(initialQuizState);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();


  const resetQuiz = () => {
    setMessages([]);
    setInputValue('');
    setError(null);
    setQuizState(initialQuizState);
  };
  
  useEffect(() => {
    if (isOpen) {
      resetQuiz(); 
      startTransition(async () => {
        setError(null);
        const initialMessageInput = {
          softSkillTopic,
          userMessage: "Start the quiz",
          chatHistory: [],
          username,
        };
        const result = await getQuizResponseAction(initialMessageInput);
        if ('error' in result) {
          setError(result.error);
        } else {
          setMessages([{ id: Date.now().toString(), role: 'assistant', content: result.aiResponse }]);
          // Initialize totalQuestionsInQuiz from the first response if available, or keep default
          setQuizState(prev => ({ ...prev, totalQuestionsInQuiz: result.totalQuestions || prev.totalQuestionsInQuiz }));
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, softSkillTopic, username]); // getQuizResponseAction removed to avoid re-trigger if not memoized

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, quizState.isOver]);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isPending || quizState.isOver) return;

    const userMessageContent = inputValue;
    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content: userMessageContent };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setError(null);

    startTransition(async () => {
      const chatHistoryForAI = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }));
      
      const result = await getQuizResponseAction({
        softSkillTopic,
        userMessage: userMessageContent,
        chatHistory: chatHistoryForAI,
        username,
      });

      if ('error'in result) {
        setError(result.error);
      } else {
        const newMessages: Message[] = [];
        if (result.questionFeedback) {
          newMessages.push({
            id: (Date.now() + 1).toString(),
            role: 'system', 
            content: result.questionFeedback, 
            score: result.answerScore,
          });
        }
        if (result.aiResponse) { // Ensure aiResponse is not empty before pushing
            newMessages.push({
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: result.aiResponse, 
            });
        }
        setMessages(prev => [...prev, ...newMessages]);

        setQuizState(prev => ({
          ...prev,
          isOver: result.isQuizOver ?? false,
          finalScore: result.finalScore ?? prev.finalScore,
          quizSummary: result.quizSummary ?? prev.quizSummary,
          totalQuestionsInQuiz: result.totalQuestions ?? prev.totalQuestionsInQuiz,
        }));

        if (result.isQuizOver) {
          toast({
            title: "Quiz Complete!",
            description: `Your performance for ${softSkillTopic} has been recorded. Check the dashboard for details.`,
          });
        }
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
            <Sparkles className="mr-2 h-6 w-6 text-primary" />
            AI Quiz: {softSkillTopic}
          </DialogTitle>
          <DialogDescription>
            Answer {quizState.totalQuestionsInQuiz} question(s) from our AI quiz master. Good luck!
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
            {quizState.isOver && (
              <Card className="mt-6 bg-gradient-to-br from-primary/10 to-accent/10 shadow-xl">
                <CardHeader className="text-center pb-2">
                  <Award className="mx-auto h-12 w-12 text-primary mb-2" />
                  <DialogTitle className="text-2xl">Quiz Completed!</DialogTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  {quizState.finalScore !== null && (
                    <p className="text-3xl font-bold text-foreground">
                      Final Score: {quizState.finalScore} / {quizState.totalQuestionsInQuiz * 10}
                    </p>
                  )}
                  {quizState.quizSummary && (
                    <div className="text-sm text-muted-foreground p-3 bg-background/50 rounded-md border text-left">
                      <h4 className="font-semibold mb-1 text-foreground">Performance Summary:</h4>
                      <p className="whitespace-pre-wrap">{quizState.quizSummary}</p>
                    </div>
                  )}
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

        {!quizState.isOver && (
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t pt-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer..."
              className="flex-grow"
              disabled={isPending || quizState.isOver || messages.length === 0}
              aria-label="Your answer"
            />
            <Button type="submit" disabled={isPending || !inputValue.trim() || quizState.isOver || messages.length === 0} size="icon" aria-label="Send answer">
              {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        )}
         {messages.length === 0 && !isPending && !error && (
             <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Initializing Quiz...</AlertTitle>
                <AlertDescription>
                    The AI Quiz Master is preparing your first question for {softSkillTopic}.
                </AlertDescription>
            </Alert>
        )}
        <DialogFooter className="sm:justify-start mt-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              {quizState.isOver ? "Close & Review" : "End Quiz"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
