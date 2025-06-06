# Shadow Cinema Search

A movie and TV show recommendation application that helps you discover your next favorite watch.

## Features

- Search for movies and TV shows
- Get personalized recommendations
- Separate sections for movies and TV shows
- Clean, modern UI with dark/light theme support

## Setup and Installation

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shadow-cinema-search
```

2. Install dependencies:
```bash
npm install
```

### Environment Configuration

The application uses environment variables to configure API endpoints:

1. **Development**: Uses `.env` file with `VITE_API_BASE_URL=http://localhost:3001`
2. **Production**: Uses `.env.production` file or environment variables

#### Setting up for Production

1. Create a `.env.production` file or set environment variables:
```bash
VITE_API_BASE_URL=https://your-domain.com
```

2. Or if your API is served from the same domain, leave it empty:
```bash
VITE_API_BASE_URL=
```

### Running the Application

#### Development

You have two options to run the application:

**Option 1: Run both server and client together (Recommended)**
```bash
npm run dev:full
```

This will start:
- Proxy server on `http://localhost:3001`
- React development server on `http://localhost:5173`

**Option 2: Run server and client separately**

1. Start the proxy server:
```bash
npm run server
```

2. In a new terminal, start the React development server:
```bash
npm run dev
```

#### Production

1. Build the application:
```bash
npm run build
```

2. Deploy both the built React app and the Express server to your hosting platform.

### Deployment Examples

#### Option 1: Same Domain Deployment (Recommended)
Deploy both frontend and backend to the same domain:
- Frontend: `https://your-domain.com`
- Backend: `https://your-domain.com/api/*`

Set `VITE_API_BASE_URL=` (empty) in production environment.

#### Option 2: Separate Domain Deployment
Deploy frontend and backend to different domains:
- Frontend: `https://your-app.com`
- Backend: `https://api.your-app.com`

Set `VITE_API_BASE_URL=https://api.your-app.com` in production environment.

#### Popular Hosting Platforms

**Vercel/Netlify (Frontend) + Railway/Render (Backend)**
```bash
# Frontend environment variable
VITE_API_BASE_URL=https://your-backend.railway.app
```

**Single Platform (e.g., Railway, Render)**
```bash
# If serving from same domain
VITE_API_BASE_URL=
```

### API Endpoints

The proxy server provides the following endpoints:

- `GET /api/suggestions?term=<search_term>` - Get autocomplete suggestions
- `GET /api/recommendations?url=<movie_url>` - Get movie/TV show recommendations
- `GET /health` - Health check endpoint

### Building for Production

```bash
npm run build
```

### Project Structure

```
├── src/
│   ├── components/ui/     # Reusable UI components
│   ├── pages/            # Page components
│   ├── lib/              # Utility functions
│   └── hooks/            # Custom React hooks
├── server.js             # Express proxy server
├── public/               # Static assets
└── package.json          # Project dependencies and scripts
```

### Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React

### How It Works

1. The React frontend sends requests to the local Express proxy server
2. The proxy server forwards requests to the bestsimilar.com API
3. The proxy handles CORS issues and returns data to the frontend
4. The frontend parses the response and displays movies/TV shows in separate sections

### Development Notes

- The proxy server runs on port 3001
- The React development server runs on port 5173
- The application automatically detects TV shows vs movies using HTML parsing
- Mock data is shown when the API is unavailable