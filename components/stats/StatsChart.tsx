'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import { DailyChatUsageStat } from '@/lib/api';

interface StatsChartProps {
  data: DailyChatUsageStat[];
}

export function StatsChart({ data }: StatsChartProps) {
  return (
    <div className='w-full h-80'>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='date' />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type='monotone' dataKey='requests' stroke='hsl(var(--primary))' />
          <Line type='monotone' dataKey='total_tokens' stroke='hsl(var(--muted-foreground))' />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
