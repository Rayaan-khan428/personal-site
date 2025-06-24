exports.handler = async (event, context) => {
  const { code, state, error } = event.queryStringParameters;
  
  if (error) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <script>
          window.opener.postMessage({
            error: "${error}",
            provider: "github"
          }, window.location.origin);
          window.close();
        </script>
      `
    };
  }
  
  if (!code) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <script>
          window.opener.postMessage({
            error: "No authorization code received",
            provider: "github"
          }, window.location.origin);
          window.close();
        </script>
      `
    };
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }
    
    // Get user info to verify token works
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
        'User-Agent': 'Decap-CMS-OAuth'
      }
    });
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }
    
    const userData = await userResponse.json();
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <script>
          window.opener.postMessage({
            token: "${tokenData.access_token}",
            provider: "github"
          }, window.location.origin);
          window.close();
        </script>
      `
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <script>
          window.opener.postMessage({
            error: "${error.message}",
            provider: "github"
          }, window.location.origin);
          window.close();
        </script>
      `
    };
  }
};