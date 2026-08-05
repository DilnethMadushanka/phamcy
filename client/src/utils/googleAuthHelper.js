/**
 * Helper to trigger Official Google Account Selection Popup Window
 */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '597188548224-kglkkiuf4mb5jr8497o3tqa5gk8gjrkd.apps.googleusercontent.com';

export const openGoogleAccountPicker = (onSuccess, onError) => {
  if (window.google && window.google.accounts && window.google.accounts.oauth2) {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const userInfo = await userInfoRes.json();
              if (userInfo && userInfo.email) {
                onSuccess({
                  email: userInfo.email,
                  name: userInfo.name || userInfo.given_name || userInfo.email.split('@')[0],
                  picture: userInfo.picture,
                });
                return;
              }
            } catch (e) {
              console.error('Failed to fetch Google UserInfo:', e);
            }
          }
          if (onError) onError('Google Sign-In was cancelled or failed.');
        },
        error_callback: (err) => {
          console.error('Google OAuth error:', err);
          if (onError) onError('Google Sign-In popup error.');
        },
      });

      // Launch Google's Official OAuth Popup Window
      client.requestAccessToken();
      return;
    } catch (err) {
      console.warn('Google Token Client error:', err);
    }
  }

  // Fallback if Google SDK script is blocked or offline
  fallbackInteractiveChooser(onSuccess, onError);
};

const fallbackInteractiveChooser = (onSuccess, onError) => {
  const defaultEmail = 'techreveiw9@gmail.com';
  const userEmail = window.prompt(
    '🌐 Google Sign-In:\nEnter your Google Gmail address to continue:',
    defaultEmail
  );

  if (userEmail && userEmail.trim()) {
    const cleanEmail = userEmail.trim().toLowerCase();
    const namePart = cleanEmail.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    onSuccess({
      email: cleanEmail,
      name: formattedName,
    });
  } else {
    if (onError) onError('Google Sign-In cancelled.');
  }
};
