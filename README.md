# AMBURSA — Robotics & Artificial Intelligence Research Platform

A production-ready, dark/light themed web platform built with plain HTML5, CSS3, vanilla JavaScript, and a Node.js/Express backend API for **Autonomous Robotics & AI Engineering**.

---

## 📁 Directory Structure & Organization

```
ambursa-robotics-blog/
├── assets/                  # Media assets, screenshots, and visual mockups
│   └── images/              # Design mockups & screenshots
├── css/                     # Design system & stylesheets
│   ├── styles.css           # Core styling, layout, theme system & shop styles
│   └── variables.css        # CSS custom properties (colors, fonts, tokens)
├── js/                      # Frontend JavaScript engines
│   ├── builds-data.js       # Component catalog & pre-built templates database
│   └── main.js              # Theme manager, shop configurator, owner auth & UI engines
├── data/                    # Server data storage
│   └── builds.json          # Hardware component catalog, stock states & orders JSON DB
├── server/                  # Node.js / Express Backend REST API
│   ├── index.js             # Main Express server entry point
│   ├── config.js            # Environment configuration loader
│   ├── routes/              # Express API routers (/api/inventory, /api/orders)
│   ├── middleware/          # Express custom middlewares
│   └── auth/                # Authentication utility modules
├── posts/                   # Technical blog posts & robotics papers
│   └── slam-rtos-architecture.html
├── index.html               # Main homepage (Robotics & AI Research Papers)
├── projects.html            # Robotics & AI Engineering Projects Showcase
├── builds.html              # Custom Robotics, AI & Edge Workstations Shop
├── dashboard.html           # Restricted Owner Inventory & Stock Control Dashboard
├── favicon.svg              # Site brand favicon
├── package.json             # Node.js project manifest & scripts
├── .env.example             # Environment variables example template
└── .gitignore               # Git ignored files configuration
```

---

## 🚀 Quick Start & Local Execution

### 1. Run via Node.js Express Backend
To start the REST API server and static website server:
```bash
npm start
# or
node server/index.js
```
The server will start at `http://localhost:3000`.

### 2. Pages Overview
- **Homepage**: `http://localhost:3000/index.html` — Robotics & AI research papers & systems engineering bio.
- **Projects Showcase**: `http://localhost:3000/projects.html` — Open-source ROS 2 controllers, CUDA SLAM engine, and Edge AI vision modules.
- **Hardware Workstations Shop**: `http://localhost:3000/builds.html` — Browse pre-built AI/Robotics workstations & configure custom rigs with real-time pricing and wattage calculations.
- **Owner Control Dashboard**: `http://localhost:3000/dashboard.html` — Restricted Owner Portal for hardware stock management & customer order tracking.

---

## 🔒 Owner Dashboard Passcode
- **Passcode**: `admin` *(or `ambursa2026`)*
- Locks inventory stock control & customer orders when hosted online.

---

## 🛠️ Tech Stack & Design System
- **Robotics & AI Stack**: ROS 2, PyTorch, CUDA 12, TensorRT, Gazebo, Isaac Sim, OpenCV.
- **Frontend**: Plain HTML5, Modern Vanilla CSS3, ES6 JavaScript.
- **Typography**: Inter (sans-serif) & JetBrains Mono (monospace).
- **Theme**: Light & Dark mode auto-switcher with `data-theme` attribute.
- **Backend**: Node.js, Express, REST API (`/api/inventory`, `/api/orders`).
