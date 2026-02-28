import React from 'react';
import { Link } from 'react-router-dom';

interface Author {
    id: string;
    name: string;
    avatarUrl: string;
}

interface Post {
    id: string;
    category: { name: string };
    date: string;
    readTime: string;
    title: string;
    excerpt: string;
    featuredImage: string;
    user?: Author;
    slug: string;
    isMain: boolean;
}

interface FeaturedSectionProps {
    feeds: Post[];
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ feeds }) => {
    return (
        <div className="flex flex-wrap xl:flex-nowrap gap-10">
            {/** Main Featured Post **/}
            {feeds && feeds.filter(feed => feed.isMain).map(feed => (
                <div key={feed.id} className="basis-full xl:basis-[65%] shrink-0">
                    <Link className="block" to={feed.slug}>
                        <div className="block relative pt-[75%] bg-black/5 dark:bg-white/5">
                            <img alt="Post thumbnail" src={`${import.meta.env.VITE_API_URL}/uploads/feeds/${feed.featuredImage}`} className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                    </Link>
                    <div className="flex flex-wrap gap-3 items-center mt-8">
                        <Link className="text-xs font-medium uppercase rounded-full py-1.5 px-2.5 border border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black tracking-wide whitespace-nowrap" to={`/category/${feed.category.name}`}>
                            {feed.category.name}
                        </Link>
                        <div className="text-sm data-color flex items-center">
                            <span className="whitespace-nowrap">{feed.date}</span>
                            <span className="px-2.5">⋅</span>
                            <span className="whitespace-nowrap">{feed.readTime}</span>
                        </div>
                    </div>
                    <h2 className="font-bold leading-snug mt-4 text-2xl sm:text-4xl">
                        <Link to={`/feed/${feed.slug}`}>{feed.title}</Link>
                    </h2>
                    <p className="mt-4 sm:text-lg">{feed.excerpt}</p>
                    {feed.user && (
                        <div className="flex items-center gap-3 mt-4">
                            <img alt="Author avatar" src={feed.user.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                            <Link to={`/author/${feed.user.id}`} className="font-medium">
                                {feed.user.name}
                            </Link>
                        </div>
                    )}
                </div>
            ))}

            {/** Sidebar Posts **/}
            <div className="basis-full xl:basis-[35%] shrink-0 space-y-8">
                {feeds && feeds.filter(feed => !feed.isMain).map(feed => (
                    <div key={feed.id} className="flex gap-5">
                        <Link className="block shrink-0 basis-[30%]" to={feed.slug}>
                            <div className="block relative pt-[75%] bg-black/5 dark:bg-white/5">
                                <img alt="Post thumbnail" src={`${import.meta.env.VITE_API_URL}/uploads/feeds/${feed.featuredImage}`} className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                        </Link>
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-3 items-center">
                                <Link className="text-xs font-medium uppercase rounded-full py-1.5 px-2.5 border border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black tracking-wide whitespace-nowrap" to={`/category/${feed.category.name}`}>
                                    {feed.category.name}
                                </Link>
                                <div className="text-sm data-color flex items-center">
                                    <span className="whitespace-nowrap">{feed.date}</span>
                                    <span className="px-2.5">⋅</span>
                                    <span className="whitespace-nowrap">{feed.readTime}</span>
                                </div>
                            </div>
                            <h3 className="font-bold leading-snug text-xl">
                                <Link to={`/feed/${feed.slug}`}>{feed.title}</Link>
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturedSection;
