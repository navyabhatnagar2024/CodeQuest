# Competitive Programming Platform

A comprehensive competitive programming platform built with Node.js, Express, SQLite, and React. This platform provides a complete solution for hosting competitive programming contests, managing problems, and tracking user progress.

## Features

### Core Features
- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Problem Management**: Create, edit, and manage programming problems with test cases
- **Code Execution**: Integration with Judge0 API for secure code compilation and execution
- **Contest System**: Create and manage competitive programming contests with real-time leaderboards
- **Submission System**: Track and evaluate code submissions with detailed results
- **Leaderboards**: Global and contest-specific leaderboards with Elo rating system
- **User Profiles**: Comprehensive user profiles with statistics and achievements

### Advanced Features
- **Real-time Updates**: WebSocket integration for live contest updates and leaderboards
- **Multi-language Support**: Support for 15+ programming languages
- **Admin Panel**: Comprehensive administrative interface for platform management
- **Analytics Dashboard**: Detailed platform analytics and user statistics
- **Achievement System**: Gamification with badges and achievements
- **Search & Filtering**: Advanced search and filtering capabilities
- **Rate Limiting**: Built-in rate limiting and security measures

### Technical Features
- **RESTful API**: Comprehensive REST API with proper error handling
- **Database Optimization**: SQLite with proper indexing and query optimization
- **Security**: Input validation, SQL injection prevention, XSS protection
- **Scalability**: Designed for horizontal scaling with proper architecture
- **Monitoring**: Health checks and system monitoring capabilities

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **SQLite**: Database with proper indexing
- **Socket.io**: Real-time communication
- **JWT**: Authentication and authorization
- **bcryptjs**: Password hashing
- **Judge0 API**: Code execution service

### Frontend (Planned)
- **React.js**: Frontend framework
- **Monaco Editor**: Code editor (VS Code in browser)
- **Tailwind CSS**: Styling framework
- **Socket.io Client**: Real-time updates

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Judge0 API key (from RapidAPI)

## Installation

### Quick Setup (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd competitive-programming-platform

# Run the automated setup script
node setup.js
```

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd competitive-programming-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file and configure:
   - `JUDGE0_API_KEY`: Your Judge0 API key from RapidAPI
   - `JWT_SECRET`: A secure random string for JWT signing
   - Other configuration as needed

4. **Initialize the database**
   ```bash
   cd server
   node database/seed.js seed
   cd ..
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1: Start server
   cd server && npm start
   
   # Terminal 2: Start client
   cd client && npm start
   ```

The server will start on `http://localhost:5000` and the client on `http://localhost:3000`

### Database Setup

**Important**: The database file is not included in the repository. After cloning, you must run the seed script to populate the database with sample data.

**Sample Data Included**:
- Admin user: username: `admin`, password: `admin123`
- 3 sample programming problems with test cases
- 2 sample contests
- Default system settings

