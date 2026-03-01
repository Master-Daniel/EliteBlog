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
        requiredPosts: number;
        color: string;
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

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
    achievement, 
    size = 'md',
    showTooltip = true 
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-lg',
        lg: 'w-14 h-14 text-2xl',
    };

    return (
        <div className="group relative inline-block">
            <div
                className={`${sizeClasses[size]} rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110`}
                style={{ 
                    backgroundColor: `${achievement.color}20`,
                    border: `2px solid ${achievement.color}`,
                }}
            >
                <span role="img" aria-label={achievement.name}>
                    {achievement.icon}
                </span>
            </div>
            
            {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                    <div className="font-semibold">{achievement.name}</div>
                    <div className="text-gray-300 dark:text-gray-600">{achievement.description}</div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                </div>
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
    if (achievements.length === 0 && !progress?.nextAchievement) {
        return null;
    }

    return (
        <div className="mt-6">
            {achievements.length > 0 && (
                <>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                        Achievements
                    </h4>
                    <div className="flex gap-2 flex-wrap justify-center">
                        {achievements.map((achievement) => (
                            <AchievementBadge
                                key={achievement.type}
                                achievement={achievement}
                                size="md"
                            />
                        ))}
                    </div>
                </>
            )}

            {progress?.nextAchievement && (
                <div className="mt-5 max-w-xs mx-auto">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Next: {progress.nextAchievement.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {progress.postsToNext} more {progress.postsToNext === 1 ? 'post' : 'posts'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                                width: `${progress.percentToNext}%`,
                                backgroundColor: progress.nextAchievement.color,
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AchievementBadge;
