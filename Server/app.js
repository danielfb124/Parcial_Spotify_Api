const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors'); 

dotenv.config();

const app = express();
const port = 3001;

app.use(cors()); 

app.get('/api/token', async (req, res) => {
  try {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      new URLSearchParams({ grant_type: 'client_credentials' }), 
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get access token' });
  }
});

app.get('/api/artists/:artist', async (req, res) => {
  const artist = req.params.artist;
  try {
    const tokenResponse = await axios.get('http://localhost:3001/api/token');
    const accessToken = tokenResponse.data.access_token;

    const response = await axios.get(`https://api.spotify.com/v1/search?q=${artist}&type=artist`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch artist data' });
  }
});

app.get('/api/artistsByGenre/:genre', async (req, res) => {
  const genre = req.params.genre;
  try {
    const tokenResponse = await axios.get('http://localhost:3001/api/token');
    const accessToken = tokenResponse.data.access_token;

    
    const response = await axios.get(`https://api.spotify.com/v1/search?q=genre:${genre}&type=artist&limit=4`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    res.json({ artists: response.data.artists.items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});

app.get('/api/genres', async (req, res) => {
  try {
    const tokenResponse = await axios.get('http://localhost:3001/api/token');
    const accessToken = tokenResponse.data.access_token;

    const response = await axios.get('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.json({ genres: response.data.genres });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});


app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
