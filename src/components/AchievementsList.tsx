import React from 'react';
import AchievementBadge, { Achievement } from './AchievementBadge';

interface AchievementProgress {
    nextAchievement: {
        type: string;
        name: string;
        description: string;
        icon: string;
        requiredPosts: number;
        color: string;
    } | null;
    currentPosts: number;
    postsToNext: number;
    percentToNext: number;
}

interface AchievementsListProps {
    achievements: Achievement[];
    progress?: AchievementProgress;
    showProgress?: boolean;
    compact?: boolean;
}

const AchievementsList: React.FC<AchievementsListProps> = ({
    achievements,
    progress,
    showProgress = false,
    compact = false,
}) => {
    if (achievements.length === 0 && !showProgress) {
        return null;
    }

    return (
        <div className={compact ? '' : 'mt-4'}>
            {achievements.length > 0 && (
                <div className={`flex ${compact ? 'gap-1' : 'gap-2'} flex-wrap ${compact ? 'justify-center' : ''}`}>
                    {achievements.map((achievement) => (
                        <AchievementBadge
                            key={achievement.type}
                            achievement={achievement}
                            size={compact ? 'sm' : 'md'}
                        />
                    ))}
                </div>
            )}

            {showProgress && progress?.nextAchievement && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Next Achievement
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{progress.nextAchievement.icon}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {progress.nextAchievement.name}
                            </span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="h-2.5 rounded-full transition-all duration-500"
                            style={{
                                width: `${progress.percentToNext}%`,
                                backgroundColor: progress.nextAchievement.color,
                            }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{progress.currentPosts} posts</span>
                        <span>{progress.postsToNext} more to unlock</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AchievementsList;
