import React from 'react';
import { Link } from 'react-router-dom';
import { Feed } from '../utils/types';

interface PostCardProps {
    post: Feed;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    return (
        <div>
            <Link className="block" to={`/feed/${post.slug}`}>
                <div className="block relative pt-[75%] bg-black/5 dark:bg-white/5">
                    <img
                        alt={post.title}
                        src={`${import.meta.env.VITE_API_URL}/feeds/${post.featuredImage}`}
                        decoding="async"
                        loading="lazy"
                        className='post-image'
                    />
                </div>
            </Link>
            <div className="flex flex-wrap gap-3 items-center mt-6">
                <div className="flex flex-wrap gap-3">
                    <Link className="text-xs font-medium uppercase rounded-full py-1.5 px-2.5 border border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black" to={`/feeds/category/${post.category}`}>
                        {post.category.name}
                    </Link>
                </div>
                <div className="text-sm data-color flex items-center">
                    <span className="whitespace-nowrap">{post.date}</span>
                    <span className="px-2.5">⋅</span>
                    <span className="whitespace-nowrap">{post.readTime} min read</span>
                </div>
            </div>
            <h2 className="text-2xl font-bold mt-4 leading-snug">
                <Link to={`/feed/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="mt-4">{post.description}</p>
            <div className="flex gap-2 items-center mt-6">
                <div className="flex">
                    <Link className="flex -ml-3 first:ml-0 first:z-10 hover:z-20" to={post.author.id}>
                        <div className="rounded-full overflow-hidden border-4 h-[30px] w-[30px] border-gray-200 dark:border-gray-700 inline-block leading-[0]">
                            <div className="pt-[100%] relative">
                                <img
                                    alt={post.author.name}
                                    src={post.author.avatarUrl}
                                    decoding="async"
                                    loading="lazy"
                                    className='post-image'
                                />
                            </div>
                        </div>
                    </Link>
                </div>
                <div>
                    <Link className="text-sm font-medium heading-color block" to={`/author/${post.author.id}`}>
                        {post.author.name}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
