import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid, Alert, Snackbar, IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import axios from 'axios';

const URLShortener = () => {
  const [urls, setUrls] = useState([{ id: 1, url: '', validity: '', shortcode: '', loading: false, result: null, error: null }]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const validateURL = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const addUrl = () => {
    if (urls.length >= 5) {
      setSnackbar({ open: true, message: 'Maximum 5 URLs allowed', severity: 'warning' });
      return;
    }
    const newId = Math.max(...urls.map(u => u.id)) + 1;
    setUrls([...urls, { id: newId, url: '', validity: '', shortcode: '', loading: false, result: null, error: null }]);
  };

  const removeUrl = (id) => {
    if (urls.length === 1) return;
    setUrls(urls.filter(u => u.id !== id));
  };

  const updateUrl = (id, field, value) => {
    setUrls(urls.map(u => u.id === id ? { ...u, [field]: value, error: null, result: null } : u));
  };

  const shortenUrl = async (urlData) => {
    if (!urlData.url.trim() || !validateURL(urlData.url)) {
      setUrls(urls.map(u => u.id === urlData.id ? { ...u, error: 'Please enter a valid URL' } : u));
      return;
    }

    setUrls(urls.map(u => u.id === urlData.id ? { ...u, loading: true, error: null } : u));

    try {
      const payload = {
        url: urlData.url.trim(),
        validity: urlData.validity ? parseInt(urlData.validity) : undefined,
        shortcode: urlData.shortcode || undefined
      };

      const response = await axios.post('/shorturls', payload);
      
      setUrls(urls.map(u => u.id === urlData.id ? { ...u, loading: false, result: response.data, error: null } : u));
      setSnackbar({ open: true, message: 'URL shortened successfully!', severity: 'success' });

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to shorten URL';
      setUrls(urls.map(u => u.id === urlData.id ? { ...u, loading: false, error: errorMessage } : u));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard!', severity: 'success' });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        URL Shortener
      </Typography>

      {urls.map((urlData, index) => (
        <Card key={urlData.id} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">URL {index + 1}</Typography>
              {urls.length > 1 && (
                <IconButton onClick={() => removeUrl(urlData.id)} color="error" size="small">
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Original URL *"
                  value={urlData.url}
                  onChange={(e) => updateUrl(urlData.id, 'url', e.target.value)}
                  placeholder="https://example.com/very-long-url"
                  error={!!urlData.error}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Validity (minutes)"
                  type="number"
                  value={urlData.validity}
                  onChange={(e) => updateUrl(urlData.id, 'validity', e.target.value)}
                  placeholder="30"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Custom Shortcode"
                  value={urlData.shortcode}
                  onChange={(e) => updateUrl(urlData.id, 'shortcode', e.target.value)}
                  placeholder="mycode123"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={() => shortenUrl(urlData)}
                disabled={urlData.loading}
              >
                {urlData.loading ? 'Shortening...' : 'Shorten URL'}
              </Button>
            </Box>

            {urlData.error && (
              <Alert severity="error" sx={{ mt: 2 }}>{urlData.error}</Alert>
            )}

            {urlData.result && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="h6" color="white" gutterBottom>
                  ✓ URL Shortened Successfully
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1" color="white" sx={{ flexGrow: 1 }}>
                    <strong>Short Link:</strong> {urlData.result.shortLink}
                  </Typography>
                  <IconButton onClick={() => copyToClipboard(urlData.result.shortLink)} color="inherit" size="small">
                    <CopyIcon />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="white">
                  <strong>Expires:</strong> {new Date(urlData.result.expiry).toLocaleString()}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={addUrl}
          disabled={urls.length >= 5}
          startIcon={<AddIcon />}
        >
          Add Another URL
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default URLShortener; 