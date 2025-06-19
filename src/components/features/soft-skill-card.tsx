import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, FileQuestion, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SoftSkillCardProps {
  title: string;
  description: string;
  imageUrl: string;
  aiHint?: string;
  progress?: number; // 0-100
  isCompleted?: boolean;
  onWatchVideo: () => void;
  onTakeQuiz: () => void;
}

export function SoftSkillCard({
  title,
  description,
  imageUrl,
  aiHint,
  progress = 0,
  isCompleted = false,
  onWatchVideo,
  onTakeQuiz,
}: SoftSkillCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl group">
      <div className="relative w-full h-48">
        <Image
          src={imageUrl}
          alt={title}
          layout="fill"
          objectFit="contain"
          data-ai-hint={aiHint}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        {isCompleted && (
          <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full shadow-lg">
            <CheckCircle className="h-6 w-6" />
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-sm text-muted-foreground mb-4">
          {description}
        </CardDescription>
        {!isCompleted && progress > 0 && (
          <div className="mb-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{progress}% completed</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
        <Button variant="outline" className="flex-1 hover:bg-accent/10" onClick={onWatchVideo}>
          <PlayCircle className="mr-2 h-4 w-4" /> Watch Tutorial
        </Button>
        <Button onClick={onTakeQuiz} className="flex-1">
          <FileQuestion className="mr-2 h-4 w-4" /> Take AI Quiz
        </Button>
      </CardFooter>
    </Card>
  );
}
