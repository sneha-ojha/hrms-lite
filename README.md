# HRMS Lite
### Lightweight Human Resource Management System

**HRMS Lite** is a production-ready internal Human Resource Management tool designed for HR administrators to manage employee records and track daily attendance efficiently. The application features a modern **Purple-900 and Yellow-500 “Executive” UI**, emphasizing clarity, contrast, and usability.

---

## 📌 Project Overview

HRMS Lite provides a full-stack solution for core HR operations, enabling administrators to maintain a digital employee directory and manage daily attendance records seamlessly.

### ✨ Key Features
- **Employee Management**
  - Create, view, and delete employee records
  - Server-side validation for unique Employee IDs and email addresses

- **Attendance Management**
  - Daily attendance logging
  - Date picker to view and edit historical attendance
  - Prevention of attendance marking for future dates

- **Employee Attendance Records**
  - Slide-over drawer to view complete attendance history of an individual employee

- **Attendance Analytics (Bonus)**
  - Real-time calculation of total days present per employee

- **UI/UX Excellence**
  - High-contrast grid layout with clear separators
  - Custom loaders and smooth transitions
  - Emerald-green success notifications and status indicators

---

## 🛠 Tech Stack

### Frontend
- Vanilla JavaScript (ES6+)
- Tailwind CSS
- HTML5 / Jinja2

### Backend
- Python (Flask)
- Flask-SQLAlchemy

### Database
- SQLite

---

## 📂 Project Structure

```text
├── app.py              # Main application entry point
├── models.py           # Database models (Employee & Attendance)
├── extensions.py       # Shared Flask extensions
├── routes/
│   ├── employees.py    # Employee management API endpoints
│   └── attendance.py   # Attendance & history API endpoints
├── static/
│   ├── js/             # Frontend logic
│   └── css/            # Custom styles
└── templates/          # HTML templates
```
---

## 📝 Assumptions & Limitations
- Single administrator usage (no authentication system)
- Attendance cannot be marked for future dates
- Each employee must have a unique email address
- SQLite is used for portability; PostgreSQL is recommended for large-scale production

---

## 🎨 Design System
- **Primary Color:** Purple-900 (`#581c87`)
- **Accent Color:** Yellow-500 (`#eab308`)
- **Success Color:** Emerald-600 (`#059669`)
- **Layout:** Slate-200 grid borders for clear data separation

---

## 📄 Notes
Developed as part of a **Full-Stack Engineering Assignment**, focusing on clean architecture, usability, and maintainability.
## 🚀 Steps to Run the Project Locally

### 1. Prerequisites
- Python 3.8 or higher
- pip installed

---

### 2. Clone the Repository
```bash
git clone <your-repository-link>
cd hrms-lite
```
### 3. Create and Activate Virtual Environment

**Windows**
```bash
python -m venv venv
venv\Scripts\activate
```
**macOS / Linux**
```bash
python3 -m venv venv
source venv/bin/activate
```
### 4. Install Dependencies
```bash
pip install -r requirements.txt
```
### 5. Initialize the Database
```bash
python init_db.py
```
### 6. Start server
```bash
python app.py
```
Open your browser at:  
http://127.0.0.1:5000