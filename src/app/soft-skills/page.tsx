
"use client"; 

import { useState } from 'react';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Loader2, Users } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { SoftSkillCard } from '@/components/features/soft-skill-card';
import { Separator } from '@/components/ui/separator';
import { SoftSkillQuizModal } from '@/components/features/soft-skill-quiz-modal';
import { VideoTutorialModal } from '@/components/features/video-tutorial-modal';
import { handleGetQuizResponse } from './actions'; 
import Image from 'next/image';

const softSkillsData = [
  {
    id: "communication",
    title: "Effective Communication",
    description: "Master verbal, non-verbal, and written communication techniques for professional success. Learn active listening and clear articulation.",
    imageUrl: "https://www.thethrive.in/wp-content/uploads/2022/10/Effective-Communication.png",
    aiHint: "people talking discussion",
  },
  {
    id: "teamwork",
    title: "Teamwork & Collaboration",
    description: "Learn to work effectively in diverse teams, foster collaboration, and contribute to shared goals. Understand team dynamics.",
    imageUrl: "https://img.industryweek.com/files/base/ebm/industryweek/image/2020/11/teamwork.5fac15b5571ee.png?auto=format,compress&fit=fill&fill=blur&w=1200&h=630",
    aiHint: "team huddle office",
  },
  {
    id: "leadership",
    title: "Leadership Skills",
    description: "Develop your leadership potential by understanding different leadership styles, motivating teams, and making impactful decisions.",
    imageUrl: "https://media.licdn.com/dms/image/v2/D5612AQEW0AYqXuJ5dQ/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1680496426858?e=2147483647&v=beta&t=ZdnSDLoGqtt6mRPgVleZ4Mx7vLe5cI3anrdjww6jZvI",
    aiHint: "leader guiding team",
  },
  {
    id: "problem-solving",
    title: "Problem Solving",
    description: "Enhance your analytical and critical thinking abilities to identify, analyze, and solve complex problems efficiently.",
    imageUrl: "https://www.workitdaily.com/media-library/problem-solving-concept-technique.jpg?id=32029977&width=1200&height=800&quality=85&coordinates=0%2C18%2C0%2C18",
    aiHint: "brainstorming ideas whiteboard",
  },
  {
    id: "time-management",
    title: "Time Management",
    description: "Learn to prioritize tasks, manage deadlines, and optimize your productivity with effective time management strategies.",
    imageUrl: "https://thumbs.dreamstime.com/b/word-cloud-time-management-related-items-33212637.jpg",
    aiHint: "calendar schedule planning",
  },
  {
    id: "adaptability",
    title: "Adaptability & Flexibility",
    description: "Cultivate resilience and the ability to adapt to changing environments, new technologies, and evolving job roles.",
    imageUrl: "https://www.ravepubs.com/wp-content/uploads/2022/08/adaptability-1.jpg",
    aiHint: "person adapting change",
  },
];


export default function SoftSkillsPage() {
  const { isLoading: authLoading, authenticatedUser } = useRequireAuth();
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentSkillTopic, setCurrentSkillTopic] = useState('');

  const handleTakeQuiz = (topic: string) => {
    setCurrentSkillTopic(topic);
    setIsQuizModalOpen(true);
  };

  const handleWatchVideo = (topic: string) => {
    setCurrentSkillTopic(topic);
    setIsVideoModalOpen(true);
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
            src="https://placehold.co/640x450.png?text=Soft+Skills"
            alt="Soft Skills Banner"
            layout="fill"
            objectFit="cover"
            data-ai-hint="professionals collaborating presentation"
            priority
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
            <Users className="h-16 w-16 text-white mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Master Your Soft Skills
            </h1>
            <p className="mt-4 text-lg text-slate-200 max-w-2xl">
                Enhance your interpersonal abilities with our engaging and practical training modules.
            </p>
        </div>
    </div>
      <Container className="py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {softSkillsData.map((skill) => (
            <SoftSkillCard
              key={skill.id}
              title={skill.title}
              description={skill.description}
              imageUrl={skill.imageUrl}
              aiHint={skill.aiHint}
              onTakeQuiz={() => handleTakeQuiz(skill.title)}
              onWatchVideo={() => handleWatchVideo(skill.title)}
            />
          ))}
        </div>
      </Container>

      {isQuizModalOpen && currentSkillTopic && authenticatedUser && (
        <SoftSkillQuizModal
          isOpen={isQuizModalOpen}
          onOpenChange={setIsQuizModalOpen}
          softSkillTopic={currentSkillTopic}
          username={authenticatedUser}
          getQuizResponseAction={handleGetQuizResponse}
        />
      )}

      {isVideoModalOpen && currentSkillTopic && (
        <VideoTutorialModal
          isOpen={isVideoModalOpen}
          onOpenChange={setIsVideoModalOpen}
          softSkillTopic={currentSkillTopic}
        />
      )}
    </>
  );
}
