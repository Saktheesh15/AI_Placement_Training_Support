// src/components/features/technical-skill-topic-client.tsx
"use client";

import type { CodeRunnerInput, CodeRunnerOutput } from '@/ai/flows/code-runner-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Code, Lightbulb, Loader2, PlayCircle, RotateCcw, Terminal, AlertTriangle, Info } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '../ui/scroll-area';

interface TechTopic {
  id: string;
  title: string;
  difficulty: string;
  language: string;
  content: string;
  codeSnippet: string;
}

interface TechnicalSkillTopicClientProps {
  topic: TechTopic;
  runCodeAction: (input: CodeRunnerInput) => Promise<CodeRunnerOutput | { error: string }>;
}

export function TechnicalSkillTopicClient({ topic, runCodeAction }: TechnicalSkillTopicClientProps) {
  const [editedCode, setEditedCode] = useState(topic.codeSnippet);
  const [aiResponse, setAiResponse] = useState<CodeRunnerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAnalyzeCode = () => {
    setError(null);
    setAiResponse(null);
    startTransition(async () => {
      const result = await runCodeAction({
        codeSnippet: editedCode,
        language: topic.language,
      });
      if ('error'in result) {
        setError(result.error);
        setAiResponse(null);
      } else {
        setAiResponse(result);
        setError(null);
      }
    });
  };

  const handleResetCode = () => {
    setEditedCode(topic.codeSnippet);
    setAiResponse(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground mb-4">{topic.content}</p>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Code className="mr-2 h-5 w-5 text-primary" /> Interactive Code Editor
          </CardTitle>
          <CardDescription>Edit the {topic.language} code below and analyze it with our AI assistant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={editedCode}
            onChange={(e) => setEditedCode(e.target.value)}
            rows={10}
            className="w-full font-mono text-sm bg-muted/30 border-muted-foreground/30 focus:ring-primary rounded-md"
            aria-label={`Code editor for ${topic.title}`}
            placeholder={`Write your ${topic.language} code here...`}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAnalyzeCode} disabled={isPending || !editedCode.trim()} size="sm">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" /> Analyze with AI
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleResetCode} disabled={isPending} size="sm">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {isPending && !aiResponse && !error && (
        <div className="flex flex-col items-center justify-center p-6 bg-card rounded-xl shadow-md text-muted-foreground">
          <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-lg">AI is analyzing your code...</p>
          <p className="text-sm">This might take a few moments.</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="shadow-md">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {aiResponse && (
        <div className="space-y-6">
          <Card className="shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-xl flex items-center text-primary">
                <Info className="mr-3 h-6 w-6"/> AI Code Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {aiResponse.explanation && (
                <div className="p-6 border-b">
                  <h3 className="font-semibold text-lg mb-2 flex items-center text-foreground">
                    <Info className="mr-2 h-5 w-5 text-primary/80"/> Code Explanation
                  </h3>
                  <ScrollArea className="max-h-[200px] pr-2">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiResponse.explanation}</p>
                  </ScrollArea>
                </div>
              )}
              {aiResponse.simulatedOutput && (
                <div className="p-6 border-b">
                  <h3 className="font-semibold text-lg mb-2 flex items-center text-foreground">
                    <Terminal className="mr-2 h-5 w-5 text-primary/80"/> Simulated Output / Expected Outcome
                  </h3>
                  <ScrollArea className="max-h-[200px] pr-2">
                    <pre className="text-sm bg-muted/50 p-3 rounded-md text-muted-foreground whitespace-pre-wrap overflow-x-auto">{aiResponse.simulatedOutput}</pre>
                  </ScrollArea>
                </div>
              )}
              {aiResponse.suggestions && (
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2 flex items-center text-foreground">
                    <Lightbulb className="mr-2 h-5 w-5 text-primary/80"/> Suggestions & Feedback
                  </h3>
                  <ScrollArea className="max-h-[200px] pr-2">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiResponse.suggestions}</p>
                  </ScrollArea>
                </div>
              )}
              {aiResponse.isExecutable !== undefined && (
                 <div className="p-6 border-t bg-muted/20">
                    <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">AI Assessment:</span> This code snippet is {aiResponse.isExecutable ? "likely" : "not likely"} directly executable as a standalone piece.
                    </p>
                 </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
