import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useFeed from "../hooks/useFeed";
import Header from "../components/Header";
import { ArticleMeta } from "../components/Meta";
import NewsLetterSection from "../components/NewsLetterSection";
import Footer from "../components/Footer";
import { formatDate } from "../utils/custom-functions";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Feed } from "../utils/types";
import Comments from "../components/Comments";
import BookmarkButton from "../components/BookmarkButton";
import { calculateReadingTime, stripHtml } from "../utils/seo";
import { sanitizeHtml } from "../utils/sanitizeHtml";

const FeedBody: React.FC = () => {
    const params = useParams();
    const navigate = useNavigate();
    const slug = params.slug;
    const { feeds } = useSelector((state: RootState) => state.global);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Calculate scroll progress
    const handleScroll = useCallback(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
    }, []);

    // Scroll progress listener
    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Scroll to top when slug changes
    useEffect(() => {
        window.scrollTo(0, 0);
        setScrollProgress(0);
    }, [slug]);

    // Redirect if slug is missing
    useEffect(() => {
        if (!slug) {
            navigate("/404", { replace: true });
        }
    }, [slug, navigate]);

    const { data } = useFeed(slug!);

    const readingTime = useMemo(() => {
        if (data?.content) {
            return calculateReadingTime(stripHtml(data.content));
        }
        return 4;
    }, [data?.content]);

    return (
        <>
            {data && (
                <ArticleMeta
                    title={data.title || ""}
                    description={data.description || ""}
                    featuredImage={data.featuredImage}
                    author={data.author ?? undefined}
                    category={data.category ?? undefined}
                    tags={data.tags}
                    publishedTime={data.created_at instanceof Date ? data.created_at.toISOString() : data.created_at}
                    modifiedTime={data.updated_at instanceof Date ? data.updated_at.toISOString() : data.updated_at}
                    slug={data.slug}
                    content={data.content}
                />
            )}

            <Header />

            {/* Scroll Progress Indicator */}
            <div className="fixed top-[73px] left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-40">
                <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-150 ease-out"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            <div className="max-w-[1480px] mx-auto px-5 sm:px-8 mt-20 z-10 text-black dark:text-white">
                <div className="max-w-screen-md mx-auto">
                    <div className="flex flex-wrap gap-3 items-center text-[15px]">
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to={`/feed/category/${data?.category.name.toLowerCase()}`}
                                className="text-xs font-medium uppercase rounded-full py-1.5 px-2.5 border border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black tracking-wide whitespace-nowrap"
                            >
                                {data?.category.name}
                            </Link>
                        </div>
                        <div className="text-sm data-color flex items-center">
                            <span className="whitespace-nowrap">{formatDate(data?.created_at instanceof Date ? data.created_at.toISOString() : data?.created_at || data?.schema?.datePublished)}</span>
                            <span className="px-2.5">⋅</span>
                            <span className="whitespace-nowrap">{readingTime} min read</span>
                        </div>
                    </div>
                    <h2 className="font-bold leading-snug text-3xl sm:text-[2.5rem] mt-6">
                        {data?.title}
                    </h2>
                    <div className="flex gap-2 items-center mt-4">
                        <div className="flex">
                            <Link
                                className="flex -ml-3 first:ml-0 first:z-10 hover:z-20"
                                to={`/author/${data?.author?.id}`}
                            >
                                <div
                                    className="rounded-full overflow-hidden border-gray-200 dark:border-gray-700 inline-block leading-[0] !border-2"
                                    style={{ width: "30px", height: "30px" }}
                                >
                                    <div className="pt-[100%] relative">
                                        <img
                                            alt={data?.author?.name}
                                            sizes="30px"
                                            srcSet={data?.author?.avatarUrl}
                                            src={data?.author?.avatarUrl}
                                            decoding="async"
                                            data-nimg="fill"
                                            loading="lazy"
                                            className="feed-featured-image"
                                        />
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div>
                            <Link
                                className="text-sm font-medium heading-color"
                                to={`/author/${data?.author?.id}`}
                            >
                                {data?.author?.name}
                            </Link>
                        </div>
                    </div>
                    <div className="block relative pt-[75%] bg-black/5 dark:bg-white/5 mt-12">
                        <img
                            alt="Post thumbnail"
                            sizes="(max-width: 767px) 95vw, 800px"
                            srcSet={`${import.meta.env.VITE_API_URL}/uploads/feeds/${data?.featuredImage}`}
                            src={`${import.meta.env.VITE_API_URL}/uploads/feeds/${data?.featuredImage}`}
                            decoding="async"
                            data-nimg="fill"
                            loading="lazy"
                            className="feed-featured-image"
                        />
                    </div>
                    <div
                        className="prose sm:prose-lg max-w-none dark:prose-invert prose-figcaption:text-sm prose-figcaption:text-center prose-figcaption:mt-2 mt-16"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(data?.content ?? "") }}
                    />
                    <div className="flex flex-wrap gap-3 mt-16">
                        {data && data?.tags.map((tag: string, index: number) => (
                            <Link key={index} className="text-xs font-semibold data-color rounded-full capitalize bg-gray-100 py-2 px-3 dark:bg-zinc-900 whitespace-nowrap" to={`/feed/tags/${tag.toLowerCase()}`}>{tag}</Link>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mt-16 flex-wrap gap-4">
                        <div className="flex items-center">
                            <span className="font-semibold mr-4 text-sm uppercase data-color">Share:</span>
                            <div className="flex gap-4">
                            <Link className="text-md border-2 p-2.5 rounded-full text-black border-black hover:bg-black hover:text-white dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black" to={`https://x.com/intent/tweet?url=${data?.schema?.mainEntityOfPage["@id"]}`} target="_blank" rel="noreferrer" aria-label="Twitter share button">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
                                </svg>
                            </Link>
                            <Link className="text-md border-2 p-2.5 rounded-full text-black border-black hover:bg-black hover:text-white dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black" to={`https://www.facebook.com/sharer.php?u=${data?.schema?.mainEntityOfPage["@id"]}`} target="_blank" rel="noreferrer" aria-label="Facebook share button">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"></path>
                                </svg>
                            </Link>
                            <Link className="text-md border-2 p-2.5 rounded-full text-black border-black hover:bg-black hover:text-white dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black" to={`https://www.linkedin.com/sharing/share-offsite/?url=${data?.schema?.mainEntityOfPage["@id"]}`} target="_blank" rel="noreferrer" aria-label="LinkedIn share button">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"></path>
                                </svg>
                            </Link>
                            </div>
                        </div>
                        {data?.id && <BookmarkButton feedId={data.id} showCount />}
                    </div>

                    {data?.id && (
                        <Comments
                            feedId={data.id}
                            feedTitle={data.title || ""}
                        />
                    )}

                </div>

                {/* Related Posts Section */}
                {feeds?.feeds && feeds.feeds.length > 1 && (
                    <div className="mt-20">
                        <h2 className="mb-4 font-medium text-base uppercase tracking-wider">You might also like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {feeds.feeds
                                .filter((feed: Feed) => feed.slug !== slug)
                                .sort((a: Feed, b: Feed) => {
                                    // Prioritize same category posts
                                    const aMatch = a.category?.name === data?.category?.name ? -1 : 0;
                                    const bMatch = b.category?.name === data?.category?.name ? -1 : 0;
                                    return aMatch - bMatch;
                                })
                                .slice(0, 4)
                                .map((feed: Feed) => (
                                    <article key={feed.id || feed.slug} className="group">
                                        <Link className="block" to={`/feed/${feed.slug}`}>
                                            <div className="block relative pt-[75%] bg-black/5 dark:bg-white/5 overflow-hidden">
                                                <img
                                                    alt={feed.title}
                                                    className="feed-featured-image group-hover:scale-105 transition-transform duration-300"
                                                    sizes="(max-width: 639px) 95vw, (max-width: 1023px) 40vw, (max-width: 1480px) 20vw, 330px"
                                                    src={`${import.meta.env.VITE_API_URL}/uploads/feeds/${feed.featuredImage}`}
                                                    decoding="async"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </Link>
                                        <h3 className="text-xl mt-4 font-bold leading-snug">
                                            <Link 
                                                to={`/feed/${feed.slug}`}
                                                className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                                            >
                                                {feed.title}
                                            </Link>
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2 text-sm data-color">
                                            {feed.author && (
                                                <>
                                                    <Link 
                                                        to={`/author/${feed.author.id}`}
                                                        className="hover:underline"
                                                    >
                                                        {feed.author.name}
                                                    </Link>
                                                    <span>⋅</span>
                                                </>
                                            )}
                                            {feed.category && (
                                                <Link 
                                                    to={`/feed/category/${feed.category.name.toLowerCase()}`}
                                                    className="hover:underline capitalize"
                                                >
                                                    {feed.category.name}
                                                </Link>
                                            )}
                                        </div>
                                    </article>
                                ))}
                        </div>
                    </div>
                )}
            </div>
            <NewsLetterSection />
            <Footer />
        </>
    );
};

export default FeedBody;
