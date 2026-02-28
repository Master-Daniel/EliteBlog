import React from 'react';

export interface Achievement {
    type: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    requiredPosts: number;
    earnedAt: string;
}

export interface AchievementProgress {
    nextAchievement: {
        type: string;
        name: string;
        description: string;
        icon: string;
        color: string;
        requiredPosts: number;
    } | null;
    currentPosts: number;
    postsToNext: number;
    percentToNext: number;
}

interface AchievementBadgeProps {
    achievement: Achievement;
    size?: 'sm' | 'md' | 'lg';
    showTooltip?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
    achievement,
    size = 'md',
    showTooltip = true,
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-base',
        md: 'w-12 h-12 text-xl',
        lg: 'w-16 h-16 text-2xl',
    };

    return (
        <div className="group relative inline-block">
            <div
                className={`${sizeClasses[size]} rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer`}
                style={{ backgroundColor: achievement.color }}
            >
                <span role="img" aria-label={achievement.name}>
                    {achievement.icon}
                </span>
            </div>
            {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    <div className="font-bold">{achievement.name}</div>
                    <div className="text-gray-300 dark:text-gray-600">{achievement.description}</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface AchievementListProps {
    achievements: Achievement[];
    maxDisplay?: number;
}

export const AchievementList: React.FC<AchievementListProps> = ({
    achievements,
    maxDisplay = 5,
}) => {
    const sortedAchievements = [...achievements].sort(
        (a, b) => b.requiredPosts - a.requiredPosts
    );
    const displayedAchievements = sortedAchievements.slice(0, maxDisplay);
    const remainingCount = achievements.length - maxDisplay;

    if (achievements.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
                {displayedAchievements.map((achievement) => (
                    <AchievementBadge
                        key={achievement.type}
                        achievement={achievement}
                        size="sm"
                    />
                ))}
            </div>
            {remainingCount > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    +{remainingCount} more
                </span>
            )}
        </div>
    );
};

interface AchievementShowcaseProps {
    achievements: Achievement[];
    progress?: AchievementProgress;
}

export const AchievementShowcase: React.FC<AchievementShowcaseProps> = ({
    achievements,
    progress,
}) => {
    const sortedAchievements = [...achievements].sort(
        (a, b) => a.requiredPosts - b.requiredPosts
    );

    if (achievements.length === 0 && !progress?.nextAchievement) {
        return null;
    }

    return (
        <div className="mt-6">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-4">
                Achievements
            </h4>

            {achievements.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                    {sortedAchievements.map((achievement) => (
                        <AchievementBadge
                            key={achievement.type}
                            achievement={achievement}
                            size="md"
                        />
                    ))}
                </div>
            )}

            {progress?.nextAchievement && (
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Next: {progress.nextAchievement.icon} {progress.nextAchievement.name}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {progress.currentPosts}/{progress.nextAchievement.requiredPosts} posts
                        </span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                                width: `${progress.percentToNext}%`,
                                backgroundColor: progress.nextAchievement.color,
                            }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {progress.postsToNext} more {progress.postsToNext === 1 ? 'post' : 'posts'} to unlock
                    </p>
                </div>
            )}
        </div>
    );
};

export default AchievementBadge;
