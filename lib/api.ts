import { auth, AuthTokens, User } from './auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

function normalizeTokens(data: any): AuthTokens {
  const tokens = data?.tokens ?? data;
  const access_token =
    tokens?.access_token ?? tokens?.accessToken ?? tokens?.access ?? null;
  const refresh_token =
    tokens?.refresh_token ?? tokens?.refreshToken ?? tokens?.refresh ?? null;

  if (!access_token || !refresh_token) {
    throw new Error('Invalid auth tokens response');
  }

  return { access_token, refresh_token };
}

export interface ApiError {
  message: string;
  status: number;
  data?: any;
}

export interface WidgetConfig {
  name: string;
  widget_title?: string | null;
  widget_primary_color?: string | null;
  widget_logo_url?: string | null;
}

export interface Chatbot {
  id: string;
  name: string;
  provider?: string | null;
  prompt_template?: string | null;
  widget_token?: string;
  widget_title?: string | null;
  widget_primary_color?: string | null;
  widget_logo_url?: string | null;
  created_at?: string;
}

export interface ProvidersResponse {
  providers: string[];
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    // Add authorization token if available
    const token = auth.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        // Handle 401 - token expired, try to refresh
        if (response.status === 401) {
          try {
            const tokens = await this.request<any>('/api/v1/auth/refresh', {
              method: 'POST',
              body: JSON.stringify({ refresh_token: auth.getRefreshToken() }),
            });
            auth.setTokens(normalizeTokens(tokens));
            // Retry the original request
            return this.request<T>(endpoint, options);
          } catch (refreshError) {
            auth.clearAuth();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }

        throw {
          message:
            errorData.message ||
            errorData.detail ||
            `API Error: ${response.statusText}`,
          status: response.status,
          data: errorData,
        } as ApiError;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        'message' in error
      ) {
        throw error as ApiError;
      }
      throw {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      } as ApiError;
    }
  }

  // AUTH ENDPOINTS
  async signup(email: string, password: string, tenant_name?: string) {
    const response = await this.request<any>('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        tenant_name,
      }),
    });

    return {
      user: (response?.user ?? null) as User | null,
      tokens: normalizeTokens(response),
    };
  }

  async login(email: string, password: string) {
    const response = await this.request<any>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    return {
      user: (response?.user ?? null) as User | null,
      tokens: normalizeTokens(response),
    };
  }

  async refresh() {
    const refreshToken = auth.getRefreshToken();
    if (!refreshToken) {
      throw { message: 'No refresh token available', status: 401 } as ApiError;
    }

    const response = await this.request<any>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    return normalizeTokens(response);
  }

  async getMe() {
    return this.request<User>('/api/v1/auth/me');
  }

  // LLM ENDPOINTS
  async getLLMProviders() {
    return this.request<ProvidersResponse>('/api/v1/llm/providers');
  }

  async chatCompletions(
    chatbot_id: string,
    messages: Array<{ role: string; content: string }>,
    provider: string,
    max_tokens?: number,
  ) {
    return this.request<any>('/api/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        chatbot_id,
        provider,
        messages,
        max_tokens,
      }),
    });
  }

  // RAG ENDPOINTS
  async ragQuery(chatbot_id: string, query: string, include_sources?: boolean) {
    return this.request<any>('/api/v1/rag/query', {
      method: 'POST',
      body: JSON.stringify({
        chatbot_id,
        query,
        include_sources: include_sources ?? true,
      }),
    });
  }

  // DATA INGESTION ENDPOINTS
  async ingestText(chatbot_id: string, text: string) {
    return this.request<any>('/api/v1/datasources/ingest/texts/sync', {
      method: 'POST',
      body: JSON.stringify({
        chatbot_id,
        texts: [text],
      }),
    });
  }

  async ingestHTML(chatbot_id: string, html: string) {
    return this.request<any>('/api/v1/datasources/ingest/html/sync', {
      method: 'POST',
      body: JSON.stringify({
        chatbot_id,
        html_content: html,
      }),
    });
  }

  async ingestURL(chatbot_id: string, urls: string[]) {
    return this.request<any>('/api/v1/datasources/ingest/web/sync', {
      method: 'POST',
      body: JSON.stringify({
        chatbot_id,
        urls,
      }),
    });
  }

  async ingestPDF(chatbot_id: string, pdf_url: string) {
    return this.request<any>('/api/v1/datasources/ingest/pdfs/sync', {
      method: 'POST',
      body: JSON.stringify({
        chatbot_id,
        pdf_urls: [pdf_url],
      }),
    });
  }

  // CHATBOT ENDPOINTS
  async createChatbot(name: string, provider: string) {
    return this.request<any>('/api/v1/chatbots', {
      method: 'POST',
      body: JSON.stringify({
        name,
        provider,
      }),
    });
  }

  async getChatbots() {
    return this.request<any>('/api/v1/chatbots');
  }

  async getChatbot(chatbot_id: string) {
    return this.request<any>(`/api/v1/chatbots/${chatbot_id}`);
  }

  async updateChatbot(chatbot_id: string, data: any) {
    return this.request<any>(`/api/v1/chatbots/${chatbot_id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteChatbot(chatbot_id: string) {
    return this.request<any>(`/api/v1/chatbots/${chatbot_id}`, {
      method: 'DELETE',
    });
  }

  // TENANT ENDPOINTS
  async getTenantMe() {
    return this.request<any>('/api/v1/tenants/me');
  }

  async getDataSources(chatbot_id?: string) {
    const url = chatbot_id
      ? `/api/v1/datasources?chatbot_id=${chatbot_id}`
      : '/api/v1/datasources';
    return this.request<any>(url);
  }

  async getWidgetConfig(widget_token: string) {
    const qs = new URLSearchParams({ widget_token }).toString();
    return this.request<WidgetConfig>(`/api/v1/chat/widget/config?${qs}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
