
"use client";

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlayCircle } from 'lucide-react';
import Image from 'next/image';

interface VideoTutorialModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  softSkillTopic: string;
}

export function VideoTutorialModal({
  isOpen,
  onOpenChange,
  softSkillTopic,
}: VideoTutorialModalProps) {
  
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <PlayCircle className="mr-2 h-6 w-6 text-primary" />
            Tutorial: AI Quiz on {softSkillTopic}
          </DialogTitle>
          <DialogDescription>
            Learn how to interact with our AI Quiz chatbot for {softSkillTopic.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            <Image
              src="https://picsum.photos/560/315" // Standard 16:9 placeholder
              alt={`Tutorial video placeholder for ${softSkillTopic}`}
              layout="fill"
              objectFit="cover"
              data-ai-hint="play button"
            />
             <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <PlayCircle className="h-16 w-16 text-white/80" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            This video (placeholder) explains how to use our AI Quiz feature for &quot;{softSkillTopic}&quot;. 
            You&apos;ll learn how to answer questions, understand the AI&apos;s feedback, and make the most of this interactive learning experience.
          </p>
           <p className="text-sm text-muted-foreground">
            Simply type your answers in the chat, and our AI will guide you through the quiz!
          </p>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleClose}>
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
