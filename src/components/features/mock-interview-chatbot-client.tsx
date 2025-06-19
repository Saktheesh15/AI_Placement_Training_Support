
// src/components/features/mock-interview-chatbot-client.tsx
"use client";

import type {
  MockInterviewInput,
  MockInterviewOutput,
} from '@/ai/flows/mock-interview-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, User, Bot, Sparkles, Award, Mic, MicOff, Volume2, VolumeX, Video, VideoOff } from 'lucide-react';
import { useState, useRef, useEffect, useTransition } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface InterviewState {
  isOver: boolean;
  overallFeedback: string | null;
  interviewScore: number | null;
  currentQuestionCount: number;
  interviewType: string;
}

const initialInterviewState: InterviewState = {
  isOver: false,
  overallFeedback: null,
  interviewScore: null,
  currentQuestionCount: 0,
  interviewType: "Behavioral", 
};

const INTERVIEW_TYPES = ["Behavioral", "Technical - General", "Technical - JavaScript", "Technical - Python", "Case Study"];

interface MockInterviewChatbotClientProps {
  conductInterviewAction: (
    input: MockInterviewInput & { username: string } // Add username here
  ) => Promise<MockInterviewOutput | {error: string}>;
  username: string; // Current logged-in user
}

export function MockInterviewChatbotClient({
  conductInterviewAction,
  username,
}: MockInterviewChatbotClientProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [interviewState, setInterviewState] = useState<InterviewState>(initialInterviewState);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);


  useEffect(() => {
    const getPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        const SpeechRecognitionAPI = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognitionAPI) {
          const recognition = new SpeechRecognitionAPI();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';
          recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(transcript);
            setIsMicOn(false); 
          };
          recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error', event.error);
            setError(`Speech recognition error: ${event.error}`);
            setIsMicOn(false);
          };
          speechRecognitionRef.current = recognition;
        } else {
          console.warn("Speech Recognition API not supported in this browser.");
        }

      } catch (err) {
        console.error('Error accessing camera/mic:', err);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Permissions Denied',
          description: 'Camera and microphone permissions are needed for the full experience. Please enable them in your browser settings.',
        });
      }
    };
    getPermissions();

    return () => { 
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      speechSynthesis.cancel(); // Cancel any ongoing speech synthesis
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, interviewState.isOver]);

  const speak = (text: string) => {
    if (!isSpeakerOn || !text || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel(); // Cancel previous speech before starting new
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis error:", e);
      toast({ variant: "destructive", title: "Speech Error", description: "Could not play audio." });
    }
  };

  const startInterview = () => {
    setMessages([]);
    setError(null);
    // Ensure interviewType is correctly set before starting.
    // If type was changed, interviewState.isOver might be true, which is good for reset.
    setInterviewState(prev => ({...initialInterviewState, interviewType: prev.interviewType, currentQuestionCount: 0})); 
    startTransition(async () => {
      const initialInput: MockInterviewInput & { username: string } = {
        interviewType: interviewState.interviewType, // Use the latest type from state
        userMessage: "Start Interview",
        chatHistory: [],
        questionCount: 0,
        username,
      };
      const result = await conductInterviewAction(initialInput);
      if ('error' in result) {
        setError(result.error);
      } else {
        setMessages([{ id: Date.now().toString(), role: 'assistant', content: result.aiResponse }]);
        setInterviewState(prev => ({ ...prev, currentQuestionCount: result.currentQuestionCount ?? 0, isOver: false }));
        speak(result.aiResponse);
      }
    });
  };
  
  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>, speechInput?: string) => {
    if (e) e.preventDefault();
    const currentMessage = speechInput || inputValue;
    if (!currentMessage.trim() || isPending || interviewState.isOver) return;

    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content: currentMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setError(null);

    startTransition(async () => {
      const chatHistoryForAI = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }));
      
      const result = await conductInterviewAction({
        interviewType: interviewState.interviewType,
        userMessage: currentMessage,
        chatHistory: chatHistoryForAI,
        questionCount: interviewState.currentQuestionCount,
        username,
      });

      if ('error' in result) {
        setError(result.error);
        setMessages(prev => prev.slice(0, -1)); // Remove optimistic user message on error
      } else {
        const newAIMessages: Message[] = [];
        if (result.answerFeedback) {
          newAIMessages.push({
            id: (Date.now() + 1).toString(),
            role: 'system',
            content: result.answerFeedback,
          });
          speak(result.answerFeedback);
        }
        if (result.aiResponse){
             newAIMessages.push({
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: result.aiResponse,
            });
            speak(result.aiResponse);
        }
        setMessages(prev => [...prev, ...newAIMessages]);
        
        setInterviewState(prev => ({
          ...prev,
          isOver: result.isInterviewOver ?? false,
          overallFeedback: result.overallFeedback ?? prev.overallFeedback,
          interviewScore: result.interviewScore ?? prev.interviewScore,
          currentQuestionCount: result.currentQuestionCount ?? prev.currentQuestionCount,
        }));

        if (result.isInterviewOver) {
            // Server action now handles logging
            toast({
                title: "Interview Concluded!",
                description: `Your performance for ${interviewState.interviewType} has been recorded. Check the dashboard for details.`,
            });
        }
      }
    });
  };

  const toggleMic = () => {
    if (!speechRecognitionRef.current) {
        setError("Speech recognition is not available.");
        return;
    }
    if (isMicOn) {
        speechRecognitionRef.current.stop();
        setIsMicOn(false);
    } else {
        try {
            speechRecognitionRef.current.start();
            setIsMicOn(true);
            setError(null); 
        } catch (err) {
            console.error("Speech recognition start error:", err);
            // @ts-ignore
            if (err.name === 'not-allowed') {
                 setError("Microphone access denied. Please enable it in your browser settings.");
            } else {
                setError("Could not start microphone. Please check permissions.");
            }
            setIsMicOn(false);
        }
    }
  };


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Sparkles className="mr-2 h-6 w-6 text-primary" />
          AI Mock Interview
        </CardTitle>
        <CardDescription>
          Practice your interview skills. Select an interview type and begin.
          Ensure camera and microphone are enabled for the full experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 items-center">
            <Select
                value={interviewState.interviewType}
                onValueChange={(value) => {
                    // Reset messages and state if type changes mid-interview or to start fresh
                    setMessages([]);
                    setInterviewState({ ...initialInterviewState, interviewType: value });
                }}
                disabled={isPending && messages.length > 0 && !interviewState.isOver }
            >
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select interview type" />
                </SelectTrigger>
                <SelectContent>
                {INTERVIEW_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            <Button onClick={startInterview} disabled={isPending || (messages.length > 0 && !interviewState.isOver) }>
                {messages.length > 0 && !interviewState.isOver ? "Interview in Progress" : "Start New Interview"}
            </Button>
        </div>
        
        <div className="relative aspect-video bg-muted rounded-md overflow-hidden border">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            {hasCameraPermission === false && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-4 text-center">
                    <p>Camera access denied or unavailable. Video feed disabled. Please enable camera permissions.</p>
                 </div>
            )}
            {hasCameraPermission === null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                    <Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Accessing camera...</span>
                </div>
            )}
        </div>
         { !(hasCameraPermission) && (
            <Alert variant="destructive">
                <VideoOff className="h-4 w-4" />
                <AlertTitle>Camera/Microphone Access Required</AlertTitle>
                <AlertDescription>
                    Please allow camera and microphone access in your browser settings to use all interview features. The video feed is currently disabled. Speech-to-text might also be affected.
                </AlertDescription>
            </Alert>
        )}


        <ScrollArea className="h-[300px] w-full border rounded-md p-4" ref={scrollAreaRef}>
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
                    <Sparkles size={20} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm shadow-md ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.role === 'system' 
                      ? 'bg-accent/20 text-accent-foreground border border-accent/50 w-full italic'
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
            {interviewState.isOver && messages.length > 0 && (
              <Card className="mt-6 bg-gradient-to-br from-primary/5 to-accent/5 shadow-lg">
                <CardHeader className="text-center pb-2">
                  <Award className="mx-auto h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-xl">Interview Concluded!</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  {interviewState.interviewScore !== null && (
                    <p className="text-2xl font-bold text-foreground">
                      Final Score: {interviewState.interviewScore} / 10
                    </p>
                  )}
                  {interviewState.overallFeedback && (
                    <div className="text-xs text-muted-foreground p-2 bg-background/30 rounded-md border text-left">
                      <h4 className="font-semibold mb-1 text-foreground">Overall Feedback:</h4>
                      <p className="whitespace-pre-wrap">{interviewState.overallFeedback}</p>
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

        {!interviewState.isOver && messages.length > 0 && (
          <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4 border-t">
            <Button type="button" variant="outline" size="icon" onClick={toggleMic} disabled={isPending || !speechRecognitionRef.current}>
                {isMicOn ? <MicOff className="h-5 w-5 text-destructive" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer here..."
              className="flex-grow"
              disabled={isPending || interviewState.isOver}
              aria-label="Your answer"
            />
            <Button type="submit" disabled={isPending || !inputValue.trim() || interviewState.isOver} size="icon" aria-label="Send answer">
              {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
            <Button type="button" variant="outline" size="icon" onClick={() => setIsSpeakerOn(prev => !prev)}>
                {isSpeakerOn ? <Volume2 className="h-5 w-5"/> : <VolumeX className="h-5 w-5 text-muted-foreground"/>}
            </Button>
          </form>
        )}
         {messages.length === 0 && !isPending && (
             <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Ready to Start?</AlertTitle>
                <AlertDescription>
                    Select an interview type above and click &quot;Start New Interview&quot; to begin.
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
