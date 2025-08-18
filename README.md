# 🚀 Competitive Programming Platform

A comprehensive competitive programming platform with real-time contests, code execution, and LeetCode integration.

## ✨ Features

- **🏆 Real-time Contests** - Create and participate in coding competitions
- **💻 Code Execution** - Run code in multiple programming languages using Judge0
- **📚 Problem Library** - Extensive collection of coding problems
- **🔍 LeetCode Integration** - Import problems directly from LeetCode
- **📊 Leaderboards** - Track performance and rankings
- **👥 User Management** - User registration, authentication, and profiles
- **📱 Responsive UI** - Modern, mobile-friendly interface

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Socket.io
- **Database**: SQLite
- **Code Execution**: Judge0 API
- **Authentication**: JWT
- **Real-time**: Socket.io

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd coding-platform
```

### 2. Run Setup
```bash
npm run setup
```

This will:
- Install all dependencies
- Create the database
- Populate with initial data
- Set up environment variables

### 3. Start the Platform
```bash
npm run dev
```

The platform will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### 4. Access Admin Panel
- **Username**: admin
- **Password**: admin123

## 📁 Project Structure

```
coding-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── contexts/      # React contexts
│   └── package.json
├── server/                 # Node.js backend
│   ├── database/          # Database files
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── package.json
├── setup.js               # Setup script
└── package.json           # Root package.json
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Judge0 API Configuration
JUDGE0_API_KEY=your_judge0_api_key
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Database Configuration
DATABASE_PATH=./server/database/coding_platform.db
```

### Judge0 API Setup
1. Sign up at [RapidAPI](https://rapidapi.com)
2. Subscribe to [Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce)
3. Get your API key and add it to `.env`

## 📊 Database Setup

The platform uses SQLite for simplicity. The database is automatically created with:

- **Users table** - User accounts and profiles
- **Problems table** - Coding problems and descriptions
- **Test cases table** - Problem test cases
- **Contests table** - Contest information
- **Submissions table** - User code submissions
- **LeetCode suggestions** - Imported LeetCode problems

## 🎯 Adding Problems

### From LeetCode
1. Go to Admin Panel → Problems → LeetCode Suggestions
2. Browse available problems
3. Click "Add Problem" to import with test cases

### Manually
1. Go to Admin Panel → Problems → Add Problem
2. Fill in problem details
3. Add test cases manually

## 🏃‍♂️ Running Code

The platform supports multiple programming languages:

- **Python** (3.8+)
- **JavaScript** (Node.js)
- **Java** (OpenJDK 13)
- **C/C++** (GCC 9.2)
- **And many more...**

Code execution is handled by Judge0 API with:
- Real-time compilation and execution
- Test case validation
- Performance metrics (time, memory)
- Error handling and debugging

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test files
npm test -- --testPathPattern=auth
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Problems
- `GET /api/problems` - List all problems
- `GET /api/problems/:id` - Get problem details
- `POST /api/problems/:id/submit` - Submit solution
- `POST /api/problems/:id/test` - Test code against test cases

### Contests
- `GET /api/contests` - List all contests
- `POST /api/contests/:id/register` - Register for contest
- `GET /api/contests/:id/leaderboard` - Get contest leaderboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/yourusername/coding-platform/issues) page
2. Create a new issue with detailed information
3. Include error logs and steps to reproduce

## 🙏 Acknowledgments

- [Judge0](https://judge0.com) - Code execution service
- [LeetCode](https://leetcode.com) - Problem database
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [React](https://reactjs.org) - Frontend library

---

**Happy Coding! 🎉**
