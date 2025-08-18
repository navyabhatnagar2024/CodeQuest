# 🚀 Competitive Programming Platform

A modern competitive programming platform built with Node.js, Express, SQLite, and React. This platform provides a complete solution for hosting programming contests, managing problems, and tracking user progress.

## ✨ **Current Features**

### 🎯 **Core Functionality**
- **User Authentication**: JWT-based authentication with role-based access control
- **Problem Management**: Create, edit, and manage programming problems with test cases
- **Code Execution**: Integration with Judge0 API for secure code compilation and execution
- **Contest System**: Create and manage competitive programming contests with real-time leaderboards
- **Submission System**: Track and evaluate code submissions with detailed results
- **Leaderboards**: Global and contest-specific leaderboards
- **User Profiles**: Comprehensive user profiles with statistics

### 🔧 **Admin Features**
- **Problem Management**: Full CRUD operations for problems
- **LeetCode Integration**: Manual script to populate problems from LeetCode
- **User Management**: Admin panel for user administration
- **Contest Management**: Create and manage contests

### 💻 **Technical Features**
- **RESTful API**: Comprehensive REST API with proper error handling
- **Database**: SQLite with proper indexing and query optimization
- **Security**: Input validation, SQL injection prevention, XSS protection
- **Real-time Updates**: WebSocket integration for live contest updates

## 🛠 **Technology Stack**

### **Backend**
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **SQLite**: Database with proper indexing
- **Socket.io**: Real-time communication
- **JWT**: Authentication and authorization
- **Judge0 API**: Code execution service

### **Frontend**
- **React.js**: Frontend framework with TypeScript
- **Monaco Editor**: Code editor (VS Code in browser)
- **Tailwind CSS**: Styling framework
- **Socket.io Client**: Real-time updates

## 📋 **Prerequisites**

- Node.js (v16 or higher)
- npm or yarn
- Python 3.11+ (for LeetCode integration)
- Judge0 API key (from RapidAPI)

## 🚀 **Quick Start**

### **1. Clone and Setup**
```bash
# Clone the repository
git clone <repository-url>
cd competitive-programming-platform

# Install dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### **2. Environment Setup**
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your settings:
# - JUDGE0_API_KEY: Your Judge0 API key from RapidAPI
# - JWT_SECRET: A secure random string for JWT signing
```

### **3. Database Setup**
```bash
# Run the automated setup script
node setup.js
```

### **4. Start Development Servers**
```bash
# Terminal 1: Start backend
cd server && npm start

# Terminal 2: Start frontend
cd client && npm start
```

## 📚 **LeetCode Integration**

### **Populate Problems from LeetCode**
```bash
# Navigate to scripts directory
cd server/scripts

# Activate Python virtual environment
C:\Users\ahaan\CODE\Coding Platform\server\venv311\Scripts\activate

# Run the manual script
python manual_leetscrape.py
```

The script will:
- Connect to your database
- Create necessary tables
- Ask how many problems to fetch
- Show real-time progress
- Insert problems into the database

### **Use in Admin Panel**
1. Go to **Admin → Manage Problems**
2. Click **"+ Add More (LeetCode)"**
3. Browse and add problems from suggestions

## 🔑 **Default Admin Account**

After running `setup.js`, you'll have:
- **Username**: `admin`
- **Password**: `admin123`

## 📁 **Project Structure**

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── contexts/      # React contexts
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── database/          # Database files
│   └── scripts/           # Python scripts
└── README.md              # This file
```

## 🚨 **Troubleshooting**

### **Common Issues**
- **Python Import Error**: Make sure you're using the correct virtual environment
- **Database Connection**: Check that the database file exists and is accessible
- **Judge0 API**: Verify your API key and RapidAPI subscription

### **Getting Help**
- Check the server console for error messages
- Verify all environment variables are set correctly
- Ensure Python dependencies are installed in the correct venv

## 📝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.
