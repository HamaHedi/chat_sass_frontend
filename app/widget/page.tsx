'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatbotWidget } from '@/components/widget/ChatbotWidget';
import { apiClient, WidgetConfig } from '@/lib/api';

function WidgetContent() {
  const searchParams = useSearchParams();
  const widgetToken = searchParams.get('token');
  const [config, setConfig] = useState<WidgetConfig | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!widgetToken) return;
      try {
        const data = await apiClient.getWidgetConfig(widgetToken);
        setConfig(data);
      } catch (e) {
        console.error('[v0] Failed to load widget config:', e);
      }
    };
    load();
  }, [widgetToken]);

  if (!widgetToken) {
    return (
      <div className='flex items-center justify-center h-screen bg-background'>
        <div className='text-center'>
          <p className='text-muted-foreground'>Invalid widget token</p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-screen flex flex-col bg-background'>
      <ChatbotWidget
        widgetToken={widgetToken}
        title={config?.widget_title || config?.name}
        primaryColor={config?.widget_primary_color}
        logoUrl={config?.widget_logo_url}
      />
    </div>
  );
}

export default function WidgetPage() {
  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center h-screen'>
          Loading...
        </div>
      }
    >
      <WidgetContent />
    </Suspense>
  );
}
