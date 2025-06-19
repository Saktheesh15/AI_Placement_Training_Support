
"use client";
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Loader2, CalendarDays, MessageSquarePlus, Bot, Award } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { MockInterviewChatbotClient } from '@/components/features/mock-interview-chatbot-client';
import { handleConductMockInterview } from './actions'; 
import Link from 'next/link'; 

const interviewFeatures = [
  {
    id: "schedule",
    title: "Schedule with Mentors",
    description: "Book mock interview sessions at your convenience with experienced mentors (Feature coming soon).",
    icon: CalendarDays,
    actionText: "View Availability (Soon)",
    actionLink: "#", 
    imageUrl: "https://media.istockphoto.com/id/879922028/photo/coaching-and-mentoring-concept.jpg?s=612x612&w=0&k=20&c=mZ3PF7Qc2Xd94Bd6pG0yaSyphha9KtI5XR-4Bm9tkcI=",
    aiHint: "calendar online booking",
    disabled: true,
  },
  {
    id: "ai-practice",
    title: "AI-Powered Practice",
    description: "Engage in realistic AI-driven interview simulations tailored to various roles and industries. Practice with text and speech.",
    icon: Bot, 
    actionText: "Launch AI Interviewer", 
    actionLink: "#ai-interviewer-section", 
    imageUrl: "data:image/jpeg;base64,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",
    aiHint: "chatbot conversation interface",
  },
  {
    id: "feedback",
    title: "Get Expert Feedback",
    description: "Receive detailed feedback on your performance, covering communication, technical skills, and problem-solving from AI and mentors.",
    icon: MessageSquarePlus,
    actionText: "View Performance Dashboard",
    actionLink: "/dashboard", 
    imageUrl: "https://www.shutterstock.com/image-vector/feedback-concept-illustration-idea-reviews-600nw-1470642089.jpg",
    aiHint: "report chart analytics",
  }
];

export default function MockInterviewsPage() {
  const { isLoading: authLoading, authenticatedUser } = useRequireAuth();

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  if (!authenticatedUser) return null;

  return (
    <>
    <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <Image
            src="https://placehold.co/600x450.png?text=Land+The+Job"
            alt="Mock Interviews Banner"
            layout="fill"
            objectFit="cover"
            data-ai-hint="interview preparation"
            priority
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
            <Award className="h-16 w-16 text-white mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Ace Your Next Interview
            </h1>
            <p className="mt-4 text-lg text-slate-200 max-w-2xl">
                Practice makes perfect. Utilize our AI interviewer, schedule sessions with mentors (soon!), and receive expert feedback.
            </p>
        </div>
    </div>
    <Container className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {interviewFeatures.map((feature) => (
          <Card key={feature.title} className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
            <div className="relative w-full h-48">
              <Image
                src={feature.imageUrl}
                alt={feature.title}
                layout="fill"
                objectFit="cover"
                data-ai-hint={feature.aiHint}
              />
            </div>
            <CardHeader>
              <div className="flex items-center mb-2">
                <feature.icon className="h-7 w-7 mr-3 text-primary" />
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild={feature.actionLink.startsWith("/") || feature.actionLink.startsWith("#")} disabled={feature.disabled}>
                <a href={feature.actionLink}>{feature.actionText}</a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Separator className="my-12" />

      <section id="ai-interviewer-section" className="py-10 bg-card rounded-xl shadow-2xl">
        <div className="text-center mb-8 px-4">
            <h2 className="text-3xl font-bold text-foreground">AI Mock Interviewer</h2>
            <p className="mt-2 text-md text-muted-foreground">
                Select an interview type and start practicing with our AI. <br/> Enable your microphone for speech-to-text and speakers for AI voice responses.
            </p>
        </div>
        {authenticatedUser && <MockInterviewChatbotClient conductInterviewAction={handleConductMockInterview} username={authenticatedUser} />}
      </section>


      <Card className="mt-12 bg-primary/5 border-primary/20 rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Ready to Impress?</CardTitle>
          <CardDescription>
            Our platform provides comprehensive tools to prepare you for any interview challenge. Regular practice is key to success.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            <strong>Note:</strong> Mentor scheduling is under development. Utilize the AI interviewer and check your dashboard for performance insights.
          </p>
        </CardContent>
        <CardFooter>
           <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </Container>
    </>
  );
}
