exports.handler = async (event, context) => {
  const { queryStringParameters } = event;
  
  // Generate random state for security
  const state = Math.random().toString(36).substring(7);
  
  // GitHub OAuth URL
  const githubOAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubOAuthUrl.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID);
  githubOAuthUrl.searchParams.set('redirect_uri', `${process.env.URL}/.netlify/functions/oauth-callback`);
  githubOAuthUrl.searchParams.set('scope', 'public_repo,user:email');
  githubOAuthUrl.searchParams.set('state', state);
  
  return {
    statusCode: 302,
    headers: {
      Location: githubOAuthUrl.toString(),
      'Cache-Control': 'no-cache'
    },
    body: ''
  };
};