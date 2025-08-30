# 🚀 CodeQuest - Interactive Coding Platform

**CodeQuest** is a comprehensive, gamified coding platform designed to make learning programming engaging, interactive, and collaborative. Built with modern web technologies, it combines competitive programming, interactive learning games, and social features to create an immersive coding experience.

## ✨ Features

### 🎮 Gamification System
- **XP & Leveling**: Earn experience points and level up as you code
- **Achievements & Badges**: Unlock achievements for completing challenges
- **Activity Streaks**: Maintain daily coding habits with streak tracking
- **Leaderboards**: Compete with other coders on global and topic-specific leaderboards

### 💻 Interactive Learning
- **Code Games**: Fun, educational games like Syntax Hunt, Code Golf, and Memory Match
- **Practice Problems**: Extensive problem library with multiple difficulty levels
- **Real-time Code Execution**: Run code instantly with Judge0 integration
- **AI Programming Assistant**: Get help and explanations from AI

### 🏆 Competitive Programming
- **Live Contests**: Participate in real-time coding competitions
- **Problem Categories**: Problems organized by difficulty and topic
- **Performance Analytics**: Track your progress and improvement over time

### 👥 Collaborative Features
- **Study Groups**: Join topic-specific learning groups (Graph Theory, Dynamic Programming, etc.)
- **Peer Coaching**: Learn from top performers and help others
- **Code Reviews**: Collaborative code improvement and learning
- **Study Sessions**: Group learning and problem-solving sessions

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on all devices
- **Beautiful Gradients**: Custom color palette with smooth transitions
- **Interactive Elements**: Hover effects, animations, and smooth transitions
- **Dark Theme**: Easy on the eyes for extended coding sessions

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **SQLite** - Lightweight database
- **JWT** - Authentication and authorization
- **Socket.io** - Real-time communication

### External Services
- **Judge0** - Code execution and testing
- **LLM Integration** - AI-powered programming assistance

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/navyabhatnagar2024/CodeX.git
   cd CodeX
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up the database**
   ```bash
   npm run setup
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Default Admin Account
- **Username**: `admin`
- **Password**: `admin123`

## 📁 Project Structure

```
Coding-Platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── services/      # API services
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── database/          # Database setup and migrations
│   └── middleware/        # Express middleware
└── docs/                  # Documentation
```

## 🎯 Key Components

- **Dashboard**: Personalized overview with progress tracking
- **Practice**: Problem library with filtering and search
- **Code Games**: Interactive learning games
- **Contests**: Live programming competitions
- **Study Groups**: Collaborative learning spaces
- **Profile**: User settings and achievements
- **Leaderboard**: Global and topic-specific rankings

## 🔧 Configuration

The platform can be configured through environment variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_PATH=./database.sqlite

# JWT
JWT_SECRET=your-secret-key

# External Services
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
LLM_API_KEY=your-llm-api-key
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on:

- Code style and standards
- Pull request process
- Development setup
- Testing requirements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Judge0** for code execution services
- **Tailwind CSS** for the beautiful UI framework
- **React Team** for the amazing frontend library
- **Express.js** for the robust backend framework

## 📞 Support

If you have questions or need help:

- Create an issue on GitHub
- Check our documentation
- Join our community discussions

---

**Made with ❤️ by the CodeQuest Team**

*Transform your coding journey with gamification, collaboration, and interactive learning!*
