
"use client"; 

import { useState } from 'react';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Loader2, BarChart, Brain, MessageCircle, CheckSquare, Lightbulb } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AptitudeTutorModal } from '@/components/features/aptitude-tutor-modal';
import { handleAptitudeTutorInteraction } from './actions'; 
import Image from 'next/image';

export type AptitudeType = 'Quantitative Aptitude' | 'Logical Reasoning' | 'Verbal Ability';

const aptitudeSections = {
  quantitative: {
    title: "Quantitative Aptitude" as AptitudeType,
    icon: BarChart,
    description: "Sharpen your numerical and mathematical skills. Topics include algebra, geometry, arithmetic, data interpretation, and more.",
    topics: [
      "Number Systems & HCF/LCM", "Percentages & Profit/Loss", "Ratio & Proportion",
      "Time, Speed & Distance", "Simple & Compound Interest", "Data Interpretation (Charts, Graphs)",
      "Averages & Mixtures", "Permutations & Combinations", "Probability",
    ],
  },
  logical: {
    title: "Logical Reasoning" as AptitudeType,
    icon: Brain,
    description: "Enhance your ability to think critically and solve problems logically. Covers puzzles, series, analogies, and deductive reasoning.",
    topics: [
      "Coding & Decoding", "Blood Relations", "Direction Sense", "Syllogisms",
      "Seating Arrangements", "Number & Letter Series", "Analogies & Classification",
      "Statement & Assumptions/Conclusions", "Logical Puzzles",
    ],
  },
  verbal: {
    title: "Verbal Ability" as AptitudeType,
    icon: MessageCircle,
    description: "Improve your English language proficiency, including grammar, vocabulary, reading comprehension, and verbal logic.",
    topics: [
      "Reading Comprehension Passages", "Vocabulary (Synonyms, Antonyms, Idioms)",
      "Grammar (Tenses, Articles, Prepositions)", "Sentence Correction & Completion",
      "Para Jumbles & Cloze Tests", "Verbal Analogies", "Critical Reasoning (Verbal)",
    ],
  },
};

const TopicItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-center py-2 px-3 mb-2 bg-secondary/30 rounded-md hover:bg-secondary/60 transition-colors">
    <CheckSquare className="h-5 w-5 mr-3 text-primary" />
    <span className="text-sm text-foreground">{children}</span>
  </li>
);


export default function AptitudePage() {
  const { isLoading: authLoading, authenticatedUser } = useRequireAuth();
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
  const [currentAptitudeType, setCurrentAptitudeType] = useState<AptitudeType | null>(null);
  const [currentInitialTopic, setCurrentInitialTopic] = useState<string | undefined>(undefined);

  const handleStartLearning = (aptitudeType: AptitudeType, initialTopic?: string) => {
    setCurrentAptitudeType(aptitudeType);
    setCurrentInitialTopic(initialTopic);
    setIsTutorModalOpen(true);
  };

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
            src="https://placehold.co/600x450.png?text=Sharpen+Thinking"
            alt="Aptitude Skills Banner"
            layout="fill"
            objectFit="cover"
            data-ai-hint="aptitude test brain"
            priority
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
            <Brain className="h-16 w-16 text-white mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Aptitude Excellence Program
            </h1>
            <p className="mt-4 text-lg text-slate-200 max-w-2xl">
                Master quantitative, logical, and verbal skills with our AI Tutor to ace your assessments.
            </p>
        </div>
      </div>
      <Container className="py-12">
        <Tabs defaultValue="quantitative" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-12 mb-8 shadow-sm">
            {Object.entries(aptitudeSections).map(([key, section]) => (
              <TabsTrigger key={key} value={key} className="py-2.5 text-base sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <section.icon className="mr-2 h-5 w-5 hidden sm:inline-block" /> {section.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(aptitudeSections).map(([key, section]) => (
            <TabsContent key={key} value={key}>
              <Card className="shadow-lg rounded-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center mb-2">
                    <section.icon className="h-8 w-8 mr-3 text-primary" />
                    <CardTitle className="text-2xl font-semibold">{section.title}</CardTitle>
                  </div>
                  <CardDescription className="text-md">{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-medium mb-3 text-foreground">Key Topics Covered:</h3>
                  <ul className="space-y-1 list-none p-0 mb-6">
                    {section.topics.map((topic) => (
                      <TopicItem key={topic}>{topic}</TopicItem>
                    ))}
                  </ul>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto"
                    onClick={() => handleStartLearning(section.title, section.topics[0])}
                  >
                    <Lightbulb className="mr-2 h-5 w-5" /> Start AI Tutoring for {section.title}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </Container>

      {currentAptitudeType && authenticatedUser && (
        <AptitudeTutorModal
          isOpen={isTutorModalOpen}
          onOpenChange={setIsTutorModalOpen}
          aptitudeType={currentAptitudeType}
          initialTopic={currentInitialTopic}
          username={authenticatedUser}
          tutorInteractionAction={handleAptitudeTutorInteraction}
        />
      )}
    </>
  );
}
