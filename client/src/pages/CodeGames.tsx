import React, { useState, useEffect } from 'react';
import { useGamification } from '../contexts/GamificationContext';
import {
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  UserGroupIcon,
  SparklesIcon,
  BookOpenIcon,
  TrophyIcon,
  StarIcon,
  FireIcon,
  CogIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  HeartIcon,
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
    <div className="min-h-screen">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="gamified-card border-b border-purple-200 mb-8">
          <div className="text-center py-16 px-4">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <TrophyIcon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">✨</span>
                </div>
              </div>
              <div className="ml-6">
                <h1 className="text-6xl font-black text-white leading-tight">
                  Code Learning Hub
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mt-2"></div>
              </div>
            </div>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto leading-relaxed font-medium">
              Master programming through interactive games, AI assistance, peer coaching, and comprehensive flashcards
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <div className="flex items-center text-sm text-purple-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live Learning
              </div>
              <div className="flex items-center text-sm text-purple-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                AI Powered
              </div>
              <div className="flex items-center text-sm text-purple-200">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                Community Driven
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="gamified-card p-2">
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
                    : 'bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 hover:text-white'
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
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">
          🎮 Interactive Learning Games
        </h2>
        <p className="text-lg text-purple-200 max-w-2xl mx-auto">
          Choose your challenge and start earning XP while mastering programming concepts
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {challenges.filter(c => ['puzzle', 'syntax', 'golf', 'memory', 'speed'].includes(c.type)).map((challenge) => (
          <div
            key={challenge.id}
            className={`group relative interactive-card hover-lift rounded-3xl overflow-hidden ${
              challenge.completed 
                ? 'ring-4 ring-green-500/30 shadow-green-500/20' 
                : 'hover:ring-4 hover:ring-purple-500/30 hover:shadow-purple-500/20'
            }`}
          >
            {/* Enhanced Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${challenge.color} opacity-5 group-hover:opacity-15 transition-all duration-500`} />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="relative p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className={`w-16 h-16 ${challenge.color} rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300`}>
                  {challenge.icon && <challenge.icon className="h-8 w-8 text-white" />}
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {challenge.difficulty}
                  </div>
                  <div className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mt-1">
                    +{challenge.xpReward} XP
                  </div>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
                {challenge.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-base leading-relaxed">
                {challenge.description}
              </p>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {challenge.timeLimit && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                    <ClockIcon className="h-4 w-4 mr-2 text-blue-500" />
                    {challenge.timeLimit}s time limit
                  </div>
                )}
                {challenge.bestScore && (
                  <div className="flex items-center text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                    <span className="text-lg mr-2">🏆</span>
                    Best Score: {challenge.bestScore}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => startGame(challenge)}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  challenge.completed
                    ? 'bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white hover:from-green-600 hover:via-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl shadow-green-500/25'
                    : 'bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 text-white hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl shadow-blue-500/25'
                }`}
              >
                <span className="flex items-center justify-center">
                  {challenge.completed ? (
                    <>
                      <span className="mr-2">🎮</span>
                      Play Again
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🚀</span>
                      Start Game
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFlashcardsSection = () => (
    <div className="max-w-5xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          📚 Interactive Flashcards
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Master programming concepts with our comprehensive flashcard system
        </p>
      </div>

      {flashCards.length > 0 && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-gray-200/50 dark:border-gray-700/50">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Progress: {currentFlashCard + 1} of {flashCards.length}
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  flashCards[currentFlashCard]?.difficulty === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  flashCards[currentFlashCard]?.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {flashCards[currentFlashCard]?.difficulty}
                </span>
                <span className="px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {flashCards[currentFlashCard]?.category}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentFlashCard + 1) / flashCards.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Flashcard Content */}
          <div className="text-center mb-10">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-3xl p-8 mb-8 border border-gray-200/50 dark:border-gray-600/50">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {flashCards[currentFlashCard]?.concept}
              </h3>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {flashCards[currentFlashCard]?.definition}
              </p>
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-600/50">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg">💡 Example:</h4>
                <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                  <code>{flashCards[currentFlashCard]?.example}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => setCurrentFlashCard(Math.max(0, currentFlashCard - 1))}
              disabled={currentFlashCard === 0}
              className="flex items-center px-8 py-4 bg-gray-500 text-white rounded-2xl font-bold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <ArrowLeftIcon className="h-6 w-6 mr-2" />
              Previous
            </button>
            <button
              onClick={() => {
                addXP(5, 'flashcard', `Studied ${flashCards[currentFlashCard]?.concept}`);
                setCurrentFlashCard(Math.min(flashCards.length - 1, currentFlashCard + 1));
              }}
              className="flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <span className="mr-2">✅</span>
              Mark as Studied
            </button>
            <button
              onClick={() => setCurrentFlashCard(Math.min(flashCards.length - 1, currentFlashCard + 1))}
              disabled={currentFlashCard === flashCards.length - 1}
              className="flex items-center px-8 py-4 bg-gray-500 text-white rounded-2xl font-bold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Next
              <ArrowRightIcon className="h-6 w-6 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderAIAssistantSection = () => (
    <div className="max-w-5xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          🤖 AI Programming Assistant
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Get instant help with your coding questions from our AI tutor
        </p>
      </div>

      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
        {/* Chat Header */}
        <div className="flex items-center justify-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">AI Programming Tutor</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Always here to help you learn</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto mb-6 p-4 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-600/50">
          {aiConversation.messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Welcome to AI Programming Tutor!</h3>
              <p className="text-sm">Ask me anything about programming, algorithms, or coding concepts.</p>
              <div className="mt-4 text-xs text-gray-400">
                💡 Try asking: "How do I implement a binary search?" or "Explain async/await in JavaScript"
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {aiConversation.messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl shadow-lg ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
                  }`}>
                    <div className="flex items-start">
                      {message.role === 'assistant' && (
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3 mt-1">
                          <SparklesIcon className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div className="text-sm leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask a programming question..."
              className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-lg transition-all duration-300"
              onKeyPress={(e) => e.key === 'Enter' && handleAISubmit()}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              Press Enter to send
            </div>
          </div>
          <button
            onClick={handleAISubmit}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center">
              <span className="mr-2">🚀</span>
              Send
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPeerCoachingSection = () => (
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          👥 Peer Coaching Network
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Learn from top performers and experienced developers in our community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {peerCoaches.map((coach) => (
          <div key={coach.id} className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
            {/* Status Indicator */}
            <div className={`absolute top-4 right-4 w-4 h-4 rounded-full ${coach.available ? 'bg-green-500 animate-pulse' : 'bg-red-500'} shadow-lg`}></div>
            
            <div className="p-8">
              {/* Coach Header */}
              <div className="flex items-center mb-6">
                <div className="text-4xl mr-4 transform group-hover:scale-110 transition-transform duration-300">
                  {coach.avatar}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {coach.username}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      Level {coach.level}
                    </span>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">⭐</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{coach.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{coach.xp.toLocaleString()}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total XP</div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">${coach.hourlyRate}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">per hour</div>
                </div>
              </div>

              {/* Expertise */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 text-lg">Expertise:</h4>
                <div className="flex flex-wrap gap-2">
                  {coach.expertise.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-md">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Availability Status */}
              <div className="mb-6">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                  coach.available 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${coach.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  {coach.available ? 'Available Now' : 'Currently Busy'}
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setSelectedCoach(coach);
                  setCoachingSession(true);
                }}
                disabled={!coach.available}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  coach.available
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center justify-center">
                  {coach.available ? (
                    <>
                      <span className="mr-2">📅</span>
                      Book Session
                    </>
                  ) : (
                    <>
                      <span className="mr-2">⏰</span>
                      Not Available
                    </>
                  )}
                </span>
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
