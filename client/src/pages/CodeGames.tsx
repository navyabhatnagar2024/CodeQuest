import React, { useState, useEffect } from 'react';
import { useGamification } from '../contexts/GamificationContext';
import {
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  SparklesIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  StarIcon,
  FireIcon,
  LightBulbIcon,
  CogIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  HeartIcon,
  GiftIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';

interface GameChallenge {
  id: number;
  title: string;
  description: string;
  type: 'puzzle' | 'syntax' | 'golf' | 'memory' | 'speed' | 'flashcards' | 'ai_assistant' | 'peer_coaching';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  timeLimit?: number;
  completed: boolean;
  bestScore?: number;
  icon?: React.ComponentType<any>;
  color?: string;
}

interface FlashCard {
  id: number;
  concept: string;
  definition: string;
  example: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface PeerCoach {
  id: number;
  username: string;
  level: number;
  xp: number;
  expertise: string[];
  rating: number;
  hourlyRate: number;
  available: boolean;
  avatar?: string;
}

interface AIConversation {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

const CodeGames: React.FC = () => {
  const { addXP } = useGamification();
  const [currentGame, setCurrentGame] = useState<GameChallenge | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'completed'>('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameData, setGameData] = useState<any>(null);
  
  // New state for enhanced features
  const [currentView, setCurrentView] = useState<'games' | 'flashcards' | 'ai_assistant' | 'peer_coaching'>('games');
  const [currentFlashCard, setCurrentFlashCard] = useState(0);
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [peerCoaches, setPeerCoaches] = useState<PeerCoach[]>([]);
  const [aiConversation, setAiConversation] = useState<AIConversation>({ id: '1', messages: [] });
  const [aiInput, setAiInput] = useState('');
  const [selectedCoach, setSelectedCoach] = useState<PeerCoach | null>(null);
  const [coachingSession, setCoachingSession] = useState(false);

  const challenges: GameChallenge[] = [
    {
      id: 1,
      title: "Code Puzzle Master",
      description: "Arrange code blocks in the correct order to solve programming problems",
      type: 'puzzle',
      difficulty: 'easy',
      xpReward: 50,
      completed: false,
      icon: PuzzlePieceIcon,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      title: "Syntax Hunter",
      description: "Find and fix syntax errors in code snippets",
      type: 'syntax',
      difficulty: 'medium',
      xpReward: 75,
      timeLimit: 120,
      completed: false,
      icon: CogIcon,
      color: 'bg-yellow-500'
    },
    {
      id: 3,
      title: "Code Golf",
      description: "Write the shortest possible code to solve the problem",
      type: 'golf',
      difficulty: 'hard',
      xpReward: 100,
      completed: false,
      icon: StarIcon,
      color: 'bg-purple-500'
    },
    {
      id: 4,
      title: "Memory Match",
      description: "Match programming concepts and their definitions",
      type: 'memory',
      difficulty: 'easy',
      xpReward: 40,
      timeLimit: 90,
      completed: false,
      icon: HeartIcon,
      color: 'bg-pink-500'
    },
    {
      id: 5,
      title: "Speed Coder",
      description: "Complete coding challenges against the clock",
      type: 'speed',
      difficulty: 'medium',
      xpReward: 80,
      timeLimit: 180,
      completed: false,
      icon: FireIcon,
      color: 'bg-red-500'
    },
    {
      id: 6,
      title: "Flashcards",
      description: "Learn programming concepts with interactive flashcards",
      type: 'flashcards',
      difficulty: 'easy',
      xpReward: 30,
      completed: false,
      icon: BookOpenIcon,
      color: 'bg-green-500'
    },
    {
      id: 7,
      title: "AI Assistant",
      description: "Get help from AI tutor for coding questions",
      type: 'ai_assistant',
      difficulty: 'medium',
      xpReward: 25,
      completed: false,
      icon: SparklesIcon,
      color: 'bg-indigo-500'
    },
    {
      id: 8,
      title: "Peer Coaching",
      description: "Learn from top performers and experts",
      type: 'peer_coaching',
      difficulty: 'hard',
      xpReward: 150,
      completed: false,
      icon: UserGroupIcon,
      color: 'bg-orange-500'
    }
  ];

  useEffect(() => {
    if (timeLeft > 0 && gameState === 'playing') {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        if (timeLeft <= 1) {
          endGame(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, gameState]);

  const startGame = (challenge: GameChallenge) => {
    setCurrentGame(challenge);
    setGameState('playing');
    setScore(0);
    if (challenge.timeLimit) {
      setTimeLeft(challenge.timeLimit);
    }
    
    // Initialize game-specific data
    switch (challenge.type) {
      case 'puzzle':
        setGameData({
          codeBlocks: generateCodeBlocks(),
          targetOrder: [0, 1, 2, 3, 4]
        });
        break;
      case 'syntax':
        setGameData({
          codeSnippet: generateCodeWithErrors(),
          errors: 3
        });
        break;
      case 'memory':
        setGameData({
          cards: generateMemoryCards(),
          flipped: [],
          matched: []
        });
        break;
      case 'flashcards':
        setCurrentView('flashcards');
        setGameState('menu');
        return;
      case 'ai_assistant':
        setCurrentView('ai_assistant');
        setGameState('menu');
        return;
      case 'peer_coaching':
        setCurrentView('peer_coaching');
        setGameState('menu');
        return;
      default:
        setGameData({});
    }
  };

  const endGame = (won: boolean) => {
    setGameState('completed');
    if (won && currentGame) {
      // Award XP
      addXP(score, 'code_game', `Completed ${currentGame.title}`);
      
      // Update challenge completion
      // In a real app, you'd save this to the backend
    }
  };

  const generateCodeBlocks = () => [
    { id: 0, code: 'function calculateSum(a, b) {', type: 'function_declaration' },
    { id: 1, code: '  return a + b;', type: 'return_statement' },
    { id: 2, code: '}', type: 'closing_brace' },
    { id: 3, code: 'const result = calculateSum(5, 3);', type: 'function_call' },
    { id: 4, code: 'console.log(result);', type: 'output_statement' }
  ];

  const generateCodeWithErrors = () => `
function calculateArea(radius) {
  const pi = 3.14159;
  area = pi * radius * radius;  // Missing 'const'
  return area;
}

const circleArea = calculateArea(5;
console.log("Area:", circleArea);  // Missing closing parenthesis
  `.trim();

  const generateMemoryCards = () => [
    { id: 1, concept: 'Variable', definition: 'A container for storing data values' },
    { id: 2, concept: 'Function', definition: 'A reusable block of code' },
    { id: 3, concept: 'Loop', definition: 'Repeats a block of code multiple times' },
    { id: 4, concept: 'Array', definition: 'An ordered collection of elements' },
    { id: 5, concept: 'Object', definition: 'A collection of key-value pairs' },
    { id: 6, concept: 'String', definition: 'A sequence of characters' }
  ];

  // Initialize sample data
  useEffect(() => {
    setFlashCards([
      {
        id: 1,
        concept: 'Variables',
        definition: 'A named storage location that can hold data values',
        example: 'let name = "John"; const age = 25;',
        category: 'Basics',
        difficulty: 'beginner'
      },
      {
        id: 2,
        concept: 'Functions',
        definition: 'A reusable block of code that performs a specific task',
        example: 'function greet(name) { return "Hello " + name; }',
        category: 'Basics',
        difficulty: 'beginner'
      },
      {
        id: 3,
        concept: 'Arrays',
        definition: 'An ordered collection of elements stored at contiguous memory locations',
        example: 'let numbers = [1, 2, 3, 4, 5];',
        category: 'Data Structures',
        difficulty: 'beginner'
      },
      {
        id: 4,
        concept: 'Objects',
        definition: 'A collection of key-value pairs representing real-world entities',
        example: 'let person = { name: "John", age: 30 };',
        category: 'Data Structures',
        difficulty: 'beginner'
      },
      {
        id: 5,
        concept: 'Promises',
        definition: 'An object representing the eventual completion or failure of an asynchronous operation',
        example: 'new Promise((resolve, reject) => { /* async code */ });',
        category: 'Asynchronous',
        difficulty: 'intermediate'
      }
    ]);

    setPeerCoaches([
      {
        id: 1,
        username: 'CodeMaster_Pro',
        level: 25,
        xp: 15000,
        expertise: ['JavaScript', 'React', 'Node.js'],
        rating: 4.9,
        hourlyRate: 50,
        available: true,
        avatar: '👨‍💻'
      },
      {
        id: 2,
        username: 'AlgoQueen',
        level: 30,
        xp: 25000,
        expertise: ['Algorithms', 'Data Structures', 'Python'],
        rating: 4.8,
        hourlyRate: 75,
        available: true,
        avatar: '👩‍💻'
      },
      {
        id: 3,
        username: 'WebWizard',
        level: 20,
        xp: 12000,
        expertise: ['HTML', 'CSS', 'JavaScript', 'React'],
        rating: 4.7,
        hourlyRate: 40,
        available: false,
        avatar: '🧙‍♂️'
      }
    ]);
  }, []);

  const renderMainMenu = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative text-center py-16 px-4">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <TrophyIcon className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">✨</span>
              </div>
            </div>
            <div className="ml-6">
              <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                Code Learning Hub
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-2"></div>
            </div>
          </div>
          <p className="text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed font-medium">
            Master programming through interactive games, AI assistance, peer coaching, and comprehensive flashcards
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live Learning
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              AI Powered
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
              Community Driven
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { id: 'games', label: 'Games', icon: PlayIcon, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500' },
              { id: 'flashcards', label: 'Flashcards', icon: BookOpenIcon, color: 'from-green-500 to-green-600', bgColor: 'bg-green-500' },
              { id: 'ai_assistant', label: 'AI Assistant', icon: SparklesIcon, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500' },
              { id: 'peer_coaching', label: 'Peer Coaching', icon: UserGroupIcon, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as any)}
                className={`flex items-center px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                  currentView === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                    : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className={`h-6 w-6 mr-3 ${currentView === tab.id ? 'animate-pulse' : ''}`} />
                <span className="text-lg">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content based on current view */}
      {currentView === 'games' && renderGamesSection()}
      {currentView === 'flashcards' && renderFlashcardsSection()}
      {currentView === 'ai_assistant' && renderAIAssistantSection()}
      {currentView === 'peer_coaching' && renderPeerCoachingSection()}
    </div>
  );

  const renderGamesSection = () => (
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {challenges.filter(c => ['puzzle', 'syntax', 'golf', 'memory', 'speed'].includes(c.type)).map((challenge) => (
          <div
            key={challenge.id}
            className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden ${
              challenge.completed 
                ? 'ring-2 ring-green-500 ring-opacity-50' 
                : 'hover:ring-2 hover:ring-blue-500 hover:ring-opacity-50'
            }`}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${challenge.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
            
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 ${challenge.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  {challenge.icon && <challenge.icon className="h-7 w-7 text-white" />}
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {challenge.difficulty}
                  </div>
                  <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    +{challenge.xpReward} XP
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {challenge.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                {challenge.description}
              </p>

              {challenge.timeLimit && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  {challenge.timeLimit}s time limit
                </div>
              )}

              {challenge.bestScore && (
                <div className="text-sm text-green-600 dark:text-green-400 mb-4 font-medium">
                  🏆 Best Score: {challenge.bestScore}
                </div>
              )}

              <button
                onClick={() => startGame(challenge)}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  challenge.completed
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                } shadow-lg hover:shadow-xl`}
              >
                {challenge.completed ? '🎮 Play Again' : '🚀 Start Game'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFlashcardsSection = () => (
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          📚 Interactive Flashcards
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Master programming concepts with our comprehensive flashcard system
        </p>
      </div>

      {flashCards.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Card {currentFlashCard + 1} of {flashCards.length}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                flashCards[currentFlashCard]?.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                flashCards[currentFlashCard]?.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {flashCards[currentFlashCard]?.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {flashCards[currentFlashCard]?.category}
              </span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {flashCards[currentFlashCard]?.concept}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {flashCards[currentFlashCard]?.definition}
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Example:</h4>
              <code className="text-sm font-mono text-blue-600 dark:text-blue-400">
                {flashCards[currentFlashCard]?.example}
              </code>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setCurrentFlashCard(Math.max(0, currentFlashCard - 1))}
              disabled={currentFlashCard === 0}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="h-5 w-5 inline mr-2" />
              Previous
            </button>
            <button
              onClick={() => {
                addXP(5, 'flashcard', `Studied ${flashCards[currentFlashCard]?.concept}`);
                setCurrentFlashCard(Math.min(flashCards.length - 1, currentFlashCard + 1));
              }}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
            >
              Mark as Studied
            </button>
            <button
              onClick={() => setCurrentFlashCard(Math.min(flashCards.length - 1, currentFlashCard + 1))}
              disabled={currentFlashCard === flashCards.length - 1}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRightIcon className="h-5 w-5 inline ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderAIAssistantSection = () => (
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          🤖 AI Programming Assistant
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Get instant help with your coding questions from our AI tutor
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {aiConversation.messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <SparklesIcon className="h-12 w-12 mx-auto mb-4 text-purple-500" />
              <p>Ask me anything about programming! I'm here to help you learn.</p>
            </div>
          ) : (
            aiConversation.messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                }`}>
                  {message.content}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex space-x-4">
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Ask a programming question..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            onKeyPress={(e) => e.key === 'Enter' && handleAISubmit()}
          />
          <button
            onClick={handleAISubmit}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );

  const renderPeerCoachingSection = () => (
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          👥 Peer Coaching Network
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Learn from top performers and experienced developers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {peerCoaches.map((coach) => (
          <div key={coach.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-4">{coach.avatar}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {coach.username}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Level {coach.level}</span>
                    <span className="text-sm text-yellow-600">⭐ {coach.rating}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Expertise:</h4>
                <div className="flex flex-wrap gap-2">
                  {coach.expertise.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ${coach.hourlyRate}/hour
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  coach.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {coach.available ? 'Available' : 'Busy'}
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedCoach(coach);
                  setCoachingSession(true);
                }}
                disabled={!coach.available}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  coach.available
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {coach.available ? 'Book Session' : 'Not Available'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const handleAISubmit = () => {
    if (!aiInput.trim()) return;

    const userMessage = {
      role: 'user' as const,
      content: aiInput,
      timestamp: new Date()
    };

    const aiResponse = {
      role: 'assistant' as const,
      content: `I understand you're asking about "${aiInput}". Here's a helpful explanation...`,
      timestamp: new Date()
    };

    setAiConversation(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage, aiResponse]
    }));

    setAiInput('');
    addXP(3, 'ai_assistant', 'Asked AI question');
  };

  const renderCodePuzzle = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Arrange the code blocks in the correct order
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Drag and drop the blocks to create a working function
        </p>
      </div>

      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 min-h-[200px]">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Drop code blocks here in the correct order
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {gameData?.codeBlocks?.map((block: any) => (
          <div
            key={block.id}
            className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 cursor-move hover:border-primary-500"
          >
            <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
              {block.code}
            </code>
          </div>
        ))}
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => endGame(true)}
          className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600"
        >
          Check Solution
        </button>
        <button
          onClick={() => setGameState('menu')}
          className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );

  const renderSyntaxHunt = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Find the syntax errors!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Click on the lines with errors. Time remaining: {timeLeft}s
        </p>
      </div>

      <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm">
        <pre>{gameData?.codeSnippet}</pre>
      </div>

      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Errors found: 0 / {gameData?.errors}
        </p>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => endGame(true)}
          className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600"
        >
          Submit Answer
        </button>
        <button
          onClick={() => setGameState('menu')}
          className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );

  const renderCodeGolf = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Code Golf Challenge
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Write the shortest possible code to solve the problem
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Problem: Find the sum of all even numbers from 1 to n
        </h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p><strong>Input:</strong> A positive integer n</p>
          <p><strong>Output:</strong> Sum of even numbers from 1 to n</p>
          <p><strong>Example:</strong> n = 6 → 2 + 4 + 6 = 12</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Your Solution:</h4>
          <textarea
            className="w-full h-32 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm border border-gray-700 focus:border-primary-500 focus:outline-none"
            placeholder="Write your code here..."
            defaultValue={`function sumEven(n) {
  // Your code here
}`}
          />
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Character count: <span className="font-mono">0</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Test Cases:</h4>
          <div className="space-y-3">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
              <div className="text-sm font-mono">n = 4 → Expected: 6</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
              <div className="text-sm font-mono">n = 10 → Expected: 30</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
              <div className="text-sm font-mono">n = 20 → Expected: 110</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => endGame(true)}
          className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600"
        >
          Test Solution
        </button>
        <button
          onClick={() => setGameState('menu')}
          className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );

  const renderMemoryMatch = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Memory Match
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Match programming concepts with their definitions
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {gameData?.cards?.map((card: any) => (
          <div
            key={card.id}
            className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 h-32 flex items-center justify-center text-center cursor-pointer hover:border-primary-500"
          >
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {card.concept}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => endGame(true)}
          className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600"
        >
          Check Matches
        </button>
        <button
          onClick={() => setGameState('menu')}
          className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );

  const renderGameContent = () => {
    if (!currentGame) return null;

    switch (currentGame.type) {
      case 'puzzle':
        return renderCodePuzzle();
      case 'syntax':
        return renderSyntaxHunt();
      case 'golf':
        return renderCodeGolf();
      case 'memory':
        return renderMemoryMatch();
      default:
        return <div>Game type not implemented yet</div>;
    }
  };

  const renderGameCompleted = () => (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto">
        <CheckCircleIcon className="h-12 w-12 text-white" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Game Completed!
      </h2>
      
      <div className="text-xl text-gray-600 dark:text-gray-400">
        Score: {score}
      </div>
      
      <div className="text-lg text-green-600 dark:text-green-400">
        +{currentGame?.xpReward} XP earned!
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => startGame(currentGame!)}
          className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600"
        >
          Play Again
        </button>
        <button
          onClick={() => setGameState('menu')}
          className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {gameState === 'menu' && renderMainMenu()}
      {gameState === 'playing' && renderGameContent()}
      {gameState === 'completed' && renderGameCompleted()}
    </div>
  );
};

export default CodeGames;
