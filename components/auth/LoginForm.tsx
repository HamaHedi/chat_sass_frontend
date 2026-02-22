'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const { setAuthUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (err: any) => {
    return (
      err?.data?.detail ||
      err?.data?.message ||
      err?.message ||
      'Login failed. Please try again.'
    );
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient.login(values.email, values.password);

      // Store tokens and user info
      auth.setTokens(response.tokens);
      const user = response.user || (await apiClient.getMe());
      auth.setUser(user);
      setAuthUser(user);

      // Redirect to dashboard
      router.replace('/dashboard');
      router.refresh();
    } catch (error: any) {
      setError(getErrorMessage(error));
      console.error('[v0] Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {error && (
              <div className='p-3 bg-destructive/10 text-destructive rounded-md text-sm'>
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='you@example.com'
                      type='email'
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='••••••••'
                      type='password'
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' disabled={isLoading} className='w-full'>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Form>

        <div className='mt-4 text-center text-sm'>
          Don't have an account?{' '}
          <Link
            href='/signup'
            className='text-primary hover:underline font-medium'
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
