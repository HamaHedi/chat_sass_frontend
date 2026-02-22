'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface DataSource {
  id: string;
  type: 'url' | 'pdf' | 'text' | 'html';
  content: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

interface DataSourcePanelProps {
  chatbotId: string;
}

export function DataSourcePanel({ chatbotId }: DataSourcePanelProps) {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [htmlInput, setHtmlInput] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addUrlSource = async () => {
    if (!urlInput.trim()) return;

    const urls = urlInput.split('\n').filter((u) => u.trim());
    const newSources = urls.map((url) => ({
      id: `url_${Date.now()}_${Math.random()}`,
      type: 'url' as const,
      content: url,
      status: 'pending' as const,
    }));

    setDataSources([...dataSources, ...newSources]);
    setIsLoading(true);

    try {
      await apiClient.ingestURL(chatbotId, urls);
      // Update status to success
      setDataSources((prev) =>
        prev.map((ds) =>
          newSources.some((ns) => ns.id === ds.id)
            ? { ...ds, status: 'success' as const }
            : ds,
        ),
      );
      setUrlInput('');
    } catch (error: any) {
      console.error('[v0] Error ingesting URLs:', error);
      setDataSources((prev) =>
        prev.map((ds) =>
          newSources.some((ns) => ns.id === ds.id)
            ? { ...ds, status: 'error' as const, error: error.message }
            : ds,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addTextSource = async () => {
    if (!textInput.trim()) return;

    const newSource: DataSource = {
      id: `text_${Date.now()}`,
      type: 'text',
      content: textInput,
      status: 'pending',
    };

    setDataSources([...dataSources, newSource]);
    setIsLoading(true);

    try {
      await apiClient.ingestText(chatbotId, textInput);
      setDataSources((prev) =>
        prev.map((ds) =>
          ds.id === newSource.id ? { ...ds, status: 'success' } : ds,
        ),
      );
      setTextInput('');
    } catch (error: any) {
      console.error('[v0] Error ingesting text:', error);
      setDataSources((prev) =>
        prev.map((ds) =>
          ds.id === newSource.id
            ? { ...ds, status: 'error', error: error.message }
            : ds,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addHtmlSource = async () => {
    if (!htmlInput.trim()) return;

    const newSource: DataSource = {
      id: `html_${Date.now()}`,
      type: 'html',
      content: htmlInput.substring(0, 100) + '...',
      status: 'pending',
    };

    setDataSources([...dataSources, newSource]);
    setIsLoading(true);

    try {
      await apiClient.ingestHTML(chatbotId, htmlInput);
      setDataSources((prev) =>
        prev.map((ds) =>
          ds.id === newSource.id ? { ...ds, status: 'success' } : ds,
        ),
      );
      setHtmlInput('');
    } catch (error: any) {
      console.error('[v0] Error ingesting HTML:', error);
      setDataSources((prev) =>
        prev.map((ds) =>
          ds.id === newSource.id
            ? { ...ds, status: 'error', error: error.message }
            : ds,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addPdfSource = async () => {
    if (!pdfUrl.trim()) return;

    const newSource: DataSource = {
      id: `pdf_${Date.now()}`,
      type: 'pdf',
      content: pdfUrl,
      status: 'pending',
    };

    setDataSources([...dataSources, newSource]);
    setIsLoading(true);

    try {
      await apiClient.ingestPDF(chatbotId, pdfUrl);
      setDataSources((prev) =>
        prev.map((ds) =>
          ds.id === newSource.id ? { ...ds, status: 'success' } : ds,
        ),
      );
      setPdfUrl('');
    } catch (error: any) {
      console.error('[v0] Error ingesting PDF:', error);
      setDataSources((prev) =>
        prev.map((ds) =>
          ds.id === newSource.id
            ? { ...ds, status: 'error', error: error.message }
            : ds,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: DataSource['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className='w-4 h-4 animate-spin text-primary' />;
      case 'success':
        return <CheckCircle className='w-4 h-4 text-green-600' />;
      case 'error':
        return <AlertCircle className='w-4 h-4 text-destructive' />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Sources</CardTitle>
        <CardDescription>
          Add URLs, PDFs, text, or HTML content to train your chatbot
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='url' className='w-full'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='url'>URLs</TabsTrigger>
            <TabsTrigger value='text'>Text</TabsTrigger>
            <TabsTrigger value='html'>HTML</TabsTrigger>
            <TabsTrigger value='pdf'>PDF</TabsTrigger>
          </TabsList>

          <TabsContent value='url' className='space-y-4 mt-4'>
            <div>
              <label className='text-sm font-medium text-foreground mb-2 block'>
                Website URLs
              </label>
              <Textarea
                placeholder='https://example.com&#10;https://another-site.com'
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                rows={4}
                disabled={isLoading}
              />
              <p className='text-xs text-muted-foreground mt-2'>
                Enter one URL per line
              </p>
            </div>
            <Button
              onClick={addUrlSource}
              disabled={!urlInput.trim() || isLoading}
              className='gap-2'
            >
              {isLoading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Plus className='w-4 h-4' />
              )}
              Add URLs
            </Button>
          </TabsContent>

          <TabsContent value='text' className='space-y-4 mt-4'>
            <div>
              <label className='text-sm font-medium text-foreground mb-2 block'>
                Raw Text Content
              </label>
              <Textarea
                placeholder='Paste your text content here...'
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={6}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={addTextSource}
              disabled={!textInput.trim() || isLoading}
              className='gap-2'
            >
              {isLoading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Plus className='w-4 h-4' />
              )}
              Add Text
            </Button>
          </TabsContent>

          <TabsContent value='html' className='space-y-4 mt-4'>
            <div>
              <label className='text-sm font-medium text-foreground mb-2 block'>
                HTML Content
              </label>
              <Textarea
                placeholder='Paste your HTML content here...'
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                rows={6}
                disabled={isLoading}
                className='font-mono text-sm'
              />
            </div>
            <Button
              onClick={addHtmlSource}
              disabled={!htmlInput.trim() || isLoading}
              className='gap-2'
            >
              {isLoading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Plus className='w-4 h-4' />
              )}
              Add HTML
            </Button>
          </TabsContent>

          <TabsContent value='pdf' className='space-y-4 mt-4'>
            <div>
              <label className='text-sm font-medium text-foreground mb-2 block'>
                PDF URL
              </label>
              <Input
                placeholder='https://example.com/document.pdf'
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                disabled={isLoading}
              />
              <p className='text-xs text-muted-foreground mt-2'>
                Provide a direct URL to a PDF file
              </p>
            </div>
            <Button
              onClick={addPdfSource}
              disabled={!pdfUrl.trim() || isLoading}
              className='gap-2'
            >
              {isLoading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Plus className='w-4 h-4' />
              )}
              Add PDF
            </Button>
          </TabsContent>
        </Tabs>

        {dataSources.length > 0 && (
          <div className='mt-8 space-y-2'>
            <h3 className='font-semibold text-foreground'>Ingested Sources</h3>
            <div className='space-y-2'>
              {dataSources.map((source) => (
                <div
                  key={source.id}
                  className='flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50'
                >
                  <div className='mt-0.5'>{getStatusIcon(source.status)}</div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-foreground capitalize'>
                      {source.type}
                    </p>
                    <p className='text-xs text-muted-foreground truncate'>
                      {source.content}
                    </p>
                    {source.error && (
                      <p className='text-xs text-destructive mt-1'>
                        {source.error}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
