'use client';

import React, { useEffect, useState } from 'react';
import { apiClient, DailyChatUsageStat } from '@/lib/api';
import { StatsChart } from '@/components/stats/StatsChart';
import { StatsSummary } from '@/components/stats/StatsSummary';

interface StatsPanelProps {
  chatbotId: string;
}

export function StatsPanel({ chatbotId }: StatsPanelProps) {
  const [data, setData] = useState<DailyChatUsageStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const stats = await apiClient.getChatbotDailyStats(chatbotId);
        setData(stats);
      } catch (e) {
        console.error('[v0] Failed to load chatbot stats:', e);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [chatbotId]);

  if (isLoading) {
    return <div className='animate-pulse'>Loading stats...</div>;
  }

  return (
    <div className='space-y-6'>
      <StatsSummary data={data} />
      <StatsChart data={data} />
    </div>
  );
}
