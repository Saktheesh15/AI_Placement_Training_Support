import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface FeatureCardProps {
  title: string;
  description: string;
  link: string;
  linkText?: string;
  Icon?: LucideIcon;
  imageUrl?: string;
  imageAlt?: string;
  aiHint?: string;
}

export function FeatureCard({ title, description, link, linkText = "Learn More", Icon, imageUrl, imageAlt = "Feature image", aiHint }: FeatureCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
      {imageUrl && (
        <div className="relative w-full h-48">
          <Image 
            src={imageUrl} 
            alt={imageAlt} 
            layout="fill" 
            objectFit="contain"
            data-ai-hint={aiHint}
          />
        </div>
      )}
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        {Icon && <Icon className="h-8 w-8 text-primary" />}
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-sm text-muted-foreground mb-4">
          {description}
        </CardDescription>
      </CardContent>
      <div className="p-6 pt-0">
        <Button asChild variant="outline" className="w-full hover:bg-accent/10">
          <Link href={link}>
            {linkText} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
