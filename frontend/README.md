# 🩺 Doctor Appointment Booking System

Welcome to the Doctor Appointment Booking project! 👋 

This is a complete full-stack web application with a React frontend and a Node.js/Express backend. If you've just cloned this repo and want to get it running locally on your machine, you're in the right place! Just follow these simple steps. 🚀

## 🛠️ Prerequisites
Before we start, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [PostgreSQL](https://www.postgresql.org/) (PgAdmin recommended for easy database management)

---

## 📦 1. Database Setup (Backend)

First, let's get your database ready:
1. Open your PostgreSQL tool (like **PgAdmin** or command line).
2. Create a brand new database and name it `doctor`.
3. Open the `backend/database.sql` file in this project.
4. Copy all the queries from that file and run them in your `doctor` database. This will create all the necessary tables (`users`, `doctor_profiles`, `appointments`, etc.) for you! ✨

---

## ⚙️ 2. Backend Setup

Now, let's start the server!

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install all the required dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `backend` folder and add your database credentials. It should look something like this:
   ```env
   PORT=5000
   DB_USER=postgres
   DB_PASSWORD=your_db_password_here
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=doctor
   JWT_SECRET=super_secret_key_for_interview
   ```
   *(Make sure to change `DB_PASSWORD` to your actual Postgres password!)*
4. Start the backend server:
   ```bash
   npm run dev
   ```
   If everything goes well, you'll see a message saying the server is running on port 5000! 🎉

---

## 🎨 3. Frontend Setup

Finally, let's fire up the React frontend!

1. Open a **new terminal window/tab** (keep the backend running!) and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to the link provided in the terminal (usually `http://localhost:5173`). 

And that's it! The app should be live and fully functional on your machine. Happy coding! 💻🔥