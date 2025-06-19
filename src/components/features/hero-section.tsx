
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle } from 'lucide-react';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Unlock Your Potential with <span className="text-primary">Elévix AI</span>
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            Master essential skills with our AI-powered training platform. Get personalized feedback, interactive modules, and expert guidance to accelerate your career growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button asChild size="lg" className="shadow-lg hover:shadow-primary/30 transition-shadow">
              <Link href="/#features">
                Explore Features <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="shadow-lg hover:shadow-accent/30 transition-shadow">
              <Link href="/about-us">
                Learn More <PlayCircle className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative aspect-video rounded-xl shadow-2xl overflow-hidden">
           <Image 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6Cy_11brTSAm4gNbjzVJGhDR_0PrM3e02oA&s" 
            alt="AI Training Platform" 
            layout="fill"
            objectFit="contain"
            className="transform hover:scale-105 transition-transform duration-500"
            data-ai-hint="futuristic learning"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
      </div>
    </section>
  );
}
