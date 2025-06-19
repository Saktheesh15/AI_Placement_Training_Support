
"use client"; 

import { useRequireAuth } from '@/hooks/use-require-auth';
import { Container } from '@/components/layout/container';
import { ModuleCompletionChart, InterviewPerformanceChart } from '@/components/features/performance-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, CheckCircle, Clock, ClipboardCheck, Trash2, Target, Brain, LucideIcon, Loader2 } from 'lucide-react'; 
import { Separator } from '@/components/ui/separator';
import { useState, useEffect, useCallback } from 'react'; 
import { Button } from "@/components/ui/button"; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, // Added missing import
} from "@/components/ui/alert-dialog"; 
import { useToast } from "@/hooks/use-toast"; 
import { getMyPerformanceData, resetMyPerformanceData } from './actions';
import type { UserPerformanceData, AptitudeEntry, InterviewEntry, SoftSkillEntry } from '@/app/auth/actions';

const iconMap: { [key: string]: LucideIcon } = {
  CheckCircle,
  ClipboardCheck,
  Target,
  Award,
  Clock,
  Brain,
};

interface OverviewStat {
  title: string;
  value: string;
  iconName: keyof typeof iconMap; 
  color: string;
}

const defaultOverviewStats: OverviewStat[] = [
  { title: "Modules Activity", value: "0/3", iconName: "CheckCircle", color: "text-green-500" },
  { title: "Avg. Soft Skill Score", value: "N/A", iconName: "ClipboardCheck", color: "text-indigo-500" },
  { title: "Avg. Aptitude Score", value: "N/A", iconName: "Target", color: "text-orange-500" },
  { title: "Average Interview Score", value: "N/A", iconName: "Award", color: "text-primary" },
  // { title: "Total Learning Hours", value: "0", iconName: "Clock", color: "text-yellow-500" }, // Hard to track accurately
];

const defaultModuleChartData = [
  { name: "Soft Skills", completed: 0 },
  { name: "Aptitude", completed: 0 },
  { name: "Mock Interviews", completed: 0 },
  // { name: "Technical Skills", completed: 0 }, // Harder to quantify
  // { name: "Resume Prep", completed: 0 }, // Harder to quantify
];
const defaultInterviewChartData: { date: string; type: string; score: number; feedbackPoints: number }[] = [];


