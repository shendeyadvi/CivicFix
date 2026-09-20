# 🏛️ CivicFix — AI-Powered Civic Issue Reporting Platform

**CivicFix** is a modern, AI-driven civic issue reporting and municipal operations platform designed for citizens and municipal authorities in **Pune**. It enables citizens to report neighborhood issues in seconds using AI photo analysis and allows municipal officers to manage, assign, and resolve civic complaints in real time.

---

## ✨ Features

### 👤 Citizen Portal & AI Reporting
- **🤖 AI Photo Vision Analysis**: Upload a photo of a pothole, broken streetlight, or garbage overflow, and AI automatically fills the title, description, category, priority, and department.
- **📍 1-Tap Geolocation**: Automatically fetches live GPS coordinates or allows manual address entry.
- **🗺️ Live Interactive City Map**: View real-time reported complaints mapped across Pune wards using Google Maps integration.
- **📋 My Reports & Issue Tracking**: Monitor ticket status (*Pending Verification*, *In Progress*, *Resolved*) and delete submitted reports when needed.

### 🏛️ Municipal Authority Operations Center
- **📊 Real-Time Operations Dashboard**: Monitor incoming complaints, triage queues, and operational stats (*Total Complaints*, *In Progress*, *Resolved*, *Overdue*).
- **📋 Complaint Queue Management**: Review, verify, assign departments (*Roads*, *Sanitation*, *Water*, *Electrical*), update workflow statuses, or delete invalid records.
- **🗺️ Jurisdiction Map**: Geographic visualization of complaints across Pune municipal zones.
- **📈 Department SLA Performance**: Track resolution rates and target turnaround times across departments.

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Vanilla CSS & Utility Styling (Light & Dark Theme support)
- **Icons**: Lucide React
- **Data & Persistence**: Real-Time Local Storage Event Sync (`ReportsService`)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) installed on your system.

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Start Development Server
Run the local dev server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build for Production
To create an optimized production build:
```bash
npm run build
```

---

## 📄 License
This project is open source and available under the **MIT License**.
