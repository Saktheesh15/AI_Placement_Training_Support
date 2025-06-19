"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart" 

interface ModuleDataPoint {
  name: string;
  completed: number;
}

interface InterviewDataPoint {
  date: string;
  type: string;
  score: number;
  feedbackPoints: number;
}

interface ModuleCompletionChartProps {
  data: ModuleDataPoint[];
}

interface InterviewPerformanceChartProps {
  data: InterviewDataPoint[];
}

const moduleChartConfig = {
  completed: {
    label: "Completed (%)",
    color: "hsl(var(--chart-1))", 
  },
  target: { 
    label: "Target (%)",
    color: "hsl(var(--muted))",
  },
} satisfies ChartConfig

const interviewChartConfig = {
  score: {
    label: "Score (out of 10)",
    color: "hsl(var(--chart-2))",
  },
  feedbackPoints: { // Added for potential future use in tooltip or combined chart
    label: "Feedback Points",
    color: "hsl(var(--chart-4))",
  }
} satisfies ChartConfig


export function ModuleCompletionChart({ data }: ModuleCompletionChartProps) {
  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle>Module Completion Progress</CardTitle>
        <CardDescription>Overview of your progress across different training modules, including interactive soft skill quizzes.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={moduleChartConfig} className="h-[300px] w-full">
          {!data || data.length === 0 ? (
             <div className="flex items-center justify-center h-full text-muted-foreground">
              No module data available.
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ right: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <YAxis dataKey="name" type="category" width={100} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent hideLabel />} />
              <Legend />
              <Bar dataKey="completed" fill="var(--color-completed)" radius={4} background={{ fill: 'hsl(var(--muted))', radius: 4 }} />
            </BarChart>
          </ResponsiveContainer>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}


export function InterviewPerformanceChart({ data }: InterviewPerformanceChartProps) {
  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle>Mock Interview Scores</CardTitle>
        <CardDescription>Track your scores from recent mock interviews.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={interviewChartConfig} className="h-[300px] w-full">
          {!data || data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No interview data available.
            </div>
          ) : (
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    try {
                      return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    } catch (e) {
                      return value; 
                    }
                  }} 
                />
                <YAxis domain={[0,10]}/>
                <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                <Legend />
                <Bar dataKey="score" fill="var(--color-score)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
