
"use client";
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Loader2 } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { ResumeFeedbackClient } from '@/components/features/resume-feedback-client';
import { getResumeFeedbackAction } from './actions'; 
import { Separator } from '@/components/ui/separator';
import { FileText } from 'lucide-react';
import Image from 'next/image';

export default function ResumeBuildingPage() {
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
            src="https://placehold.co/1200x400.png?text=Next+Level"
            alt="Resume Building Banner"
            layout="fill"
            objectFit="cover"
            data-ai-hint="resume document analysis"
            priority
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
            <FileText className="h-16 w-16 text-white mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Elevate Your Resume
            </h1>
            <p className="mt-4 text-lg text-slate-200 max-w-2xl">
                Our AI-powered tool analyzes your resume, providing actionable insights to help you stand out for your desired role.
            </p>
        </div>
    </div>
    <Container className="py-12">
      <ResumeFeedbackClient getFeedbackAction={getResumeFeedbackAction} />
    </Container>
    </>
  );
}
