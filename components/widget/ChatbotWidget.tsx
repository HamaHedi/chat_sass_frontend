'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  timestamp: Date;
}

interface ChatbotWidgetProps {
  chatbotId: string;
  apiBaseUrl?: string;
  mode?: 'chat' | 'rag';
  onModeChange?: (mode: 'chat' | 'rag') => void;
}

export function ChatbotWidget({
  chatbotId,
  apiBaseUrl,
  mode = 'chat',
  onModeChange,
}: ChatbotWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm here to help. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<'chat' | 'rag'>(mode);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response;

      if (currentMode === 'rag') {
        response = await apiClient.ragQuery(chatbotId, input, true);
      } else {
        response = await apiClient.chatCompletions(
          [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content: input },
          ],
          null,
        );
      }

      const assistantMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content:
          response?.text ||
          response?.answer ||
          response?.message ||
          'I encountered an issue. Please try again.',
        sources: response?.sources || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('[v0] Error sending message:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (newMode: 'chat' | 'rag') => {
    setCurrentMode(newMode);
    onModeChange?.(newMode);
  };

  return (
    <div className='flex flex-col h-full bg-background rounded-lg border border-border'>
      {/* Header */}
      <div className='border-b border-border p-4'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='font-semibold text-foreground'>Chat Assistant</h3>
          <div className='flex gap-1 bg-muted p-1 rounded'>
            <Button
              size='sm'
              variant={currentMode === 'chat' ? 'default' : 'ghost'}
              onClick={() => handleModeChange('chat')}
              className='text-xs'
            >
              Chat
            </Button>
            <Button
              size='sm'
              variant={currentMode === 'rag' ? 'default' : 'ghost'}
              onClick={() => handleModeChange('rag')}
              className='text-xs'
            >
              RAG
            </Button>
          </div>
        </div>
        <p className='text-xs text-muted-foreground'>
          {currentMode === 'rag' ? 'Query your knowledge base' : 'Chat with AI'}
        </p>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-muted text-muted-foreground rounded-bl-none'
              }`}
            >
              <p className='text-sm break-words'>{message.content}</p>
              {message.sources && message.sources.length > 0 && (
                <div className='mt-2 pt-2 border-t border-current/20 text-xs space-y-1'>
                  <p className='font-semibold'>Sources:</p>
                  {message.sources.map((source, i) => (
                    <p key={i} className='truncate'>
                      {source}
                    </p>
                  ))}
                </div>
              )}
              <p className='text-xs mt-1 opacity-70'>
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className='flex justify-start'>
            <div className='bg-muted text-muted-foreground px-4 py-2 rounded-lg rounded-bl-none'>
              <Loader2 className='w-4 h-4 animate-spin' />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className='border-t border-border p-4 space-y-2'>
        <div className='flex gap-2'>
          <Input
            placeholder='Type your message...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
            className='flex-1'
          />
          <Button
            size='icon'
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className='gap-2'
          >
            {isLoading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Send className='w-4 h-4' />
            )}
          </Button>
        </div>
        <p className='text-xs text-muted-foreground'>Press Enter to send</p>
      </div>
    </div>
  );
}
