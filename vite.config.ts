Here is your updated vite.config.ts file.

I have added base: '/calendar-/', on line 9. You can copy and paste this entire
block directly into your file on GitHub:

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/calendar-/', // Added this line so GitHub Pages finds your files
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

⚠️ IMPORTANT SECURITY WARNING ⚠️

Looking at your configuration, I see you are passing a Gemini API Key into your
frontend code using process.env.GEMINI_API_KEY.

Because GitHub Pages hosts static websites (which run entirely in the user's
browser), your API key will be publicly visible to anyone who visits your
website.

Anyone can right-click your site, click "Inspect", look at your network traffic
or Javascript files, and steal your Gemini API Key. They can then use your key
to run up massive usage bills on your Google account.

How this affects your GitHub Actions build: Also, because .env files are usually
blocked from being uploaded to GitHub (via your .gitignore file), GitHub Actions
won't actually know what your API key is when it tries to build the site.

What you should do: If this is just a personal project for you to test and you
don't care if the API key gets compromised (and you have billing limits set up
in Google), you will need to add the API key to your GitHub Repository Secrets
for the build to work:

1.  Go to your repository Settings.
2.  On the left sidebar, go to Secrets and variables -> Actions.
3.  Click New repository secret.
4.  Name it GEMINI_API_KEY and paste your key in the secret box. (Note: Doing
    this means your app will work, but the key will still be permanently exposed
    to the public internet in your website's source code).

If you want this to be a secure, real-world application, you cannot host it on
GitHub Pages. You would need to create a backend server (using Node.js, Python,
etc.) to hide your API key, and host it on a platform like Render, Heroku, or
Vercel.
