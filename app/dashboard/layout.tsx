'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { LogOut, Settings } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-pulse'>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='border-b border-border bg-card'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
          <Link href='/dashboard' className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center'>
              <div className='w-4 h-4 rounded bg-primary'></div>
            </div>
            <span className='font-semibold text-foreground'>
              Chatbot Builder
            </span>
          </Link>

          <div className='flex items-center gap-4'>
            <span className='text-sm text-muted-foreground'>{user?.email}</span>
            <Button
              variant='ghost'
              size='sm'
              onClick={logout}
              className='gap-2'
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 py-8'>{children}</main>
    </div>
  );
}
