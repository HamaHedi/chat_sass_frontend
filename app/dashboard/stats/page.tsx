'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, DailyChatUsageStat } from '@/lib/api';
import { StatsChart } from '@/components/stats/StatsChart';
import { StatsSummary } from '@/components/stats/StatsSummary';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';

export default function TenantStatsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DailyChatUsageStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const stats = await apiClient.getTenantDailyStats();
        setData(stats);
      } catch (e) {
        console.error('[v0] Failed to load tenant stats:', e);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'admin') {
      load();
    } else {
      setIsLoading(false);
    }
  }, [user?.role]);

  if (user?.role !== 'admin') {
    return (
      <div className='space-y-4'>
        <div className='text-muted-foreground'>Admin only.</div>
        <Link href='/dashboard'>
          <Button variant='outline'>Back</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <div className='animate-pulse'>Loading stats...</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-foreground'>Tenant Stats</h1>
        <Link href='/dashboard'>
          <Button variant='outline'>Back</Button>
        </Link>
      </div>

      <StatsSummary data={data} />
      <StatsChart data={data} />
    </div>
  );
}
