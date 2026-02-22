'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfigPanel } from '@/components/chatbot/ConfigPanel';
import { DataSourcePanel } from '@/components/chatbot/DataSourcePanel';
import { WidgetPreview } from '@/components/chatbot/WidgetPreview';
import { Playground } from '@/components/chatbot/Playground';
import { StatsPanel } from '@/components/chatbot/StatsPanel';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { apiClient, Chatbot } from '@/lib/api';

export default function ChatbotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await apiClient.getChatbot(chatbotId);
        setChatbot(data);
      } catch (e) {
        console.error('[v0] Failed to load chatbot:', e);
        setChatbot(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [chatbotId]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='animate-pulse'>Loading chatbot...</div>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        <p className='text-muted-foreground mb-4'>Chatbot not found</p>
        <Link href='/dashboard'>
          <Button variant='outline'>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Link href='/dashboard'>
          <Button variant='ghost' size='sm' className='gap-2'>
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>{chatbot.name}</h1>
          <p className='text-muted-foreground mt-1'>{chatbot.provider || ''}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='config' className='w-full'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='config'>Configuration</TabsTrigger>
          <TabsTrigger value='data'>Data Sources</TabsTrigger>
          <TabsTrigger value='preview'>Widget Preview</TabsTrigger>
          <TabsTrigger value='playground'>Playground</TabsTrigger>
          <TabsTrigger value='stats'>Stats</TabsTrigger>
        </TabsList>

        <TabsContent value='config' className='space-y-4 mt-6'>
          <ConfigPanel chatbotId={chatbotId} initialData={chatbot} />
        </TabsContent>

        <TabsContent value='data' className='space-y-4 mt-6'>
          <DataSourcePanel chatbotId={chatbotId} />
        </TabsContent>

        <TabsContent value='preview' className='mt-6'>
          <WidgetPreview
            chatbotId={chatbotId}
            widgetToken={chatbot.widget_token}
            initialTitle={chatbot.widget_title}
            initialPrimaryColor={chatbot.widget_primary_color}
            initialLogoUrl={chatbot.widget_logo_url}
          />
        </TabsContent>

        <TabsContent value='playground' className='mt-6'>
          <Playground chatbotId={chatbotId} />
        </TabsContent>

        <TabsContent value='stats' className='mt-6'>
          <StatsPanel chatbotId={chatbotId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
