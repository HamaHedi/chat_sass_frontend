'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, MessageCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { CreateChatbotModal } from './CreateChatbotModal';
import { apiClient, Chatbot } from '@/lib/api';

export function ChatbotList() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient.getChatbots();
        setChatbots(data);
      } catch (e) {
        console.error('[v0] Failed to load chatbots:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleCreateChatbot = (newChatbot: Chatbot) => {
    setChatbots([...chatbots, newChatbot]);
    setIsModalOpen(false);
  };

  const handleDeleteChatbot = async (id: string) => {
    try {
      await apiClient.deleteChatbot(id);
      setChatbots((prev) => prev.filter((cb) => cb.id !== id));
    } catch (e) {
      console.error('[v0] Failed to delete chatbot:', e);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='animate-pulse'>Loading chatbots...</div>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>My Chatbots</h1>
          <p className='text-muted-foreground mt-2'>
            Create and manage your AI chatbots
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className='gap-2'>
          <Plus size={20} />
          Create Chatbot
        </Button>
      </div>

      {chatbots.length === 0 ? (
        <Card className='border-2 border-dashed'>
          <CardContent className='py-12 flex flex-col items-center justify-center text-center'>
            <MessageCircle
              size={48}
              className='text-muted-foreground/30 mb-4'
            />
            <h3 className='text-lg font-semibold text-foreground mb-2'>
              No chatbots yet
            </h3>
            <p className='text-muted-foreground mb-6 max-w-sm'>
              Create your first AI chatbot to get started with custom
              conversations and data integration.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant='outline'
              className='gap-2'
            >
              <Plus size={18} />
              Create Your First Chatbot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {chatbots.map((chatbot) => (
            <Link key={chatbot.id} href={`/dashboard/chatbot/${chatbot.id}`}>
              <Card className='cursor-pointer transition-all hover:shadow-lg hover:border-primary'>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle>{chatbot.name}</CardTitle>
                      <CardDescription className='mt-1'>
                        {chatbot.provider || ''}
                      </CardDescription>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteChatbot(chatbot.id);
                      }}
                      className='text-muted-foreground hover:text-destructive'
                      aria-label='Delete chatbot'
                      title='Delete chatbot'
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className='text-xs text-muted-foreground'>
                    Created {new Date(chatbot.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateChatbotModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onChatbotCreated={handleCreateChatbot}
      />
    </div>
  );
}
