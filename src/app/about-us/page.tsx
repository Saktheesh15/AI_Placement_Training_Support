
"use client";
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Loader2 } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { APP_NAME } from '@/lib/constants';
import { Users, Target, Lightbulb, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


// export const metadata = { // Metadata defined in server component if needed
//   title: `About ${APP_NAME} | Elévix AI Training`,
//   description: `Learn more about ${APP_NAME}, our mission, vision, and the team dedicated to revolutionizing skill development.`,
// };

const teamMembers = [
  { name: "Mohammed Hisham S", role: "Founder & AI Specialist", imageUrl: "https://placehold.co/150x150.png?text=E.R.", aiHint: "woman scientist portrait" },
  { name: "Abhi Adhesh G", role: "Lead Curriculum Developer", imageUrl: "https://placehold.co/150x150.png?text=M.C.", aiHint: "male developer portrait" },
  { name: "Saktheeshwaran A", role: "Head of User Experience", imageUrl: "https://placehold.co/150x150.png?text=A.K.", aiHint: "female designer portrait" },
];

export default function AboutUsPage() {
  const { isLoading: authLoading, authenticatedUser } = useRequireAuth();

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  // This page might be public, if so, remove !authenticatedUser check or modify useRequireAuth
  // For now, assuming it's protected as per general request.
  if (!authenticatedUser) return null;

  return (
    <Container className="py-12">
      <div className="text-center mb-12">
        <Sparkles className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          About {APP_NAME}
        </h1>
        <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
          Empowering individuals to achieve their career aspirations through innovative, AI-driven skill development.
        </p>
      </div>
      <Separator className="my-12" />

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-semibold text-foreground mb-4 flex items-center">
            <Target className="h-8 w-8 mr-3 text-primary" /> Our Mission
          </h2>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            At {APP_NAME}, our mission is to democratize access to high-quality skill training. We leverage the power of artificial intelligence to provide personalized learning experiences, helping users acquire in-demand soft skills, technical expertise, and aptitude proficiency. We aim to bridge the gap between ambition and achievement for learners worldwide.
          </p>
          <h2 className="text-3xl font-semibold text-foreground mb-4 flex items-center">
            <Lightbulb className="h-8 w-8 mr-3 text-primary" /> Our Vision
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We envision a future where anyone, anywhere, can unlock their full potential and adapt to the evolving demands of the job market. {APP_NAME} strives to be the leading platform for continuous learning and career advancement, fostering a global community of skilled and confident professionals.
          </p>
        </div>
        <div className="relative aspect-[4/3] rounded-xl shadow-2xl overflow-hidden">
          <Image 
            src="https://placehold.co/600x450.png?text=About+Us"
            alt="Diverse team working together" 
            layout="fill"
            objectFit="cover"
            data-ai-hint="office collaboration meeting"
          />
        </div>
      </div>
      
      <Separator className="my-12" />

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl flex items-center justify-center">
          <Users className="h-10 w-10 mr-3 text-primary" /> Meet Our Team (Placeholder)
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          We are a passionate group of educators, technologists, and AI experts dedicated to your success.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member) => (
          <Card key={member.name} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
            <div className="relative w-full aspect-square">
              <Image
                src={member.imageUrl}
                alt={member.name}
                layout="fill"
                objectFit="cover"
                data-ai-hint={member.aiHint}
              />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{member.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-primary font-medium">{member.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-16 bg-gradient-to-r from-primary/10 to-accent/10 p-8 rounded-xl shadow-xl text-center">
        <h3 className="text-2xl font-semibold text-foreground mb-4">Join Us on Our Journey</h3>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          {APP_NAME} is more than just a platform; it's a community committed to growth and excellence. Start your learning journey with us today and redefine your future.
        </p>
        <Button asChild className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
          <Link href="/dashboard">Explore Courses</Link>
        </Button>
      </Card>

    </Container>
  );
}
