# Nexus AI - Autonomous Agent OS

![Nexus Banner](https://via.placeholder.com/1200x300/0f172a/6366f1?text=Nexus+AI+-+The+Operating+System+for+AI+Agents)

**Nexus AI** is an enterprise-grade SaaS platform designed to let engineering teams deploy, monitor, and scale autonomous AI workers instantly. Instead of humans executing mundane developer operations, CI/CD oversight, or database migrations, Nexus allows users to strictly spin up intelligent "Agents" that operate boundlessly within secure data environments to do the work autonomously. 

This repository operates as a comprehensive **Full-Stack application** mapped specifically between a beautiful React + Framer Motion User Interface and a native Node.js REST API.

---

## ✨ Application Features & Functions

The application is completely functional and interconnected, showcasing the following primary feature loops:

### 1. Robust Public Face
- **Dynamic Landing Page**: A gorgeous, cinematic hero section containing a live 3D dashboard mockup that responds dynamically to hover metrics. 
- **Features Explorer (`/features`)**: A complex Bento-grid layout explaining the internal mechanics of the Agents.
- **Solutions Hub (`/solutions`)**: A functional side-by-side "Before Nexus vs With Nexus" comparison matrix showcasing problem/solution logic.
- **Tiered Pricing (`/pricing`)**: Professional SaaS pricing cards with hover physics emphasizing the primary "Professional" tier for conversion optimization. 

### 2. Native Authentication Lifecycle
- **Dual Flow Gateway (`/login` & `/signup`)**: Minimalist glassmorphism interfaces routing user input directly against a live Node.js REST API. 
- **Strict JWT Middleware**: The Node server natively encrypts user identities into a JSON Web Token and passes it back to React, locking the dashboard entirely unless a valid Bearer token is intercepted.

### 3. The Private Dashboard
- **Live Metrics Engine (`/dashboard`)**: The moment you log in, `useDashboardMetrics` pings the backend dynamically and calculates exactly how many executed tasks have occurred based purely on how many AI Agents are actually alive in your ecosystem.
- **Worker Configuration (`/agents`)**: A live C2 (Command & Control) map handling your agents. Typing "Security Monitor Bot" and clicking "Deploy" fires a `POST` request to the backend, physically booting a new AI data context, dropping it onto your grid, and modifying your entire Dashboard Overview numbers dynamically!
- **Data Integrations (`/integrations`)**: Configures the ecosystem. Toggle interactive status badges mapping your platform directly (visually) against tools like Slack, GitHub, and PostgreSQL.
- **Tenant Rules (`/settings`)**: Configures global profile restrictions, data residency regions (US vs EU), and outlines current tier billing metrics graphically. 

---

## 🛠 Tech Stack

### Frontend Architecture
- **Framework**: React 18 powered by Vite
- **Styling**: Highly refined Vanilla CSS strictly mapping global CSS variables (`index.css`).
- **Animation Hub**: `framer-motion` parsing physics-based spring logic natively across entrances and gestures.
- **Routing**: `react-router-dom` resolving multi-page Application boundaries entirely without DOM refreshes.
- **Icons**: `lucide-react` serving SVGs statically.

### Backend Infrastructure
- **Server**: Node.js + Express wrapping the remote API structure.
- **Security**: Modular `bcryptjs` and `jsonwebtoken` middleware blocking unapproved token requests securely via Bearer headers on Port 5005. 

---

## 🚀 How to Boot the Ecosystem

Nexus relies on two local instances communicating successfully. 

### 1. Start the Node.js API (Backend)
Open a terminal targeting the specific `/server` directory:
```bash
cd try1ui/server
npm install
npm run dev
```
> *Your Node.js core should announce it is successfully running `http://localhost:5005` with nodemon-style hot reloading enabled.*

### 2. Start the React UI (Frontend)
Open a separate parallel terminal mapped to the project root:
```bash
cd try1ui
npm install
npm run dev
```
> *Your Vite engine will now expose the site at `http://localhost:5173`.*

---

## 💡 Simulated Testing 
To see the true magic of the data orchestration flow:
1. Load `http://localhost:5173/signup`.
2. Generate any fake user object directly into the platform (e.g. `John Doe`).
3. You will mathematically authenticate and be dropped natively into `/dashboard`!
4. Navigate strictly to the **Agents** sidebar tab. Deploy 3 brand new Agents specifically naming them whatever you'd like.
5. Click back to **Overview** and watch your Total Executions and Active Tasks skyrocket instantly reflecting your newly deployed instances communicating reliably with the Node server.

---
*&copy; 2026 Nexus AI Inc. Created for demonstration architectural purposes.*
