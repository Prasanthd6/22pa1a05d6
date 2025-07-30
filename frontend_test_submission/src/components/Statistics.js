import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Link as LinkIcon,
  Visibility as VisibilityIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import axios from 'axios';

const Statistics = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/urls');
      setUrls(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch URL statistics');
      console.error('Error fetching URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiryTime) => {
    return new Date() > new Date(expiryTime);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (urls.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          No URLs Found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create some shortened URLs to see their statistics here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        URL Statistics
      </Typography>

      <Grid container spacing={3}>
        {urls.map((url, index) => (
          <Grid item xs={12} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      <LinkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      {url.shortLink}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Original URL:</strong> {url.originalURL}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        icon={<AccessTimeIcon />}
                        label={`Created: ${formatDate(url.createdAt)}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<AccessTimeIcon />}
                        label={`Expires: ${formatDate(url.expiryTime)}`}
                        size="small"
                        variant="outlined"
                        color={isExpired(url.expiryTime) ? 'error' : 'default'}
                      />
                      <Chip
                        icon={<VisibilityIcon />}
                        label={`${url.totalClicks} clicks`}
                        size="small"
                        color="primary"
                      />
                    </Box>
                  </Box>
                </Box>

                {url.clicks.length > 0 ? (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">
                        Click Details ({url.clicks.length} clicks)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Timestamp</strong></TableCell>
                              <TableCell><strong>Source</strong></TableCell>
                              <TableCell><strong>Location</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {url.clicks.map((click, clickIndex) => (
                              <TableRow key={clickIndex}>
                                <TableCell>{formatDate(click.timestamp)}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={click.source}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LocationIcon sx={{ mr: 0.5, fontSize: 'small' }} />
                                    {click.location}
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No clicks recorded yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Total URLs: {urls.length} | 
          Total Clicks: {urls.reduce((sum, url) => sum + url.totalClicks, 0)}
        </Typography>
      </Box>
    </Box>
  );
};

export default Statistics; 