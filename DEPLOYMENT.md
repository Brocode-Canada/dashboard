# Deployment Guide for Brocode Admin Dashboard

## GitHub Pages Deployment

### Prerequisites
1. A GitHub repository for your project
2. Firebase project set up
3. Node.js and npm installed locally

### Step 1: Set up Firebase Secrets in GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following repository secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`

### Step 2: Enable GitHub Pages

1. Go to your repository **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose **gh-pages** branch
4. Click **Save**

### Step 3: Deploy

#### Option A: Automatic Deployment (Recommended)
- Push to the `main` branch
- GitHub Actions will automatically build and deploy

#### Option B: Manual Deployment
```bash
# Install dependencies
npm install

# Deploy to GitHub Pages
npm run deploy
```

### Step 4: Access Your App
Your app will be available at: `https://yourusername.github.io/dashboard/`

## Firebase Secrets Management

### Local Development
1. Copy `env.example` to `.env.local`
2. Fill in your Firebase configuration values
3. The app will use these local environment variables

### Production (GitHub Pages)
- Secrets are stored in GitHub repository secrets
- Automatically injected during build process
- Never exposed in the client-side code

### Security Best Practices
1. **Never commit secrets to Git**
   - All `.env*` files are in `.gitignore`
   - Use GitHub secrets for production

2. **Firebase Security Rules**
   - Configure proper Firestore security rules
   - Restrict access based on authentication
   - Use Firebase Auth for user management

3. **Environment Variables**
   - Only use `VITE_` prefixed variables for client-side
   - Server-side secrets should use different naming

## Troubleshooting

### Common Issues

1. **Build fails with missing environment variables**
   - Ensure all Firebase secrets are set in GitHub
   - Check that variable names match exactly

2. **App doesn't load on GitHub Pages**
   - Verify the base path in `vite.config.ts`
   - Check that the repository name matches the base path

3. **Firebase authentication issues**
   - Add your GitHub Pages domain to Firebase Auth authorized domains
   - Check Firebase console for any errors

### Firebase Console Setup
1. Go to Firebase Console → Authentication → Settings
2. Add your GitHub Pages domain to **Authorized domains**:
   - `yourusername.github.io`

### Support
If you encounter issues:
1. Check the GitHub Actions logs
2. Verify Firebase configuration
3. Ensure all secrets are properly set 