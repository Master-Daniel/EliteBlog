import React from 'react';
import { Link } from 'react-router-dom';

interface Post {
    title: string;
    slug: string;
    category: string;
    date: string;
    readTime: string;
    description: string;
    author: { name: string; avatar: string; profileUrl: string }[];
    image: string;
}

interface PostCardProps {
    post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    return (
        <div>
            <Link className="block" to={`/blog/${post.slug}.html`}>
                <div className="block relative pt-[75%] bg-black/5 dark:bg-white/5">
                    <img
                        alt={post.title}
                        src={post.image}
                        decoding="async"
                        loading="lazy"
                        style={{
                            position: 'absolute',
                            height: '100%',
                            width: '100%',
                            left: '0',
                            top: '0',
                            objectFit: 'cover',
                        }}
                    />
                </div>
            </Link>
            <div className="flex flex-wrap gap-3 items-center mt-6">
                <div className="flex flex-wrap gap-3">
                    <Link
                        className="text-xs font-medium uppercase rounded-full py-1.5 px-2.5 border border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                        to={`/category/${post.category}.html`}
                    >
                        {post.category}
                    </Link>
                </div>
                <div className="text-sm data-color flex items-center">
                    <span className="whitespace-nowrap">{post.date}</span>
                    <span className="px-2.5">⋅</span>
                    <span className="whitespace-nowrap">{post.readTime} min read</span>
                </div>
            </div>
            <h2 className="text-2xl font-bold mt-4 leading-snug">
                <Link to={`/blog/${post.slug}.html`}>{post.title}</Link>
            </h2>
            <p className="mt-4">{post.description}</p>
            <div className="flex gap-2 items-center mt-6">
                <div className="flex">
                    {post.author.map((author, index) => (
                        <Link key={index} className="flex -ml-3 first:ml-0 first:z-10 hover:z-20" to={author.profileUrl}>
                            <div
                                className="rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 inline-block leading-[0] !border-2"
                                style={{ width: '30px', height: '30px' }}
                            >
                                <div className="pt-[100%] relative">
                                    <img
                                        alt={author.name}
                                        src={author.avatar}
                                        decoding="async"
                                        loading="lazy"
                                        style={{
                                            position: 'absolute',
                                            height: '100%',
                                            width: '100%',
                                            left: '0',
                                            top: '0',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                <div>
                    {post.author.map((author, index) => (
                        <Link key={index} className="text-sm font-medium heading-color block" to={author.profileUrl}>
                            {author.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PostCard;