export default function DashboardPage() {
  const { isLoading: authLoading, authenticatedUser } = useRequireAuth();
  const { toast } = useToast();
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [overviewStats, setOverviewStats] = useState<OverviewStat[]>(defaultOverviewStats);
  const [moduleChartData, setModuleChartData] = useState(defaultModuleChartData);
  const [interviewChartData, setInterviewChartData] = useState(defaultInterviewChartData);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!authenticatedUser) return;
    setIsLoadingData(true);
    const result = await getMyPerformanceData(authenticatedUser);
    if ('error' in result) {
      toast({ variant: "destructive", title: "Error loading dashboard", description: result.error });
      setOverviewStats(defaultOverviewStats);
      setModuleChartData(defaultModuleChartData);
      setInterviewChartData(defaultInterviewChartData);
    } else {
      const perfData = result as UserPerformanceData;
      
      // Calculate Overview Stats
      const newOverviewStats = [...defaultOverviewStats].map(s => ({...s})); // Deep copy

      let modulesActive = 0;
      if (perfData.softSkillsHistory && perfData.softSkillsHistory.length > 0) {
        const totalScore = perfData.softSkillsHistory.reduce((sum, item) => sum + (item.finalScore / (item.totalQuestions * 10)) * 100, 0);
        const avgScore = totalScore / perfData.softSkillsHistory.length;
        const stat = newOverviewStats.find(s => s.title === "Avg. Soft Skill Score");
        if (stat) stat.value = `${avgScore.toFixed(1)}%`;
        modulesActive++;
      }
      if (perfData.aptitudeHistory && perfData.aptitudeHistory.length > 0) {
        const totalScore = perfData.aptitudeHistory.reduce((sum, item) => sum + item.score, 0);
        const avgScore = totalScore / perfData.aptitudeHistory.length;
        const stat = newOverviewStats.find(s => s.title === "Avg. Aptitude Score");
        if (stat) stat.value = `${avgScore.toFixed(1)}/10`;
        modulesActive++;
      }
      if (perfData.interviewHistory && perfData.interviewHistory.length > 0) {
        const totalScore = perfData.interviewHistory.reduce((sum, item) => sum + item.score, 0);
        const avgScore = totalScore / perfData.interviewHistory.length;
        const stat = newOverviewStats.find(s => s.title === "Average Interview Score");
        if (stat) stat.value = `${avgScore.toFixed(1)}/10`;
        modulesActive++;
      }
      const modulesStat = newOverviewStats.find(s => s.title === "Modules Activity");
      if (modulesStat) modulesStat.value = `${modulesActive}/3`;
      
      setOverviewStats(newOverviewStats);

      // Calculate Module Chart Data
      const newModuleChartData = [...defaultModuleChartData].map(m => ({...m}));
      const softSkillsModule = newModuleChartData.find(m => m.name === "Soft Skills");
      if (softSkillsModule && perfData.softSkillsHistory && perfData.softSkillsHistory.length > 0) {
        // Example: 50% if any activity, could be average score % too
        const avgSoftSkillScore = perfData.softSkillsHistory.reduce((sum, item) => sum + (item.finalScore / (item.totalQuestions * 10)) * 100, 0) / perfData.softSkillsHistory.length;
        softSkillsModule.completed = Math.min(100, Math.max(0, parseFloat(avgSoftSkillScore.toFixed(1))));
      }
      const aptitudeModule = newModuleChartData.find(m => m.name === "Aptitude");
      if (aptitudeModule && perfData.aptitudeHistory && perfData.aptitudeHistory.length > 0) {
         const avgAptitudeScore = perfData.aptitudeHistory.reduce((sum, item) => sum + item.score, 0) / perfData.aptitudeHistory.length;
         aptitudeModule.completed = Math.min(100, Math.max(0, parseFloat((avgAptitudeScore * 10).toFixed(1)))); // Score out of 10 to %
      }
      const interviewsModule = newModuleChartData.find(m => m.name === "Mock Interviews");
      if (interviewsModule && perfData.interviewHistory && perfData.interviewHistory.length > 0) {
         const avgInterviewScore = perfData.interviewHistory.reduce((sum, item) => sum + item.score, 0) / perfData.interviewHistory.length;
         interviewsModule.completed = Math.min(100, Math.max(0, parseFloat((avgInterviewScore * 10).toFixed(1)))); // Score out of 10 to %
      }
      setModuleChartData(newModuleChartData);

      // Format Interview Chart Data
      if (perfData.interviewHistory) {
        setInterviewChartData(perfData.interviewHistory.map(item => ({
          date: item.date,
          type: item.type,
          score: item.score,
          feedbackPoints: item.overallFeedback ? item.overallFeedback.split('.').length -1 : 0,
        })));
      } else {
        setInterviewChartData([]);
      }
    }
    setIsLoadingData(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedUser, toast]); // toast is stable

  useEffect(() => {
    if (authenticatedUser) {
      fetchDashboardData();
    } else if (!authLoading) { // If not auth loading and no user, means redirect should have happened or public page.
        setIsLoadingData(false); // Stop loading if no user to fetch for.
    }
  }, [authenticatedUser, authLoading, fetchDashboardData]);


  const handleConfirmReset = async () => {
    if (!authenticatedUser) {
      toast({ variant: "destructive", title: "Error", description: "User not identified." });
      return;
    }
    const result = await resetMyPerformanceData(authenticatedUser);
    if (result.success) {
      toast({
        title: "Statistics Reset",
        description: result.message,
      });
      fetchDashboardData(); // Refetch to show cleared stats
    } else {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: result.message,
      });
    }
    setIsResetDialogOpen(false); 
  };

  if (authLoading || isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  if (!authenticatedUser) return null;

  return (
    <Container className="py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Your Performance Dashboard
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome, {authenticatedUser}! Monitor your growth across soft skills, aptitude, and mock interviews.
        </p>
      </div>
      <Separator className="my-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {overviewStats.map(stat => {
          const IconComponent = iconMap[stat.iconName];
          return (
            <Card key={stat.title} className="shadow-lg rounded-xl hover:shadow-primary/10 transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {IconComponent && <IconComponent className={`h-5 w-5 ${stat.color || 'text-muted-foreground'}`} />}
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground pt-1">Current status</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-8">
        <ModuleCompletionChart data={moduleChartData} />
        <InterviewPerformanceChart data={interviewChartData} />
      </div>

      <Separator className="my-12" />
      
      <Card className="shadow-lg rounded-xl border-destructive/30 bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-destructive flex items-center">
            <Trash2 className="mr-3 h-5 w-5" />
            Danger Zone: Reset Statistics
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            This action will reset all your dashboard statistics stored on the server (Overview Cards, Chart Data, Performance History) to their default values. This process cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto" onClick={() => setIsResetDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Reset My Dashboard Statistics
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently reset your stored performance statistics (aptitude scores, soft skill quiz results, mock interview history) on the server. 
                  This action cannot be undone. Please confirm you wish to proceed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsResetDialogOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmReset} className="bg-destructive hover:bg-destructive/90">
                  Yes, Reset My Statistics
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

       <Card className="mt-12 bg-accent/10 border-accent/20 rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-accent-foreground">Keep Growing!</CardTitle>
          <CardDescription>
            Your journey of skill enhancement is ongoing. Use these insights to plan your next learning steps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Remember to regularly update your resume and practice mock interviews based on your progress. Check your soft skill quiz scores and mock interview feedback to identify areas for targeted improvement.
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
