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
  chatbotId?: string;
  widgetToken?: string;
  apiBaseUrl?: string;
  mode?: 'chat' | 'rag';
  title?: string | null;
  primaryColor?: string | null;
  logoUrl?: string | null;
  provider?: string | null;
  onModeChange?: (mode: 'chat' | 'rag') => void;
}

export function ChatbotWidget({
  chatbotId,
  widgetToken,
  apiBaseUrl,
  mode = 'chat',
  title,
  primaryColor,
  logoUrl,
  provider,
  onModeChange,
}: ChatbotWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<'chat' | 'rag'>(mode);
  const [resolvedProvider, setResolvedProvider] = useState<string | null>(
    provider || null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setResolvedProvider(provider || null);
  }, [provider]);

  useEffect(() => {
    const loadProvider = async () => {
      if (widgetToken) return;
      if (!chatbotId) return;
      if (provider) return;

      try {
        const data: any = await apiClient.getChatbot(chatbotId);
        const p =
          data?.provider ??
          data?.llm_provider ??
          data?.llmProvider ??
          data?.llm_provider_name ??
          null;
        setResolvedProvider(p);
      } catch (e) {
        console.error('[v0] Failed to load chatbot provider:', e);
      }
    };

    loadProvider();
  }, [chatbotId, widgetToken, provider]);

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

      if (currentMode === 'rag' && !widgetToken) {
        const id = chatbotId;
        if (!id) {
          throw new Error('RAG mode is not available for anonymous widgets');
        }
        response = await apiClient.ragQuery(id, input, true);
      } else {
        const payloadMessages = [
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          { role: 'user', content: input },
        ];

        if (widgetToken) {
          const baseUrl =
            apiBaseUrl ||
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            'http://localhost:8000';
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);
          const r = await fetch(`${baseUrl}/api/v1/chat/widget/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              widget_token: widgetToken,
              messages: payloadMessages,
            }),
            signal: controller.signal,
          }).finally(() => clearTimeout(timeoutId));
          if (!r.ok) {
            throw new Error(`Widget request failed: ${r.status}`);
          }
          response = await r.json();
        } else {
          const id = chatbotId;
          if (!id) {
            throw new Error(
              'chatbotId is required when widgetToken is not provided',
            );
          }
          response = await apiClient.chatCompletions(
            id,
            payloadMessages,
            resolvedProvider || '',
          );
        }
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

  const widgetTitle = title || 'Chat Assistant';
  const headerStyle = primaryColor
    ? ({ borderColor: primaryColor } as React.CSSProperties)
    : undefined;
  const userBubbleStyle = primaryColor
    ? ({ backgroundColor: primaryColor, color: 'white' } as React.CSSProperties)
    : undefined;

  return (
    <div className='flex flex-col h-full bg-background rounded-lg border border-border'>
      {/* Header */}
      <div className='border-b border-border p-4' style={headerStyle}>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt='Logo' className='h-6 w-6 rounded' />
            ) : null}
            <h3 className='font-semibold text-foreground'>{widgetTitle}</h3>
          </div>
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
              style={message.role === 'user' ? userBubbleStyle : undefined}
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
