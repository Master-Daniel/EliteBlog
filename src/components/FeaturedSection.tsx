import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Feed } from '../utils/types';
import { calculateReadingTime, stripHtml } from '../utils/seo';

interface FeaturedSectionProps {
    feeds: Feed[];
}

const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ feeds }) => {
    const { mainPost, sidePosts } = useMemo(() => {
        if (!feeds || feeds.length === 0) {
            return { mainPost: null, sidePosts: [] };
        }
        return {
            mainPost: feeds[0],
            sidePosts: feeds.slice(1, 3),
        };
    }, [feeds]);

    const getReadingTime = (post: Feed) => {
        if (post.content) {
            return calculateReadingTime(stripHtml(post.content));
        }
        if (post.description) {
            return Math.max(1, Math.ceil(stripHtml(post.description).split(/\s+/).length / 200));
        }
        return 3;
    };

    if (!mainPost) return null;

    return (
        <div className="flex flex-wrap xl:flex-nowrap gap-10">
            {/* Main Featured Post */}
            <div className="basis-full xl:basis-[65%] shrink-0">
                <Link className="block" to={`/feed/${mainPost.slug}`}>
                    <div className="block relative pt-[75%] bg-black/5 dark:bg-white/5 overflow-hidden group">
                        <img 
                            alt={mainPost.title}
                            src={`${import.meta.env.VITE_API_URL}/uploads/feeds/${mainPost.featuredImage}`} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                    </div>
                </Link>
                <div className="flex flex-wrap gap-3 items-center mt-8">
                    <Link 
                        className="text-xs font-medium uppercase rounded-full py-1.5 px-2.5 border border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black tracking-wide whitespace-nowrap transition-colors" 
                        to={`/feed/category/${mainPost.category?.name?.toLowerCase()}`}
                    >
                        {mainPost.category?.name}
                    </Link>
                    <div className="text-sm data-color flex items-center">
                        <span className="whitespace-nowrap">{formatDate(mainPost.created_at)}</span>
                        <span className="px-2.5">⋅</span>
                        <span className="whitespace-nowrap">{getReadingTime(mainPost)} min read</span>
                    </div>
                </div>
                <h2 className="font-bold leading-snug mt-4 text-2xl sm:text-4xl">
                    <Link to={`/feed/${mainPost.slug}`} className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                        {mainPost.title}
                    </Link>
                </h2>
                <p className="mt-4 sm:text-lg text-gray-600 dark:text-gray-400 line-clamp-3">
                    {mainPost.description}
                </p>
                {mainPost.author && (
                    <div className="flex gap-2 items-center mt-6">
                        <div className="flex">
                            <Link 
                                className="flex -ml-3 first:ml-0 first:z-10 hover:z-20" 
                                to={`/author/${mainPost.author.id}`}
                            >
                                <div 
                                    className="rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 inline-block leading-[0]"
                                    style={{ width: '30px', height: '30px' }}
                                >
                                    <div className="pt-[100%] relative">
                                        {mainPost.author.avatarUrl ? (
                                            <img
                                                alt={mainPost.author.name}
                                                src={mainPost.author.avatarUrl.startsWith('/uploads') 
                                                    ? `${import.meta.env.VITE_API_URL}${mainPost.author.avatarUrl}`
                                                    : mainPost.author.avatarUrl}
                                                className="absolute h-full w-full left-0 top-0 right-0 bottom-0 object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                                {mainPost.author.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div>
                            <Link 
                                className="text-sm font-medium heading-color hover:text-blue-600 dark:hover:text-blue-400 transition-colors" 
                                to={`/author/${mainPost.author.id}`}
                            >
                                {mainPost.author.name}
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Side Posts */}
            <div className="flex flex-col md:flex-row xl:flex-col gap-10">
                {sidePosts.map((post) => (
                    <div key={post.id} className="flex-1">
                        <Link className="block" to={`/feed/${post.slug}`}>
                            <div className="block relative pt-[75%] bg-black/5 dark:bg-white/5 overflow-hidden group">
                                <img 
                                    alt={post.title}
                                    src={`${import.meta.env.VITE_API_URL}/uploads/feeds/${post.featuredImage}`} 
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                />
                            </div>
                        </Link>
                        <div className="flex flex-wrap gap-3 items-center mt-6">
                            <Link 
                                className="text-xs font-medium uppercase rounded-full py-1.5 px-2.5 border border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black tracking-wide whitespace-nowrap transition-colors" 
                                to={`/feed/category/${post.category?.name?.toLowerCase()}`}
                            >
                                {post.category?.name}
                            </Link>
                            <div className="text-sm data-color flex items-center">
                                <span className="whitespace-nowrap">{formatDate(post.created_at)}</span>
                                <span className="px-2.5">⋅</span>
                                <span className="whitespace-nowrap">{getReadingTime(post)} min read</span>
                            </div>
                        </div>
                        <h2 className="font-bold leading-snug mt-3 text-2xl">
                            <Link to={`/feed/${post.slug}`} className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                                {post.title}
                            </Link>
                        </h2>
                        <p className="mt-3 text-gray-600 dark:text-gray-400 line-clamp-2">
                            {post.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturedSection;