**Database Commands**:
```bash
cd server

# Seed the database
node database/seed.js seed

# Clear all data
node database/seed.js clear

# Reset (clear + reseed)
node database/seed.js reset
```

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "country": "USA",
  "timezone": "America/New_York"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123"
}
```

### Problem Endpoints

#### Get All Problems
```http
GET /api/problems?page=1&limit=20&difficulty=Medium&topic=algorithms
```

#### Get Problem by ID
```http
GET /api/problems/1
```

#### Submit Solution
```http
POST /api/problems/1/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "sourceCode": "console.log('Hello, World!');",
  "language": "javascript"
}
```

### Contest Endpoints

#### Get All Contests
```http
GET /api/contests?status=upcoming&type=Rated
```

#### Register for Contest
```http
POST /api/contests/1/register
Authorization: Bearer <token>
```

#### Get Contest Leaderboard
```http
GET /api/contests/1/leaderboard
```

### User Endpoints

#### Get User Profile
```http
GET /api/users/1
```

#### Get Global Leaderboard
```http
GET /api/users/leaderboard/global?page=1&limit=50
```

### Admin Endpoints

#### Get System Statistics
```http
GET /api/admin/stats
Authorization: Bearer <admin-token>
```

#### Create Problem
```http
POST /api/problems
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Two Sum",
  "description": "Find two numbers that add up to target",
  "problem_statement": "Given an array of integers...",
  "difficulty_level": "Easy",
  "time_limit_ms": 1000,
  "memory_limit_mb": 256,
  "topic_tags": ["arrays", "hash-table"],
  "input_format": "First line contains n...",
  "output_format": "Print two space-separated integers...",
  "constraints": "1 ≤ n ≤ 10^5",
  "examples": [
    {
      "input": "4\n2 7 11 15\n9",
      "output": "0 1"
    }
  ]
}
```

## Database Schema

The platform uses SQLite with the following main tables:

- **users**: User accounts and profiles
- **problems**: Programming problems with metadata
- **test_cases**: Test cases for problems
- **contests**: Contest information and configuration
- **contest_problems**: Problems assigned to contests
- **submissions**: Code submissions and results
- **leaderboards**: Contest and global rankings
- **user_statistics**: User performance statistics
- **problem_statistics**: Problem difficulty and success rates

## Supported Programming Languages

- JavaScript (Node.js)
- Python 3
- C++ (GCC)
- C (GCC)
- Java
- C# (.NET)
- R
- Go
- Rust
- PHP
- Ruby
- Swift
- Kotlin
- Scala
- TypeScript

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable salt rounds
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **SQL Injection Prevention**: Parameterized queries throughout
- **XSS Protection**: Input sanitization and output encoding
- **CORS Configuration**: Secure cross-origin resource sharing
- **Helmet.js**: Security headers and protection

## Development

### Project Structure
```
├── server/
│   ├── database/
│   │   ├── connection.js
│   │   └── schema.sql
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── problems.js
│   │   ├── submissions.js
│   │   ├── contests.js
│   │   ├── users.js
│   │   └── admin.js
│   ├── services/
│   │   ├── authService.js
│   │   └── judge0Service.js
│   └── index.js
├── client/ (planned)
├── data/
├── logs/
└── package.json
```

### Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run server`: Start server only
- `npm run client`: Start client only (when implemented)
- `npm run build`: Build for production
- `npm test`: Run tests
- `npm run db:migrate`: Run database migrations
- `npm run db:seed`: Seed database with sample data

### Environment Variables

Key environment variables:

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `JWT_SECRET`: Secret key for JWT signing
- `JUDGE0_API_KEY`: Judge0 API key for code execution
- `FRONTEND_URL`: Frontend URL for CORS
- `MAX_SUBMISSION_LENGTH`: Maximum code submission length

## Deployment

### Production Setup

1. **Set environment variables**
   ```bash
   NODE_ENV=production
   JWT_SECRET=<secure-random-string>
   JUDGE0_API_KEY=<your-judge0-api-key>
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start the server**
   ```bash
   npm start
   ```

### Docker Deployment (Planned)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the API endpoints

## Roadmap

### Phase 1 (Current)
- ✅ Backend API implementation
- ✅ Database schema and migrations
- ✅ Authentication system
- ✅ Problem management
- ✅ Contest system
- ✅ Submission handling
- ✅ Admin panel

### Phase 2 (Planned)
- 🔄 React frontend implementation
- 🔄 Monaco Editor integration
- 🔄 Real-time contest features
- 🔄 Advanced analytics
- 🔄 Email notifications

### Phase 3 (Future)
- 📋 Mobile app
- 📋 Advanced contest features
- 📋 Community features
- 📋 Integration with external platforms
- 📋 Machine learning for problem recommendation

## Acknowledgments

- [Judge0](https://judge0.com/) for code execution service
- [Express.js](https://expressjs.com/) for the web framework
- [SQLite](https://www.sqlite.org/) for the database
- [Socket.io](https://socket.io/) for real-time features
