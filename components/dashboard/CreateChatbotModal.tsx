'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Chatbot name is required')
    .max(100, 'Name must be less than 100 characters'),
  provider: z.string().min(1, 'Please select an LLM provider'),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateChatbotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatbotCreated: (chatbot: any) => void;
}

export function CreateChatbotModal({
  open,
  onOpenChange,
  onChatbotCreated,
}: CreateChatbotModalProps) {
  const [providers, setProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchProviders();
    }
  }, [open]);

  const fetchProviders = async () => {
    try {
      const data = await apiClient.getChatbotProviders();
      setProviders((data.providers || []).map((p) => ({ id: p, name: p })));
    } catch (err: any) {
      console.error('[v0] Failed to fetch providers:', err);
      // Mock providers for demo
      setProviders([
        { id: 'openai', name: 'OpenAI GPT-4' },
        { id: 'anthropic', name: 'Anthropic Claude' },
        { id: 'cohere', name: 'Cohere' },
        { id: 'llama', name: 'Meta Llama' },
      ]);
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      provider: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const newChatbot = await apiClient.createChatbot({
        name: values.name,
        provider: values.provider,
      });
      onChatbotCreated(newChatbot);
      form.reset();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create chatbot');
      console.error('[v0] Error creating chatbot:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Create New Chatbot</DialogTitle>
          <DialogDescription>
            Set up your AI chatbot with a name and LLM provider
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {error && (
              <div className='p-3 bg-destructive/10 text-destructive rounded-md text-sm'>
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chatbot Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., Customer Support Bot'
                      disabled={isLoading}
                      {...field}
                    />
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
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a provider' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex gap-3 justify-end pt-4'>
              <Button
                type='button'
                variant='outline'
                disabled={isLoading}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Chatbot'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
