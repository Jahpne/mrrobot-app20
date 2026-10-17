# 🤖 MrRobot 

A Cyberpunk-noir themed, ephemeral messaging application designed for secure, self-destructive communication between an Admin and Users. 

Built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Firebase**, this app simulates a terminal-based secure line where messages have a limited lifespan, sync across devices in real-time, and disappear once their timer expires.

## 🚀 Features

*   **Real-Time Cloud Sync:** Powered by Firebase, messages and user lists sync instantly across different devices and browsers.
*   **Dual Interface:** Separate views for standard Users and the Admin Terminal (`/#/admin`).
*   **Self-Destructing Messages:** Users can send messages with specific countdown timers (10s, 30s, 1m, 2m, 5m, 10m, or "No Timer").
*   **Message Locking System:** User messages automatically lock when their timer expires. Admin messages remain locked until manually unlocked by the user.
*   **Admin Panel:** A secure login terminal for the Admin to manage conversations and view a real-time list of active users.
*   **Responsive User Sidebar:** An admin-only collapsible sidebar displaying all active users.
*   **Cyberpunk Aesthetic:** A deep purple and black theme with neon glows, deep shadows, monospace typography, and a sleek UI.

## 🛠️ Technical Stack

*   **Frontend:** React 19 + TypeScript
*   **Styling:** Tailwind CSS 4 + Custom CSS (for glow and shadow effects)
*   **Routing:** Wouter (Client-side routing)
*   **Backend / Database:** Firebase (Firestore / Realtime Database)
*   **Icons:** Lucide React
*   **Typography:** IBM Plex Mono

## 📂 Project Phases (Development History)

1.  **Phase 1: Initial Setup:** Created basic chat structure, user/admin interfaces, and auth system.
2.  **Phase 2: Bug Fixes & Features:** Fixed admin send bugs, added user sidebar, implemented unique User IDs.
3.  **Phase 3: Responsiveness & Timer Fixes:** Made UI mobile-friendly, fixed admin timer display bugs, improved spacing.
4.  **Phase 4: Design Refinement:** Replaced cyan with purple, added deep shadow effects and visual hierarchy.
5.  **Phase 5: Final Polish & Firebase:** Implemented locked admin messages, updated email placeholders, fixed input focus styling, and **integrated Firebase for real-time data persistence**.

## 🚦 Getting Started

To run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/[Your-Username]/mr-robot-app.git
   cd mr-robot-app



2. **run the development server:**
npm install
# or
yarn install
npm run dev
# or
yarn dev

3. ** Firebase Configuration:**
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id


4. ** Open your browser:**
Navigate to http://localhost:3000 (or the port specified in your terminal).
