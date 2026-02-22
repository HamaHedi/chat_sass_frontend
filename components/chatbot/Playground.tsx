'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChatbotWidget } from '@/components/widget/ChatbotWidget';

interface PlaygroundProps {
  chatbotId: string;
}

export function Playground({ chatbotId }: PlaygroundProps) {
  const [mode, setMode] = useState<'chat' | 'rag'>('chat');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Playground</CardTitle>
        <CardDescription>
          Test your chatbot in real-time with both chat and RAG modes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid lg:grid-cols-2 gap-8'>
          {/* Chat Mode */}
          <div className='space-y-4'>
            <div>
              <h3 className='font-semibold text-foreground mb-2'>Chat Mode</h3>
              <p className='text-sm text-muted-foreground mb-4'>
                Test basic conversational chat without document context
              </p>
              <div className='border border-border rounded-lg overflow-hidden h-96'>
                {mode === 'chat' && (
                  <ChatbotWidget
                    chatbotId={chatbotId}
                    mode='chat'
                    onModeChange={setMode}
                  />
                )}
              </div>
            </div>
          </div>

          {/* RAG Mode */}
          <div className='space-y-4'>
            <div>
              <h3 className='font-semibold text-foreground mb-2'>RAG Mode</h3>
              <p className='text-sm text-muted-foreground mb-4'>
                Query your knowledge base with source citations
              </p>
              <div className='border border-border rounded-lg overflow-hidden h-96'>
                {mode === 'rag' && (
                  <ChatbotWidget
                    chatbotId={chatbotId}
                    mode='rag'
                    onModeChange={setMode}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='mt-8 p-4 bg-muted/50 rounded-lg border border-border'>
          <h4 className='font-semibold text-foreground mb-2'>
            About the Modes:
          </h4>
          <ul className='space-y-2 text-sm text-muted-foreground'>
            <li>
              <strong className='text-foreground'>Chat Mode:</strong> Regular
              conversational AI that provides responses based on its training
              data
            </li>
            <li>
              <strong className='text-foreground'>RAG Mode:</strong>{' '}
              Retrieval-Augmented Generation that answers based on your ingested
              documents and provides source citations
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
