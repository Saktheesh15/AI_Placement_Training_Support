
"use client";

import { useState, useTransition } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, CheckCircle, AlertTriangle, ListChecks, MessageSquare, BarChart, Settings, Info } from 'lucide-react';
import type { ResumeFeedbackInput, ResumeFeedbackOutput } from '@/ai/flows/resume-feedback';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface ResumeFeedbackClientProps {
  getFeedbackAction: (input: ResumeFeedbackInput) => Promise<ResumeFeedbackOutput | { error: string }>;
}

const importanceColors: Record<string, string> = {
  High: 'bg-destructive/20 text-destructive-foreground border-destructive/50',
  Medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50 dark:text-yellow-400',
  Low: 'bg-blue-500/20 text-blue-700 border-blue-500/50 dark:text-blue-400',
};


export function ResumeFeedbackClient({ getFeedbackAction }: ResumeFeedbackClientProps) {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [feedback, setFeedback] = useState<ResumeFeedbackOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    startTransition(async () => {
      const result = await getFeedbackAction({ resumeText, targetRole });
      if ('error' in result) {
        setError(result.error);
      } else {
        setFeedback(result);
      }
    });
  };

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
      <Card className="md:col-span-2 shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Sparkles className="mr-3 h-7 w-7 text-primary" />
            AI Resume Analyzer
          </CardTitle>
          <CardDescription>
            Paste your resume text and optionally specify a target role to receive AI-powered feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="resumeText" className="block text-sm font-medium text-foreground mb-1">
                Resume Text
              </label>
              <Textarea
                id="resumeText"
                placeholder="Paste your full resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={15}
                className="min-h-[250px] text-sm focus:ring-2 focus:ring-primary shadow-sm"
                required
                aria-label="Resume text input"
              />
            </div>
            <div>
              <label htmlFor="targetRole" className="block text-sm font-medium text-foreground mb-1">
                Target Role (Optional)
              </label>
              <Input
                id="targetRole"
                placeholder="e.g., Software Engineer, Product Manager"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="text-sm shadow-sm focus:ring-2 focus:ring-primary"
                aria-label="Target role input"
              />
            </div>
            <Button type="submit" disabled={isPending || !resumeText.trim()} className="w-full sm:w-auto text-base py-3 px-6 shadow-md hover:shadow-lg transition-shadow">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Get Feedback <Sparkles className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="md:col-span-1">
        <Card className="sticky top-24 shadow-xl rounded-xl">
          <CardHeader className="border-b">
            <CardTitle className="text-xl flex items-center">
              <MessageSquare className="mr-2 h-6 w-6 text-primary" />
              AI Feedback Report
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ScrollArea className="h-[calc(100vh-16rem)] max-h-[600px] pr-3"> {/* Adjust height as needed */}
              {isPending && !feedback && !error && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3 py-10">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-lg font-medium">Generating Feedback...</p>
                  <p className="text-sm text-center">Our AI is carefully reviewing your resume. This may take a moment.</p>
                </div>
              )}
              {error && (
                <Alert variant="destructive" className="my-4">
                  <AlertTriangle className="h-5 w-5"/>
                  <AlertTitle>Analysis Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {feedback && !isPending && (
                <div className="space-y-6">
                  <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <BarChart className="mr-2 h-5 w-5 text-primary" />Overall Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-5xl font-bold text-primary mb-2">{feedback.overallScore}
                        <span className="text-2xl text-muted-foreground">/100</span>
                      </div>
                      <Progress value={feedback.overallScore} className="h-3 [&>div]:bg-primary" />
                      <p className="text-xs text-muted-foreground mt-2">{feedback.overallScore > 85 ? "Excellent!" : feedback.overallScore > 70 ? "Good Job!" : feedback.overallScore > 50 ? "Needs Improvement" : "Needs Significant Work"}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center"><Info className="mr-2 h-5 w-5"/>Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{feedback.summary}</p>
                    </CardContent>
                  </Card>

                  {feedback.strengths && feedback.strengths.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-green-500"/>Strengths</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {feedback.strengths.map((strength, index) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {feedback.areasForImprovement && feedback.areasForImprovement.length > 0 && (
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-yellow-500"/>Areas for Improvement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="multiple" className="w-full">
                            {feedback.areasForImprovement.map((item, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className="text-sm hover:no-underline">
                                    <div className="flex items-center justify-between w-full">
                                      <span className="font-medium text-foreground">{item.section}</span>
                                      {item.importance && (
                                        <Badge variant="outline" className={`text-xs ${importanceColors[item.importance] || 'border-muted-foreground'}`}>
                                          {item.importance} Priority
                                        </Badge>
                                      )}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-sm text-muted-foreground whitespace-pre-line pt-2 pb-4 px-1">
                                    {item.suggestion}
                                </AccordionContent>
                                </AccordionItem>
                            ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                  )}

                  {feedback.formattingAndStructureFeedback && feedback.formattingAndStructureFeedback.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Formatting & Structure</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {feedback.formattingAndStructureFeedback.map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  
                  {feedback.atsFriendliness && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center"><Settings className="mr-2 h-5 w-5"/>ATS Friendliness</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{feedback.atsFriendliness}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
              {!isPending && !feedback && !error && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-10">
                  <MessageSquare className="h-12 w-12 text-primary/70 mb-4" />
                  <p className="text-lg font-medium">Your feedback report will appear here.</p>
                  <p className="text-sm">Submit your resume to get started!</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <p className="text-xs text-muted-foreground text-center w-full">
                AI feedback provides suggestions. Use your best judgment when applying them.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
