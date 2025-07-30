const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { loggingMiddleware, logInfo, logError } = require('./logging_middleware/logger');
const urlService = require('./backend_test_submission/urlService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(loggingMiddleware);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/shorturls', async (req, res) => {
  try {
    const { url, validity, shortcode } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'URL is required',
        message: 'Please provide a valid URL to shorten'
      });
    }

    const result = await urlService.createShortURL(url, validity, shortcode);

    logInfo('Short URL created successfully', { 
      originalURL: url, 
      shortLink: result.shortLink 
    });

    res.status(201).json(result);

  } catch (error) {
    logError('Error in POST /shorturls', error, { body: req.body });

    if (error.message.includes('Invalid URL format')) {
      return res.status(400).json({
        error: 'Invalid URL format',
        message: 'Please provide a valid URL starting with http:// or https://'
      });
    }

    if (error.message.includes('Validity must be a positive integer')) {
      return res.status(400).json({
        error: 'Invalid validity period',
        message: 'Validity must be a positive integer representing minutes'
      });
    }

    if (error.message.includes('Custom shortcode must be alphanumeric')) {
      return res.status(400).json({
        error: 'Invalid custom shortcode',
        message: 'Custom shortcode must be alphanumeric and 3-20 characters long'
      });
    }

    if (error.message.includes('Custom shortcode already exists')) {
      return res.status(409).json({
        error: 'Shortcode collision',
        message: 'The provided custom shortcode already exists. Please choose a different one.'
      });
    }

    if (error.message.includes('Unable to generate unique shortcode')) {
      return res.status(500).json({
        error: 'Service temporarily unavailable',
        message: 'Unable to generate a unique shortcode. Please try again.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while creating the short URL'
    });
  }
});

app.get('/shorturls/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;

    const statistics = await urlService.getURLStatistics(shortcode);

    if (!statistics) {
      logError('Statistics not found for shortcode', null, { shortcode });
      return res.status(404).json({
        error: 'Short URL not found',
        message: 'The requested short URL does not exist or has expired'
      });
    }

    logInfo('Statistics retrieved successfully', { shortcode });

    res.status(200).json(statistics);

  } catch (error) {
    logError('Error in GET /shorturls/:shortcode', error, { shortcode: req.params.shortcode });
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while retrieving statistics'
    });
  }
});

app.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;

    if (shortcode.includes('.') || shortcode === 'favicon.ico' || shortcode === 'manifest.json') {
      return res.status(404).json({
        error: 'Not found',
        message: 'Static file not found'
      });
    }

    const urlEntry = await urlService.getURLByShortcode(shortcode);

    if (!urlEntry) {
      logError('Shortcode not found or expired', null, { shortcode });
      return res.status(404).json({
        error: 'Short URL not found',
        message: 'The requested short URL does not exist or has expired'
      });
    }

    const referrer = req.get('Referrer') || req.get('referer');
    const ip = req.ip || req.connection.remoteAddress;
    await urlService.recordClick(shortcode, referrer, ip);

    logInfo('Redirecting to original URL', { 
      shortcode, 
      originalURL: urlEntry.originalURL 
    });

    res.redirect(301, urlEntry.originalURL);

  } catch (error) {
    logError('Error in GET /:shortcode', error, { shortcode: req.params.shortcode });
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing the redirect'
    });
  }
});

app.get('/api/urls', async (req, res) => {
  try {
    const urls = await urlService.getAllURLs();

    logInfo('All URLs retrieved', { count: urls.length });

    res.status(200).json(urls);

  } catch (error) {
    logError('Error in GET /api/urls', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while retrieving URLs'
    });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
  });
}

if (process.env.NODE_ENV !== 'production') {
  app.use('*', (req, res) => {
    logError('Route not found', null, { url: req.originalUrl });
    res.status(404).json({
      error: 'Route not found',
      message: 'The requested endpoint does not exist'
    });
  });
}

app.use((error, req, res, next) => {
  logError('Unhandled error', error, { url: req.url });
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

app.listen(PORT, () => {
  logInfo(`URL Shortener Microservice started`, { 
    port: PORT, 
    environment: process.env.NODE_ENV || 'development' 
  });
  console.log(`🚀 URL Shortener Microservice running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  logInfo('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logInfo('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app; 