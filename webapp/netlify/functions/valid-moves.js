// Netlify Serverless Function для получения валидных ходов

const https = require('https');
const http = require('http');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  const { userId, square } = event.queryStringParameters || {};

  if (!userId || !square) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'userId and square required' }),
    };
  }

  try {
    const apiUrl = process.env.API_SERVER_URL || 'http://localhost:3001';
    const url = new URL(`${apiUrl}/api/valid-moves?userId=${userId}&square=${square}`);
    
    return new Promise((resolve) => {
      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({
              statusCode: 200,
              headers,
              body: data,
            });
          } else {
            resolve({
              statusCode: res.statusCode || 500,
              headers,
              body: JSON.stringify({ error: 'Failed to fetch valid moves' }),
            });
          }
        });
      });
      
      req.on('error', (error) => {
        resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: error.message }),
        });
      });
      
      req.end();
    });
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

