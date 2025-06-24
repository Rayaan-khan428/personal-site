// netlify/functions/oauth-auth.js
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const siteURL = process.env.URL || 'https://rayaank.netlify.app';
  
  // Generate random state for security
  const state = Math.random().toString(36).substring(7);
  
  // GitHub OAuth URL
  const githubOAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubOAuthUrl.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID);
  githubOAuthUrl.searchParams.set('redirect_uri', `${siteURL}/.netlify/functions/oauth-callback`);
  githubOAuthUrl.searchParams.set('scope', 'repo,user');
  githubOAuthUrl.searchParams.set('state', state);
  
  return {
    statusCode: 302,
    headers: {
      ...headers,
      Location: githubOAuthUrl.toString(),
      'Cache-Control': 'no-cache'
    },
    body: ''
  };
};