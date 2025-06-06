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

### Running the Application

You have two options to run the application:

#### Option 1: Run both server and client together (Recommended)
```bash
npm run dev:full
```

This will start:
- Proxy server on `http://localhost:3001`
- React development server on `http://localhost:5173`

#### Option 2: Run server and client separately

1. Start the proxy server:
```bash
npm run server
```

2. In a new terminal, start the React development server:
```bash
npm run dev
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