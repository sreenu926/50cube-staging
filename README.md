# 50cube Frontend - Interactive Learning Platform

A modern React application built for the 50cube learning ecosystem featuring skill-based leagues, global leaderboards, and premium content purchase system.

## 🎯 **Project Overview**

50cube is a gamified learning platform where users can:

- **Join skill-based leagues** and compete with others
- **View global leaderboards** and featured champions
- **Purchase and download premium readers** using credits

## ✨ **Features Implemented**

### **M13 - Leagues (Skill-Only)**

- **League Entry Page**: Browse and join available leagues
- **Rules & Prize Tables**: Clear competition guidelines and rewards
- **Live Leaderboards**: Real-time rankings with tie-breaking by completion time
- **Skill-Based Scoring**: Accuracy-first, time-secondary ranking system

### **M14 - Spotlight & Global Leaderboard**

- **Homepage Spotlight**: 7-day featured champions carousel
- **Global Leaderboard**: Sortable rankings with live data
- **Category Filtering**: Global vs Subject-specific leaderboards
- **Platform Analytics**: Real-time user and engagement stats

### **M15 - Readers (Buy & Download)**

- **Readers Catalog**: Browse premium learning materials
- **Credit System**: Purchase readers using platform credits
- **Digital Library**: Access purchased content anytime
- **Secure Downloads**: Time-limited download links (24h expiration)

## 🛠 **Tech Stack**

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Hooks (useState, useEffect)
- **Local Storage**: For credit system and purchase history

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18+ and npm 9+
- Backend API running (see backend README)

### **Installation**

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/50cube-frontend.git
cd 50cube-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your backend API URL

# Start development server
npm run dev
```

### **Environment Variables**

Create a `.env.local` file:

```env
# API Configuration
VITE_API_URL=http://localhost:5001
# For production: VITE_API_URL=https://50cube-backend.vercel.app

# App Configuration
VITE_APP_NAME=50cube
VITE_APP_VERSION=1.0.0
```

## 📱 **Application Routes**

| Route          | Description     | Features                                               |
| -------------- | --------------- | ------------------------------------------------------ |
| `/`            | Homepage        | Global leaderboard, spotlight carousel, platform stats |
| `/leagues`     | Leagues Hub     | Browse active leagues, view rules and prizes           |
| `/leagues/:id` | League Details  | Join league, view specific leaderboard                 |
| `/readers`     | Readers Catalog | Browse and purchase premium content                    |
| `/library`     | My Library      | Access purchased readers, download content             |

## 🎮 **User Flow & Testing**

### **M13 - Leagues Test Flow**

1. **Visit** `/leagues` → Browse available leagues
2. **Click** "Join League" → Enter competition
3. **Submit** answers → Get ranked by accuracy then time
4. **View** leaderboard → See live rankings update

### **M14 - Leaderboard Test Flow**

1. **Visit** `/` → See global leaderboard section
2. **Switch tabs** → Toggle between "Global Rankings" and "By Category"
3. **View spotlight** → See 7-day featured champions rotate
4. **Check sorting** → Verify rankings work correctly

### **M15 - Readers Test Flow**

1. **Visit** `/readers` → Browse catalog (starts with 1000 credits)
2. **Click** "Purchase" → Credits deducted, success notification
3. **Visit** `/library` → Purchased item appears ✅
4. **Try download** → Link expires after 24 hours ✅
5. **Refresh page** → Credits remain deducted ✅

## 📦 **Available Scripts**

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)
npm run dev --host   # Expose to network

# Building
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run unit tests (if configured)
```

## 🏗 **Project Structure**

```
src/
├── components/          # Reusable UI components
├── pages/               # Main application pages
│   ├── HomePage.tsx     # M14 - Global leaderboard & spotlight
│   ├── Leagues/         # M13 - League system
│   │   ├── LeaguesPage.tsx
│   │   └── LeagueDetail.tsx
│   └── Readers/         # M15 - Content purchase system
│       ├── ReadersPage.tsx
│       └── LibraryPage.tsx
├── services/            # API integration
│   └── api.ts          # Axios configuration & endpoints
├── types/              # TypeScript interfaces
├── assets/             # Static assets
└── App.tsx             # Main app component with routing
```

## 🔗 **API Integration**

The frontend communicates with the backend through REST APIs:

```typescript
// API Base Configuration
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Key Endpoints
GET  /api/leagues           # List all leagues
POST /api/leagues/enter     # Join a league
GET  /api/leaderboard       # Global rankings
GET  /api/readers/catalog   # Browse readers
POST /api/readers/buy       # Purchase reader
```

## 💾 **Local Storage Usage**

Since there's no authentication system, the app uses localStorage for:

```typescript
// Credit System
localStorage.setItem('userCredits', '1000');

// Purchase History
localStorage.setItem('purchasedReaders', JSON.stringify(['reader1', 'reader2']));

// Library Items
localStorage.setItem('libraryItems', JSON.stringify([...]));
```

## 🎨 **Design System**

- **Colors**: Purple/blue gradient theme with dark mode
- **Typography**: Bold headings, clean body text
- **Components**: Rounded corners, subtle shadows, hover effects
- **Responsive**: Mobile-first design with Tailwind breakpoints
- **Animations**: Smooth transitions and micro-interactions

## 🔧 **Build Configuration**

### **Vite Configuration** (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
  },
});
```

### **Tailwind Configuration** (`tailwind.config.js`)

```javascript
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [],
};
```

## 📊 **Performance Considerations**

- **Code Splitting**: React Router lazy loading
- **Asset Optimization**: Vite's built-in optimizations
- **Bundle Size**: Minimal dependencies, tree shaking
- **Caching**: localStorage for offline data persistence

## 🐛 **Troubleshooting**

### **Common Issues**

1. **API Connection Failed**

   ```bash
   # Check if backend is running
   curl http://localhost:5001/api/health

   # Verify VITE_API_URL in .env.local
   echo $VITE_API_URL
   ```

2. **Build Errors**

   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install

   # Check TypeScript types
   npm run type-check
   ```

3. **Credits Not Persisting**
   - Check browser localStorage in DevTools
   - Verify localStorage quota not exceeded
   - Clear localStorage and restart: `localStorage.clear()`

## 🚀 **Deployment**

Ready for deployment to:

- **Vercel** (Recommended)
- **Netlify**
- **GitHub Pages**
- **Firebase Hosting**

See deployment instructions below.

## 📝 **Module Completion Status**

| Module  | Status      | Test Checklist                                               |
| ------- | ----------- | ------------------------------------------------------------ |
| **M13** | ✅ Complete | Ties break by time ✅, Leaderboard updates ✅                |
| **M14** | ✅ Complete | 7-day spotlight ✅, Sorting works ✅                         |
| **M15** | ✅ Complete | Credits deducted ✅, Link expires ✅, Library shows items ✅ |

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🔗 **Links**

- **Live Demo**: [https://50cube-backend.vercel.app](https://50cube-backend.vercel.app)
- **Backend Repo**: [https://github.com/sreenu926/50cube-backend](https://github.com/sreenu926/50cube-backend)
- **Design System**: Built with Tailwind CSS
- **API Docs**: See backend README for endpoint documentation

---

**Built with ❤️ for the 50cube Learning Platform**
