import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { gamificationAPI } from '../services/api';

interface XPData {
  current_xp: number;
  current_level: number;
  total_xp: number;
  xp_to_next_level: number;
  streak_days: number;
  last_activity_date: string;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  xp_reward: number;
  category: string;
  requirement_type: string;
  requirement_value: number;
  is_hidden: boolean;
  earned_at?: string;
  progress_current?: number;
  progress_required?: number;
  is_completed?: boolean;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at?: string;
}

interface XPTransaction {
  id: number;
  xp_amount: number;
  transaction_type: string;
  description: string;
  related_problem_id?: number;
  related_contest_id?: number;
  related_submission_id?: number;
  created_at: string;
  problem_title?: string;
  contest_title?: string;
}

interface LeaderboardEntry {
  username: string;
  full_name: string;
  current_level: number;
  current_xp: number;
  streak_days: number;
  achievements_count: number;
}

interface DailyChallenge {
  id: number;
  title: string;
  description: string;
  problem_id: number;
  problem_title: string;
  difficulty_level: string;
  challenge_date: string;
  xp_reward: number;
  bonus_xp: number;
  bonus_deadline_hours: number;
}

interface CodeReview {
  id: number;
  submission_id: number;
  reviewer_id: number;
  review_text: string;
  rating: number;
  helpful_votes: number;
  created_at: string;
  reviewer_username: string;
  reviewer_full_name: string;
}

interface StudyGroup {
  id: number;
  name: string;
  description: string;
  creator_id: number;
  max_members: number;
  is_public: boolean;
  created_at: string;
  creator_username: string;
  creator_full_name: string;
  member_count: number;
  user_role?: string;
}

interface GamificationStats {
  xp: XPData;
  achievements: number;
  badges: number;
  recentXP: XPTransaction[];
}

interface GamificationContextType {
  // State
  stats: GamificationStats | null;
  achievements: Achievement[];
  badges: Badge[];
  leaderboard: LeaderboardEntry[];
  dailyChallenge: DailyChallenge | null;
  studyGroups: StudyGroup[];
  codeReviews: CodeReview[];
  
  // Loading states
  loading: boolean;
  leaderboardLoading: boolean;
  
  // Actions
  refreshStats: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  refreshAchievements: () => Promise<void>;
  refreshBadges: () => Promise<void>;
  refreshStudyGroups: () => Promise<void>;
  completeDailyChallenge: (challengeId: number) => Promise<{ xpEarned: number; bonusEarned: boolean }>;
  createCodeReview: (submissionId: number, reviewText: string, rating: number) => Promise<void>;
  createStudyGroup: (name: string, description: string, maxMembers: number, isPublic: boolean) => Promise<void>;
  joinStudyGroup: (groupId: number) => Promise<void>;
  addXP: (amount: number, type: string, description: string) => Promise<void>;
  
  // XP and Level helpers
  getLevelProgress: () => { current: number; next: number; percentage: number };
  getStreakEmoji: () => string;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

interface GamificationProviderProps {
  children: ReactNode;
}

export const GamificationProvider: React.FC<GamificationProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [codeReviews, setCodeReviews] = useState<CodeReview[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Initialize user XP when they first authenticate
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeUserXP();
    }
  }, [isAuthenticated, user]);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated && user) {
      loadInitialData();
    }
  }, [isAuthenticated, user]);

  const initializeUserXP = async () => {
    try {
      await gamificationAPI.initializeUserXP();
    } catch (error) {
      console.error('Failed to initialize user XP:', error);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        refreshStats(),
        refreshAchievements(),
        refreshBadges(),
        refreshDailyChallenge(),
        refreshStudyGroups()
      ]);
    } catch (error) {
      console.error('Failed to load initial gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      const response = await gamificationAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  const refreshLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const response = await gamificationAPI.getLeaderboard();
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to refresh leaderboard:', error);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const refreshAchievements = async () => {
    try {
      const response = await gamificationAPI.getAchievements();
      setAchievements(response.data);
    } catch (error) {
      console.error('Failed to refresh achievements:', error);
    }
  };

  const refreshBadges = async () => {
    try {
      const response = await gamificationAPI.getBadges();
      setBadges(response.data);
    } catch (error) {
      console.error('Failed to refresh badges:', error);
    }
  };

  const refreshDailyChallenge = async () => {
    try {
      const response = await gamificationAPI.getDailyChallenge();
      setDailyChallenge(response.data);
    } catch (error) {
      console.error('Failed to refresh daily challenge:', error);
    }
  };

  const refreshStudyGroups = async () => {
    try {
      const response = await gamificationAPI.getStudyGroups({ type: 'joined' });
      setStudyGroups(response.data);
    } catch (error) {
      console.error('Failed to refresh study groups:', error);
    }
  };

  const completeDailyChallenge = async (challengeId: number) => {
    try {
      const response = await gamificationAPI.completeDailyChallenge(challengeId);
      await refreshStats(); // Refresh stats to show new XP
      return response.data;
    } catch (error) {
      console.error('Failed to complete daily challenge:', error);
      throw error;
    }
  };

  const createCodeReview = async (submissionId: number, reviewText: string, rating: number) => {
    try {
      await gamificationAPI.createCodeReview(submissionId, reviewText, rating);
      await refreshStats(); // Refresh stats to show new XP
    } catch (error) {
      console.error('Failed to create code review:', error);
      throw error;
    }
  };

  const createStudyGroup = async (name: string, description: string, maxMembers: number, isPublic: boolean) => {
    try {
      await gamificationAPI.createStudyGroup(name, description, maxMembers, isPublic);
      await refreshStudyGroups();
      await refreshStats(); // Refresh stats to show new XP
    } catch (error) {
      console.error('Failed to create study group:', error);
      throw error;
    }
  };

  const joinStudyGroup = async (groupId: number) => {
    try {
      await gamificationAPI.joinStudyGroup(groupId);
      await refreshStudyGroups();
      await refreshStats(); // Refresh stats to show new XP
    } catch (error) {
      console.error('Failed to join study group:', error);
      throw error;
    }
  };

  const addXP = async (amount: number, type: string, description: string) => {
    try {
      await gamificationAPI.addXP(amount, type, description);
      await refreshStats(); // Refresh stats to show new XP
    } catch (error) {
      console.error('Failed to add XP:', error);
      throw error;
    }
  };

  // Helper functions
  const getLevelProgress = () => {
    if (!stats?.xp) return { current: 0, next: 100, percentage: 0 };
    
    const { current_xp, xp_to_next_level } = stats.xp;
    const currentLevelXP = current_xp % xp_to_next_level;
    const percentage = Math.round((currentLevelXP / xp_to_next_level) * 100);
    
    return {
      current: currentLevelXP,
      next: xp_to_next_level,
      percentage
    };
  };

  const getStreakEmoji = () => {
    if (!stats?.xp?.streak_days) return '🔥';
    
    const streak = stats.xp.streak_days;
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⚡';
    return '💪';
  };

  const value: GamificationContextType = {
    // State
    stats,
    achievements,
    badges,
    leaderboard,
    dailyChallenge,
    studyGroups,
    codeReviews,
    
    // Loading states
    loading,
    leaderboardLoading,
    
    // Actions
    refreshStats,
    refreshLeaderboard,
    refreshAchievements,
    refreshBadges,
    refreshStudyGroups,
    completeDailyChallenge,
    createCodeReview,
    createStudyGroup,
    joinStudyGroup,
    addXP,
    
    // Helpers
    getLevelProgress,
    getStreakEmoji
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};
