# Shadow Cinema Search - Frontend

A movie and TV show recommendation application frontend that helps you discover your next favorite watch.

## Features

- Search for movies and TV shows
- Get personalized recommendations
- Clickable movie/TV show cards that open detailed information pages
- Detailed movie/TV show pages with cast, crew, ratings, and similar content
- TMDB integration for comprehensive movie and TV show data
- Separate sections for movies and TV shows
- Clean, modern UI with dark/light theme support
- Responsive design optimized for mobile and desktopd

## Setup and Installation

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shadow-cinema-search-frontend
```

2. Install dependencies:
```bash
npm install
```

### Environment Configuration

The application uses environment variables to configure API endpoints and external services:

1. **Development**: Copy `.env.example` to `.env.local` and configure:
```bash
cp .env.example .env.local
```

2. **Required Environment Variables**:
   - `VITE_API_BASE_URL`: Your backend API URL
   - `VITE_TMDB_API_KEY`: Your TMDB API key (get it from https://www.themoviedb.org/settings/api)

3. **Production**: Set the environment variables in your deployment platform:
```bash
VITE_API_BASE_URL=https://your-backend-deployment-url.vercel.app
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

### Running the Application

#### Development

1. Make sure your backend is running (see backend-general directory)
2. Start the React development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### Production

1. Build the application:
```bash
npm run build
```

2. Deploy the built React app to your hosting platform (Vercel, Netlify, etc.)

### Deployment

#### Frontend Deployment Options

**Vercel**
```bash
npm i -g vercel
vercel --prod
```

**Netlify**
```bash
npm run build
# Upload dist/ folder to Netlify
```

**Environment Variables for Production**
Set `VITE_API_BASE_URL` to your deployed backend URL:
```bash
VITE_API_BASE_URL=https://your-backend.vercel.app
```

### Project Structure

```
├── src/
│   ├── components/ui/     # Reusable UI components
│   ├── pages/            # Page components
│   ├── lib/              # Utility functions and API calls
│   └── hooks/            # Custom React hooks
├── public/               # Static assets
├── .env.example          # Environment variables template
├── .env.local            # Local development environment variables
└── package.json          # Project dependencies and scripts
```

### Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React
- **State Management**: React Query for API state management

### API Integration

The frontend communicates with a separate backend service. The API base URL is configured through environment variables:

- **Development**: `http://localhost:3001` (default)
- **Production**: Set via `VITE_API_BASE_URL` environment variable

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Backend

The backend logic has been moved to a separate `backend-general` directory and is designed to be deployed as a serverless function. See the backend-general README for setup instructions.