import React from 'react';
import Header from '../components/Header';
import NewsLetterSection from '../components/NewsLetterSection';
import Footer from '../components/Footer';
import { useParams, Link } from 'react-router-dom';
import { useAuthor } from '../hooks/useAuthors';
import Meta from '../components/Meta';
import { SEO_CONFIG, generatePersonSchema, calculateReadingTime, stripHtml } from '../utils/seo';
import { AchievementShowcase } from '../components/AchievementBadge';

const PostCardSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <div className="block relative pt-[75%] bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="flex flex-wrap gap-3 items-center mt-6">
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded mt-4 w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-4 w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-2 w-2/3" />
    </div>
);

const AuthorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: author, isLoading, isError } = useAuthor(id || '');

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <div className="max-w-[1480px] mx-auto px-5 sm:px-8 mt-20 text-black dark:text-white">
                    <div className="max-w-[450px] text-center mx-auto mb-20 animate-pulse">
                        <div 
                            className="rounded-full bg-gray-200 dark:bg-gray-700 mx-auto"
                            style={{ width: '160px', height: '160px' }}
                        />
                        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded mx-auto mt-4 w-48" />
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mx-auto mt-3 w-20" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto mt-4 w-full" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto mt-2 w-3/4" />
                    </div>
                    <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, index) => (
                            <PostCardSkeleton key={index} />
                        ))}
                    </div>
                </div>
                <NewsLetterSection />
                <Footer />
            </>
        );
    }

    if (isError || !author) {
        return (
            <>
                <Header />
                <div className="max-w-[1480px] mx-auto px-5 sm:px-8 mt-20 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Author Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        This author doesn't exist or has no published posts yet.
                    </p>
                    <Link 
                        to="/authors" 
                        className="inline-block px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-80 transition-opacity"
                    >
                        View All Authors
                    </Link>
                </div>
                <NewsLetterSection />
                <Footer />
            </>
        );
    }

    const sameAs = [
        author.twitter && (author.twitter.startsWith('http') ? author.twitter : `https://twitter.com/${author.twitter}`),
        author.github && (author.github.startsWith('http') ? author.github : `https://github.com/${author.github}`),
        author.website && (author.website.startsWith('http') ? author.website : `https://${author.website}`),
    ].filter(Boolean) as string[];

    return (
        <>
            <Meta
                meta={{
                    title: author.name,
                    description: author.bio || `Read articles by ${author.name} on EliteBlog. Explore their insights on technology, programming, and more.`,
                    featuredImage: author.avatarUrl,
                    type: "profile",
                    author: {
                        name: author.name,
                        username: author.username,
                        avatarUrl: author.avatarUrl,
                    },
                    noIndex: false,
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        generatePersonSchema({
                            name: author.name,
                            url: `${SEO_CONFIG.siteUrl}/author/${author.id}`,
                            image: author.avatarUrl,
                            bio: author.bio,
                            sameAs,
                        })
                    ),
                }}
            />
            <Header />
            <div className="max-w-[1480px] mx-auto px-5 sm:px-8 mt-20 text-black dark:text-white">
                {/* Author Header */}
                <div className="max-w-[450px] text-center mx-auto mb-20">
                    <div 
                        className="rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 inline-block leading-[0]"
                        style={{ width: '160px', height: '160px' }}
                    >
                        <div className="pt-[100%] relative">
                            <img
                                alt={`${author.name}'s avatar`}
                                sizes="160px"
                                src={author.avatarUrl || '/images/default-avatar.jpg'}
                                decoding="async"
                                loading="lazy"
                                className="absolute h-full w-full left-0 top-0 right-0 bottom-0 object-cover"
                            />
                        </div>
                    </div>
                    <h3 className="text-3xl my-3 font-bold">{author.name}</h3>
                    <div className="mb-3 text-gray-600 dark:text-gray-400">
                        {author.postCount} {author.postCount === 1 ? 'Post' : 'Posts'}
                    </div>
                    {author.bio && (
                        <p className="text-gray-700 dark:text-gray-300">{author.bio}</p>
                    )}
                    
                    {/* Social Links */}
                    {(author.twitter || author.github || author.website) && (
                        <div className="flex justify-center gap-4 mt-4">
                            {author.twitter && (
                                <a 
                                    href={author.twitter.startsWith('http') ? author.twitter : `https://twitter.com/${author.twitter}`}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                    aria-label="Twitter"
                                >
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1.25em" width="1.25em">
                                        <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
                                    </svg>
                                </a>
                            )}
                            {author.github && (
                                <a 
                                    href={author.github.startsWith('http') ? author.github : `https://github.com/${author.github}`}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    aria-label="GitHub"
                                >
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 496 512" height="1.25em" width="1.25em">
                                        <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z"></path>
                                    </svg>
                                </a>
                            )}
                            {author.website && (
                                <a 
                                    href={author.website.startsWith('http') ? author.website : `https://${author.website}`}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                    aria-label="Website"
                                >
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1.25em" width="1.25em">
                                        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm7.931 9h-2.764a14.67 14.67 0 0 0-1.792-6.243A8.013 8.013 0 0 1 19.931 11zM12.53 4.027c1.035 1.364 2.427 3.78 2.627 6.973H9.03c.139-2.596.994-5.028 2.451-6.974.172-.01.344-.026.519-.026.179 0 .354.016.53.027zm-3.842.511C7.513 6.449 6.486 8.685 6.278 11H3.515a8.025 8.025 0 0 1 5.173-6.462zM3.515 13h2.764c.2 2.316 1.226 4.551 2.41 6.462A8.013 8.013 0 0 1 3.515 13zm9.015 6.973c-1.035-1.364-2.427-3.78-2.627-6.973H15.1c-.139 2.596-.994 5.029-2.451 6.974-.172.01-.344.026-.519.026-.179 0-.354-.016-.53-.027zm4.158-.511c1.175-1.911 2.201-4.148 2.41-6.462h2.764a8.013 8.013 0 0 1-5.174 6.462z"></path>
                                    </svg>
                                </a>
                            )}
                        </div>
                    )}

                    {/* Achievements - Only show for non-admin authors */}
                    {!author.isAdmin && (
                        <AchievementShowcase
                            achievements={author.achievements || []}
                            progress={author.achievementProgress}
                        />
                    )}
                </div>

                {/* Posts Grid */}
                <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {author.posts.map((post) => {
                        const readingTime = post.content 
                            ? calculateReadingTime(stripHtml(post.content))
                            : post.description 
                                ? Math.max(1, Math.ceil(stripHtml(post.description).split(/\s+/).length / 200))
                                : 3;
                        
                        return (
                            <div key={post.id}>
                                <Link to={`/feed/${post.slug}`} className="block">
                                    <div className="block relative pt-[75%] bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden group">
                                        <img
                                            alt={post.title}
                                            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1480px) 33.3vw, 450px"
                                            src={`${import.meta.env.VITE_API_URL}/uploads/feeds/${post.featuredImage}`}
                                            decoding="async"
                                            loading="lazy"
                                            className="absolute h-full w-full left-0 top-0 right-0 bottom-0 object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                </Link>
                                <div className="flex flex-wrap gap-3 items-center mt-6">
                                    <div className="flex flex-wrap gap-3">
                                        <Link 
                                            to={`/feed/category/${post.category?.name?.toLowerCase()}`}
                                            className="text-xs font-medium uppercase rounded-full py-1.5 px-2.5 border border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black tracking-wide whitespace-nowrap transition-colors"
                                        >
                                            {post.category?.name}
                                        </Link>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                        <span className="whitespace-nowrap">{formatDate(post.createdAt)}</span>
                                        <span className="px-2.5">⋅</span>
                                        <span className="whitespace-nowrap">{readingTime} min read</span>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold mt-4 leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <Link to={`/feed/${post.slug}`}>{post.title}</Link>
                                </h2>
                                <p className="mt-4 text-gray-600 dark:text-gray-400 line-clamp-3">
                                    {post.description}
                                </p>
                                <div className="flex gap-2 items-center mt-6">
                                    <div className="flex">
                                        <Link 
                                            to={`/author/${author.id}`}
                                            className="flex -ml-3 first:ml-0 first:z-10 hover:z-20"
                                        >
                                            <div 
                                                className="rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 inline-block leading-[0]"
                                                style={{ width: '30px', height: '30px' }}
                                            >
                                                <div className="pt-[100%] relative">
                                                    {author.avatarUrl ? (
                                                        <img
                                                            alt={author.name}
                                                            sizes="30px"
                                                            src={author.avatarUrl}
                                                            decoding="async"
                                                            loading="lazy"
                                                            className="absolute h-full w-full left-0 top-0 right-0 bottom-0 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                                            {author.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                    <div>
                                        <Link 
                                            to={`/author/${author.id}`}
                                            className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            {author.name}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {author.posts.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            No published posts yet.
                        </p>
                    </div>
                )}
            </div>
            <NewsLetterSection />
            <Footer />
        </>
    );
};

export default AuthorPage;
