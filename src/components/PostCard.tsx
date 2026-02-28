import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Feed } from '../utils/types';
import { calculateReadingTime, stripHtml } from '../utils/seo';

interface PostCardProps {
    post: Feed;
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

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const readingTime = useMemo(() => {
        if (post.content) {
            return calculateReadingTime(stripHtml(post.content));
        }
        if (post.description) {
            return Math.max(1, Math.ceil(stripHtml(post.description).split(/\s+/).length / 200));
        }
        return 3;
    }, [post.content, post.description]);

    return (
        <div>
            <Link className="block" to={`/feed/${post.slug}`}>
                <div className="block relative pt-[75%] bg-black/5 dark:bg-white/5 overflow-hidden">
                    <img
                        alt={post.title}
                        src={`${import.meta.env.VITE_API_URL}/uploads/feeds/${post.featuredImage}`}
                        decoding="async"
                        loading="lazy"
                        className='post-image hover:scale-105 transition-transform duration-300'
                    />
                </div>
            </Link>
            <div className="flex flex-wrap gap-3 items-center mt-6">
                <div className="flex flex-wrap gap-3">
                    <Link 
                        className="text-xs font-medium uppercase rounded-full py-1.5 px-2.5 border border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black transition-colors" 
                        to={`/feed/category/${post.category?.name?.toLowerCase()}`}
                    >
                        {post.category?.name}
                    </Link>
                </div>
                <div className="text-sm data-color flex items-center">
                    <span className="whitespace-nowrap">{formatDate(post.created_at)}</span>
                    <span className="px-2.5">⋅</span>
                    <span className="whitespace-nowrap">{readingTime} min read</span>
                </div>
            </div>
            <h2 className="text-2xl font-bold mt-4 leading-snug">
                <Link to={`/feed/${post.slug}`} className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                    {post.title}
                </Link>
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 line-clamp-3">{post.description}</p>
            <div className="flex gap-2 items-center mt-6">
                <div className="flex">
                    <Link className="flex -ml-3 first:ml-0 first:z-10 hover:z-20" to={`/author/${post.author?.id}`}>
                        <div className="rounded-full overflow-hidden border-2 h-[30px] w-[30px] border-gray-200 dark:border-gray-700 inline-block leading-[0]">
                            <div className="pt-[100%] relative">
                                {post.author?.avatarUrl ? (
                                    <img
                                        alt={post.author?.name}
                                        src={post.author.avatarUrl}
                                        decoding="async"
                                        loading="lazy"
                                        className='post-image'
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                        {post.author?.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                </div>
                <div>
                    <Link className="text-sm font-medium heading-color block hover:text-blue-600 dark:hover:text-blue-400 transition-colors" to={`/author/${post.author?.id}`}>
                        {post.author?.name}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
