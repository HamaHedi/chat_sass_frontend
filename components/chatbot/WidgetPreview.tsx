'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatbotWidget } from '@/components/widget/ChatbotWidget';
import { apiClient } from '@/lib/api';

interface WidgetPreviewProps {
  chatbotId: string;
  widgetToken?: string;
  initialTitle?: string | null;
  initialPrimaryColor?: string | null;
  initialLogoUrl?: string | null;
}

export function WidgetPreview({
  chatbotId,
  widgetToken,
  initialTitle,
  initialPrimaryColor,
  initialLogoUrl,
}: WidgetPreviewProps) {
  const [title, setTitle] = React.useState<string>(initialTitle || '');
  const [primaryColor, setPrimaryColor] = React.useState<string>(
    initialPrimaryColor || '#2563eb',
  );
  const [logoUrl, setLogoUrl] = React.useState<string>(initialLogoUrl || '');
  const [provider, setProvider] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      try {
        const bot = await apiClient.getChatbot(chatbotId);
        setProvider(bot?.provider ?? null);
      } catch (e) {
        console.error(
          '[v0] Failed to load chatbot provider for widget preview:',
          e,
        );
        setProvider(null);
      }
    };

    load();
  }, [chatbotId]);

  const save = async () => {
    setIsSaving(true);
    try {
      await apiClient.updateChatbot(chatbotId, {
        widget_title: title || null,
        widget_primary_color: primaryColor || null,
        widget_logo_url: logoUrl || null,
      });
    } catch (e) {
      console.error('[v0] Failed to save widget config:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Widget Preview</CardTitle>
        <CardDescription>
          Preview your chatbot widget before embedding
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid md:grid-cols-2 gap-8'>
          {/* Preview */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-foreground'>Live Preview</h3>
            <div className='border border-border rounded-lg overflow-hidden h-96'>
              <ChatbotWidget
                chatbotId={chatbotId}
                provider={provider}
                title={title}
                primaryColor={primaryColor}
                logoUrl={logoUrl}
              />
            </div>

            <div className='space-y-3'>
              <h3 className='font-semibold text-foreground'>Customize</h3>

              <div className='space-y-2'>
                <label className='text-sm text-muted-foreground'>Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Chat Assistant'
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm text-muted-foreground'>
                  Primary Color
                </label>
                <div className='flex items-center gap-3'>
                  <Input
                    type='color'
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className='h-10 w-16 p-1'
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder='#2563eb'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-sm text-muted-foreground'>
                  Logo URL
                </label>
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder='https://...'
                />
              </div>

              <Button onClick={save} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Widget Settings'}
              </Button>
            </div>
          </div>

          {/* Embed Code */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-foreground'>Embed Code</h3>
            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground'>
                Copy this code to embed the chatbot on your website:
              </p>
              <div className='bg-muted p-4 rounded-lg overflow-auto max-h-80 font-mono text-xs'>
                <pre className='text-foreground/70 break-words whitespace-pre-wrap'>
                  {`<iframe
  src="${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/widget?token=${widgetToken || 'YOUR_WIDGET_TOKEN'}"
  width="400"
  height="600"
  frameborder="0"
  allow="autoplay"
></iframe>`}
                </pre>
              </div>
              <button
                onClick={() => {
                  const code = `<iframe src="${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/widget?token=${widgetToken || 'YOUR_WIDGET_TOKEN'}" width="400" height="600" frameborder="0" allow="autoplay"></iframe>`;
                  navigator.clipboard.writeText(code);
                }}
                className='text-sm text-primary hover:underline'
              >
                Copy to clipboard
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
