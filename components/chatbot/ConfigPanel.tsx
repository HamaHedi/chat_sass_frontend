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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { apiClient, Chatbot } from '@/lib/api';

const configSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  provider: z.string().min(1, 'Provider is required'),
  prompt_template: z.string().optional(),
});

type ConfigFormValues = z.infer<typeof configSchema>;

interface ConfigPanelProps {
  chatbotId: string;
  initialData?: Chatbot;
}

export function ConfigPanel({ chatbotId, initialData }: ConfigPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [providers, setProviders] = useState<string[]>([]);

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      name: initialData?.name || '',
      provider: initialData?.provider || '',
      prompt_template: initialData?.prompt_template || '',
    },
  });

  React.useEffect(() => {
    const loadProviders = async () => {
      try {
        const data = await apiClient.getChatbotProviders();
        setProviders(data.providers || []);
      } catch (e) {
        console.error('[v0] Failed to load providers:', e);
      }
    };
    loadProviders();
  }, []);

  const onSubmit = async (values: ConfigFormValues) => {
    setIsSaving(true);
    try {
      await apiClient.updateChatbot(chatbotId, {
        name: values.name,
        provider: values.provider,
        prompt_template: values.prompt_template || null,
      });
    } catch (error) {
      console.error('[v0] Error saving config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
        <CardDescription>
          Edit your chatbot's settings and LLM provider
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chatbot Name</FormLabel>
                  <FormControl>
                    <Input placeholder='My Awesome Chatbot' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='provider'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LLM Provider</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a provider' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {providers.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='prompt_template'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Template (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='System prompt / instructions...'
                      {...field}
                      rows={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
