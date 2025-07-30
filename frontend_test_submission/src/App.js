import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LinkIcon from '@mui/icons-material/Link';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import URLShortener from './components/URLShortener';
import Statistics from './components/Statistics';

function App() {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <LinkIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
            startIcon={<LinkIcon />}
          >
            Shorten URLs
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/statistics"
            startIcon={<AnalyticsIcon />}
          >
            Statistics
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<URLShortener />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Container>
    </div>
  );
}

export default App; 