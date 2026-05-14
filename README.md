# 🚀 FinTrack: Premium Personal Finance & Debt Hub

FinTrack is a sophisticated, full-stack financial management application designed for precision, security, and a premium user experience. It combines modern expense tracking with a robust debt management center (Lending Hub) and AI-powered smart entries.

![FinTrack Dashboard](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000)

## ✨ Key Features

### 🏦 Core Financial Management
*   **Income & Expense Tracking**: Categorize every rupee with sleek, glassmorphism interfaces.
*   **Net Wealth Real-time Calculation**: Instant calculation of your available balance across all modules.
*   **Financial Trends**: Interactive AreaCharts (powered by Recharts) to visualize your spending, income, and lending history over time.

### 🤝 Premium Lending Hub
*   **Debt Management Center**: Manage peer-to-peer loans with "To Receive" and "To Pay" indicators.
*   **Contact Profiles**: Deep-dive into specific people to see full transaction history, balances, and quick settlement options.
*   **Transaction Notes**: Add detailed descriptions to every loan or repayment for better record-keeping.

### 🧠 Smart Features
*   **AI Smart Entry**: Paste raw text (e.g., SMS alerts or notes) and let our AI categorization engine extract the amount and category automatically.
*   **Privacy Mode**: Toggle "Hide Balance" to blur sensitive financial data when in public.
*   **Ambient UI**: A high-performance, glassmorphism-themed interface with animated background orbs and buttery-smooth transitions.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React 19 (Vite)
*   **State Management**: Redux Toolkit
*   **Styling**: Tailwind CSS 4.0
*   **Animations**: Framer Motion
*   **Charts**: Recharts & Chart.js
*   **Icons**: Lucide React

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose)
*   **Authentication**: JWT (JSON Web Tokens)
*   **Validation**: Custom middleware

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas or local instance

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pavank5214/expense-tracker.git
   cd expense-tracker
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file with:
   # PORT=5000
   # MONGO_URI=your_mongodb_uri
   # JWT_SECRET=your_secret
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 📸 UI Snapshots
*   **Dashboard**: Ambient orbs with interactive AreaCharts.
*   **Lending Hub**: Detailed contact management and history.
*   **Smart Entry**: AI-powered data extraction.

---

## 📄 License
This project is licensed under the MIT License.

Developed with ❤️ by [Pavan](https://github.com/Pavank5214)
