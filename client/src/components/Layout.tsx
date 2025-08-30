import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  CodeBracketIcon,
  TrophyIcon,
  UserIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  UsersIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Practice', href: '/practice', icon: CodeBracketIcon },
    { name: 'Code Games', href: '/code-games', icon: PuzzlePieceIcon },
    { name: 'Study Groups', href: '/study-groups', icon: UsersIcon },
    { name: 'Contests', href: '/contests', icon: TrophyIcon },
    { name: 'Leaderboard', href: '/leaderboard', icon: ChartBarIcon },
    { name: 'Submissions', href: '/submissions', icon: CodeBracketIcon },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: Cog6ToothIcon },
    { name: 'Manage Problems', href: '/admin/problems', icon: CodeBracketIcon },
    { name: 'Manage Contests', href: '/admin/contests', icon: TrophyIcon },
    { name: 'Manage Users', href: '/admin/users', icon: UsersIcon },
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Floating Particles Background */}
      <div className="floating-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-gradient-to-b from-purple-900/95 to-indigo-900/95 backdrop-blur-xl shadow-2xl border-r border-purple-300/20">
          {/* Mobile Header */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-purple-300/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <CodeBracketIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">CodeQuest</h1>
                <p className="text-xs text-purple-200">Learning Platform</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 transition-all duration-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Mobile Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive(item.href) 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' 
                    : 'text-purple-200 hover:bg-purple-500/20 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
                  isActive(item.href) 
                    ? 'bg-white/20' 
                    : 'bg-purple-500/20 group-hover:bg-purple-500/30'
                }`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span>{item.name}</span>
                {isActive(item.href) && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            ))}
            
            {user?.is_admin && (
              <>
                <div className="pt-6 pb-3">
                  <div className="flex items-center px-4 mb-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-3"></div>
                    <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                      Admin Panel
                    </h3>
                  </div>
                </div>
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive(item.href) 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' 
                        : 'text-purple-200 hover:bg-purple-500/20 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
                      isActive(item.href) 
                        ? 'bg-white/20' 
                        : 'bg-purple-500/20 group-hover:bg-purple-500/30'
                    }`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span>{item.name}</span>
                    {isActive(item.href) && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </Link>
                ))}
              </>
            )}
          </nav>
          
          {/* Mobile Footer */}
          <div className="p-4 border-t border-purple-300/20">
            {isAuthenticated ? (
              <div className="bg-purple-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user?.username}</p>
                    <p className="text-xs text-purple-200">Online</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-sm text-purple-200 hover:text-white bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-all duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="bg-purple-500/20 rounded-xl p-4 space-y-3">
                <Link
                  to="/login"
                  className="w-full px-3 py-2 text-sm text-purple-200 hover:text-white bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-all duration-200 text-center block"
                  onClick={() => setSidebarOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="w-full px-3 py-2 text-sm text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all duration-200 text-center block"
                  onClick={() => setSidebarOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-purple-900/95 to-indigo-900/95 backdrop-blur-xl shadow-2xl border-r border-purple-300/20">
          {/* Desktop Header */}
          <div className="flex h-20 items-center px-6 border-b border-purple-300/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <CodeBracketIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">CodeQuest</h1>
                <p className="text-xs text-purple-200">Learning Platform</p>
              </div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive(item.href) 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' 
                    : 'text-purple-200 hover:bg-purple-500/20 hover:text-white'
                }`}
              >
                <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
                  isActive(item.href) 
                    ? 'bg-white/20' 
                    : 'bg-purple-500/20 group-hover:bg-purple-500/30'
                }`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span>{item.name}</span>
                {isActive(item.href) && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            ))}
            
            {user?.is_admin && (
              <>
                <div className="pt-6 pb-3">
                  <div className="flex items-center px-4 mb-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-3"></div>
                    <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                      Admin Panel
                    </h3>
                  </div>
                </div>
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive(item.href) 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' 
                        : 'text-purple-200 hover:bg-purple-500/20 hover:text-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
                      isActive(item.href) 
                        ? 'bg-white/20' 
                        : 'bg-purple-500/20 group-hover:bg-purple-500/30'
                    }`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span>{item.name}</span>
                    {isActive(item.href) && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </Link>
                ))}
              </>
            )}
          </nav>
          
          {/* Desktop Footer */}
          <div className="p-4 border-t border-purple-300/20">
            {isAuthenticated ? (
              <div className="bg-purple-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user?.username}</p>
                    <p className="text-xs text-purple-200">Online</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-sm text-purple-200 hover:text-white bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-all duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="bg-purple-500/20 rounded-xl p-4 space-y-3">
                <Link
                  to="/login"
                  className="w-full px-3 py-2 text-sm text-purple-200 hover:text-white bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-all duration-200 text-center block"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="w-full px-3 py-2 text-sm text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all duration-200 text-center block"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-purple-300/20 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 backdrop-blur-xl px-6 shadow-lg">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 transition-all duration-200"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {isAuthenticated ? (
                <div className="flex items-center gap-x-4">
                  <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-300/20">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <UserIcon className="h-3 w-3 text-white" />
                    </div>
                    <div className="text-sm text-white">
                      <span className="font-medium">{user?.username}</span>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="p-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 transition-all duration-200"
                  >
                    <UserIcon className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-purple-200 hover:text-white bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-all duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-x-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-purple-200 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-purple-500/20"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
