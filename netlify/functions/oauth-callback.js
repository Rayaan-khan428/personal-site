// netlify/functions/oauth-callback.js
exports.handler = async (event, context) => {
  const { code, state, error } = event.queryStringParameters || {};
  
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'text/html'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  if (error || !code) {
    const errorMessage = error || 'No authorization code received';
    return {
      statusCode: 200,
      headers,
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>OAuth Error</title>
          <script>
            (function() {
              function recieveMessage(e) {
                console.log("Received message:", e.data);
                if (e.data === "authorizing:github") {
                  window.opener.postMessage("authorization:github:error:${errorMessage}", e.origin);
                  window.removeEventListener("message", recieveMessage, false);
                }
              }
              window.addEventListener("message", recieveMessage, false);
              window.opener.postMessage("authorizing:github", "*");
            })();
          </script>
        </head>
        <body>
          <p>Authorization failed: ${errorMessage}</p>
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
        state: state
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    // Get user data
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json'
      }
    });

    const userData = await userResponse.json();
    
    // Decap CMS expects this specific response format
    const authData = {
      token: tokenData.access_token,
      provider: 'github'
    };
    
    return {
      statusCode: 200,
      headers,
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authorization Successful</title>
          <script>
            (function() {
              function recieveMessage(e) {
                console.log("Received message:", e.data);
                if (e.data === "authorizing:github") {
                  window.opener.postMessage(
                    "authorization:github:success:${JSON.stringify(authData).replace(/"/g, '\\"')}", 
                    e.origin
                  );
                  window.removeEventListener("message", recieveMessage, false);
                  setTimeout(function() {
                    window.close();
                  }, 1000);
                }
              }
              window.addEventListener("message", recieveMessage, false);
              window.opener.postMessage("authorizing:github", "*");
            })();
          </script>
        </head>
        <body>
          <p>Authorization successful! This window should close automatically...</p>
          <p>If it doesn't, you can <a href="#" onclick="window.close()">close it manually</a>.</p>
        </body>
        </html>
      `
    };
    
  } catch (error) {
    console.error('OAuth error:', error);
    return {
      statusCode: 200,
      headers,
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>OAuth Error</title>
          <script>
            (function() {
              function recieveMessage(e) {
                console.log("Received message:", e.data);
                if (e.data === "authorizing:github") {
                  window.opener.postMessage("authorization:github:error:${error.message}", e.origin);
                  window.removeEventListener("message", recieveMessage, false);
                }
              }
              window.addEventListener("message", recieveMessage, false);
              window.opener.postMessage("authorizing:github", "*");
            })();
          </script>
        </head>
        <body>
          <p>Authorization failed: ${error.message}</p>
        </body>
        </html>
      `
    };
  }
};