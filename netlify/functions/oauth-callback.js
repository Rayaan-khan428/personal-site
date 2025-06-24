exports.handler = async (event, context) => {
  const { code, state, error } = event.queryStringParameters;
  
  if (error) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>OAuth Error</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage(
                'authorization:github:error:' + '${error}',
                '*'
              );
              window.close();
            }
          </script>
          <p>Authorization failed: ${error}</p>
        </body>
        </html>
      `
    };
  }
  
  if (!code) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>OAuth Error</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage(
                'authorization:github:error:No authorization code received',
                '*'
              );
              window.close();
            }
          </script>
          <p>No authorization code received</p>
        </body>
        </html>
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
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authorization Successful</title>
        </head>
        <body>
          <script>
            console.log('OAuth callback received, sending token to parent');
            
            // Send the success message to parent window
            if (window.opener) {
              const message = 'authorization:github:success:' + JSON.stringify({
                token: '${tokenData.access_token}',
                provider: 'github'
              });
              console.log('Sending message:', message);
              window.opener.postMessage(message, '*');
              
              // Close the popup after a short delay
              setTimeout(() => {
                window.close();
              }, 1000);
            } else {
              console.error('No window.opener found');
            }
          </script>
          <p>Authorization successful! This window should close automatically...</p>
          <p><a href="#" onclick="window.close()">Close this window manually</a></p>
        </body>
        </html>
      `
    };
    
  } catch (error) {
    console.error('OAuth error:', error);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>OAuth Error</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage(
                'authorization:github:error:' + '${error.message}',
                '*'
              );
              window.close();
            }
          </script>
          <p>Authorization failed: ${error.message}</p>
        </body>
        </html>
      `
    };
  }
};