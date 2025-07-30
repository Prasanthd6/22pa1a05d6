const { nanoid } = require('nanoid');
const moment = require('moment');
const { logInfo, logError, logWarn } = require('../logging_middleware/logger');

const urlStore = new Map();
const shortcodeToUrl = new Map();

class URLService {
  validateURL(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  validateShortcode(shortcode) {
    if (!shortcode || typeof shortcode !== 'string') return false;
    const shortcodeRegex = /^[a-zA-Z0-9]{3,20}$/;
    return shortcodeRegex.test(shortcode);
  }

  generateShortcode() {
    let shortcode;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      shortcode = nanoid(8);
      attempts++;
      if (attempts > maxAttempts) {
        throw new Error('Unable to generate unique shortcode');
      }
    } while (shortcodeToUrl.has(shortcode));

    return shortcode;
  }

  createShortURL(originalURL, validity = 30, customShortcode = null) {
    try {
      logInfo('Creating short URL', { originalURL, validity, customShortcode });

      if (!this.validateURL(originalURL)) {
        throw new Error('Invalid URL format');
      }

      if (validity && (typeof validity !== 'number' || validity <= 0)) {
        throw new Error('Validity must be a positive integer');
      }

      let shortcode;
      if (customShortcode) {
        if (!this.validateShortcode(customShortcode)) {
          throw new Error('Custom shortcode must be alphanumeric and 3-20 characters long');
        }
        if (shortcodeToUrl.has(customShortcode)) {
          throw new Error('Custom shortcode already exists');
        }
        shortcode = customShortcode;
      } else {
        shortcode = this.generateShortcode();
      }

      const createdAt = moment();
      const expiryTime = createdAt.add(validity, 'minutes');

      const urlEntry = {
        id: nanoid(),
        originalURL,
        shortcode,
        createdAt: createdAt.toISOString(),
        expiryTime: expiryTime.toISOString(),
        clicks: [],
        totalClicks: 0
      };

      urlStore.set(urlEntry.id, urlEntry);
      shortcodeToUrl.set(shortcode, urlEntry.id);

      return {
        shortLink: `http://localhost:5000/${shortcode}`,
        expiry: expiryTime.toISOString()
      };

    } catch (error) {
      logError('Error creating short URL', error);
      throw error;
    }
  }

  getURLByShortcode(shortcode) {
    try {
      const urlId = shortcodeToUrl.get(shortcode);
      if (!urlId) return null;

      const urlEntry = urlStore.get(urlId);
      if (!urlEntry) return null;

      if (moment().isAfter(urlEntry.expiryTime)) {
        return null;
      }

      return urlEntry;
    } catch (error) {
      logError('Error getting URL by shortcode', error);
      throw error;
    }
  }

  recordClick(shortcode, referrer = null, ip = null) {
    try {
      const urlId = shortcodeToUrl.get(shortcode);
      if (!urlId) return false;

      const urlEntry = urlStore.get(urlId);
      if (!urlEntry) return false;

      if (moment().isAfter(urlEntry.expiryTime)) {
        return false;
      }

      const clickData = {
        timestamp: moment().toISOString(),
        referrer: referrer || 'direct',
        ip: ip || 'unknown',
        location: 'Unknown'
      };

      urlEntry.clicks.push(clickData);
      urlEntry.totalClicks++;

      return true;
    } catch (error) {
      logError('Error recording click', error);
      return false;
    }
  }

  getURLStatistics(shortcode) {
    try {
      const urlEntry = this.getURLByShortcode(shortcode);
      if (!urlEntry) return null;

      return {
        shortLink: `http://localhost:5000/${shortcode}`,
        originalURL: urlEntry.originalURL,
        createdAt: urlEntry.createdAt,
        expiryTime: urlEntry.expiryTime,
        totalClicks: urlEntry.totalClicks,
        clicks: urlEntry.clicks.map(click => ({
          timestamp: click.timestamp,
          source: click.referrer,
          location: click.location
        }))
      };
    } catch (error) {
      logError('Error getting URL statistics', error);
      throw error;
    }
  }

  getAllURLs() {
    try {
      return Array.from(urlStore.values()).map(urlEntry => ({
        shortLink: `http://localhost:5000/${urlEntry.shortcode}`,
        originalURL: urlEntry.originalURL,
        createdAt: urlEntry.createdAt,
        expiryTime: urlEntry.expiryTime,
        totalClicks: urlEntry.totalClicks,
        clicks: urlEntry.clicks.map(click => ({
          timestamp: click.timestamp,
          source: click.referrer,
          location: click.location
        }))
      }));
    } catch (error) {
      logError('Error getting all URLs', error);
      throw error;
    }
  }
}

module.exports = new URLService(); 