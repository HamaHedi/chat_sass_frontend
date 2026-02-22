import { auth, AuthTokens, User } from './auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface ApiError {
  message: string;
  status: number;
  data?: any;
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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
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
            auth.setTokens(tokens);
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
      if (error instanceof Error && 'status' in error) {
        throw error;
      }
      throw {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      } as ApiError;
    }
  }

  // AUTH ENDPOINTS
  async signup(email: string, password: string, tenant_name?: string) {
    const response = await this.request<{ user: User; tokens: AuthTokens }>(
      '/api/v1/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          tenant_name,
        }),
      },
    );
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ user: User; tokens: AuthTokens }>(
      '/api/v1/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
    );
    return response;
  }

  async refresh() {
    const refreshToken = auth.getRefreshToken();
    if (!refreshToken) {
      throw { message: 'No refresh token available', status: 401 } as ApiError;
    }

    const response = await this.request<AuthTokens>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    return response;
  }

  async getMe() {
    return this.request<User>('/api/v1/auth/me');
  }

  // LLM ENDPOINTS
  async getLLMProviders() {
    return this.request<any>('/api/v1/llm/providers');
  }

  async chatCompletions(
    chatbot_id: string,
    messages: Array<{ role: string; content: string }>,
    max_tokens?: number,
  ) {
    return this.request<any>('/api/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        chatbot_id,
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
  async createChatbot(name: string, llm_provider: string) {
    return this.request<any>('/api/v1/chatbots', {
      method: 'POST',
      body: JSON.stringify({
        name,
        llm_provider,
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
      method: 'PUT',
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
}

export const apiClient = new ApiClient(API_BASE_URL);
