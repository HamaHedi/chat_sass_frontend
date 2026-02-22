'use client';

import React, { useMemo } from 'react';
import { DailyChatUsageStat } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsSummaryProps {
  data: DailyChatUsageStat[];
}

export function StatsSummary({ data }: StatsSummaryProps) {
  const summary = useMemo(() => {
    const totals = data.reduce(
      (acc, d) => {
        acc.requests += d.requests;
        acc.total_tokens += d.total_tokens;
        return acc;
      },
      { requests: 0, total_tokens: 0 },
    );

    const avg = totals.requests > 0 ? Math.round(totals.total_tokens / totals.requests) : 0;

    return {
      ...totals,
      avg_tokens_per_request: avg,
    };
  }, [data]);

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      <Card>
        <CardHeader>
          <CardTitle>Total Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold'>{summary.requests}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold'>{summary.total_tokens}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Avg Tokens / Request</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold'>{summary.avg_tokens_per_request}</div>
        </CardContent>
      </Card>
    </div>
  );
}
