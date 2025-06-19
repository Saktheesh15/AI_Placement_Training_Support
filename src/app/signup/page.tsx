
"use client";

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/layout/container';
import { signupUser, type Credentials } from '@/app/auth/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

type SignupFormInputs = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // If user is already logged in, redirect them from signup page
    if (localStorage.getItem('loggedInUser')) {
      router.replace('/dashboard');
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit: SubmitHandler<SignupFormInputs> = async (data) => {
    setError(null);
    startTransition(async () => {
      const result = await signupUser(data);
      if (result.success) {
        toast({
          title: 'Signup Successful!',
          description: 'You can now log in with your new account.',
        });
        router.push('/login');
      } else {
        setError(result.message);
        toast({
          variant: 'destructive',
          title: 'Signup Failed',
          description: result.message,
        });
      }
    });
  };

  return (
    <Container className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <UserPlus className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
          <CardDescription>Join Elévix AI Training to boost your skills.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Signup Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="choose_a_username"
                {...register('username')}
                 aria-invalid={errors.username ? "true" : "false"}
              />
              {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="create_a_strong_password"
                {...register('password')}
                aria-invalid={errors.password ? "true" : "false"}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 text-sm">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
          <p className="text-xs text-muted-foreground text-center mt-4 px-4">
            Note: This is a local-only signup for demonstration. User data is stored in a local JSON file and passwords are not securely hashed. Do not use real credentials.
          </p>
        </CardFooter>
      </Card>
    </Container>
  );
}
