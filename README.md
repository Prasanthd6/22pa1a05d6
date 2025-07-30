# URL Shortener Microservice

A complete HTTP URL Shortener with React frontend, featuring URL shortening, analytics, and comprehensive logging.

## Features

- **URL Shortening**: Create short URLs with optional custom shortcodes
- **Analytics**: Track clicks, timestamps, sources, and locations
- **Logging**: Extensive custom logging middleware (Winston-based)
- **React Frontend**: Material UI interface for URL shortening and statistics
- **Security**: Rate limiting, CORS, and security headers

## Quick Start

### Install Dependencies

```bash
npm install
cd client && npm install && cd ..
```

### Start Backend

```bash
npm start
# Server runs on http://localhost:5000
```

### Start Frontend (new terminal)

```bash
cd client && npm start
# App runs on http://localhost:3000
```

## API Endpoints

- **POST** `/shorturls` - Create short URL
- **GET** `/:shortcode` - Redirect to original URL
- **GET** `/shorturls/:shortcode` - Get URL statistics
- **GET** `/api/urls` - Get all URLs with statistics

## Key Requirements Met

✅ **Custom Logging Middleware**: Winston-based logging, no console.log  
✅ **URL Validation**: Proper URL format and shortcode validation  
✅ **Error Handling**: Appropriate HTTP status codes and messages  
✅ **Material UI**: Frontend uses Material UI exclusively  
✅ **Concurrent URL Shortening**: Up to 5 URLs at once  
✅ **Analytics**: Detailed click tracking and statistics  
✅ **Security**: Rate limiting, CORS, and security headers

## Project Structure

```
├── server.js              # Express server
├── middleware/logger.js    # Custom logging middleware
├── services/urlService.js  # URL shortening logic
├── client/                 # React frontend
│   ├── src/components/
│   │   ├── URLShortener.js # URL shortening page
│   │   └── Statistics.js   # Analytics page
│   └── package.json
└── logs/                   # Application logs
```

## Usage

1. Open `http://localhost:3000`
2. Enter URLs to shorten (up to 5 concurrently)
3. View statistics on the Statistics page
4. Click shortened URLs to test redirects

## Logs

Application logs are in `logs/` directory with daily rotation.
