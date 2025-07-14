# BroCode Canada Admin Dashboard

A comprehensive admin dashboard for managing BroCode Canada members, built with React, TypeScript, and Firebase.

## Features

- 🔐 **Authentication & Authorization** - Role-based access control (Super Admin, Admin, Moderator, User)
- 📊 **Analytics Dashboard** - Member demographics, geographic distribution, employment analysis
- 👥 **User Management** - Create, edit, and manage user accounts
- 📈 **Advanced Analytics** - Detailed insights and performance metrics
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd brocode-admin-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file with your Firebase configuration:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

6. **Sign in**
   Use your existing admin credentials to sign in to the dashboard.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to GitHub Pages

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to GitHub Pages.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── services/           # Firebase and API services
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── App.tsx             # Main application component
├── firebase.ts         # Firebase configuration
└── AuthContext.tsx     # Authentication context
```

## Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Set up security rules
5. Add your web app and get the configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and proprietary to BroCode Canada.
