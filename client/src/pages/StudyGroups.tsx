import React, { useState, useEffect } from 'react';
import { useGamification } from '../contexts/GamificationContext';
import { useAuth } from '../contexts/AuthContext';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  ClockIcon,
  UsersIcon,
  StarIcon,
  AcademicCapIcon,
  ChartBarIcon,
  PuzzlePieceIcon,
  CodeBracketIcon,
  CpuChipIcon,
  GlobeAltIcon,
  FireIcon
} from '@heroicons/react/24/outline';

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
  // Extended properties for UI display
  topic?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  schedule?: string;
  materials?: string[];
  last_activity?: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  groups_count: number;
}

const StudyGroups: React.FC = () => {
  const { user } = useAuth();
  const { studyGroups, refreshStudyGroups, createStudyGroup, joinStudyGroup } = useGamification();
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'recent' | 'members'>('popularity');
  const [notifications, setNotifications] = useState<Array<{id: number; message: string; type: 'success' | 'info' | 'warning'}>>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Sample topics data
  const topics: Topic[] = [
    {
      id: 'graph-theory',
      name: 'Graph Theory',
      description: 'Learn about graphs, trees, and graph algorithms',
      icon: ChartBarIcon,
      color: 'bg-blue-500',
      difficulty: 'intermediate',
      popularity: 95,
      groups_count: 8
    },
    {
      id: 'dynamic-programming',
      name: 'Dynamic Programming',
      description: 'Master optimization techniques and memoization',
      icon: PuzzlePieceIcon,
      color: 'bg-purple-500',
      difficulty: 'advanced',
      popularity: 98,
      groups_count: 12
    },
    {
      id: 'data-structures',
      name: 'Data Structures',
      description: 'Arrays, linked lists, stacks, queues, and more',
      icon: CpuChipIcon,
      color: 'bg-green-500',
      difficulty: 'beginner',
      popularity: 90,
      groups_count: 15
    },
    {
      id: 'algorithms',
      name: 'Algorithms',
      description: 'Sorting, searching, and algorithmic thinking',
      icon: CodeBracketIcon,
      color: 'bg-red-500',
      difficulty: 'intermediate',
      popularity: 92,
      groups_count: 10
    },
    {
      id: 'system-design',
      name: 'System Design',
      description: 'Design scalable and distributed systems',
      icon: GlobeAltIcon,
      color: 'bg-indigo-500',
      difficulty: 'advanced',
      popularity: 88,
      groups_count: 6
    },
    {
      id: 'machine-learning',
      name: 'Machine Learning',
      description: 'AI algorithms and statistical learning',
      icon: AcademicCapIcon,
      color: 'bg-pink-500',
      difficulty: 'advanced',
      popularity: 85,
      groups_count: 5
    }
  ];

  // Sample study groups data
  const [groups, setGroups] = useState<StudyGroup[]>([
    {
      id: 1,
      name: "Graph Theory Masters",
      description: "Deep dive into graph algorithms, spanning trees, and network flow problems. Perfect for competitive programming and technical interviews.",
      creator_id: 1,
      max_members: 20,
      member_count: 15,
      creator_username: "algo_expert",
      creator_full_name: "Sarah Chen",
      is_public: true,
      created_at: "2024-01-15",
      topic: "graph-theory",
      difficulty: "intermediate",
      last_activity: "2024-01-28",
      tags: ["competitive-programming", "interview-prep", "algorithms"],
      schedule: "Weekly sessions on Saturdays",
      materials: ["Graph Theory Textbook", "Practice Problems", "Video Lectures"]
    },
    {
      id: 2,
      name: "DP Warriors",
      description: "Conquer dynamic programming problems step by step. From basic concepts to advanced optimization techniques.",
      creator_id: 2,
      max_members: 15,
      member_count: 12,
      creator_username: "dp_master",
      creator_full_name: "Alex Rodriguez",
      is_public: true,
      created_at: "2024-01-10",
      topic: "dynamic-programming",
      difficulty: "advanced",
      last_activity: "2024-01-27",
      tags: ["leetcode", "competitive-programming", "optimization"],
      schedule: "Bi-weekly sessions on Sundays",
      materials: ["DP Problems Collection", "Solution Videos", "Practice Sets"]
    },
    {
      id: 3,
      name: "Data Structures Foundation",
      description: "Build a solid foundation in fundamental data structures. Hands-on implementation and problem-solving.",
      creator_id: 3,
      max_members: 25,
      member_count: 20,
      creator_username: "code_teacher",
      creator_full_name: "Mike Johnson",
      is_public: true,
      created_at: "2024-01-20",
      topic: "data-structures",
      difficulty: "beginner",
      last_activity: "2024-01-29",
      tags: ["beginners", "fundamentals", "implementation"],
      schedule: "Weekly sessions on Wednesdays",
      materials: ["Tutorial Videos", "Coding Exercises", "Reference Materials"]
    }
  ]);

  useEffect(() => {
    // Load study groups data
    if (studyGroups && studyGroups.length > 0) {
      setGroups(studyGroups);
    }
  }, [studyGroups]);

  const filteredGroups = groups.filter(group => {
    const matchesTopic = selectedTopic === 'all' || group.topic === selectedTopic;
    const matchesDifficulty = filterDifficulty === 'all' || group.difficulty === filterDifficulty;
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (group.tags && group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return matchesTopic && matchesDifficulty && matchesSearch;
  });

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.member_count - a.member_count;
      case 'recent':
        return new Date(b.last_activity || b.created_at).getTime() - new Date(a.last_activity || a.created_at).getTime();
      case 'members':
        return b.member_count - a.member_count;
      default:
        return 0;
    }
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTopicIcon = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    return topic ? topic.icon : UserGroupIcon;
  };

  const getTopicColor = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    return topic ? topic.color : 'bg-gray-500';
  };

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      await joinStudyGroup(groupId);
      // Update local state
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, member_count: group.member_count + 1, user_role: 'member' }
          : group
      ));
      showNotification('🎉 Successfully joined the study group! +50 XP earned!', 'success');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      console.error('Failed to join group:', error);
      showNotification('❌ Failed to join group. Please try again.', 'warning');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification ${
              notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>
      
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Header */}
      <div className="gamified-card border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🎓 Study Groups</h1>
              <p className="mt-2 text-purple-200">
                Join study groups to learn programming concepts with peers and earn XP!
              </p>
              <div className="mt-4 flex items-center space-x-4">
                <div className="xp-counter">
                  <div className="text-sm text-purple-200">Available Groups</div>
                  <div className="text-2xl font-bold">{groups.length}</div>
                </div>
                <div className="streak-counter">
                  <div className="text-sm text-purple-200">Active Topics</div>
                  <div className="text-2xl font-bold">{topics.length}</div>
                </div>
                <div className="px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-300/30">
                  <div className="text-sm text-purple-200">Completion</div>
                  <div className="text-2xl font-bold text-purple-300">
                    {Math.round((groups.filter(g => g.user_role).length / groups.length) * 100) || 0}%
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary inline-flex items-center glow-purple hover-lift"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Group
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 {/* Topics Grid */}
         <div className="mb-12">
           <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
             <span className="mr-3">🔥</span>
             Popular Topics
             <span className="ml-3 text-purple-200 text-lg">({topics.length} available)</span>
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {topics.map((topic) => (
               <div
                 key={topic.id}
                 className={`interactive-card transition-all duration-300 cursor-pointer border-2 ${
                   selectedTopic === topic.id ? 'border-purple-400 ring-2 ring-purple-200 glow-purple' : 'border-purple-200'
                 }`}
                 onClick={() => setSelectedTopic(topic.id === selectedTopic ? 'all' : topic.id)}
               >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${topic.color} rounded-lg flex items-center justify-center`}>
                    <topic.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(topic.difficulty)}`}>
                    {topic.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {topic.name}
                </h3>
                <p className="text-purple-200 text-sm mb-4">
                  {topic.description}
                </p>
                                 <div className="flex items-center justify-between text-sm text-purple-200">
                   <span className="flex items-center">
                     <UsersIcon className="h-4 w-4 mr-1" />
                     {topic.groups_count} groups
                   </span>
                   <span className="flex items-center">
                     <StarIcon className="h-4 w-4 mr-1" />
                     {topic.popularity}% popular
                   </span>
                 </div>
                 
                 {/* Progress indicator */}
                 <div className="mt-4">
                   <div className="flex items-center justify-between text-xs text-purple-200 mb-1">
                     <span>Difficulty</span>
                     <span className="capitalize">{topic.difficulty}</span>
                   </div>
                   <div className="w-full bg-purple-200/20 rounded-full h-2">
                     <div 
                       className={`h-2 rounded-full transition-all duration-500 ${
                         topic.difficulty === 'beginner' ? 'bg-green-400 w-1/3' :
                         topic.difficulty === 'intermediate' ? 'bg-yellow-400 w-2/3' :
                         'bg-red-400 w-full'
                       }`}
                     ></div>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </div>

                 {/* Filters and Search */}
         <div className="gamified-card mb-8">
           <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
             <div className="flex-1 max-w-md">
               <div className="relative">
                 <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-200" />
                 <input
                   type="text"
                   placeholder="🔍 Search study groups..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="form-input w-full pl-10 pr-4 hover-lift"
                 />
               </div>
             </div>
             
             <div className="flex gap-4">
               <select
                 value={filterDifficulty}
                 onChange={(e) => setFilterDifficulty(e.target.value as any)}
                 className="form-input px-3 py-2 hover-lift"
               >
                 <option value="all">🎯 All Difficulties</option>
                 <option value="beginner">🌱 Beginner</option>
                 <option value="intermediate">⚡ Intermediate</option>
                 <option value="advanced">🚀 Advanced</option>
               </select>
               
               <select
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value as any)}
                 className="form-input px-3 py-2 hover-lift"
               >
                 <option value="popularity">🔥 Most Popular</option>
                 <option value="recent">⏰ Recently Active</option>
                 <option value="members">👥 Most Members</option>
               </select>
             </div>
           </div>
           
           {/* Active filters display */}
           <div className="mt-4 flex flex-wrap gap-2">
             {selectedTopic !== 'all' && (
               <span className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm border border-purple-300/30">
                 📚 {topics.find(t => t.id === selectedTopic)?.name}
               </span>
             )}
             {filterDifficulty !== 'all' && (
               <span className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm border border-purple-300/30">
                 🎯 {filterDifficulty.charAt(0).toUpperCase() + filterDifficulty.slice(1)}
               </span>
             )}
             {searchQuery && (
               <span className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm border border-purple-300/30">
                 🔍 "{searchQuery}"
               </span>
               )}
           </div>
         </div>

                 {/* Study Groups List */}
         <div className="space-y-6">
           <div className="flex items-center justify-between">
             <h2 className="text-2xl font-bold text-white flex items-center">
               <span className="mr-3">📚</span>
               {selectedTopic === 'all' ? 'All Study Groups' : topics.find(t => t.id === selectedTopic)?.name + ' Groups'}
             </h2>
             <div className="flex items-center space-x-4">
               <div className="px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-300/30">
                 <span className="text-purple-200 font-medium">
                   {sortedGroups.length} group{sortedGroups.length !== 1 ? 's' : ''}
                 </span>
               </div>
               <div className="px-4 py-2 bg-green-500/20 rounded-lg border border-green-300/30">
                 <span className="text-green-200 font-medium">
                   {sortedGroups.filter(g => g.member_count < g.max_members).length} open
                 </span>
               </div>
             </div>
           </div>

                     {sortedGroups.length === 0 ? (
             <div className="gamified-card p-12 text-center">
               <div className="mb-6">
                 <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                   <UserGroupIcon className="h-12 w-12 text-purple-200" />
                 </div>
                 <div className="text-6xl mb-4">😔</div>
               </div>
               <h3 className="text-xl font-semibold text-white mb-2">No study groups found</h3>
               <p className="text-purple-200 mb-6">
                 Try adjusting your filters or be the first to create a study group!
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button
                   onClick={() => {
                     setSelectedTopic('all');
                     setFilterDifficulty('all');
                     setSearchQuery('');
                   }}
                   className="btn-secondary inline-flex items-center"
                 >
                   <span className="mr-2">🔄</span>
                   Clear Filters
                 </button>
                 <button
                   onClick={() => setShowCreateModal(true)}
                   className="btn-primary inline-flex items-center glow-purple hover-lift"
                 >
                   <PlusIcon className="h-5 w-5 mr-2" />
                   Create First Group
                 </button>
               </div>
             </div>
           ) : (
                         sortedGroups.map((group) => (
               <div key={group.id} className="interactive-card hover-lift">
                 <div className="p-6">
                   <div className="flex items-start justify-between mb-4">
                     <div className="flex items-start space-x-4">
                       <div className={`w-16 h-16 ${getTopicColor(group.topic || 'default')} rounded-lg flex items-center justify-center flex-shrink-0 glow-purple`}>
                         {React.createElement(getTopicIcon(group.topic || 'default'), { className: "h-8 w-8 text-white" })}
                       </div>
                       <div className="flex-1">
                         <div className="flex items-center space-x-3 mb-2">
                           <h3 className="text-xl font-semibold text-white">
                             {group.name}
                           </h3>
                           <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(group.difficulty || 'beginner')}`}>
                             {group.difficulty || 'beginner'}
                           </span>
                           {group.user_role && (
                             <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-200 border border-purple-300/30">
                               {group.user_role === 'creator' ? '👑 Creator' : '✅ Member'}
                             </span>
                           )}
                         </div>
                         <p className="text-purple-200 mb-4">
                           {group.description}
                         </p>
                         <div className="flex flex-wrap gap-2 mb-4">
                           {group.tags && group.tags.map((tag) => (
                             <span
                               key={tag}
                               className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-200 rounded-full border border-purple-300/30 hover:bg-purple-500/30 transition-colors"
                             >
                               #{tag}
                             </span>
                           ))}
                         </div>
                       </div>
                     </div>
                   </div>

                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                     <div className="flex items-center space-x-2 p-3 bg-purple-500/10 rounded-lg border border-purple-300/20">
                       <UsersIcon className="h-5 w-5 text-purple-300" />
                       <span className="text-sm text-purple-200">
                         {group.member_count}/{group.max_members} members
                       </span>
                       <div className="ml-auto">
                         <div className="w-16 bg-purple-300/20 rounded-full h-2">
                           <div 
                             className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                             style={{ width: `${(group.member_count / group.max_members) * 100}%` }}
                           ></div>
                         </div>
                       </div>
                     </div>
                     <div className="flex items-center space-x-2 p-3 bg-purple-500/10 rounded-lg border border-purple-300/20">
                       <ClockIcon className="h-5 w-5 text-purple-300" />
                       <span className="text-sm text-purple-200">
                         {group.schedule}
                       </span>
                     </div>
                     <div className="flex items-center space-x-2 p-3 bg-purple-500/10 rounded-lg border border-purple-300/20">
                       <BookOpenIcon className="h-5 w-5 text-purple-300" />
                       <span className="text-sm text-purple-200">
                         {group.materials ? group.materials.length : 0} materials
                       </span>
                     </div>
                   </div>

                                     <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-4 text-sm text-purple-300">
                       <span className="flex items-center">
                         <span className="mr-2">👤</span>
                         Created by @{group.creator_username}
                       </span>
                       <span className="flex items-center">
                         <span className="mr-2">⏰</span>
                         Last active: {new Date(group.last_activity || group.created_at).toLocaleDateString()}
                       </span>
                     </div>
                     
                     {!group.user_role && group.member_count < group.max_members && (
                       <button
                         onClick={() => handleJoinGroup(group.id)}
                         className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 glow-purple"
                       >
                         <UserGroupIcon className="h-4 w-4 mr-2" />
                         Join Group
                       </button>
                     )}
                     
                     {group.user_role && (
                       <span className="text-sm font-medium text-purple-300 flex items-center">
                         <span className="mr-2">
                           {group.user_role === 'creator' ? '👑' : '✅'}
                         </span>
                         {group.user_role === 'creator' ? 'You created this group' : 'You are a member'}
                       </span>
                     )}
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

             {/* Create Group Modal - Placeholder */}
       {showCreateModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="gamified-card max-w-md w-full mx-4 border-2 border-purple-300/30">
             <div className="text-center mb-6">
               <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <PlusIcon className="h-8 w-8 text-purple-300" />
               </div>
               <h3 className="text-xl font-semibold text-white mb-2">
                 🚀 Create Study Group
               </h3>
               <p className="text-purple-200">
                 This feature is coming soon! You'll be able to create your own study groups and earn XP.
               </p>
             </div>
             
             <div className="space-y-4 mb-6">
               <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-300/20">
                 <h4 className="font-semibold text-white mb-2">🎯 What you'll be able to do:</h4>
                 <ul className="text-sm text-purple-200 space-y-1">
                   <li>• Create study groups for any programming topic</li>
                   <li>• Set difficulty levels and member limits</li>
                   <li>• Schedule study sessions and share materials</li>
                   <li>• Earn XP for creating and managing groups</li>
                 </ul>
               </div>
             </div>
             
             <div className="flex justify-end">
               <button
                 onClick={() => setShowCreateModal(false)}
                 className="btn-secondary inline-flex items-center hover-lift"
               >
                 <span className="mr-2">✨</span>
                 Coming Soon!
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default StudyGroups;
