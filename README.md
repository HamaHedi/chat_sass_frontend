# Chatbot Builder SaaS

A modern SaaS platform for creating, managing, and embedding AI chatbots with support for multiple LLM providers and data ingestion methods.

## Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Chatbot Management**: Create, edit, and delete custom chatbots
- **LLM Provider Selection**: Choose from multiple LLM providers (OpenAI, Anthropic, Cohere, Llama)
- **Multi-Source Data Ingestion**: 
  - Website URLs (web scraping)
  - PDF files (via URL)
  - Raw text content
  - HTML content
- **Widget Preview**: Real-time preview of your chatbot widget
- **Dual Mode Testing**:
  - Chat Mode: Standard conversational AI
  - RAG Mode: Retrieval-Augmented Generation with source citations
- **Embeddable Widget**: Generate embeddable code for external websites
- **Playground**: Test and iterate on your chatbot

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- API backend running (default: http://localhost:8000)

### Installation

1. **Clone and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and set your API base URL
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`: Base URL for the backend API (default: `http://localhost:8000`)

## Architecture

### Frontend Stack
- **Framework**: Next.js 16 with App Router
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **State Management**: React Context + Hooks
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Fetch API with custom wrapper

### Authentication
- JWT-based authentication with localStorage
- Automatic token refresh on 401 responses
- Secure API calls with Bearer token authorization

### Project Structure

```
/app
  /auth
    /login          # Login page
    /signup         # Signup page
  /dashboard        # Protected dashboard
    /chatbot/[id]   # Chatbot editor
  /widget           # Embeddable widget page
  
/components
  /auth             # Auth forms
  /dashboard        # Dashboard components
  /chatbot          # Chatbot editor components
  /widget           # Widget components
  /ui               # shadcn/ui components

/lib
  /api.ts           # API client
  /auth.ts          # Auth utilities
```

## API Integration

The frontend connects to a FastAPI backend with the following endpoints:

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `GET /api/v1/auth/me` - Get current user

### Chatbots
- `GET /api/v1/chatbots` - List chatbots
- `POST /api/v1/chatbots` - Create chatbot
- `GET /api/v1/chatbots/{id}` - Get chatbot details
- `PUT /api/v1/chatbots/{id}` - Update chatbot
- `DELETE /api/v1/chatbots/{id}` - Delete chatbot

### Data Ingestion
- `POST /api/v1/datasources/ingest/texts/sync` - Ingest text
- `POST /api/v1/datasources/ingest/html/sync` - Ingest HTML
- `POST /api/v1/datasources/ingest/web/sync` - Scrape URLs
- `POST /api/v1/datasources/ingest/pdfs/sync` - Ingest PDFs

### Chat & RAG
- `POST /api/v1/chat/completions` - Chat completions
- `POST /api/v1/rag/query` - RAG queries

### Other
- `GET /api/v1/llm/providers` - List available LLM providers
- `GET /api/v1/tenants/me` - Get current tenant

## Using the Embeddable Widget

### Option 1: Iframe Embed
```html
<iframe
  src="https://your-domain.com/widget?id=chatbot_123"
  width="400"
  height="600"
  frameborder="0"
  allow="autoplay"
></iframe>
```

### Option 2: Script Include
```html
<div id="chatbot-container"></div>
<script src="https://your-domain.com/chatbot-widget.js"></script>
<script>
  ChatbotWidget.init({
    id: 'chatbot_123',
    containerId: 'chatbot-container'
  });
</script>
```

### Option 3: Data Attributes
```html
<div 
  data-chatbot-widget
  data-chatbot-id="chatbot_123"
  data-container-id="chatbot-container"
  data-api-url="https://your-domain.com"
></div>
<script src="https://your-domain.com/chatbot-widget.js"></script>
```

## Development

### Running Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
pnpm start
```

### Code Quality
```bash
pnpm lint
```

## Design System

- **Primary Color**: #a583d2 (Purple)
- **Font**: Geist (sans-serif), Geist Mono (monospace)
- **Component Library**: shadcn/ui
- **Spacing**: Tailwind scale (4px base)
- **Responsive**: Mobile-first with md/lg breakpoints

## Performance Optimizations

- Next.js automatic code splitting
- Server-side rendering for dashboard
- Client-side hydration for interactive components
- Image optimization via Next.js
- Tailwind CSS purging

## Security

- JWT token-based authentication
- HTTP-only cookie support (can be added)
- CORS-enabled API calls
- Input validation with Zod
- XSS protection via React
- CSRF protection via fetch API

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## Troubleshooting

### "API Error: Connection refused"
- Ensure your backend API is running
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Verify CORS settings on the backend

### "401 Unauthorized"
- Tokens may have expired. Try logging out and back in
- Check that tokens are stored in localStorage
- Verify Bearer token format in API calls

### "Widget not showing"
- Ensure chatbot ID is valid
- Check iframe/script permissions
- Verify API base URL is correct
- Check browser console for errors

## Contributing

Contributions are welcome! Please follow the existing code style and create a pull request.

## License

MIT
