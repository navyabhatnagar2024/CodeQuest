import React, { useState } from 'react';
import { useGamification } from '../contexts/GamificationContext';
import { useAuth } from '../contexts/AuthContext';
import {
  TrophyIcon,
  StarIcon,
  UserGroupIcon,
  ChartBarIcon,
  GiftIcon,
  CheckCircleIcon,
  XCircleIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';

const GamifiedDashboard: React.FC = () => {
  const { 
    stats, 
    achievements, 
    badges, 
    dailyChallenge, 
    studyGroups,
    loading,
    completeDailyChallenge,
    refreshStats,
    getLevelProgress,
    getStreakEmoji
  } = useGamification();
  
  const { user } = useAuth();
  const [showAchievements, setShowAchievements] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showStudyGroups, setShowStudyGroups] = useState(false);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const levelProgress = getLevelProgress();
  const streakEmoji = getStreakEmoji();

  const handleDailyChallengeComplete = async () => {
    if (!dailyChallenge) return;
    
    try {
      const result = await completeDailyChallenge(dailyChallenge.id);
      await refreshStats();
      
      // Show success message
      alert(`🎉 Daily challenge completed! You earned ${result.xpEarned} XP${result.bonusEarned ? ' (including bonus!)' : ''}`);
    } catch (error) {
      alert('Failed to complete daily challenge. Please try again.');
    }
  };

  const getDifficultyColor = (difficulty: string | undefined) => {
    if (!difficulty) return 'text-gray-600 bg-gray-100';
    
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityColor = (rarity: string | undefined) => {
    if (!rarity) return 'text-gray-600 bg-gray-100';
    
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* XP and Level Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Level {stats.xp.current_level} - {user?.username}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{streakEmoji}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stats.xp.streak_days} day streak
            </span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>{levelProgress.current} XP</span>
            <span>{levelProgress.next} XP to next level</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${levelProgress.percentage}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {stats.xp.total_xp}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total XP Earned</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.achievements}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.badges}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Badges</div>
          </div>
        </div>
      </div>

      {/* Daily Challenge Section */}
      {dailyChallenge && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Daily Challenge</h3>
            <GiftIcon className="h-6 w-6" />
          </div>
          
          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">{dailyChallenge.title}</h4>
            <p className="text-blue-100 mb-3">{dailyChallenge.description}</p>
            
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-sm bg-white/20 rounded-full px-3 py-1">
                {dailyChallenge.xp_reward} XP
              </span>
                             <span className={`text-sm rounded-full px-3 py-1 ${getDifficultyColor(dailyChallenge.difficulty_level)}`}>
                 {dailyChallenge.difficulty_level}
               </span>
              <div className="flex items-center space-x-2">
                <StarIcon className="h-4 w-4" />
                <span className="text-sm">{dailyChallenge.xp_reward} XP</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDailyChallengeComplete}
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Complete Challenge
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setShowAchievements(true)}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
        >
          <TrophyIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <div className="font-semibold text-gray-900 dark:text-gray-100">Achievements</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{stats.achievements} unlocked</div>
        </button>

        <button
          onClick={() => setShowBadges(true)}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
        >
          <StarIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <div className="font-semibold text-gray-900 dark:text-gray-100">Badges</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{stats.badges} earned</div>
        </button>

        <button
          onClick={() => setShowStudyGroups(true)}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
        >
          <UserGroupIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <div className="font-semibold text-gray-900 dark:text-gray-100">Study Groups</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{studyGroups.length} joined</div>
        </button>

        <button
          onClick={() => window.location.href = '/code-games'}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
        >
          <PuzzlePieceIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
          <div className="font-semibold text-gray-900 dark:text-gray-100">Code Games</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Learn through games</div>
        </button>

        <button
          onClick={() => window.location.href = '/leaderboard'}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
        >
          <ChartBarIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <div className="font-semibold text-gray-900 dark:text-gray-100">Leaderboard</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">View rankings</div>
        </button>
      </div>

      {/* Recent XP Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Recent XP Activity</h3>
        <div className="space-y-3">
          {stats.recentXP && stats.recentXP.length > 0 ? (
            stats.recentXP.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {transaction.description}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">+{transaction.xp_amount} XP</div>
                  <div className="text-xs text-gray-500 uppercase">{transaction.transaction_type}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-lg mb-2">No recent XP activity</div>
              <div className="text-sm">Complete challenges and solve problems to earn XP!</div>
            </div>
          )}
        </div>
      </div>

      {/* Achievements Modal */}
      {showAchievements && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Achievements</h3>
              <button
                onClick={() => setShowAchievements(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 ${
                    achievement.is_completed
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.is_completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      {achievement.is_completed ? (
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      ) : (
                        <TrophyIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {achievement.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {achievement.requirement_type}: {achievement.requirement_value}
                        </span>
                        {achievement.xp_reward > 0 && (
                          <span className="text-green-600 font-medium">
                            +{achievement.xp_reward} XP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Badges Modal */}
      {showBadges && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Badges</h3>
              <button
                onClick={() => setShowBadges(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border-2 text-center ${
                    badge.earned_at
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
                    badge.earned_at ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    <StarIcon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {badge.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {badge.description}
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity}
                    </span>
                    {badge.earned_at && (
                      <span className="text-xs text-green-600">
                        Earned {new Date(badge.earned_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Study Groups Modal */}
      {showStudyGroups && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Study Groups</h3>
              <button
                onClick={() => setShowStudyGroups(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            {studyGroups.length === 0 ? (
              <div className="text-center py-8">
                <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No study groups yet
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Join or create a study group to collaborate with other coders!
                </p>
                <button className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                  Create Study Group
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {studyGroups.map((group) => (
                  <div key={group.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {group.name}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        group.user_role === 'creator' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {group.user_role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {group.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Created by {group.creator_username}</span>
                      <span>{group.member_count} members</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamifiedDashboard;
