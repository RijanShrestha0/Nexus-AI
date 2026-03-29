# Nexus AI - Autonomous Agent OS

![Nexus AI Banner](https://via.placeholder.com/1200x400/0f172a/6366f1?text=Nexus+AI+-+The+Operating+System+for+AI+Agents)

Nexus AI is a premium, enterprise-grade SaaS platform built to help forward-thinking engineering teams deploy, manage, and scale autonomous AI agents directly within their existing workflows.

This repository features the complete frontend source code for the landing site and the core authenticated application dashboard.

## 🌟 Key Features

- **Modern SaaS Aesthetics**: Built using highly-customized vanilla CSS bringing together a cohesive light theme, glassmorphism paneling, and floating ambient gradients.
- **High-Performance Animations**: Integrated with `framer-motion` for buttery-smooth spring physics, scroll-reveal transitions, and dynamic hover states.
- **Scale-Ready Component Architecture**: Fully decoupled UI library separated into highly reusable React components (Buttons, Badges, Stat Cards, Bento Grids).
- **Authentication Context**: Comes wired with a functional React Context wrapper (`AuthContext.js`) that simulates login/registration flows and safely maps into protected private dashboard routes.
- **Dynamic Application Dashboard**: Features a private interface with a sticky navigation sidebar, live simulated metrics, and self-updating activity feeds.
- **Seamless Scalable Routing**: Built on top of `react-router-dom` for instant page-to-page navigation across the Home, Features, Solutions, Pricing, Login, and Dashboard layouts.

## 🛠 Tech Stack

- **Framework**: [React 18](https://react.dev/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Animation Engine**: [Framer Motion](https://www.framer.com/motion/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS (CSS Modules compatible)

## 📁 Directory Architecture

```text
src/
├── components/
│   ├── dashboard/      # Internal application widgets (StatCards, ActivityFeeds)
│   ├── layout/         # Shell components (Navbar, Footer, authenticated Sidebar)
│   ├── sections/       # Landing page structural blocks (Hero, Features, CTA)
│   └── ui/             # Core reusable atoms (Button, Badge, AmbientBackground)
├── context/
│   └── AuthContext.jsx # Global mock authentication ecosystem
├── hooks/
│   ├── useScroll.js                 # Throttled scroll listener
│   └── useDashboardSimulation.js    # Data factory for charting & metrics
├── pages/
│   ├── Home.jsx        # Landing route (/)
│   ├── Features.jsx    # Feature dive (/features)
│   ├── Solutions.jsx   # Grid breakdown (/solutions)
│   ├── Pricing.jsx     # Tier tables (/pricing)
│   ├── Login.jsx       # Auth flow (/login)
│   ├── Signup.jsx      # Auth flow (/signup)
│   └── Dashboard.jsx   # Private layout (/dashboard)
├── App.jsx             # Main Router aggregator
├── index.css           # Global SaaS styling tokens & classes
└── main.jsx            # Application entry point
```

## 🚀 Getting Started

1. **Clone the repository** (if applicable) or navigate into the directory:
   ```bash
   cd Nexus-AI
   ```

2. **Install the dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and visit `http://localhost:5173`. 
   
*Tip: To test the dashboard logic, click "Sign In" or "Start Free Trial", type any name/email/password, and submit to trigger the protected route!*

## 🎨 Design Principles
- **No layout-thrashing animations**: Heavy reliance on CSS `transform` and `opacity` properties via Framer Motion for 60FPS renders.
- **Accessibility considered**: All interactions support native HTML behaviors (a tags route seamlessly, buttons capture submits). Contrast passes modern SaaS standards.
- **Clean Code**: Zero inline script styling for complex animations; relying strictly on CSS classes (`scrolled`, `popular`) mapped intelligently through modern React Hooks.

---

*&copy; 2026 Nexus AI Inc. Created for demonstration purposes.*
